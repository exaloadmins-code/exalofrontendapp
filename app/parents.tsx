import { Href, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type TextInput as TextInputType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { LucideIcon } from 'lucide-react-native';
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  FileText,
  History,
  Lightbulb,
  Sparkles,
  Target,
  TreePalm,
  Trophy,
} from 'lucide-react-native';
import {
  PARENTS_ACCENT_GLOW,
  PARENTS_BORDER,
  PARENTS_CARD,
  PARENTS_CONTENT_MAX_WIDTH,
  PARENTS_COPY,
  PARENTS_DESTRUCTIVE,
  PARENTS_ENGLISH_LEVEL,
  PARENTS_ENGLISH_PROGRESS_PCT,
  PARENTS_EXALO_SCORE,
  PARENTS_FOREGROUND,
  PARENTS_MATHS_LEVEL,
  PARENTS_MATHS_PROGRESS_PCT,
  PARENTS_MUTED,
  PARENTS_MUTED_FOREGROUND,
  PARENTS_MUTED_ROW_BG,
  PARENTS_PAGE_PADDING_X,
  PARENTS_PRIMARY,
  PARENTS_PRIMARY_FOREGROUND,
  PARENTS_PRIMARY_GLOW,
  PARENTS_PRIMARY_GRAD,
  PARENTS_RECOMMENDATIONS,
  PARENTS_SECONDARY_GLOW,
  PARENTS_SECTION_CARD_BG,
  PARENTS_STATS,
  PARENTS_STRENGTH_CHIPS,
  PARENTS_SUCCESS,
  PARENTS_SUCCESS_GRAD,
  PARENTS_TILE_BG,
  PARENTS_WEEKDAY_LABELS,
  PARENTS_WEEKLY,
  type ParentsAccent,
} from '@/constants/parents';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import { useAppContext } from '@/providers';
import {
  clearHolidayMode,
  getHolidayView,
  setHolidayMode,
  ymd,
  type HolidayView,
} from '@/services/streak';
import { colors, fonts } from '@/theme';

/**
 * M8 — Lovable Parent Dashboard (`/parents` → `Parents.tsx`).
 *
 * PageShell: max-w-md 448 + px-5, title "Parent Dashboard", hideHome → profile chip.
 * Header: Lovable justify-between + natural-width title (Badges lesson — no absolute center).
 * Holiday Mode: real local streak state. Remaining analytics: Lovable static demo.
 * Icons: Lucide (TP-004). Gradients: TP-072.
 */

const ACCENT_ICON: Record<
  ParentsAccent,
  { bg: string; color: string }
> = {
  primary: { bg: 'rgba(25, 140, 255, 0.2)', color: PARENTS_PRIMARY_GLOW },
  secondary: { bg: 'rgba(155, 77, 224, 0.2)', color: PARENTS_SECONDARY_GLOW },
  accent: { bg: 'rgba(255, 138, 41, 0.2)', color: PARENTS_ACCENT_GLOW },
  success: { bg: 'rgba(34, 195, 101, 0.2)', color: PARENTS_SUCCESS },
  destructive: { bg: 'rgba(239, 68, 68, 0.2)', color: PARENTS_DESTRUCTIVE },
};

const STAT_TINT: Record<string, { bg: string; color: string }> = {
  success: { bg: 'rgba(34, 195, 101, 0.2)', color: PARENTS_SUCCESS },
  primary: { bg: 'rgba(25, 140, 255, 0.2)', color: PARENTS_PRIMARY_GLOW },
  secondary: { bg: 'rgba(155, 77, 224, 0.2)', color: PARENTS_SECONDARY_GLOW },
  accent: { bg: 'rgba(255, 138, 41, 0.2)', color: PARENTS_ACCENT_GLOW },
};

const STAT_ICONS: Record<(typeof PARENTS_STATS)[number]['icon'], LucideIcon> = {
  Trophy,
  Target,
  Award,
  Clock,
};

