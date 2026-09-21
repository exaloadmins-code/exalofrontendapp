/**
 * TEMPORARY frontend-only Train result handoff (M4 → M5 boundary).
 *
 * Holds the last completed Train run so the M5 Results placeholder can display
 * context. Not persisted. Not a backend session. Clear when starting a new run
 * if desired.
 */

import type { JourneySubject } from '@/constants/journey';
import type { TrainDifficulty } from '@/constants/train';
import type { TrainAnswerRecord } from '@/services/trainQuestions';

export type TrainResultSnapshot = {
  subject: JourneySubject;
  topicSlug: string;
  topicLabel: string;
  difficulty: TrainDifficulty;
  answers: TrainAnswerRecord[];
  totalQuestions: number;
  totalCorrect: number;
  /** Local wall-clock ms — handoff only. */
  completedAt: number;
};

let lastResult: TrainResultSnapshot | null = null;

export function setTrainResult(
  snapshot: Omit<TrainResultSnapshot, 'completedAt' | 'totalCorrect' | 'totalQuestions'> & {
    completedAt?: number;
    totalCorrect?: number;
    totalQuestions?: number;
  },
): TrainResultSnapshot {
  const totalQuestions = snapshot.totalQuestions ?? snapshot.answers.length;
  const totalCorrect =
    snapshot.totalCorrect ?? snapshot.answers.filter((a) => a.isCorrect).length;
  lastResult = {
    subject: snapshot.subject,
    topicSlug: snapshot.topicSlug,
    topicLabel: snapshot.topicLabel,
    difficulty: snapshot.difficulty,
    answers: snapshot.answers,
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
