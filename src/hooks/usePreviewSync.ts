import { marked } from 'marked';
import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { PreviewSyncState } from '@/components/features/admin/SyncIndicator';

const DEBOUNCE_MS = 3000;

// 偵測內容是否有變更
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  return hash;
};

// 向預覽 iframe 發送更新訊息
const sendToIframe = (iframe: HTMLIFrameElement, html: string, isClientSide: boolean) =>
  iframe.contentWindow?.postMessage(
    { type: 'preview-update', html, isClientSide },
    location.origin
  );

// 同步編輯器內容到預覽 iframe
export const usePreviewSync = (
  content: string,
  iframeRef: RefObject<HTMLIFrameElement | null>
): PreviewSyncState => {
  const [syncState, setSyncState] = useState<PreviewSyncState>('idle');
  const lastHashRef = useRef<number | null>(null);
  const iframeReadyRef = useRef(false);
  const pendingHtmlRef = useRef<string | null>(null);
  const isMountedRef = useRef(false);

  // 當 iframe 載入完成時，發送待機中的 HTML 預覽。
  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;
    if (pendingHtmlRef.current !== null && iframeRef.current) {
      sendToIframe(iframeRef.current, pendingHtmlRef.current, true);
      pendingHtmlRef.current = null;
    }
  }, [iframeRef]);

  // 監聽 iframe 載入，其準備好才發送更新。
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    if (iframe.contentDocument?.readyState === 'complete') iframeReadyRef.current = true;
    iframe.addEventListener('load', handleIframeLoad);
    return () => iframe.removeEventListener('load', handleIframeLoad);
  }, [iframeRef, handleIframeLoad]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (!content) return;

    setSyncState('typing');

    // 先用簡單的 markdown 渲染顯示即時預覽
    const clientHtml = `<section class="mdx-content">${marked.parse(content) as string}</section>`;
    if (iframeRef.current && iframeReadyRef.current)
      sendToIframe(iframeRef.current, clientHtml, true);
    else pendingHtmlRef.current = clientHtml;

    // 等待 3 秒無新輸入後，才發送完整的 MDX SSR 渲染請求。
    const timer = setTimeout(async () => {
      const hash = hashString(content);
      if (hash === lastHashRef.current) {
        setSyncState('idle');
        return;
      }

      setSyncState('ssr-pending');

      try {
        const res = await fetch('/api/admin/preview-render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error();

        const { html } = (await res.json()) as { html: string };
        const iframe = iframeRef.current;
        if (iframe && iframeReadyRef.current) sendToIframe(iframe, html, false);

        lastHashRef.current = hash;
        setSyncState((s) => (s === 'ssr-pending' ? 'synced' : s));
        setTimeout(() => setSyncState((s) => (s === 'synced' ? 'idle' : s)), 2000);
      } catch {
        setSyncState('idle');
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [content]);

  return syncState;
};
