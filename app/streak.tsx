import { Href, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import type { LucideIcon } from 'lucide-react-native';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  Flame,
  HeartCrack,
  Palmtree,
  Rocket,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import {
  FREEZE_CAP,
  STREAK_ACCENT_GLOW,
  STREAK_CONTENT_MAX_WIDTH,
  STREAK_COPY,
  STREAK_CTA_PADDING_X,
  STREAK_DAY_LABELS,
  STREAK_INSIGHT_DEMO,
  STREAK_MUTED_FOREGROUND,
  STREAK_PAGE_PADDING_X,
  STREAK_PRIMARY_GLOW,
  STREAK_STICKY_BOTTOM_OFFSET,
  STREAK_SUCCESS,
} from '@/constants/streak';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import { useAppContext } from '@/providers';
import {
  STREAK_STATUS_META,
  consumeShieldMessage,
  getHistoryDays,
  getStreakView,
  type HistoryDay,
  type StreakStatus,
  type StreakView,
} from '@/services/streak';
import { colors, fonts } from '@/theme';

/** Lovable `bg-card/80` + `border-border/60` from index.css HSL tokens. */
const CARD_BG = 'rgba(18, 24, 54, 0.8)';
const CARD_BORDER = 'rgba(34, 41, 79, 0.6)';
/** Lovable calendar `gap-1.5` = 0.375rem = 6px. */
const GRID_GAP = 6;
/** Tailwind `sm` breakpoint — Lovable hero `sm:text-5xl`. */
const SM_BREAKPOINT = 640;

/**
 * Shields stat icon (production adaptation under TP-004):
 * Lovable web source uses genuine emoji `🛡` at `text-2xl`.
 * Expo uses deterministic Lucide `Shield` because platform emoji contrast
 * on navy cards is unacceptably low / non-deterministic across iOS/Android/web.
 * Size 24 ≈ text-2xl; stroke uses Lovable `--foreground` (light) for parity
 * prominence with Current/Best emoji on navy `bg-card/80`.
 */
const SHIELD_STAT_SIZE = 24;
const SHIELD_STAT_STROKE = 2.25;
const SHIELD_STAT_COLOR = '#F8FAFC'; // Lovable --foreground hsl(210 40% 98%)

const INSIGHT_CARD_BG: Record<string, string> = {
  'Best streak': 'rgba(249, 115, 22, 0.18)',
  'Average streak': 'rgba(26, 133, 255, 0.16)',
  'Most active': 'rgba(255, 130, 41, 0.16)',
  'More consistent than': 'rgba(34, 195, 101, 0.16)',
};

/** TP-004 — Lucide status icons (Lovable STATUS_STYLES). */
const STATUS_ICONS: Record<StreakStatus, LucideIcon> = {
  Active: Flame,
  Protected: Shield,
  'Grace Window': AlertTriangle,
  'Holiday Mode': Palmtree,
  Broken: HeartCrack,
};

function heroEmoji(streak: number): string {
  if (streak >= 30) {
    return '🚀';
  }
  if (streak >= 7) {
    return '🔥';
  }
  return '✨';
}

/**
 * M8A — Lovable Streak (`/streak`) native Expo parity.
 *
 * TP-072 expo-linear-gradient — hero (and CTA) multi-stop gradients.
 * TP-004 lucide-react-native — Lucide where Lovable uses Lucide; Current/Best
 * keep genuine emoji. Shields stat uses Lucide Shield (production contrast adaptation).
 * Width: max-w-md 448 + px-5 / sticky px-4 (accepted).
 * Sticky: Lovable bottom-20 (80) + insets.bottom.
 */
export default function StreakScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const { profile, setProfileState } = useAppContext();

  const [view, setView] = useState<StreakView | null>(null);
  const [grid, setGrid] = useState<HistoryDay[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [shieldMsg, setShieldMsg] = useState<string | null>(null);

  const name = profile.displayName?.trim() || 'Explorer';
  const avatarSource = resolveAvatarSource(profile.avatarId);

  /** Lovable PageShell: max-w-md (448) border-box with px-5 inside. */
  const shellWidth = Math.min(STREAK_CONTENT_MAX_WIDTH, Math.max(0, width));
  const contentWidth = Math.max(0, shellWidth - STREAK_PAGE_PADDING_X * 2);
  const calWidth = Math.max(0, contentWidth - 40);
  const daySize = useMemo(
    () => Math.max(24, (calWidth - GRID_GAP * 6) / 7),
    [calWidth],
  );
  const heroTitleSize = width >= SM_BREAKPOINT ? 48 : 36;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await getStreakView();
      const days = await getHistoryDays();
      const msg = await consumeShieldMessage();
      if (cancelled) {
        return;
      }
      setView(next);
      setGrid(days);
      setShieldMsg(msg);
      if (profile.streak !== next.current_streak) {
        await setProfileState({ ...profile, streak: next.current_streak });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!view) {
    return <View style={[styles.root, { backgroundColor: colors.background }]} />;
  }

  const STREAK = view.current_streak;
  const BEST = view.best_streak;
  const SHIELDS = view.freeze_days;
  const TODAY_MINUTES = view.today_minutes;
  const GOAL_MINUTES = view.goal_minutes;
  const statusMeta = STREAK_STATUS_META[view.status];
  const StatusIcon = STATUS_ICONS[view.status];
  const progressPct = Math.min(100, Math.round((TODAY_MINUTES / GOAL_MINUTES) * 100));
  const todayState =
    TODAY_MINUTES === 0
      ? 'Not started'
      : TODAY_MINUTES >= GOAL_MINUTES
        ? 'Completed'
        : 'In progress';
  const heroScale = Math.min(1.15, 1 + STREAK * 0.01);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 112,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: '100%',
            maxWidth: STREAK_CONTENT_MAX_WIDTH,
            paddingHorizontal: STREAK_PAGE_PADDING_X,
          }}
        >
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
              <ArrowLeft size={20} color={colors.white} strokeWidth={2} />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {STREAK_COPY.title} {STREAK_COPY.titleEmoji}
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
              <ChevronDown size={16} color={STREAK_MUTED_FOREGROUND} strokeWidth={2} />
            </Pressable>
          </View>

          {shieldMsg ? (
            <View style={styles.shieldBanner}>
              <Shield size={16} color={STREAK_PRIMARY_GLOW} strokeWidth={2} />
              <Text style={styles.shieldText}>{shieldMsg}</Text>
            </View>
          ) : null}

          <LinearGradient
            colors={['#F97316', '#F43F5E', '#C026D3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, landscape && styles.heroLandscape]}
          >
            <View style={styles.heroBlobTop} pointerEvents="none" />
            <View style={styles.heroBlobBottom} pointerEvents="none" />
            <View style={styles.heroRow}>
              <View style={styles.heroOrbWrap}>
                <View style={styles.heroOrbGlow} pointerEvents="none" />
                <LinearGradient
                  colors={['#FDE047', '#F97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.heroOrb, { transform: [{ scale: heroScale }] }]}
                >
                  <Text style={styles.heroOrbEmoji}>{heroEmoji(STREAK)}</Text>
                </LinearGradient>
              </View>
              <View style={styles.heroCopy}>
                <Text
                  style={[
                    styles.heroStreak,
                    { fontSize: heroTitleSize, lineHeight: heroTitleSize },
                  ]}
                >
                  🔥 {STREAK} Day{STREAK === 1 ? '' : 's'}
                </Text>
                <Text style={styles.heroSub}>
                  You learn for at least {GOAL_MINUTES} minutes every day
                </Text>
                <View style={styles.statusPill}>
                  <StatusIcon size={14} color={colors.white} strokeWidth={2.25} />
                  <Text style={styles.statusPillText}>{view.status}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Stats — Current/Best: Lovable emoji. Shields: Lucide adaptation (TP-004). */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji} allowFontScaling={false}>
                🔥
              </Text>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={styles.statValue}>{String(STREAK)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji} allowFontScaling={false}>
                ⭐
              </Text>
              <Text style={styles.statLabel}>Best</Text>
              <Text style={styles.statValue}>{String(BEST)}</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconSlot}>
                <Shield
                  size={SHIELD_STAT_SIZE}
                  color={SHIELD_STAT_COLOR}
                  strokeWidth={SHIELD_STAT_STROKE}
                />
              </View>
              <Text style={styles.statLabel}>Shields</Text>
              <Text style={styles.statValue}>
                {String(SHIELDS)}
                <Text style={styles.statSuffix}>/{FREEZE_CAP}</Text>
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusCard,
              { backgroundColor: statusMeta.bg, borderColor: statusMeta.border },
            ]}
          >
            <View style={styles.statusCardHeader}>
              <StatusIcon size={20} color={statusMeta.text} strokeWidth={2} />
              <View>
                <Text style={[styles.statusEyebrow, { color: statusMeta.text }]}>
                  Current Status
                </Text>
                <Text style={[styles.statusTitle, { color: statusMeta.text }]}>{view.status}</Text>
              </View>
            </View>
            <Text style={[styles.statusMessage, { color: statusMeta.text }]}>
              {view.status_message}
            </Text>
          </View>

          {view.status !== 'Broken' && view.status !== 'Holiday Mode' ? (
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Flame size={20} color={STREAK_ACCENT_GLOW} strokeWidth={2} />
                <Text style={styles.cardTitle}>{STREAK_COPY.keepAliveTitle}</Text>
              </View>
              <Text style={styles.cardMuted}>
                Complete {GOAL_MINUTES} minutes today to keep your streak going.
              </Text>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#FB923C', '#F43F5E']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[styles.progressFill, { width: `${progressPct}%` }]}
                />
              </View>
              <View style={styles.progressMeta}>
                <Text style={styles.metaXs}>
                  {TODAY_MINUTES} / {GOAL_MINUTES} mins today
                </Text>
                <Text
                  style={[
                    styles.todayState,
                    todayState === 'Completed'
                      ? { color: STREAK_SUCCESS }
                      : todayState === 'In progress'
                        ? { color: STREAK_ACCENT_GLOW }
                        : { color: STREAK_MUTED_FOREGROUND },
                  ]}
                >
                  Today: {todayState}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.calHeader}>
              <Text style={styles.cardTitle}>{STREAK_COPY.calendarTitle}</Text>
              <View style={styles.legendRow}>
                <LegendDot color={STREAK_SUCCESS} label={STREAK_COPY.legendActive} />
                <LegendDot color={'#1F2547'} label={STREAK_COPY.legendMissed} />
                <LegendDot color="transparent" label={STREAK_COPY.legendToday} ring />
              </View>
            </View>
            <View style={[styles.weekRow, { gap: GRID_GAP }]}>
              {STREAK_DAY_LABELS.map((d, i) => (
                <Text key={`${d}-${i}`} style={[styles.weekLabel, { width: daySize }]}>
                  {d}
                </Text>
              ))}
            </View>
            <View style={[styles.grid, { width: daySize * 7 + GRID_GAP * 6, gap: GRID_GAP }]}>
              {grid.map((g, i) => {
                const isToday = i === grid.length - 1;
                const isSelected = selected === i;
                const completedToday = isToday && TODAY_MINUTES >= GOAL_MINUTES;
                const bg =
                  g.active || completedToday
                    ? 'rgba(34, 195, 101, 0.8)'
                    : isToday
                      ? CARD_BG
                      : 'rgba(31, 37, 71, 0.6)';
                const fg =
                  g.active || completedToday
                    ? colors.white
                    : isToday
                      ? colors.white
                      : STREAK_MUTED_FOREGROUND;
                return (
                  <Pressable
                    key={g.key}
                    accessibilityRole="button"
                    accessibilityLabel={g.date.toDateString()}
                    onPress={() => setSelected(isSelected ? null : i)}
                    style={[
                      styles.dayCell,
                      {
                        width: daySize,
                        height: daySize,
                        backgroundColor: bg,
                      },
                      isToday && styles.dayToday,
                      isSelected && styles.daySelected,
                    ]}
                  >
                    <Text style={[styles.dayText, { color: fg }]}>{g.date.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>
            {selected !== null && grid[selected] ? (
              <View style={styles.dayDetail}>
                <Text style={styles.cardMuted}>
                  {grid[selected].date.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.dayDetailBody}>
                  {grid[selected].active
                    ? `Mission completed · ${grid[selected].minutes} mins`
                    : grid[selected].minutes > 0
                      ? `${grid[selected].minutes} mins — below ${GOAL_MINUTES} min goal`
                      : 'No activity logged'}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 12 }]}>{STREAK_COPY.insightsTitle}</Text>
            <View style={styles.insightsGrid}>
              {[
                {
                  Icon: Star,
                  label: 'Best streak',
                  value: `${BEST} day${BEST === 1 ? '' : 's'}`,
                },
                {
                  Icon: TrendingUp,
                  label: 'Average streak',
                  value: STREAK_INSIGHT_DEMO.averageStreakLabel,
                },
                {
                  Icon: Clock,
                  label: 'Most active',
                  value: STREAK_INSIGHT_DEMO.mostActiveLabel,
                },
                {
                  Icon: Sparkles,
                  label: 'More consistent than',
                  value: STREAK_INSIGHT_DEMO.consistencyLabel,
                },
              ].map((s) => (
                <View
                  key={s.label}
                  style={[
                    styles.insightCard,
                    { backgroundColor: INSIGHT_CARD_BG[s.label] ?? 'rgba(249,115,22,0.12)' },
                  ]}
                >
                  <s.Icon
                    size={16}
                    color={colors.white}
                    strokeWidth={2}
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={styles.insightLabel}>{s.label}</Text>
                  <Text style={styles.insightValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalIcon}>
              <Rocket size={24} color={STREAK_PRIMARY_GLOW} strokeWidth={2} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.goalEyebrow}>{STREAK_COPY.todayGoalEyebrow}</Text>
              <Text style={styles.goalTitle}>{STREAK_COPY.todayGoalTitle}</Text>
              <Text style={[styles.metaXs, { marginTop: 2 }]}>{STREAK_COPY.todayGoalBody}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={STREAK_COPY.continueLearning}
                onPress={() => router.push(Routes.TrainMaths as Href)}
                style={styles.continueChip}
              >
                <Text style={styles.continueChipText}>{STREAK_COPY.continueLearning}</Text>
                <ChevronRight size={14} color={colors.white} strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, styles.stayCard]}>
            <View style={[styles.cardTitleRow, { marginBottom: 8 }]}>
              <Sparkles size={20} color={STREAK_ACCENT_GLOW} strokeWidth={2} />
              <Text style={styles.cardTitle}>{STREAK_COPY.stayConsistentTitle}</Text>
            </View>
            <Text style={styles.motivationBody}>{STREAK_COPY.stayConsistentBody}</Text>
            <Text style={[styles.metaXs, { marginTop: 4 }]}>
              {STREAK_COPY.stayConsistentFoot}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyWrap,
          {
            paddingHorizontal: STREAK_CTA_PADDING_X,
            // Lovable `bottom-20` (80px) + native safe-area inset (0 on most web).
            paddingBottom: STREAK_STICKY_BOTTOM_OFFSET + insets.bottom,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.stickyInner} pointerEvents="box-none">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={STREAK_COPY.stickyCta}
            onPress={() => router.replace(Routes.Home as Href)}
            style={({ pressed }) => [pressed && { opacity: 0.92 }]}
          >
            <LinearGradient
              colors={['#F97316', '#F43F5E']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.stickyCta}
            >
              <Flame size={20} color={colors.white} strokeWidth={2} />
              <Text style={styles.stickyCtaText}>{STREAK_COPY.stickyCta}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function LegendDot({
  color,
  label,
  ring,
}: {
  color: string;
  label: string;
  ring?: boolean;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          { backgroundColor: color },
          ring && { borderWidth: 2, borderColor: '#FF8229' },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  /** Lovable header: `mb-6` = 24. */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  /** Lovable: `h-10 w-10 rounded-full`. */
  headerRoundBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Lovable: `text-2xl font-bold` = 24 / 700. */
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  } as TextStyle,
  /** Lovable: `h-10 pl-1 pr-3 … gap-2`. */
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    gap: 8,
  },
  /** Lovable: `h-8 w-8`. */
  avatarCircle: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: colors.blue,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarLetter: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 12,
    color: colors.white,
  },
  /** Lovable: `text-sm font-semibold max-w-[5rem]`. */
  profileName: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 14,
    color: colors.white,
    flexShrink: 1,
    maxWidth: 80,
  },
  shieldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26, 133, 255, 0.4)',
    backgroundColor: 'rgba(26, 133, 255, 0.15)',
  },
  shieldText: {
    flex: 1,
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 14,
    color: colors.white,
  },
  /** Lovable: `rounded-3xl p-6 mb-5`. */
  hero: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroLandscape: { paddingVertical: 20 },
  heroBlobTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    height: 160,
    width: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBlobBottom: {
    position: 'absolute',
    bottom: -48,
    left: -32,
    height: 176,
    width: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(253, 224, 71, 0.2)',
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  /** Lovable: `h-24 w-24`. */
  heroOrbWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOrbGlow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(253, 224, 71, 0.4)',
  },
  heroOrb: {
    height: 96,
    width: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  /** Lovable orb: `text-5xl` = 48. */
  heroOrbEmoji: { fontSize: 48, lineHeight: 56, textAlign: 'center' },
  heroCopy: { flex: 1, minWidth: 0 },
  heroStreak: {
    fontFamily: fonts.display,
    fontWeight: '800',
    color: colors.white,
  },
  /** Lovable: `text-sm mt-1 text-white/90`. */
  heroSub: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  /** Lovable: `mt-3 … px-3 py-1 … text-xs … gap-1.5`. */
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPillText: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 12,
    color: colors.white,
  },
  /** Lovable: `grid-cols-3 gap-3 mb-5`. */
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  /** Lovable: `rounded-2xl p-4`. */
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
  },
  /** Lovable: `text-2xl` = 24 — Current/Best emoji. */
  statEmoji: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  /** Lucide Shield slot — same vertical footprint as text-2xl emoji. */
  statIconSlot: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Lovable: `text-xs uppercase tracking-wide … mt-1`. */
  statLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: STREAK_MUTED_FOREGROUND,
    marginTop: 4,
  },
  /** Lovable: `text-2xl font-extrabold … mt-1`. */
  statValue: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 24,
    lineHeight: 28,
    color: colors.white,
    marginTop: 4,
  },
  /** Lovable suffix: `text-sm text-muted-foreground`. */
  statSuffix: {
    fontSize: 14,
    fontWeight: '500',
    color: STREAK_MUTED_FOREGROUND,
  },
  /** Lovable: `rounded-2xl p-4 mb-5`. */
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusEyebrow: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.8,
  },
  statusTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
  },
  statusMessage: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    opacity: 0.9,
  },
  /** Lovable: `rounded-3xl p-5 mb-5`. */
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  /** Lovable Stay Consistent: `mb-24` clearance for sticky CTA. */
  stayCard: { marginBottom: 96 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
  cardMuted: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: STREAK_MUTED_FOREGROUND,
  },
  metaXs: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: STREAK_MUTED_FOREGROUND,
  },
  /** Lovable: `h-3`. */
  progressTrack: {
    marginTop: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#1F2547',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressMeta: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayState: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 12,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  /** Lovable legend: `gap-3 text-[10px]`. */
  legendRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  /** Lovable: `h-2.5 w-2.5`. */
  legendDot: { height: 10, width: 10, borderRadius: 2 },
  legendText: {
    fontFamily: fonts.display,
    fontSize: 10,
    lineHeight: 12,
    color: STREAK_MUTED_FOREGROUND,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignSelf: 'center',
  },
  weekLabel: {
    textAlign: 'center',
    fontFamily: fonts.display,
    fontSize: 10,
    color: STREAK_MUTED_FOREGROUND,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
  },
  /** Lovable: `aspect-square rounded-lg`. */
  dayCell: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Lovable Today: `ring-2 ring-accent`. */
  dayToday: {
    borderWidth: 2,
    borderColor: '#FF8229',
  },
  daySelected: {
    borderWidth: 2,
    borderColor: '#1A85FF',
  },
  dayText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 10,
  },
  dayDetail: {
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(8, 12, 33, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(34, 41, 79, 0.5)',
  },
  dayDetailBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
    marginTop: 2,
  },
  /** Lovable: `grid-cols-2 gap-2.5`. */
  insightsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  insightCard: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 41, 79, 0.5)',
  },
  insightLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    lineHeight: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: STREAK_MUTED_FOREGROUND,
  },
  insightValue: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
    color: colors.white,
    marginTop: 2,
  },
  /** Lovable Today's Goal: `rounded-3xl p-5` + flex gap-3. */
  goalCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(26, 133, 255, 0.4)',
    backgroundColor: 'rgba(26, 133, 255, 0.12)',
  },
  /** Lovable: `h-12 w-12 rounded-2xl`. */
  goalIcon: {
    height: 48,
    width: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 133, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalEyebrow: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: STREAK_MUTED_FOREGROUND,
  },
  goalTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
  /** Lovable: `mt-3 … px-3 py-1.5 … text-xs … gap-1.5`. */
  continueChip: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1A85FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueChipText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 12,
    color: colors.white,
  },
  motivationBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white,
  },
  stickyWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  stickyInner: {
    width: '100%',
    maxWidth: STREAK_CONTENT_MAX_WIDTH,
  },
  /** Lovable: `py-3.5 rounded-2xl … gap-2 font-bold` (base 16). */
  stickyCta: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stickyCtaText: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
});
