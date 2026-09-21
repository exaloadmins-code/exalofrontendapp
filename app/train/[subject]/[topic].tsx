import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { normalizeJourneySubject, journeySubjectLabel } from '@/constants/journey';
import { Routes } from '@/constants/routes';
import {
  normalizeTrainDifficulty,
  trainTopicLabel,
} from '@/constants/train';
import { getTrainSelection } from '@/services/trainSelection';
import { useDeviceLayout } from '@/responsive';
import { colors, fonts, spacing } from '@/theme';

/**
 * M3 milestone boundary — Lovable would open TrainGameplay here
 * (`/train/:subject/:topic?difficulty=`). Gameplay is out of scope for M3.
 *
 * No `/train/start`, no fake session IDs, no question bank.
 */
export default function TrainGameplayBoundaryScreen() {
  const router = useRouter();
  const layout = useDeviceLayout();
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
    snapshot?.topicLabel ??
    topicSlug ??
    'Topic';

  const subjectLabel = subject ? journeySubjectLabel(subject) : 'Subject';

  const goBackToSelection = () => {
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
          paddingTop: layout.safeAreaInsets.top + spacing.lg,
          paddingBottom: layout.safeAreaInsets.bottom + spacing.lg,
          paddingHorizontal: spacing.lg,
        },
      ]}
    >
      <Text style={styles.brand}>EXALO</Text>
      <Text style={styles.title}>Train gameplay next</Text>
      <Text style={styles.body}>
        M3 Train Selection is complete. You chose {subjectLabel} · {topicLabel} ·{' '}
        {difficulty.toUpperCase()}. Gameplay (M4) is not implemented yet — no
        questions were loaded and no training session was started.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to Train selection"
        onPress={goBackToSelection}
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
    backgroundColor: colors.backgroundDeep,
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
    backgroundColor: colors.purple,
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
