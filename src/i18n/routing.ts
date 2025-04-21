import { defineRouting } from 'next-intl/routing';

import common from '@/config/common';

const routing = defineRouting({
  locales: common.languages.langs,
  defaultLocale: common.languages.defaultLocale,
});

export default routing;
