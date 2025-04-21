import React from 'react';
import { Metadata } from 'next';
import { Noto_Sans_TC, DM_Sans } from 'next/font/google';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

import type { Language } from '@/types/language';
import routing from '@/i18n/routing';
import Providers from '@/contexts/Providers';
import { getSeoConfig } from '@/utils/seo';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import LeftSidebar from '@/components/layouts/LeftSidebar';
import RightSidebar from '@/components/layouts/RightSidebar';

import '@/app/globals.css';

export async function generateMetadata({
  params,
}: {
  params: { lang: Language };
}): Promise<Metadata> {
  return getSeoConfig(params.lang);
}

const notoSansTC = Noto_Sans_TC({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-tc',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

interface RootLayoutProps {
  children: React.ReactNode;
  params: { lang: Language };
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
          <div className='mx-auto flex max-w-screen-2xl flex-col px-4 md:flex-row md:px-2'>
            <LeftSidebar />
            <div className='flex flex-1 gap-x-8 md:pt-8'>
              <div className='w-full max-w-screen flex-grow'>
                <Header />
                <main className='h-auto min-h-[calc(100vh-9rem)]'>
                  {children}
                </main>
                <Footer />
              </div>
              <RightSidebar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
