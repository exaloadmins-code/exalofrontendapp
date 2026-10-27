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

/**
 * Pre-submission review filter. `normal` is ordinary full-paper idx ± 1.
 * Flagged and unanswered steps stay on absolute indexes in the original paper.
 */
export type FilteredReviewMode = 'flagged' | 'unanswered';

function matchesFilteredReview(
  mode: FilteredReviewMode,
  index: number,
  flags: readonly boolean[],
  answerSlots: readonly (TrainAnswerRecord | null)[],
): boolean {
  if (mode === 'flagged') {
    return flags[index] === true;
  }
  return answerSlots[index]?.chosen == null;
}

/**
 * Next absolute index in the current live subset, strictly after `currentIndex`.
 * Null means there is no later match (caller reopens the finish-review modal).
 */
export function nextFilteredIndex(
  mode: FilteredReviewMode,
  currentIndex: number,
  total: number,
  flags: readonly boolean[],
  answerSlots: readonly (TrainAnswerRecord | null)[],
): number | null {
  for (let i = currentIndex + 1; i < total; i += 1) {
    if (matchesFilteredReview(mode, i, flags, answerSlots)) {
      return i;
    }
  }
  return null;
}

/**
 * Previous absolute index in the current live subset, strictly before `currentIndex`.
 * Null means Previous is disabled — do not step into a non-matching question.
 */
export function previousFilteredIndex(
  mode: FilteredReviewMode,
  currentIndex: number,
  total: number,
  flags: readonly boolean[],
  answerSlots: readonly (TrainAnswerRecord | null)[],
): number | null {
  const start = Math.min(currentIndex, total) - 1;
  for (let i = start; i >= 0; i -= 1) {
    if (matchesFilteredReview(mode, i, flags, answerSlots)) {
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
