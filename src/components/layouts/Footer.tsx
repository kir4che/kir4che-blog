'use client';

import { CONFIG } from '@/config';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LangMenu from '@/components/ui/LangMenu';

const Footer = () => (
  <div className='flex items-center justify-between py-4 sm:pt-6'>
    <div className='flex items-center gap-x-3 md:hidden'>
      <ThemeToggle />
      <LangMenu className='dropdown-top dropdown-start' />
    </div>
    <p className='dark:text-text-gray-lighter text-center text-xs'>
      © 2025 by {CONFIG.siteInfo.name}
    </p>
  </div>
);

export default Footer;
