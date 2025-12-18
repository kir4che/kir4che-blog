import type { LANGUAGES } from '@/config';

export type Language = (typeof LANGUAGES)[number]; // 'tw' | 'en'
