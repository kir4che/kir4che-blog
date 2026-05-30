import { ChevronLeft, Eye, Link as LinkIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { usePreviewSync } from '@/hooks/usePreviewSync';
import type { TaxonomyItem } from '@/types';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';
import EditorMetadata from './EditorMetadata';
import EditorToolbar from './EditorToolbar';
import SyncIndicator from './SyncIndicator';

type SyncState = 'success' | 'warning' | 'error';
type SaveMode = 'save' | 'draft' | 'publish';

interface PostData {
  id: string;
  slug: string;
  lang: string;
  title: string;
  content: string;
  description: string;
  coverImage: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  draft: boolean;
  showUpdatedAt: boolean;
  protected: boolean;
  updatedAt: string;
  date: string;
}

interface EditorProps {
  post: PostData | null;
  isEditing: boolean;
  defaultDate: string;
  previewUrl: string;
  allCategories: TaxonomyItem[];
  allTags: TaxonomyItem[];
}

interface DraftData {
  title: string;
  content: string;
  slug: string;
  lang: string;
  date: string;
  description: string;
  tags: string;
  categories: string;
  featured: boolean;
  showUpdatedAt: boolean;
  protected: boolean;
  coverImage: string;
  savedAt: number; // 保存時間戳，判斷草稿是否過期。
}

const SYNC_COLORS: Record<SyncState, string> = {
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  error: 'bg-red-400',
};

const DRAFT_PREFIX = 'admin-draft-';
const MAX_AGE_MS = 1 * 24 * 60 * 60 * 1000;

const Editor = ({
  post,
  isEditing,
  defaultDate,
  previewUrl: initialPreviewUrl,
  allCategories,
  allTags,
}: EditorProps) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [isDraft, setIsDraft] = useState(post?.draft !== false);
  const [currentId, setCurrentId] = useState(post?.id || '');
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(initialPreviewUrl);

  const [sync, setSync] = useState<{ state: SyncState; text: string }>({
    state: 'success',
    text: '已同步',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [enablePreviewSync, setEnablePreviewSync] = useState(false);
  const [editorWidth, setEditorWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const isMac = useMemo(() => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent), []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewSyncState = usePreviewSync(enablePreviewSync ? content : '', iframeRef);
  const formRef = useRef<HTMLFormElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  titleRef.current = title;
  contentRef.current = content;

  const getDraftKey = useCallback(() => {
    return currentId ? `${DRAFT_PREFIX}${currentId}` : `${DRAFT_PREFIX}new`;
  }, [currentId]);

  const setSyncStatus = useCallback((text: string, state: SyncState = 'success') => {
    setSync({ state, text });
  }, []);

  // 收集當前表單中的所有資料（保存草稿或推到 GitHub 用）
  const collectDraft = useCallback((): DraftData => {
    const form = formRef.current;
    if (!form)
      return {
        title: titleRef.current,
        content: contentRef.current,
        slug: '',
        lang: '',
        date: '',
        description: '',
        tags: '',
        categories: '',
        featured: false,
        showUpdatedAt: false,
        protected: false,
        coverImage: '',
        savedAt: Date.now(),
      };

    const fd = new FormData(form);
    const val = (k: string) => (fd.get(k) as string) || '';
    return {
      title: val('title'),
      content: val('content'),
      slug: val('slug'),
      lang: val('lang'),
      date: val('date'),
      description: val('description'),
      tags: val('tags'),
      categories: val('categories'),
      featured: fd.get('featured') === 'on',
      showUpdatedAt: fd.get('showUpdatedAt') === 'on',
      protected: fd.get('protected') === 'on',
      coverImage: val('coverImage'),
      savedAt: Date.now(),
    };
  }, []);

  // 將編輯內容存到 localStorage
  const saveToLocal = useCallback(() => {
    try {
      localStorage.setItem(getDraftKey(), JSON.stringify(collectDraft()));
      setSyncStatus('已自動儲存', 'success');
    } catch {
      setSyncStatus('自動儲存失敗', 'error');
    }
  }, [getDraftKey, collectDraft, setSyncStatus]);

  // 頁面載入時自動從 localStorage 恢復之前的草稿
  const restoreFromLocal = useCallback((data: DraftData) => {
    setTitle(data.title || '');
    setContent(data.content || '');
    const form = formRef.current;
    if (!form) return;

    // 確保 DOM 已更新後再填充表單
    requestAnimationFrame(() => {
      for (const el of Array.from(form.elements) as (
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement
      )[]) {
        if (!el.name || el.disabled || el.name === 'title' || el.name === 'content') continue;
        const value = data[el.name as keyof DraftData];
        if (value !== undefined) {
          if (el.type === 'checkbox') {
            (el as HTMLInputElement).checked = Boolean(value);
            el.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            el.value = String(value);
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    });
  }, []);

  // 清理過期草稿並恢復當前草稿
  useEffect(() => {
    const now = Date.now();
    const keysToRemove: string[] = [];
    const draftKey = getDraftKey();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(DRAFT_PREFIX) && key !== draftKey) {
        try {
          const item = localStorage.getItem(key);
          if (!item) continue;
          const data = JSON.parse(item) as Partial<DraftData>;
          if (!data.savedAt || now - data.savedAt > MAX_AGE_MS) keysToRemove.push(key);
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    if (keysToRemove.length > 0) showToast(`已清理 ${keysToRemove.length} 個過期草稿`, 'info');

    const stored = localStorage.getItem(draftKey);
    if (stored) {
      try {
        restoreFromLocal(JSON.parse(stored) as DraftData);
        showToast('已從 localstorage 還原！', 'success');
      } catch {
        localStorage.removeItem(draftKey);
      }
    }
  }, []);

  // 確認停止編輯的 1.5 秒後自動保存
  const scheduleSave = useCallback(() => {
    setSyncStatus('編輯中...', 'warning');
    setIsDirty(true);
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveToLocal, 1500);
  }, [setSyncStatus, saveToLocal]);

  const validateForm = useCallback((): string[] => {
    const missing: string[] = [];
    if (!title.trim()) missing.push('標題');
    if (!currentId) {
      const form = formRef.current;
      const langInput = form?.querySelector<HTMLInputElement | HTMLSelectElement>('[name="lang"]');
      if (!langInput?.value) missing.push('語言');
    }
    return missing;
  }, [title, currentId]);

  // 儲存並推到 GitHub
  const triggerSave = useCallback(
    async (mode?: SaveMode): Promise<boolean> => {
      const form = formRef.current;
      if (!form || isSaving) return false;

      const missing = validateForm();
      if (missing.length > 0) {
        showToast(`請填寫必填欄位：${missing.join('、')}！`, 'error');
        return false;
      }

      setIsSaving(true);
      setSyncStatus('推送中...', 'warning');

      let nextDraft = isDraft;
      if (mode === 'publish') nextDraft = false;
      else if (mode === 'draft') nextDraft = true;
      setIsDraft(nextDraft);

      try {
        const formData = new FormData(form);
        formData.set('draft', nextDraft ? 'true' : 'false');

        // 根據是否有 id 決定是新增/編輯
        const id = formData.get('id')?.toString() || '';
        const res = await fetch(`/api/admin/posts${id ? `/${encodeURIComponent(id)}` : ''}`, {
          method: id ? 'PUT' : 'POST',
          body: formData,
        });

        const result = (await res.json()) as {
          id?: string;
          lang?: string;
          slug?: string;
          message?: string;
        };

        if (!res.ok) throw new Error(result.message || '推送失敗！');

        setSyncStatus('已同步 GitHub', 'success');
        setIsDirty(false);

        // 新文章存很好後，移動 localStorage 中的草稿並更新預覽 URL。
        if (!id && result.id && result.lang && result.slug) {
          window.history.replaceState(
            null,
            '',
            `/admin/editor?id=${encodeURIComponent(result.id)}`
          );
          setCurrentId(result.id);

          const oldDraft = localStorage.getItem(`${DRAFT_PREFIX}new`);
          if (oldDraft) {
            localStorage.setItem(`${DRAFT_PREFIX}${result.id}`, oldDraft);
            localStorage.removeItem(`${DRAFT_PREFIX}new`);
          }

          const nextPreviewUrl = `/admin/preview?id=${result.lang}/${result.slug}`;
          setCurrentPreviewUrl(nextPreviewUrl);
        } else if (id && iframeRef.current && currentPreviewUrl) {
          iframeRef.current.contentWindow?.location.reload();
        }

        showToast('已推送至 GitHub！', 'success');
        return true;
      } catch (err) {
        setSyncStatus('推送失敗！', 'error');
        showToast(err instanceof Error ? err.message : '推送失敗！', 'error');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [isSaving, validateForm, isDraft, setSyncStatus, saveToLocal, currentPreviewUrl]
  );

  // 同步編輯器與預覽的 scroll 位置
  const syncScroll = useCallback(() => {
    const textarea = textareaRef.current;
    const iframe = iframeRef.current;
    if (!textarea || !iframe?.contentWindow) return;

    const { scrollTop, scrollHeight, clientHeight } = textarea;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return;

    const ratio = scrollTop / maxScroll;
    const iframeBody = iframe.contentDocument?.body;
    if (!iframeBody) return;

    const iframeMax = iframeBody.scrollHeight - iframe.clientHeight;
    iframe.contentWindow.scrollTo({ top: ratio * iframeMax, behavior: 'instant' });
  }, []);

  const handleKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();
      if (key >= '1' && key <= '6') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;

        const level = parseInt(key, 10);
        const newHashes = '#'.repeat(level) + ' ';

        const val = textarea.value;
        const selStart = textarea.selectionStart ?? 0;
        const selEnd = textarea.selectionEnd ?? 0;

        const lineStart = val.lastIndexOf('\n', selStart - 1) + 1;
        let lineEnd = val.indexOf('\n', selStart);
        if (lineEnd === -1) lineEnd = val.length;
        const currLine = val.substring(lineStart, lineEnd);

        const match = currLine.match(/^#+\s*/);
        const oldMatchLength = match ? match[0].length : 0;

        textarea.setRangeText(newHashes, lineStart, lineStart + oldMatchLength);

        const calcNewPos = (pos: number) => {
          if (pos < lineStart + oldMatchLength) return lineStart + newHashes.length;
          return pos - oldMatchLength + newHashes.length;
        };

        textarea.setSelectionRange(calcNewPos(selStart), calcNewPos(selEnd));
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    [isMac]
  );

  // 元件卸載時，取消還在等待中的自動存檔計時器。
  useEffect(() => () => clearTimeout(saveTimeoutRef.current), []);

  // 拖動編輯器與預覽的分割線以調整寬度
  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);

    // 鼠標移動時計算新的寬度
    const onMouseMove = (ev: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const newWidth = Math.min(80, Math.max(20, ((ev.clientX - left) / width) * 100));
      setEditorWidth(newWidth);
    };

    // 鼠標放開時停止拖動
    const onMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // 檢查是否有沒存的變更
  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDirty) {
      if (!window.confirm('您有未儲存的變更。確定要離開並捨棄草稿嗎？')) {
        e.preventDefault();
        return;
      }
    }
    localStorage.removeItem(getDraftKey());
  };

  // 清除計時器後執行保存
  const handleSave = useCallback(
    async (mode: SaveMode) => {
      clearTimeout(saveTimeoutRef.current);
      return triggerSave(mode);
    },
    [triggerSave]
  );

  // 發布文章
  const handlePublish = useCallback(async () => {
    const missing = validateForm();
    if (missing.length > 0) return showToast(`請填寫必填欄位：${missing.join('、')}`, 'error');
    if (!window.confirm('確定要發布這篇文章嗎？')) return;

    const success = await handleSave('publish');
    if (success) setTimeout(() => window.location.reload(), 500);
    else setIsDraft(true);
  }, [validateForm, handleSave]);

  // 取消發布（退回草稿）
  const handleUnpublish = useCallback(async () => {
    const success = await handleSave('draft');
    if (success) {
      showToast('已退回草稿！即將重新載入頁面...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    }
  }, [handleSave]);

  return (
    <div className="bg-surface-primary flex h-screen flex-col overflow-hidden">
      <form ref={formRef} id="editor-form" className="flex h-full flex-col" onInput={scheduleSave}>
        <input type="hidden" name="id" value={currentId} />
        <input type="hidden" name="draft" value={isDraft ? 'true' : 'false'} />
        <div className="navbar h-16 border-b px-4 shadow">
          <a
            href="/admin"
            className="text-foreground-primary hover:text-primary"
            aria-label="返回"
            onClick={handleBackClick}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </a>
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={cn(
              'input input-ghost focus:text-primary flex-1 text-lg font-bold sm:text-xl',
              isDraft && 'opacity-50'
            )}
            placeholder="輸入文章標題..."
          />
          <div className="flex-center gap-3">
            <EditorMetadata
              isEditing={isEditing}
              defaultDate={defaultDate}
              initialSlug={post?.slug || ''}
              initialLang={post?.lang || ''}
              initialCoverImage={post?.coverImage || ''}
              initialDescription={post?.description || ''}
              initialCategories={post?.categories || []}
              initialTags={post?.tags || []}
              initialFeatured={post?.featured || false}
              initialShowUpdatedAt={post?.showUpdatedAt || false}
              initialProtected={post?.protected || false}
              updatedAtText={post?.updatedAt ? `上次更新：${post.updatedAt}` : ''}
              allCategories={allCategories}
              allTags={allTags}
            />
            {isDraft ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSave('save')}
                  disabled={isSaving}
                  className="btn btn-sm bg-surface-secondary text-primary border-primary text-nowrap"
                >
                  儲存草稿
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="btn btn-primary border-primary text-surface-secondary btn-sm"
                >
                  <span className={cn(isSaving && 'hidden')}>發布文章</span>
                  <span
                    className={cn(
                      'loading loading-spinner loading-xs text-primary',
                      !isSaving && 'hidden'
                    )}
                  />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleSave('save')}
                  disabled={isSaving}
                  className="btn btn-sm bg-surface-secondary text-primary border-primary text-nowrap"
                >
                  <span className={cn(isSaving && 'hidden')}>更新</span>
                  <span
                    className={cn(
                      'loading loading-spinner loading-xs text-primary',
                      !isSaving && 'hidden'
                    )}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={isSaving}
                  className="btn btn-primary text-foreground-secondary btn-sm"
                >
                  取消發布
                </button>
              </>
            )}
            {currentPreviewUrl && (
              <a
                href={currentPreviewUrl}
                target="_blank"
                rel="noopener"
                className="text-foreground-primary hover:text-primary"
                aria-label="預覽文章"
              >
                <LinkIcon size={20} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
        <div ref={containerRef} className="flex flex-1 overflow-hidden">
          <div
            className="text-foreground-secondary bg-foreground-primary relative flex h-full shrink-0 flex-col"
            style={{ width: `${editorWidth}%` }}
          >
            <span
              className={cn(
                'absolute top-5 right-6 z-10 size-2.5 rounded-full shadow-sm transition-colors duration-300',
                SYNC_COLORS[sync.state]
              )}
              title={sync.text}
            />
            <EditorToolbar
              textareaRef={textareaRef}
              enablePreviewSync={enablePreviewSync}
              onPreviewSyncChange={setEnablePreviewSync}
            />
            <textarea
              ref={textareaRef}
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onScroll={syncScroll}
              onKeyDown={handleKeydown}
              className="scrollbar-none w-full flex-1 resize-none p-4 text-base outline-none"
              placeholder="支援標準 Markdown 語法與自訂組件..."
              spellCheck={false}
            />
          </div>
          <div
            className="w-1 shrink-0 cursor-col-resize bg-gray-700 transition-colors hover:bg-gray-500 active:bg-blue-500"
            onMouseDown={handleDividerMouseDown}
          />
          <div className="relative flex-1 bg-white dark:bg-gray-900">
            <SyncIndicator state={previewSyncState} />
            {currentPreviewUrl ? (
              <iframe
                ref={iframeRef}
                src={currentPreviewUrl}
                className="size-full border-none transition-opacity duration-300"
                style={{
                  opacity:
                    previewSyncState === 'ssr-pending'
                      ? 0.85
                      : previewSyncState === 'typing'
                        ? 0.92
                        : 1,
                  pointerEvents: isDragging ? 'none' : 'auto',
                }}
              />
            ) : (
              <div className="flex-center absolute inset-0 flex-col space-y-4 p-8 text-center text-gray-400">
                <Eye size={48} aria-hidden="true" />
                <h3>預覽準備就緒</h3>
                <p className="mt-2 text-sm">請輸入標題或內容自動保存為草稿以加載預覽</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Editor;
