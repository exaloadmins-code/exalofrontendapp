/**
 * TEMPORARY frontend Train question types (M4 + B1.3 API adapter fields).
 *
 * Local English / Focus / Test still use Lovable-shaped rows.
 * Maths API sessions populate Option_* from backend options[] and may include
 * diagram_* fields. Correct_Option is unknown during API gameplay.
 */

export type TrainSubjectType = 'Maths' | 'English';

/** Capitalized difficulty as used by Lovable question rows / QuizPlayer subtitle. */
export type TrainBankDifficulty = 'Easy' | 'Medium' | 'Hard';

export type OptionLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export type TrainQuestionRow = {
  Question_ID: string;
  Subject_Type: TrainSubjectType;
  Subject: string;
  Difficulty: TrainBankDifficulty | string;
  Question_Text: string;
  Option_A: string | null;
  Option_B: string | null;
  Option_C: string | null;
  Option_D: string | null;
  Option_E: string | null;
  /**
   * Known for local banks. For Maths API gameplay this is a placeholder and
   * must not be treated as authoritative — Results come from the backend.
   */
  Correct_Option: OptionLetter | string;
  Explanation: string | null;
  /** Backend options[] preserved for answer TEXT posting (Maths API). */
  backendOptions?: string[];
  /** 1-based backend question_number when from API. */
  backendQuestionNumber?: number;
  has_diagram?: boolean;
  diagram_type?: string | null;
  diagram_prompt?: string | null;
  diagram_data?: Record<string, unknown> | null;
};

export type TrainAnswerRecord = {
  qid: string;
  /**
   * Selected option letter. `null` = unanswered (Test timeout partial paper).
   * Train / Focus always set a letter.
   */
  chosen: OptionLetter | null;
  correct: OptionLetter;
  isCorrect: boolean;
};

export const OPTION_LETTERS: OptionLetter[] = ['A', 'B', 'C', 'D', 'E'];

export function getTrainOptions(
  q: TrainQuestionRow,
): { letter: OptionLetter; text: string }[] {
  return OPTION_LETTERS.map((letter) => ({
    letter,
    text: (q[`Option_${letter}` as keyof TrainQuestionRow] as string | null) ?? '',
  })).filter((o) => o.text && o.text.trim().length > 0);
}

/** Letter + option text when available; letter-only fallback. Never invents text. */
export function formatTrainOptionLabel(
  q: TrainQuestionRow | undefined,
  letter: OptionLetter | string | null | undefined,
): string {
  if (letter == null) {
    return '';
  }
  const normalized = letter.toString().trim().toUpperCase();
  if (!normalized) {
    return '';
  }
  if (!q) {
    return normalized;
  }
  const key = `Option_${normalized}` as keyof TrainQuestionRow;
  const text = (q[key] as string | null | undefined)?.trim();
  return text ? `${normalized} · ${text}` : normalized;
}

/** Non-empty explanation only — null / blank / whitespace → none. */
export function getTrainExplanation(
  q: TrainQuestionRow | undefined,
): string | null {
  const text = q?.Explanation?.trim();
  return text ? text : null;
}
