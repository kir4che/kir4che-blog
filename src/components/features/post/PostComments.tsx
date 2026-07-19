'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type UtterancesTheme = 'github-dark' | 'github-light';

interface PostCommentsProps {
  slug: string;
  hasPassword?: boolean;
}

const PostComments = ({ slug, hasPassword = false }: PostCommentsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLocked, setIsLocked] = useState(hasPassword);
  const [currentTheme, setCurrentTheme] = useState<UtterancesTheme>('github-light');

  // mount 時檢查 cookie（cover PostPasswordGate 已經觸發 unlock 的情況）
  useEffect(() => {
    if (hasPassword && document.cookie.includes(`postUnlock-${slug}=`)) setIsLocked(false);
  }, [hasPassword, slug]);

  // 監聽文章解鎖事件（PostPasswordGate），解鎖後才載入留言系統。
  useEffect(() => {
    const handleUnlock = () => setIsLocked(false);
    window.addEventListener('post:unlocked', handleUnlock);
    return () => window.removeEventListener('post:unlocked', handleUnlock);
  }, []);

  const resolveTheme = useCallback(
    (): UtterancesTheme =>
      document.documentElement.classList.contains('dark') ? 'github-dark' : 'github-light',
    []
  );

  const mountUtterances = useCallback(
    (theme: UtterancesTheme) => {
      if (!containerRef.current || isLocked) return;

      const container = containerRef.current;
      container.replaceChildren();

      const script = document.createElement('script');
      script.src = 'https://utteranc.es/client.js';
      script.async = true;
      script.setAttribute('repo', 'kir4che/kir4che-blog');
      script.setAttribute('issue-term', slug);
      script.setAttribute('label', 'comment');
      script.setAttribute('theme', theme);
      script.crossOrigin = 'anonymous';

      container.appendChild(script);
    },
    [slug, isLocked]
  );

  // 初始化/重建 Utterances
  useEffect(() => {
    if (!isLocked) {
      const theme = resolveTheme();
      setCurrentTheme(theme);
      mountUtterances(theme);
    }
  }, [isLocked, mountUtterances, resolveTheme]);

  //  監聽 theme 變化，並透過 postMessage 通知 Utterances iframe 變更主題。
  useEffect(() => {
    if (isLocked) return;

    const observer = new MutationObserver(() => {
      const newTheme = resolveTheme();
      if (newTheme === currentTheme) return;

      setCurrentTheme(newTheme);
      const iframe = containerRef.current?.querySelector('iframe');
      if (iframe?.contentWindow)
        iframe.contentWindow.postMessage(
          { type: 'set-theme', theme: newTheme },
          'https://utteranc.es'
        );
      else mountUtterances(newTheme);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [currentTheme, isLocked, mountUtterances, resolveTheme]);

  if (isLocked)
    return (
      <div ref={containerRef} className="utterances hidden" data-post-comments data-slug={slug} />
    );

  return (
    <div
      ref={containerRef}
      className="utterances"
      data-post-comments
      data-slug={slug}
      data-locked="false"
    />
  );
};

export default PostComments;
