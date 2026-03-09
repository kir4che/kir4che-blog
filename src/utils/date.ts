type DateInput = string | Date | null | undefined;

// 將各種日期輸入轉為有效 Date 物件
const parseDateInput = (value: DateInput): Date | null => {
  if (!value) return null;

  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      const [, y, m, d] = match;
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  return null;
};

type DateFormatVariant = 'default' | 'short';

// 建立日期 formatter
export const createDateFormatter = (locale: string, variant: DateFormatVariant = 'default') => {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: variant === 'short' ? 'short' : '2-digit',
    day: '2-digit',
  });

  return (value?: DateInput) => {
    const date = parseDateInput(value);
    if (!date) return null;

    return {
      display: formatter.format(date),
      datetime: date.toISOString(),
    };
  };
};

// 將日期轉為 ISO 字串
export const parseToISODate = (value?: DateInput): string | null => {
  const date = parseDateInput(value);
  return date ? date.toISOString() : null;
};

// 將日期轉為 ISO 字串
export const toISODateOrThrow = (
  value?: DateInput,
  errorMessage: string = 'Invalid date value.'
): string => {
  const date = parseDateInput(value);
  if (!date) throw new Error(errorMessage);

  return date.toISOString();
};

// 固定格式 YYYY/MM/DD
export const formatDateYmd = (value?: DateInput) => {
  const date = parseDateInput(value);
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return {
    display: `${year}/${month}/${day}`,
    datetime: date.toISOString(),
  };
};
