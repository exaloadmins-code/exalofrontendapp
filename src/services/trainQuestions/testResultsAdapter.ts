/**
 * Thin Test Results DTO → shared Train/Focus results shape.
 * Keeps backend Test naming (incorrect_count / score_percentage) out of UI.
 */

import type { TestResultsResponse } from '../api/testApi';
import type { TrainResultsResponse } from '../api/trainApi';
import type { TrainAnswerRecord } from './types';

/**
 * Map Test aggregate fields onto the shared results model used by
 * hydrateTrainResultFromApi / TrainResultsView.
 */
export function testResultsToShared(
  results: TestResultsResponse,
): TrainResultsResponse {
  return {
    session_id: results.session_id,
    status: results.status,
    total_questions: results.total_questions,
    answered_count: results.answered_count,
    correct_count: results.correct_count,
    wrong_count: results.incorrect_count,
    unanswered_count: results.unanswered_count,
    score_percent: results.score_percentage,
    questions: results.questions.map((q) => ({
      question_number: q.question_number,
      stem: q.stem,
      options: q.options,
      selected_answer: q.selected_answer,
      correct_answer: q.correct_answer,
      is_correct: q.is_correct,
      explanation: q.explanation,
      has_diagram: q.has_diagram,
      diagram_type: q.diagram_type,
      diagram_prompt: q.diagram_prompt,
      diagram_data: q.diagram_data,
    })),
  };
}

/**
 * Mission Review inclusion rule (frozen):
 * answered + incorrect only. Unanswered (chosen null / selected_answer null)
 * and correct answers are excluded.
 */
export function isMissionReviewWrongAnswer(answer: {
  chosen: unknown;
  isCorrect: boolean;
}): boolean {
  return answer.chosen != null && answer.isCorrect === false;
}

/**
 * Classify a backend Test result question for Mission Review eligibility.
 * Unanswered: selected_answer === null && is_correct === null → excluded.
 */
export function isTestQuestionMissionReviewEligible(q: {
  selected_answer: string | null;
  is_correct: boolean | null;
}): boolean {
  return q.selected_answer != null && q.is_correct === false;
}

/** Count Mission Review cards from hydrated answer rows. */
export function countMissionReviewItems(
  answers: readonly TrainAnswerRecord[],
): number {
  return answers.filter((a) => isMissionReviewWrongAnswer(a)).length;
}