function fmtDate(key: string): string {
  return new Date(key).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Lovable Holiday date control = HTML `<input type="date">`.
 * Calendar affordance = browser `::-webkit-calendar-picker-indicator` (SYSTEM / PLATFORM).
 *
 * Web: render a real HTML date input (not RN TextInput) so the native indicator opens the picker.
 * Native: TextInput + Lucide Calendar visual (picker UX NOT YET DEVICE-VERIFIED).
 */
const DATE_ICON_SIZE = 16;
const DATE_ICON_RIGHT_INSET = 12;
const DATE_FIELD_PAD_X = 12;
const DATE_FIELD_PAD_Y = 8;
/** Lovable measured field height @390 ≈ 39px (py-2 + text + border). */
const DATE_FIELD_HEIGHT = 39;

/** CSSProperties for genuine HTML date input — matches Lovable Tailwind classes. */
const webDateInputStyle: CSSProperties = {
  marginTop: 4,
  width: '100%',
  boxSizing: 'border-box',
  height: DATE_FIELD_HEIGHT,
  borderRadius: 12,
  backgroundColor: PARENTS_TILE_BG,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(33, 42, 71, 0.5)',
  paddingLeft: DATE_FIELD_PAD_X,
  paddingRight: DATE_FIELD_PAD_X,
  paddingTop: DATE_FIELD_PAD_Y,
  paddingBottom: DATE_FIELD_PAD_Y,
  fontFamily: fonts.display,
  fontSize: 14,
  fontWeight: 400,
  lineHeight: '20px',
  color: PARENTS_FOREGROUND,
  outline: 'none',
  // Dark scheme so Chromium paints a light calendar-picker indicator on dark fill
  colorScheme: 'dark',
};

function HolidayDateField({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
}) {
  const nativeInputRef = useRef<TextInputType>(null);

  // WEB: genuine HTML <input type="date"> — same mechanism as Lovable.
  // One calendar affordance only: the browser's native picker indicator (no Lucide overlay).
  if (Platform.OS === 'web') {
    return (
      <View style={styles.dateCol}>
        <Text style={styles.dateLabel}>{label}</Text>
        {createElement('input', {
          type: 'date',
          value,
          'aria-label': label,
          onChange: (e: { target: { value: string } }) => {
            onChangeText(e.target.value);
          },
          style: webDateInputStyle,
        })}
      </View>
    );
  }

  // NATIVE: visual Lucide calendar (TP-004). Full native date-picker UX is separate / unverified.
  return (
    <View style={styles.dateCol}>
      <Text style={styles.dateLabel}>{label}</Text>
      <View style={styles.dateFieldWrap}>
        <TextInput
          ref={nativeInputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={PARENTS_MUTED_FOREGROUND}
          style={styles.dateInput}
          accessibilityLabel={label}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} calendar`}
          hitSlop={4}
          onPress={() => nativeInputRef.current?.focus()}
          style={styles.dateIconBtn}
        >
          <Calendar
            size={DATE_ICON_SIZE}
            color={PARENTS_MUTED_FOREGROUND}
            strokeWidth={2}
          />
        </Pressable>
      </View>
    </View>
  );
}

function SectionCard({
  icon: Icon,
  title,
  accent = 'primary',
  children,
}: {
  icon: LucideIcon;
  title: string;
  accent?: ParentsAccent;
  children: React.ReactNode;
}) {
  const tint = ACCENT_ICON[accent];
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconWrap, { backgroundColor: tint.bg }]}>
          <Icon size={20} color={tint.color} strokeWidth={2} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tintKey,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tintKey: string;
}) {
  const tint = STAT_TINT[tintKey] ?? STAT_TINT.primary;
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIconWrap, { backgroundColor: tint.bg }]}>
        <Icon size={16} color={tint.color} strokeWidth={2} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export default function ParentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width > height;
  const { profile } = useAppContext();

  const name = profile.displayName?.trim() || 'Explorer';
  const childYear = profile.yearGroup?.trim() || 'Year 5';
  const avatarSource = resolveAvatarSource(profile.avatarId);

  const shellWidth = Math.min(PARENTS_CONTENT_MAX_WIDTH, Math.max(0, width));
  const contentWidth = Math.max(0, shellWidth - PARENTS_PAGE_PADDING_X * 2);
  const BACK_BTN = 40;
  const PROFILE_MIN = 56;
  const titleMaxWidth = Math.max(96, contentWidth - BACK_BTN - PROFILE_MIN);

  const weeklyMax = Math.max(...PARENTS_WEEKLY);

  const todayKey = ymd(new Date());
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return ymd(d);
  }, []);

  const [holiday, setHoliday] = useState<HolidayView>({
    active: false,
    start: null,
    end: null,
    daysRemaining: 0,
  });
  const [hStart, setHStart] = useState(todayKey);
  const [hEnd, setHEnd] = useState(defaultEnd);
  const [holidayReady, setHolidayReady] = useState(false);

  const refreshHoliday = useCallback(async () => {
    const view = await getHolidayView();
    setHoliday(view);
    if (view.start) setHStart(view.start);
    if (view.end) setHEnd(view.end);
    setHolidayReady(true);
  }, []);

  useEffect(() => {
    void refreshHoliday();
  }, [refreshHoliday]);

  const onActivateHoliday = async () => {
    await setHolidayMode(hStart, hEnd);
    await refreshHoliday();
  };

  const onEndHoliday = async () => {
    await clearHolidayMode();
    await refreshHoliday();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 96,
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              width: '100%',
              maxWidth: PARENTS_CONTENT_MAX_WIDTH,
              paddingHorizontal: PARENTS_PAGE_PADDING_X,
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
                <ArrowLeft size={20} color={PARENTS_FOREGROUND} strokeWidth={2} />
              </Pressable>
              <Text
                style={[styles.headerTitle, { maxWidth: titleMaxWidth }]}
                numberOfLines={1}
              >
                {PARENTS_COPY.title}
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
                    <Text style={styles.avatarLetter}>
                      {name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>
                <Text style={styles.profileName} numberOfLines={1}>
                  {name}
                </Text>
                <ChevronDown size={16} color={PARENTS_MUTED_FOREGROUND} strokeWidth={2} />
              </Pressable>
            </View>

            {/* Child hero */}
            <View style={[styles.childCard, landscape && styles.childCardLandscape]}>
              <Text style={styles.childLabel}>{PARENTS_COPY.childLabel}</Text>
              <Text style={styles.childName}>
                {name} · {childYear}
              </Text>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreValue}>{PARENTS_EXALO_SCORE}</Text>
                <Text style={styles.scoreCaption}>{PARENTS_COPY.exaloScoreLabel}</Text>
              </View>
            </View>

            {/* Holiday Mode */}
            <SectionCard icon={TreePalm} title={PARENTS_COPY.holidayTitle} accent="secondary">
              {!holidayReady ? null : holiday.active ? (
                <View style={styles.tile}>
                  <Text style={styles.activeEyebrow}>{PARENTS_COPY.holidayActive}</Text>
                  <Text style={styles.holidayRange}>
                    {fmtDate(holiday.start!)} - {fmtDate(holiday.end!)}
                  </Text>
                  <Text style={styles.holidayRemaining}>
                    {holiday.daysRemaining}{' '}
                    {holiday.daysRemaining === 1
                      ? PARENTS_COPY.dayRemaining
                      : PARENTS_COPY.daysRemaining}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void onEndHoliday()}
                    style={styles.endHolidayBtn}
                  >
                    <Text style={styles.endHolidayText}>{PARENTS_COPY.endHoliday}</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.holidayForm}>
                  <Text style={styles.holidayHint}>{PARENTS_COPY.holidayHint}</Text>
                  <View style={styles.dateRow}>
                    <HolidayDateField
                      label={PARENTS_COPY.startDate}
                      value={hStart}
                      onChangeText={setHStart}
                    />
                    <HolidayDateField
                      label={PARENTS_COPY.endDate}
                      value={hEnd}
                      onChangeText={setHEnd}
                    />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void onActivateHoliday()}
                    style={styles.activateBtn}
                  >
                    <Text style={styles.activateBtnText}>
                      {PARENTS_COPY.activateHoliday}
                    </Text>
                  </Pressable>
                </View>
              )}
            </SectionCard>

            {/* Learning Profile */}
            <SectionCard icon={Brain} title={PARENTS_COPY.learningProfile} accent="primary">
              <View style={styles.levelRow}>
                <View style={styles.levelTile}>
                  <View style={styles.levelLabelRow}>
                    <Calculator size={12} color={PARENTS_MUTED_FOREGROUND} strokeWidth={2} />
                    <Text style={styles.levelSubject}>{PARENTS_COPY.maths}</Text>
                  </View>
                  <Text style={styles.levelValue}>Level {PARENTS_MATHS_LEVEL}</Text>
                  <View style={styles.levelTrack}>
                    <LinearGradient
                      colors={[...PARENTS_PRIMARY_GRAD]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.levelFill,
                        { width: `${PARENTS_MATHS_PROGRESS_PCT}%` },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.levelTile}>
                  <View style={styles.levelLabelRow}>
                    <BookOpen size={12} color={PARENTS_MUTED_FOREGROUND} strokeWidth={2} />
                    <Text style={styles.levelSubject}>{PARENTS_COPY.english}</Text>
                  </View>
                  <Text style={styles.levelValue}>Level {PARENTS_ENGLISH_LEVEL}</Text>
                  <View style={styles.levelTrack}>
                    <LinearGradient
                      colors={[...PARENTS_SUCCESS_GRAD]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.levelFill,
                        { width: `${PARENTS_ENGLISH_PROGRESS_PCT}%` },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.tile}>
                <View style={styles.strengthsHeader}>
                  <Target size={14} color={PARENTS_MUTED_FOREGROUND} strokeWidth={2} />
                  <Text style={styles.levelSubject}>{PARENTS_COPY.strengthsWeak}</Text>
                </View>
                <View style={styles.chipWrap}>
                  {PARENTS_STRENGTH_CHIPS.map((chip) => (
                    <View
                      key={chip.label}
                      style={[
                        styles.chip,
                        chip.tone === 'success'
                          ? styles.chipSuccess
                          : styles.chipDestructive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color:
                              chip.tone === 'success'
                                ? PARENTS_SUCCESS
                                : PARENTS_DESTRUCTIVE,
                          },
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </SectionCard>

            {/* Progress & Performance */}
            <SectionCard
              icon={BarChart3}
              title={PARENTS_COPY.progressTitle}
              accent="success"
            >
              <View style={styles.statsGrid}>
                {PARENTS_STATS.map((stat) => {
                  const Icon = STAT_ICONS[stat.icon];
                  return (
                    <StatTile
                      key={stat.label}
                      icon={Icon}
                      label={stat.label}
                      value={stat.value}
                      tintKey={stat.tint}
                    />
                  );
                })}
              </View>
              <View style={styles.tile}>
                <Text style={styles.weeklyLabel}>{PARENTS_COPY.weeklyActivity}</Text>
                <View style={styles.chartRow}>
                  {PARENTS_WEEKLY.map((v, i) => {
                    const barH = Math.max(4, (v / weeklyMax) * 96);
                    return (
                      <View key={`${PARENTS_WEEKDAY_LABELS[i]}-${i}`} style={styles.barCol}>
                        <LinearGradient
                          colors={[PARENTS_PRIMARY_GLOW, PARENTS_PRIMARY]}
                          start={{ x: 0.5, y: 0 }}
                          end={{ x: 0.5, y: 1 }}
                          style={[styles.bar, { height: barH }]}
                        />
                        <Text style={styles.barDay}>{PARENTS_WEEKDAY_LABELS[i]}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </SectionCard>

            {/* Learning History */}
            <SectionCard
              icon={History}
              title={PARENTS_COPY.learningHistory}
              accent="secondary"
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(Routes.TrainMaths as Href)}
                style={[styles.historyRow, styles.historyRowGap]}
              >
                <View style={styles.historyLeft}>
                  <Sparkles size={16} color={PARENTS_MUTED_FOREGROUND} strokeWidth={2} />
                  <Text style={styles.historyLabel}>
                    {PARENTS_COPY.trainModeHistory}
                  </Text>
                </View>
                <Text style={styles.historyMeta}>{PARENTS_COPY.viewArrow}</Text>
              </Pressable>
              {/* Lovable: no onClick — visual row only */}
              <Pressable
                accessibilityRole="button"
                style={[styles.historyRow, styles.historyRowGap]}
              >
                <View style={styles.historyLeft}>
                  <AlertTriangle
                    size={16}
                    color={PARENTS_MUTED_FOREGROUND}
                    strokeWidth={2}
                  />
                  <Text style={styles.historyLabel}>
                    {PARENTS_COPY.mistakesReview}
                  </Text>
                </View>
                <Text style={styles.historyMeta}>{PARENTS_COPY.mistakesCount}</Text>
              </Pressable>
              {/* Lovable: no onClick — visual row only */}
              <Pressable accessibilityRole="button" style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Download size={16} color={PARENTS_MUTED_FOREGROUND} strokeWidth={2} />
                  <Text style={styles.historyLabel}>
                    {PARENTS_COPY.downloadReport}
                  </Text>
                </View>
                <FileText size={16} color={PARENTS_PRIMARY_GLOW} strokeWidth={2} />
              </Pressable>
            </SectionCard>

            {/* Learning Preferences (AI) */}
            <SectionCard
              icon={Lightbulb}
              title={PARENTS_COPY.learningPrefs}
              accent="accent"
            >
              <View style={styles.prefsList}>
                <View style={styles.prefRow}>
                  <Text style={styles.prefLabel}>{PARENTS_COPY.difficultyMode}</Text>
                  <Text style={styles.prefValue}>{PARENTS_COPY.difficultyValue}</Text>
                </View>
                <View style={styles.prefRow}>
                  <Text style={styles.prefLabel}>{PARENTS_COPY.dailyGoal}</Text>
                  <Text style={styles.prefValue}>{PARENTS_COPY.dailyGoalValue}</Text>
                </View>
                <View style={styles.prefRow}>
                  <Text style={styles.prefLabel}>{PARENTS_COPY.learningStyle}</Text>
                  <Text style={styles.prefValue}>{PARENTS_COPY.learningStyleValue}</Text>
                </View>
              </View>
            </SectionCard>

            {/* Recommendations */}
            <SectionCard
              icon={Sparkles}
              title={PARENTS_COPY.recommendations}
              accent="secondary"
            >
              <View style={styles.recsList}>
                {PARENTS_RECOMMENDATIONS.map((line) => (
                  <View key={line} style={styles.recRow}>
                    <Text style={styles.recText}>{line}</Text>
                  </View>
                ))}
              </View>
            </SectionCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  headerRoundBtn: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: PARENTS_CARD,
    borderWidth: 1,
    borderColor: PARENTS_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Lovable: `text-2xl font-bold` — natural width, not absolute-centered. */
  headerTitle: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    color: PARENTS_FOREGROUND,
  },
  profileChip: {
    height: 40,
    paddingLeft: 4,
    paddingRight: 12,
    borderRadius: 999,
    backgroundColor: PARENTS_CARD,
    borderWidth: 1,
    borderColor: PARENTS_BORDER,
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
    color: PARENTS_FOREGROUND,
  },
  /** Lovable: `rounded-3xl bg-card border border-border p-5 mb-5` */
  childCard: {
    borderRadius: 24,
    backgroundColor: PARENTS_CARD,
    borderWidth: 1,
    borderColor: PARENTS_BORDER,
    padding: 20,
    marginBottom: 20,
  },
  childCardLandscape: {
    paddingVertical: 16,
  },
  childLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_MUTED_FOREGROUND,
  },
  childName: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 32,
    color: PARENTS_FOREGROUND,
  },
  scoreRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  scoreValue: {
    fontFamily: fonts.display,
    fontWeight: '800',
    fontSize: 48,
    lineHeight: 56,
    color: PARENTS_PRIMARY,
  },
  scoreCaption: {
    fontFamily: fonts.display,
    fontSize: 16,
    lineHeight: 24,
    color: PARENTS_MUTED_FOREGROUND,
    marginBottom: 8,
  },
  /** Lovable section: `rounded-3xl bg-card/80 border border-border/60 p-5 mb-4` */
  sectionCard: {
    borderRadius: 24,
    backgroundColor: PARENTS_SECTION_CARD_BG,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.6)',
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sectionIconWrap: {
    height: 36,
    width: 36,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    color: PARENTS_FOREGROUND,
  },
  tile: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: PARENTS_TILE_BG,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  activeEyebrow: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: PARENTS_MUTED_FOREGROUND,
  },
  holidayRange: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
    color: PARENTS_FOREGROUND,
    marginTop: 4,
  },
  holidayRemaining: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_MUTED_FOREGROUND,
    marginTop: 4,
  },
  endHolidayBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  endHolidayText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_DESTRUCTIVE,
  },
  holidayForm: {
    gap: 8,
  },
  holidayHint: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_MUTED_FOREGROUND,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateCol: {
    flex: 1,
  },
  dateLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_MUTED_FOREGROUND,
  },
  /** Lovable field shell: rounded-xl, bg-background/40, border-border/50, px-3 py-2 */
  dateFieldWrap: {
    marginTop: 4,
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  dateInput: {
    width: '100%',
    height: DATE_FIELD_HEIGHT,
    borderRadius: 12,
    backgroundColor: PARENTS_TILE_BG,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
    paddingLeft: DATE_FIELD_PAD_X,
    // Room for 16px icon + 12px right inset so text never overlaps icon
    paddingRight: DATE_ICON_RIGHT_INSET + DATE_ICON_SIZE + 8,
    paddingVertical: DATE_FIELD_PAD_Y,
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_FOREGROUND,
  },
  /** Lovable ::-webkit-calendar-picker-indicator — right side, vertically centered */
  dateIconBtn: {
    position: 'absolute',
    right: DATE_ICON_RIGHT_INSET,
    top: 0,
    bottom: 0,
    width: DATE_ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activateBtn: {
    marginTop: 4,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: PARENTS_PRIMARY,
    alignItems: 'center',
  },
  activateBtnText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_PRIMARY_FOREGROUND,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  levelTile: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: PARENTS_TILE_BG,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  levelLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelSubject: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_MUTED_FOREGROUND,
  },
  levelValue: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_FOREGROUND,
    marginTop: 4,
  },
  levelTrack: {
    height: 6,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: PARENTS_MUTED,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: 999,
  },
  strengthsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipSuccess: {
    backgroundColor: 'rgba(34, 195, 101, 0.2)',
  },
  chipDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  chipText: {
    fontFamily: fonts.display,
    fontSize: 11,
    lineHeight: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statTile: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '46%',
    borderRadius: 16,
    padding: 12,
    backgroundColor: PARENTS_TILE_BG,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  statIconWrap: {
    height: 36,
    width: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_MUTED_FOREGROUND,
  },
  statValue: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
    color: PARENTS_FOREGROUND,
  },
  weeklyLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_MUTED_FOREGROUND,
    marginBottom: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 96,
    gap: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    height: '100%',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barDay: {
    fontFamily: fonts.display,
    fontSize: 10,
    lineHeight: 12,
    color: PARENTS_MUTED_FOREGROUND,
  },
  historyRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    backgroundColor: PARENTS_TILE_BG,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  historyRowGap: {
    marginBottom: 8,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  historyLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_FOREGROUND,
  },
  historyMeta: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_MUTED_FOREGROUND,
  },
  prefsList: {
    gap: 8,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    backgroundColor: PARENTS_TILE_BG,
    borderWidth: 1,
    borderColor: 'rgba(33, 42, 71, 0.5)',
  },
  prefLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_FOREGROUND,
  },
  prefValue: {
    fontFamily: fonts.display,
    fontSize: 12,
    lineHeight: 16,
    color: PARENTS_MUTED_FOREGROUND,
  },
  recsList: {
    gap: 8,
  },
  recRow: {
    borderRadius: 12,
    backgroundColor: PARENTS_MUTED_ROW_BG,
    padding: 12,
  },
  recText: {
    fontFamily: fonts.display,
    fontSize: 14,
    lineHeight: 20,
    color: PARENTS_FOREGROUND,
  },
});
