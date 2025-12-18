import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

import type { EditorFormState, FlatCategory, TagNode } from '@/types';
import InputField from '@/components/ui/InputField';
import Checkbox from '@/components/ui/Checkbox';
import { convertToSlug } from '@/lib/tags';

interface EditorFormCardProps {
  form: EditorFormState;
  tags: TagNode[];
  flatCategories: FlatCategory[];
  setForm: Dispatch<SetStateAction<EditorFormState>>;
  onToggleCategory: (slug: string) => void;
  onAddTag: (value: string) => void;
  onRemoveTag: (value: string) => void;
  coverPreview: string | null;
  onCoverChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
}

const EditorFormCard = ({
  form,
  tags,
  flatCategories,
  setForm,
  onToggleCategory,
  onAddTag,
  onRemoveTag,
  coverPreview,
  onCoverChange,
  onRemoveCover,
}: EditorFormCardProps) => {
  const [passwordEnabled, setPasswordEnabled] = useState(
    Boolean(form.password)
  );

  useEffect(() => {
    setPasswordEnabled(Boolean(form.password));
  }, [form.password]);

  return (
    <div className='border-text-gray-lighter/60 bg-bg-secondary/80 space-y-3 rounded-xl border p-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-[1.2fr_0.8fr] sm:items-stretch lg:gap-6'>
        <div className='space-y-3'>
          <div className='space-y-1'>
            <label className='block text-sm font-medium'>標題</label>
            <InputField
              className='text-sm'
              value={form.title}
              onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
            />
          </div>
          <div className='space-y-1'>
            <label className='block text-sm font-medium'>URL slug</label>
            <InputField
              className='text-sm'
              value={form.slug}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  slug: convertToSlug(v),
                }))
              }
            />
          </div>
        </div>
        <div className='flex flex-col space-y-1 sm:h-full'>
          <label className='block text-sm font-medium'>文章簡介</label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
            className='border-text-gray-lighter w-full flex-1 rounded-md border-[0.75px] p-2 text-sm outline-none focus:ring-2 focus:ring-pink-600 focus:outline-none sm:h-full'
          />
        </div>
      </div>
      <div className='flex gap-4 max-md:flex-col'>
        <select
          defaultValue=''
          onChange={(e) => {
            const { value } = e.currentTarget;
            if (!value) return;
            onToggleCategory(value);
            e.currentTarget.value = '';
          }}
          className='border-text-gray-lighter w-full rounded-md border-[0.75px] p-2 text-sm outline-none focus:ring-2 focus:ring-pink-600'
        >
          <option value='' disabled>
            選擇分類...
          </option>
          {flatCategories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.isParent ? cat.name : `- ${cat.name}`}
            </option>
          ))}
        </select>
        <div className='flex flex-wrap items-center gap-2 text-sm'>
          <label className='flex items-center gap-2'>
            <Checkbox
              id='draft'
              checked={form.draft}
              onChange={(v) => setForm((prev) => ({ ...prev, draft: v }))}
            />
            草稿
          </label>
          <label className='flex items-center gap-2'>
            <Checkbox
              id='featured'
              checked={form.featured}
              onChange={(v) => setForm((prev) => ({ ...prev, featured: v }))}
            />
            精選文章
          </label>
          <label className='flex items-center gap-2'>
            <Checkbox
              id='password-toggle'
              checked={passwordEnabled}
              onChange={(checked) => {
                setPasswordEnabled(checked);
                if (!checked) {
                  setForm((prev) => ({ ...prev, password: '' }));
                } else if (form.password === undefined) {
                  setForm((prev) => ({ ...prev, password: '' }));
                }
              }}
            />
            密碼
            {passwordEnabled && (
              <div className='w-32'>
                <InputField
                  type='password'
                  value={form.password}
                  onChange={(v) =>
                    setForm((prev) => ({ ...prev, password: v }))
                  }
                  className='rounded p-1 text-xs'
                />
              </div>
            )}
          </label>
        </div>
      </div>
      {form.categories.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {form.categories.map((slug) => {
            const cat = flatCategories.find((item) => item.slug === slug);
            return (
              <span
                key={slug}
                className='flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-sm text-pink-700'
              >
                {cat?.name ?? slug}
                <button
                  type='button'
                  aria-label='移除分類'
                  className='text-pink-700 hover:text-pink-900'
                  onClick={() => onToggleCategory(slug)}
                >
                  <X className='h-3 w-3' />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className='space-y-1'>
        <label className='block text-sm font-medium'>封面圖片</label>
        <InputField
          className='text-sm'
          type='file'
          accept='image/*'
          onChange={onCoverChange}
        />
      </div>
      {coverPreview && (
        <div className='border-text-gray-lighter/70 relative mt-2 h-48 w-full overflow-hidden rounded-md border'>
          <Image
            src={coverPreview}
            alt='Cover preview'
            fill
            className='object-cover'
          />
          <button
            type='button'
            onClick={onRemoveCover}
            className='flex-center absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white'
            aria-label='移除封面'
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className='space-y-1'>
        <label className='block text-sm font-medium'>標籤</label>
        <div className='border-text-gray-lighter/70 flex flex-wrap items-center gap-1.5 rounded border p-1.5'>
          {form.tags.map((tag) => (
            <span
              key={tag}
              className='flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-sm text-pink-700'
            >
              {tag}
              <button
                type='button'
                onClick={() => onRemoveTag(tag)}
                aria-label='移除標籤'
                className='text-pink-700 hover:text-pink-900'
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            className='min-w-28 flex-1 bg-transparent text-sm outline-none'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAddTag((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            list='tag-options'
          />
          <datalist id='tag-options'>
            {tags.map((tag) => (
              <option key={tag.slug} value={tag.name.tw} />
            ))}
          </datalist>
        </div>
      </div>
    </div>
  );
};

export default EditorFormCard;
