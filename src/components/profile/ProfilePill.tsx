import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { AvatarAssets } from '@/constants';
import { colors, radius, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';

type ProfilePillProps = {
  name: string;
  avatar?: ImageSourcePropType;
  onPress?: () => void;
};

/**
 * Compact profile control used in Home / Maths headers.
 */
export function ProfilePill({
  name,
  avatar = AvatarAssets.avatar1,
  onPress,
}: ProfilePillProps) {
  const { s, fs } = useResponsiveScale();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name} profile`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        {
          opacity: pressed ? 0.85 : 1,
          paddingVertical: s(6),
          paddingLeft: s(6),
          paddingRight: s(12),
          maxWidth: s(160),
        },
      ]}
    >
      <Image
        source={avatar}
        style={{
          width: s(28),
          height: s(28),
          borderRadius: s(14),
          marginRight: s(8),
        }}
      />
      <Text style={[typography.label, { fontSize: fs(13), flexShrink: 1 }]} numberOfLines={1}>
        {name}
      </Text>
      <View
        style={[
          styles.caret,
          {
            marginLeft: s(6),
            borderLeftWidth: s(4),
            borderRightWidth: s(4),
            borderTopWidth: s(5),
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderPurple,
  },
  caret: {
    width: 0,
    height: 0,
    borderLeftColor: colors.transparent,
    borderRightColor: colors.transparent,
    borderTopColor: colors.textSecondary,
  },
});
