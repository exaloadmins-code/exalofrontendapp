import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SpaceBackground } from './SpaceBackground';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsive } from '@/hooks/useResponsive';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  avoidKeyboard?: boolean;
  showBackground?: boolean;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
};

/**
 * Canonical EXALO screen wrapper.
 * Uses capped design-width scaling from `useResponsive` (never upscales past 390).
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  avoidKeyboard = false,
  showBackground = true,
  statusBarStyle = 'light',
  style,
  contentStyle,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const { colors } = useAppTheme();
  const { screenPaddingX, contentMaxWidth } = useResponsive();

  const content = (
    <View style={[styles.page, padded && { paddingHorizontal: screenPaddingX }]}>
      <View style={[styles.constrain, { maxWidth: contentMaxWidth }, contentStyle]}>
        {children}
      </View>
    </View>
  );

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    <View style={styles.flex}>{content}</View>
  );

  const framed = avoidKeyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      {body}
    </KeyboardAvoidingView>
  ) : (
    body
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.backgroundDark }, style]}>
      <StatusBar style={statusBarStyle} />
      {showBackground ? (
        <SpaceBackground />
      ) : (
        <View style={[styles.solidFill, { backgroundColor: colors.backgroundDark }]} />
      )}
      <SafeAreaView style={styles.flex} edges={edges}>
        {framed}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  flex: {
    flex: 1,
    width: '100%',
  },
  solidFill: {
    ...StyleSheet.absoluteFill,
  },
  page: {
    flexGrow: 1,
    width: '100%',
  },
  constrain: {
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
});
