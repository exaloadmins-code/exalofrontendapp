import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Star,
  Telescope,
  Trophy,
  X,
} from 'lucide-react-native';
import {
  TRAIN_RESULTS as R,
  TRAIN_RESULTS_COPY as COPY,
  trainResultsEncouragementBanner,
  trainResultsPerformanceStars,
} from '@/constants/trainResults';
import {
  buildTrainReviewItems,
  isTrainResultPerfect,
  summarizeTrainResult,
  type TrainResultSnapshot,
  type TrainResultSummary,
  type TrainReviewItem,
  type TrainReviewStatus,
} from '@/services/trainResults';
import { fonts } from '@/theme';
import { TrainQuestionDiagram } from '@/components/train/TrainQuestionDiagram';

/** Scoped web id — hide Mission Review scrollbar without global CSS. */
const MISSION_REVIEW_SCROLL_NATIVE_ID = 'exalo-mission-review-detail-scroll';

/** Web-only: hide browser scrollbar on the Mission Review detail ScrollView. */
function MissionReviewWebScrollbarHide() {
  if (Platform.OS !== 'web') {
    return null;
  }
  return createElement('style', {
    // Unique key so React replaces rather than stacking duplicate rules.
    key: MISSION_REVIEW_SCROLL_NATIVE_ID,
    dangerouslySetInnerHTML: {
      __html: `#${MISSION_REVIEW_SCROLL_NATIVE_ID}{-ms-overflow-style:none;scrollbar-width:none}#${MISSION_REVIEW_SCROLL_NATIVE_ID}::-webkit-scrollbar{display:none;width:0;height:0}`,
    },
  });
}

export type TrainResultsViewProps = {
  result: TrainResultSnapshot;
  onTryAgain: () => void;
  onHome: () => void;
};

/** Presentation-only review entry — session-index keyed; topic from question.Subject. */
type ReviewEntry = TrainReviewItem & {
  topicLabel: string;
};

type TopicGroup = {
  topicLabel: string;
  items: ReviewEntry[];
};

/**
 * Shared Results UI for Train / Focus / Test.
 *
 * INTERACTIVE MISSION REVIEW EXPERIMENT — presentation only.
 * Summary: hero + stars + medallion + pods + encouragement.
 * Review: topic cards + chips (wrong/unanswered only) → detail Modal.
 * Flat session-order Prev/Next; never qid-collapse.
 */
