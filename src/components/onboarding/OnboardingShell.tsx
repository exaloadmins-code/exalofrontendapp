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
import { OnboardingHeader } from './OnboardingHeader';
import { OnboardingMotivationalFooter } from './OnboardingMotivationalFooter';
import { useDeviceLayout } from '@/responsive';
import { colors } from '@/theme';

type OnboardingShellProps = {
  step: number;
  onBack?: () => void;
  children: ReactNode;
  /** Extra style on the inner card column. */
  cardStyle?: ViewStyle;
  showFooter?: boolean;
};

/**
 * Lovable onboarding chrome:
 * gradient page · back + progress · rounded card · motivational footer.
 * Column capped near Lovable `max-w-md` on tablets; phone uses full usable width.
 */
export function OnboardingShell({
  step,
  onBack,
  children,
  cardStyle,
  showFooter = true,
}: OnboardingShellProps) {
  const { isTablet, isLandscape, contentWidth } = useDeviceLayout();

  const columnMax = isTablet ? (isLandscape ? 480 : 448) : Math.min(contentWidth - 32, 400);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.gradientTop} pointerEvents="none" />
      <View style={styles.gradientMid} pointerEvents="none" />
      <SafeAreaView style={styles.flex} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.column, { maxWidth: columnMax }]}>
              <OnboardingHeader step={step} onBack={onBack} />
              <View style={[styles.card, cardStyle]}>{children}</View>
              {showFooter ? <OnboardingMotivationalFooter /> : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  /** Approximate Lovable `--gradient-bg` radial ellipse (no new gradient package). */
  gradientTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0A1433',
  },
  gradientMid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(20, 36, 72, 0.55)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
});
