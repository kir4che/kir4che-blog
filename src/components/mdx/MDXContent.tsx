'use client';

import dynamic from 'next/dynamic';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useMDXComponents } from '@/hooks/useMDXComponents';

interface MDXProps {
  content: MDXRemoteSerializeResult;
  imageMetas: Record<string, any>;
}

function InnerMDXContent({ content, imageMetas }: MDXProps) {
  const components = useMDXComponents(imageMetas);
  return <MDXRemote {...content} components={components} />;
}

export default dynamic(() => Promise.resolve(InnerMDXContent), { ssr: false });
