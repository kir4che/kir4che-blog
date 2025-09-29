'use client';

import { memo } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import type { MdxContent } from '@/types';
import { useMDXComponents } from '@/hooks/useMDXComponents';

const MDXContent = ({ content, imageMetas, extraComponents }: MdxContent) => {
  const mergedComponents = useMDXComponents({ imageMetas, extraComponents });
  return <MDXRemote {...content} components={mergedComponents} />;
};

export default memo(MDXContent);
