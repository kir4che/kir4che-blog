export const dynamic = 'force-static';

import { Suspense } from 'react';
import { Metadata } from 'next';
import { Noto_Sans_TC, DM_Sans } from 'next/font/google';
import Script from 'next/script';
import { GoogleAnalytics } from '@next/third-parties/google';
import { hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

import type { Language } from '@/types';
import routing from '@/i18n/routing';
import Providers from '@/contexts/Providers';
import { getSeoConfig } from '@/lib/seo';

import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import Sidebar from '@/components/layouts/Sidebar';
import ScrollRestorer from '@/components/features/ScrollRestorer';
import StructuredData from '@/components/common/StructuredData';

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

type Params = Promise<{ lang: Language }>;

interface RootLayoutProps {
  children: React.ReactNode;
  params: Params;
}

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
  params: Params;
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
      <head>
        <Script
          async
          src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9209549258046593'
          crossOrigin='anonymous'
          strategy='afterInteractive'
        />
      </head>
      <body
        className={`bg-bg-primary font-main sm:px-4 ${notoSansTC.variable} ${dmSans.variable}`}
      >
        <Toaster position='top-center' toastOptions={{ duration: 3000 }} />
        <Providers locale={lang} messages={messages}>
          <StructuredData lang={lang} />
          <Sidebar lang={lang}>
            <div className='flex w-full flex-grow flex-col'>
              <Header lang={lang} />
              <main className='flex-1'>
                {children}
                <Suspense>
                  <ScrollRestorer />
                </Suspense>
              </main>
              <Footer />
            </div>
          </Sidebar>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
      <GoogleAnalytics
        gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ''}
      />
    </html>
  );
};

export default RootLayout;
