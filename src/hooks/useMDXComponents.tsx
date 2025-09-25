import { useMemo } from 'react';
import type { MDXComponents } from 'mdx/types';

import { H1, H2, H3, H4, H5, H6 } from '@/components/mdx/Heading';
import Correction from '@/components/mdx/Correction';
import Highlight from '@/components/mdx/Highlight';
import Table from '@/components/mdx/Table';
import Accordion from '@/components/mdx/Accordion';
import CustomLink from '@/components/mdx/Link';
import CustomImage from '@/components/mdx/Image';
import ImageGallery from '@/components/mdx/ImageGallery';
import Rating from '@/components/mdx/Rating';
import CustomVideo from '@/components/mdx/Video';

export const useMDXComponents = (
  imageMetas: Record<string, any> = {},
  extraComponents: Partial<MDXComponents> = {}
): MDXComponents =>
  useMemo(
    () => ({
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      h5: H5,
      h6: H6,
      Table: Table, // <Table data={{ headers: [], rows: [[], []] }} />
      Image: (props) => {
        const meta = imageMetas[props.src ?? ''] ?? {};
        return <CustomImage {...meta} {...props} />;
      },
      Images: ImageGallery, // <Images images={[{ src: '', alt: '', width: '' }, ... ]} height='150px' />
      Video: CustomVideo, // <Video src="..." title="..." />
      Accordion, // <Accordion variant="primary" title="Title">{children}</Accordion>
      Correction, // <Correction wrong="A" correct="B" />
      Highlight, // <Highlight color="pink">{children}</Highlight>
      Rating, // <Rating type='heart' rating={4} />
      Kbd: ({ children }) => (
        <kbd className='kbd border-neutral-400 bg-neutral-200'>{children}</kbd>
      ), // <Kbd>Enter</Kbd>
      p: ({ children }) => (
        <p className='text-text-primary my-6 block text-base/7 first:mt-0 last:mb-0'>
          {children}
        </p>
      ),
      a: CustomLink, // [Text](url)
      img: (props) => {
        // \![alt](url)
        const meta = imageMetas[props.src ?? ''] ?? {};
        return <CustomImage {...meta} {...props} />;
      },
      ul: ({ children }) => (
        <ul className='my-2 list-inside list-disc pl-4'>{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className='my-2 list-inside list-decimal pl-4'>{children}</ol>
      ),
      li: ({ children }) => <li className='leading-[1.85]'>{children}</li>,
      blockquote: (
        { children } // > Text
      ) => (
        <blockquote className='border-l-[5px] border-pink-500 bg-pink-50 px-5 py-4 dark:border-pink-500 dark:bg-pink-700/15 [&_p]:my-0'>
          {children}
        </blockquote>
      ),
      code: ({ children, className, ...rest }) => {
        const isInCodeBlock = className?.includes('language-');

        if (isInCodeBlock)
          return (
            <code className={className} {...rest}>
              {children}
            </code>
          );

        return (
          <code
            className='bg-pink-100/80 px-1.5 py-0.5 font-mono text-sm text-pink-800 dark:bg-pink-800/30 dark:text-pink-200'
            {...rest}
          >
            {children}
          </code>
        );
      },
      mark: (
        { children } // ==Text==
      ) => (
        <mark className='text-text-primary bg-pink-100 dark:bg-pink-500/30'>
          {children}
        </mark>
      ),
      del: (
        { children } // ~~Text~~
      ) => (
        <del className='decoration-pink-700 decoration-2 dark:decoration-pink-400'>
          {children}
        </del>
      ),
      ins: ({ children }) => (
        <ins className='bg-yellow-100 px-0.5 no-underline dark:bg-yellow-400/30'>
          {children}
        </ins>
      ),
      sup: (
        { children } // ^Text^
      ) => (
        <sup className='px-0.5 text-xs text-pink-600 dark:text-pink-400'>
          {children}
        </sup>
      ),
      hr: () => (
        // ---
        <hr className='text-text-gray-lighter dark:text-text-gray mx-auto my-8 w-20' />
      ),
      ...extraComponents,
    }),
    [imageMetas, extraComponents]
  );
