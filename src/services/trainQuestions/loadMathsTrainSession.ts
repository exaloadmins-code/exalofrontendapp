/**
 * Maths Train API session loader — continuous pages of up to 20.
 * English continues to use loadTrainQuestions (local).
 */

import { getDevUserId } from '@/config/env';
import {
  formatEmptyPoolMessage,
  isEmptyPoolError,
} from '@/services/api/http';
import {
  continueTrainSession,
  getTrainQuestion,
  startTrain,
  type TrainQuestionResponse,
} from '@/services/api/trainApi';
import { backendGameplayQuestionToRow } from '@/services/trainQuestions/backendAdapter';
import type {
  TrainBankDifficulty,
  TrainQuestionRow,
  TrainSubjectType,
} from '@/services/trainQuestions/types';
import type { TrainDifficulty } from '@/constants/train';
import { normalizeTrainDifficulty, trainTopicLabel } from '@/constants/train';
import type { JourneySubject } from '@/constants/journey';

export type MathsTrainSessionLoad = {
  source: 'api';
  sessionId: number;
  totalQuestions: number;
  pageSize: number;
  addedCount: number;
  hasMore: boolean;
  questions: TrainQuestionRow[];
  subjectType: TrainSubjectType;
  topicLabel: string;
  bankDifficulty: TrainBankDifficulty;
};

export type MathsTrainContinueLoad = {
  sessionId: number;
  addedCount: number;
  addedFromQuestionNumber: number;
  addedToQuestionNumber: number;
  totalQuestions: number;
  pageSize: number;
  hasMore: boolean;
  /** Newly appended page rows only (not the full session). */
  questions: TrainQuestionRow[];
};

function toBankDifficulty(raw: TrainDifficulty | string): TrainBankDifficulty {
  const d = normalizeTrainDifficulty(raw);
  if (d === 'hard') return 'Hard';
  if (d === 'medium') return 'Medium';
  return 'Easy';
}

async function fetchQuestionRange(
  sessionId: number,
  fromNumber: number,
  toNumber: number,
): Promise<TrainQuestionResponse[]> {
  const questions: TrainQuestionResponse[] = [];
  for (let n = fromNumber; n <= toNumber; n += 1) {
    questions.push(await getTrainQuestion(sessionId, n));
  }
  return questions;
}

function mapRows(
  sessionId: number,
  payload: TrainQuestionResponse[],
  topicLabel: string,
  bankDifficulty: TrainBankDifficulty,
): TrainQuestionRow[] {
  return payload.map((q) =>
    backendGameplayQuestionToRow(q, {
      subjectType: 'Maths',
      topicLabel,
      bankDifficulty,
      sessionId,
    }),
  );
}

export async function startMathsTrainSession(params: {
  subject: JourneySubject;
  topicSlug: string;
  difficulty: TrainDifficulty | string;
}): Promise<MathsTrainSessionLoad> {
  if (params.subject !== 'maths') {
    throw new Error('startMathsTrainSession is Maths-only.');
  }
  const topicLabel = trainTopicLabel(params.subject, params.topicSlug);
  if (!topicLabel) {
    throw new Error(`Unknown Maths topic slug "${params.topicSlug}".`);
  }
  const bankDifficulty = toBankDifficulty(params.difficulty);
  const userId = getDevUserId();

  let started;
  try {
    started = await startTrain({
      user_id: userId,
      subject: 'maths',
      topic: params.topicSlug,
      difficulty: normalizeTrainDifficulty(params.difficulty),
    });
  } catch (err) {
    if (isEmptyPoolError(err)) {
      throw new Error(formatEmptyPoolMessage(err.body));
    }
    throw err;
  }

  const raw = await fetchQuestionRange(
    started.session_id,
    1,
    started.total_questions,
  );
  return {
    source: 'api',
    sessionId: started.session_id,
    totalQuestions: started.total_questions,
    pageSize: started.page_size,
    addedCount: started.added_count,
    hasMore: started.has_more,
    questions: mapRows(started.session_id, raw, topicLabel, bankDifficulty),
    subjectType: 'Maths',
    topicLabel,
    bankDifficulty,
  };
}

export async function continueMathsTrainSession(params: {
  sessionId: number;
  subject: JourneySubject;
  topicSlug: string;
  difficulty: TrainDifficulty | string;
}): Promise<MathsTrainContinueLoad> {
  if (params.subject !== 'maths') {
    throw new Error('continueMathsTrainSession is Maths-only.');
  }
  const topicLabel = trainTopicLabel(params.subject, params.topicSlug);
  if (!topicLabel) {
    throw new Error(`Unknown Maths topic slug "${params.topicSlug}".`);
  }
  const bankDifficulty = toBankDifficulty(params.difficulty);
  const cont = await continueTrainSession(params.sessionId);
  if (cont.session_id !== params.sessionId) {
    throw new Error('Train continue returned a different session_id.');
  }
  if (cont.added_count <= 0) {
    throw new Error('Train continue added no questions.');
  }
  const raw = await fetchQuestionRange(
    cont.session_id,
    cont.added_from_question_number,
    cont.added_to_question_number,
  );
  return {
    sessionId: cont.session_id,
    addedCount: cont.added_count,
    addedFromQuestionNumber: cont.added_from_question_number,
    addedToQuestionNumber: cont.added_to_question_number,
    totalQuestions: cont.total_questions,
    pageSize: cont.page_size,
    hasMore: cont.has_more,
    questions: mapRows(cont.session_id, raw, topicLabel, bankDifficulty),
  };
}
