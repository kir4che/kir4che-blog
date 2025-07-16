import { Suspense } from 'react';
import { Metadata } from 'next';
import { Noto_Sans_TC, DM_Sans } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

import type { Language } from '@/types';
import routing from '@/i18n/routing';
import Providers from '@/contexts/Providers';
import { getSeoConfig } from '@/utils/getSeoConfig';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import Sidebar from '@/components/layouts/Sidebar';
import ScrollRestorer from '@/components/features/ScrollRestorer';

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

interface RootLayoutProps {
  children: React.ReactNode;
  params: { lang: Language };
}

// 在正式環境中禁用 console，避免顯示不必要的日誌。
if (
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_NODE_ENV !== 'development'
) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export function generateStaticParams() {
  return routing.locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: { lang: Language };
}): Promise<Metadata> {
  const { lang } = await params;
  return getSeoConfig(lang);
}

const RootLayout = async ({ children, params }: RootLayoutProps) => {
  const { lang } = await params;

  const supportedLocales = routing.locales;
  if (!hasLocale(supportedLocales, lang)) notFound();

  const messages = await getMessages({ locale: lang });

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`bg-bg-primary font-main sm:px-4 ${notoSansTC.variable} ${dmSans.variable}`}
      >
        <Toaster position='top-center' toastOptions={{ duration: 3000 }} />
        <Providers locale={lang} messages={messages}>
          <Sidebar lang={lang}>
            <div className='w-full flex-grow'>
              <Header lang={lang} />
              <main className='h-auto min-h-[calc(100vh-9rem)]'>
                {children}
                <Suspense>
                  <ScrollRestorer />
                </Suspense>
              </main>
              <Footer />
            </div>
          </Sidebar>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
