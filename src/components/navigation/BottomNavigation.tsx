import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationAssets } from '@/constants';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { useResponsiveScale } from '@/hooks';

export type BottomNavTab = 'home' | 'parents';

type BottomNavigationProps = {
  activeTab?: BottomNavTab;
  onTabPress?: (tab: BottomNavTab) => void;
  score?: number | string;
  scoreMax?: number;
  showScore?: boolean;
};

/**
 * EXALO bottom chrome: Home, optional score cluster, Parents.
 */
export function BottomNavigation({
  activeTab = 'home',
  onTabPress,
  score = 62,
  scoreMax = 100,
  showScore = true,
}: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { s, fs } = useResponsiveScale();

  return (
    <View
      style={[
        styles.wrap,
        shadows.medium,
        {
          paddingBottom: Math.max(insets.bottom, s(10)),
          paddingTop: s(10),
          borderRadius: s(radius.xxl),
          marginHorizontal: s(spacing.sm),
          marginBottom: s(spacing.sm),
        },
      ]}
    >
      <NavItem
        label="HOME"
        active={activeTab === 'home'}
        accent={colors.blue}
        icon={NavigationAssets.home}
        onPress={() => onTabPress?.('home')}
        size={s(44)}
        fontSize={fs(10)}
      />

      {showScore ? (
        <View style={styles.scoreCluster}>
          <Text style={[typography.nav, { color: colors.yellow, fontSize: fs(10) }]}>
            ✦ EXALO SCORE ✦
          </Text>
          <Text style={[typography.score, { fontSize: fs(26), marginTop: s(2) }]}>
            {score}
            <Text style={{ color: colors.textSecondary, fontSize: fs(16) }}> /{scoreMax}</Text>
          </Text>
          <View style={styles.rays}>
            <View style={[styles.ray, { backgroundColor: colors.orange }]} />
            <View style={[styles.ray, { backgroundColor: colors.blue, transform: [{ rotate: '25deg' }] }]} />
            <View style={[styles.ray, { backgroundColor: colors.yellow, transform: [{ rotate: '-20deg' }] }]} />
          </View>
        </View>
      ) : (
        <View style={styles.scoreSpacer} />
      )}

      <NavItem
        label="PARENTS"
        active={activeTab === 'parents'}
        accent={colors.greenParents}
        icon={NavigationAssets.parents}
        onPress={() => onTabPress?.('parents')}
        size={s(44)}
        fontSize={fs(10)}
      />
    </View>
  );
}

type NavItemProps = {
  label: string;
  active: boolean;
  accent: string;
  icon: number;
  onPress: () => void;
  size: number;
  fontSize: number;
};

function NavItem({ label, active, accent, icon, onPress, size, fontSize }: NavItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={styles.navItem}
    >
      <Image source={icon} style={{ width: size, height: size }} resizeMode="contain" />
      <Text style={[typography.nav, { color: accent, fontSize, marginTop: 4 }]}>{label}</Text>
      <View
        style={[
          styles.dot,
          { backgroundColor: accent, opacity: active ? 1 : 0.35, width: 6, height: 6 },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing.lg,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  dot: {
    borderRadius: radius.circle,
    marginTop: 4,
  },
  scoreCluster: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  scoreSpacer: {
    flex: 1,
  },
  rays: {
    position: 'absolute',
    width: 70,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  ray: {
    position: 'absolute',
    width: 10,
    height: 2,
    borderRadius: 2,
  },
});
