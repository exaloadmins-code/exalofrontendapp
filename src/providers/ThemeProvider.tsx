import { ReactNode, createContext, useContext, useMemo } from 'react';
import {
  colors,
  radius,
  shadows,
  spacing,
  typography,
  type ColorToken,
  type RadiusToken,
  type ShadowToken,
  type SpacingToken,
  type TypographyToken,
} from '@/theme';

export type AppTheme = {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  radius: typeof radius;
  shadows: typeof shadows;
};

const themeValue: AppTheme = {
  colors,
  spacing,
  typography,
  radius,
  shadows,
};

const ThemeContext = createContext<AppTheme>(themeValue);

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * Provides the central EXALO theme tokens to the tree.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const value = useMemo(() => themeValue, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): AppTheme {
  return useContext(ThemeContext);
}

export type { ColorToken, RadiusToken, ShadowToken, SpacingToken, TypographyToken };
