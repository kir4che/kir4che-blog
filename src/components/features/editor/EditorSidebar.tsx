import {
  CalendarClock,
  FilePlus2,
  FolderPlus,
  Plus,
  Save,
  Settings2,
  Tags,
} from 'lucide-react';

import type {
  Language,
  CategoryNode,
  PostListItem,
  TagNode,
  TaxonomyState,
} from '@/types';
import { convertToSlug } from '@/lib/tags';
import { cn } from '@/lib/style';
import InputField from '@/components/ui/InputField';

interface EditorSidebarProps {
  posts: PostListItem[];
  activeSlug: string | null;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onReset: () => void;
  onSelectPost: (slug: string) => void | Promise<void>;
  selectedLang: Language;
  onLangChange: (lang: Language) => void;
  taxonomy: TaxonomyState;
  taxonomyDirty: boolean;
  onAddCategory: (parentSlug?: string) => void;
  onUpdateCategory: (
    slug: string,
    updater: (category: CategoryNode) => CategoryNode,
    parentSlug?: string
  ) => void;
  onAddTag: () => void;
  onUpdateTag: (slug: string, updater: (tag: TagNode) => TagNode) => void;
  onPersistTaxonomy: () => void;
  isSavingTaxonomy: boolean;
  collapsed: boolean;
}

