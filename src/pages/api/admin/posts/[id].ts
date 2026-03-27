export const prerender = false;

import type { APIRoute } from 'astro';

import { saveAdminPostToGithub } from '@/lib/admin';
import { isAuthenticated } from '@/lib/auth';
import { isSupportedLanguage } from '@/lib/i18n';
import { updateAdminPostSchema } from '@/lib/validations/post';
import type { Language } from '@/types';
import { errorResponse, jsonResponse, unknownError } from '@/utils/api';

const parseId = (rawId?: string): { lang: Language; slug: string } | null => {
  const [lang, slug] = decodeURIComponent(rawId ?? '').split('/');
  if (!lang || !slug) return null;
  if (isSupportedLanguage(lang)) return { lang, slug };
  return null;
};

export const PUT: APIRoute = async ({ request, cookies, params }) => {
  if (!(await isAuthenticated(cookies))) return errorResponse('Unauthorized', 401);

  const parsedId = parseId(params.id);
  if (!parsedId) return errorResponse('Missing post id', 400);

  try {
    const data = await request.formData();

    const parsed = updateAdminPostSchema.safeParse(Object.fromEntries(data.entries()));
    if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

    const form = parsed.data;

    if (form.lang && form.lang !== parsedId.lang) return errorResponse('Language mismatch', 400);

    const newSlug = form.slug || parsedId.slug;

    const meta = {
      title: form.title,
      description: form.description,
      date: form.date,
      tags: form.tags,
      categories: form.categories,
      draft: form.draft,
      featured: form.featured,
      showUpdatedAt: form.showUpdatedAt,
      protected: form.protected,
      coverImage: form.coverImage,
    };

    await saveAdminPostToGithub(parsedId.lang, newSlug, meta, form.content, parsedId.slug);

    return jsonResponse({ success: true, id: `${parsedId.lang}/${newSlug}` }, { status: 200 });
  } catch (err) {
    return unknownError(err);
  }
};
