import { ReactNode } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';
import { BackButton } from '../navigation/BackButton';

type ScreenHeaderProps = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: ReactNode;
  leftSlot?: ReactNode;
  style?: ViewStyle;
};

/**
 * Top chrome: optional back control, title stack, and right-side slot (e.g. ProfilePill).
 */
export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightSlot,
  leftSlot,
  style,
}: ScreenHeaderProps) {
  const { fs, s } = useResponsiveScale();

  return (
    <View style={[styles.row, { minHeight: s(52), marginBottom: s(spacing.md) }, style]}>
      <View style={styles.side}>
        {leftSlot}
        {showBack ? <BackButton onPress={onBack} /> : null}
      </View>

      <View style={styles.center}>
        {title ? (
          <Text style={[typography.heading, { fontSize: fs(22), textAlign: 'center' }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            style={[
              typography.caption,
              { fontSize: fs(13), textAlign: 'center', color: colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    minWidth: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
});
