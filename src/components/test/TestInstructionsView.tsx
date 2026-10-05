import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardList, Clock } from 'lucide-react-native';
import { BackButton } from '@/components/navigation/BackButton';
import type { JourneySubject } from '@/constants/journey';
import {
  TEST,
  TEST_COPY as COPY,
  TEST_INSTRUCTIONS_DISPLAY,
} from '@/constants/test';
import { fonts } from '@/theme';

export type TestInstructionsViewProps = {
  subject: JourneySubject;
  subjectLabel: string;
  starting: boolean;
  onBack: () => void;
  onStart: () => void;
};

/**
 * Pre-test instructions — Test mode entry lands here.
 * Start Test is the only boundary that loads a paper and starts the timer.
 *
 * Stat cards use TEST_INSTRUCTIONS_DISPLAY (product-spec copy only).
 * Runtime paper size / duration are unchanged until a later milestone.
 */
export function TestInstructionsView({
  subjectLabel,
  starting,
  onBack,
  onStart,
}: TestInstructionsViewProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth - 48, TEST.emptyMaxWidth);

  // Product-spec instruction copy.
  // Runtime Test configuration will be updated in a separate milestone.
  const displayQuestions = TEST_INSTRUCTIONS_DISPLAY.questionCount;
  const displayMinutes = TEST_INSTRUCTIONS_DISPLAY.durationMinutes;

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      {/* Anchored chrome — not part of the vertically centered group. */}
      <View style={[styles.topBar, { width: contentWidth }]}>
        <BackButton onPress={onBack} accessibilityLabel={COPY.back} />
      </View>

      {/*
        flexGrow + justifyContent centers the main group when there is spare
        height; when content is taller (short / landscape), the container
        grows with the children so the group remains fully scrollable.
      */}
      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: Math.max(24, (windowWidth - contentWidth) / 2),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainGroup, { width: contentWidth }]}>
          <Text style={styles.eyebrow}>{COPY.instructionsEyebrow}</Text>
          <Text style={styles.title}>{COPY.title(subjectLabel)}</Text>
          <Text style={styles.intro}>{COPY.instructionsIntro(subjectLabel)}</Text>

          <View style={styles.statRow}>
            <View
              style={styles.statCard}
              accessibilityRole="text"
              accessibilityLabel={`${displayQuestions} ${COPY.statQuestionsLabel}`}
            >
              <ClipboardList
                size={16}
                color="rgba(167, 139, 250, 0.9)"
                strokeWidth={2.25}
              />
              <Text style={styles.statValue}>{displayQuestions}</Text>
              <Text style={styles.statLabel}>{COPY.statQuestionsLabel}</Text>
            </View>
            <View
              style={styles.statCard}
              accessibilityRole="text"
              accessibilityLabel={`${displayMinutes} ${COPY.statMinutesLabel}`}
            >
              <Clock
                size={16}
                color="rgba(34, 211, 238, 0.9)"
                strokeWidth={2.25}
              />
              <Text style={styles.statValue}>{displayMinutes}</Text>
              <Text style={styles.statLabel}>{COPY.statMinutesLabel}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>{COPY.instructionsHeading}</Text>
            <View style={styles.bulletList}>
              {COPY.instructionBullets.map((line) => (
                <View key={line} style={styles.bulletRow}>
                  <Text style={styles.bulletMark}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={COPY.startTest}
            accessibilityState={{ disabled: starting }}
            disabled={starting}
            onPress={onStart}
            style={({ pressed }) => [
              styles.startBtn,
              {
                opacity: starting ? 0.55 : pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text style={styles.startLabel}>
              {starting ? COPY.startingTest : COPY.startTest}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TEST.background,
  },
  topBar: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 4,
    zIndex: 1,
  },
  scrollFlex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  mainGroup: {
    alignSelf: 'center',
  },
  eyebrow: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: 'rgba(34, 211, 238, 0.95)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  intro: {
    fontFamily: fonts.display,
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(221, 214, 254, 0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: TEST.panelBorder,
    backgroundColor: TEST.panel,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  statLabel: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(196, 181, 253, 0.9)',
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: TEST.panelBorder,
    backgroundColor: TEST.panel,
    padding: 20,
    gap: 14,
    marginBottom: 24,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 18,
    fontWeight: '700',
    color: '#E9D5FF',
  },
  bulletList: {
    gap: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletMark: {
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(167, 139, 250, 0.95)',
    lineHeight: 22,
    width: 14,
  },
  bulletText: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(221, 214, 254, 0.92)',
    lineHeight: 21,
  },
  startBtn: {
    borderRadius: 16,
    backgroundColor: TEST.cta,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  startLabel: {
    fontFamily: fonts.display,
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
