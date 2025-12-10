import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { CONFIG } from '@/config';
import ExternalLink from '@/components/ui/ExternalLink';

import KofiIcon from '../../../public/svg/kofi.svg';

const KofiBtn = () => {
  const t = useTranslations('common');

  return (
    <ExternalLink
      href={`https://ko-fi.com/${CONFIG.siteInfo.name}`}
      title='Support me on Ko-fi'
      className='text-text-secondary dark:text-text-secondary inline-flex w-fit items-center gap-x-2 rounded-md bg-pink-700 px-3 py-2 text-sm font-semibold hover:no-underline dark:bg-pink-400'
    >
      <Image
        src={KofiIcon}
        alt='Ko-fi'
        width={20}
        height={20}
        className='size-5'
        aria-hidden='true'
      />
      {t('kofiButton')}
    </ExternalLink>
  );
};

export default KofiBtn;
