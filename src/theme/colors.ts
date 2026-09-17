/**
 * EXALO colour tokens — use these everywhere; do not hard-code colours in components.
 */
export const colors = {
  /**
   * Lovable `--background` / `bg-background`: hsl(230 60% 8%).
   * Used behind Home artboard letterboxing (matches Index.tsx main).
   */
  background: '#080C21',
  /** Lovable `--background-deep`: hsl(232 65% 5%). */
  backgroundDeep: '#040715',
  backgroundDark: '#0B1230',
  backgroundCard: '#152046',
  backgroundElevated: '#1B2A58',
  backgroundInput: '#0F1A3A',
  backgroundChip: '#121C3C',
  textPrimary: '#FFFFFF',
  textSecondary: '#9BB0D4',
  textMuted: '#6F82A8',
  orange: '#FF8A3C',
  orangeSoft: '#FFB074',
  purple: '#8B5CFF',
  purpleDeep: '#6E3FE0',
  blue: '#3D8BFF',
  blueSoft: '#5CA0FF',
  green: '#2ED47A',
  greenParents: '#4ADE80',
  red: '#FF5A6B',
  yellow: '#F5C542',
  borderBlue: '#3D8BFF',
  borderPurple: '#8B5CFF',
  borderMuted: '#2A3B6A',
  borderOrange: '#FF8A3C',
  /**
   * Lovable `--input`: hsl(230 40% 22%).
   * Unfocused textbox border (onboarding Input `border-input`).
   */
  inputBorder: '#212A47',
  /**
   * Lovable `--ring` / `--primary`: hsl(212 100% 55%).
   * Focus ring for the complete textbox control.
   */
  inputRing: '#198CFF',
  /**
   * Lovable `bg-background` on Input — darker than card surface.
   */
  inputBackground: '#080C21',
  progressTrack: '#243356',
  progressFill: '#FF8A3C',
  overlay: 'rgba(5, 10, 28, 0.55)',
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorToken = keyof typeof colors;