export function TrainResultsView({
  result,
  onTryAgain,
  onHome,
}: TrainResultsViewProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth - 48, R.contentMaxWidth);
  const summary = summarizeTrainResult(result);

  /** Flat review list in original session order (Prev/Next source of truth). */
  const reviewEntries = useMemo(
    () => buildReviewEntries(result),
    [result],
  );
  /** Topic cards derived from flat list — display only; does not reorder Prev/Next. */
  const topicGroups = useMemo(
    () => groupReviewByTopic(reviewEntries),
    [reviewEntries],
  );

  const reviewCount = reviewEntries.length;
  /** Perfect only when wrong=0 AND unanswered=0 — not merely empty review. */
  const isPerfect = isTrainResultPerfect(summary);
  const showNoWrongReview = !isPerfect && reviewCount === 0;
  const wide = windowWidth >= 760;
  const landscape = windowWidth > windowHeight;
  const donutSize = wide
    ? Math.min(164, Math.round(contentWidth * 0.26))
    : windowWidth < 360
      ? 128
      : 148;
  const encouragement = trainResultsEncouragementBanner(summary.percent);
  const earnedStars = trainResultsPerformanceStars(summary.percent);
  const reviewSubtitle =
    reviewCount === 1
      ? COPY.reviewSubtitleOne
      : COPY.reviewSubtitleMany(reviewCount);

  /** Index into `reviewEntries` — survives rotation while Modal is open. */
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const detailOpen = activeIndex != null;
  const activeEntry =
    activeIndex != null ? reviewEntries[activeIndex] ?? null : null;

  const closeDetail = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const openEntry = useCallback((sessionIndex: number) => {
    const idx = reviewEntries.findIndex((e) => e.sessionIndex === sessionIndex);
    if (idx >= 0) {
      setActiveIndex(idx);
    }
  }, [reviewEntries]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i != null && i > 0 ? i - 1 : i));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) =>
      i != null && i < reviewEntries.length - 1 ? i + 1 : i,
    );
  }, [reviewEntries.length]);

  useEffect(() => {
    if (!detailOpen) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      closeDetail();
      return true;
    });
    return () => sub.remove();
  }, [detailOpen, closeDetail]);

  /** If review list shrinks (shouldn't), clamp selection. */
  useEffect(() => {
    if (activeIndex != null && activeIndex >= reviewEntries.length) {
      setActiveIndex(reviewEntries.length > 0 ? reviewEntries.length - 1 : null);
    }
  }, [activeIndex, reviewEntries.length]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: Math.max(24, (windowWidth - contentWidth) / 2),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, alignSelf: 'center' }}>
          <MissionHero title={result.title} contentWidth={contentWidth} />

          <View
            style={[styles.summaryCard, wide && styles.summaryCardWide]}
            accessibilityRole="text"
            accessibilityLabel={COPY.scoreLine(
              summary.correct,
              summary.total,
              summary.percent,
            )}
          >
            <View
              style={[styles.scoreCluster, wide && styles.scoreClusterWide]}
            >
              <PerformanceStars
                earned={earnedStars}
                perfect={summary.percent >= 100}
              />
              <MedallionDonut
                summary={summary}
                size={donutSize}
                perfect={summary.percent >= 100}
              />
            </View>

            <View style={[styles.summarySide, wide && styles.summarySideWide]}>
              <View style={styles.statRow}>
                <ResultPod
                  kind="correct"
                  label={COPY.summaryCorrect}
                  value={summary.correct}
                />
                <ResultPod
                  kind="wrong"
                  label={COPY.summaryWrong}
                  value={summary.wrong}
                />
                <ResultPod
                  kind="unanswered"
                  label={COPY.summaryUnanswered}
                  value={summary.unanswered}
                />
              </View>
            </View>

            <Text
              style={[styles.totalSubtle, wide && styles.totalSubtleWide]}
            >
              {COPY.summaryTotalSubtle(summary.total)}
            </Text>
          </View>

          <EncouragementBanner
            title={encouragement.title}
            body={encouragement.body}
            percent={summary.percent}
          />

          {isPerfect ? (
            <PerfectMissionState />
          ) : showNoWrongReview ? (
            <NoWrongReviewState />
          ) : (
            <View style={styles.reviewSection}>
              <View style={styles.missionReviewHeader}>
                <View style={styles.missionReviewEyebrow}>
                  <Telescope
                    size={16}
                    color={R.cyanAccent}
                    strokeWidth={2.25}
                  />
                  <Text style={styles.missionReviewEyebrowText}>
                    {COPY.missionReviewEyebrow}
                  </Text>
                </View>
                <Text style={styles.reviewSubtitle}>{reviewSubtitle}</Text>
                <View
                  style={styles.reviewLegend}
                  accessibilityRole="text"
                  accessibilityLabel={COPY.legendWrong}
                >
                  <View style={styles.legendItem}>
                    <Text style={[styles.legendMark, styles.legendMarkWrong]}>
                      ✕
                    </Text>
                    <Text style={[styles.legendText, styles.legendTextWrong]}>
                      {COPY.legendWrong}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.topicList}>
                {topicGroups.map((group, groupIndex) => (
                  <TopicCard
                    key={group.topicLabel}
                    group={group}
                    accent={
                      R.topicAccents[groupIndex % R.topicAccents.length]
                    }
                    onSelectChip={openEntry}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={styles.actionsBlock}>
            <Text style={styles.nextMissionHeading}>
              {COPY.nextMissionHeading}
            </Text>
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.tryAgain}
                onPress={onTryAgain}
                style={[styles.actionBtn, styles.tryAgainBtn]}
              >
                <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.25} />
                <Text style={styles.actionLabel}>{COPY.tryAgain}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.home}
                onPress={onHome}
                style={[styles.actionBtn, styles.homeBtn]}
              >
                <Home size={16} color="#FFFFFF" strokeWidth={2.25} />
                <Text style={styles.actionLabel}>{COPY.home}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <QuestionDetailModal
        visible={detailOpen && activeEntry != null}
        entry={activeEntry}
        position={activeIndex != null ? activeIndex + 1 : 0}
        total={reviewCount}
        canPrev={activeIndex != null && activeIndex > 0}
        canNext={
          activeIndex != null && activeIndex < reviewEntries.length - 1
        }
        onPrev={goPrev}
        onNext={goNext}
        onClose={closeDetail}
        windowWidth={windowWidth}
        windowHeight={windowHeight}
        landscape={landscape}
        wide={wide}
        topInset={insets.top}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

/**
 * Flat incorrect-answered list in session order (unanswered excluded).
 * Topic from questions[i].Subject (actual bank topic label).
 * Never joins by qid.
 */
function buildReviewEntries(result: TrainResultSnapshot): ReviewEntry[] {
  return buildTrainReviewItems(result).map((item) => {
    const question = result.questions[item.sessionIndex];
    const fromQuestion = question?.Subject?.trim();
    return {
      ...item,
      topicLabel: fromQuestion || COPY.topicUnavailable,
    };
  });
}

/** First-seen topic order from flat session-ordered review list. */
function groupReviewByTopic(entries: ReviewEntry[]): TopicGroup[] {
  const map = new Map<string, ReviewEntry[]>();
  const order: string[] = [];
  for (const entry of entries) {
    const existing = map.get(entry.topicLabel);
    if (!existing) {
      map.set(entry.topicLabel, [entry]);
      order.push(entry.topicLabel);
    } else {
      existing.push(entry);
    }
  }
  return order.map((topicLabel) => ({
    topicLabel,
    items: map.get(topicLabel) ?? [],
  }));
}

function MissionHero({
  title,
  contentWidth,
}: {
  title: string;
  contentWidth: number;
}) {
  return (
    <View style={styles.hero}>
      <View
        style={[styles.heroDecorLayer, { width: contentWidth }]}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <HeroSpaceDecor width={contentWidth} />
      </View>
      <Text style={styles.missionTitle}>{COPY.missionComplete}</Text>
      <Text style={styles.modeContext} numberOfLines={2}>
        {title}
      </Text>
    </View>
  );
}

/** Lightweight RN + SVG space motifs — no assets, pointerEvents none. */
function HeroSpaceDecor({ width }: { width: number }) {
  const h = 88;
  return (
    <View style={{ width, height: h }}>
      <Svg width={width} height={h}>
        <Ellipse
          cx={width * 0.5}
          cy={h * 0.55}
          rx={width * 0.42}
          ry={28}
          stroke={R.violetAccent}
          strokeWidth={1}
          fill="none"
          opacity={0.35}
        />
        <Ellipse
          cx={width * 0.5}
          cy={h * 0.55}
          rx={width * 0.28}
          ry={16}
          stroke={R.cyanAccent}
          strokeWidth={1}
          fill="none"
          opacity={0.28}
        />
        <Circle cx={18} cy={22} r={3.5} fill={R.planetViolet} opacity={0.85} />
        <Circle
          cx={width - 22}
          cy={18}
          r={4.5}
          fill={R.planetCyan}
          opacity={0.8}
        />
        <Circle
          cx={width * 0.18}
          cy={68}
          r={2.5}
          fill={R.planetPink}
          opacity={0.8}
        />
        <Circle
          cx={width * 0.82}
          cy={64}
          r={3}
          fill={R.planetGold}
          opacity={0.75}
        />
        <Circle cx={width * 0.32} cy={14} r={1.5} fill="#FFFFFF" opacity={0.7} />
        <Circle cx={width * 0.68} cy={12} r={1.2} fill="#FFFFFF" opacity={0.55} />
        <Circle cx={width * 0.5} cy={8} r={1.8} fill="#FFFFFF" opacity={0.45} />
      </Svg>
      <View style={[styles.heroSparkle, { left: 8, top: 28 }]}>
        <Sparkles size={14} color={R.pinkDecor} strokeWidth={2} />
      </View>
      <View style={[styles.heroSparkle, { right: 10, top: 30 }]}>
        <Star size={12} color={R.starGold} fill={R.starGold} strokeWidth={0} />
      </View>
    </View>
  );
}

function PerformanceStars({
  earned,
  perfect,
}: {
  earned: number;
  perfect: boolean;
}) {
  return (
    <View
      style={styles.starsRow}
      accessibilityRole="text"
      accessibilityLabel={COPY.starsA11y(earned)}
    >
      {[0, 1, 2].map((i) => {
        const filled = i < earned;
        const size = perfect && filled ? 28 : 24;
        return (
          <View
            key={i}
            style={[
              styles.starSlot,
              filled && styles.starSlotEarned,
              perfect && filled && styles.starSlotPerfect,
            ]}
          >
            <Star
              size={size}
              color={filled ? R.starGold : R.starUnearned}
              fill={filled ? R.starGold : 'transparent'}
              strokeWidth={filled ? 1.5 : 2}
            />
          </View>
        );
      })}
    </View>
  );
}

/**
 * Correct / Wrong / Unanswered donut via SVG stroke arcs.
 * Calculations unchanged — medallion chrome is presentation only.
 */
function MedallionDonut({
  summary,
  size,
  perfect,
}: {
  summary: TrainResultSummary;
  size: number;
  perfect: boolean;
}) {
  const strokeWidth = Math.round(size * 0.15);
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const total = summary.total;
  const outer = size + 18;

  const segments =
    total > 0
      ? (
          [
            { value: summary.correct, color: R.correctAccent },
            { value: summary.wrong, color: R.wrongAccent },
            { value: summary.unanswered, color: R.unansweredAccent },
          ] as const
        ).filter((s) => s.value > 0)
      : [];

  let consumed = 0;

  return (
    <View
      style={[styles.medallionWrap, { width: outer, height: outer }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View
        style={[
          styles.medallionGlow,
          {
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            borderColor: perfect ? R.medallionRing : R.violetAccent,
            backgroundColor: R.medallionGlow,
          },
        ]}
        pointerEvents="none"
      />
      <View
        style={[styles.donutWrap, { width: size, height: size }]}
        pointerEvents="none"
      >
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={R.donutTrack}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <G transform={`rotate(-90 ${cx} ${cy})`}>
            {segments.map((seg) => {
              const length = (seg.value / total) * circumference;
              const dashoffset = -consumed;
              consumed += length;
              return (
                <Circle
                  key={seg.color}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={`${length} ${Math.max(circumference - length, 0)}`}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="butt"
                />
              );
            })}
          </G>
        </Svg>
        <View style={styles.donutCenter} pointerEvents="none">
          <Text
            style={[
              styles.percentValue,
              size < 140 && styles.percentValueCompact,
              perfect && styles.percentValuePerfect,
            ]}
          >
            {summary.percent}%
          </Text>
          <Text style={styles.percentLabel}>{COPY.summaryPercentLabel}</Text>
        </View>
      </View>
      <View style={styles.medallionSparkTop} pointerEvents="none">
        <Star size={14} color={R.starGold} fill={R.starGold} strokeWidth={0} />
      </View>
      <View style={styles.medallionSparkLeft} pointerEvents="none">
        <Sparkles size={12} color={R.cyanAccent} strokeWidth={2} />
      </View>
      <View style={styles.medallionSparkRight} pointerEvents="none">
        <Sparkles size={12} color={R.pinkDecor} strokeWidth={2} />
      </View>
    </View>
  );
}

function ResultPod({
  kind,
  label,
  value,
}: {
  kind: 'correct' | 'wrong' | 'unanswered';
  label: string;
  value: number;
}) {
  const accent =
    kind === 'correct'
      ? R.correctAccent
      : kind === 'wrong'
        ? R.wrongAccent
        : R.unansweredAccent;
  const borderColor =
    kind === 'correct'
      ? R.rowCorrectBorder
      : kind === 'wrong'
        ? R.rowWrongBorder
        : R.rowUnansweredBorder;
  const backgroundColor =
    kind === 'correct'
      ? R.rowCorrectBg
      : kind === 'wrong'
        ? R.rowWrongBg
        : R.rowUnansweredBg;

  return (
    <View
      style={[styles.resultPod, { borderColor, backgroundColor }]}
      accessibilityLabel={`${label}: ${value}`}
    >
      <View style={[styles.resultPodIcon, { borderColor: accent }]}>
        {kind === 'correct' ? (
          <Check size={18} color={accent} strokeWidth={3} />
        ) : kind === 'wrong' ? (
          <X size={18} color={accent} strokeWidth={3} />
        ) : (
          <Text style={[styles.resultPodGlyph, { color: accent }]}>?</Text>
        )}
      </View>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: accent }]}>{label}</Text>
    </View>
  );
}

