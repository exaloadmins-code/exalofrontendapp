import { Href, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Award,
  ChevronDown,
  Hourglass,
  Lock,
  Sparkles,
} from 'lucide-react-native';
import {
  BADGE_FILTERS,
  BADGE_GROUPS,
  BADGES,
  BADGES_BORDER,
  BADGES_CARD,
  BADGES_CONTENT_MAX_WIDTH,
  BADGES_COPY,
  BADGES_FOREGROUND,
  BADGES_HERO_GRADIENT,
  BADGES_MUTED,
  BADGES_MUTED_FOREGROUND,
  BADGES_PAGE_PADDING_X,
  BADGES_PRIMARY,
  BADGES_PRIMARY_FOREGROUND,
  RARITY_STYLES,
  getBadgeStats,
  type Badge,
  type BadgeFilter,
  type BadgeRarity,
} from '@/constants/badges';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import { useAppContext } from '@/providers';
import { colors, fonts } from '@/theme';

/**
 * M8 — Lovable Achievements / Badges (`/badges` → `StreakBadges.tsx`).
 *
 * PageShell: max-w-md 448 + px-5, title "Achievements 🏅", hideHome → profile chip.
 * Data: local static Lovable BADGES catalog (not backend).
 * Icons: Lucide Lock / Hourglass / Award / Sparkles / ArrowLeft / ChevronDown;
 *        badge icons are genuine Lovable emoji.
 * Gradient: TP-072 expo-linear-gradient (hero violet→indigo→blue).
 */
