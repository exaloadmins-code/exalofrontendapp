/**
 * Test question loader seam (M7).
 *
 * UI must call this function — never import `questionBank` directly.
 * LOCAL / TEMPORARY only (Lovable `fetchTestQuestions` parity).
 * Future backend integration replaces this module's body without redesigning Test UI.
 *
 * No network. No session IDs. No Test API endpoints.
 *
 * Lovable contract:
 * - All catalogue topics for the subject
 * - `perTopic` questions per topic (default 2 → 20 total for 10 topics)
 * - Difficulty rotates Easy → Medium → Hard by topic index
 * - Final list is shuffled
 * - No setup filters; no timer
 */

import type { JourneySubject } from '@/constants/journey';
import { TEST_QUESTIONS_PER_TOPIC } from '@/constants/test';
import { trainTopicsFor } from '@/constants/train';
import { generateQuestions, shuffleRows } from './questionBank';
import type {
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from './types';

export type LoadTestQuestionsParams = {
  subject: JourneySubject;
  /** Defaults to Lovable Test parity (2 per topic). */
  perTopic?: number;
};

export type LoadTestQuestionsResult = {
  questions: TrainQuestionRow[];
  subjectType: TrainSubjectType;
  /** Expected paper size = topicCount × perTopic (before bank shortages). */
  expectedTotal: number;
  topicCount: number;
  perTopic: number;
};

const DIFFICULTY_ROTATION: TrainBankDifficulty[] = ['Easy', 'Medium', 'Hard'];

function toSubjectType(subject: JourneySubject): TrainSubjectType {
  return subject === 'english' ? 'English' : 'Maths';
}

/**
 * LOCAL-ONLY Test question load — balanced mock paper across all topics.
 */
export async function loadTestQuestions(
  params: LoadTestQuestionsParams,
): Promise<LoadTestQuestionsResult> {
  const { subject, perTopic = TEST_QUESTIONS_PER_TOPIC } = params;
  const subjectType = toSubjectType(subject);
  const topics = trainTopicsFor(subject);
  const topicCount = topics.length;
  const expectedTotal = topicCount * perTopic;

  if (topicCount === 0 || perTopic <= 0) {
    return {
      questions: [],
      subjectType,
      expectedTotal: 0,
      topicCount,
      perTopic,
    };
  }

  const rows: TrainQuestionRow[] = [];
  topics.forEach((topic, i) => {
    const difficulty = DIFFICULTY_ROTATION[i % DIFFICULTY_ROTATION.length];
    rows.push(
      ...generateQuestions({
        subjectType,
        subject: topic.label,
        difficulty,
        count: perTopic,
      }),
    );
  });

  const questions = shuffleRows(rows) as TrainQuestionRow[];
  return {
    questions,
    subjectType,
    expectedTotal,
    topicCount,
    perTopic,
  };
}
