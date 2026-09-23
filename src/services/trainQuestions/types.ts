/**
 * TEMPORARY frontend-only Train question types (M4).
 *
 * Aligned with Lovable `lib/questionBank.ts` / `lib/subjects.ts` for UX parity.
 * Not a production question-bank schema. Replace via `loadTrainQuestions` when
 * backend integration unparks — do not couple UI to this module's internals.
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
  Correct_Option: OptionLetter | string;
  Explanation: string | null;
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
