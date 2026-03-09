import { defineCollection, z } from 'astro:content';

const stringArray = z.preprocess((value) => value ?? [], z.array(z.string()));

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    postId: z.string().optional(),
    categories: stringArray,
    tags: stringArray,
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    passwordHash: z.string().optional(),
    coverImage: z.string().optional(),
    updatedAt: z.string().optional(),
    showUpdatedAt: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
};
