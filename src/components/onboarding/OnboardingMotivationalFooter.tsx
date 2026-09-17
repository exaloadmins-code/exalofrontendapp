import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, typography } from '@/theme';
import { useResponsive } from '@/hooks';

type OnboardingMotivationalFooterProps = {
  style?: ViewStyle;
};

/**
 * Motivational footer shown below onboarding cards (matches reference copy).
 */
export function OnboardingMotivationalFooter({ style }: OnboardingMotivationalFooterProps) {
  const { fs, s } = useResponsive();

  return (
    <View style={[styles.wrap, { marginTop: s(22), paddingBottom: s(10) }, style]}>
      <Text style={[typography.caption, { fontSize: fs(13), color: colors.textPrimary, textAlign: 'center', lineHeight: fs(18) }]}>
        🚀 Your journey to success starts now.
      </Text>
      <Text
        style={[
          typography.label,
          {
            fontSize: fs(14),
            color: colors.orange,
            textAlign: 'center',
            marginTop: s(6),
          },
        ]}
      >
        Let's fly high together! ✨
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
