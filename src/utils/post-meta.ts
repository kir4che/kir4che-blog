// 確保傳入值是一個「包含非空字串的陣列」，用來處理 tag、category。
export const toStringArray = (value: unknown, defaultValue: string[] = []): string[] => {
  const arr = Array.isArray(value)
    ? value.filter((i): i is string => typeof i === 'string' && i.trim().length > 0)
    : [];
  return arr.length > 0 ? arr : defaultValue;
};

// 解析 updatedAt
export const resolveUpdatedAt = (raw: unknown): string | undefined =>
  typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
