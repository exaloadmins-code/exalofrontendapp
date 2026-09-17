import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from '@/theme';
import { useResponsiveScale } from '@/hooks';

export type CardTone = 'default' | 'blue' | 'purple' | 'orange' | 'red' | 'green';

type CardProps = {
  children: ReactNode;
  tone?: CardTone;
  padded?: boolean;
  style?: ViewStyle;
};

const BORDER: Record<CardTone, string> = {
  default: colors.borderMuted,
  blue: colors.borderBlue,
  purple: colors.borderPurple,
  orange: colors.borderOrange,
  red: colors.red,
  green: colors.green,
};

/**
 * Elevated navy surface used for onboarding panels and content blocks.
 */
export function Card({ children, tone = 'default', padded = true, style }: CardProps) {
  const { s } = useResponsiveScale();

  return (
    <View
      style={[
        styles.card,
        shadows.soft,
        {
          borderColor: BORDER[tone],
          borderRadius: s(radius.card),
          padding: padded ? s(spacing.xl) : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
});
