const XSS_PATTERN = /<[^>]*>|javascript:|data:|on\w+\s*=/gi;

export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLength).replace(XSS_PATTERN, "");
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T, fieldLimits: Partial<Record<keyof T, number>> = {}): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const limit = (fieldLimits as Record<string, number>)[key];
    result[key] = typeof value === "string" ? sanitizeString(value, limit ?? 500) : value;
  }
  return result as T;
}
