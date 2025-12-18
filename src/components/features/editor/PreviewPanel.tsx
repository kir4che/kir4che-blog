import type { Dispatch, SetStateAction } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import type { MDXComponents } from 'mdx/types';
import { FilePenLine } from 'lucide-react';
import { NextIntlClientProvider } from 'next-intl';

import type { EditorFormState, Language } from '@/types';
import { cn } from '@/lib/style';
import MDXEditor from '@/components/features/editor/MDXEditor';
import postStyles from '@/components/features/post/PostLayout.module.css';

const EMPTY_INTL_MESSAGES: Record<string, never> = {};

interface PreviewPanelProps {
  form: EditorFormState;
  showPreview: boolean;
  onToggle: (visible: boolean) => void;
  previewSource: MDXRemoteSerializeResult | null;
  previewLoading: boolean;
  mdxComponents: MDXComponents;
  isSaving: boolean;
  setForm: Dispatch<SetStateAction<EditorFormState>>;
  locale: Language;
}

const PreviewPanel = ({
  form,
  showPreview,
  onToggle,
  previewSource,
  previewLoading,
  mdxComponents,
  isSaving,
  setForm,
  locale,
}: PreviewPanelProps) => (
  <>
    {showPreview ? (
      <div className='border-text-gray-lighter relative max-h-160 overflow-y-auto rounded-xl border bg-white p-3'>
        <button
          type='button'
          onClick={() => onToggle(false)}
          className={cn(
            'absolute top-5 right-10 rounded-full bg-white p-1.5 shadow hover:text-pink-700',
            previewLoading || !previewSource ? 'hidden' : 'block'
          )}
          aria-label='切換到編輯模式'
        >
          <FilePenLine size={16} />
        </button>
        <div
          className={cn('h-full overflow-y-auto', postStyles.articleContent)}
        >
          {previewLoading ? (
            <p className='flex-center text-text-gray h-full min-h-60 text-sm'>
              預覽載入中...
            </p>
          ) : previewSource ? (
            <NextIntlClientProvider
              locale={locale}
              messages={EMPTY_INTL_MESSAGES}
            >
              <MDXRemote {...previewSource} components={mdxComponents} />
            </NextIntlClientProvider>
          ) : (
            <p className='flex-center text-text-gray h-full text-sm'>
              尚未生成預覽
            </p>
          )}
        </div>
      </div>
    ) : (
      <MDXEditor
        content={form.content}
        slug={form.slug}
        isSaving={isSaving}
        onChange={(val) => setForm((prev) => ({ ...prev, content: val }))}
        onOpenPreview={() => onToggle(true)}
      />
    )}
  </>
);

export default PreviewPanel;
