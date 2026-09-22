import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FocusSetupView } from '@/components/focus';
import { TrainQuizPlayer } from '@/components/train/TrainQuizPlayer';
import { TrainResultsView } from '@/components/train/TrainResultsView';
import {
  FOCUS,
  FOCUS_COPY as COPY,
  type FocusDifficulty,
} from '@/constants/focus';
import {
  journeySubjectLabel,
  normalizeJourneySubject,
  type JourneySubject,
} from '@/constants/journey';
import { trainTopicsFor } from '@/constants/train';
import {
  loadFocusQuestions,
  type TrainAnswerRecord,
  type TrainQuestionRow,
} from '@/services/trainQuestions';
import type { TrainResultSnapshot } from '@/services/trainResults';
import { fonts } from '@/theme';

type FocusPhase = 'setup' | 'play' | 'results';

/**
 * M6 Focus — setup + shared QuizPlayer / Results.
 *
 * Difficulty selection is Exalo explicit opt-in (none selected by default;
 * Start requires ≥1 topic and ≥1 difficulty). Intentional departure from
 * Lovable's default-all / zero-means-all behaviour.
 *
 * Session state is in-memory only; Home on results returns to Focus setup.
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
  /** Explicit opt-in — empty until the learner selects one or more tiers. */
  const [selectedDiffs, setSelectedDiffs] = useState<FocusDifficulty[]>([]);
  /** Difficulties locked for the active play/results session (from Start). */
  const [sessionDiffs, setSessionDiffs] = useState<FocusDifficulty[]>([]);
  const [phase, setPhase] = useState<FocusPhase>('setup');
  const [questions, setQuestions] = useState<TrainQuestionRow[]>([]);
  const [answers, setAnswers] = useState<TrainAnswerRecord[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setPhase('setup');
    setQuestions([]);
    setAnswers([]);
    setError(null);
  };

  const toggleTopic = (label: string) => {
    setSelectedTopics((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const toggleAllTopics = () => {
    setSelectedTopics((prev) =>
      prev.length === topics.length ? [] : topics.map((t) => t.label),
    );
  };

  const toggleDiff = (d: FocusDifficulty) => {
    setSelectedDiffs((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const start = async () => {
    if (
      !subject ||
      selectedTopics.length === 0 ||
      selectedDiffs.length === 0
    ) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await loadFocusQuestions({
        subject,
        topicLabels: selectedTopics,
        difficulties: selectedDiffs,
      });
      setQuestions(result.questions);
      setSessionDiffs(result.effectiveDifficulties);
      setAnswers([]);
      setSessionKey((k) => k + 1);
      setPhase('play');
    } catch (e) {
      const err = e as Error;
      setError(err.message ?? 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const onSeeResults = (runAnswers: TrainAnswerRecord[]) => {
    setAnswers(runAnswers);
    setPhase('results');
  };

  const onTryAgain = () => {
    setAnswers([]);
    setSessionKey((k) => k + 1);
    setPhase('play');
  };

  const quizTitle = `Focus Mode · ${subjectTypeLabel}`;
  const quizSubtitle = `${selectedTopics.length} topics · ${sessionDiffs.join(', ')}`;

  const resultsSnapshot: TrainResultSnapshot | null =
    subject && phase === 'results'
      ? buildFocusResultSnapshot({
          subject,
          title: quizTitle,
          answers,
          questions,
        })
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
        onHome={returnToSetup}
      />
    );
  }

  if (phase === 'play') {
    return (
      <TrainQuizPlayer
        key={sessionKey}
        title={quizTitle}
        subtitle={quizSubtitle}
        questions={questions}
        onExit={returnToSetup}
        onSeeResults={onSeeResults}
      />
    );
  }

  return (
    <FocusSetupView
      subjectLabel={subjectLabel}
      topics={topics}
      selectedTopics={selectedTopics}
      selectedDiffs={selectedDiffs}
      loading={loading}
      error={error}
      onBack={exitToJourney}
      onToggleTopic={toggleTopic}
      onToggleAllTopics={toggleAllTopics}
      onToggleDiff={toggleDiff}
      onStart={start}
    />
  );
}

function buildFocusResultSnapshot(params: {
  subject: JourneySubject;
  title: string;
  answers: TrainAnswerRecord[];
  questions: TrainQuestionRow[];
}): TrainResultSnapshot {
  const { subject, title, answers, questions } = params;
  const totalQuestions = answers.length;
  const totalCorrect = answers.filter((a) => a.isCorrect).length;
  return {
    subject,
    topicSlug: 'focus',
    topicLabel: 'Focus',
    difficulty: 'easy',
    title,
    answers,
    questions,
    totalQuestions,
    totalCorrect,
    completedAt: Date.now(),
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
