/**
 * Hydrate existing TrainResultSnapshot fields from backend GET /results.
 */

import type { JourneySubject } from '@/constants/journey';
import type { TrainDifficulty } from '@/constants/train';
import type { TrainResultsResponse } from '@/services/api/trainApi';
import { backendResultQuestionToRow } from '@/services/trainQuestions/backendAdapter';
import { letterForOptionText } from '@/services/trainQuestions/optionAdapter';
import type {
  OptionLetter,
  TrainAnswerRecord,
  TrainBankDifficulty,
  TrainQuestionRow,
} from '@/services/trainQuestions/types';

export function hydrateTrainResultFromApi(params: {
  results: TrainResultsResponse;
  subject: JourneySubject;
  topicSlug: string;
  topicLabel: string;
  difficulty: TrainDifficulty;
  bankDifficulty: TrainBankDifficulty;
}): {
  questions: TrainQuestionRow[];
  answers: TrainAnswerRecord[];
  totalQuestions: number;
  totalCorrect: number;
  sessionId: number;
} {
  const { results } = params;
  const questions = results.questions.map((q) =>
    backendResultQuestionToRow(q, {
      subjectType: 'Maths',
      topicLabel: params.topicLabel,
      bankDifficulty: params.bankDifficulty,
      sessionId: results.session_id,
    }),
  );

  const answers: TrainAnswerRecord[] = results.questions.map((q, index) => {
    const row = questions[index];
    const correctLetter =
      letterForOptionText(q.options, q.correct_answer) ??
      ((row?.Correct_Option as OptionLetter) || 'A');
    const chosen = letterForOptionText(q.options, q.selected_answer);
    return {
      qid: row.Question_ID,
      chosen,
      correct: correctLetter,
      isCorrect: q.is_correct === true,
    };
  });

  return {
    questions,
    answers,
    totalQuestions: results.total_questions,
    totalCorrect: results.correct_count,
    sessionId: results.session_id,
  };
}
