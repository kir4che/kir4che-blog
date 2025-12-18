import type { Post } from '@/types';

type MDXFrontmatterInput = Pick<
  Post,
  'title' | 'description' | 'tags' | 'categories' | 'draft' | 'featured'
> & {
  date: string;
  password?: string;
  coverImage?: string;
  updatedAt?: string;
};

// 建立 MDX 格式內容
export const createMDXContent = (
  frontmatter: MDXFrontmatterInput,
  body: string
): string => {
  const fm: Record<string, string | string[] | boolean | undefined> = {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    tags: frontmatter.tags,
    categories: frontmatter.categories,
    draft: frontmatter.draft ?? false,
    featured: frontmatter.featured ?? false,
    updatedAt: frontmatter.updatedAt,
  };

  if (frontmatter.password) fm.password = frontmatter.password;
  if (frontmatter.coverImage) fm.coverImage = frontmatter.coverImage;

  // frontmatter 轉成 YAML
  const frontmatterString = Object.entries(fm)
    .map(([key, value]) => {
      if (value === undefined || value === null) return null;

      if (Array.isArray(value)) {
        const arrayItems = value.map((item) => `  - "${item}"`).join('\n');
        return `${key}:\n${arrayItems}`;
      }

      return `${key}: "${value}"`;
    })
    .filter(Boolean)
    .join('\n');

  return `---
${frontmatterString}
---

${body}`;
};
