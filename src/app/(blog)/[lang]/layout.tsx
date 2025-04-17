import React from 'react';
import { Metadata } from 'next';
import { Noto_Sans_TC, DM_Sans } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

import common from '@/config/common';
import { routing } from '@/i18n/routing';
import type { Language } from '@/types/language';
import { AlertProvider } from '@/context/AlertContext';

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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const { locales } = routing;

  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = `${baseUrl}/${locale}`;
  });

  return {
    title: common.siteInfo.blog.title,
    description: common.siteInfo.blog.description,
    alternates: {
      canonical: `${baseUrl}/${params.lang}`,
      languages: {
        ...languages,
        'x-default': baseUrl,
      },
    },
  };
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

const RootLayout = ({ children, params }: RootLayoutProps) => {
  const { lang } = params;

  const supportedLocales = routing.locales;
  if (!hasLocale(supportedLocales, lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`bg-bg-primary font-main sm:px-4 ${notoSansTC.variable} ${dmSans.variable}`}
      >
        <Toaster position='top-center' toastOptions={{ duration: 3000 }} />
        <NextIntlClientProvider>
          <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
            <AlertProvider>
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
            </AlertProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default RootLayout;
