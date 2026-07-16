import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const stringArray = z.preprocess((value) => value ?? [], z.array(z.string()));
const parseCoordPair = (raw: string): { lat: number; lng: number } | null => {
  const [latRaw, lngRaw, extra] = raw.split(',').map((part) => part.trim());
  if (!latRaw || !lngRaw || extra) return null;

  const lat = Number(latRaw);
  const lng = Number(lngRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
};

const placeWithLatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  icon: z.string().min(1),
});

const placeWithCoordSchema = z
  .object({
    coord: z
      .string()
      .min(1)
      .refine((raw) => parseCoordPair(raw) !== null, 'coord 必須是 "lat, lng" 格式'),
    icon: z.string().min(1),
  })
  .transform(({ coord, icon }) => {
    const parsed = parseCoordPair(coord);
    if (!parsed) throw new Error('coord 必須是 "lat, lng" 格式');

    return {
      lat: parsed.lat,
      lng: parsed.lng,
      icon,
    };
  });

const placesSchema = z.array(z.union([placeWithLatLngSchema, placeWithCoordSchema])).default([]);

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
    places: placesSchema,
    updatedAt: z.coerce.date().optional(),
    showUpdatedAt: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
};
