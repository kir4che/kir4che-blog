'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Video } from 'lucide-react';

import { fetchYouTubeVideos, type VideoData } from '@/services/youtube';
import { useAlert } from '@/context/AlertContext';

import YouTubeVideoList from '@/components/features/YouTubeVideoList';

const LatestYouTubeVideos: React.FC = () => {
  const t = useTranslations('sidebar');
  const { showError } = useAlert();

  const [video, setVideo] = useState<VideoData | null>(null);

  useEffect(() => {
    const fetchVideo = () => {
      fetchYouTubeVideos(1)
        .then((videos) => {
          if (videos.length > 0) setVideo(videos[0]);
        })
        .catch((err) =>
          showError(
            'Failed to fetch YouTube video: ' +
              (err instanceof Error ? err.message : err)
          )
        );
    };

    fetchVideo();
  }, [showError]);

  if (!video) return null;

  return (
    <div className='space-y-4'>
      <h3 className='mb-2 flex items-center gap-x-2 uppercase'>
        <Video
          className='h-4 w-4 text-pink-700 dark:text-pink-500'
          aria-hidden='true'
        />
        {t('latestVideo')}
      </h3>
      <YouTubeVideoList count={1} showTitle={false} />
    </div>
  );
};

export default LatestYouTubeVideos;
