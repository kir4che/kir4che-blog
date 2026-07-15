import { LockKeyhole } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { showToast } from '@/utils/toast';

interface PostPasswordGateProps {
  slug: string;
  lang: string;
  backHref: string;
  texts: {
    title: string;
    enterPassword: string;
    incorrectPassword: string;
    tooManyAttempts: string;
    verifying: string;
    submit: string;
    error: string;
    backToPosts: string;
  };
}

const LIMITS = { maxAttempts: 3, lockMs: 60_000 };

const PostPasswordGate = ({ slug, lang, backHref, texts }: PostPasswordGateProps) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockRemain, setLockRemain] = useState(0); // > 0 就代表鎖定中
  const [isUnlocked, setIsUnlocked] = useState(false);

  const lockKey = `lock:${slug}`;
  const attemptsKey = `attempts:${slug}`;

  const unlock = useCallback(() => {
    setIsUnlocked(true);
    const protectedContent = document.querySelector<HTMLElement>('[data-protected-content]');
    if (protectedContent) protectedContent.classList.remove('hidden');
    window.dispatchEvent(new CustomEvent('post:unlocked'));
  }, []);

  useEffect(() => {
    // 檢查是否有解鎖 Cookie
    if (document.cookie.includes(`postUnlock-${slug}=`)) {
      unlock();
      return;
    }

    // 每秒檢查 localStorage，自動推算剩餘鎖定時間。
    const tick = () => {
      const expireTime = Number(localStorage.getItem(lockKey) || 0);
      const remain = Math.max(0, Math.ceil((expireTime - Date.now()) / 1000));

      setLockRemain(remain);

      // 時間到就清除 lock 紀錄
      if (remain === 0 && expireTime > 0) {
        localStorage.removeItem(lockKey);
        localStorage.removeItem(attemptsKey);
      }
    };

    tick(); // 初始化
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [slug, lockKey, attemptsKey, unlock]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = password.trim();
    if (lockRemain > 0 || isLoading || !pw) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password: pw, lang }),
        credentials: 'include',
      });

      if (res.ok) {
        unlock();
        return;
      }

      let lockDuration = LIMITS.lockMs;

      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        lockDuration = (data?.lockSeconds || LIMITS.lockMs / 1000) * 1000;
      } else {
        const attempts = Number(localStorage.getItem(attemptsKey) || 0) + 1;
        if (attempts < LIMITS.maxAttempts) {
          localStorage.setItem(attemptsKey, String(attempts));
          showToast(texts.incorrectPassword, 'error');
          return;
        }
      }

      // 觸發鎖定
      localStorage.setItem(lockKey, String(Date.now() + lockDuration));
      localStorage.removeItem(attemptsKey);
      setLockRemain(Math.ceil(lockDuration / 1000));
    } catch (err) {
      const networkError = err instanceof TypeError && err.message === 'Failed to fetch';
      showToast(networkError ? `${texts.error}\n（網路異常，請稍後再試）` : texts.error, 'error');
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  if (isUnlocked) return null;

  const isLocked = lockRemain > 0;

  return (
    <section className="flex-center min-h-[70vh]">
      {isLoading ? (
        <span
          className="loading loading-spinner loading-xl text-primary mx-auto"
          role="status"
          aria-label={texts.verifying}
        />
      ) : (
        <div className="flex-center flex-col gap-4">
          <LockKeyhole size={48} className="stroke-1.5 text-pink-700 dark:text-pink-500" />
          <h2>{texts.title}</h2>

          {!isLocked ? (
            <form onSubmit={handleSubmit} className="flex w-full shadow">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={texts.enterPassword}
                autoComplete="current-password"
                disabled={isLoading}
                className="input bg-surface-secondary flex-1 outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="btn border-pink-600 bg-pink-600 text-white hover:bg-pink-700 sm:w-auto dark:border-pink-800 dark:bg-pink-800 dark:hover:bg-pink-900"
              >
                {texts.submit}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-foreground-primary/80 text-sm">
                {texts.tooManyAttempts.replace(/\{seconds\}/g, String(lockRemain))}
              </p>
              <a
                href={backHref}
                className="btn mt-4 border-none bg-pink-600 text-white hover:bg-pink-700 dark:bg-pink-800 dark:hover:bg-pink-900"
              >
                {texts.backToPosts}
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PostPasswordGate;
