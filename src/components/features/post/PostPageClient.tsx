'use client';

import dynamic from 'next/dynamic';

import type { Language, PostMeta, MdxContent } from '@/types';

import PostLayout from './PostLayout';
import PostSkeleton from './PostSkeleton';

const MDXContent = dynamic(() => import('@/components/mdx/MDXContent'), {
  ssr: false,
  loading: () => <PostSkeleton />,
});

interface PostPageClientProps {
  post: PostMeta & { imageMetas: MdxContent['imageMetas'] };
  headings: { id: string; text: string; level: number }[];
  otherLangs: { exist: boolean; langs: Language[] };
  mdxSource: MdxContent['content'];
  extraComponents?: MdxContent['extraComponents'];
}

const PostPageClient = ({
  post,
  headings,
  otherLangs,
  mdxSource,
  extraComponents,
}: PostPageClientProps) => {
  return (
    <PostLayout post={post} headings={headings} otherLangs={otherLangs}>
      <MDXContent
        content={mdxSource}
        imageMetas={post.imageMetas}
        extraComponents={extraComponents}
      />
    </PostLayout>
  );
};

export default PostPageClient;
