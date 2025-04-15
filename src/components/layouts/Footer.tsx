'use client';

import ThemeToggle from '@/components/common/ThemeToggle';
import LangMenu from '@/components/common/LangMenu';

const Footer = () => (
  <div className='flex items-center justify-between py-4 sm:py-8'>
    <div className='flex items-center gap-x-3 md:hidden'>
      <ThemeToggle />
      <LangMenu className='dropdown-top dropdown-start' />
    </div>
    <p className='dark:text-text-gray-lighter text-center text-xs'>
      © 2025 by kir4che
    </p>
  </div>
);

export default Footer;
