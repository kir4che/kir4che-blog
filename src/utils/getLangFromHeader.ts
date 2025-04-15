import type { Language } from '@/types/language';
import { LANGUAGES } from '@/types/language';

export const getLangFromHeader = (request: Request): Language => {
  const raw = request.headers.get('Accept-Language') ?? '';
  const extracted = raw.split(',')[0].trim();

  return LANGUAGES.includes(extracted as Language)
    ? (extracted as Language)
    : 'tw';
};
