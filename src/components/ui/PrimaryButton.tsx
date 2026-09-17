import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, shadows, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';

export type ButtonTone = 'purple' | 'blue' | 'orange' | 'red' | 'green';

type PrimaryButtonProps = {
  label: string;
  onPress?: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
  fullWidth?: boolean;
  showChevron?: boolean;
  style?: ViewStyle;
};

const TONE_BG: Record<ButtonTone, string> = {
  purple: colors.purple,
  blue: colors.blue,
  orange: colors.orange,
  red: colors.red,
  green: colors.green,
};

/**
 * Filled EXALO CTA — purple Continue, blue actions, etc.
 */
export function PrimaryButton({
  label,
  onPress,
  tone = 'purple',
  disabled = false,
  fullWidth = true,
  showChevron = true,
  style,
}: PrimaryButtonProps) {
  const { s, fs } = useResponsiveScale();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        shadows.glowPurple,
        {
          backgroundColor: TONE_BG[tone],
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          minHeight: s(52),
          borderRadius: s(radius.button),
          paddingHorizontal: s(20),
          alignSelf: fullWidth ? 'stretch' : 'center',
          shadowColor: TONE_BG[tone],
        },
        style,
      ]}
    >
      <Text style={[typography.button, { fontSize: fs(16) }]}>
        {label}
        {showChevron ? '  >' : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
