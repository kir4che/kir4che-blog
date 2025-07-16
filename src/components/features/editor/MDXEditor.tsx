'use client';

import { useState, useRef, useEffect } from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Bold,
  Italic,
  Code,
  CodeXml,
  List,
  ListOrdered,
  Link,
  FileImage,
  Image,
  Images,
  Film,
  Quote,
  Ellipsis,
  Table,
  ListCollapse,
  Highlighter,
  SpellCheck,
  Star,
  Command,
  Route,
  Eye,
  Pencil,
} from 'lucide-react';

import { useMDXComponents } from '@/hooks/useMDXComponents';
import { useAlert } from '@/contexts/AlertContext';
import { mdxActions } from '@/config/mdxActions';
import type { MDXActionKey } from '@/config/mdxActions';

interface MDXEditorProps {
  t: (key: string) => string;
  content: string;
  slug: string;
  onChange: (content: string) => void;
}

const MDXEditor = ({ t, content, slug, onChange }: MDXEditorProps) => {
  const { showError } = useAlert();
  const mdxComponents = useMDXComponents();

  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(
    null
  );
  const [isPreview, setIsPreview] = useState(false); // 預覽模式
  const [isLoading, setIsLoading] = useState(false); // 編譯中
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 當 content 或 isPreview 改變時，編譯 MDX 後再顯示。
  useEffect(() => {
    if (!isPreview || !content.trim()) {
      setMdxSource(null);
      return;
    }

    setIsLoading(true);
    serialize(content)
      .then((compiled) => setMdxSource(compiled))
      .catch(() => {
        showError(t('content.preview.error'));
        setMdxSource(null);
      })
      .finally(() => setIsLoading(false));
  }, [t, content, isPreview, showError]);

  // 插入文字
  const insertText = (
    before: string,
    after: string = '',
    afterInsert?: () => void
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart; // 選取的起始位置 index
    const end = textarea.selectionEnd; // 選取結束的位置後一個 index (non-inclusive)
    const selectedText = content.substring(start, end); // 選取的文字

    const newText =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    onChange(newText); // 更新內容

    // 讓游標重新插入在 after 後的位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPosition =
        start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      afterInsert?.(); // 執行插入後的 callback
    }, 0);
  };

  // 負責插入大部分簡單標記
  const handleInsert = (key: MDXActionKey) => {
    const action = mdxActions[key];
    insertText(action.before, action.after ?? '');
  };

  const insertHeading = (level: number) =>
    insertText('#'.repeat(level) + ' ', ' || ||');

  const insertPostPath = () => {
    if (slug) insertText(`/posts/${slug}/`);
    else alert('請先輸入 slug 才能產生文章路徑！');
  };

  const headingBtns = [
    { level: 1, icon: <Heading1 size={20} />, label: 'Heading 1' },
    { level: 2, icon: <Heading2 size={20} />, label: 'Heading 2' },
    { level: 3, icon: <Heading3 size={20} />, label: 'Heading 3' },
    { level: 4, icon: <Heading4 size={20} />, label: 'Heading 4' },
    { level: 5, icon: <Heading5 size={20} />, label: 'Heading 5' },
    { level: 6, icon: <Heading6 size={20} />, label: 'Heading 6' },
  ];

  const basicMarkBtns = [
    { key: 'bold', icon: <Bold size={18} />, label: 'Bold' },
    { key: 'italic', icon: <Italic size={18} />, label: 'Italic' },
    { key: 'inlineCode', icon: <Code size={18} />, label: 'Inline Code' },
    { key: 'codeBlock', icon: <CodeXml size={18} />, label: 'Code Block' },
    { key: 'list', icon: <List size={18} />, label: 'Unordered List' },
    {
      key: 'orderedList',
      icon: <ListOrdered size={18} />,
      label: 'Ordered List',
    },
    { key: 'link', icon: <Link size={18} />, label: 'Link' },
  ];

  const mediaButtons = [
    { key: 'mdImage', icon: <FileImage size={18} />, label: 'Markdown Image' },
    // eslint-disable-next-line jsx-a11y/alt-text
    { key: 'imageTag', icon: <Image size={18} />, label: 'Image Tag' },
    { key: 'imageGallery', icon: <Images size={18} />, label: 'Image Gallery' },
    { key: 'video', icon: <Film size={18} />, label: 'Video' },
    { key: 'blockquote', icon: <Quote size={18} />, label: 'Blockquote' },
    { key: 'hr', icon: <Ellipsis size={18} />, label: 'Horizontal Rule' },
  ];

  const advancedButtons = [
    { key: 'table', icon: <Table size={18} />, label: 'Table' },
    { key: 'accordion', icon: <ListCollapse size={18} />, label: 'Accordion' },
    { key: 'highlight', icon: <Highlighter size={18} />, label: 'Highlight' },
    { key: 'correction', icon: <SpellCheck size={18} />, label: 'Correction' },
    { key: 'rating', icon: <Star size={18} />, label: 'Rating' },
    { key: 'keyboard', icon: <Command size={18} />, label: 'Keyboard' },
  ];

  return (
    <div className='flex h-[600px] flex-col'>
      <div className='dark:border-text-gray dark:bg-text-gray-dark flex flex-wrap items-center gap-3 border-b border-gray-200 bg-gray-50 p-3'>
        <div className='flex items-center gap-x-2'>
          {headingBtns.map(({ level, icon, label }) => (
            <button
              type='button'
              key={level}
              onClick={() => insertHeading(level)}
              className='hover:text-pink-600'
              title={label}
              aria-label={`Insert heading level ${level}`}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className='bg-text-gray-lighter dark:bg-text-gray h-5 w-px' />
        <div className='flex flex-wrap items-center gap-x-2'>
          {basicMarkBtns.map(({ key, icon, label }) => (
            <button
              type='button'
              key={key}
              onClick={() => handleInsert(key as keyof typeof mdxActions)}
              className='hover:text-pink-600'
              title={label}
              aria-label={`Insert ${label}`}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className='bg-text-gray-lighter dark:bg-text-gray h-5 w-px' />
        <div className='flex flex-wrap items-center gap-x-2'>
          {mediaButtons.map(({ key, icon, label }) => (
            <button
              type='button'
              key={key}
              onClick={() => handleInsert(key as keyof typeof mdxActions)}
              className='hover:text-pink-600'
              title={label}
              aria-label={`Insert ${label}`}
            >
              {icon}
            </button>
          ))}
        </div>
        <div className='bg-text-gray-lighter dark:bg-text-gray h-5 w-px' />
        <div className='flex flex-wrap items-center gap-x-2'>
          {advancedButtons.map(({ key, icon, label }) => (
            <button
              type='button'
              key={key}
              onClick={() => handleInsert(key as keyof typeof mdxActions)}
              className='hover:text-pink-600'
              title={label}
              aria-label={`Insert ${label}`}
            >
              {icon}
            </button>
          ))}
        </div>
        {/* 編輯 / 預覽切換按鈕 */}
        <div className='ml-auto flex items-center gap-x-3'>
          <button
            onClick={() => setIsPreview(false)}
            className={!isPreview ? 'text-pink-600' : 'hover:text-pink-600'}
            title='Edit mode'
            aria-label='Switch to edit mode'
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => setIsPreview(true)}
            className={isPreview ? 'text-pink-600' : 'hover:text-pink-600'}
            title='Preview mode'
            aria-label='Switch to preview mode'
          >
            <Eye size={18} />
          </button>
          <button
            onClick={insertPostPath}
            className='hover:text-pink-600'
            title='Insert post path'
            aria-label='Insert post path'
          >
            <Route size={18} />
          </button>
        </div>
      </div>
      {/* 編輯 / 預覽區域 */}
      <div className='bg-bg-secondary relative flex-1'>
        {!isPreview ? (
          // 編輯模式
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('content.edit.placeholder')}
            className='text-text-primary h-full w-full resize-none p-4 outline-none'
          />
        ) : (
          // 預覽模式
          <div
            className={`text-text-gray dark:text-text-gray-light h-full ${!isLoading && mdxSource ? 'overflow-auto px-4' : 'flex items-center justify-center'}`}
          >
            {isLoading ? (
              <p>{t('content.preview.compiling')}</p>
            ) : mdxSource ? (
              <MDXRemote {...mdxSource} components={mdxComponents} />
            ) : (
              <p>
                {content.trim()
                  ? t('content.preview.error')
                  : t('content.preview.empty')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MDXEditor;
