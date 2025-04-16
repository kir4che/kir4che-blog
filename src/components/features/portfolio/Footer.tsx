import React from 'react';

import { SITE_NAME } from '@/config/constants';

const Footer: React.FC = () => (
  <footer className='bg-pink-500 py-2 pr-2 align-middle'>
    <p className='text-right text-xs text-white'>
      2025 © Molly Su ({SITE_NAME})
    </p>
  </footer>
);

export default Footer;
