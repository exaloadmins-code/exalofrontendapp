import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';

type SecondaryButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * Quiet text / outline action (e.g. “Skip for now”).
 */
export function SecondaryButton({
  label,
  onPress,
  disabled = false,
  style,
}: SecondaryButtonProps) {
  const { s, fs } = useResponsiveScale();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
          minHeight: s(44),
          paddingHorizontal: s(12),
          borderRadius: s(radius.md),
        },
        style,
      ]}
    >
      <Text style={[typography.body, { fontSize: fs(15), color: colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
