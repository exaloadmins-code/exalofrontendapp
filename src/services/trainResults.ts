/**
 * TEMPORARY frontend-only Train result handoff (M4 → M5).
 *
 * Holds the last completed Train run for the Results screen and optional
 * Lovable-parity "Try again" restart (same question set). Not persisted.
 * Not a backend session.
 */

import type { JourneySubject } from '@/constants/journey';
import type { TrainDifficulty } from '@/constants/train';
import type {
  TrainAnswerRecord,
  TrainQuestionRow,
} from '@/services/trainQuestions';

export type TrainResultSnapshot = {
  subject: JourneySubject;
  topicSlug: string;
  topicLabel: string;
  difficulty: TrainDifficulty;
  /**
   * Train Number-of-Questions session length. Optional for Focus/Test result
   * snapshots that reuse this shape; Train always sets it.
   */
  questionCount?: number;
  /** Lovable QuizPlayer title prefix, e.g. `Train Mode · Fractions`. */
  title: string;
  answers: TrainAnswerRecord[];
  /**
   * Questions from the completed run — required for Lovable-parity Try again
   * (restart same set). Optional for display-only Results.
   */
  questions: TrainQuestionRow[];
  totalQuestions: number;
  totalCorrect: number;
  /** Local wall-clock ms — handoff only. */
  completedAt: number;
};

let lastResult: TrainResultSnapshot | null = null;

/** Armed by Results "Try again" — consumed once by Gameplay on mount. */
let armedRetryQuestions: TrainQuestionRow[] | null = null;
let armedRetryKey: string | null = null;

function retryKey(
  subject: JourneySubject,
  topicSlug: string,
  difficulty: TrainDifficulty,
  questionCount: number,
): string {
  return `${subject}::${topicSlug}::${difficulty}::${questionCount}`;
}

export function setTrainResult(
  snapshot: Omit<
    TrainResultSnapshot,
    'completedAt' | 'totalCorrect' | 'totalQuestions' | 'title' | 'questionCount'
  > & {
    completedAt?: number;
    totalCorrect?: number;
    totalQuestions?: number;
    title?: string;
    questionCount?: number;
  },
): TrainResultSnapshot {
  // A new completion supersedes any pending Try-again arm.
  clearArmedTrainRetry();
  const totalQuestions = snapshot.totalQuestions ?? snapshot.answers.length;
  const totalCorrect =
    snapshot.totalCorrect ?? snapshot.answers.filter((a) => a.isCorrect).length;
  const title =
    snapshot.title ?? `Train Mode · ${snapshot.topicLabel}`;
  const questionCount =
    snapshot.questionCount ??
    snapshot.questions?.length ??
    totalQuestions;
  lastResult = {
    subject: snapshot.subject,
    topicSlug: snapshot.topicSlug,
    topicLabel: snapshot.topicLabel,
    difficulty: snapshot.difficulty,
    questionCount,
    title,
    answers: snapshot.answers,
    questions: snapshot.questions ?? [],
    totalQuestions,
    totalCorrect,
    completedAt: snapshot.completedAt ?? Date.now(),
  };
  return lastResult;
}

export function getTrainResult(): TrainResultSnapshot | null {
  return lastResult;
}

export function clearTrainResult(): void {
  lastResult = null;
}

export function clearArmedTrainRetry(): void {
  armedRetryQuestions = null;
  armedRetryKey = null;
}

/**
 * Lovable QuizPlayer `restart()` keeps the same question array in memory.
 * Expo remounts Gameplay — arm the completed run's questions for one consume.
 * Same subject + topic + difficulty + questionCount + same question set.
 */
export function armTrainRetry(result: TrainResultSnapshot): void {
  if (!result.questions.length) {
    clearArmedTrainRetry();
    return;
  }
  const questionCount =
    result.questionCount ?? result.questions.length ?? result.totalQuestions;
  armedRetryQuestions = result.questions;
  armedRetryKey = retryKey(
    result.subject,
    result.topicSlug,
    result.difficulty,
    questionCount,
  );
}

export function consumeArmedTrainRetry(
  subject: JourneySubject,
  topicSlug: string,
  difficulty: TrainDifficulty,
  questionCount: number,
): TrainQuestionRow[] | null {
  if (!armedRetryQuestions || !armedRetryKey) {
    return null;
  }
  if (
    armedRetryKey !==
    retryKey(subject, topicSlug, difficulty, questionCount)
  ) {
    return null;
  }
  const questions = armedRetryQuestions;
  armedRetryQuestions = null;
  armedRetryKey = null;
  return questions;
}

export function trainResultPercent(result: TrainResultSnapshot): number {
  if (result.totalQuestions <= 0) {
    return 0;
  }
  return Math.round((result.totalCorrect / result.totalQuestions) * 100);
}
