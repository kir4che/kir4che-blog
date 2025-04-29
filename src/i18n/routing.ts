import { defineRouting } from 'next-intl/routing';

import { CONFIG } from '@/config';

const routing = defineRouting({
  locales: CONFIG.languages.supportedLanguages,
  defaultLocale: CONFIG.languages.defaultLanguage,
});

export default routing;
