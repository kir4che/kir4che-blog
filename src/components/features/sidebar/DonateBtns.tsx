import React from 'react';

import ExternalLink from '@/components/ui/ExternalLink';

const DonateBtns: React.FC = () => (
  <div className='space-y-2'>
    <p className='text-text-primary dark:text-text-gray-light'>
      ─────────<span className='text-pink-600 dark:text-pink-300'>୨ৎ</span>
      ─────────
    </p>
    <div className='flex items-center justify-between'>
      <ExternalLink
        href='https://paypal.me/dcxxiii'
        title='Donate with PayPal'
        className='text-sm text-[#5DCEFF] hover:text-[#009cde] hover:no-underline dark:text-[#5DCEFF]'
      >
        ｡･: * <span className='text-[#009cde] dark:text-[#5DCEFF]'>PayPal</span>{' '}
        ˚:✧｡
      </ExternalLink>
      <ExternalLink
        href='https://ko-fi.com/kir4che'
        title='Support me on Ko-fi'
        className='text-right text-sm text-[#FB7364] hover:text-[#F74C37] hover:no-underline dark:text-[#FB7364]'
      >
        ⋆✴︎˚｡⋆{' '}
        <span className='text-[#F74C37] dark:text-[#FB7364]'>Ko-fi</span> ⋆˚｡⋆࿔
      </ExternalLink>
    </div>
    <p className='text-text-primary dark:text-text-gray-light'>
      ─────────<span className='text-pink-600 dark:text-pink-300'>୨ৎ</span>
      ─────────
    </p>
  </div>
);

export default DonateBtns;
