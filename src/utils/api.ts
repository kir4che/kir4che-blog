const buildHeaders = (headers?: HeadersInit): HeadersInit => {
  const merged = new Headers(headers);
  if (!merged.has('Content-Type')) merged.set('Content-Type', 'application/json');
  return merged;
};

export const jsonResponse = (data: unknown, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify(data), { ...init, headers: buildHeaders(init.headers) });

export const errorResponse = (
  message: string,
  status: number,
  extra?: Record<string, unknown>
): Response => jsonResponse({ message, ...(extra ?? {}) }, { status });

export const unknownError = (err: unknown): Response =>
  errorResponse(err instanceof Error ? err.message : 'Unknown error', 500);
