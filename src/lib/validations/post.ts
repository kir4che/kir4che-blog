import { z } from 'zod';

export const basePostSchema = z.object({
  slug: z.string().optional(),
  title: z.string().optional().default(''),
  description: z.string().optional().default(''),
  date: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  categories: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    ),
  draft: z
    .string()
    .optional()
    .transform((val) => ['on', 'true', '1'].includes(val ?? '')),
  featured: z
    .string()
    .optional()
    .transform((val) => ['on', 'true', '1'].includes(val ?? '')),
  showUpdatedAt: z
    .string()
    .optional()
    .transform((val) => ['on', 'true', '1'].includes(val ?? '')),
  protected: z
    .string()
    .optional()
    .transform((val) => ['on', 'true', '1'].includes(val ?? '')),
  coverImage: z.string().optional(),
});

export const adminPostSchema = basePostSchema.extend({
  lang: z.string().min(1, 'Missing language'),
  content: z.string().default(''),
});

export const updateAdminPostSchema = basePostSchema.extend({
  lang: z.string().optional(),
  content: z.string().min(1, 'Missing content'),
});
