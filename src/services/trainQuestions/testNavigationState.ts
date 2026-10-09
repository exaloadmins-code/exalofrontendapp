/**
 * Pure Test paper navigation / review helpers (no React Native).
 * Used by TrainQuizPlayer (Test mode) and B3.3 automated checks.
 */

import type { TrainAnswerRecord } from '@/services/trainQuestions/types';

export type TestPaperCounts = {
  total: number;
  answered: number;
  unanswered: number;
  flagged: number;
};

export type TestNavCellState = {
  /** 0-based session index */
  index: number;
  /** 1-based display number */
  questionNumber: number;
  answered: boolean;
  flagged: boolean;
  current: boolean;
};

/** Answered + unanswered must equal total. Flagged is independent. */
export function summarizeTestPaperState(
  answerSlots: readonly (TrainAnswerRecord | null)[],
  flags: readonly boolean[],
  total: number,
): TestPaperCounts {
  const safeTotal = Math.max(0, total);
  let answered = 0;
  let flagged = 0;
  for (let i = 0; i < safeTotal; i += 1) {
    if (answerSlots[i]?.chosen != null) {
      answered += 1;
    }
    if (flags[i] === true) {
      flagged += 1;
    }
  }
  return {
    total: safeTotal,
    answered,
    unanswered: safeTotal - answered,
    flagged,
  };
}

export function buildTestNavCells(params: {
  answerSlots: readonly (TrainAnswerRecord | null)[];
  flags: readonly boolean[];
  total: number;
  currentIndex: number;
}): TestNavCellState[] {
  const { answerSlots, flags, total, currentIndex } = params;
  const cells: TestNavCellState[] = [];
  for (let i = 0; i < total; i += 1) {
    cells.push({
      index: i,
      questionNumber: i + 1,
      answered: answerSlots[i]?.chosen != null,
      flagged: flags[i] === true,
      current: i === currentIndex,
    });
  }
  return cells;
}

export function firstFlaggedIndex(
  flags: readonly boolean[],
  total: number,
): number | null {
  for (let i = 0; i < total; i += 1) {
    if (flags[i] === true) {
      return i;
    }
  }
  return null;
}

export function firstUnansweredIndex(
  answerSlots: readonly (TrainAnswerRecord | null)[],
  total: number,
): number | null {
  for (let i = 0; i < total; i += 1) {
    if (answerSlots[i]?.chosen == null) {
      return i;
    }
  }
  return null;
}

/** Accessibility label for a navigator cell. */
export function describeTestNavCell(cell: TestNavCellState): string {
  const parts = [`Question ${cell.questionNumber}`];
  if (cell.current) {
    parts.push('current');
  }
  parts.push(cell.answered ? 'answered' : 'unanswered');
  if (cell.flagged) {
    parts.push('flagged');
  }
  return parts.join(', ');
}

/**
 * Responsive column count for the compact Question Map.
 * Prefer 6 on wider maps; 5 mid; 4 on narrow.
 */
export function questionMapColumns(contentWidth: number): number {
  if (contentWidth >= 340) {
    return 6;
  }
  if (contentWidth >= 280) {
    return 5;
  }
  return 4;
}

/**
 * Circular target size. Prefer ≥44px touch target when the row allows;
 * never shrink below 36px.
 */
export function questionMapCellSize(
  contentWidth: number,
  columns: number,
  gap: number,
): number {
  const safeColumns = Math.max(1, columns);
  const raw = (contentWidth - gap * (safeColumns - 1)) / safeColumns;
  return Math.max(36, Math.min(48, Math.floor(raw)));
}
