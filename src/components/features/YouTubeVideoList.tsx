'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

import { useAlert } from '@/context/AlertContext';
import { fetchYouTubeVideos } from '@/services/youtube';
import { cn } from '@/lib/style';

import ExternalLink from '@/components/ui/ExternalLink';

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
};

interface YouTubeVideoListProps {
  count: number;
  showTitle?: boolean;
  showDate?: boolean;
  className?: string;
  titleStyle?: string;
}

const YouTubeVideoList = ({
  count,
  showTitle = true,
  showDate = false,
  className,
  titleStyle,
}: YouTubeVideoListProps) => {
  const { showError } = useAlert();

  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    fetchYouTubeVideos(count)
      .then((data) => setVideos(data))
      .catch((err) => {
        setVideos([]);
        showError(
          'Failed to fetch YouTube videos: ' +
            (err instanceof Error ? err.message : err)
        );
      });
  }, [count, showError]);

  return (
    <section
      className={cn('flex flex-wrap gap-3', className)}
      role='region'
      aria-label="kir4che's youtube"
    >
      {videos.map((video) => (
        <ExternalLink
          key={video.id}
          href={`https://www.youtube.com/watch?v=${video.id}`}
          className='group text-text-gray-dark dark:text-text-gray-light w-60 hover:no-underline'
        >
          <div className='relative mb-1 aspect-video rounded-md'>
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={240}
              height={135}
              className='h-full w-full object-cover transition-transform group-hover:scale-105'
              loading='lazy'
            />
            <div className='absolute inset-0 flex items-center justify-center bg-pink-800/15 opacity-0 transition-opacity group-hover:opacity-100'>
              <div className='bg-bg-secondary/80 flex h-11 w-11 items-center justify-center rounded-full'>
                <Play
                  className='h-5 w-5 fill-pink-800 text-pink-800 dark:fill-pink-200 dark:text-pink-200'
                  aria-hidden='true'
                />
              </div>
            </div>
          </div>
          {showTitle && (
            <h4
              className={cn(
                'text-text-primary dark:text-text-gray-light truncate text-xs font-medium',
                titleStyle
              )}
            >
              {video.title}
            </h4>
          )}
          {showDate && (
            <time className='text-text-gray-light text-xs'>
              {video.publishedAt}
            </time>
          )}
        </ExternalLink>
      ))}
    </section>
  );
};

export default YouTubeVideoList;
