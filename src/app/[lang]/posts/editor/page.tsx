'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

import type { Language } from '@/types';
import { categoryMap } from '@/config/category';
import { useAlert } from '@/contexts/AlertContext';

import Checkbox from '@/components/ui/Checkbox';
import InputField from '@/components/ui/InputField';
import LoadingSpin from '@/components/ui/LoadingSpin';

const MDXEditor = dynamic(
  () => import('@/components/features/editor/MDXEditor'),
  {
    ssr: false,
    loading: () => (
      <div className='border border-red-500 p-4'>Loading Editor...</div>
    ),
  }
);

type Params = Promise<{
  lang: Language;
}>;

const EditorPage = ({ params }: { params: Params }) => {
  const { lang } = use(params);
  const { showError } = useAlert();
  const t = useTranslations('EditorPage');
  const t_common = useTranslations('common');
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [isDraft, setIsDraft] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validateRequiredFields = () => {
    const newErrors: Record<string, boolean> = {};

    if (!title.trim()) newErrors.title = true;
    if (!slug.trim()) newErrors.slug = true;
    if (!content.trim()) newErrors.content = true;
    if (selectedCategories.length === 0) newErrors.categories = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateRequiredFields()) return;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('slug', slug.trim());
      formData.append('description', description);
      formData.append('content', content);
      formData.append(
        'tags',
        JSON.stringify(
          tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean)
        )
      );
      formData.append('categories', JSON.stringify(selectedCategories));
      formData.append('lang', lang);
      formData.append('draft', isDraft.toString());
      formData.append('featured', isFeatured.toString());
      if (password.trim()) formData.append('password', password);
      if (coverImage) formData.append('coverImage', coverImage);

      const res = await fetch('/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const { slug } = await res.json();
        // 如果存成草稿就導向文章列表，反之導向該文章頁面。
        if (isDraft) router.push(`/${lang}/posts`);
        else router.push(`/${lang}/posts/${slug}`);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => router.push(`/${lang}/posts`);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
  };

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: false }));
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    if (errors.content) setErrors((prev) => ({ ...prev, content: false }));
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categorySlug)
        ? prev.filter((c) => c !== categorySlug)
        : [...prev, categorySlug]
    );
    if (errors.categories)
      setErrors((prev) => ({ ...prev, categories: false }));
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const getAllCategories = () => {
    const categories: {
      slug: string;
      name: string;
      color: string;
      isParent: boolean;
      parentSlug?: string;
    }[] = [];

    Object.entries(categoryMap).forEach(([, category]) => {
      categories.push({
        slug: category.slug,
        name: category.name[lang],
        color: category.color.light,
        isParent: true,
      });

      if (category.subcategories) {
        Object.entries(category.subcategories).forEach(([, subCategory]) => {
          categories.push({
            slug: subCategory.slug,
            name: subCategory.name[lang],
            color: subCategory.color.light,
            isParent: false,
            parentSlug: category.slug,
          });
        });
      }
    });

    return categories;
  };

  return (
    <div className='relative mx-auto max-w-5xl space-y-6 py-4'>
      {isSaving && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
          <div className='bg-bg-secondary rounded-lg p-6'>
            <LoadingSpin
              text={
                isDraft
                  ? t_common('button.saving')
                  : t_common('button.publishing')
              }
              className='flex gap-x-3'
            />
          </div>
        </div>
      )}
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl text-pink-700 dark:text-pink-50'>
          {t('title')}
        </h1>
        <div className='flex items-center gap-x-3'>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className='border-text-gray-lighter dark:border-text-gray bg-bg-secondary disabled:bg-text-gray-lighter rounded-md border px-4 py-1 disabled:cursor-not-allowed'
          >
            {t_common('button.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className='disabled:bg-text-gray-light flex items-center gap-2 rounded-md bg-pink-600 px-4 py-1 text-white hover:bg-pink-700 disabled:cursor-not-allowed'
          >
            {isSaving && (
              <div className='h-4 w-4 animate-spin rounded-full border-b-2 border-white'></div>
            )}
            {isSaving
              ? isDraft
                ? t_common('button.saving')
                : t_common('button.publishing')
              : isDraft
                ? t_common('button.saveDraft')
                : t_common('button.publish')}
          </button>
        </div>
      </div>
      {/* 表單、編輯器 */}
      <div className='space-y-3'>
        <div className='grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2'>
          <div>
            <label className='text-text-primary mb-2 block text-sm font-medium'>
              {t('form.title')} <span className='text-red-500'>*</span>
            </label>
            <InputField
              value={title}
              onChange={handleTitleChange}
              error={!!errors.title}
              placeholder={t('form.titlePlaceholder')}
            />
          </div>
          <div>
            <label className='text-text-primary mb-2 block text-sm font-medium'>
              {t('form.slug')} <span className='text-red-500'>*</span>
            </label>
            <InputField
              value={slug}
              onChange={handleSlugChange}
              error={!!errors.slug}
              placeholder={t('form.slugPlaceholder')}
            />
          </div>
        </div>
        <div>
          <label className='text-text-primary mb-2 block text-sm font-medium'>
            {t('form.description')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className='text-text-primary bg-bg-secondary border-text-gray-lighter dark:border-text-gray w-full rounded-md border-[0.75px] p-2.5 outline-pink-600 placeholder:text-sm dark:outline-pink-700/80'
            placeholder={t('form.descriptionPlaceholder')}
          />
        </div>
        <div className='grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2'>
          <div className='space-y-4'>
            <div>
              <label className='text-text-primary mb-2 block text-sm font-medium'>
                {t('form.tags')}
              </label>
              <InputField
                value={tags}
                onChange={setTags}
                error={!!errors.tags}
                placeholder={t('form.tagsPlaceholder')}
              />
            </div>
            <div>
              <label className='text-text-primary mb-2 block text-sm font-medium'>
                {t('form.password')}
              </label>
              <InputField
                type='password'
                value={password}
                onChange={setPassword}
                placeholder={t('form.passwordPlaceholder')}
              />
            </div>
            {/* 設定草稿、精選文章 */}
            <div className='my-2 flex items-center gap-x-3'>
              <div className='flex items-center gap-x-2'>
                <Checkbox id='draft' checked={isDraft} onChange={setIsDraft} />
                <label htmlFor='draft' className='text-text-primary text-sm'>
                  {t('form.draft')}
                </label>
              </div>
              <div className='flex items-center gap-x-2'>
                <Checkbox
                  id='featured'
                  checked={isFeatured}
                  onChange={setIsFeatured}
                />
                <label htmlFor='featured' className='text-text-primary text-sm'>
                  {t('form.featured')}
                </label>
              </div>
            </div>
          </div>
          {/* 分類選單 */}
          <div>
            <label className='text-text-primary mb-2 block text-sm font-medium'>
              {t('form.categories')} <span className='text-red-500'>*</span>
            </label>
            <div
              className={`text-text-primary bg-bg-secondary rounded-md border p-2.5 ${
                errors.categories
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-text-gray-lighter dark:border-text-gray'
              }`}
            >
              <div className='max-h-42 overflow-y-auto'>
                <div className='space-y-2'>
                  {getAllCategories().map((category) => (
                    <label
                      key={category.slug}
                      className={`flex cursor-pointer items-center gap-x-2 px-1 hover:bg-pink-50 dark:hover:bg-pink-100 ${
                        !category.isParent ? 'ml-4' : ''
                      }`}
                    >
                      <Checkbox
                        checked={selectedCategories.includes(category.slug)}
                        onChange={() => handleCategoryChange(category.slug)}
                      />
                      <span
                        className='h-3 w-3 rounded-full'
                        style={{ backgroundColor: category.color }}
                      />
                      <span
                        className={`text-text-primary text-sm ${
                          category.isParent ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className='text-text-primary mb-2 block text-sm font-medium'>
            {t('form.coverImage')}
          </label>
          <InputField
            type='file'
            accept='image/*'
            onChange={handleCoverImageChange}
          />
          {coverImagePreview && (
            <div className='relative mt-2 h-45 w-full lg:h-72'>
              <Image
                src={coverImagePreview}
                alt='Cover preview'
                fill
                className='rounded-md object-cover'
              />
              <button
                type='button'
                onClick={removeCoverImage}
                className='absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 hover:bg-black/50'
              >
                <X size={14} color='white' />
              </button>
            </div>
          )}
        </div>
        {/* 文章內容編輯器 */}
        <div>
          <label className='text-text-primary mb-2 block text-sm font-medium'>
            {t('content.title')} <span className='text-red-500'>*</span>
          </label>
          <div
            className={`overflow-hidden rounded-md border ${
              errors.content
                ? 'border-red-500 dark:border-red-500'
                : 'border-text-gray-lighter dark:border-text-gray'
            }`}
          >
            <MDXEditor
              t={t}
              content={content}
              slug={slug}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
