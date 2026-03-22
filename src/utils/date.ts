type DateInput = string | Date | null | undefined;

// 將各種日期輸入轉為有效 Date 物件
const parseDateInput = (value: DateInput): Date | null => {
  if (!value) return null;

  let date = value instanceof Date ? value : new Date(value);

  // 處理 YYYY-MM-DD 格式
  if (typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.test(value)) {
    const [y, m, d] = value.split('-').map(Number);
    date = new Date(y, m - 1, d);
    if (date.getDate() !== d) return null;
  }

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatWith = (date: Date | null, display: string) =>
  date ? { display, datetime: date.toISOString() } : null;

// 建立日期 formatter
export const createDateFormatter = (locale: string, variant: 'default' | 'short' = 'default') => {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: variant === 'short' ? 'short' : '2-digit',
    day: '2-digit',
  });

  return (value?: DateInput) => {
    const date = parseDateInput(value);
    return formatWith(date, date ? formatter.format(date) : '');
  };
};

// 日期轉為 ISO 字串
export const parseToISODate = (value?: unknown): string | null => {
  const safeValue: DateInput =
    value == null || typeof value === 'string' || value instanceof Date ? value : undefined;

  return parseDateInput(safeValue)?.toISOString() ?? null;
};

// 取得本地時區 ISO 字串（YYYY-MM-DDTHH:mm）
export const toLocalISO = (value?: DateInput): string => {
  const d = parseDateInput(value) ?? new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

// 固定格式 YYYY/MM/DD
export const formatDateYmd = (value?: DateInput) => {
  const d = parseDateInput(value);
  if (!d) return null;

  const display = [d.getFullYear(), d.getMonth() + 1, d.getDate()]
    .map((n) => String(n).padStart(2, '0'))
    .join('/');

  return formatWith(d, display);
};
