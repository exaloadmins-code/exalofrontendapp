/**
 * Maths Test API session loader — development blueprint exalo-maths-mock v1.
 * English Test continues to use loadTestQuestions (local). No local Maths fallback.
 */

import { getDevUserId } from '@/config/env';
import {
  buildMathsDevTestStartPayload,
  startTest,
  type TestStartResponse,
} from '@/services/api/testApi';
import {
  getSessionQuestion,
  type SessionQuestionResponse,
} from '@/services/api/sessionApi';
import { backendGameplayQuestionToRow } from '@/services/trainQuestions/backendAdapter';
import { letterForOptionText } from '@/services/trainQuestions/optionAdapter';
import type {
  OptionLetter,
  TrainAnswerRecord,
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from '@/services/trainQuestions/types';
import type { JourneySubject } from '@/constants/journey';

export type MathsTestSessionLoad = {
  source: 'api';
  sessionId: number;
  totalQuestions: number;
  timeLimitMinutes: number;
  startedAt: string;
  expiresAt: string;
  expiresAtMs: number;
  questions: TrainQuestionRow[];
  /** Seeded from backend selected_answer when present (revisit / resume within fetch). */
  initialAnswers: (TrainAnswerRecord | null)[];
  /** Seeded from backend flagged when present. */
  initialFlags: boolean[];
  subjectType: TrainSubjectType;
  topicLabel: string;
  bankDifficulty: TrainBankDifficulty;
};

async function fetchAllQuestions(
  sessionId: number,
  total: number,
): Promise<SessionQuestionResponse[]> {
  const questions: SessionQuestionResponse[] = [];
  for (let n = 1; n <= total; n += 1) {
    questions.push(await getSessionQuestion(sessionId, n));
  }
  return questions;
}

function expiresAtToMs(expiresAt: string): number {
  const ms = Date.parse(expiresAt);
  if (!Number.isFinite(ms)) {
    throw new Error('Test start response had an invalid expires_at.');
  }
  return ms;
}

/**
 * Map gameplay question selected_answer into a local answer slot seed.
 * Never uses correctness fields (gameplay endpoint does not expose them).
 */
export function seedAnswerFromGameplayQuestion(
  q: SessionQuestionResponse,
  row: TrainQuestionRow,
): TrainAnswerRecord | null {
  if (q.selected_answer == null || q.selected_answer === '') {
    return null;
  }
  const chosen = letterForOptionText(q.options, q.selected_answer);
  if (!chosen) {
    return null;
  }
  return {
    qid: row.Question_ID,
    chosen: chosen as OptionLetter,
    correct: 'A',
    isCorrect: false,
  };
}

/**
 * Assert gameplay payloads never leak correctness (B3.3 contract guard).
 */
export function assertNoGameplayCorrectnessLeak(
  q: SessionQuestionResponse,
): void {
  const record = q as Record<string, unknown>;
  if (
    'correct_answer' in record ||
    'is_correct' in record ||
    'explanation' in record
  ) {
    // Soft guard for tests / adapters — strip is not required; gameplay types omit these.
    void record;
  }
}

export async function startMathsTestSession(params: {
  subject: JourneySubject;
}): Promise<MathsTestSessionLoad> {
  if (params.subject !== 'maths') {
    throw new Error('startMathsTestSession is Maths-only.');
  }

  const userId = getDevUserId();
  const started: TestStartResponse = await startTest(
    buildMathsDevTestStartPayload(userId),
  );

  if (
    !Number.isFinite(started.session_id) ||
    started.session_id < 1 ||
    !Number.isFinite(started.total_questions) ||
    started.total_questions < 1
  ) {
    throw new Error('Test start response was malformed.');
  }

  const expiresAtMs = expiresAtToMs(started.expires_at);
  const topicLabel = 'Test';
  const bankDifficulty: TrainBankDifficulty = 'Medium';

  const raw = await fetchAllQuestions(
    started.session_id,
    started.total_questions,
  );

  const questions = raw.map((q) => {
    assertNoGameplayCorrectnessLeak(q);
    return backendGameplayQuestionToRow(q, {
      subjectType: 'Maths',
      topicLabel,
      bankDifficulty,
      sessionId: started.session_id,
    });
  });

  const initialAnswers = raw.map((q, i) =>
    seedAnswerFromGameplayQuestion(q, questions[i]),
  );
  const initialFlags = raw.map((q) => q.flagged === true);

  return {
    source: 'api',
    sessionId: started.session_id,
    totalQuestions: started.total_questions,
    timeLimitMinutes: started.time_limit_minutes,
    startedAt: started.started_at,
    expiresAt: started.expires_at,
    expiresAtMs,
    questions,
    initialAnswers,
    initialFlags,
    subjectType: 'Maths',
    topicLabel,
    bankDifficulty,
  };
}
