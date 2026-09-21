import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { getTrainSelection } from '@/services/trainSelection';
import {
  loadTrainQuestions,
  type TrainAnswerRecord,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import {
  consumeArmedTrainRetry,
  setTrainResult,
} from '@/services/trainResults';
import { fonts } from '@/theme';

/**
 * M4 Train Gameplay — Lovable `TrainGameplay` + `QuizPlayer` parity.
 * Local questions only via `loadTrainQuestions`. No `/train/start`. No diagrams.
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

    const armed = consumeArmedTrainRetry(subject, topicSlug, difficulty);
    if (armed && armed.length > 0) {
      setQuestions(armed);
      setBankDifficultyLabel(
        difficulty === 'hard' ? 'Hard' : difficulty === 'medium' ? 'Medium' : 'Easy',
      );
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    loadTrainQuestions({
      subject,
      topicSlug,
      difficulty,
      limit: 20,
    })
      .then((result) => {
        if (cancelled) return;
        setQuestions(result.questions);
        setBankDifficultyLabel(result.bankDifficulty);
        setLoading(false);
      })
      .catch((err: unknown) => {
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

  const onSeeResults = (answers: TrainAnswerRecord[]) => {
    if (!subject || !topicSlug || !topicLabel) {
      return;
    }
    setTrainResult({
      subject,
      topicSlug,
      topicLabel,
      difficulty,
      title: `Train Mode · ${topicLabel}`,
      answers,
      questions,
    });
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
