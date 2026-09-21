import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrainResultsView } from '@/components/train/TrainResultsView';
import { normalizeJourneySubject } from '@/constants/journey';
import { Routes } from '@/constants/routes';
import { normalizeTrainDifficulty } from '@/constants/train';
import {
  TRAIN_RESULTS as R,
  TRAIN_RESULTS_COPY as COPY,
} from '@/constants/trainResults';
import { setTrainDifficulty } from '@/services/trainSelection';
import {
  armTrainRetry,
  clearArmedTrainRetry,
  getTrainResult,
} from '@/services/trainResults';
import { fonts } from '@/theme';
/**
 * M5 Train Results — Lovable QuizPlayer finished-state parity on the native
 * `/train/[subject]/[topic]/results` route.
 *
 * Frontend-only: uses `getTrainResult()` in-memory handoff from M4. No API.
 */
export default function TrainResultsScreen() {
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
  const result = getTrainResult();

  const resultMatchesRoute =
    !!result &&
    !!subject &&
    !!topicSlug &&
    result.subject === subject &&
    result.topicSlug === topicSlug;

  const goTrainSelection = () => {
    clearArmedTrainRetry();
    if (subject) {
      setTrainDifficulty(subject, difficulty);
      router.replace(`/train/${subject}` as Href);
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(Routes.Home as Href);
  };

  const onTryAgain = () => {
    if (!subject || !topicSlug || !resultMatchesRoute || !result) {
      goTrainSelection();
      return;
    }
    // Lovable restart() keeps the same question array; arm it for Gameplay remount.
    armTrainRetry(result);
    setTrainDifficulty(subject, result.difficulty);
    router.replace({
      pathname: '/train/[subject]/[topic]',
      params: {
        subject,
        topic: topicSlug,
        difficulty: result.difficulty,
      },
    } as Href);
  };

  const onHome = () => {
    // Lovable Results "Home" calls onExit — TrainGameplay wires that to /train/:subject.
    goTrainSelection();
  };

  if (!resultMatchesRoute || !result || result.answers.length === 0) {
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
          <Text style={styles.missingTitle}>{COPY.missingTitle}</Text>
          <Text style={styles.missingBody}>{COPY.missingBody}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.goBack}
            onPress={goTrainSelection}
            style={styles.missingCta}
          >
            <Text style={styles.missingCtaLabel}>{COPY.goBack}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <TrainResultsView
      result={result}
      onTryAgain={onTryAgain}
      onHome={onHome}
    />
  );
}

const styles = StyleSheet.create({
  missingRoot: {
    flex: 1,
    backgroundColor: R.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingCard: {
    maxWidth: 448,
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(26, 23, 72, 0.8)',
    borderWidth: 1,
    borderColor: R.panelBorder,
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
    color: 'rgba(221, 214, 254, 0.8)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  missingCta: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: R.cta,
  },
  missingCtaLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
