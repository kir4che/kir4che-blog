'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';

import { useMDXComponents } from '@/hooks/useMDXComponents';

import Skeleton from '@/components/ui/Skeleton';

interface MDXProps {
  content: MDXRemoteSerializeResult;
  imageMetas: Record<string, any>;
}

const MDXWrapper = ({ content, imageMetas }: MDXProps) => {
  const components = useMDXComponents(imageMetas);
  return <MDXRemote {...content} components={components} />;
};

const DynamicMDXWrapper = dynamic(async () => MDXWrapper, {
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

const MDXContent = ({ content, imageMetas }: MDXProps) => {
  return <DynamicMDXWrapper content={content} imageMetas={imageMetas} />;
};

export default MDXContent;
