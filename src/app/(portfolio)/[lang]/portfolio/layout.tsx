import React, { use } from 'react';
import { Metadata } from 'next';
import { Noto_Sans_TC, Rubik_Doodle_Shadow } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';

import type { Language } from '@/types/language';
import common from '@/config/common';
import routing from '@/i18n/routing';

import Header from '@/components/features/portfolio/Header';
import Footer from '@/components/features/portfolio/Footer';

import '@/app/globals.css';

export const metadata: Metadata = {
  title: common.siteInfo.protfolio.title,
  description: common.siteInfo.protfolio.description,
};

const notoSansTC = Noto_Sans_TC({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-tc',
});

const rubikDoodleShadow = Rubik_Doodle_Shadow({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rubik-doodle',
});

interface PortfolioLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: Language }>;
}

const PortfolioLayout = ({ children, params }: PortfolioLayoutProps) => {
  const { lang } = use(params);

  const supportedLocales = routing.locales;
  if (!hasLocale(supportedLocales, lang)) notFound();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`font-portfolio ${notoSansTC.variable} ${rubikDoodleShadow.variable}`}
      >
        <NextIntlClientProvider>
          <Header />
          <main className='bg-white'>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default PortfolioLayout;
