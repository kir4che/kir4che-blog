import type { APIRoute } from 'astro';
import { CONFIG, DEFAULT_LANGUAGE } from '@/config';

export const GET: APIRoute = () => {
  const target = CONFIG.paths.languagePaths[DEFAULT_LANGUAGE] ?? `/${DEFAULT_LANGUAGE}`;
  return Response.redirect(target, 308);
};
