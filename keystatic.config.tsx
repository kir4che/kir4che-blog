import { config, fields, collection } from '@keystatic/core';
import { categoryMap, tagMap } from '@/config';
import { mdxComponents } from '@/config/keystatic-mdx-components';

const isProd = process.env.NODE_ENV === 'production';

const buildCategoryOptions = (lang: 'tw' | 'en') =>
  Object.values(categoryMap).flatMap((category) => [
    { label: category.name[lang]!, value: category.slug },
    ...Object.values(category.subcategories ?? {}).map((sub) => ({
      label: `${sub.name[lang]!}`,
      value: sub.slug,
    })),
  ]);

const buildTagOptions = (lang: 'tw' | 'en') =>
  Object.values(tagMap).map((tag) => ({
    label: tag.name[lang]!,
    value: tag.slug,
  }));

const blogSchema = {
  slug: fields.text({
    label: 'Slug',
    validation: { isRequired: true },
  }),
  title: fields.text({
    label: '標題',
    validation: { isRequired: true },
  }),
  description: fields.text({
    label: '描述',
    multiline: true,
  }),
  date: fields.date({
    label: '日期',
    validation: { isRequired: true },
    defaultValue: { kind: 'today' },
  }),
  updatedAt: fields.date({
    label: '更新日期',
    defaultValue: { kind: 'today' },
  }),
  showUpdatedAt: fields.checkbox({
    label: '顯示更新日期',
    defaultValue: false,
  }),
  categories: fields.multiselect({
    label: '分類（Categories）',
    options: buildCategoryOptions('tw'),
  }),
  tags: fields.multiselect({
    label: '標籤（Tags）',
    options: buildTagOptions('tw'),
  }),
  coverImage: fields.text({
    label: '封面圖片連結',
  }),
  featured: fields.checkbox({
    label: '精選文章',
    defaultValue: false,
  }),
  draft: fields.checkbox({
    label: '草稿 (不公開)',
    defaultValue: false,
  }),
  protected: fields.checkbox({
    label: '文章保護 (需要密碼才能查看)',
    defaultValue: false,
  }),
  places: fields.array(
    fields.object({
      coord: fields.text({
        label: '座標',
        description: '例如 37.529529, 126.939810',
      }),
      icon: fields.text({ label: 'Icon' }),
    }),
    {
      label: '旅遊景點',
      itemLabel: (item) => `${item.fields.icon.value || '景點'} (${item.fields.coord.value || ''})`,
    }
  ),
  content: fields.mdx({
    label: '內文',
    components: mdxComponents,
  }),
};

export default config({
  storage: isProd
    ? {
        kind: 'github',
        repo: 'kir4che/kir4che-blog',
      }
    : {
        kind: 'local',
      },
  collections: {
    blog_tw: collection({
      label: 'ZH-TW',
      slugField: 'slug',
      path: 'src/content/blog/tw/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title'],
      schema: blogSchema,
    }),
    blog_en: collection({
      label: 'EN',
      slugField: 'slug',
      path: 'src/content/blog/en/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title'],
      schema: blogSchema,
    }),
  },
});
