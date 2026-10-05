/**
 * Train result handoff + Maths API session fields.
 *
 * Holds the last completed Train run for the Results screen.
 * Try Again is navigation-only (subject Train setup) — no backend retry.
 */

import type { JourneySubject } from '@/constants/journey';
import type { TrainDifficulty } from '@/constants/train';
import type {
  TrainAnswerRecord,
  TrainQuestionRow,
} from '@/services/trainQuestions';
import {
  formatTrainOptionLabel,
  getTrainExplanation,
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
  /** Maths API session id when results came from the backend. */
  sessionId?: number;
  /** Distinguishes local English/Focus/Test snapshots from Maths API. */
  source?: 'local' | 'api';
};

let lastResult: TrainResultSnapshot | null = null;

/** Armed by Results "Try again" — consumed once by Gameplay on mount (local). */
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
    sessionId?: number;
    source?: 'local' | 'api';
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
    sessionId: snapshot.sessionId,
    source: snapshot.source ?? (snapshot.sessionId != null ? 'api' : 'local'),
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
 * Legacy local-arm helpers retained for Focus/Test callers if any.
 * Train Results Try Again must NOT call these — navigation only.
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

/** Summary counts — unanswered is never counted as wrong. */
export type TrainResultSummary = {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  percent: number;
};

export function summarizeTrainResult(
  result: TrainResultSnapshot,
): TrainResultSummary {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  for (const a of result.answers) {
    if (a.chosen == null) {
      unanswered += 1;
    } else if (a.isCorrect) {
      correct += 1;
    } else {
      wrong += 1;
    }
  }
  const total =
    result.totalQuestions > 0 ? result.totalQuestions : result.answers.length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { correct, wrong, unanswered, total, percent };
}

export type TrainReviewStatus = 'incorrect' | 'unanswered';

/**
 * True only when every question was answered correctly.
 * Empty Mission Review alone is NOT sufficient (unanswered may remain).
 */
export function isTrainResultPerfect(summary: TrainResultSummary): boolean {
  return (
    summary.total > 0 && summary.wrong === 0 && summary.unanswered === 0
  );
}

/**
 * Optional diagram payload for Mission Review (authoritative backend/local fields).
 * Present only when the source question claims a diagram.
 */
export type TrainReviewDiagram = {
  hasDiagram: boolean;
  diagramType: string | null;
  diagramPrompt: string | null;
  diagramData: Record<string, unknown> | null;
};

/**
 * Mission Review rows: answered AND incorrect only.
 * Unanswered are excluded from review cards but remain in summary counts.
 * Never joins by qid alone (Train LOCAL_REPEAT_TO_FILL safety).
 */
export type TrainReviewItem = {
  sessionIndex: number;
  questionNumber: number;
  status: TrainReviewStatus;
  stem: string;
  yourAnswerLabel: string;
  correctAnswerLabel: string;
  explanation: string | null;
  /** Present only for wrong questions that carry diagram fields. */
  diagram?: TrainReviewDiagram;
};

/** Preserve authoritative diagram fields; do not invent geometry. */
export function reviewDiagramFromQuestion(
  question: TrainQuestionRow | undefined,
): TrainReviewDiagram | undefined {
  if (!question?.has_diagram) {
    return undefined;
  }
  return {
    hasDiagram: true,
    diagramType: question.diagram_type ?? null,
    diagramPrompt: question.diagram_prompt ?? null,
    diagramData: question.diagram_data ?? null,
  };
}

export function buildTrainReviewItems(
  result: TrainResultSnapshot,
): TrainReviewItem[] {
  const items: TrainReviewItem[] = [];
  for (let i = 0; i < result.answers.length; i += 1) {
    const answer = result.answers[i];
    // Review filter: answered + incorrect. Unanswered must not appear.
    if (answer.chosen == null || answer.isCorrect) {
      continue;
    }
    const question = result.questions[i];
    const diagram = reviewDiagramFromQuestion(question);
    items.push({
      sessionIndex: i,
      questionNumber: i + 1,
      status: 'incorrect',
      stem: question?.Question_Text?.trim() || 'Question text unavailable.',
      yourAnswerLabel: formatTrainOptionLabel(question, answer.chosen),
      correctAnswerLabel: formatTrainOptionLabel(question, answer.correct),
      explanation: getTrainExplanation(question),
      ...(diagram ? { diagram } : {}),
    });
  }
  return items;
}
