/**
 * Maths Focus API session loader — exact question_count unique questions.
 * English Focus continues to use loadFocusQuestions (local). No local Maths fallback.
 */

import { getDevUserId } from '@/config/env';
import {
  formatFocusInsufficientPoolMessage,
  isFocusInsufficientPoolError,
  ApiError,
} from '@/services/api/http';
import { startFocus } from '@/services/api/focusApi';
import {
  getSessionQuestion,
  type SessionQuestionResponse,
} from '@/services/api/sessionApi';
import { backendGameplayQuestionToRow } from '@/services/trainQuestions/backendAdapter';
import type {
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from '@/services/trainQuestions/types';
import type { FocusDifficulty } from '@/constants/focus';
import { isValidFocusQuestionCount } from '@/constants/focus';
import type { JourneySubject } from '@/constants/journey';
import { trainTopicsFor } from '@/constants/train';

export type MathsFocusSessionLoad = {
  source: 'api';
  sessionId: number;
  totalQuestions: number;
  questionCount: number;
  topics: string[];
  difficulty: string;
  questions: TrainQuestionRow[];
  subjectType: TrainSubjectType;
  topicLabel: string;
  bankDifficulty: TrainBankDifficulty;
};

function toBankDifficulty(raw: FocusDifficulty | string): TrainBankDifficulty {
  const v = String(raw).trim().toLowerCase();
  if (v === 'hard') return 'Hard';
  if (v === 'medium') return 'Medium';
  return 'Easy';
}

function difficultyApiValue(raw: FocusDifficulty | string): string {
  return String(raw).trim().toLowerCase();
}

function resolveTopicSlugs(
  subject: JourneySubject,
  topicLabels: string[],
): string[] {
  const catalogue = trainTopicsFor(subject);
  const byLabel = new Map(catalogue.map((t) => [t.label, t.slug]));
  const slugs: string[] = [];
  for (const label of topicLabels) {
    const slug = byLabel.get(label);
    if (!slug) {
      throw new Error(`Unknown topic "${label}" for Maths Focus.`);
    }
    slugs.push(slug);
  }
  return slugs;
}

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

export async function startMathsFocusSession(params: {
  subject: JourneySubject;
  topicLabels: string[];
  difficulty: FocusDifficulty;
  questionCount: number;
}): Promise<MathsFocusSessionLoad> {
  if (params.subject !== 'maths') {
    throw new Error('startMathsFocusSession is Maths-only.');
  }
  if (params.topicLabels.length < 2 || params.topicLabels.length > 10) {
    throw new Error('Focus requires between 2 and 10 topics.');
  }
  if (!isValidFocusQuestionCount(params.questionCount)) {
    throw new Error(
      'Focus question count must be an integer from 5 to 50 inclusive.',
    );
  }

  const topicSlugs = resolveTopicSlugs(params.subject, params.topicLabels);
  const bankDifficulty = toBankDifficulty(params.difficulty);
  const topicLabel =
    params.topicLabels.length <= 2
      ? params.topicLabels.join(' · ')
      : `${params.topicLabels.length} topics`;
  const userId = getDevUserId();

  let started;
  try {
    started = await startFocus({
      user_id: userId,
      subject: 'maths',
      topics: topicSlugs,
      difficulty: difficultyApiValue(params.difficulty),
      question_count: params.questionCount,
    });
  } catch (err) {
    if (isFocusInsufficientPoolError(err)) {
      // Preserve ApiError + structured body so Focus can title the Train-style prompt.
      throw new ApiError(
        formatFocusInsufficientPoolMessage(err.body),
        err.status,
        err.body,
      );
    }
    throw err;
  }

  if (started.total_questions !== params.questionCount) {
    throw new Error(
      `Focus start returned ${started.total_questions} questions; expected ${params.questionCount}.`,
    );
  }

  const raw = await fetchAllQuestions(
    started.session_id,
    started.total_questions,
  );
  const questions = raw.map((q) =>
    backendGameplayQuestionToRow(q, {
      subjectType: 'Maths',
      topicLabel,
      bankDifficulty,
      sessionId: started.session_id,
    }),
  );

  return {
    source: 'api',
    sessionId: started.session_id,
    totalQuestions: started.total_questions,
    questionCount: started.question_count,
    topics: started.topics,
    difficulty: started.difficulty,
    questions,
    subjectType: 'Maths',
    topicLabel,
    bankDifficulty,
  };
}
