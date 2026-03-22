export const prerender = false;

import { CONFIG, DEFAULT_LANGUAGE } from '@/config';
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const target = CONFIG.paths.languagePaths[DEFAULT_LANGUAGE] ?? `/${DEFAULT_LANGUAGE}`;
  return Response.redirect(target, 308);
};
