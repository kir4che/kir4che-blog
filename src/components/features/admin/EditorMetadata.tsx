import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { TaxonomyItem } from '@/types';
import { cn } from '@/utils/cn';

interface EditorMetadataProps {
  isEditing: boolean;
  defaultDate: string;
  initialSlug: string;
  initialLang: string;
  initialCoverImage: string;
  initialDescription: string;
  initialCategories: string[];
  initialTags: string[];
  initialFeatured: boolean;
  initialShowUpdatedAt: boolean;
  initialProtected: boolean;
  updatedAtText: string;
  allCategories: TaxonomyItem[];
  allTags: TaxonomyItem[];
}

const TaxonomyChip = ({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    className={cn(
      'cursor-pointer rounded border px-1.5 py-0.5 text-xs transition-colors',
      selected ? 'border-primary text-primary' : 'border-gray-300 text-gray-400'
    )}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
  >
    {label}
  </button>
);

// 處理分類、標籤的輸入
const parseCommaSeparated = (value: string) =>
  value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const EditorMetadata = ({
  isEditing,
  defaultDate,
  initialSlug,
  initialLang,
  initialCoverImage,
  initialDescription,
  initialCategories,
  initialTags,
  initialFeatured,
  initialShowUpdatedAt,
  initialProtected,
  updatedAtText,
  allCategories,
  allTags,
}: EditorMetadataProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState(initialCoverImage);
  const [description, setDescription] = useState(initialDescription);
  const [slug, setSlug] = useState(initialSlug);
  const [lang, setLang] = useState(initialLang);
  const [date, setDate] = useState(defaultDate);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [featured, setFeatured] = useState(initialFeatured);
  const [showUpdatedAt, setShowUpdatedAt] = useState(initialShowUpdatedAt);
  const [isProtected, setIsProtected] = useState(initialProtected);
  const [focusedField, setFocusedField] = useState<'categories' | 'tags' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 切換分類/標籤的選中狀態
  const toggleChip = useCallback((type: 'categories' | 'tags', chipSlug: string) => {
    const setter = type === 'categories' ? setCategories : setTags;
    setter((prev) =>
      prev.includes(chipSlug) ? prev.filter((s) => s !== chipSlug) : [...prev, chipSlug]
    );
  }, []);

  // 點擊外部區域時關閉 dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        className="btn btn-sm bg-surface-secondary text-primary border-primary text-nowrap"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((o) => !o);
        }}
        aria-controls="metadata-panel"
        aria-expanded={isOpen}
      >
        文章設定
      </button>
      <input type="hidden" name="slug" value={slug} />
      {!isEditing && <input type="hidden" name="lang" value={lang} />}
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="coverImage" value={coverUrl} />
      <input type="hidden" name="categories" value={categories.join(', ')} />
      <input type="hidden" name="tags" value={tags.join(', ')} />
      {featured && <input type="hidden" name="featured" value="on" />}
      {showUpdatedAt && <input type="hidden" name="showUpdatedAt" value="on" />}
      {isProtected && <input type="hidden" name="protected" value="on" />}
      <div
        id="metadata-panel"
        className={cn(
          'bg-surface-secondary absolute right-0 z-50 mt-2 w-80 flex-col rounded p-4 pt-2 shadow-md',
          isOpen ? 'flex' : 'hidden'
        )}
        aria-hidden={!isOpen}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between gap-3">
          <fieldset className="fieldset flex-1">
            <legend className="fieldset-legend">slug</legend>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input input-sm w-full border"
              placeholder="留空將自動生成"
              disabled={isEditing}
            />
          </fieldset>
          {!isEditing && (
            <fieldset className="fieldset">
              <legend className="fieldset-legend">
                語言 <span className="text-red-500">*</span>
              </legend>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                required
                className="w-fit border px-2 py-1.5"
              >
                <option value="" disabled>
                  請選擇語言
                </option>
                <option value="tw">繁體中文</option>
                <option value="en">English</option>
              </select>
            </fieldset>
          )}
        </div>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">發布時間</legend>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input input-sm w-full border"
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">封面圖片</legend>
          {coverUrl && (
            <div className="relative mb-1.5">
              <img src={coverUrl} alt="封面預覽" className="h-24 w-full rounded object-cover" />
              <button
                type="button"
                className="btn btn-xs btn-link text-surface-secondary absolute top-1 right-1"
                onClick={() => setCoverUrl('')}
              >
                <X size={14} aria-label="移除封面" aria-hidden="true" />
              </button>
            </div>
          )}
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="input input-sm w-full border"
            placeholder="填寫圖片 URL 或留空"
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">文章簡介</legend>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="建議中文 60 - 150 字，英文 120 - 300 字之間。"
            className="textarea textarea-sm h-20 w-full border"
          />
        </fieldset>
        <div className="flex flex-col gap-2">
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs">分類</legend>
            <input
              type="text"
              value={categories.join(', ')}
              onChange={(e) => setCategories(parseCommaSeparated(e.target.value))}
              onFocus={() => setFocusedField('categories')}
              onBlur={() => setFocusedField(null)}
              className="input input-sm w-full border"
              placeholder="Tech, Life"
            />
            <div
              className={cn(
                'max-h-24 flex-wrap gap-1 overflow-y-auto pt-1.5',
                focusedField === 'categories' ? 'flex' : 'hidden'
              )}
            >
              {allCategories.map((cat) => (
                <TaxonomyChip
                  key={cat.slug}
                  label={cat.label}
                  selected={categories.includes(cat.slug)}
                  onClick={() => toggleChip('categories', cat.slug)}
                />
              ))}
            </div>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-xs">標籤</legend>
            <input
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(parseCommaSeparated(e.target.value))}
              onFocus={() => setFocusedField('tags')}
              onBlur={() => setFocusedField(null)}
              className="input input-sm w-full border"
              placeholder="astro, react"
            />
            <div
              className={cn(
                'max-h-24 flex-wrap gap-1 overflow-y-auto pt-1.5',
                focusedField === 'tags' ? 'flex' : 'hidden'
              )}
            >
              {allTags.map((tag) => (
                <TaxonomyChip
                  key={tag.slug}
                  label={tag.label}
                  selected={tags.includes(tag.slug)}
                  onClick={() => toggleChip('tags', tag.slug)}
                />
              ))}
            </div>
          </fieldset>
        </div>
        <div className="flex flex-col gap-3 pt-4">
          <label className="flex w-max items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="checkbox checkbox-xs"
            />
            精選文章
          </label>
          <div className="flex items-center">
            <label className="flex w-max items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showUpdatedAt}
                onChange={(e) => setShowUpdatedAt(e.target.checked)}
                className="checkbox checkbox-xs"
              />
              顯示更新時間
            </label>
            {showUpdatedAt && (
              <p className="text-xs text-gray-500">（{updatedAtText || '儲存後自動設定'}）</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex w-max items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                className="checkbox checkbox-xs"
              />
              密碼保護
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorMetadata;
