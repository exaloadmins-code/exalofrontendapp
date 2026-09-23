import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrainQuizPlayer } from '@/components/train/TrainQuizPlayer';
import { TrainResultsView } from '@/components/train/TrainResultsView';
import { normalizeJourneySubject, type JourneySubject } from '@/constants/journey';
import {
  TEST,
  TEST_COPY as COPY,
  TEST_DURATION_MS,
} from '@/constants/test';
import {
  loadTestQuestions,
  type OptionLetter,
  type TrainAnswerRecord,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import type { TrainResultSnapshot } from '@/services/trainResults';
import { fonts } from '@/theme';

type TestPhase = 'loading' | 'play' | 'results' | 'error';

/**
 * M7 Test — Lovable `TestMode` + shared `QuizPlayer` parity, plus an intentional
 * Exalo production countdown timer (Lovable has no Test timer).
 *
 * Temporary duration: TEST_DURATION_MINUTES (currently 5). Planned later: 20.
 * Deadline-based session timer; hard expiry → Results with unanswered = 0 score.
 * Back / Results Home → Journey. Try again → same paper + fresh countdown.
 */
export default function TestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);

  const subjectTypeLabel =
    subject === 'english' ? 'English' : subject === 'maths' ? 'Maths' : '';

  const [phase, setPhase] = useState<TestPhase>('loading');
  const [questions, setQuestions] = useState<TrainQuestionRow[]>([]);
  const [expectedTotal, setExpectedTotal] = useState(0);
  const [answers, setAnswers] = useState<TrainAnswerRecord[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [sessionEndsAtMs, setSessionEndsAtMs] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const finalizedRef = useRef(false);

  const exitToJourney = () => {
    if (subject) {
      router.replace(`/journey/${subject}` as Href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const beginTimedSession = useCallback(() => {
    finalizedRef.current = false;
    setAnswers([]);
    setSessionEndsAtMs(Date.now() + TEST_DURATION_MS);
    setSessionKey((k) => k + 1);
    setPhase('play');
  }, []);

  const finalizeAttempt = useCallback(
    (submitted: TrainAnswerRecord[]) => {
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      setAnswers(buildPaperReview(questions, submitted));
      setPhase('results');
    },
    [questions],
  );

  useEffect(() => {
    let cancelled = false;

    if (!subject) {
      setPhase('error');
      setError(COPY.missingSubjectBody);
      return;
    }

    setPhase('loading');
    setError(null);
    setAnswers([]);
    setSessionEndsAtMs(null);
    finalizedRef.current = false;

    loadTestQuestions({ subject })
      .then((result) => {
        if (cancelled) return;
        setQuestions(result.questions);
        setExpectedTotal(result.expectedTotal);
        // Start the clock only after the paper is ready (not during loading).
        finalizedRef.current = false;
        setAnswers([]);
        setSessionEndsAtMs(Date.now() + TEST_DURATION_MS);
        setSessionKey((k) => k + 1);
        setPhase('play');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Failed to load test.';
        setError(message);
        setPhase('error');
      });

    return () => {
      cancelled = true;
    };
  }, [subject]);

  const onSeeResults = (runAnswers: TrainAnswerRecord[]) => {
    finalizeAttempt(runAnswers);
  };

  const onTimeExpired = (runAnswers: TrainAnswerRecord[]) => {
    finalizeAttempt(runAnswers);
  };

  const onTryAgain = () => {
    beginTimedSession();
  };

  const quizTitle = COPY.title(subjectTypeLabel || 'Subject');
  const quizSubtitle = COPY.subtitle(
    questions.length,
    expectedTotal || questions.length,
  );

  const resultsSnapshot: TrainResultSnapshot | null =
    subject && phase === 'results'
      ? buildTestResultSnapshot({
          subject,
          title: quizTitle,
          answers,
          paperSize: questions.length,
        })
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
            {subject ? COPY.errorTitle : COPY.missingSubjectTitle}
          </Text>
          <Text style={styles.errorBody}>
            {error ?? COPY.missingSubjectBody}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.back}
            onPress={exitToJourney}
            style={styles.cta}
          >
            <Text style={styles.ctaLabel}>{COPY.back}</Text>
          </Pressable>
        </View>
      </View>
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
        onHome={exitToJourney}
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
      onTimeExpired={onTimeExpired}
    />
  );
}

/**
 * Expand submitted answers to the full paper: unanswered slots get
 * `chosen: null` / `isCorrect: false` — never a fabricated letter.
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
  paperSize: number;
}): TrainResultSnapshot {
  const { subject, title, answers, paperSize } = params;
  const totalQuestions = paperSize > 0 ? paperSize : answers.length;
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  return {
    subject,
    topicSlug: 'test',
    topicLabel: 'Test',
    difficulty: 'easy',
    title,
    answers,
    questions: [],
    totalQuestions,
    totalCorrect,
    completedAt: Date.now(),
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
