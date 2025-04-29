'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useMDXComponents } from '@/hooks/useMDXComponents';

interface MDXProps {
  content: MDXRemoteSerializeResult;
  imageMetas: Record<string, any>;
}

const MDXWrapper = memo(({ content, imageMetas }: MDXProps) => {
  const components = useMDXComponents(imageMetas);
  return <MDXRemote {...content} components={components} />;
});

MDXWrapper.displayName = 'MDXWrapper';

const MDXContent = memo(({ content, imageMetas }: MDXProps) => {
  return <MDXWrapper content={content} imageMetas={imageMetas} />;
});

MDXContent.displayName = 'MDXContent';

export default dynamic(() => Promise.resolve(MDXContent), { ssr: false });
