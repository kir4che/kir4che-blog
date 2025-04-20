'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Video } from 'lucide-react';

import YouTubeVideoList from '@/components/features/YouTubeVideoList';

const LatestYouTubeVideos: React.FC = () => {
  const t = useTranslations('sidebar');

  const [hasError, setHasError] = useState(false);
  if (hasError) return null;

  return (
    <div className='space-y-4'>
      <h3 className='mb-2 flex items-center gap-x-2 uppercase'>
        <Video
          className='h-4 w-4 text-pink-700 dark:text-pink-500'
          aria-hidden='true'
        />
        {t('latestVideo')}
      </h3>
      <YouTubeVideoList
        count={1}
        showTitle={false}
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export default LatestYouTubeVideos;
