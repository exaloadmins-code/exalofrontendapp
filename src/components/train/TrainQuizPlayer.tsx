import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import {
  TRAIN_GAMEPLAY as T,
  TRAIN_GAMEPLAY_COPY as COPY,
} from '@/constants/trainGameplay';
import { TEST, formatTestCountdown } from '@/constants/test';
import { FOCUS, formatFocusElapsed } from '@/constants/focus';
import {
  getTrainOptions,
  type OptionLetter,
  type TrainAnswerRecord,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import { TrainQuestionDiagram } from '@/components/train/TrainQuestionDiagram';
import { fonts } from '@/theme';

export type TrainQuizPlayerProps = {
  title: string;
  subtitle?: string;
  questions: TrainQuestionRow[];
  /**
   * Empty-state exit only. Active gameplay Back is previous-question, not exit.
   */
  onExit: () => void;
  /**
   * Called when the learner finishes (last question) or confirms End Focus.
   * Always receives one row per session question position (unanswered → chosen:null).
   */
  onSeeResults: (answers: TrainAnswerRecord[]) => void;
  /**
   * Optional Test-session wall-clock deadline (ms since epoch).
   * When set, shows a countdown and auto-finalizes via `onTimeExpired`.
   * Omit for Train / Focus (no countdown).
   */
  sessionEndsAtMs?: number;
  /** Fired once when the session deadline is reached (Test only). */
  onTimeExpired?: (answers: TrainAnswerRecord[]) => void;
  /**
   * Optional Focus-session start timestamp (ms since epoch).
   * When set (and `sessionEndsAtMs` is omitted), shows an elapsed count-up timer.
   * Omit for Train. Do not combine with Test countdown.
   */
  sessionStartedAtMs?: number;
  /**
   * Focus only — shows END FOCUS (with confirmation). Never enable for Train/Test.
   */
  showEndFocus?: boolean;
  /**
   * Maths API mode: do not treat Correct_Option as authoritative during play.
   * Local isCorrect stays false until Results are hydrated from the backend.
   */
  deferCorrectness?: boolean;
  /** Fired whenever the learner changes the selection for a session index. */
  onAnswerChange?: (
    sessionIndex: number,
    letter: OptionLetter,
    record: TrainAnswerRecord,
  ) => void;
  /**
   * Optional async gate before calling onSeeResults (e.g. drain answer writes +
   * complete Maths API session). Errors should be handled by the caller.
   */
  onBeforeSeeResults?: (
    answers: TrainAnswerRecord[],
  ) => void | Promise<void>;
  /**
   * Continuous Maths Train: at each loaded-page boundary show a checkpoint
   * instead of auto-completing. Optional — omit for English / Focus / Test.
   */
  continuousTrain?: boolean;
  /** Whether another server page may still be appended. */
  hasMore?: boolean;
  /**
   * Drain answers + continue session. Must append questions via parent state
   * and return the 0-based index of the first newly loaded question.
   */
  onPageContinue?: () => Promise<{ nextIndex: number }>;
  /**
   * When true, header shows "Question N" (cumulative) without implying a
   * preselected final denominator. Default false preserves Focus/Test/English.
   */
  absoluteQuestionLabel?: boolean;
  /**
   * Fired when the visible question index changes (mount, Back, Next, jump).
   * `fromIndex` is null on the initial visible question.
   */
  onVisibleQuestionChange?: (
    fromIndex: number | null,
    toIndex: number,
  ) => void;
  /**
   * When set, finalize/completion failures are delegated to the parent
   * (e.g. FocusApiErrorModal) instead of rendering the raw error inline.
   * Train omits this and keeps the existing inline finalizeError UI.
   */
  onFinalizeError?: (err: unknown) => void;
};

/**
 * Expand position slots → Results rows. Unanswered positions stay `chosen: null`.
 * Order matches session question positions (Train local-repeat safe).
 */
function slotsToResults(
  slots: readonly (TrainAnswerRecord | null)[],
  questions: readonly TrainQuestionRow[],
): TrainAnswerRecord[] {
  return questions.map((q, i) => {
    const existing = slots[i];
    if (existing) {
      return existing;
    }
    const correct = (q.Correct_Option ?? 'A')
      .toString()
      .trim()
      .toUpperCase() as OptionLetter;
    return {
      qid: q.Question_ID,
      chosen: null,
      correct,
      isCorrect: false,
    };
  });
}

/**
 * Shared QuizPlayer for Train / Focus / Test.
 *
 * GAMEPLAY: neutral answer selection only — no correct/wrong reveal.
 * NAV: in-app Back = previous question (disabled on Q1). Next = next / See results.
 * FOCUS: optional END FOCUS → confirm → partial Results.
 * SCORING: answer slots keyed by session position (not qid).
 * RESULTS: callers hand answers to TrainResultsView after the run.
 *
 * - Train: no timer props
 * - Focus: `sessionStartedAtMs` → elapsed count-up (M9A) + `showEndFocus`
 * - Test: `sessionEndsAtMs` → countdown (unchanged deadline)
 */
export function TrainQuizPlayer({
  title,
  subtitle,
  questions,
  onExit,
  onSeeResults,
  sessionEndsAtMs,
  onTimeExpired,
  sessionStartedAtMs,
  showEndFocus = false,
  deferCorrectness = false,
  onAnswerChange,
  onBeforeSeeResults,
  onVisibleQuestionChange,
  onFinalizeError,
  continuousTrain = false,
  hasMore = false,
  onPageContinue,
  absoluteQuestionLabel = false,
}: TrainQuizPlayerProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<OptionLetter | null>(null);
  /** One slot per session position — independent of repeated Question_IDs. */
  const [answerSlots, setAnswerSlots] = useState<(TrainAnswerRecord | null)[]>(
    () => Array.from({ length: questions.length }, () => null),
  );
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(() =>
    sessionEndsAtMs != null
      ? Math.max(0, Math.ceil((sessionEndsAtMs - Date.now()) / 1000))
      : null,
  );
  const [elapsedSec, setElapsedSec] = useState<number | null>(() =>
    sessionEndsAtMs == null && sessionStartedAtMs != null
      ? Math.max(0, Math.floor((Date.now() - sessionStartedAtMs) / 1000))
      : null,
  );
  /** Focus End Focus confirmation — in-tree Modal (reliable on Android vs Alert). */
  const [endFocusConfirmVisible, setEndFocusConfirmVisible] = useState(false);
  const [checkpointVisible, setCheckpointVisible] = useState(false);
  const [continuing, setContinuing] = useState(false);

  const answerSlotsRef = useRef(answerSlots);
  answerSlotsRef.current = answerSlots;
  const questionsRef = useRef(questions);
  questionsRef.current = questions;
  const expiredRef = useRef(false);
  const finalizedRef = useRef(false);
  const onTimeExpiredRef = useRef(onTimeExpired);
  onTimeExpiredRef.current = onTimeExpired;
  const onSeeResultsRef = useRef(onSeeResults);
  onSeeResultsRef.current = onSeeResults;
  const onBeforeSeeResultsRef = useRef(onBeforeSeeResults);
  onBeforeSeeResultsRef.current = onBeforeSeeResults;
  const onAnswerChangeRef = useRef(onAnswerChange);
  onAnswerChangeRef.current = onAnswerChange;
  const onVisibleQuestionChangeRef = useRef(onVisibleQuestionChange);
  onVisibleQuestionChangeRef.current = onVisibleQuestionChange;
  const onFinalizeErrorRef = useRef(onFinalizeError);
  onFinalizeErrorRef.current = onFinalizeError;
  const prevVisibleIdxRef = useRef<number | null>(null);
  const onPageContinueRef = useRef(onPageContinue);
  onPageContinueRef.current = onPageContinue;
  const [finalizing, setFinalizing] = useState(false);

  // Keep answer slots aligned when continuous Train appends a page.
  useEffect(() => {
    setAnswerSlots((prev) => {
      if (prev.length === questions.length) {
        return prev;
      }
      if (prev.length > questions.length) {
        return prev.slice(0, questions.length);
      }
      const next = prev.slice();
      while (next.length < questions.length) {
        next.push(null);
      }
      answerSlotsRef.current = next;
      return next;
    });
  }, [questions.length]);

  const timed = sessionEndsAtMs != null;
  const locked =
    timed &&
    (expiredRef.current ||
      finalizedRef.current ||
      (remainingSec !== null && remainingSec <= 0));
  const showElapsed = !timed && sessionStartedAtMs != null;
  const canGoPrevious =
    idx > 0 && !locked && !finalizedRef.current && !expiredRef.current;

  const finalizeOnce = (slots: readonly (TrainAnswerRecord | null)[]) => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    const answers = slotsToResults(slots, questionsRef.current);
    const before = onBeforeSeeResultsRef.current;
    if (!before) {
      onSeeResultsRef.current(answers);
      return;
    }
    setFinalizing(true);
    Promise.resolve(before(answers))
      .then(() => {
        onSeeResultsRef.current(answers);
      })
      .catch((err: unknown) => {
        finalizedRef.current = false;
        setFinalizing(false);
        // Focus (and similar): parent owns learner-facing error presentation.
        // Do not render raw ApiError / URL / env text inline in the card.
        if (onFinalizeErrorRef.current) {
          setFinalizeError(null);
          onFinalizeErrorRef.current(err);
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to finish Train session.';
        setFinalizeError(message);
      });
  };

  /**
   * Android hardware Back: consume during active gameplay — do not exit session.
   * If End Focus confirmation is open, dismiss it first (Keep Focusing equivalent).
   */
  useEffect(() => {
    if (!questions.length) {
      return;
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (endFocusConfirmVisible) {
        setEndFocusConfirmVisible(false);
        return true;
      }
      return true;
    });
    return () => sub.remove();
  }, [questions.length, endFocusConfirmVisible]);

  useEffect(() => {
    if (!questions.length) {
      prevVisibleIdxRef.current = null;
      return;
    }
    const from = prevVisibleIdxRef.current;
    prevVisibleIdxRef.current = idx;
    onVisibleQuestionChangeRef.current?.(from, idx);
  }, [idx, questions.length]);

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
      if (rem <= 0 && !expiredRef.current && !finalizedRef.current) {
        expiredRef.current = true;
        finalizedRef.current = true;
        onTimeExpiredRef.current?.(
          slotsToResults(answerSlotsRef.current, questionsRef.current),
        );
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

  useEffect(() => {
    if (sessionEndsAtMs != null || sessionStartedAtMs == null) {
      setElapsedSec(null);
      return;
    }

    const tick = () => {
      setElapsedSec(
        Math.max(0, Math.floor((Date.now() - sessionStartedAtMs) / 1000)),
      );
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
  }, [sessionStartedAtMs, sessionEndsAtMs]);

  const contentWidth = Math.min(windowWidth - 32, T.contentMaxWidth);
  const q = questions[idx];
  const opts = useMemo(() => (q ? getTrainOptions(q) : []), [q]);
  const correct = (q?.Correct_Option ?? 'A')
    .toString()
    .trim()
    .toUpperCase() as OptionLetter;

  /**
   * Neutral selection only. Correctness is stored for Results but never shown here.
   * Learner may change selection (including after Back). Latest selection wins per index.
   */
  const selectAnswer = (letter: OptionLetter) => {
    if (expiredRef.current || locked || finalizedRef.current || !q) return;
    setSelected(letter);
    const record: TrainAnswerRecord = {
      qid: q.Question_ID,
      chosen: letter,
      correct,
      isCorrect: deferCorrectness ? false : letter === correct,
    };
    setAnswerSlots((prev) => {
      const next = prev.slice();
      while (next.length < questions.length) {
        next.push(null);
      }
      next[idx] = record;
      answerSlotsRef.current = next;
      return next;
    });
    onAnswerChangeRef.current?.(idx, letter, record);
  };

  const goPrevious = () => {
    if (!canGoPrevious) return;
    const nextIdx = idx - 1;
    setIdx(nextIdx);
    setSelected(answerSlots[nextIdx]?.chosen ?? null);
  };

  const goNext = () => {
    if (
      expiredRef.current ||
      locked ||
      finalizedRef.current ||
      finalizing ||
      continuing ||
      checkpointVisible
    ) {
      return;
    }
    if (selected == null) return;
    setFinalizeError(null);
    if (idx + 1 >= questions.length) {
      if (continuousTrain) {
        setCheckpointVisible(true);
        return;
      }
      finalizeOnce(answerSlotsRef.current);
      return;
    }
    const nextIdx = idx + 1;
    setIdx(nextIdx);
    setSelected(answerSlots[nextIdx]?.chosen ?? null);
  };

  const confirmCheckpointResults = () => {
    if (continuing || finalizing) return;
    setCheckpointVisible(false);
    finalizeOnce(answerSlotsRef.current);
  };

  const confirmCheckpointContinue = () => {
    if (!hasMore || continuing || finalizing || !onPageContinueRef.current) {
      return;
    }
    setContinuing(true);
    setFinalizeError(null);
    Promise.resolve(onPageContinueRef.current())
      .then(({ nextIndex }) => {
        setCheckpointVisible(false);
        setContinuing(false);
        setIdx(nextIndex);
        setSelected(null);
      })
      .catch((err: unknown) => {
        setContinuing(false);
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load more Train questions.';
        setFinalizeError(message);
      });
  };

  const requestEndFocus = () => {
    // Do not gate on Test `locked` — End Focus is Focus-only and must remain tappable.
    if (!showEndFocus || finalizedRef.current || expiredRef.current) {
      return;
    }
    setEndFocusConfirmVisible(true);
  };

  const cancelEndFocus = () => {
    setEndFocusConfirmVisible(false);
  };

  const confirmEndFocus = () => {
    setEndFocusConfirmVisible(false);
    if (finalizedRef.current || expiredRef.current) return;
    finalizeOnce(answerSlotsRef.current);
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

  const isLast = idx + 1 >= questions.length;
  const timerUrgent = remainingSec !== null && remainingSec <= 30;
  const elapsedLabel =
    elapsedSec !== null ? formatFocusElapsed(elapsedSec) : null;
  const horizontalPad = Math.max(16, (windowWidth - contentWidth) / 2);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      {/*
        Header chrome lives OUTSIDE ScrollView so END FOCUS remains tappable on
        Android (ScrollView gesture interception was swallowing presses).
      */}
      <View style={[styles.headerChrome, { paddingHorizontal: horizontalPad }]}>
        <View style={[styles.headerInner, { width: contentWidth }]}>
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={COPY.previousQuestion}
              accessibilityState={{ disabled: !canGoPrevious }}
              disabled={!canGoPrevious}
              onPress={goPrevious}
              style={[styles.backBtn, !canGoPrevious && styles.backBtnDisabled]}
            >
              <ArrowLeft
                size={20}
                color={canGoPrevious ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}
                strokeWidth={2.25}
              />
            </Pressable>
            {remainingSec !== null ? (
              <Text
                accessibilityRole="timer"
                accessibilityLabel={`Time remaining ${formatTestCountdown(remainingSec)}`}
                style={[styles.timer, timerUrgent && styles.timerUrgent]}
              >
                {formatTestCountdown(remainingSec)}
              </Text>
            ) : showElapsed && elapsedLabel !== null ? (
              <Text
                accessibilityRole="timer"
                accessibilityLabel={`Focus elapsed time ${elapsedLabel}`}
                style={styles.elapsedTimer}
              >
                {elapsedLabel}
              </Text>
            ) : (
              <View style={styles.timerSpacer} />
            )}
            <Text style={styles.counter}>
              {absoluteQuestionLabel
                ? `Question ${idx + 1}`
                : `${idx + 1} / ${questions.length}`}
            </Text>
          </View>

          {showEndFocus ? (
            <View style={styles.modeHeaderRow}>
              <Text
                style={[styles.title, styles.titleInRow]}
                numberOfLines={2}
              >
                {title}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.endFocus}
                disabled={finalizedRef.current || expiredRef.current}
                onPress={requestEndFocus}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [
                  styles.endFocusBtn,
                  pressed && styles.endFocusBtnPressed,
                ]}
              >
                <Text style={styles.endFocusLabel}>{COPY.endFocus}</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}

          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: horizontalPad,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, alignSelf: 'center' }}>
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

            <TrainQuestionDiagram
              hasDiagram={q.has_diagram}
              diagramType={q.diagram_type}
              diagramPrompt={q.diagram_prompt}
              diagramData={q.diagram_data}
              width={contentWidth - 40}
            />

            <View style={styles.options}>
              {opts.map(({ letter, text }) => {
                const chosen = selected === letter;
                return (
                  <Pressable
                    key={letter}
                    accessibilityRole="button"
                    accessibilityState={{
                      disabled: locked || finalizedRef.current,
                      selected: chosen,
                    }}
                    disabled={locked || finalizedRef.current}
                    onPress={() => selectAnswer(letter)}
                    style={[styles.option, chosen && styles.optionSelected]}
                  >
                    <View style={[styles.badge, chosen && styles.badgeSelected]}>
                      <Text style={styles.badgeText}>{letter}</Text>
                    </View>
                    <Text style={styles.optionText}>{text}</Text>
                  </Pressable>
                );
              })}
            </View>

            {selected !== null &&
            !locked &&
            !finalizedRef.current &&
            !checkpointVisible ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  isLast && !continuousTrain
                    ? COPY.seeResults
                    : COPY.nextQuestion
                }
                disabled={finalizing || continuing}
                onPress={goNext}
                style={[
                  styles.nextBtn,
                  (finalizing || continuing) && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.ctaLabel}>
                  {finalizing
                    ? 'Saving…'
                    : isLast && !continuousTrain
                      ? COPY.seeResults
                      : COPY.nextQuestion}
                </Text>
                <ChevronRight size={16} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            ) : null}
            {finalizeError ? (
              <Text style={styles.finalizeError}>{finalizeError}</Text>
            ) : null}
          </LinearGradient>
        </View>
      </ScrollView>

      {continuousTrain ? (
        <Modal
          visible={checkpointVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!continuing && !finalizing) {
              setCheckpointVisible(false);
            }
          }}
        >
          <View style={styles.confirmBackdrop}>
            <View style={styles.confirmCard} accessibilityViewIsModal>
              <Text style={styles.confirmTitle}>{COPY.checkpointTitle}</Text>
              <Text style={styles.confirmMessage}>
                {hasMore
                  ? COPY.checkpointDone(questions.length)
                  : COPY.checkpointExhausted(questions.length)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.viewResults}
                disabled={continuing || finalizing}
                onPress={confirmCheckpointResults}
                style={[
                  styles.confirmKeepBtn,
                  (continuing || finalizing) && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.confirmKeepLabel}>
                  {finalizing ? 'Saving…' : COPY.viewResults}
                </Text>
              </Pressable>
              {hasMore ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={COPY.continueTraining}
                  disabled={continuing || finalizing}
                  onPress={confirmCheckpointContinue}
                  style={[
                    styles.confirmEndBtn,
                    (continuing || finalizing) && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.confirmEndLabel}>
                    {continuing ? COPY.loadingMore : COPY.continueTraining}
                  </Text>
                </Pressable>
              ) : null}
              {finalizeError ? (
                <Text style={styles.finalizeError}>{finalizeError}</Text>
              ) : null}
            </View>
          </View>
        </Modal>
      ) : null}

      {showEndFocus ? (
        <Modal
          visible={endFocusConfirmVisible}
          transparent
          animationType="fade"
          onRequestClose={cancelEndFocus}
        >
          <View style={styles.confirmBackdrop}>
            <View
              style={styles.confirmCard}
              accessibilityViewIsModal
            >
              <Text style={styles.confirmTitle}>{COPY.endFocusTitle}</Text>
              <Text style={styles.confirmMessage}>{COPY.endFocusMessage}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.keepFocusing}
                onPress={cancelEndFocus}
                style={styles.confirmKeepBtn}
              >
                <Text style={styles.confirmKeepLabel}>{COPY.keepFocusing}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={COPY.endFocus}
                onPress={confirmEndFocus}
                style={styles.confirmEndBtn}
              >
                <Text style={styles.confirmEndLabel}>{COPY.endFocus}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.background,
  },
  headerChrome: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
    elevation: 2,
  },
  headerInner: {
    alignSelf: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 4,
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
  backBtnDisabled: {
    opacity: 0.45,
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
  /** Focus elapsed count-up — same header slot as Test, violet (not countdown yellow). */
  elapsedTimer: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    color: FOCUS.timerText,
    minWidth: 88,
    textAlign: 'center',
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
  modeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
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
  titleInRow: {
    flex: 1,
    flexShrink: 1,
    marginBottom: 0,
    paddingRight: 4,
  },
  subtitle: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.violetSoft,
    marginBottom: 12,
  },
  /** Destructive End Focus — red treatment (not violet). */
  endFocusBtn: {
    flexShrink: 0,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: T.wrongBg,
    borderWidth: 1.5,
    borderColor: T.wrongBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endFocusBtnPressed: {
    opacity: 0.85,
    backgroundColor: 'rgba(244, 63, 94, 0.35)',
  },
  endFocusLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#FFE4E6',
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 4, 33, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 24,
    gap: 12,
  },
  confirmTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  confirmMessage: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    color: T.violetText,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmKeepBtn: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: T.cta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  confirmKeepLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  confirmEndBtn: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: T.wrongBg,
    borderWidth: 1.5,
    borderColor: T.wrongBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  confirmEndLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFE4E6',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  /** Neutral “selected” only — never encodes correct/wrong. */
  optionSelected: {
    backgroundColor: 'rgba(124, 58, 237, 0.32)',
    borderColor: '#A78BFA',
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
  badgeSelected: {
    backgroundColor: T.cta,
    borderColor: '#A78BFA',
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
  finalizeError: {
    marginTop: 12,
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '500',
    color: '#FCA5A5',
    textAlign: 'center',
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