function EncouragementBanner({
  title,
  body,
  percent,
}: {
  title: string;
  body: string;
  percent: number;
}) {
  const Icon = percent >= 100 ? Trophy : percent >= 50 ? Sparkles : Star;
  return (
    <View
      style={styles.banner}
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${body}`}
    >
      <View style={styles.bannerIconCircle}>
        <Icon size={20} color={R.cyanAccent} strokeWidth={2.25} />
      </View>
      <View style={styles.bannerTextCol}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <Text style={styles.bannerBody}>{body}</Text>
      </View>
    </View>
  );
}

function PerfectMissionState() {
  return (
    <View
      style={styles.perfectCard}
      accessibilityRole="text"
      accessibilityLabel={`${COPY.perfectTitle}. ${COPY.perfectBody}`}
    >
      <View style={styles.perfectStars} pointerEvents="none">
        {[0, 1, 2].map((i) => (
          <Star
            key={i}
            size={22}
            color={R.starGold}
            fill={R.starGold}
            strokeWidth={0}
          />
        ))}
      </View>
      <Sparkles size={18} color={R.violetAccent} strokeWidth={2.25} />
      <Text style={styles.perfectTitle}>{COPY.perfectTitle}</Text>
      <Text style={styles.perfectBody}>{COPY.perfectBody}</Text>
    </View>
  );
}

/** Wrong=0 with unanswered remaining — not a perfect mission. */
function NoWrongReviewState() {
  return (
    <View
      style={styles.noWrongCard}
      accessibilityRole="text"
      accessibilityLabel={`${COPY.noWrongReviewTitle}. ${COPY.noWrongReviewBody}`}
    >
      <Telescope size={18} color={R.cyanAccent} strokeWidth={2.25} />
      <Text style={styles.noWrongTitle}>{COPY.noWrongReviewTitle}</Text>
      <Text style={styles.noWrongBody}>{COPY.noWrongReviewBody}</Text>
    </View>
  );
}

function TopicCard({
  group,
  accent,
  onSelectChip,
}: {
  group: TopicGroup;
  accent: string;
  onSelectChip: (sessionIndex: number) => void;
}) {
  const count = group.items.length;
  const needs =
    count === 1 ? COPY.topicNeedsOne : COPY.topicNeedsMany(count);

  return (
    <View
      style={[styles.topicCard, { borderColor: accent }]}
      accessibilityRole="summary"
      accessibilityLabel={`${group.topicLabel}. ${needs}`}
    >
      <View style={styles.topicCardHeader}>
        <View style={[styles.topicDot, { backgroundColor: accent }]} />
        <Text style={[styles.topicName, { color: accent }]} numberOfLines={2}>
          {group.topicLabel}
        </Text>
      </View>
      <Text style={styles.topicNeeds}>{needs}</Text>
      <View style={styles.chipRow}>
        {group.items.map((item) => (
          <QuestionChip
            key={item.sessionIndex}
            questionNumber={item.questionNumber}
            status={item.status}
            onPress={() => onSelectChip(item.sessionIndex)}
          />
        ))}
      </View>
    </View>
  );
}

function QuestionChip({
  questionNumber,
  status,
  onPress,
}: {
  questionNumber: number;
  status: TrainReviewStatus;
  onPress: () => void;
}) {
  const unanswered = status === 'unanswered';
  const accent = unanswered ? R.unansweredAccent : R.wrongAccent;
  const border = unanswered ? R.rowUnansweredBorder : R.rowWrongBorder;
  const bg = unanswered ? R.rowUnansweredBg : R.rowWrongBg;
  const mark = unanswered ? '?' : '✕';
  const a11y = unanswered
    ? COPY.chipUnansweredA11y(questionNumber)
    : COPY.chipIncorrectA11y(questionNumber);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: border,
          backgroundColor: bg,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: accent }]}>
        Q{questionNumber}
      </Text>
      <Text style={[styles.chipMark, { color: accent }]}>{mark}</Text>
    </Pressable>
  );
}

function QuestionDetailModal({
  visible,
  entry,
  position,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onClose,
  windowWidth,
  windowHeight,
  landscape,
  wide,
  topInset,
  bottomInset,
}: {
  visible: boolean;
  entry: ReviewEntry | null;
  position: number;
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  windowWidth: number;
  windowHeight: number;
  landscape: boolean;
  wide: boolean;
  topInset: number;
  bottomInset: number;
}) {
  if (!entry) {
    return null;
  }

  const unanswered = entry.status === 'unanswered';
  const statusLabel = unanswered
    ? COPY.statusUnanswered
    : COPY.statusIncorrect;
  const statusColor = unanswered ? R.unansweredAccent : R.wrongAccent;
  const cardMaxWidth = Math.min(
    windowWidth - (wide ? 64 : 32),
    R.modalMaxWidth,
  );
  const maxCardHeight = Math.max(
    280,
    windowHeight - topInset - bottomInset - (landscape ? 16 : 32),
  );

  const yourValue = unanswered
    ? `? ${COPY.notAnswered}`
    : `✕ ${entry.yourAnswerLabel}`;
  const correctValue = `✓ ${entry.correctAnswerLabel}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={COPY.closeDetail}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          pointerEvents="box-none"
          style={[
            styles.modalCenter,
            {
              paddingTop: topInset + 8,
              paddingBottom: bottomInset + 8,
              paddingHorizontal: wide ? 32 : 16,
              justifyContent: landscape ? 'center' : 'flex-end',
            },
          ]}
        >
          <View
            style={[
              styles.modalCard,
              {
                width: cardMaxWidth,
                maxHeight: maxCardHeight,
                alignSelf: 'center',
                marginBottom: landscape ? 0 : 4,
              },
            ]}
            accessibilityViewIsModal
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View
                  style={[
                    styles.qBadge,
                    {
                      backgroundColor: unanswered
                        ? R.qBadgeUnanswered
                        : R.qBadgeWrong,
                    },
                  ]}
                >
                  <Text style={styles.qBadgeText}>
                    Q{entry.questionNumber}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    unanswered
                      ? styles.statusBadgeUnanswered
                      : styles.statusBadgeWrong,
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                    {statusLabel}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.closeDetail}
                onPress={onClose}
                hitSlop={8}
                style={styles.closeBtn}
              >
                <X size={20} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </View>

            <Text style={styles.detailTopic} numberOfLines={2}>
              {entry.topicLabel}
            </Text>

            <MissionReviewWebScrollbarHide />
            <ScrollView
              nativeID={MISSION_REVIEW_SCROLL_NATIVE_ID}
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.stemBox}>
                <Text style={styles.stemLabel}>{COPY.questionLabel}</Text>
                <Text style={styles.stem}>{entry.stem}</Text>
              </View>

              {entry.diagram?.hasDiagram ? (
                <View style={styles.reviewDiagramWrap}>
                  <TrainQuestionDiagram
                    hasDiagram={entry.diagram.hasDiagram}
                    diagramType={entry.diagram.diagramType}
                    diagramPrompt={entry.diagram.diagramPrompt}
                    diagramData={entry.diagram.diagramData}
                    width={Math.max(200, cardMaxWidth - 40)}
                  />
                </View>
              ) : null}

              <View style={styles.answerBlock}>
                <AnswerPanel
                  label={COPY.yourAnswer}
                  value={yourValue}
                  tone={unanswered ? 'unanswered' : 'yours'}
                />
                <AnswerPanel
                  label={COPY.correctAnswer}
                  value={correctValue}
                  tone="correct"
                />
              </View>

              {entry.explanation ? (
                <View style={styles.explainBox}>
                  <View style={styles.explainHeader}>
                    <Lightbulb
                      size={14}
                      color={R.violetAccent}
                      strokeWidth={2.25}
                    />
                    <Text style={styles.explainLabel}>{COPY.explanation}</Text>
                  </View>
                  <Text style={styles.explainText}>{entry.explanation}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.previous}
                accessibilityState={{ disabled: !canPrev }}
                disabled={!canPrev}
                onPress={onPrev}
                style={[
                  styles.navBtn,
                  !canPrev && styles.navBtnDisabled,
                ]}
              >
                <ChevronLeft
                  size={18}
                  color={canPrev ? '#FFFFFF' : R.mutedText}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.navBtnLabel,
                    !canPrev && styles.navBtnLabelDisabled,
                  ]}
                >
                  {COPY.previous}
                </Text>
              </Pressable>

              <Text style={styles.positionLabel}>
                {COPY.detailPosition(position, total)}
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.next}
                accessibilityState={{ disabled: !canNext }}
                disabled={!canNext}
                onPress={onNext}
                style={[
                  styles.navBtn,
                  !canNext && styles.navBtnDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.navBtnLabel,
                    !canNext && styles.navBtnLabelDisabled,
                  ]}
                >
                  {COPY.next}
                </Text>
                <ChevronRight
                  size={18}
                  color={canNext ? '#FFFFFF' : R.mutedText}
                  strokeWidth={2.5}
                />
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={COPY.doneDetail}
              onPress={onClose}
              style={styles.doneBtn}
            >
              <Text style={styles.doneBtnLabel}>{COPY.doneDetail}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AnswerPanel({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'yours' | 'correct' | 'unanswered';
}) {
  const bg =
    tone === 'correct'
      ? R.correctAnswerBg
      : tone === 'unanswered'
        ? R.unansweredAnswerBg
        : R.yourAnswerBg;
  const border =
    tone === 'correct'
      ? R.correctAnswerBorder
      : tone === 'unanswered'
        ? R.unansweredAnswerBorder
        : R.yourAnswerBorder;
  const valueColor =
    tone === 'correct'
      ? R.correctAccent
      : tone === 'unanswered'
        ? R.unansweredAccent
        : '#FFFFFF';

  return (
    <View
      style={[styles.answerPanel, { backgroundColor: bg, borderColor: border }]}
    >
      <Text style={styles.answerLabel}>{label}</Text>
      <Text
        style={[
          styles.answerValue,
          { color: valueColor },
          tone === 'unanswered' && styles.answerMuted,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: R.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
    position: 'relative',
    paddingTop: 8,
    minHeight: 100,
    justifyContent: 'center',
  },
  heroDecorLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 88,
    alignItems: 'center',
  },
  heroSparkle: {
    position: 'absolute',
  },
  missionTitle: {
    fontFamily: fonts.display,
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    zIndex: 1,
  },
  modeContext: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: R.heroAccent,
    textAlign: 'center',
    letterSpacing: 0.2,
    zIndex: 1,
  },
  summaryCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: R.cardBorder,
    backgroundColor: R.cardBg,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  summaryCardWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 18,
  },
  scoreCluster: {
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  scoreClusterWide: {
    gap: 6,
  },
  summarySide: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  summarySideWide: {
    flex: 1,
    minWidth: 220,
    alignItems: 'stretch',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  starSlot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 11, 52, 0.5)',
  },
  starSlotEarned: {
    backgroundColor: R.starGoldSoft,
  },
  starSlotPerfect: {
    borderWidth: 1,
    borderColor: R.medallionRing,
  },
  medallionWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  medallionGlow: {
    position: 'absolute',
    borderWidth: 2,
  },
  medallionSparkTop: {
    position: 'absolute',
    top: 2,
    alignSelf: 'center',
  },
  medallionSparkLeft: {
    position: 'absolute',
    left: 2,
    top: '42%',
  },
  medallionSparkRight: {
    position: 'absolute',
    right: 2,
    top: '42%',
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  donutCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentValue: {
    fontFamily: fonts.display,
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  percentValueCompact: {
    fontSize: 30,
  },
  percentValuePerfect: {
    color: R.correctAccent,
  },
  percentLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: R.labelText,
    marginTop: 2,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  resultPod: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    maxWidth: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    gap: 4,
    alignItems: 'center',
  },
  resultPodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7, 4, 33, 0.45)',
  },
  resultPodGlyph: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
  },
  totalSubtle: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '500',
    color: R.mutedText,
    textAlign: 'center',
    width: '100%',
    marginTop: 2,
  },
  totalSubtleWide: {
    flexBasis: '100%',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: R.bannerBorder,
    backgroundColor: R.bannerBg,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  bannerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.35)',
  },
  bannerTextCol: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  bannerTitle: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '800',
    color: R.bannerTitle,
  },
  bannerBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: R.scoreColor,
    lineHeight: 20,
  },
  perfectCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: R.perfectBorder,
    backgroundColor: R.perfectBg,
    padding: 22,
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  perfectStars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  perfectTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '800',
    color: R.correctAccent,
    textAlign: 'center',
  },
  perfectBody: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '500',
    color: R.scoreColor,
    textAlign: 'center',
  },
  noWrongCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: R.panelBorder,
    backgroundColor: 'rgba(26, 23, 72, 0.55)',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  noWrongTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: R.cyanAccent,
    textAlign: 'center',
  },
  noWrongBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: R.scoreColor,
    textAlign: 'center',
    lineHeight: 20,
  },
  reviewSection: {
    marginBottom: 28,
    gap: 12,
  },
  missionReviewHeader: {
    gap: 4,
    marginBottom: 4,
  },
  missionReviewEyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionReviewEyebrowText: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: R.cyanAccent,
  },
  reviewSubtitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  reviewLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 14,
    marginTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendMark: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '800',
  },
  legendMarkWrong: {
    color: R.wrongAccent,
  },
  legendMarkUnanswered: {
    color: R.unansweredAccent,
  },
  legendText: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
  },
  legendTextWrong: {
    color: R.wrongAccent,
  },
  legendTextUnanswered: {
    color: R.unansweredAccent,
  },
  topicList: {
    gap: 12,
  },
  topicCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: R.reviewCardBg,
    padding: 14,
    gap: 10,
  },
  topicCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topicDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  topicName: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flex: 1,
  },
  topicNeeds: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '500',
    color: R.mutedText,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: R.chipMinHeight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '800',
  },
  chipMark: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '800',
  },
  qBadge: {
    minWidth: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  qBadgeText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeWrong: {
    backgroundColor: 'rgba(244, 63, 94, 0.18)',
    borderColor: R.rowWrongBorder,
  },
  statusBadgeUnanswered: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: R.rowUnansweredBorder,
  },
  statusBadgeText: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  stemBox: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 6,
  },
  reviewDiagramWrap: {
    width: '100%',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  stemLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: R.labelText,
  },
  stem: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 26,
    color: '#FFFFFF',
  },
  answerBlock: {
    gap: 8,
  },
  answerPanel: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  answerLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
    color: R.labelText,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  answerValue: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  answerMuted: {
    fontStyle: 'italic',
    fontWeight: '500',
  },
  explainBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: R.explainBorder,
    backgroundColor: R.explainBg,
    padding: 12,
    gap: 6,
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  explainLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '700',
    color: R.violetAccent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  explainText: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    color: R.mutedText,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: R.modalBackdrop,
  },
  modalCenter: {
    flex: 1,
  },
  modalCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: R.modalBorder,
    backgroundColor: R.modalBg,
    padding: 14,
    gap: 10,
    maxWidth: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  detailTopic: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '700',
    color: R.heroAccent,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  modalScroll: {
    flexGrow: 0,
    flexShrink: 1,
    // RN Web: hide Firefox / modern Chromium scrollbars (WebKit via scoped <style>).
    ...(Platform.OS === 'web'
      ? ({
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as object)
      : null),
  },
  modalScrollContent: {
    gap: 12,
    paddingBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minHeight: 44,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  navBtnDisabled: {
    opacity: 0.45,
  },
  navBtnLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navBtnLabelDisabled: {
    color: R.mutedText,
  },
  positionLabel: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '600',
    color: R.mutedText,
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: R.cta,
    marginTop: 2,
  },
  doneBtnLabel: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsBlock: {
    gap: 12,
  },
  nextMissionHeading: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: R.heroAccent,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    minHeight: 48,
  },
  tryAgainBtn: {
    backgroundColor: R.cta,
  },
  homeBtn: {
    backgroundColor: R.homeBg,
    borderWidth: 1,
    borderColor: R.homeBorder,
  },
  actionLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
