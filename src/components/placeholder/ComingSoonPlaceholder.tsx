import { Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Routes } from '@/constants/routes';
import { useDeviceLayout } from '@/responsive';
import { colors, fonts, spacing } from '@/theme';

type PlaceholderProps = {
  title: string;
  subtitle?: string;
};

/**
 * M3+ destination placeholder — keeps Journey / Home navigation live.
 * Prefer router.back() when the user arrived from Journey; otherwise Home.
 */
export function ComingSoonPlaceholder({ title, subtitle }: PlaceholderProps) {
  const router = useRouter();
  const layout = useDeviceLayout();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.Home as Href);
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: layout.safeAreaInsets.top + spacing.lg,
          paddingBottom: layout.safeAreaInsets.bottom + spacing.lg,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <Text style={styles.brand}>EXALO</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>
        {subtitle ??
          'This destination is coming next. Home navigation is wired — full gameplay and backend screens arrive in later milestones.'}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={goBack}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
    justifyContent: 'center',
    gap: spacing.md,
  },
  brand: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 28,
    color: colors.orange,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 24,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.display,
    fontWeight: '500',
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 420,
  },
  button: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  buttonLabel: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 16,
    color: colors.white,
  },
});
