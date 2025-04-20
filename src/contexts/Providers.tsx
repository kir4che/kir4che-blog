'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { AlertProvider } from '@/contexts/AlertContext';

interface ProvidersProps {
  locale: string;
  messages: Record<string, any>;
  children: ReactNode;
}

const Providers = ({ locale, messages, children }: ProvidersProps) => (
  <NextIntlClientProvider
    locale={locale}
    messages={messages}
    timeZone='Asia/Taipei'
  >
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
      <AlertProvider>{children}</AlertProvider>
    </ThemeProvider>
  </NextIntlClientProvider>
);

export default Providers;
