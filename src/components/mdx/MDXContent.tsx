'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

import Skeleton from '@/components/ui/Skeleton';

const MDXRemoteWrapper = dynamic(() => import('./MDXRemoteWrapper'), {
  loading: () => (
    <div className='space-y-6'>
      <Skeleton className='w-3/4' />
      <Skeleton className='w-full' />
      <Skeleton className='w-5/6' />
      <Skeleton className='w-2/3' />
      <Skeleton className='w-1/2' />
      <Skeleton className='w-3/4' />
    </div>
  ),
  ssr: false,
});

interface MDXContentProps {
  content: MDXRemoteSerializeResult;
}

const MDXContent = ({ content }: MDXContentProps) => {
  return <MDXRemoteWrapper content={content} />;
};

export default MDXContent;
