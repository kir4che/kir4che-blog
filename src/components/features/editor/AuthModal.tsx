import type { FormEvent } from 'react';
import { Loader2, Shield } from 'lucide-react';

import InputField from '@/components/ui/InputField';
import LoadingSpin from '@/components/ui/LoadingSpin';

interface AuthModalProps {
  checking: boolean;
  submitting: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: (event?: FormEvent) => void;
}

const AuthModal = ({
  checking,
  submitting,
  password,
  onPasswordChange,
  onSubmit,
}: AuthModalProps) => (
  <div className='modal modal-open flex-center fixed inset-0 z-50 bg-black/80 px-4'>
    <div className='modal-box bg-bg-secondary relative max-w-sm space-y-4 rounded-xl'>
      {checking ? (
        <LoadingSpin
          text='驗證中'
          className='justify-center py-10 text-lg font-medium'
        />
      ) : (
        <>
          <h2 className='flex items-center gap-1.5 text-lg font-semibold text-pink-700'>
            <Shield size={20} />
            後台存取
          </h2>
          <form onSubmit={onSubmit} className='space-y-3'>
            <InputField
              type='password'
              value={password}
              onChange={onPasswordChange}
              placeholder='請輸入後台密碼'
              autoFocus
            />
            <button
              type='submit'
              disabled={submitting}
              className='disabled:bg-text-gray flex-center w-full gap-2 rounded-full bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700'
            >
              {submitting && <Loader2 size={16} className='animate-spin' />}
              解鎖
            </button>
          </form>
        </>
      )}
    </div>
  </div>
);

export default AuthModal;
