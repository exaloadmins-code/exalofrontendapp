import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';

export type ChipTone = 'default' | 'blue' | 'orange' | 'red' | 'green' | 'purple';

type ChipProps = {
  label: string;
  selected?: boolean;
  tone?: ChipTone;
  onPress?: () => void;
  style?: ViewStyle;
};

const SELECTED: Record<ChipTone, { border: string; text: string }> = {
  default: { border: colors.borderBlue, text: colors.textPrimary },
  blue: { border: colors.blue, text: colors.blueSoft },
  orange: { border: colors.orange, text: colors.orange },
  red: { border: colors.red, text: colors.red },
  green: { border: colors.green, text: colors.green },
  purple: { border: colors.purple, text: colors.purple },
};

/**
 * Selectable pill / difficulty / year chip.
 */
export function Chip({
  label,
  selected = false,
  tone = 'default',
  onPress,
  style,
}: ChipProps) {
  const { s, fs } = useResponsiveScale();
  const palette = SELECTED[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          opacity: pressed ? 0.85 : 1,
          minHeight: s(44),
          paddingHorizontal: s(16),
          borderRadius: s(radius.lg),
          borderColor: selected ? palette.border : colors.borderMuted,
          backgroundColor: selected ? colors.backgroundElevated : colors.backgroundChip,
        },
        style,
      ]}
    >
      <Text
        style={[
          typography.label,
          {
            fontSize: fs(14),
            color: selected ? palette.text : colors.textPrimary,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
