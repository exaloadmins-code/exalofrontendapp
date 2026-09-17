import { useThemeContext, type AppTheme } from '@/providers/ThemeProvider';

/**
 * Access EXALO theme tokens from ThemeProvider.
 */
export function useAppTheme(): AppTheme {
  return useThemeContext();
}
