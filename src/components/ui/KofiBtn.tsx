import React from 'react';
import Image from 'next/image';

import ExternalLink from '@/components/ui/ExternalLink';

import KofiIcon from '../../../public/svg/kofi.svg';

const KofiBtn = () => (
  <ExternalLink
    href='https://ko-fi.com/yangshun'
    title='Support me on Ko-fi'
    className='text-text-secondary dark:text-text-secondary inline-flex w-fit items-center gap-x-2 rounded-md bg-pink-500 px-3 py-2 text-sm font-semibold hover:bg-pink-500/90 hover:no-underline'
  >
    <Image
      src={KofiIcon}
      alt='Ko-fi'
      width={20}
      height={20}
      className='h-5 w-5'
      aria-hidden='true'
    />
    Buy me a milktea
  </ExternalLink>
);

export default KofiBtn;
