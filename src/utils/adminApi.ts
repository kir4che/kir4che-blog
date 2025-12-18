import { NextResponse } from 'next/server';

import type { Language } from '@/types';
import { DEFAULT_LANGUAGE } from '@/config';
import { isRequestEditorAuthed } from '@/utils/editorAuth';

// 判斷傳入值是否為支援的語言
const isSupportedLanguage = (value: unknown): value is Language =>
  value === 'en' || value === 'tw';

// 確保當前請求已通過 Editor 認證
export const ensureEditorAuthorized = async () => {
  const authed = await isRequestEditorAuthed();
  return authed
    ? null
    : NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
};

// 將未知的值解析成語言，若值合法則回傳該值，否則退回 DEFAULT_LANGUAGE。
export const resolveLanguage = (value: unknown): Language =>
  isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE;

// 從 Request URL querystring 中讀取 ?lang= 參數並解析語言
export const resolveLanguageFromRequest = (req: Request): Language => {
  const { searchParams } = new URL(req.url);
  return resolveLanguage(searchParams.get('lang'));
};

// 從 FormData 中讀取 lang 欄位並解析
export const resolveLanguageFromFormData = (formData: FormData): Language =>
  resolveLanguage(formData.get('lang'));
