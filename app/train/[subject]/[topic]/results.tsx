import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { normalizeJourneySubject, journeySubjectLabel } from '@/constants/journey';
import { Routes } from '@/constants/routes';
import {
  normalizeTrainDifficulty,
  trainTopicLabel,
} from '@/constants/train';
import { TRAIN_GAMEPLAY as T } from '@/constants/trainGameplay';
import { getTrainResult } from '@/services/trainResults';
import { useDeviceLayout } from '@/responsive';
import { colors, fonts, spacing } from '@/theme';

/**
 * M4 → M5 boundary placeholder.
 *
 * Lovable embeds a full Results UI inside QuizPlayer when finished.
 * M5 owns Results — this screen only proves the handoff and preserves local
 * answer data via `getTrainResult()`. Do not expand into full M5 here.
 */
export default function TrainResultsBoundaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const layout = useDeviceLayout();
  const params = useLocalSearchParams<{
    subject: string;
    topic: string;
    difficulty?: string;
  }>();

  const subject = normalizeJourneySubject(params.subject);
  const topicSlug = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const difficulty = normalizeTrainDifficulty(params.difficulty);
  const result = getTrainResult();

  const topicLabel =
    result?.topicLabel ??
    (subject && topicSlug ? trainTopicLabel(subject, topicSlug) : undefined) ??
    topicSlug ??
    'Topic';
  const subjectLabel = subject ? journeySubjectLabel(subject) : 'Subject';
  const totalCorrect = result?.totalCorrect ?? 0;
  const totalQuestions = result?.totalQuestions ?? 0;

  const backToSelection = () => {
    if (subject) {
      router.replace(`/train/${subject}` as Href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.Home as Href);
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: Math.max(insets.top, layout.safeAreaInsets.top) + spacing.lg,
          paddingBottom: Math.max(insets.bottom, layout.safeAreaInsets.bottom) + spacing.lg,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <Text style={styles.brand}>EXALO</Text>
      <Text style={styles.title}>Train results next</Text>
      <Text style={styles.body}>
        M4 Train Gameplay is complete. You finished {subjectLabel} · {topicLabel} ·{' '}
        {difficulty.toUpperCase()}
        {totalQuestions > 0
          ? ` — ${totalCorrect} / ${totalQuestions} correct locally.`
          : '.'}{' '}
        Results (M5) is not implemented yet. Answer data is held in temporary
        frontend memory only — no backend session was created.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Train selection"
        onPress={backToSelection}
        style={styles.button}
      >
        <Text style={styles.buttonLabel}>Back to Train selection</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.background,
    justifyContent: 'center',
    gap: spacing.md,
  },
  brand: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 28,
    color: colors.orange,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 24,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fonts.display,
    fontWeight: '500',
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    maxWidth: 420,
  },
  button: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: T.cta,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 16,
  },
  buttonLabel: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 16,
    color: colors.white,
  },
});
