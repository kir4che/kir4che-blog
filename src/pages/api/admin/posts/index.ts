export const prerender = false;

import type { APIRoute } from 'astro';

import { saveAdminPostToGithub } from '@/lib/admin';
import { isAuthenticated } from '@/lib/auth';
import { adminPostSchema } from '@/lib/validations/post';
import { errorResponse, jsonResponse, unknownError } from '@/utils/api';
import { slugify } from '@/utils/slug';

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await isAuthenticated(cookies))) return errorResponse('Unauthorized', 401);

  try {
    const formData = await request.formData();
    const formDataObj = Object.fromEntries(formData.entries());
    const parsed = adminPostSchema.safeParse(formDataObj);

    if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 400);

    const form = parsed.data;
    const slug = form.slug || slugify(form.title) || `post-${Date.now()}`;

    const meta = {
      title: form.title,
      description: form.description,
      date: form.date || new Date().toISOString(),
      tags: form.tags,
      categories: form.categories,
      draft: form.draft,
      featured: form.featured,
      showUpdatedAt: form.showUpdatedAt,
      protected: form.protected,
      coverImage: form.coverImage,
    };

    await saveAdminPostToGithub(form.lang, slug, meta, form.content);

    return jsonResponse(
      { success: true, id: `${form.lang}/${slug}`, lang: form.lang, slug },
      { status: 200 }
    );
  } catch (err) {
    return unknownError(err);
  }
};
