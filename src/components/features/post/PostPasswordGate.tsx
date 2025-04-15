'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';

interface PostPasswordGateProps {
  slug: string;
  lang: string;
  onSuccess: () => void;
}

const PostPasswordGate = ({ slug, lang, onSuccess }: PostPasswordGateProps) => {
  const t = useTranslations('PostPage');
  const t_common = useTranslations('common');
  const { showError } = useAlert();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!password) return;

    setIsLoading(true);

    fetch('/api/verify-password', {
      method: 'POST',
      body: JSON.stringify({ slug, password, lang }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (res.ok) onSuccess();
        else {
          showError('Incorrect password!');
          setPassword('');
        }
      })
      .catch((err) => {
        showError(
          'Failed to verify password: ' +
            (err instanceof Error ? err.message : err)
        );
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className='mx-auto max-w-xs py-40'>
      <LockKeyhole className='mx-auto mb-8 h-16 w-16 stroke-1 text-pink-700 dark:text-pink-500' />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isLoading || !password) return;
          handleSubmit();
        }}
        className='space-y-4'
      >
        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            placeholder={t('enterPassword')}
            className='border-text-gray-lighter bg-bg-secondary text-text-priamry placeholder-text-gray-light dark:border-text-gray/80 w-full rounded-md border px-4 py-3 pr-12 focus:outline-none disabled:opacity-60'
          />
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className='text-text-gray-light dark:text-text-gray-lighter absolute top-1/2 right-4 -translate-y-1/2 focus:outline-none'
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button
          type='submit'
          disabled={isLoading}
          className='text-text-secondary w-full rounded-md bg-pink-700 py-3 font-medium focus:outline-none disabled:opacity-60 dark:bg-pink-300'
        >
          {isLoading ? t_common('button.verifying') : t_common('button.submit')}
        </button>
      </form>
    </div>
  );
};

export default PostPasswordGate;
