import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TestInstructionsView } from '@/components/test';
import { TrainQuizPlayer } from '@/components/train/TrainQuizPlayer';
import { TrainResultsView } from '@/components/train/TrainResultsView';
import { normalizeJourneySubject, type JourneySubject } from '@/constants/journey';
import { Routes } from '@/constants/routes';
import {
  TEST,
  TEST_COPY as COPY,
  TEST_DURATION_MS,
} from '@/constants/test';
import { getSessionResults } from '@/services/api/sessionApi';
import {
  submitTest,
  usesMathsTestApi,
  type TestResultsResponse,
} from '@/services/api/testApi';
import {
  TestFlagWriteQueue,
  TrainAnswerWriteQueue,
  hydrateTrainResultFromApi,
  loadTestQuestions,
  startMathsTestSession,
  testResultsToShared,
  type OptionLetter,
  type TrainAnswerRecord,
  type TrainBankDifficulty,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import type { TrainResultSnapshot } from '@/services/trainResults';
import { fonts } from '@/theme';

type TestPhase = 'instructions' | 'loading' | 'play' | 'results' | 'error';

/**
 * B3.3 Test — Maths is API-backed; English remains local.
 *
 * Maths: POST /test/start → GET /sessions/.../questions → answer queue →
 *        POST /test/submit → GET /sessions/.../results → shared Results UI.
 * English: loadTestQuestions (local) + local timer/snapshot — unchanged.
 *
 * Lifecycle:
 *   instructions → (Start Test) → loading → play → results
 *
 * Try Again returns to instructions (fresh session; never resumes completed).
 */
export default function TestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);

  const subjectTypeLabel =
    subject === 'english' ? 'English' : subject === 'maths' ? 'Maths' : '';

  const [phase, setPhase] = useState<TestPhase>(() =>
    subject ? 'instructions' : 'error',
  );
  const [questions, setQuestions] = useState<TrainQuestionRow[]>([]);
  const [expectedTotal, setExpectedTotal] = useState(0);
  const [answers, setAnswers] = useState<TrainAnswerRecord[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [sessionEndsAtMs, setSessionEndsAtMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(() =>
    subject ? null : COPY.missingSubjectBody,
  );
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [apiResults, setApiResults] = useState<TrainResultSnapshot | null>(
    null,
  );
  const [initialAnswers, setInitialAnswers] = useState<
    (TrainAnswerRecord | null)[] | undefined
  >(undefined);
  const [initialFlags, setInitialFlags] = useState<boolean[] | undefined>(
    undefined,
  );

  const finalizedRef = useRef(false);
  /** Prevents double Start Test from overlapping paper loads. */
  const startingRef = useRef(false);
  /** Invalidates in-flight Start loads when returning to instructions. */
  const startGenerationRef = useRef(0);
  const writeQueueRef = useRef<TrainAnswerWriteQueue | null>(null);
  const flagQueueRef = useRef<TestFlagWriteQueue | null>(null);
  const completingRef = useRef(false);
  /** True after POST /test/submit succeeded — Results retry must not re-submit. */
  const sessionSubmittedOnBackendRef = useRef(false);
  const bankDifficultyRef = useRef<TrainBankDifficulty>('Medium');
  const questionsRef = useRef<TrainQuestionRow[]>([]);
  questionsRef.current = questions;

  const exitToJourney = () => {
    if (subject) {
      router.replace(`/journey/${subject}` as Href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const resetToInstructions = useCallback(() => {
    startGenerationRef.current += 1;
    startingRef.current = false;
    finalizedRef.current = false;
    completingRef.current = false;
    sessionSubmittedOnBackendRef.current = false;
    writeQueueRef.current = null;
    flagQueueRef.current = null;
    setQuestions([]);
    setExpectedTotal(0);
    setAnswers([]);
    setSessionEndsAtMs(null);
    setSessionId(null);
    setSource('local');
    setApiResults(null);
    setInitialAnswers(undefined);
    setInitialFlags(undefined);
    setError(null);
    setPhase('instructions');
  }, []);

  /** Route entry / subject change → instructions only (no paper, no timer). */
  useEffect(() => {
    if (!subject) {
      startGenerationRef.current += 1;
      startingRef.current = false;
      finalizedRef.current = false;
      setPhase('error');
      setError(COPY.missingSubjectBody);
      setQuestions([]);
      setAnswers([]);
      setSessionEndsAtMs(null);
      setSessionId(null);
      setSource('local');
      setApiResults(null);
      return;
    }
    resetToInstructions();
  }, [subject, resetToInstructions]);

  const finalizeLocalAttempt = useCallback(
    (submitted: TrainAnswerRecord[]) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      setAnswers(buildPaperReview(questions, submitted));
      setPhase('results');
    },
    [questions],
  );

  const startTest = () => {
    if (!subject || startingRef.current) {
      return;
    }
    startingRef.current = true;
    const generation = startGenerationRef.current + 1;
    startGenerationRef.current = generation;
    finalizedRef.current = false;
    completingRef.current = false;
    sessionSubmittedOnBackendRef.current = false;
    writeQueueRef.current = null;
    flagQueueRef.current = null;
    setPhase('loading');
    setError(null);
    setAnswers([]);
    setSessionEndsAtMs(null);
    setApiResults(null);
    setInitialAnswers(undefined);
    setInitialFlags(undefined);

    if (usesMathsTestApi(subject)) {
      // Maths API — never use local Maths Test bank once API session starts.
      startMathsTestSession({ subject })
        .then((loaded) => {
          if (generation !== startGenerationRef.current) {
            return;
          }
          writeQueueRef.current = TrainAnswerWriteQueue.forTest(loaded.sessionId);
          flagQueueRef.current = new TestFlagWriteQueue(loaded.sessionId);
          bankDifficultyRef.current = loaded.bankDifficulty;
          setSource('api');
          setSessionId(loaded.sessionId);
          setQuestions(loaded.questions);
          setExpectedTotal(loaded.totalQuestions);
          setInitialAnswers(loaded.initialAnswers);
          setInitialFlags(loaded.initialFlags);
          finalizedRef.current = false;
          setAnswers([]);
          setSessionEndsAtMs(loaded.expiresAtMs);
          setSessionKey((k) => k + 1);
          setPhase('play');
          startingRef.current = false;
        })
        .catch((err: unknown) => {
          if (generation !== startGenerationRef.current) {
            return;
          }
          startingRef.current = false;
          void err;
          setError(COPY.startErrorBody);
          setSessionEndsAtMs(null);
          setSessionId(null);
          setSource('local');
          setPhase('error');
        });
      return;
    }

    // English — local only. Never call Test API.
    loadTestQuestions({ subject })
      .then((result) => {
        if (generation !== startGenerationRef.current) {
          return;
        }
        setSource('local');
        setSessionId(null);
        setQuestions(result.questions);
        setExpectedTotal(result.expectedTotal);
        finalizedRef.current = false;
        setAnswers([]);
        setSessionEndsAtMs(Date.now() + TEST_DURATION_MS);
        setSessionKey((k) => k + 1);
        setPhase('play');
        startingRef.current = false;
      })
      .catch((err: unknown) => {
        if (generation !== startGenerationRef.current) {
          return;
        }
        startingRef.current = false;
        const message =
          err instanceof Error ? err.message : 'Failed to load test.';
        setError(message);
        setSessionEndsAtMs(null);
        setPhase('error');
      });
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

  const onFlagChange = (sessionIndex: number, flagged: boolean) => {
    if (source !== 'api' || sessionId == null) {
      return;
    }
    const queue =
      flagQueueRef.current ?? new TestFlagWriteQueue(sessionId);
    flagQueueRef.current = queue;
    void queue.enqueue(sessionIndex, flagged).catch(() => {
      // Surface on finalize; keep gameplay responsive.
    });
  };

  const onBeforeSeeResults = async (_runAnswers: TrainAnswerRecord[]) => {
    if (source !== 'api' || sessionId == null || !subject) {
      return;
    }
    if (completingRef.current) {
      throw new Error(COPY.finishErrorBody);
    }
    completingRef.current = true;
    try {
      const queue =
        writeQueueRef.current ?? TrainAnswerWriteQueue.forTest(sessionId);
      writeQueueRef.current = queue;
      const flagQueue =
        flagQueueRef.current ?? new TestFlagWriteQueue(sessionId);
      flagQueueRef.current = flagQueue;

      if (!sessionSubmittedOnBackendRef.current) {
        await queue.drain();
        await flagQueue.drain();
        await submitTest({ session_id: sessionId });
        sessionSubmittedOnBackendRef.current = true;
      }

      // Test DTO uses incorrect_count / score_percentage — narrow then adapt.
      const rawResults: unknown = await getSessionResults(sessionId);
      if (!isTestResultsPayload(rawResults)) {
        throw new Error('Test Results response was malformed.');
      }
      const shared = testResultsToShared(rawResults);
      const hydrated = hydrateTrainResultFromApi({
        results: shared,
        subject,
        topicSlug: 'test',
        topicLabel: 'Test',
        difficulty: 'medium',
        bankDifficulty: bankDifficultyRef.current,
      });
      setApiResults({
        subject,
        topicSlug: 'test',
        topicLabel: 'Test',
        difficulty: 'medium',
        questionCount: hydrated.totalQuestions,
        title: COPY.title(subjectTypeLabel),
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
      void err;
      throw new Error(COPY.finishErrorBody);
    }
  };

  const onSeeResults = (runAnswers: TrainAnswerRecord[]) => {
    if (source === 'api') {
      setAnswers(runAnswers);
      setPhase('results');
      return;
    }
    finalizeLocalAttempt(runAnswers);
  };

  const onTimeExpired = (runAnswers: TrainAnswerRecord[]) => {
    // Local English only — Maths API expiry uses onBeforeSeeResults via QuizPlayer.
    finalizeLocalAttempt(runAnswers);
  };

  const onTryAgain = () => {
    // Same subject → Instructions. Do NOT resume completed backend session.
    if (!subject) {
      router.replace(Routes.Home as Href);
      return;
    }
    resetToInstructions();
  };

  const onHome = () => {
    router.replace(Routes.Home as Href);
  };

  const quizTitle = COPY.title(subjectTypeLabel || 'Subject');
  const quizSubtitle = COPY.subtitle(
    questions.length,
    expectedTotal || questions.length,
  );

  const resultsSnapshot: TrainResultSnapshot | null =
    phase === 'results'
      ? source === 'api' && apiResults
        ? apiResults
        : subject
          ? buildTestResultSnapshot({
              subject,
              title: quizTitle,
              answers,
              questions,
              paperSize: questions.length,
            })
          : null
      : null;

  if (!subject || phase === 'error') {
    return (
      <View
        style={[
          styles.centerRoot,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
          },
        ]}
      >
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>
            {subject
              ? error === COPY.finishErrorBody
                ? COPY.finishErrorTitle
                : error === COPY.startErrorBody
                  ? COPY.startErrorTitle
                  : COPY.errorTitle
              : COPY.missingSubjectTitle}
          </Text>
          <Text style={styles.errorBody}>
            {error ?? COPY.missingSubjectBody}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.back}
            onPress={
              subject
                ? () => {
                    resetToInstructions();
                  }
                : exitToJourney
            }
            style={styles.cta}
          >
            <Text style={styles.ctaLabel}>
              {subject ? COPY.goBack : COPY.back}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (phase === 'instructions') {
    return (
      <TestInstructionsView
        subject={subject}
        subjectLabel={subjectTypeLabel}
        starting={false}
        onBack={exitToJourney}
        onStart={startTest}
      />
    );
  }

  if (phase === 'loading') {
    return (
      <View
        style={[
          styles.centerRoot,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator color={TEST.loadingText} />
        <Text style={styles.loadingText}>
          {COPY.loading(subjectTypeLabel)}
        </Text>
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

  return (
    <TrainQuizPlayer
      key={sessionKey}
      title={quizTitle}
      subtitle={quizSubtitle}
      questions={questions}
      onExit={exitToJourney}
      onSeeResults={onSeeResults}
      sessionEndsAtMs={sessionEndsAtMs ?? undefined}
      onTimeExpired={source === 'local' ? onTimeExpired : undefined}
      deferCorrectness={source === 'api'}
      onAnswerChange={source === 'api' ? onAnswerChange : undefined}
      onBeforeSeeResults={source === 'api' ? onBeforeSeeResults : undefined}
      initialAnswers={source === 'api' ? initialAnswers : undefined}
      initialFlags={source === 'api' ? initialFlags : undefined}
      allowUnansweredNavigation
      showQuestionNavigator
      allowFlagging
      requireFinishReview
      onFlagChange={source === 'api' ? onFlagChange : undefined}
    />
  );
}

function isTestResultsPayload(
  value: unknown,
): value is TestResultsResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.session_id === 'number' &&
    typeof record.incorrect_count === 'number' &&
    typeof record.score_percentage === 'number' &&
    Array.isArray(record.questions)
  );
}

/**
 * Expand submitted answers to the full paper: unanswered slots get
 * `chosen: null` / `isCorrect: false` — never a fabricated letter.
 * English local Results only.
 */
function buildPaperReview(
  questions: TrainQuestionRow[],
  submitted: TrainAnswerRecord[],
): TrainAnswerRecord[] {
  const byQid = new Map(submitted.map((a) => [a.qid, a]));
  return questions.map((q) => {
    const existing = byQid.get(q.Question_ID);
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

function buildTestResultSnapshot(params: {
  subject: JourneySubject;
  title: string;
  answers: TrainAnswerRecord[];
  questions: TrainQuestionRow[];
  paperSize: number;
}): TrainResultSnapshot {
  const { subject, title, answers, questions, paperSize } = params;
  const totalQuestions = paperSize > 0 ? paperSize : answers.length;
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  return {
    subject,
    topicSlug: 'test',
    topicLabel: 'Test',
    difficulty: 'easy',
    title,
    answers,
    /** Retain paper questions for index-safe Results review (stem/options/explanation). */
    questions,
    totalQuestions,
    totalCorrect,
    completedAt: Date.now(),
    source: 'local',
  };
}

const styles = StyleSheet.create({
  centerRoot: {
    flex: 1,
    backgroundColor: TEST.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '500',
    color: TEST.loadingText,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorCard: {
    maxWidth: TEST.emptyMaxWidth,
    width: '100%',
    borderRadius: 24,
    backgroundColor: TEST.panel,
    borderWidth: 1,
    borderColor: TEST.errorBorder,
    padding: 32,
    alignItems: 'center',
  },
  errorTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorBody: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: TEST.errorText,
    marginBottom: 24,
    textAlign: 'center',
  },
  cta: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: TEST.cta,
  },
  ctaLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
