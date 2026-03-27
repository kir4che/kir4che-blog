import { isAuthenticated } from '@/lib/auth';
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // 攔截所有 /admin (排除登入頁) 與 /api/admin 路由
  if (url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login')) {
    if (!(await isAuthenticated(cookies))) return redirect('/admin/login');
  }

  if (url.pathname.startsWith('/api/admin')) {
    if (!(await isAuthenticated(cookies))) return new Response('Unauthorized', { status: 401 });
  }

  return next();
});
