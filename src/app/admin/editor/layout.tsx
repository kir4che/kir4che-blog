import type { ReactNode } from 'react';
import { Noto_Sans_TC, DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import { AlertProvider } from '@/contexts/AlertContext';

import '@/app/globals.css';

const notoSansTC = Noto_Sans_TC({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-tc',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

interface AdminEditorLayoutProps {
  children: ReactNode;
}

const AdminEditorLayout = ({ children }: AdminEditorLayoutProps) => (
  <html lang='zh-Hant' suppressHydrationWarning className='scheme-light'>
    <body
      className={`bg-bg-primary font-main min-h-screen sm:px-4 ${notoSansTC.variable} ${dmSans.variable}`}
    >
      <AlertProvider>
        {children}
        <Toaster position='top-center' toastOptions={{ duration: 3000 }} />
      </AlertProvider>
    </body>
  </html>
);

export default AdminEditorLayout;
