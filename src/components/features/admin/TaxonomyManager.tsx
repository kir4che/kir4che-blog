import { ChevronDown, ChevronRight, Download, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Category, Language, TaxonomyBase as Tag } from '@/types';
import { cn } from '@/utils/cn';
import { showToast } from '@/utils/toast';

interface TaxonomyManagerProps {
  initialCategories: Record<string, Category>;
  initialTags: Record<string, Tag>;
}

const ColorDot = ({ light, dark }: { light: string; dark: string }) => (
  <span
    className="inline-block size-4 shrink-0 rounded-full border border-gray-300"
    style={{ background: `linear-gradient(135deg, ${light} 50%, ${dark} 50%)` }}
    title={`light: ${light} / dark: ${dark}`}
  />
);

const InputField = ({
  label,
  className,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="flex flex-col gap-0.5">
    <span className="text-xs text-gray-500">{label}</span>
    <input {...props} className={cn('input input-xs border', className)} />
  </label>
);

const matchSearch = (
  slug: string,
  item: { name: Partial<Record<Language, string>> },
  query: string
) => {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    slug.toLowerCase().includes(q) ||
    (item.name.tw || '').toLowerCase().includes(q) ||
    (item.name.en || '').toLowerCase().includes(q)
  );
};

const CategoryForm = ({
  initialSlug,
  initialData,
  isSub,
  parentSlug,
  onCancel,
  categories,
  setCategories,
  setEditingId,
}: {
  initialSlug: string;
  initialData: Category;
  isSub: boolean;
  parentSlug?: string;
  onCancel: () => void;
  categories: Record<string, Category>;
  setCategories: (cats: Record<string, Category>) => void;
  setEditingId: (id: string | null) => void;
}) => {
  const isNew = !initialSlug;
  const [slug, setSlug] = useState(initialSlug);
  const [nameTw, setNameTw] = useState(initialData.name.tw || '');
  const [nameEn, setNameEn] = useState(initialData.name.en || '');
  const [colorLight, setColorLight] = useState(initialData.color?.light || '#cccccc');
  const [colorDark, setColorDark] = useState(initialData.color?.dark || '#666666');

  const handleSave = () => {
    const newSlug = slug.trim();
    if (!newSlug) return showToast('slug 不可為空！');

    const updated: Category = {
      name: { tw: nameTw.trim(), en: nameEn.trim() },
      slug: newSlug,
      color: { light: colorLight, dark: colorDark },
    };

    const nextCats = { ...categories };

    if (isSub && parentSlug) {
      const parent = { ...nextCats[parentSlug] };
      parent.subcategories = { ...parent.subcategories };
      if (initialSlug && initialSlug !== newSlug) delete parent.subcategories[initialSlug];
      parent.subcategories[newSlug] = updated;
      nextCats[parentSlug] = parent;
    } else {
      if (!isNew && nextCats[initialSlug])
        updated.subcategories = nextCats[initialSlug].subcategories;
      if (initialSlug && initialSlug !== newSlug) delete nextCats[initialSlug];
      nextCats[newSlug] = updated;
    }

    setCategories(nextCats);
    setEditingId(null);
  };

  return (
    <div
      className={cn(
        'border-primary/30 space-y-2 rounded border-2 px-3 py-3 text-sm',
        isSub && 'ml-6'
      )}
    >
      <div className="flex flex-wrap items-end gap-2">
        <InputField
          label="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={!isNew}
          className="w-28 font-mono"
        />
        <InputField
          label="名稱 (tw)"
          value={nameTw}
          onChange={(e) => setNameTw(e.target.value)}
          className="w-24"
        />
        <InputField
          label="名稱 (en)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-24"
        />
        <InputField
          label="色碼 (light)"
          type="color"
          value={colorLight}
          onChange={(e) => setColorLight(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded p-0.5"
        />
        <InputField
          label="色碼 (dark)"
          type="color"
          value={colorDark}
          onChange={(e) => setColorDark(e.target.value)}
          className="h-7 w-10 cursor-pointer rounded bg-gray-900 p-0.5"
        />
      </div>
      <div className="flex gap-2">
        <button onClick={handleSave} className="btn btn-xs bg-primary text-surface-secondary">
          儲存
        </button>
        <button onClick={onCancel} className="btn btn-xs btn-ghost">
          取消
        </button>
      </div>
    </div>
  );
};

const TagForm = ({
  initialSlug,
  initialData,
  onCancel,
  tags,
  setTags,
  setEditingId,
}: {
  initialSlug: string;
  initialData: Tag;
  onCancel: () => void;
  tags: Record<string, Tag>;
  setTags: (tags: Record<string, Tag>) => void;
  setEditingId: (id: string | null) => void;
}) => {
  const isNew = !initialSlug;
  const [slug, setSlug] = useState(initialSlug);
  const [nameTw, setNameTw] = useState(initialData.name.tw || '');
  const [nameEn, setNameEn] = useState(initialData.name.en || '');

  const handleSave = () => {
    const newSlug = slug.trim();
    if (!newSlug) return showToast('slug 不可為空！');
    const nextTags = { ...tags };
    if (initialSlug && initialSlug !== newSlug) delete nextTags[initialSlug];
    nextTags[newSlug] = { name: { tw: nameTw.trim(), en: nameEn.trim() }, slug: newSlug };
    setTags(nextTags);
    setEditingId(null);
  };

  return (
    <div className="border-primary/30 mb-1.5 w-full rounded border-2 px-3 py-3 text-sm">
      <div className="flex flex-wrap items-end gap-2">
        <InputField
          label="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={!isNew}
          className="w-28 font-mono"
        />
        <InputField
          label="名稱 (tw)"
          value={nameTw}
          onChange={(e) => setNameTw(e.target.value)}
          className="w-24"
        />
        <InputField
          label="名稱 (en)"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          className="w-24"
        />
        <button onClick={handleSave} className="btn btn-xs bg-primary text-surface-secondary h-7">
          儲存
        </button>
        <button onClick={onCancel} className="btn btn-xs btn-ghost h-7">
          取消
        </button>
      </div>
    </div>
  );
};

const TaxonomyManager = ({ initialCategories, initialTags }: TaxonomyManagerProps) => {
  const [categories, setCategories] = useState<Record<string, Category>>(initialCategories);
  const [tags, setTags] = useState<Record<string, Tag>>(initialTags);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [confirmState, setConfirmState] = useState<null | {
    message: string;
    onConfirm: () => void;
  }>(null);

  // 輸入分類搜尋時，自動把「包含符合結果的父分類」展開，避免找不到子分類。
  useEffect(() => {
    if (!catSearch) return;
    setExpandedCats((prev) => {
      const next = new Set(prev);
      Object.entries(categories).forEach(([slug, cat]) => {
        const subs = cat.subcategories ? Object.entries(cat.subcategories) : [];
        // 如果子分類有任何符合搜尋 → 展開父分類
        if (subs.some(([s, sub]) => matchSearch(s, sub, catSearch))) next.add(slug);
      });
      return next;
    });
  }, [catSearch, categories]);

  // 控制分類展開狀態
  const toggleExpand = useCallback((slug: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      // 有就刪掉（收合），沒就加入（展開）。
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }, []);

  const requestConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmState({ message, onConfirm });
  }, []);

  // 刪除分類（含主分類 / 子分類）
  const deleteCategory = useCallback(
    (slug: string, parentSlug?: string, nameTw?: string) => {
      requestConfirm(`確定刪除「${nameTw || slug}」？`, () => {
        setCategories((prev) => {
          const nextCats = { ...prev };
          if (parentSlug) {
            const parent = { ...nextCats[parentSlug] };
            const nextSubs = { ...parent.subcategories };
            delete nextSubs[slug];
            // 若子分類空了，移除整個 subcategories。
            if (Object.keys(nextSubs).length === 0) delete parent.subcategories;
            else parent.subcategories = nextSubs;
            nextCats[parentSlug] = parent;
          } else delete nextCats[slug]; // 刪主分類
          return nextCats;
        });
      });
    },
    [requestConfirm]
  );

  // 刪除標籤
  const deleteTag = useCallback(
    (slug: string, nameTw?: string) => {
      requestConfirm(`確定刪除標籤「${nameTw || slug}」？`, () => {
        setTags((prev) => {
          const nextTags = { ...prev };
          delete nextTags[slug];
          return nextTags;
        });
      });
    },
    [requestConfirm]
  );

  // 組合目前 categories + tags 並轉成 TypeScript 檔案下載
  const handleDownload = useCallback(() => {
    const ind = (n: number) => '  '.repeat(n);
    const esc = (s?: string) => (s || '').replace(/'/g, "\\'");
    const lines: string[] = [
      "import type { Category, Language } from '@/types';\n",
      'export const categoryMap: Record<string, Category> = {',
    ];

    for (const [slug, cat] of Object.entries(categories)) {
      lines.push(
        `${ind(1)}${slug}: {\n${ind(2)}name: {\n${ind(3)}tw: '${esc(cat.name.tw)}',\n${ind(3)}en: '${esc(cat.name.en)}',\n${ind(2)}},\n${ind(2)}slug: '${slug}',\n${ind(2)}color: {\n${ind(3)}light: '${cat.color.light}',\n${ind(3)}dark: '${cat.color.dark}',\n${ind(2)}},`
      );

      if (cat.subcategories && Object.keys(cat.subcategories).length > 0) {
        lines.push(`${ind(2)}subcategories: {`);
        for (const [subSlug, sub] of Object.entries(cat.subcategories)) {
          lines.push(
            `${ind(3)}${subSlug}: {\n${ind(4)}name: {\n${ind(5)}tw: '${esc(sub.name.tw)}',\n${ind(5)}en: '${esc(sub.name.en)}',\n${ind(4)}},\n${ind(4)}slug: '${subSlug}',\n${ind(4)}color: {\n${ind(5)}light: '${sub.color.light}',\n${ind(5)}dark: '${sub.color.dark}',\n${ind(4)}},\n${ind(3)}},`
          );
        }
        lines.push(`${ind(2)}},`);
      }
      lines.push(`${ind(1)}},`);
    }

    lines.push(
      '};\n\ninterface TagDefinition {\n  name: Record<Language, string>;\n  slug: string;\n}\n'
    );
    lines.push('export const tagMap: Record<string, TagDefinition> = {');

    for (const [slug, tag] of Object.entries(tags).sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(
        `${ind(1)}${slug}: {\n${ind(2)}name: {\n${ind(3)}tw: '${esc(tag.name.tw)}',\n${ind(3)}en: '${esc(tag.name.en)}',\n${ind(2)}},\n${ind(2)}slug: '${slug}',\n${ind(1)}},`
      );
    }
    lines.push('};\n');

    try {
      const blob = new Blob([lines.join('\n')], { type: 'text/typescript;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'taxonomy.ts';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      showToast('下載失敗，請查看 Console。');
    }
  }, [categories, tags]);

  // 根據搜尋關鍵字篩選 tags
  const filteredTags = useMemo(
    () =>
      Object.entries(tags)
        .sort(([a], [b]) => a.localeCompare(b))
        .filter(([slug, tag]) => matchSearch(slug, tag, tagSearch)),
    [tags, tagSearch]
  );

  const sharedCatFormProps = { categories, setCategories, setEditingId };

  return (
    <div className="space-y-6">
      {confirmState && (
        <div className="flex-center fixed inset-0 z-50 bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg border bg-white p-4 shadow-xl">
            <p className="text-sm text-gray-700">{confirmState.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setConfirmState(null)} className="btn btn-sm btn-ghost">
                取消
              </button>
              <button
                onClick={() => {
                  const { onConfirm } = confirmState;
                  setConfirmState(null);
                  onConfirm();
                }}
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
              >
                確定
              </button>
            </div>
          </div>
        </div>
      )}
      <section>
        <div className="flex-between mb-3">
          <h2 className="text-lg font-semibold">
            分類管理{' '}
            <span className="text-sm font-normal text-gray-400">
              ({Object.keys(categories).length})
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <label className="input input-sm relative flex w-40 items-center rounded-full border border-gray-300">
              <Search size={16} className="ml-2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="搜尋分類"
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="ml-1 w-full bg-transparent outline-none"
              />
            </label>
            <button
              onClick={() => setEditingId('cat:__new__')}
              className="btn border-primary hover:bg-primary flex-center text-primary bg-surface-secondary hover:text-surface-secondary size-6 rounded-full p-0"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="max-h-112 space-y-2 overflow-y-auto pr-1">
          {Object.entries(categories).map(([slug, cat]) => {
            const subEntries = cat.subcategories ? Object.entries(cat.subcategories) : [];
            const isMatch = matchSearch(slug, cat, catSearch);
            const anySubMatch = subEntries.some(([s, sub]) => matchSearch(s, sub, catSearch));

            if (catSearch && !isMatch && !anySubMatch) return null;

            const isExpanded = expandedCats.has(slug);
            const isEditingMain = editingId === `cat:${slug}`;

            return (
              <div key={slug} className="overflow-hidden rounded border">
                {isEditingMain ? (
                  <CategoryForm
                    initialSlug={slug}
                    initialData={cat}
                    isSub={false}
                    onCancel={() => setEditingId(null)}
                    {...sharedCatFormProps}
                  />
                ) : (
                  <div className="group flex items-center gap-2 px-3 py-2 text-sm">
                    {subEntries.length > 0 && (
                      <button
                        onClick={() => toggleExpand(slug)}
                        className="flex items-center gap-0.5"
                      >
                        {isExpanded ? (
                          <ChevronDown size={16} aria-hidden="true" />
                        ) : (
                          <ChevronRight size={16} aria-hidden="true" />
                        )}
                        <span className="text-xs text-gray-400">{subEntries.length}</span>
                      </button>
                    )}
                    <ColorDot light={cat.color.light} dark={cat.color.dark} />
                    <span className="min-w-0 truncate font-medium">{cat.name.tw}</span>
                    <span className="hidden text-xs text-gray-400 sm:inline">{cat.name.en}</span>
                    <div className="flex-1" />
                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setEditingId(`cat:${slug}`)}
                        className="text-gray-700 hover:text-gray-900"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => deleteCategory(slug, undefined, cat.name.tw)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                )}

                {(isExpanded || editingId?.startsWith(`subcat:${slug}/`)) && (
                  <div className="border-t">
                    {subEntries.map(([subSlug, sub]) => {
                      if (catSearch && !matchSearch(subSlug, sub, catSearch) && !isMatch)
                        return null;
                      if (editingId === `subcat:${slug}/${subSlug}`) {
                        return (
                          <CategoryForm
                            key={subSlug}
                            initialSlug={subSlug}
                            initialData={sub}
                            isSub
                            parentSlug={slug}
                            onCancel={() => setEditingId(null)}
                            {...sharedCatFormProps}
                          />
                        );
                      }
                      return (
                        <div
                          key={subSlug}
                          className="group ml-6 flex items-center gap-2 px-3 py-2 text-sm"
                        >
                          <ColorDot light={sub.color.light} dark={sub.color.dark} />
                          <span className="min-w-0 truncate font-medium">{sub.name.tw}</span>
                          <span className="hidden text-xs text-gray-400 sm:inline">
                            {sub.name.en}
                          </span>
                          <div className="flex-1" />
                          <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => setEditingId(`subcat:${slug}/${subSlug}`)}
                              className="text-gray-700 hover:text-gray-900"
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => deleteCategory(subSlug, slug, sub.name.tw)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {editingId === `subcat:${slug}/__new__` ? (
                      <CategoryForm
                        initialSlug=""
                        initialData={{
                          name: { tw: '', en: '' },
                          slug: '',
                          color: { light: '#ccc', dark: '#666' },
                        }}
                        isSub
                        parentSlug={slug}
                        onCancel={() => setEditingId(null)}
                        {...sharedCatFormProps}
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setExpandedCats((prev) => new Set(prev).add(slug));
                          setEditingId(`subcat:${slug}/__new__`);
                        }}
                        className="btn btn-xs btn-ghost hover:text-primary my-1 ml-6 flex items-center gap-1 text-gray-400"
                      >
                        <Plus size={16} aria-hidden="true" /> 子分類
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {editingId === 'cat:__new__' && (
            <CategoryForm
              initialSlug=""
              initialData={{
                name: { tw: '', en: '' },
                slug: '',
                color: { light: '#ccc', dark: '#666' },
              }}
              isSub={false}
              onCancel={() => setEditingId(null)}
              {...sharedCatFormProps}
            />
          )}
          {Object.keys(categories).length > 0 &&
            !Object.entries(categories).some(
              ([slug, cat]) =>
                matchSearch(slug, cat, catSearch) ||
                (cat.subcategories &&
                  Object.entries(cat.subcategories).some(([s, sub]) =>
                    matchSearch(s, sub, catSearch)
                  ))
            ) && <p className="py-4 text-center text-sm text-gray-400">找不到符合的分類</p>}
        </div>
      </section>
      <section className="border-t pt-4">
        <div className="flex-between mb-3">
          <h2 className="text-lg font-semibold">
            標籤管理{' '}
            <span className="text-sm font-normal text-gray-400">({Object.keys(tags).length})</span>
          </h2>
          <div className="flex items-center gap-2">
            <label className="input input-sm relative flex w-40 items-center rounded-full border border-gray-300">
              <Search size={16} className="ml-2 text-gray-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="搜尋標籤"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="ml-1 w-full bg-transparent outline-none"
              />
            </label>
            <button
              onClick={() => setEditingId('tag:__new__')}
              className="btn border-primary hover:bg-primary flex-center text-primary bg-surface-secondary hover:text-surface-secondary size-6 rounded-full p-0"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex max-h-80 flex-wrap items-start gap-1.5 overflow-y-auto pr-1">
          {editingId === 'tag:__new__' && (
            <TagForm
              initialSlug=""
              initialData={{ name: { tw: '', en: '' }, slug: '' }}
              onCancel={() => setEditingId(null)}
              tags={tags}
              setTags={setTags}
              setEditingId={setEditingId}
            />
          )}
          {filteredTags.map(([slug, tag]) => {
            if (editingId === `tag:${slug}`) {
              return (
                <TagForm
                  key={slug}
                  initialSlug={slug}
                  initialData={tag}
                  onCancel={() => setEditingId(null)}
                  tags={tags}
                  setTags={setTags}
                  setEditingId={setEditingId}
                />
              );
            }
            return (
              <div
                key={slug}
                className="group inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs"
              >
                <span className="font-medium">{tag.name.tw || slug}</span>
                {tag.name.en && tag.name.en !== tag.name.tw && (
                  <span className="text-gray-400">{tag.name.en}</span>
                )}
                <span className="ml-1 hidden gap-1 group-hover:inline-flex">
                  <button
                    onClick={() => setEditingId(`tag:${slug}`)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Pencil size={13} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => deleteTag(slug, tag.name.tw)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </span>
              </div>
            );
          })}
          {filteredTags.length === 0 && tagSearch && (
            <p className="w-full py-4 text-center text-sm text-gray-400">找不到符合的標籤</p>
          )}
        </div>
      </section>
      <div className="flex justify-end border-t pt-4">
        <button
          onClick={handleDownload}
          className="btn btn-sm bg-primary text-surface-secondary flex items-center gap-1 hover:opacity-90"
        >
          <Download size={16} aria-hidden="true" /> 匯出 taxonomy.ts
        </button>
      </div>
    </div>
  );
};

export default TaxonomyManager;
