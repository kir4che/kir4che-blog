type CssLengthResult = {
  raw: string;
  unit: string;
  value: number;
  valid: boolean;
};

const parseCssLength = (
  value?: string | number | null
): CssLengthResult | null => {
  if (value === undefined || value === null) return null;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return {
      raw: value === 0 ? '0' : `${value}px`,
      unit: 'px',
      value,
      valid: true,
    };
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const fnMatch = /^(calc|min|max|clamp|var|env|fit-content)\(/i.test(trimmed);
  if (fnMatch) return { raw: trimmed, unit: '', value: NaN, valid: true };

  const unitRe =
    /(px|em|rem|%|vh|vw|vmin|vmax|vi|vb|svh|lvh|dvh|svw|lvw|dvw|ch|ex|cap|ic|lh|rlh|q|cm|mm|in|pt|pc)$/i;
  if (unitRe.test(trimmed)) {
    const match = trimmed.match(unitRe)!;
    const unit = match[0].toLowerCase();
    const numeric = parseFloat(trimmed);
    return {
      raw: trimmed,
      unit,
      value: numeric,
      valid: Number.isFinite(numeric),
    };
  }

  const numericRe = /^[+-]?(?:\d+|\d*\.\d+)$/;
  if (numericRe.test(trimmed)) {
    const n = Number(trimmed);
    if (!Number.isFinite(n)) return null;
    return {
      raw: n === 0 ? '0' : `${trimmed}px`,
      unit: 'px',
      value: n,
      valid: true,
    };
  }

  return null;
};

export const toCssLength = (
  value?: string | number | null,
  fallback?: string
): string | undefined => {
  const res = parseCssLength(value);
  return res && res.valid ? res.raw : fallback;
};

export const toPixelNumber = (
  value?: string | number | null,
  fallback: number | null = null
): number | null => {
  const res = parseCssLength(value);
  if (!res || !res.valid) return fallback;
  return res.unit === 'px' ? res.value : fallback;
};
