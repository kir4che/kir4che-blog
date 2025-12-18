'use client';

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { MDXComponents } from 'mdx/types';

import type {
  Language,
  CategoryNode,
  EditorFormState,
  FlatCategory,
  LoadedPost,
  PostListItem,
  TagNode,
  TaxonomyState,
} from '@/types';
import {
  categoryMap as fallbackCategoryMap,
  tagMap as fallbackTagMap,
} from '@/config/taxonomy';
import { useAlert } from '@/contexts/AlertContext';
import { getLocalizedPostPath } from '@/lib/paths';
import { convertToSlug } from '@/lib/tags';
import { useMDXComponents } from '@/hooks/useMDXComponents';
import { useMDXPreview } from '@/hooks/useMDXPreview';
import { cn } from '@/lib/style';

import LoadingSpin from '@/components/ui/LoadingSpin';

import AuthModal from '@/components/features/editor/AuthModal';
import EditorHeader from '@/components/features/editor/EditorHeader';
import EditorSidebar from '@/components/features/editor/EditorSidebar';
import EditorFormCard from '@/components/features/editor/EditorFormCard';
import PreviewPanel from '@/components/features/editor/PreviewPanel';

// 所有分類
const mapCategoriesFromConfig = (): CategoryNode[] =>
  Object.values(fallbackCategoryMap).map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    color: cat.color,
    subcategories: cat.subcategories
      ? Object.values(cat.subcategories).map((sub) => ({
          slug: sub.slug,
          name: sub.name,
          color: sub.color,
        }))
      : [],
  }));

// 所有標籤
const mapTagsFromConfig = (): TagNode[] =>
  Object.values(fallbackTagMap).map((tag) => ({
    slug: tag.slug,
    name: tag.name,
  }));

const createDefaultForm = (): EditorFormState => ({
  title: '',
  slug: '',
  description: '',
  content: '',
  tags: [],
  categories: [],
  password: '',
  coverFile: null,
  coverImagePath: '',
  draft: true,
  featured: false,
  date: '',
});

