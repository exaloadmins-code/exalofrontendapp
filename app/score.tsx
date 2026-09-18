import { Href, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
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
import type { LucideIcon } from 'lucide-react-native';
import {
  ArrowLeft,
  ChevronDown,
  Mountain,
  Repeat,
  Target,
  Zap,
} from 'lucide-react-native';
import {
  SCORE_ACCENT,
  SCORE_BORDER,
  SCORE_BREAKDOWN,
  SCORE_CARD,
  SCORE_CONTENT_MAX_WIDTH,
  SCORE_COPY,
  SCORE_FOREGROUND,
  SCORE_HERO_GRADIENT,
  SCORE_HERO_MAX,
  SCORE_HERO_VALUE,
  SCORE_MUTED,
  SCORE_MUTED_FOREGROUND,
  SCORE_PAGE_PADDING_X,
  type ScoreBreakdownItem,
} from '@/constants/score';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import { useAppContext } from '@/providers';
import { colors, fonts } from '@/theme';

const BREAKDOWN_ICONS: Record<ScoreBreakdownItem['icon'], LucideIcon> = {
  Target,
  Zap,
  Repeat,
  Mountain,
};

/**
 * M8 — Lovable Exalo Score (`/score` → `Score.tsx`).
 *
 * PageShell: max-w-md 448 + px-5, title "Exalo Score 🚀", hideHome → profile chip.
 * Header: Lovable justify-between + natural-width title (Badges lesson — no absolute center).
 * Data: local static Lovable demo (62/100 + breakdown) — not backend.
 * Icons: Lucide Target / Zap / Repeat / Mountain / ArrowLeft / ChevronDown (TP-004).
 * Hero emoji 🚀 preserved. Gradient: TP-072 primary→secondary.
 */
export default function ScoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const { profile } = useAppContext();

  const name = profile.displayName?.trim() || 'Explorer';
  const avatarSource = resolveAvatarSource(profile.avatarId);

  const shellWidth = Math.min(SCORE_CONTENT_MAX_WIDTH, Math.max(0, width));
  const contentWidth = Math.max(0, shellWidth - SCORE_PAGE_PADDING_X * 2);
  const BACK_BTN = 40;
  const PROFILE_MIN = 56;
  const titleMaxWidth = Math.max(96, contentWidth - BACK_BTN - PROFILE_MIN);

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
            maxWidth: SCORE_CONTENT_MAX_WIDTH,
            paddingHorizontal: SCORE_PAGE_PADDING_X,
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
              <ArrowLeft size={20} color={SCORE_FOREGROUND} strokeWidth={2} />
            </Pressable>
            <Text style={[styles.headerTitle, { maxWidth: titleMaxWidth }]} numberOfLines={1}>
              {SCORE_COPY.title} {SCORE_COPY.titleEmoji}
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
              <ChevronDown size={16} color={SCORE_MUTED_FOREGROUND} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Hero score card */}
          <LinearGradient
            colors={[...SCORE_HERO_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, landscape && styles.heroLandscape]}
          >
            <Text style={styles.heroEyebrow}>{SCORE_COPY.yourScore}</Text>
            <Text style={styles.heroScore}>
              {SCORE_HERO_VALUE}
              <Text style={styles.heroScoreMax}>/{SCORE_HERO_MAX}</Text>
            </Text>
            <Text style={styles.heroSub}>{SCORE_COPY.rising}</Text>
          </LinearGradient>

          {/* Breakdown */}
          <Text style={styles.sectionTitle}>{SCORE_COPY.breakdown}</Text>
          <View style={styles.breakdownList}>
            {SCORE_BREAKDOWN.map((item) => {
              const Icon = BREAKDOWN_ICONS[item.icon];
              return (
                <View key={item.name} style={styles.breakdownCard}>
                  <View style={styles.breakdownRow}>
                    <Icon size={24} color={item.iconColor} strokeWidth={2} />
                    <Text style={styles.breakdownName}>{item.name}</Text>
                    <Text style={styles.breakdownValue}>{item.value}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${item.value}%` }]} />
                  </View>
                  <Text style={styles.breakdownDesc}>{item.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%' },
  /** Lovable PageShell: `flex items-center justify-between mb-6`. */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    minHeight: 40,
  },
  headerRoundBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: SCORE_CARD,
    borderWidth: 1,
    borderColor: SCORE_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  /** Lovable: `text-2xl font-bold` — natural width, not absolute-centered. */
  headerTitle: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    color: SCORE_FOREGROUND,
  },
  profileChip: {
    height: 40,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: SCORE_CARD,
    borderWidth: 1,
    borderColor: SCORE_BORDER,
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
    color: SCORE_FOREGROUND,
  },
  /** Lovable: `rounded-3xl … p-8 … mb-6`. */
  hero: {
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroLandscape: {
    paddingVertical: 24,
  },
  /** Lovable: `text-sm uppercase tracking-widest opacity-90`. */
  heroEyebrow: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 2.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.9)',
  },
  /** Lovable: `text-7xl font-extrabold my-2`. */
  heroScore: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 72,
    lineHeight: 80,
    color: colors.white,
    marginVertical: 8,
  },
  /** Lovable: `text-3xl opacity-80` on /100. */
  heroScoreMax: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 30,
    lineHeight: 36,
    color: 'rgba(255,255,255,0.8)',
  },
  /** Lovable: `opacity-90`. */
  heroSub: {
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.9)',
  },
  /** Lovable: `text-xl font-bold mb-3`. */
  sectionTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 28,
    color: SCORE_FOREGROUND,
    marginBottom: 12,
  },
  /** Lovable: `space-y-3`. */
  breakdownList: {
    gap: 12,
  },
  /** Lovable: `rounded-2xl bg-card border border-border p-4`. */
  breakdownCard: {
    borderRadius: 16,
    backgroundColor: SCORE_CARD,
    borderWidth: 1,
    borderColor: SCORE_BORDER,
    padding: 16,
  },
  /** Lovable: `flex items-center gap-3 mb-2`. */
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  /** Lovable: `font-bold flex-1`. */
  breakdownName: {
    flex: 1,
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    color: SCORE_FOREGROUND,
  },
  /** Lovable: `text-muted-foreground`. */
  breakdownValue: {
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 24,
    color: SCORE_MUTED_FOREGROUND,
  },
  /** Lovable: `h-2 bg-muted rounded-full … mb-2`. */
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: SCORE_MUTED,
    overflow: 'hidden',
    marginBottom: 8,
  },
  /** Lovable: `h-full bg-accent`. */
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: SCORE_ACCENT,
  },
  /** Lovable: `text-xs text-muted-foreground`. */
  breakdownDesc: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: SCORE_MUTED_FOREGROUND,
  },
});
