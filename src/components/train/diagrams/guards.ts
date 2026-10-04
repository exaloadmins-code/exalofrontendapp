/**
 * Runtime-safe narrowing helpers for diagram_data JSON.
 */

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) {
      return n;
    }
  }
  return null;
}

export function asPositiveInt(value: unknown): number | null {
  const n = asFiniteNumber(value);
  if (n == null) return null;
  const t = Math.trunc(n);
  return t > 0 ? t : null;
}

export function asNonNegInt(value: unknown): number | null {
  const n = asFiniteNumber(value);
  if (n == null) return null;
  const t = Math.trunc(n);
  return t >= 0 ? t : null;
}

export function asFinitePoint(
  value: unknown,
): { x: number; y: number } | null {
  const r = asRecord(value);
  if (!r) return null;
  const x = asFiniteNumber(r.x);
  const y = asFiniteNumber(r.y);
  if (x == null || y == null) return null;
  return { x, y };
}

export function asFiniteArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const out: number[] = [];
  for (const item of value) {
    const n = asFiniteNumber(item);
    if (n === null) {
      return null;
    }
    out.push(n);
  }
  return out;
}

export function asString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

export function asUnknownArray(value: unknown): unknown[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return value;
}
