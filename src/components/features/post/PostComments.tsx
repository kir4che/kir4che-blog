'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface PostCommentsProps {
  slug: string;
}

const UTTERANCES_REPO = 'kir4che/kir4che-blog';

const PostComments: React.FC<PostCommentsProps> = ({ slug }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  const activeTheme = resolvedTheme || theme;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.replaceChildren();

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute('repo', UTTERANCES_REPO);
    script.setAttribute('issue-term', slug);
    script.setAttribute('label', 'comment');
    script.setAttribute(
      'theme',
      activeTheme === 'dark' || activeTheme === 'night'
        ? 'github-dark'
        : 'github-light'
    );
    script.crossOrigin = 'anonymous';

    container.appendChild(script);
  }, [slug, activeTheme]);

  return <div ref={containerRef} className='utterances' />;
};

export default PostComments;
