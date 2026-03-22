import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const stringArray = z.preprocess((value) => value ?? [], z.array(z.string()));

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    categories: stringArray,
    tags: stringArray,
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    protected: z.boolean().default(false),
    coverImage: z.string().optional(),
    updatedAt: z.string().optional(),
    showUpdatedAt: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
};
