import Image from 'next/image';
import type { MDXComponents } from 'mdx/types';

import {
  CustomH1,
  CustomH2,
  CustomH3,
  CustomH4,
  CustomH5,
  CustomH6,
} from '@/components/mdx/Heading';
import Correction from '@/components/mdx/Correction';
import Highlight from '@/components/mdx/Highlight';
import Table from '@/components/mdx/Table';
import Details, { Summary } from '@/components/mdx/Details';
import CustomImage from '@/components/mdx/Image';
import Images from '@/components/mdx/Images';

export const useMDXComponents = (): MDXComponents => {
  return {
    h1: CustomH1,
    h2: CustomH2,
    h3: CustomH3,
    h4: CustomH4,
    h5: CustomH5,
    h6: CustomH6,
    Image: CustomImage,
    Images: Images,
    Table: Table,
    Details: Details,
    Summary: Summary,
    Correction,
    Highlight,
    p: ({ children }) => (
      <p className='text-text-primary my-6 block text-base/7'>{children}</p>
    ),
    ul: ({ children }) => (
      <ul className='my-2 list-inside list-disc pl-4'>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className='my-2 list-inside list-decimal pl-4'>{children}</ol>
    ),
    li: ({ children }) => <li className='leading-[1.85]'>{children}</li>,
    a: ({ children, href }) => (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='text-blue-600 underline underline-offset-2 dark:text-blue-300'
      >
        {children}
      </a>
    ),
    img: ({ src = '', alt = '' }) => (
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className='max-h-[600px] w-full rounded-md object-cover'
        style={{ width: '100%', height: 'auto' }}
      />
    ),
    blockquote: ({ children }) => (
      <blockquote className='my-6 border-l-4 border-pink-500 bg-pink-50 px-5 py-3 dark:border-pink-500 dark:bg-pink-700/15'>
        {children}
      </blockquote>
    ),
    mark: ({ children }) => (
      <mark className='text-text-primary bg-pink-100 dark:bg-pink-500/30'>
        {children}
      </mark>
    ),
    del: ({ children }) => (
      <del className='decoration-pink-700 decoration-2 dark:decoration-pink-400'>
        {children}
      </del>
    ),
    ins: ({ children }) => (
      <ins className='bg-yellow-100 px-0.5 no-underline dark:bg-yellow-400/30'>
        {children}
      </ins>
    ),
    sup: ({ children }) => (
      <sup className='text-text-gray-lighter dark:text-text-gray text-sm'>
        {children}
      </sup>
    ),
    hr: () => (
      <hr className='text-text-gray-lighter dark:text-text-gray mx-auto my-8 w-20' />
    ),
  };
};
