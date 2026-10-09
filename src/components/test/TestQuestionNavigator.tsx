import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Flag, X } from 'lucide-react-native';
import { TEST } from '@/constants/test';
import { TRAIN_GAMEPLAY as T } from '@/constants/trainGameplay';
import {
  buildTestNavCells,
  describeTestNavCell,
  questionMapCellSize,
  questionMapColumns,
  summarizeTestPaperState,
  type TestNavCellState,
} from '@/services/trainQuestions/testNavigationState';
import type { TrainAnswerRecord } from '@/services/trainQuestions';
import { fonts } from '@/theme';

export type TestQuestionNavigatorProps = {
  visible: boolean;
  answerSlots: readonly (TrainAnswerRecord | null)[];
  flags: readonly boolean[];
  total: number;
  currentIndex: number;
  onJump: (sessionIndex: number) => void;
  onClose: () => void;
};

/**
 * Compact Test Question Map — bottom sheet over gameplay.
 * Presentation-only; state comes from existing answer/flag slots.
 */
export function TestQuestionNavigator({
  visible,
  answerSlots,
  flags,
  total,
  currentIndex,
  onJump,
  onClose,
}: TestQuestionNavigatorProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const counts = summarizeTestPaperState(answerSlots, flags, total);
  const cells = buildTestNavCells({
    answerSlots,
    flags,
    total,
    currentIndex,
  });

  const sheetMaxWidth = Math.min(windowWidth, 440);
  const horizontalPad = 16;
  const contentWidth = Math.max(200, sheetMaxWidth - horizontalPad * 2);
  const gap = 8;
  const columns = questionMapColumns(contentWidth);
  const cellSize = questionMapCellSize(contentWidth, columns, gap);
  /** Keep sheet compact; scroll grid for 45Q. Landscape uses a lower max. */
  const isLandscape = windowWidth > windowHeight;
  const maxSheetHeight = Math.round(
    windowHeight * (isLandscape ? 0.62 : 0.66),
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close question map"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          testID="test-question-navigator"
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              maxHeight: maxSheetHeight,
              width: sheetMaxWidth,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.headerRow}>
            <Text style={styles.title} accessibilityRole="header">
              Questions
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close question map"
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeIconBtn}
            >
              <X size={18} color="rgba(221, 214, 254, 0.9)" strokeWidth={2.5} />
            </Pressable>
          </View>

          <Text
            style={styles.summary}
            accessibilityLabel={`${counts.answered} answered, ${counts.unanswered} unanswered, ${counts.flagged} flagged`}
          >
            {counts.answered} answered · {counts.unanswered} unanswered ·{' '}
            <Text style={styles.summaryFlag}>⚑ {counts.flagged} flagged</Text>
          </Text>

          <ScrollView
            style={styles.gridScroll}
            contentContainerStyle={[
              styles.grid,
              {
                width: contentWidth,
                gap,
                paddingBottom: 4,
              },
            ]}
            showsVerticalScrollIndicator={total > columns * 4}
            keyboardShouldPersistTaps="handled"
          >
            {cells.map((cell) => (
              <NavCell
                key={cell.index}
                cell={cell}
                size={cellSize}
                onPress={() => onJump(cell.index)}
              />
            ))}
          </ScrollView>

          <View style={styles.legend} accessibilityElementsHidden>
            <LegendItem
              marker={<View style={[styles.legendDot, styles.legendDotFilled]} />}
              label="Answered"
            />
            <LegendItem
              marker={
                <View style={[styles.legendDot, styles.legendDotOutline]} />
              }
              label="Unanswered"
            />
            <LegendItem
              marker={
                <Flag size={11} color="#FDE68A" fill="#FDE68A" strokeWidth={2} />
              }
              label="Flagged"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function LegendItem({
  marker,
  label,
}: {
  marker: ReactNode;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      {marker}
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function NavCell({
  cell,
  size,
  onPress,
}: {
  cell: TestNavCellState;
  size: number;
  onPress: () => void;
}) {
  const fontSize = size >= 44 ? 13 : 12;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={describeTestNavCell(cell)}
      accessibilityState={{ selected: cell.current }}
      onPress={onPress}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        cell.answered ? styles.cellAnswered : styles.cellUnanswered,
        cell.current && styles.cellCurrent,
      ]}
    >
      <Text
        style={[
          styles.cellText,
          { fontSize },
          cell.answered && styles.cellTextAnswered,
          cell.current && styles.cellTextCurrent,
        ]}
      >
        {cell.questionNumber}
      </Text>
      {cell.flagged ? (
        <View style={styles.flagBadge} accessibilityElementsHidden>
          <Flag size={9} color="#FDE68A" fill="#FDE68A" strokeWidth={2} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 4, 33, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: T.panel,
    borderWidth: 1,
    borderColor: T.panelBorder,
    paddingTop: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(196, 181, 253, 0.4)',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingLeft: 28,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 11, 52, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 255, 0.35)',
  },
  summary: {
    fontFamily: fonts.display,
    fontSize: 12,
    fontWeight: '500',
    color: T.violetSoft,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginBottom: 12,
    lineHeight: 18,
  },
  summaryFlag: {
    color: '#FDE68A',
    fontWeight: '600',
  },
  gridScroll: {
    alignSelf: 'stretch',
    flexGrow: 0,
    flexShrink: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  cell: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellUnanswered: {
    backgroundColor: 'rgba(15, 11, 52, 0.4)',
    borderColor: 'rgba(167, 139, 250, 0.4)',
  },
  cellAnswered: {
    backgroundColor: 'rgba(124, 58, 237, 0.55)',
    borderColor: 'rgba(196, 181, 253, 0.9)',
  },
  cellCurrent: {
    borderColor: TEST.timerText,
    borderWidth: 2.5,
  },
  cellText: {
    fontFamily: fonts.display,
    fontWeight: '600',
    color: 'rgba(221, 214, 254, 0.9)',
  },
  cellTextAnswered: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cellTextCurrent: {
    color: TEST.timerText,
    fontWeight: '800',
  },
  flagBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 12,
    marginBottom: 4,
    alignSelf: 'stretch',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  legendDotFilled: {
    backgroundColor: 'rgba(124, 58, 237, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.9)',
  },
  legendDotOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.55)',
  },
  legendLabel: {
    fontFamily: fonts.display,
    fontSize: 11,
    fontWeight: '500',
    color: T.violetSoft,
  },
});
