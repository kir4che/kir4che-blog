'use client';

import dynamic from 'next/dynamic';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { MDXComponents } from 'mdx/types';
import { useMDXComponents } from '@/hooks/useMDXComponents';

interface MDXProps {
  content: MDXRemoteSerializeResult;
  imageMetas: Record<string, any>;
  components?: Partial<MDXComponents>;
}

function InnerMDXContent({ content, imageMetas, components }: MDXProps) {
  const merged = useMDXComponents(imageMetas, components);
  return <MDXRemote {...content} components={merged} />;
}

export default dynamic(() => Promise.resolve(InnerMDXContent), { ssr: false });
