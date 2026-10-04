/**
 * Map backend Train question / result payloads → existing TrainQuestionRow shape.
 */

import type { TrainQuestionResponse, TrainQuestionResult } from '@/services/api/trainApi';
import { letterForOptionText } from '@/services/trainQuestions/optionAdapter';
import type {
  OptionLetter,
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from '@/services/trainQuestions/types';
import { OPTION_LETTERS } from '@/services/trainQuestions/types';

function optionsToLetterFields(options: string[]): Pick<
  TrainQuestionRow,
  'Option_A' | 'Option_B' | 'Option_C' | 'Option_D' | 'Option_E'
> {
  const fields: Record<string, string | null> = {
    Option_A: null,
    Option_B: null,
    Option_C: null,
    Option_D: null,
    Option_E: null,
  };
  options.forEach((text, index) => {
    if (index >= OPTION_LETTERS.length) {
      return;
    }
    fields[`Option_${OPTION_LETTERS[index]}`] = String(text);
  });
  return fields as Pick<
    TrainQuestionRow,
    'Option_A' | 'Option_B' | 'Option_C' | 'Option_D' | 'Option_E'
  >;
}

export function backendGameplayQuestionToRow(
  q: TrainQuestionResponse,
  meta: {
    subjectType: TrainSubjectType;
    topicLabel: string;
    bankDifficulty: TrainBankDifficulty;
    sessionId: number;
  },
): TrainQuestionRow {
  if (!Array.isArray(q.options) || q.options.length < 2) {
    throw new Error(
      `Train question ${q.question_number} has invalid options from the API.`,
    );
  }
  if (typeof q.stem !== 'string' || !q.stem.trim()) {
    throw new Error(
      `Train question ${q.question_number} has an empty stem from the API.`,
    );
  }
  return {
    Question_ID: `api-${meta.sessionId}-q${q.question_number}`,
    Subject_Type: meta.subjectType,
    Subject: meta.topicLabel,
    Difficulty: meta.bankDifficulty,
    Question_Text: q.stem,
    ...optionsToLetterFields(q.options),
    // Placeholder only — never treat as authoritative during Maths API gameplay.
    Correct_Option: 'A',
    Explanation: null,
    backendOptions: [...q.options],
    backendQuestionNumber: q.question_number,
    has_diagram: Boolean(q.has_diagram),
    diagram_type: q.diagram_type ?? null,
    diagram_prompt: q.diagram_prompt ?? null,
    diagram_data: (q.diagram_data as Record<string, unknown> | null) ?? null,
  };
}

export function backendResultQuestionToRow(
  q: TrainQuestionResult,
  meta: {
    subjectType: TrainSubjectType;
    topicLabel: string;
    bankDifficulty: TrainBankDifficulty;
    sessionId: number;
  },
): TrainQuestionRow {
  const correctLetter =
    letterForOptionText(q.options, q.correct_answer) ?? ('A' as OptionLetter);
  return {
    Question_ID: `api-${meta.sessionId}-q${q.question_number}`,
    Subject_Type: meta.subjectType,
    Subject: meta.topicLabel,
    Difficulty: meta.bankDifficulty,
    Question_Text: q.stem,
    ...optionsToLetterFields(q.options),
    Correct_Option: correctLetter,
    Explanation: q.explanation,
    backendOptions: [...q.options],
    backendQuestionNumber: q.question_number,
    has_diagram: Boolean(q.has_diagram),
    diagram_type: q.diagram_type ?? null,
    diagram_prompt: q.diagram_prompt ?? null,
    diagram_data: (q.diagram_data as Record<string, unknown> | null) ?? null,
  };
}
