import { TextStyle } from 'react-native';
import { colors } from './colors';
import { fonts } from './fonts';

/**
 * Typography hierarchy for EXALO screens.
 * Display face: TP-001 Fredoka (OFL-1.1) via `fonts.display`.
 */
export const typography = {
  display: {
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    lineHeight: 38,
  } satisfies TextStyle,
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.1,
    lineHeight: 32,
  } satisfies TextStyle,
  heading: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 26,
  } satisfies TextStyle,
  subheading: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 24,
  } satisfies TextStyle,
  body: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 22,
  } satisfies TextStyle,
  bodySecondary: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 21,
  } satisfies TextStyle,
  caption: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  } satisfies TextStyle,
  label: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.4,
    lineHeight: 18,
  } satisfies TextStyle,
  button: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.2,
    lineHeight: 20,
  } satisfies TextStyle,
  nav: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    lineHeight: 14,
  } satisfies TextStyle,
  score: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
    lineHeight: 34,
  } satisfies TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
