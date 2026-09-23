import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, ChevronRight, Lightbulb, X } from 'lucide-react-native';
import {
  TRAIN_GAMEPLAY as T,
  TRAIN_GAMEPLAY_COPY as COPY,
} from '@/constants/trainGameplay';
import { TEST, formatTestCountdown } from '@/constants/test';
import {
  getTrainOptions,
  type OptionLetter,
  type TrainAnswerRecord,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import { fonts } from '@/theme';

export type TrainQuizPlayerProps = {
  title: string;
  subtitle?: string;
  questions: TrainQuestionRow[];
  onExit: () => void;
  /**
   * Called when the learner taps "See results" after the final question.
   * M4 does not render Lovable's finished Results screen — hand off to M5 boundary.
   */
  onSeeResults: (answers: TrainAnswerRecord[]) => void;
  /**
   * Optional Test-session wall-clock deadline (ms since epoch).
   * When set, shows a countdown and auto-finalizes via `onTimeExpired`.
   * Omit for Train / Focus (no timer).
   */
  sessionEndsAtMs?: number;
  /** Fired once when the session deadline is reached (Test only). */
  onTimeExpired?: (answers: TrainAnswerRecord[]) => void;
};

/**
 * Lovable `QuizPlayer` parity for Train / Focus / Test gameplay (composable UI).
 * Optional session timer is Test-only — absent props leave Train/Focus unchanged.
 */
export function TrainQuizPlayer({
  title,
  subtitle,
  questions,
  onExit,
  onSeeResults,
  sessionEndsAtMs,
  onTimeExpired,
}: TrainQuizPlayerProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<OptionLetter | null>(null);
  const [answers, setAnswers] = useState<TrainAnswerRecord[]>([]);
  const [remainingSec, setRemainingSec] = useState<number | null>(() =>
    sessionEndsAtMs != null
      ? Math.max(0, Math.ceil((sessionEndsAtMs - Date.now()) / 1000))
      : null,
  );

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const expiredRef = useRef(false);
  const onTimeExpiredRef = useRef(onTimeExpired);
  onTimeExpiredRef.current = onTimeExpired;

  const timed = sessionEndsAtMs != null;
  const locked = timed && (expiredRef.current || (remainingSec !== null && remainingSec <= 0));

  useEffect(() => {
    if (sessionEndsAtMs == null) {
      setRemainingSec(null);
      expiredRef.current = false;
      return;
    }

    expiredRef.current = false;

    const tick = () => {
      const rem = Math.max(0, Math.ceil((sessionEndsAtMs - Date.now()) / 1000));
      setRemainingSec(rem);
      if (rem <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onTimeExpiredRef.current?.(answersRef.current);
      }
    };

    tick();
    const id = setInterval(tick, 250);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        tick();
      }
    });

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [sessionEndsAtMs]);

  const contentWidth = Math.min(windowWidth - 32, T.contentMaxWidth);
  const q = questions[idx];
  const opts = useMemo(() => (q ? getTrainOptions(q) : []), [q]);
  const correct = (q?.Correct_Option ?? 'A').toString().trim().toUpperCase() as OptionLetter;

  const submit = (letter: OptionLetter) => {
    if (expiredRef.current || locked) return;
    if (selected || !q) return;
    setSelected(letter);
    setAnswers((prev) => [
      ...prev,
      { qid: q.Question_ID, chosen: letter, correct, isCorrect: letter === correct },
    ]);
  };

  const next = () => {
    if (expiredRef.current || locked) return;
    if (idx + 1 >= questions.length) {
      onSeeResults(answersRef.current);
      return;
    }
    setSelected(null);
    setIdx((i) => i + 1);
  };

  if (!questions.length) {
    return (
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          },
        ]}
      >
        <View style={[styles.emptyCard, { maxWidth: T.emptyMaxWidth, width: '100%' }]}>
          <Text style={styles.emptyTitle}>{COPY.emptyTitle}</Text>
          <Text style={styles.emptyBody}>{COPY.emptyBody}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.goBack}
            onPress={onExit}
            style={styles.cta}
          >
            <Text style={styles.ctaLabel}>{COPY.goBack}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isWrong = selected !== null && selected !== correct;
  const isRight = selected !== null && selected === correct;
  const isLast = idx + 1 >= questions.length;
  const timerUrgent = remainingSec !== null && remainingSec <= 30;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: Math.max(16, (windowWidth - contentWidth) / 2),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, alignSelf: 'center' }}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onExit}
              style={styles.backBtn}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.25} />
            </Pressable>
            {remainingSec !== null ? (
              <Text
                accessibilityRole="timer"
                accessibilityLabel={`Time remaining ${formatTestCountdown(remainingSec)}`}
                style={[styles.timer, timerUrgent && styles.timerUrgent]}
              >
                {formatTestCountdown(remainingSec)}
              </Text>
            ) : (
              <View style={styles.timerSpacer} />
            )}
            <Text style={styles.counter}>
              {idx + 1} / {questions.length}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <LinearGradient
            colors={[T.cardFrom, T.cardTo]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.card}
          >
            <Text style={styles.chip}>
              {q.Subject} · {q.Difficulty}
            </Text>
            <Text style={styles.stem}>{q.Question_Text}</Text>

            <View style={styles.options}>
              {opts.map(({ letter, text }) => {
                const chosen = selected === letter;
                const isCorrectOpt = selected !== null && letter === correct;
                const isWrongChoice = chosen && letter !== correct;
                const dimOthers =
                  selected !== null && !chosen && !isCorrectOpt;

                return (
                  <Pressable
                    key={letter}
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: selected !== null || locked,
                      selected: chosen,
                    }}
                    disabled={selected !== null || locked}
                    onPress={() => submit(letter)}
                    style={[
                      styles.option,
                      isCorrectOpt && styles.optionCorrect,
                      isWrongChoice && styles.optionWrong,
                      dimOthers && styles.optionDim,
                    ]}
                  >
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{letter}</Text>
                    </View>
                    <Text style={styles.optionText}>{text}</Text>
                    {isCorrectOpt ? (
                      <Check
                        size={20}
                        color={T.correctIcon}
                        strokeWidth={2.25}
                        style={styles.optionIcon}
                      />
                    ) : null}
                    {isWrongChoice ? (
                      <X
                        size={20}
                        color={T.wrongIcon}
                        strokeWidth={2.25}
                        style={styles.optionIcon}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {isRight ? (
              <View style={styles.correctBanner}>
                <Text style={styles.correctBannerText}>{COPY.correctBanner}</Text>
              </View>
            ) : null}

            {isWrong && q.Explanation ? (
              <View style={styles.explainBanner}>
                <View style={styles.explainHeader}>
                  <Lightbulb size={16} color={T.explainText} strokeWidth={2.25} />
                  <Text style={styles.explainTitle}>{COPY.explanationTitle}</Text>
                </View>
                <Text style={styles.explainBody}>{q.Explanation}</Text>
              </View>
            ) : null}

            {selected !== null && !locked ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isLast ? COPY.seeResults : COPY.nextQuestion}
                onPress={next}
                style={styles.nextBtn}
              >
                <Text style={styles.ctaLabel}>
                  {isLast ? COPY.seeResults : COPY.nextQuestion}
                </Text>
                <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            ) : null}
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    height: 44,
    width: 44,
    borderRadius: 999,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    color: TEST.timerText,
    minWidth: 72,
    textAlign: 'center',
  },
  timerUrgent: {
    color: TEST.timerUrgent,
  },
  timerSpacer: {
    minWidth: 72,
  },
  counter: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.violetText,
    minWidth: 44,
    textAlign: 'right',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: T.violetMuted,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.violetSoft,
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.cardBorder,
    padding: 24,
    shadowColor: T.cardShadow,
    shadowOpacity: 0.55,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  chip: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: T.violetMuted,
    marginBottom: 8,
  },
  stem: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    color: '#FFFFFF',
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: T.optionBg,
    borderWidth: 1,
    borderColor: T.optionBorder,
  },
  optionCorrect: {
    backgroundColor: T.correctBg,
    borderColor: T.correctBorder,
  },
  optionWrong: {
    backgroundColor: T.wrongBg,
    borderColor: T.wrongBorder,
  },
  optionDim: {
    opacity: 0.7,
  },
  badge: {
    height: 32,
    width: 32,
    borderRadius: 8,
    backgroundColor: T.badgeBg,
    borderWidth: 1,
    borderColor: T.badgeBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    color: '#FFFFFF',
    paddingTop: 4,
  },
  optionIcon: {
    marginTop: 4,
    marginLeft: 'auto',
  },
  correctBanner: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    backgroundColor: T.correctBannerBg,
    borderWidth: 1,
    borderColor: T.correctBannerBorder,
  },
  correctBannerText: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.correctText,
  },
  explainBanner: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    backgroundColor: T.explainBg,
    borderWidth: 1,
    borderColor: T.explainBorder,
  },
  explainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  explainTitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
    color: T.explainText,
  },
  explainBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: T.explainText,
  },
  nextBtn: {
    marginTop: 24,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: T.cta,
  },
  cta: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: T.cta,
  },
  ctaLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyCard: {
    alignSelf: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(26, 23, 72, 0.8)',
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.violetText,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
});
