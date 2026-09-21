import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Home, RotateCcw, X } from 'lucide-react-native';
import {
  TRAIN_RESULTS as R,
  TRAIN_RESULTS_COPY as COPY,
} from '@/constants/trainResults';
import {
  trainResultPercent,
  type TrainResultSnapshot,
} from '@/services/trainResults';
import { fonts } from '@/theme';

export type TrainResultsViewProps = {
  result: TrainResultSnapshot;
  onTryAgain: () => void;
  onHome: () => void;
};

/**
 * Lovable QuizPlayer finished-state Results UI (composable).
 * Review lists every answered question with letter-only chosen/correct — no stems,
 * options, explanations, or diagrams (live Lovable parity).
 */
export function TrainResultsView({
  result,
  onTryAgain,
  onHome,
}: TrainResultsViewProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth - 48, R.contentMaxWidth);
  const pct = trainResultPercent(result);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: Math.max(24, (windowWidth - contentWidth) / 2),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={{ width: contentWidth, alignSelf: 'center' }}>
          <Text style={styles.title}>
            {result.title} {COPY.titleSuffix}
          </Text>
          <Text style={styles.score}>
            {COPY.scoreLine(result.totalCorrect, result.totalQuestions, pct)}
          </Text>

          <View style={styles.reviewList}>
            {result.answers.map((a, i) => (
              <View
                key={`${a.qid}-${i}`}
                style={[
                  styles.row,
                  a.isCorrect ? styles.rowCorrect : styles.rowWrong,
                ]}
              >
                {a.isCorrect ? (
                  <Check size={16} color="#6EE7B7" strokeWidth={2.25} />
                ) : (
                  <X size={16} color="#FDA4AF" strokeWidth={2.25} />
                )}
                <Text style={styles.rowText}>
                  {COPY.reviewLine(i + 1, a.chosen, a.correct)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={COPY.tryAgain}
              onPress={onTryAgain}
              style={[styles.actionBtn, styles.tryAgainBtn]}
            >
              <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.25} />
              <Text style={styles.actionLabel}>{COPY.tryAgain}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={COPY.home}
              onPress={onHome}
              style={[styles.actionBtn, styles.homeBtn]}
            >
              <Home size={16} color="#FFFFFF" strokeWidth={2.25} />
              <Text style={styles.actionLabel}>{COPY.home}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: R.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  score: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '500',
    color: R.scoreColor,
    marginBottom: 24,
  },
  reviewList: {
    gap: 12,
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  rowCorrect: {
    backgroundColor: R.rowCorrectBg,
    borderColor: R.rowCorrectBorder,
  },
  rowWrong: {
    backgroundColor: R.rowWrongBg,
    borderColor: R.rowWrongBorder,
  },
  rowText: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  tryAgainBtn: {
    backgroundColor: R.cta,
  },
  homeBtn: {
    backgroundColor: R.homeBg,
    borderWidth: 1,
    borderColor: R.homeBorder,
  },
  actionLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
