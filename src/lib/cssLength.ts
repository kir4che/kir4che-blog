type ParsedCssLength = {
  raw: string;
  unit: string | null;
  value: number | null;
};

const FUNCTION_RE = /^(calc|min|max|clamp|var|env|fit-content)\(/i;
const UNIT_RE =
  /(px|em|rem|%|vh|vw|vmin|vmax|vi|vb|svh|lvh|dvh|svw|lvw|dvw|ch|ex|cap|ic|lh|rlh|q|cm|mm|in|pt|pc)$/i;
const NUMBER_RE = /^[+-]?(?:\d+|\d*\.\d+)$/;

const parseCssLength = (input?: string | number | null): ParsedCssLength | null => {
  if (input == null) return null;

  if (typeof input === 'number') {
    if (!Number.isFinite(input)) return null;
    return {
      raw: input === 0 ? '0' : `${input}px`,
      unit: 'px',
      value: input,
    };
  }

  const value = input.trim();
  if (!value) return null;

  if (FUNCTION_RE.test(value)) return { raw: value, unit: null, value: null };

  if (UNIT_RE.test(value)) {
    const unit = value.match(UNIT_RE)![0].toLowerCase();
    const numeric = parseFloat(value);
    if (!Number.isFinite(numeric)) return null;

    return { raw: value, unit, value: numeric };
  }

  if (NUMBER_RE.test(value)) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;

    return {
      raw: n === 0 ? '0' : `${value}px`,
      unit: 'px',
      value: n,
    };
  }

  return null;
};

export const toCssLength = (
  value?: string | number | null,
  fallback?: string
): string | undefined => parseCssLength(value)?.raw ?? fallback;

export const toPixelNumber = (
  value?: string | number | null,
  fallback: number | null = null
): number | null => {
  const res = parseCssLength(value);
  return res?.unit === 'px' ? res.value : fallback;
};
