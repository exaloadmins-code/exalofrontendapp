import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { TRAIN_GAMEPLAY as T } from '@/constants/trainGameplay';
import type { TestPaperCounts } from '@/services/trainQuestions/testNavigationState';
import { fonts } from '@/theme';

export type TestFinishReviewModalProps = {
  visible: boolean;
  counts: TestPaperCounts;
  onReviewFlagged: () => void;
  onReviewUnanswered: () => void;
  onFinish: () => void;
  onKeepWorking: () => void;
  finishing?: boolean;
};

/**
 * Manual Finish confirmation for Test — bypassed on timeout auto-submit.
 */
export function TestFinishReviewModal({
  visible,
  counts,
  onReviewFlagged,
  onReviewUnanswered,
  onFinish,
  onKeepWorking,
  finishing = false,
}: TestFinishReviewModalProps) {
  if (!visible) {
    return null;
  }

  const hasFlagged = counts.flagged > 0;
  const hasUnanswered = counts.unanswered > 0;
  const needsReview = hasFlagged || hasUnanswered;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onKeepWorking}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View
          testID="test-finish-review-modal"
          accessibilityViewIsModal
          style={styles.card}
        >
          <Text style={styles.title} accessibilityRole="header">
            Ready to finish?
          </Text>
          <Text style={styles.body}>
            {needsReview
              ? 'You still have questions to review. You can finish now, or jump back first.'
              : "You've answered every question. Finish when you're ready."}
          </Text>

          <View style={styles.counts}>
            <CountRow label="Answered" value={counts.answered} />
            <CountRow label="Unanswered" value={counts.unanswered} />
            <CountRow label="Flagged" value={counts.flagged} />
          </View>

          {hasFlagged ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Review flagged questions"
              disabled={finishing}
              onPress={onReviewFlagged}
              style={[styles.secondaryBtn, finishing && styles.disabled]}
            >
              <Text style={styles.secondaryLabel}>Review flagged</Text>
            </Pressable>
          ) : null}

          {hasUnanswered ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Review unanswered questions"
              disabled={finishing}
              onPress={onReviewUnanswered}
              style={[styles.secondaryBtn, finishing && styles.disabled]}
            >
              <Text style={styles.secondaryLabel}>Review unanswered</Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Finish test"
            disabled={finishing}
            onPress={onFinish}
            style={[styles.primaryBtn, finishing && styles.disabled]}
          >
            <Text style={styles.primaryLabel}>
              {finishing ? 'Submitting…' : 'Finish test'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Keep working"
            disabled={finishing}
            onPress={onKeepWorking}
            style={[styles.keepBtn, finishing && styles.disabled]}
          >
            <Text style={styles.keepLabel}>Keep working</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function CountRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.countRow}>
      <Text style={styles.countLabel}>{label}</Text>
      <Text style={styles.countValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 4, 33, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    padding: 24,
    gap: 10,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.violetSoft,
    textAlign: 'center',
    marginBottom: 4,
  },
  counts: {
    borderRadius: 14,
    backgroundColor: 'rgba(15, 11, 52, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 255, 0.3)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  countLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: T.violetSoft,
  },
  countValue: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.65)',
    backgroundColor: 'rgba(124, 58, 237, 0.18)',
    alignItems: 'center',
  },
  secondaryLabel: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '600',
    color: '#EDE9FE',
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: T.cta,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  keepBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  keepLabel: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '600',
    color: T.violetText,
  },
  disabled: {
    opacity: 0.55,
  },
});
