/**
 * Train question loader seam.
 *
 * English (and Focus/Test via their own loaders) still use the local bank.
 * Maths Train gameplay uses `startMathsTrainSession` / API — do NOT call this
 * for Maths API sessions (no LOCAL_REPEAT_TO_FILL on the API path).
 */

import type { JourneySubject } from '@/constants/journey';
import {
  normalizeTrainDifficulty,
  trainTopicLabel,
  type TrainDifficulty,
} from '@/constants/train';
import { generateQuestions } from './questionBank';
import type {
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from './types';

/**
 * Legacy Lovable default when callers omit `limit`.
 * Train Number-of-Questions flow always passes an explicit count — do not treat
 * this as a UI default on the count screen.
 */
export const TRAIN_QUESTIONS_PER_RUN = 20;

export type LoadTrainQuestionsParams = {
  subject: JourneySubject;
  /** URL topic slug (M3 catalogue). */
  topicSlug: string;
  /** Route/query difficulty (lowercase). */
  difficulty: TrainDifficulty | string;
  /**
   * Exact session length. Local bank fills to this size (unique first, then
   * LOCAL_REPEAT_TO_FILL). Defaults to {@link TRAIN_QUESTIONS_PER_RUN} only for
   * legacy callers — Train gameplay must pass the learner's chosen count.
   */
  limit?: number;
};

export type LoadTrainQuestionsResult = {
  questions: TrainQuestionRow[];
  subjectType: TrainSubjectType;
  topicLabel: string;
  bankDifficulty: TrainBankDifficulty;
};

function toBankDifficulty(raw: TrainDifficulty | string): TrainBankDifficulty {
  const d = normalizeTrainDifficulty(raw);
  if (d === 'hard') return 'Hard';
  if (d === 'medium') return 'Medium';
  return 'Easy';
}

function toSubjectType(subject: JourneySubject): TrainSubjectType {
  return subject === 'english' ? 'English' : 'Maths';
}

/**
 * LOCAL-ONLY Train question load.
 * Throws if topic slug is unknown for the subject.
 *
 * LOCAL_REPEAT_TO_FILL: `generateQuestions` returns exactly `limit` rows,
 * repeating after unique pool exhaustion when needed (see module header).
 */
export async function loadTrainQuestions(
  params: LoadTrainQuestionsParams,
): Promise<LoadTrainQuestionsResult> {
  const { subject, topicSlug, difficulty, limit = TRAIN_QUESTIONS_PER_RUN } = params;
  const topicLabel = trainTopicLabel(subject, topicSlug);
  if (!topicLabel) {
    throw new Error(
      `Unknown topic slug "${topicSlug}" for ${toSubjectType(subject)}.`,
    );
  }

  const subjectType = toSubjectType(subject);
  const bankDifficulty = toBankDifficulty(difficulty);

  // Synchronous generator wrapped in Promise to keep the seam async-ready for a future API.
  const questions = generateQuestions({
    subjectType,
    subject: topicLabel,
    difficulty: bankDifficulty,
    count: limit,
  });

  return { questions, subjectType, topicLabel, bankDifficulty };
}
