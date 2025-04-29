import type { Language } from '@/types';
import { LANGUAGES } from '@/config';

export const getLangFromHeader = (request: Request): Language => {
  const raw = request.headers.get('Accept-Language') ?? '';
  const extracted = raw.split(',')[0].trim();

  return LANGUAGES.includes(extracted as Language)
    ? (extracted as Language)
    : 'tw';
};
