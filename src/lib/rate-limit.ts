import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null | undefined = undefined;

const getRatelimit = (): Ratelimit | null => {
  if (ratelimit !== undefined) return ratelimit;

  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    ratelimit = null;
    return null;
  }

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(3, '60 s'),
    prefix: 'verify',
  });
  return ratelimit;
};

// 回傳剩餘鎖定秒數（0 = 未鎖定）
export const checkRateLimit = async (clientKey: string): Promise<number> => {
  const rl = getRatelimit();
  if (!rl) return 0;

  const { success, reset } = await rl.limit(clientKey);
  if (success) return 0;

  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
};

export const getClientKey = (request: Request, slug: string): string => {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';
  return `${ip}:${slug}`;
};
