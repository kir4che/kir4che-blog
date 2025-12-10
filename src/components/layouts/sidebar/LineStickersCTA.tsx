'use client';

import { useTranslations } from 'next-intl';
import { MessageCircle, MessageCircleHeart } from 'lucide-react';
import ExternalLink from '@/components/ui/ExternalLink';

const LineStickersCTA: React.FC = () => {
  const t = useTranslations('sidebar');

  return (
    <ExternalLink
      href='https://store.line.me/stickershop/author/3784299/'
      className='flex-center relative gap-x-2 rounded-full bg-linear-to-br from-pink-50/80 via-white to-white px-5 py-3 text-sm font-medium text-pink-600 shadow shadow-pink-900/15 transition-all duration-300 hover:from-pink-100/30 hover:to-pink-100/50 hover:text-pink-700 hover:no-underline dark:from-pink-900/20 dark:via-pink-900/10 dark:to-pink-900/20 dark:text-pink-100 dark:hover:from-pink-900/25 dark:hover:to-pink-900/25 dark:hover:text-pink-200'
    >
      <MessageCircle
        size={20}
        aria-hidden='true'
        className='block group-hover:hidden'
      />
      <MessageCircleHeart
        size={20}
        aria-hidden='true'
        className='hidden group-hover:block'
      />

      {t('lineStickersCta')}
    </ExternalLink>
  );
};

export default LineStickersCTA;
