import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FocusSetupView } from '@/components/focus';
import {
  FocusApiErrorModal,
  type FocusApiErrorPrompt,
} from '@/components/focus/FocusApiErrorModal';
import { TrainQuizPlayer } from '@/components/train/TrainQuizPlayer';
import { TrainResultsView } from '@/components/train/TrainResultsView';
import {
  FOCUS,
  FOCUS_COPY as COPY,
  isValidFocusQuestionCount,
  type FocusDifficulty,
} from '@/constants/focus';
import {
  journeySubjectLabel,
  normalizeJourneySubject,
  type JourneySubject,
} from '@/constants/journey';
import { Routes } from '@/constants/routes';
import { trainTopicsFor, type TrainDifficulty } from '@/constants/train';
import {
  formatFocusInsufficientPoolMessage,
  isFocusInsufficientPoolError,
} from '@/services/api/http';
import { completeFocus } from '@/services/api/focusApi';
import { getSessionResults } from '@/services/api/sessionApi';
import {
  FocusQuestionTiming,
  TrainAnswerWriteQueue,
  hydrateTrainResultFromApi,
  loadFocusQuestions,
  startMathsFocusSession,
  type OptionLetter,
  type TrainAnswerRecord,
  type TrainBankDifficulty,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import type { TrainResultSnapshot } from '@/services/trainResults';
import { fonts } from '@/theme';

type FocusPhase = 'setup' | 'play' | 'results';

function toTrainDifficulty(d: FocusDifficulty): TrainDifficulty {
  return d.toLowerCase() as TrainDifficulty;
}

/** Learner-facing generic Focus START copy — never surfaces URL/env/ApiError detail. */
function focusStartErrorPrompt(): FocusApiErrorPrompt {
  return {
    title: COPY.startErrorTitle,
    message: COPY.startErrorBody,
  };
}

/** Learner-facing finalize/completion copy — never surfaces URL/env/ApiError detail. */
function focusCompletionErrorPrompt(): FocusApiErrorPrompt {
  return {
    title: COPY.finishErrorTitle,
    message: COPY.finishErrorBody,
  };
}

/**
 * Focus — Maths is API-backed (B2.3); English remains local.
 *
 * Setup: multi-topic (≥2) + one difficulty + explicit question count (5–50, no default).
 * Maths: POST /focus/start → GET /sessions/.../questions → answer queue + timing →
 *        complete + GET /sessions/.../results.
 * English: local loadFocusQuestions with the learner-selected count.
 * Results: Home → /home; Try Again → Focus setup (fresh count required).
 */
export default function FocusScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);

  const topics = useMemo(
    () => (subject ? trainTopicsFor(subject) : []),
    [subject],
  );
  const subjectLabel = subject ? journeySubjectLabel(subject) : '';
  const subjectTypeLabel =
    subject === 'english' ? 'English' : subject === 'maths' ? 'Maths' : '';

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<FocusDifficulty | null>(null);
  /** Explicit question count — null until learner chooses (NO default). */
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [sessionDifficulty, setSessionDifficulty] =
    useState<FocusDifficulty | null>(null);
  const [phase, setPhase] = useState<FocusPhase>('setup');
  const [questions, setQuestions] = useState<TrainQuestionRow[]>([]);
  const [answers, setAnswers] = useState<TrainAnswerRecord[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [setupResetKey, setSetupResetKey] = useState(0);
  const [sessionStartedAtMs, setSessionStartedAtMs] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<FocusApiErrorPrompt | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [apiResults, setApiResults] = useState<TrainResultSnapshot | null>(
    null,
  );

  const writeQueueRef = useRef<TrainAnswerWriteQueue | null>(null);
  const timingRef = useRef<FocusQuestionTiming | null>(null);
  const startGenRef = useRef(0);
  const completingRef = useRef(false);
  /** True after POST /focus/complete succeeded — Results retry must not re-complete. */
  const sessionCompletedOnBackendRef = useRef(false);
  const bankDifficultyRef = useRef<TrainBankDifficulty>('Easy');
  const questionsRef = useRef<TrainQuestionRow[]>([]);
  questionsRef.current = questions;

  useEffect(() => {
    if (source !== 'api' || phase !== 'play') {
      return;
    }
    const timing = timingRef.current;
    if (!timing) {
      return;
    }
    const sub = AppState.addEventListener('change', (state) => {
      timing.setAppActive(state === 'active');
    });
    timing.setAppActive(AppState.currentState === 'active');
    return () => {
      sub.remove();
    };
  }, [source, phase, sessionKey]);

  const exitToJourney = () => {
    if (subject) {
      router.replace(`/journey/${subject}` as Href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const returnToSetup = () => {
    startGenRef.current += 1;
    completingRef.current = false;
    sessionCompletedOnBackendRef.current = false;
    writeQueueRef.current = null;
    timingRef.current?.reset();
    timingRef.current = null;
    setPhase('setup');
    setQuestions([]);
    setAnswers([]);
    setSessionStartedAtMs(null);
    setSessionId(null);
    setSource('local');
    setApiResults(null);
    setSessionDifficulty(null);
    setQuestionCount(null);
    setApiError(null);
    setSetupResetKey((k) => k + 1);
  };

  const toggleTopic = (label: string) => {
    setSelectedTopics((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const selectDifficulty = (d: FocusDifficulty) => {
    setSelectedDifficulty(d);
  };

  /**
   * Starts only after the count prompt confirms an explicit 5–50 value.
   * Main Start Focus opens that prompt; it does not call this directly.
   */
  const start = async (confirmedCount: number) => {
    if (
      loading ||
      !subject ||
      selectedTopics.length < 2 ||
      selectedDifficulty == null ||
      !isValidFocusQuestionCount(confirmedCount)
    ) {
      return;
    }

    const gen = ++startGenRef.current;
    completingRef.current = false;
    sessionCompletedOnBackendRef.current = false;
    setQuestionCount(confirmedCount);
    setApiError(null);
    setLoading(true);
    setApiResults(null);
    writeQueueRef.current = null;
    timingRef.current?.reset();
    timingRef.current = null;

    try {
      if (subject === 'maths') {
        const loaded = await startMathsFocusSession({
          subject,
          topicLabels: selectedTopics,
          difficulty: selectedDifficulty,
          questionCount: confirmedCount,
        });
        if (gen !== startGenRef.current) {
          return;
        }
        const timing = new FocusQuestionTiming();
        timingRef.current = timing;
        writeQueueRef.current = TrainAnswerWriteQueue.forFocus(
          loaded.sessionId,
          (sessionIndex) => timing.getCumulativeSeconds(sessionIndex),
        );
        bankDifficultyRef.current = loaded.bankDifficulty;
        setSource('api');
        setSessionId(loaded.sessionId);
        setQuestions(loaded.questions);
        setSessionDifficulty(selectedDifficulty);
        setAnswers([]);
        setSessionStartedAtMs(Date.now());
        setSessionKey((k) => k + 1);
        setPhase('play');
        return;
      }

      // English — local only. Never call Focus API.
      const result = await loadFocusQuestions({
        subject,
        topicLabels: selectedTopics,
        difficulties: [selectedDifficulty],
        limit: confirmedCount,
      });
      if (gen !== startGenRef.current) {
        return;
      }
      setSource('local');
      setSessionId(null);
      setQuestions(result.questions);
      setSessionDifficulty(selectedDifficulty);
      setAnswers([]);
      setSessionStartedAtMs(Date.now());
      setSessionKey((k) => k + 1);
      setPhase('play');
    } catch (e) {
      if (gen !== startGenRef.current) {
        return;
      }
      // Remain on setup — Train-style visible prompt (no gameplay, no local Maths).
      // Never pass raw API error text: it can include API URL / env names.
      if (isFocusInsufficientPoolError(e)) {
        setApiError({
          title: 'Not enough questions',
          message: formatFocusInsufficientPoolMessage(e.body),
        });
      } else {
        setApiError(focusStartErrorPrompt());
      }
      setSource('local');
      setSessionId(null);
      setQuestions([]);
      setQuestionCount(null);
      setPhase('setup');
    } finally {
      if (gen === startGenRef.current) {
        setLoading(false);
      }
    }
  };

  const onVisibleQuestionChange = (
    _fromIndex: number | null,
    toIndex: number,
  ) => {
    if (source !== 'api') {
      return;
    }
    timingRef.current?.setVisibleQuestion(toIndex);
  };

  const onAnswerChange = (
    sessionIndex: number,
    letter: OptionLetter,
  ) => {
    if (source !== 'api' || sessionId == null) {
      return;
    }
    const q = questionsRef.current[sessionIndex];
    const options = q?.backendOptions;
    if (!options || !writeQueueRef.current) {
      return;
    }
    void writeQueueRef.current
      .enqueue(sessionIndex, letter, options)
      .catch(() => {
        // Surface on finalize; keep gameplay responsive.
      });
  };

  const onBeforeSeeResults = async (_runAnswers: TrainAnswerRecord[]) => {
    if (source !== 'api' || sessionId == null || !subject) {
      return;
    }
    if (completingRef.current) {
      throw new Error('Focus completion is already in progress.');
    }
    completingRef.current = true;
    try {
      const timing = timingRef.current ?? new FocusQuestionTiming();
      timingRef.current = timing;
      const questionTimes = timing.freezeForCompletion(
        questionsRef.current.length,
      );
      const queue =
        writeQueueRef.current ??
        TrainAnswerWriteQueue.forFocus(sessionId, (i) =>
          timing.getCumulativeSeconds(i),
        );
      writeQueueRef.current = queue;

      // If complete already succeeded but Results fetch failed, only retry Results.
      if (!sessionCompletedOnBackendRef.current) {
        // Drain pending answer writes — do NOT re-enqueue all selections.
        await queue.drain();
        await completeFocus({
          session_id: sessionId,
          question_times: questionTimes,
        });
        sessionCompletedOnBackendRef.current = true;
      }

      const results = await getSessionResults(sessionId);
      if (!('questions' in results) || !Array.isArray(results.questions)) {
        throw new Error('Focus Results response was malformed.');
      }
      const topicLabel =
        selectedTopics.length <= 2
          ? selectedTopics.join(' · ')
          : `${selectedTopics.length} topics`;
      const difficulty = sessionDifficulty
        ? toTrainDifficulty(sessionDifficulty)
        : 'easy';
      const hydrated = hydrateTrainResultFromApi({
        results,
        subject,
        topicSlug: 'focus',
        topicLabel: 'Focus',
        difficulty,
        bankDifficulty: bankDifficultyRef.current,
      });
      setApiResults({
        subject,
        topicSlug: 'focus',
        topicLabel,
        difficulty,
        questionCount: hydrated.totalQuestions,
        title: `Focus Mode · ${subjectTypeLabel}`,
        answers: hydrated.answers,
        questions: hydrated.questions,
        totalQuestions: hydrated.totalQuestions,
        totalCorrect: hydrated.totalCorrect,
        completedAt: Date.now(),
        sessionId: hydrated.sessionId,
        source: 'api',
      });
    } catch (err) {
      completingRef.current = false;
      // Technical detail stays on ApiError for debugging; presentation is mapped
      // in onFinalizeError → FocusApiErrorModal (never throw URL/env text upward).
      void err;
      throw new Error(COPY.finishErrorBody);
    }
  };

  const onFinalizeError = (_err: unknown) => {
    setApiError(focusCompletionErrorPrompt());
  };

  const onSeeResults = (runAnswers: TrainAnswerRecord[]) => {
    setAnswers(runAnswers);
    setPhase('results');
  };

  const onTryAgain = () => {
    returnToSetup();
  };

  const onHome = () => {
    router.replace(Routes.Home as Href);
  };

  const quizTitle = `Focus Mode · ${subjectTypeLabel}`;
  const quizSubtitle = `${selectedTopics.length} topics · ${sessionDifficulty ?? ''}${
    questionCount != null ? ` · ${questionCount}Q` : ''
  }`;

  const resultsSnapshot: TrainResultSnapshot | null =
    phase === 'results'
      ? source === 'api' && apiResults
        ? apiResults
        : subject
          ? buildLocalFocusResultSnapshot({
              subject,
              title: quizTitle,
              answers,
              questions,
              questionCount: questions.length,
            })
          : null
      : null;

  if (!subject) {
    return (
      <View
        style={[
          styles.missingRoot,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          },
        ]}
      >
        <View style={styles.missingCard}>
          <Text style={styles.missingTitle}>{COPY.missingSubjectTitle}</Text>
          <Text style={styles.missingBody}>{COPY.missingSubjectBody}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.goBack}
            onPress={() => {
              if (router.canGoBack()) router.back();
            }}
            style={styles.missingCta}
          >
            <Text style={styles.missingCtaLabel}>{COPY.goBack}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'results' && resultsSnapshot) {
    return (
      <TrainResultsView
        result={resultsSnapshot}
        onTryAgain={onTryAgain}
        onHome={onHome}
      />
    );
  }

  if (phase === 'play') {
    return (
      <>
        <TrainQuizPlayer
          key={sessionKey}
          title={quizTitle}
          subtitle={quizSubtitle}
          questions={questions}
          onExit={returnToSetup}
          onSeeResults={onSeeResults}
          sessionStartedAtMs={sessionStartedAtMs ?? undefined}
          showEndFocus
          deferCorrectness={source === 'api'}
          onAnswerChange={source === 'api' ? onAnswerChange : undefined}
          onBeforeSeeResults={source === 'api' ? onBeforeSeeResults : undefined}
          onFinalizeError={source === 'api' ? onFinalizeError : undefined}
          onVisibleQuestionChange={
            source === 'api' ? onVisibleQuestionChange : undefined
          }
        />
        <FocusApiErrorModal
          error={apiError}
          onDismiss={() => setApiError(null)}
        />
      </>
    );
  }

  return (
    <FocusSetupView
      subject={subject}
      subjectLabel={subjectLabel}
      topics={topics}
      selectedTopics={selectedTopics}
      selectedDifficulty={selectedDifficulty}
      setupResetKey={setupResetKey}
      loading={loading}
      apiError={apiError}
      onDismissApiError={() => setApiError(null)}
      onBack={exitToJourney}
      onToggleTopic={toggleTopic}
      onSelectDifficulty={selectDifficulty}
      onStart={start}
    />
  );
}

function buildLocalFocusResultSnapshot(params: {
  subject: JourneySubject;
  title: string;
  answers: TrainAnswerRecord[];
  questions: TrainQuestionRow[];
  questionCount: number;
}): TrainResultSnapshot {
  const { subject, title, answers, questions, questionCount } = params;
  const totalQuestions = questions.length || answers.length;
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  return {
    subject,
    topicSlug: 'focus',
    topicLabel: 'Focus',
    difficulty: 'easy',
    questionCount,
    title,
    answers,
    questions,
    totalQuestions,
    totalCorrect,
    completedAt: Date.now(),
    source: 'local',
  };
}

const styles = StyleSheet.create({
  missingRoot: {
    flex: 1,
    backgroundColor: FOCUS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingCard: {
    maxWidth: 448,
    width: '100%',
    borderRadius: 24,
    backgroundColor: FOCUS.panel,
    borderWidth: 1,
    borderColor: FOCUS.panelBorder,
    padding: 32,
    alignItems: 'center',
  },
  missingTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  missingBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: FOCUS.intro,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  missingCta: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
  },
  missingCtaLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
