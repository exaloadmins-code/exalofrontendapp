/**
 * Font family tokens.
 * TP-001 Fredoka loaded via expo-font as family name `Fredoka`.
 */
export const fonts = {
  display: 'Fredoka',
  system: 'System',
} as const;

export type FontToken = keyof typeof fonts;
