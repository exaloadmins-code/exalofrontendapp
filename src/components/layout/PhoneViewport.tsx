import { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native';
import { colors } from '@/theme';
import { MVP } from '@/responsive';

type PhoneViewportProps = {
  children: ReactNode;
};

/**
 * Web shell:
 * - Always matches the **visible** viewport height (never BASE_HEIGHT 844).
 *   Landscape (e.g. 844×390) must not force a tall portrait minHeight — that made
 *   Home contain into an 844-tall surface while only 390px was on screen.
 * - Viewport ≤ 430 (phone MVP): full width
 * - Viewport 431–599: center a 430-wide phone shell
 * - Viewport ≥ 600: full width up to 1024
 * Native: full-bleed flex
 */
export function PhoneViewport({ children }: PhoneViewportProps) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web') {
    return <View style={styles.nativeRoot}>{children}</View>;
  }

  const isTabletRange = width >= MVP.tabletMinWidth;
  const isPhoneSizedWindow = width <= MVP.phoneMaxWidth;

  const shellStyle: ViewStyle = {
    width: '100%',
    height,
    maxHeight: height,
    flexGrow: 1,
    flexShrink: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  };

  if (isTabletRange) {
    shellStyle.maxWidth = MVP.tabletMaxWidth;
  } else if (!isPhoneSizedWindow) {
    shellStyle.maxWidth = MVP.phoneMaxWidth;
  }

  return (
    <View style={[styles.webPage, { backgroundColor: colors.background, height, maxHeight: height }]}>
      <View style={shellStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  nativeRoot: {
    flex: 1,
  },
  webPage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
