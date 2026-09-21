/**
 * Train question loader seam (M4).
 *
 * UI / QuizPlayer must call this function — never import `questionBank` directly.
 * Current implementation is LOCAL / TEMPORARY only (Lovable bank port).
 * Future backend integration replaces this module's body without redesigning gameplay UI.
 *
 * No network. No session IDs. No `/train/start`.
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

export const TRAIN_QUESTIONS_PER_RUN = 20;

export type LoadTrainQuestionsParams = {
  subject: JourneySubject;
  /** URL topic slug (M3 catalogue). */
  topicSlug: string;
  /** Route/query difficulty (lowercase). */
  difficulty: TrainDifficulty | string;
  /** Defaults to Lovable Train parity (20). */
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
