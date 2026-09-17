import { Pressable, StyleSheet, View } from 'react-native';
import { colors, shadows } from '@/theme';
import { useResponsiveScale } from '@/hooks';

type BackButtonProps = {
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Circular dark back control with a white chevron — matches onboarding/home chrome.
 */
export function BackButton({
  onPress,
  accessibilityLabel = 'Go back',
}: BackButtonProps) {
  const { s } = useResponsiveScale();
  const size = s(40);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        shadows.soft,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.chevron,
          {
            width: s(10),
            height: s(10),
            borderLeftWidth: s(2.5),
            borderBottomWidth: s(2.5),
            marginLeft: s(3),
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    borderColor: colors.textPrimary,
    transform: [{ rotate: '45deg' }],
  },
});
