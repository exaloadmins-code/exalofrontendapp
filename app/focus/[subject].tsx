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
 * Setup: multi-topic (≥2) + exactly one difficulty (Train-like exclusive select).
 * Intentional Exalo departure from Lovable default-all / multi-difficulty Focus.
 *
 * M9A: in-memory Focus elapsed timer via `sessionStartedAtMs` (count-up).
 * No AsyncStorage / resumability. Session state remains in-memory only;
 * Home on results returns to Focus setup.
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
  /** Exactly one difficulty — null until the learner picks Easy/Medium/Hard. */
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<FocusDifficulty | null>(null);
  /** Difficulty locked for the active play/results session (from Start). */
  const [sessionDifficulty, setSessionDifficulty] =
    useState<FocusDifficulty | null>(null);
  const [phase, setPhase] = useState<FocusPhase>('setup');
  const [questions, setQuestions] = useState<TrainQuestionRow[]>([]);
  const [answers, setAnswers] = useState<TrainAnswerRecord[]>([]);
  const [sessionKey, setSessionKey] = useState(0);
  /** Wall-clock start for Focus elapsed timer (M9A). In-memory only — no persistence. */
  const [sessionStartedAtMs, setSessionStartedAtMs] = useState<number | null>(null);
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
    setSessionStartedAtMs(null);
    setError(null);
  };

  const toggleTopic = (label: string) => {
    setSelectedTopics((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const selectDifficulty = (d: FocusDifficulty) => {
    setSelectedDifficulty(d);
  };

  const start = async () => {
    if (
      loading ||
      !subject ||
      selectedTopics.length < 2 ||
      selectedDifficulty == null
    ) {
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await loadFocusQuestions({
        subject,
        topicLabels: selectedTopics,
        difficulties: [selectedDifficulty],
      });
      setQuestions(result.questions);
      setSessionDifficulty(selectedDifficulty);
      setAnswers([]);
      setSessionStartedAtMs(Date.now());
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
    setSessionStartedAtMs(Date.now());
    setSessionKey((k) => k + 1);
    setPhase('play');
  };

  const quizTitle = `Focus Mode · ${subjectTypeLabel}`;
  const quizSubtitle = `${selectedTopics.length} topics · ${sessionDifficulty ?? ''}`;

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
        sessionStartedAtMs={sessionStartedAtMs ?? undefined}
      />
    );
  }

  return (
    <FocusSetupView
      subject={subject}
      subjectLabel={subjectLabel}
      topics={topics}
      selectedTopics={selectedTopics}
      selectedDifficulty={selectedDifficulty}
      loading={loading}
      error={error}
      onBack={exitToJourney}
      onToggleTopic={toggleTopic}
      onSelectDifficulty={selectDifficulty}
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
