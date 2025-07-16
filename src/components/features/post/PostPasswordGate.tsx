'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Eye, EyeOff } from 'lucide-react';

import { useAlert } from '@/contexts/AlertContext';

interface PostPasswordGateProps {
  slug: string;
  lang: string;
  onSuccess: () => void;
}

const getLockKey = (slug: string) => `postPasswordLockUntil:${slug}`;

const PostPasswordGate = ({ slug, lang, onSuccess }: PostPasswordGateProps) => {
  const t = useTranslations('PostPage');
  const t_common = useTranslations('common');
  const router = useRouter();
  const { showError } = useAlert();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  // 頁面載入時檢查 localStorage 是否有鎖定
  useEffect(() => {
    const stored = localStorage.getItem(getLockKey(slug));
    if (stored) {
      const until = parseInt(stored, 10);
      if (Date.now() < until) {
        setIsLocked(true);
        setLockUntil(until);
      } else localStorage.removeItem(getLockKey(slug));
    }
  }, [slug]);

  // 鎖定倒數，時間到自動解鎖。
  useEffect(() => {
    if (!isLocked || !lockUntil) return;

    const timer = setInterval(() => {
      if (Date.now() >= lockUntil) {
        setIsLocked(false);
        setLockUntil(null);
        localStorage.removeItem(getLockKey(slug));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockUntil, slug]);

  // 送出密碼
  const handleSubmit = () => {
    if (!password || isLocked) return;
    setIsLoading(true);

    fetch('/api/verify-password', {
      method: 'POST',
      body: JSON.stringify({ slug, password, lang }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) onSuccess();
        // 鎖定：後端回傳剩餘秒數
        else if (res.status === 429) {
          const until = Date.now() + (data.lockSeconds || 10000);
          setIsLocked(true);
          setLockUntil(until);
          setPassword('');
          localStorage.setItem(getLockKey(slug), until.toString());
        } else {
          showError(t('incorrectPassword'));
          setPassword('');
        }
      })
      .catch((err) => showError(err instanceof Error ? err.message : err))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className='mx-auto max-w-xs py-40'>
      <LockKeyhole className='mx-auto h-16 w-16 stroke-1 text-pink-700 dark:text-pink-500' />
      {isLocked ? (
        <div className='mt-6 space-y-4'>
          {isLocked && lockUntil ? (
            <div className='mt-2 text-center font-medium text-red-500 dark:text-red-400'>
              {t('tooManyAttempts')}
            </div>
          ) : null}
          <button
            type='button'
            onClick={() => router.push(`/${lang}/posts`)}
            aria-label={t('backToPosts')}
            className='text-text-secondary w-full rounded-md bg-pink-700 py-3 font-medium focus:outline-none dark:bg-pink-300'
          >
            {t('backToPosts')}
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isLoading || !password || isLocked) return;
            handleSubmit();
          }}
          className='mt-8 space-y-4'
        >
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading || isLocked}
              placeholder={t('enterPassword')}
              className='border-text-gray-lighter bg-bg-secondary text-text-priamry placeholder-text-gray-light dark:border-text-gray/80 w-full rounded-md border px-4 py-3 pr-12 focus:outline-none disabled:opacity-60'
            />
            <button
              type='button'
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className='text-text-gray-light dark:text-text-gray-lighter absolute top-1/2 right-4 -translate-y-1/2 focus:outline-none'
              tabIndex={-1}
              disabled={isLocked}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type='submit'
            disabled={isLoading || isLocked}
            className='text-text-secondary w-full rounded-md bg-pink-700 py-3 font-medium focus:outline-none disabled:opacity-60 dark:bg-pink-300'
          >
            {isLoading
              ? t_common('button.verifying')
              : t_common('button.submit')}
          </button>
        </form>
      )}
    </div>
  );
};

export default PostPasswordGate;