const EditorPageContent = () => {
  const searchParams = useSearchParams();
  const initialLang =
    (searchParams.get('lang') as Language) || ('tw' as Language);
  const router = useRouter();
  const { showError, showSuccess } = useAlert();
  const [extraComponents, setExtraComponents] = useState<MDXComponents>({});
  const [selectedLang, setSelectedLang] = useState<Language>(initialLang);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authPassword, setAuthPassword] = useState('');

  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [taxonomy, setTaxonomy] = useState<TaxonomyState>({
    categories: mapCategoriesFromConfig(),
    tags: mapTagsFromConfig(),
  });
  const [taxonomyDirty, setTaxonomyDirty] = useState(false);

  const [form, setForm] = useState<EditorFormState>(() => createDefaultForm());
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { previewSource, previewLoading } = useMDXPreview(form.content);
  const mdxComponents = useMDXComponents({ extraComponents });

  // 初始化驗證
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/admin/editor-auth', {
          cache: 'no-store',
        });
        setIsAuthed(res.ok);
      } catch {
        setIsAuthed(false);
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, []);

  // 取得遠端分類與標籤資料，覆蓋本地預設。
  useEffect(() => {
    if (!isAuthed) return;

    const loadTaxonomy = async () => {
      try {
        const res = await fetch('/api/admin/taxonomy');
        if (!res.ok) return;
        const data = await res.json();
        setTaxonomy({
          categories: data.categories ?? mapCategoriesFromConfig(),
          tags: data.tags ?? mapTagsFromConfig(),
        });
        setTaxonomyDirty(false);
      } catch {}
    };

    loadTaxonomy();
  }, [isAuthed]);

  // 確保操作前已通過驗證
  const ensureAuthenticated = useCallback(() => {
    if (isAuthed) return true;
    showError('請先完成驗證');
    return false;
  }, [isAuthed, showError]);

  // 依語系重新載入文章列表
  const refreshPosts = useCallback(async (lang: Language) => {
    try {
      const res = await fetch(`/api/admin/posts?lang=${lang}`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      // ignore
    }
  }, []);

  // 重置編輯器
  const resetEditor = useCallback(() => {
    setForm(createDefaultForm());
    setCoverPreview(null);
    setActiveSlug(null);
  }, [setForm, setCoverPreview, setActiveSlug]);

  // 切換語系後同步清空編輯器並重抓文章
  useEffect(() => {
    if (!isAuthed) return;
    resetEditor();
    refreshPosts(selectedLang);
  }, [selectedLang, isAuthed, refreshPosts, resetEditor]);

  // 當標題變動時自動帶出 slug，除非已經手動輸入。
  useEffect(() => {
    if (!form.title.trim()) return;
    if (form.slug.trim()) return;
    setForm((prev) => ({ ...prev, slug: convertToSlug(form.title) }));
  }, [form.title, form.slug]);

  // 動態載入有的文章的 MDX 元件
  useEffect(() => {
    const normalizedSlug = form.slug.trim();

    if (
      !normalizedSlug ||
      normalizedSlug.includes('..') ||
      normalizedSlug.includes('/') ||
      normalizedSlug.includes('\\')
    ) {
      setExtraComponents({});
      return;
    }

    let cancelled = false;

    const loadComponents = async () => {
      try {
        const componentsModule = await import(
          `@/posts/${normalizedSlug}/components`
        );
        if (cancelled) return;

        const components = (componentsModule?.default ??
          componentsModule) as MDXComponents;
        if (components && typeof components === 'object')
          setExtraComponents(components);
        else setExtraComponents({});
      } catch {
        if (!cancelled) setExtraComponents({});
      }
    };

    loadComponents();

    return () => {
      cancelled = true;
    };
  }, [form.slug]);

  // 驗證密碼後建立 admin session
  const handleAuthSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!authPassword.trim()) return;

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/editor-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: authPassword }),
      });

      if (!res.ok) {
        showError('密碼錯誤或登入失敗');
        return;
      }

      setIsAuthed(true);
      setAuthPassword('');
      showSuccess('已驗證，正在載入編輯器...');
    } catch (err) {
      showError(err instanceof Error ? err.message : '登入失敗');
    } finally {
      setAuthChecking(false);
      setAuthSubmitting(false);
    }
  };

  const flatCategories = useMemo(() => {
    const list: FlatCategory[] = [];

    taxonomy.categories.forEach((cat) => {
      list.push({
        slug: cat.slug,
        name: cat.name.tw,
        isParent: true,
        color: cat.color.light,
      });
      cat.subcategories?.forEach((sub) =>
        list.push({
          slug: sub.slug,
          name: sub.name.tw,
          isParent: false,
          color: sub.color.light,
          parentSlug: cat.slug,
        })
      );
    });

    return list;
  }, [taxonomy.categories]);

  // 搜尋文章
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [posts, searchTerm]);

  // 變更封面圖
  const handleCoverChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setForm((prev) => ({ ...prev, coverFile: file }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [setForm, setCoverPreview]
  );

  // 依 slug 載入文章內容並填入編輯器
  const loadPost = async (slug: string) => {
    if (!ensureAuthenticated()) return;

    setIsLoadingPost(true);
    try {
      const res = await fetch(`/api/admin/posts/${slug}?lang=${selectedLang}`);
      if (!res.ok) {
        showError('無法載入文章');
        return;
      }
      const data: LoadedPost = await res.json();
      setActiveSlug(slug);
      setForm({
        title: data.title,
        slug: data.slug,
        description: data.description ?? '',
        content: data.content,
        tags: data.tags ?? [],
        categories: data.categories ?? [],
        password: data.password ?? '',
        coverFile: null,
        coverImagePath: data.coverImage ?? '',
        draft: data.draft ?? false,
        featured: data.featured ?? false,
        date: data.date ?? '',
      });
      setCoverPreview(data.coverImage ?? null);
      showSuccess('載入文章完成，開始編輯吧！');
    } catch (err) {
      showError(err instanceof Error ? err.message : '載入文章失敗');
    } finally {
      setIsLoadingPost(false);
    }
  };

  // 儲存或發佈文章，並在成功後重抓文章列表。
  const savePost = async (publish: boolean) => {
    if (!ensureAuthenticated()) return;

    if (!form.title.trim()) return showError('標題必填');
    if (!form.slug.trim()) return showError('Slug 必填');
    if (!form.content.trim()) return showError('請輸入文章內容');
    if (form.categories.length === 0) return showError('至少選擇一個分類');

    setIsSaving(true);
    setIsPublishing(publish);
    try {
      const draftFlag = publish ? false : form.draft;
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('slug', form.slug);
      fd.append('description', form.description);
      fd.append('content', form.content);
      fd.append('tags', JSON.stringify(form.tags));
      fd.append('categories', JSON.stringify(form.categories));
      fd.append('lang', selectedLang);
      fd.append('draft', String(draftFlag));
      fd.append('featured', String(form.featured));
      if (form.password) fd.append('password', form.password);
      if (form.coverFile) fd.append('coverImage', form.coverFile);
      if (form.coverImagePath) fd.append('coverImagePath', form.coverImagePath);
      if (form.date) fd.append('date', form.date);

      const endpoint = activeSlug
        ? `/api/admin/posts/${activeSlug}`
        : '/api/posts/create';
      const method = activeSlug ? 'PUT' : 'POST';

      const res = await fetch(endpoint, { method, body: fd });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showError(body.message || '儲存失敗，請稍後重試');
        return;
      }

      const data = await res.json();
      setActiveSlug(data.slug ?? form.slug);
      setForm((prev) => ({ ...prev, draft: draftFlag, date: data.date ?? '' }));
      await refreshPosts(selectedLang);

      showSuccess(publish ? '已發布文章' : '已儲存草稿');

      if (publish) {
        router.push(
          getLocalizedPostPath({
            lang: selectedLang,
            date: data.date ?? form.date ?? new Date().toISOString(),
            slug: data.slug ?? form.slug,
          })
        );
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : '儲存失敗');
    } finally {
      setIsSaving(false);
      setIsPublishing(false);
    }
  };

  // 在多選分類中加入或移除指定 slug
  const toggleCategory = useCallback(
    (slug: string) => {
      setForm((prev) => {
        const exists = prev.categories.includes(slug);
        return {
          ...prev,
          categories: exists
            ? prev.categories.filter((c) => c !== slug)
            : [...prev.categories, slug],
        };
      });
    },
    [setForm]
  );

  // 新增標籤文字（避免重複）
  const addTag = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      setForm((prev) =>
        prev.tags.includes(trimmed)
          ? prev
          : { ...prev, tags: [...prev.tags, trimmed] }
      );
    },
    [setForm]
  );

  // 從標籤列表移除指定文字
  const removeTag = useCallback(
    (value: string) => {
      setForm((prev) => ({
        ...prev,
        tags: prev.tags.filter((t) => t !== value),
      }));
    },
    [setForm]
  );

  // 更新分類或子分類的屬性
  const updateCategory = (
    slug: string,
    updater: (category: CategoryNode) => CategoryNode,
    parentSlug?: string
  ) => {
    setTaxonomy((prev) => {
      const categories = prev.categories.map((cat) => {
        if (parentSlug) {
          if (cat.slug !== parentSlug) return cat;
          return {
            ...cat,
            subcategories: cat.subcategories?.map((sub) =>
              sub.slug === slug ? updater(sub) : sub
            ),
          };
        }
        return cat.slug === slug ? updater(cat) : cat;
      });

      return { ...prev, categories };
    });
    setTaxonomyDirty(true);
  };

  // 新增一個分類或指定父層的子分類
  const addCategory = (parentSlug?: string) => {
    const newSlug = `new-${Date.now()}`;
    if (!parentSlug) {
      setTaxonomy((prev) => ({
        ...prev,
        categories: [
          ...prev.categories,
          {
            slug: newSlug,
            name: { tw: '新分類', en: 'New category' },
            color: { light: '#F472B6', dark: '#F472B6' },
            subcategories: [],
          },
        ],
      }));
    } else {
      setTaxonomy((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.slug === parentSlug
            ? {
                ...cat,
                subcategories: [
                  ...(cat.subcategories ?? []),
                  {
                    slug: `${parentSlug}-${newSlug}`,
                    name: { tw: '新子分類', en: 'New subcategory' },
                    color: { light: cat.color.light, dark: cat.color.dark },
                  },
                ],
              }
            : cat
        ),
      }));
    }
    setTaxonomyDirty(true);
  };

  // 更新單一標籤
  const updateTag = (slug: string, updater: (tag: TagNode) => TagNode) => {
    setTaxonomy((prev) => ({
      ...prev,
      tags: prev.tags.map((tag) => (tag.slug === slug ? updater(tag) : tag)),
    }));
    setTaxonomyDirty(true);
  };

  // 新增空白標籤供後續編輯
  const addEmptyTag = () => {
    const newSlug = `tag-${Date.now()}`;
    setTaxonomy((prev) => ({
      ...prev,
      tags: [
        ...prev.tags,
        {
          slug: newSlug,
          name: { tw: '新標籤', en: 'New tag' },
        },
      ],
    }));
    setTaxonomyDirty(true);
  };

  // 將分類與標籤的變更同步到伺服器
  const persistTaxonomy = async () => {
    if (!ensureAuthenticated()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/taxonomy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taxonomy),
      });

      if (!res.ok) {
        showError('分類 / 標籤儲存失敗');
        return;
      }

      setTaxonomyDirty(false);
      showSuccess('分類與標籤已更新');
    } catch (err) {
      showError(err instanceof Error ? err.message : '儲存分類 / 標籤失敗');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthed)
    return (
      <AuthModal
        checking={authChecking}
        submitting={authSubmitting}
        password={authPassword}
        onPasswordChange={(value) => setAuthPassword(value)}
        onSubmit={handleAuthSubmit}
      />
    );

  return (
    <div className='relative mx-auto max-w-screen-2xl space-y-4 px-4 py-6 sm:px-0'>
      {(isSaving || isLoadingPost) && (
        <div className='flex-center fixed inset-0 z-50 bg-black/70'>
          <div className='bg-bg-secondary rounded-xl p-6'>
            <LoadingSpin
              text={
                isSaving
                  ? isPublishing
                    ? '發佈中...'
                    : '儲存中...'
                  : '載入中...'
              }
              className='flex gap-x-3'
            />
          </div>
        </div>
      )}
      <EditorHeader
        isSaving={isSaving}
        isPublishing={isPublishing}
        onSaveDraft={() => savePost(false)}
        onPublish={() => savePost(true)}
        isSidebarCollapsed={isSidebarCollapsed}
        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />
      <div
        className={cn(
          'grid grid-cols-1 items-start md:items-stretch md:transition-[grid-template-columns,gap] md:duration-300 md:ease-in-out',
          isSidebarCollapsed
            ? 'gap-0 md:grid-cols-[0px_1fr] md:gap-0'
            : 'gap-4 md:grid-cols-[320px_1fr] md:gap-4'
        )}
      >
        <EditorSidebar
          posts={filteredPosts}
          activeSlug={activeSlug}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onReset={resetEditor}
          onSelectPost={loadPost}
          selectedLang={selectedLang}
          onLangChange={setSelectedLang}
          taxonomy={taxonomy}
          taxonomyDirty={taxonomyDirty}
          onAddCategory={addCategory}
          onUpdateCategory={updateCategory}
          onAddTag={addEmptyTag}
          onUpdateTag={updateTag}
          onPersistTaxonomy={persistTaxonomy}
          isSavingTaxonomy={isSaving}
          collapsed={isSidebarCollapsed}
        />
        <div
          className={cn(
            'flex flex-col gap-4 transition-all duration-300 md:h-full',
            isSidebarCollapsed ? 'md:w-full' : 'md:w-auto'
          )}
        >
          <EditorFormCard
            form={form}
            tags={taxonomy.tags}
            flatCategories={flatCategories}
            setForm={setForm}
            onToggleCategory={toggleCategory}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            coverPreview={coverPreview}
            onCoverChange={handleCoverChange}
            onRemoveCover={() => {
              setCoverPreview(null);
              setForm((prev) => ({
                ...prev,
                coverFile: null,
                coverImagePath: '',
              }));
            }}
          />
          <PreviewPanel
            form={form}
            showPreview={showPreview}
            onToggle={setShowPreview}
            previewSource={previewSource}
            previewLoading={previewLoading}
            mdxComponents={mdxComponents}
            isSaving={isSaving}
            setForm={setForm}
            locale={selectedLang}
          />
        </div>
      </div>
    </div>
  );
};

const EditorPage = () => (
  <Suspense
    fallback={
      <div className='flex-center min-h-screen'>
        <LoadingSpin text='載入中...' />
      </div>
    }
  >
    <EditorPageContent />
  </Suspense>
);

export default EditorPage;
