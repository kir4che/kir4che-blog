import { LockKeyhole } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { createTranslator } from '@/lib/i18n';
import type { Language } from '@/types';

interface PostPasswordGateProps {
  slug: string;
  lang: Language;
  backHref: string;
}

const LIMITS = { maxAttempts: 3, lockMs: 60_000 };

const PostPasswordGate = ({ slug, lang, backHref }: PostPasswordGateProps) => {
  const tPost = createTranslator(lang, 'PostPage');
  const tCommon = createTranslator(lang, 'common');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  const lockKey = `lock:${slug}`; // 解鎖 timestamp（localStorage）
  const attemptsKey = `attempts:${slug}`; // 已嘗試次數（localStorage）

  // 計算剩餘鎖定秒數
  const calcRemain = (key: string) => {
    if (typeof localStorage === 'undefined') return 0;
    const expire = Number(localStorage.getItem(key) || 0);
    // 0 表示沒有鎖定，>0 表示剩餘秒數
    return Math.max(0, Math.ceil((expire - Date.now()) / 1000));
  };

  const [lockRemain, setLockRemain] = useState(() => calcRemain(lockKey));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const unlock = useCallback(() => {
    setIsUnlocked(true);
    localStorage.removeItem(attemptsKey);
    window.dispatchEvent(new CustomEvent('post:unlocked'));
  }, [attemptsKey]);

  useEffect(() => {
    // 檢查是否有成功解鎖標記（server 設定）
    if (document.cookie.includes(`postUnlock-${slug}=`)) {
      unlock();
      return;
    }

    // 每秒檢查 localStorage，自動推算剩餘鎖定時間。
    const tick = () => {
      const remain = calcRemain(lockKey);
      setLockRemain(remain);

      // 時間到就清除 lock 紀錄
      if (remain === 0) {
        localStorage.removeItem(lockKey);
        localStorage.removeItem(attemptsKey);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [slug, unlock]);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
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
          setErrorMsg(tPost('incorrectPassword'));
          return;
        }
      }

      // 觸發鎖定
      localStorage.setItem(lockKey, String(Date.now() + lockDuration));
      localStorage.removeItem(attemptsKey);
      setLockRemain(Math.ceil(lockDuration / 1000));
    } catch (err) {
      const networkError = err instanceof TypeError && err.message === 'Failed to fetch';
      setErrorMsg(networkError ? tPost('passwordGate.networkError') : tPost('passwordGate.error'));
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
          aria-label={tCommon('button.verifying')}
        />
      ) : (
        <div className="flex-center flex-col gap-4">
          <LockKeyhole size={48} className="stroke-1.5 text-pink-700 dark:text-pink-500" />
          <h2>{tPost('passwordGate.title')}</h2>

          {!isLocked ? (
            <>
              <form onSubmit={handleSubmit} className="flex w-full shadow">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tPost('enterPassword')}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="input bg-surface-secondary flex-1 outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn border-pink-600 bg-pink-600 text-white hover:bg-pink-700 sm:w-auto dark:border-pink-800 dark:bg-pink-800 dark:hover:bg-pink-900"
                >
                  {tCommon('button.submit')}
                </button>
              </form>
              {errorMsg && (
                <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400" role="alert">
                  {errorMsg}
                </p>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-foreground-primary/80 text-sm">
                {tPost('tooManyAttempts').replace(/\{seconds\}/g, String(lockRemain))}
              </p>
              <a
                href={backHref}
                className="btn mt-4 border-none bg-pink-600 text-white hover:bg-pink-700 dark:bg-pink-800 dark:hover:bg-pink-900"
              >
                {tPost('backToPosts')}
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PostPasswordGate;
