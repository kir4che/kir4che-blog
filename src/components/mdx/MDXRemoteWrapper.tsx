'use client';

import React from 'react';
import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';
import { useMDXComponents } from '@/hooks/useMDXComponents';

interface MDXRemoteWrapperProps {
  content: MDXRemoteSerializeResult;
}

const MDXRemoteWrapper = ({ content }: MDXRemoteWrapperProps) => {
  const components = useMDXComponents();
  return <MDXRemote {...content} components={components} />;
};

export default MDXRemoteWrapper;
