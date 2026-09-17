/**
 * Corner radius tokens — rounded EXALO surfaces.
 */
export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  card: 28,
  button: 16,
  input: 14,
  chip: 999,
  pill: 999,
  circle: 999,
} as const;

/** @deprecated Prefer `radius` — kept temporarily for older imports. */
export const radii = radius;

export type RadiusToken = keyof typeof radius;
