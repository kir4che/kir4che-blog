import type { Language, Translator } from '@/types';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/config';
import { matchLanguageBasePath } from '@/lib/paths';

import en from '@/i18n/en.json';
import tw from '@/i18n/tw.json';

type MessageValue = string | { [key: string]: MessageValue };
type Messages = Record<string, MessageValue>;

const UI = {
  en,
  tw,
} satisfies Record<Language, Messages>;

// 依照 dot-notation key 解析巢狀訊息
const resolveMessage = (messages: Messages, key: string): string => {
  const segments = key.split('.');
  let current: MessageValue | undefined = messages;

  for (const segment of segments) {
    if (typeof current !== 'object' || current === null || !(segment in current)) return key;
    current = current[segment];
  }

  return typeof current === 'string' ? current : key;
};

// 字串插值，請勿搭配 set:html 或 dangerouslySetInnerHTML 使用。
const interpolate = (template: string, values?: Record<string, string | number>): string => {
  if (!values) return template;

  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = values[token];
    return value !== undefined ? String(value) : `{${token}}`;
  });
};

// 判斷是否為支援的語系
export const isSupportedLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

/**
 * 解析語系（不合法時回退預設）
 */
export const resolveLanguage = (value: unknown): Language =>
  isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE;

// 從 URL pathname 推斷語系
export const getLocaleFromUrl = (url: URL): Language => {
  const pathname = url.pathname;

  const match = matchLanguageBasePath(pathname);
  return match ? match.lang : DEFAULT_LANGUAGE;
};

// 建立翻譯函式
export const createTranslator = (lang: Language, namespace?: string): Translator => {
  const messages = UI[lang] ?? UI[DEFAULT_LANGUAGE];

  return (key, values) => {
    const resolvedKey = namespace ? `${namespace}.${key}` : key;

    const raw = resolveMessage(messages, resolvedKey);
    return interpolate(raw, values);
  };
};