const EditorSidebar = ({
  posts,
  activeSlug,
  searchTerm,
  onSearchTermChange,
  onReset,
  onSelectPost,
  selectedLang,
  onLangChange,
  taxonomy,
  taxonomyDirty,
  onAddCategory,
  onUpdateCategory,
  onAddTag,
  onUpdateTag,
  onPersistTaxonomy,
  isSavingTaxonomy,
  collapsed,
}: EditorSidebarProps) => (
  <aside
    className={cn(
      'border-text-gray-lighter relative flex h-full transform-gpu flex-col rounded-xl border bg-white p-4 transition-[max-height,transform,opacity,width] duration-200 ease-in-out',
      collapsed
        ? 'pointer-events-none max-h-0 -translate-y-3 overflow-hidden border-transparent p-0 opacity-0 md:w-0 md:-translate-y-2 md:border-transparent md:p-0 md:opacity-0'
        : 'md:w-80'
    )}
    aria-hidden={collapsed}
  >
    <div className='flex h-full flex-col gap-6'>
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='flex items-center gap-2 text-base'>
            <CalendarClock size={16} className='text-pink-600' />
            文章列表
          </h3>
          <select
            value={selectedLang}
            onChange={(e) => onLangChange(e.target.value as Language)}
            className='rounded-full border border-pink-100 bg-white p-1 text-[11px] font-semibold text-pink-700'
          >
            <option value='tw'>繁中</option>
            <option value='en'>English</option>
          </select>
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            onClick={onReset}
            aria-label='建立新文章'
            className='border-text-gray-lighter flex-center flex gap-2 rounded border border-dashed px-3 py-2 hover:border-pink-600 hover:text-pink-700'
          >
            <FilePlus2 size={16} />
            <span className='sr-only'>建立新文章</span>
          </button>
          <InputField
            value={searchTerm}
            onChange={onSearchTermChange}
            placeholder='以標題或 slug 搜尋'
            className='rounded border text-xs'
          />
        </div>
        <div className='border-text-gray-lighter/60 max-h-40 overflow-y-auto rounded border bg-white/80 md:max-h-60'>
          <div className='divide-text-gray-lighter/50 divide-y'>
            {posts.map((post) => (
              <button
                key={post.slug}
                type='button'
                onClick={() => onSelectPost(post.slug)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-xs',
                  activeSlug === post.slug && 'font-semibold text-pink-700'
                )}
              >
                <span
                  className={cn('truncate', post.draft && 'text-text-gray')}
                >
                  {post.title || post.slug}
                </span>
              </button>
            ))}
          </div>
          {posts.length === 0 && (
            <p className='text-text-gray px-3 py-2 text-xs'>目前沒有文章</p>
          )}
        </div>
      </section>
      <section className='space-y-3'>
        <div className='flex items-center justify-between text-base font-semibold'>
          <h3 className='flex items-center gap-2 text-base'>
            <Settings2 size={16} className='text-pink-600' />
            分類 / 標籤管理
          </h3>
          {taxonomyDirty && (
            <button
              type='button'
              onClick={onPersistTaxonomy}
              disabled={!taxonomyDirty || isSavingTaxonomy}
              className='flex-center disabled:bg-text-gray-light gap-1 rounded bg-pink-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-pink-700'
            >
              <Save size={14} />
              儲存
            </button>
          )}
        </div>
        <div className='flex-1 space-y-4'>
          <section className='space-y-2'>
            <div className='flex items-center justify-between text-sm font-medium'>
              <h4 className='flex items-center gap-1.5 text-sm'>
                <FolderPlus size={16} className='text-pink-600' />
                分類
              </h4>
              <button
                type='button'
                onClick={() => onAddCategory()}
                aria-label='新增分類'
                className='rounded-full border p-0.5 text-pink-600 hover:bg-pink-600 hover:text-white'
              >
                <Plus size={12} />
                <span className='sr-only'>新增分類</span>
              </button>
            </div>
            <div className='max-h-40 space-y-2 overflow-y-auto md:max-h-80'>
              {taxonomy.categories.map((cat) => (
                <div
                  key={cat.slug}
                  className='border-text-gray-lighter rounded border p-3'
                >
                  <div className='flex items-center gap-2'>
                    <input
                      value={cat.name.tw}
                      onChange={(e) =>
                        onUpdateCategory(cat.slug, (prev) => ({
                          ...prev,
                          name: {
                            ...prev.name,
                            tw: e.target.value,
                            en: e.target.value,
                          },
                        }))
                      }
                      className='border-text-gray-lighter flex-1 rounded border px-2 py-1 text-xs'
                    />
                    <input
                      type='color'
                      value={cat.color.light}
                      onChange={(e) =>
                        onUpdateCategory(cat.slug, (prev) => ({
                          ...prev,
                          color: { ...prev.color, light: e.target.value },
                        }))
                      }
                      className='h-8 w-10 rounded'
                    />
                  </div>
                  {cat.subcategories?.length ? (
                    <div className='border-text-gray-lighter mt-2 space-y-1 border-t border-dashed pt-2'>
                      {cat.subcategories.map((sub) => (
                        <div key={sub.slug} className='flex items-center gap-2'>
                          <input
                            value={sub.name.tw}
                            onChange={(e) =>
                              onUpdateCategory(
                                sub.slug,
                                (prev) => ({
                                  ...prev,
                                  name: {
                                    ...prev.name,
                                    tw: e.target.value,
                                    en: e.target.value,
                                  },
                                }),
                                cat.slug
                              )
                            }
                            className='border-text-gray-lighter flex-1 rounded border px-2 py-1 text-xs'
                          />
                          <input
                            type='color'
                            value={sub.color.light}
                            onChange={(e) =>
                              onUpdateCategory(
                                sub.slug,
                                (prev) => ({
                                  ...prev,
                                  color: {
                                    ...prev.color,
                                    light: e.target.value,
                                  },
                                }),
                                cat.slug
                              )
                            }
                            className='h-8 w-10 rounded'
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <button
                    type='button'
                    onClick={() => onAddCategory(cat.slug)}
                    className='mt-2 ml-auto flex items-center gap-1 text-xs text-pink-600 hover:text-pink-800'
                    aria-label='新增子分類'
                  >
                    <Plus size={12} />
                    新增子分類
                  </button>
                </div>
              ))}
            </div>
          </section>
          <section className='space-y-2'>
            <div className='flex items-center justify-between text-sm font-medium'>
              <h4 className='flex items-center gap-1.5 text-sm'>
                <Tags size={16} className='text-pink-600' />
                標籤
              </h4>
              <button
                type='button'
                onClick={onAddTag}
                aria-label='新增標籤'
                className='rounded-full border p-0.5 text-pink-600 hover:bg-pink-600 hover:text-white'
              >
                <Plus size={12} />
                <span className='sr-only'>新增標籤</span>
              </button>
            </div>
            <div className='max-h-40 space-y-2 overflow-y-auto md:max-h-60'>
              {taxonomy.tags.map((tag) => (
                <div key={tag.slug} className='flex items-center gap-2'>
                  <input
                    value={tag.name.tw}
                    onChange={(e) =>
                      onUpdateTag(tag.slug, (prev) => ({
                        ...prev,
                        name: {
                          ...prev.name,
                          tw: e.target.value,
                          en: e.target.value,
                        },
                      }))
                    }
                    className='border-text-gray-lighter flex-1 rounded border px-2 py-1 text-xs'
                  />
                  <input
                    value={tag.slug}
                    onChange={(e) =>
                      onUpdateTag(tag.slug, (prev) => ({
                        ...prev,
                        slug: convertToSlug(e.target.value),
                      }))
                    }
                    className='border-text-gray-lighter rounded border px-2 py-1 text-xs'
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  </aside>
);

export default EditorSidebar;
