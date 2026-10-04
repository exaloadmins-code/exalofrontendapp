import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrainQuizPlayer } from '@/components/train/TrainQuizPlayer';
import { normalizeJourneySubject } from '@/constants/journey';
import {
  TRAIN_GAMEPLAY as T,
  TRAIN_GAMEPLAY_COPY as COPY,
} from '@/constants/trainGameplay';
import {
  normalizeTrainDifficulty,
  trainTopicLabel,
} from '@/constants/train';
import { completeTrain, getTrainResults } from '@/services/api/trainApi';
import { getTrainSelection } from '@/services/trainSelection';
import {
  loadTrainQuestions,
  type TrainAnswerRecord,
  type TrainBankDifficulty,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import { TrainAnswerWriteQueue } from '@/services/trainQuestions/answerWriteQueue';
import {
  continueMathsTrainSession,
  startMathsTrainSession,
} from '@/services/trainQuestions/loadMathsTrainSession';
import { hydrateTrainResultFromApi } from '@/services/trainQuestions/resultsHydrator';
import { setTrainResult } from '@/services/trainResults';
import { fonts } from '@/theme';

/** Local English Train page size (server Maths page size is fixed at 20). */
const LOCAL_TRAIN_PAGE_SIZE = 20;

/**
 * Train Gameplay — Maths uses continuous backend pages; English stays local.
 */
export default function TrainGameplayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    subject: string;
    topic: string;
    difficulty?: string;
  }>();

  const subject = normalizeJourneySubject(params.subject);
  const topicSlug = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const difficulty = normalizeTrainDifficulty(params.difficulty);
  const snapshot = getTrainSelection();

  const topicLabel =
    (subject && topicSlug ? trainTopicLabel(subject, topicSlug) : undefined) ??
    snapshot?.topicLabel;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<TrainQuestionRow[]>([]);
  const [bankDifficultyLabel, setBankDifficultyLabel] = useState('Easy');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [hasMore, setHasMore] = useState(false);
  const writeQueueRef = useRef<TrainAnswerWriteQueue | null>(null);
  const bankDifficultyRef = useRef<TrainBankDifficulty>('Easy');
  const continueInFlightRef = useRef(false);
  const questionsRef = useRef<TrainQuestionRow[]>([]);
  questionsRef.current = questions;

  useEffect(() => {
    let cancelled = false;

    if (!subject || !topicSlug) {
      setError('Missing subject or topic for Train gameplay.');
      setLoading(false);
      return;
    }

    if (!topicLabel) {
      setError(`Unknown topic slug "${topicSlug}" for ${subject}.`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    writeQueueRef.current = null;
    continueInFlightRef.current = false;

    const run = async () => {
      if (subject !== 'maths') {
        const result = await loadTrainQuestions({
          subject,
          topicSlug,
          difficulty,
          limit: LOCAL_TRAIN_PAGE_SIZE,
        });
        if (cancelled) return;
        setSource('local');
        setSessionId(null);
        setHasMore(false);
        setQuestions(result.questions);
        setBankDifficultyLabel(result.bankDifficulty);
        bankDifficultyRef.current = result.bankDifficulty;
        setLoading(false);
        return;
      }

      // Maths API path — never fall back to local bank.
      const loaded = await startMathsTrainSession({
        subject,
        topicSlug,
        difficulty,
      });

      if (cancelled) return;
      setSource('api');
      setSessionId(loaded.sessionId);
      writeQueueRef.current = new TrainAnswerWriteQueue(loaded.sessionId);
      setQuestions(loaded.questions);
      setHasMore(loaded.hasMore);
      setBankDifficultyLabel(loaded.bankDifficulty);
      bankDifficultyRef.current = loaded.bankDifficulty;
      setLoading(false);
    };

    run().catch((err: unknown) => {
      if (cancelled) return;
      const message =
        err instanceof Error ? err.message : 'Failed to load questions.';
      setError(message);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [subject, topicSlug, topicLabel, difficulty]);

  const exitToSelection = () => {
    if (subject) {
      router.replace(`/train/${subject}` as Href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const onAnswerChange = (
    sessionIndex: number,
    letter: import('@/services/trainQuestions').OptionLetter,
  ) => {
    if (source !== 'api' || sessionId == null) {
      return;
    }
    const q = questions[sessionIndex];
    const options = q?.backendOptions;
    if (!options || !writeQueueRef.current) {
      return;
    }
    void writeQueueRef.current.enqueue(sessionIndex, letter, options).catch(() => {
      // Error surfaces when finishing if still failing; keep gameplay responsive.
    });
  };

  const onPageContinue = async () => {
    if (
      source !== 'api' ||
      sessionId == null ||
      !subject ||
      !topicSlug ||
      continueInFlightRef.current
    ) {
      throw new Error('Cannot continue this Train session.');
    }
    continueInFlightRef.current = true;
    try {
      const queue = writeQueueRef.current ?? new TrainAnswerWriteQueue(sessionId);
      writeQueueRef.current = queue;
      await queue.drain();
      const prior = questionsRef.current;
      const priorLength = prior.length;
      const cont = await continueMathsTrainSession({
        sessionId,
        subject,
        topicSlug,
        difficulty,
      });
      const existingIds = new Set(prior.map((q) => q.Question_ID));
      for (const row of cont.questions) {
        if (existingIds.has(row.Question_ID)) {
          throw new Error('Continue returned a duplicate question id.');
        }
      }
      setQuestions((prev) => [...prev, ...cont.questions]);
      setHasMore(cont.hasMore);
      return { nextIndex: priorLength };
    } finally {
      continueInFlightRef.current = false;
    }
  };

  const onBeforeSeeResults = async (_answers: TrainAnswerRecord[]) => {
    if (source !== 'api' || sessionId == null) {
      return;
    }
    const queue = writeQueueRef.current ?? new TrainAnswerWriteQueue(sessionId);
    writeQueueRef.current = queue;
    // Selections are enqueued synchronously in onAnswerChange. Drain those
    // writes before complete — do not re-POST every chosen answer.
    await queue.drain();
    await completeTrain({ session_id: sessionId });
    const results = await getTrainResults(sessionId);
    if (!subject || !topicSlug || !topicLabel) {
      return;
    }
    const hydrated = hydrateTrainResultFromApi({
      results,
      subject,
      topicSlug,
      topicLabel,
      difficulty,
      bankDifficulty: bankDifficultyRef.current,
    });
    setTrainResult({
      subject,
      topicSlug,
      topicLabel,
      difficulty,
      title: `Train Mode · ${topicLabel}`,
      answers: hydrated.answers,
      questions: hydrated.questions,
      totalQuestions: hydrated.totalQuestions,
      totalCorrect: hydrated.totalCorrect,
      sessionId: hydrated.sessionId,
      source: 'api',
    });
  };

  const onSeeResults = (answers: TrainAnswerRecord[]) => {
    if (!subject || !topicSlug || !topicLabel) {
      return;
    }
    // Maths API: setTrainResult already called in onBeforeSeeResults.
    if (source !== 'api') {
      setTrainResult({
        subject,
        topicSlug,
        topicLabel,
        difficulty,
        title: `Train Mode · ${topicLabel}`,
        answers,
        questions,
        totalQuestions: questions.length,
        source: 'local',
      });
    }
    router.push({
      pathname: '/train/[subject]/[topic]/results',
      params: {
        subject,
        topic: topicSlug,
        difficulty,
      },
    } as Href);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.centerRoot,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator color="rgba(221, 214, 254, 0.9)" />
        <Text style={styles.loadingText}>{COPY.loading}</Text>
      </View>
    );
  }

  if (error) {
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
          <Text style={styles.errorTitle}>{COPY.errorTitle}</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.back}
            onPress={exitToSelection}
            style={styles.cta}
          >
            <Text style={styles.ctaLabel}>{COPY.back}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <TrainQuizPlayer
      title={`Train Mode · ${topicLabel}`}
      subtitle={`Difficulty: ${bankDifficultyLabel}`}
      questions={questions}
      onExit={exitToSelection}
      onSeeResults={onSeeResults}
      deferCorrectness={source === 'api'}
      onAnswerChange={source === 'api' ? onAnswerChange : undefined}
      onBeforeSeeResults={source === 'api' ? onBeforeSeeResults : undefined}
      continuousTrain={source === 'api'}
      hasMore={source === 'api' ? hasMore : false}
      onPageContinue={source === 'api' ? onPageContinue : undefined}
      absoluteQuestionLabel={source === 'api'}
    />
  );
}

const styles = StyleSheet.create({
  centerRoot: {
    flex: 1,
    backgroundColor: T.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(221, 214, 254, 0.9)',
  },
  errorCard: {
    maxWidth: T.emptyMaxWidth,
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(26, 23, 72, 0.8)',
    borderWidth: 1,
    borderColor: T.errorBorder,
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
    color: T.errorText,
    marginBottom: 24,
    textAlign: 'center',
  },
  cta: {
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
});