export default function BadgesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const { profile } = useAppContext();
  const [filter, setFilter] = useState<BadgeFilter>('All');

  const name = profile.displayName?.trim() || 'Explorer';
  const avatarSource = resolveAvatarSource(profile.avatarId);

  const shellWidth = Math.min(BADGES_CONTENT_MAX_WIDTH, Math.max(0, width));
  const contentWidth = Math.max(0, shellWidth - BADGES_PAGE_PADDING_X * 2);
  /** Lovable `grid-cols-2 gap-3` — two equal columns. */
  const cardWidth = Math.max(0, (contentWidth - 12) / 2);
  /**
   * PageShell collision: back (40) + title + profile(min 56) must fit content.
   * Cap title maxWidth so the chip stays inside the shell without page-centering.
   */
  const BACK_BTN = 40;
  const PROFILE_MIN = 56;
  const titleMaxWidth = Math.max(96, contentWidth - BACK_BTN - PROFILE_MIN);

  const stats = useMemo(() => getBadgeStats(), []);

  const filtered = useMemo(
    () => (filter === 'All' ? BADGES : BADGES.filter((b) => b.category === filter)),
    [filter],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 96,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: '100%',
            maxWidth: BADGES_CONTENT_MAX_WIDTH,
            paddingHorizontal: BADGES_PAGE_PADDING_X,
          }}
        >
          {/* PageShell header — Lovable: flex items-center justify-between mb-6 */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={8}
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                  return;
                }
                router.replace(Routes.Home as Href);
              }}
              style={styles.headerRoundBtn}
            >
              <ArrowLeft size={20} color={BADGES_FOREGROUND} strokeWidth={2} />
            </Pressable>
            {/*
              Lovable h1 is natural-width (NOT flex-1, NOT absolute-centered).
              justify-between places equal free space on both sides of the title,
              so a wide profile chip pulls the title left of geometric center.
            */}
            <Text style={[styles.headerTitle, { maxWidth: titleMaxWidth }]} numberOfLines={1}>
              {BADGES_COPY.title} {BADGES_COPY.titleEmoji}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile menu"
              onPress={() => router.push(Routes.Profile as Href)}
              style={styles.profileChip}
            >
              <View style={styles.avatarCircle}>
                {avatarSource ? (
                  <Image
                    source={avatarSource}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    accessibilityLabel={`${name} avatar`}
                  />
                ) : (
                  <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <Text style={styles.profileName} numberOfLines={1}>
                {name}
              </Text>
              <ChevronDown size={16} color={BADGES_MUTED_FOREGROUND} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Summary hero */}
          <LinearGradient
            colors={[...BADGES_HERO_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, landscape && styles.heroLandscape]}
          >
            <View style={styles.heroEyebrow}>
              <Sparkles size={20} color={colors.white} strokeWidth={2} />
              <Text style={styles.heroEyebrowText}>{BADGES_COPY.summaryLine}</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.unlocked}</Text>
                <Text style={styles.statLabel}>{BADGES_COPY.badgesEarned}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>{BADGES_COPY.inProgress}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.pct}%</Text>
                <Text style={styles.statLabel}>{BADGES_COPY.collectionComplete}</Text>
              </View>
            </View>
            <View style={styles.heroProgressTrack}>
              <View style={[styles.heroProgressFill, { width: `${stats.pct}%` }]} />
            </View>
          </LinearGradient>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={styles.filterScroll}
          >
            {BADGE_FILTERS.map((f) => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setFilter(f)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {f}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Grouped sections */}
          {BADGE_GROUPS.map((group) => {
            const items = filtered.filter((b) => b.group === group);
            if (items.length === 0) {
              return null;
            }
            return (
              <View key={group} style={styles.section}>
                <Text style={styles.sectionTitle}>{group}</Text>
                <View style={styles.grid}>
                  {items.map((b) => (
                    <BadgeCard key={b.name} badge={b} width={cardWidth} />
                  ))}
                </View>
              </View>
            );
          })}

          {/* Rarity legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>{BADGES_COPY.rarityLegend}</Text>
            <View style={styles.legendRow}>
              {(Object.keys(RARITY_STYLES) as BadgeRarity[]).map((r) => (
                <View
                  key={r}
                  style={[styles.legendChip, { backgroundColor: RARITY_STYLES[r].chipBg }]}
                >
                  <Text style={[styles.legendChipText, { color: RARITY_STYLES[r].chipText }]}>
                    {RARITY_STYLES[r].label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BadgeCard({ badge, width }: { badge: Badge; width: number }) {
  const r = RARITY_STYLES[badge.rarity];
  const unlocked = badge.status === 'unlocked';
  const inProgress = badge.status === 'in_progress';
  const statusLabel = unlocked
    ? BADGES_COPY.statusUnlocked
    : inProgress
      ? BADGES_COPY.statusInProgress
      : BADGES_COPY.statusLocked;

  return (
    <View
      style={[
        styles.badgeCard,
        { width },
        unlocked
          ? {
              borderColor: r.ring,
              borderWidth: 2,
              shadowColor: BADGES_PRIMARY,
              shadowOpacity: 0.35,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
              elevation: 4,
            }
          : { opacity: 0.9 },
      ]}
    >
      <View style={styles.badgeCardTop}>
        <LinearGradient
          colors={[BADGES_MUTED, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.iconWell, !unlocked && styles.iconWellLocked]}
        >
          <Text style={[styles.iconEmoji, !unlocked && styles.iconEmojiLocked]}>{badge.icon}</Text>
          {badge.status === 'locked' ? (
            <View style={styles.statusBadge}>
              <Lock size={12} color={BADGES_MUTED_FOREGROUND} strokeWidth={2.25} />
            </View>
          ) : null}
          {inProgress ? (
            <View style={styles.statusBadge}>
              <Hourglass size={12} color="#FBBF24" strokeWidth={2.25} />
            </View>
          ) : null}
          {unlocked ? (
            <View style={styles.statusBadge}>
              <Award size={12} color="#FCD34D" strokeWidth={2.25} />
            </View>
          ) : null}
        </LinearGradient>
        <View style={[styles.rarityChip, { backgroundColor: r.chipBg }]}>
          <Text style={[styles.rarityChipText, { color: r.chipText }]}>{r.label}</Text>
        </View>
      </View>

      <Text style={styles.badgeName}>{badge.name}</Text>
      <Text style={styles.badgeDesc}>{badge.desc}</Text>

      {inProgress && typeof badge.progress === 'number' ? (
        <View style={styles.cardProgress}>
          <View style={styles.cardProgressTrack}>
            <View style={[styles.cardProgressFill, { width: `${badge.progress}%` }]} />
          </View>
          <Text style={styles.cardProgressLabel}>
            {badge.progress}
            {BADGES_COPY.progressSuffix}
          </Text>
        </View>
      ) : null}

      <Text style={styles.statusLabel}>{statusLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  /**
   * Lovable PageShell header: `flex items-center justify-between mb-6`.
   * No gap utility — free space is only via space-between.
   */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    minHeight: 40,
  },
  /** Lovable: `h-10 w-10 rounded-full bg-card border border-border`. */
  headerRoundBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: BADGES_CARD,
    borderWidth: 1,
    borderColor: BADGES_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  /**
   * Lovable: `text-2xl font-bold` — natural width (not flex-1 / not absolute).
   * maxWidth is applied at runtime from content − back − profile-min.
   */
  headerTitle: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    color: BADGES_FOREGROUND,
  },
  /** Lovable hideHome profile: `h-10 pl-1 pr-3 rounded-full … gap-2`. */
  profileChip: {
    height: 40,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: BADGES_CARD,
    borderWidth: 1,
    borderColor: BADGES_BORDER,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
    minWidth: 56,
  },
  avatarCircle: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: colors.blue,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 12,
    color: colors.white,
  },
  profileName: {
    flexShrink: 1,
    maxWidth: 80,
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 14,
    color: BADGES_FOREGROUND,
  },
  /** Lovable: `rounded-3xl p-5 mb-5`. */
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroLandscape: {
    paddingVertical: 16,
  },
  heroEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  heroEyebrowText: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  /** Lovable: `grid-cols-3 gap-3 mt-4`. */
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  /** Lovable: `rounded-2xl bg-white/10 … p-3`. */
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  /** Lovable: `text-2xl font-extrabold`. */
  statValue: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 32,
    color: colors.white,
  },
  /** Lovable: `text-xs opacity-90` — slightly tighter for narrow 3-col stats. */
  statLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  /** Lovable Progress `h-2 bg-white/20` + primary fill. */
  heroProgressTrack: {
    marginTop: 16,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: BADGES_PRIMARY,
  },
  filterScroll: {
    marginBottom: 16,
    marginHorizontal: -4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  /** Lovable filter: `px-3 py-1.5 rounded-full text-xs font-semibold border`. */
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: BADGES_CARD,
    borderWidth: 1,
    borderColor: BADGES_BORDER,
  },
  filterChipActive: {
    backgroundColor: BADGES_PRIMARY,
    borderColor: BADGES_PRIMARY,
  },
  filterChipText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 12,
    color: BADGES_FOREGROUND,
  },
  filterChipTextActive: {
    color: BADGES_PRIMARY_FOREGROUND,
  },
  /** Lovable: `mb-6` section. */
  section: { marginBottom: 24 },
  /** Lovable: `text-lg font-bold mb-3`. */
  sectionTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    color: BADGES_FOREGROUND,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  /** Lovable card: `rounded-2xl p-4 border bg-card`. */
  badgeCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: BADGES_CARD,
    borderWidth: 1,
    borderColor: BADGES_BORDER,
  },
  badgeCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  /** Lovable: `h-14 w-14 rounded-2xl … text-3xl`. */
  iconWell: {
    height: 56,
    width: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BADGES_BORDER,
    position: 'relative',
  },
  iconWellLocked: {
    opacity: 0.85,
  },
  iconEmoji: {
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
  },
  /** Native stand-in for Lovable CSS `grayscale` on locked icon wells. */
  iconEmojiLocked: {
    opacity: 0.55,
  },
  /** Lovable status glyph: `h-4 w-4 absolute -bottom-1 -right-1 … rounded-full p-0.5`. */
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    height: 18,
    width: 18,
    borderRadius: 9,
    backgroundColor: BADGES_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rarityChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  rarityChipText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 14,
  },
  /** Lovable: `font-bold text-sm`. */
  badgeName: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: BADGES_FOREGROUND,
  },
  /** Lovable: `text-xs text-muted-foreground mt-1 leading-snug`. */
  badgeDesc: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: BADGES_MUTED_FOREGROUND,
    marginTop: 4,
  },
  cardProgress: { marginTop: 12 },
  /** Lovable Progress `h-1.5`. */
  cardProgressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(139, 92, 246, 0.35)', // --secondary-ish track
    overflow: 'hidden',
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: BADGES_PRIMARY,
  },
  cardProgressLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    lineHeight: 14,
    color: BADGES_MUTED_FOREGROUND,
    marginTop: 4,
  },
  /** Lovable: `mt-2 text-[10px] uppercase tracking-wide`. */
  statusLabel: {
    marginTop: 8,
    fontFamily: fonts.display,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BADGES_MUTED_FOREGROUND,
  },
  /** Lovable legend: `rounded-2xl p-4 border … mt-2`. */
  legend: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BADGES_BORDER,
    backgroundColor: BADGES_CARD,
    marginTop: 8,
  },
  legendTitle: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: BADGES_MUTED_FOREGROUND,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  legendChipText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 14,
  },
});
