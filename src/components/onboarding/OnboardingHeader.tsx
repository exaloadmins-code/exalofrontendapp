import { StyleSheet, View, ViewStyle } from 'react-native';
import { BackButton } from '@/components/navigation/BackButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useResponsive } from '@/hooks';

type OnboardingHeaderProps = {
  step: number;
  total?: number;
  onBack?: () => void;
  style?: ViewStyle;
};

/**
 * Lovable onboarding chrome: back row, then full-width “n of 5” progress.
 */
export function OnboardingHeader({ step, total = 5, onBack, style }: OnboardingHeaderProps) {
  const { s } = useResponsive();

  return (
    <View style={[styles.wrap, { marginBottom: s(12) }, style]}>
      <View style={[styles.backRow, { marginBottom: s(12) }]}>
        <BackButton onPress={onBack} />
      </View>
      <ProgressBar step={step} total={total} showLabel />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
