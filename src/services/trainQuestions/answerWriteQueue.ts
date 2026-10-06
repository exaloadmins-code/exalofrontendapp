/**
 * Per-question serialized latest-write queue for Maths Train / Focus answer POSTs.
 *
 * Prevents an older in-flight POST from overwriting a newer selection.
 * Default writer preserves Train `/train/answer` behaviour.
 */

import { answerFocusQuestion } from '@/services/api/focusApi';
import { answerTrainQuestion } from '@/services/api/trainApi';
import { toBackendQuestionNumber } from '@/services/trainQuestions/numbering';
import { optionTextForLetter } from '@/services/trainQuestions/optionAdapter';
import type { OptionLetter } from '@/services/trainQuestions/types';

export type AnswerWritePayload = {
  session_id: number;
  question_number: number;
  selected_answer: string;
  time_spent_seconds?: number;
};

export type AnswerWriter = (payload: AnswerWritePayload) => Promise<unknown>;

type QueueItem = {
  sessionIndex: number;
  letter: OptionLetter;
  options: readonly string[];
  generation: number;
};

const defaultTrainWriter: AnswerWriter = (payload) =>
  answerTrainQuestion({
    session_id: payload.session_id,
    question_number: payload.question_number,
    selected_answer: payload.selected_answer,
  });

const focusAnswerWriter: AnswerWriter = (payload) =>
  answerFocusQuestion({
    session_id: payload.session_id,
    question_number: payload.question_number,
    selected_answer: payload.selected_answer,
    time_spent_seconds: payload.time_spent_seconds,
  });

export class TrainAnswerWriteQueue {
  private readonly sessionId: number;
  private readonly writer: AnswerWriter;
  private readonly getTimeSpentSeconds?: (sessionIndex: number) => number;
  private readonly generations = new Map<number, number>();
  private readonly tails = new Map<number, Promise<void>>();
  private readonly latestLetter = new Map<number, OptionLetter>();

  constructor(
    sessionId: number,
    writer: AnswerWriter = defaultTrainWriter,
    getTimeSpentSeconds?: (sessionIndex: number) => number,
  ) {
    this.sessionId = sessionId;
    this.writer = writer;
    this.getTimeSpentSeconds = getTimeSpentSeconds;
  }

  /** Factory: Focus answer endpoint + optional cumulative timing. */
  static forFocus(
    sessionId: number,
    getTimeSpentSeconds?: (sessionIndex: number) => number,
  ): TrainAnswerWriteQueue {
    return new TrainAnswerWriteQueue(
      sessionId,
      focusAnswerWriter,
      getTimeSpentSeconds,
    );
  }

  /** Enqueue a letter selection; returns when this write attempt settles (may no-op if superseded). */
  enqueue(
    sessionIndex: number,
    letter: OptionLetter,
    options: readonly string[],
  ): Promise<void> {
    const generation = (this.generations.get(sessionIndex) ?? 0) + 1;
    this.generations.set(sessionIndex, generation);
    this.latestLetter.set(sessionIndex, letter);

    const item: QueueItem = { sessionIndex, letter, options, generation };
    const prev = this.tails.get(sessionIndex) ?? Promise.resolve();
    const next = prev
      .catch(() => undefined)
      .then(() => this.flush(item));
    this.tails.set(sessionIndex, next);
    return next;
  }

  /** Wait until every per-question chain is idle. */
  async drain(): Promise<void> {
    const pending = [...this.tails.values()];
    await Promise.all(pending.map((p) => p.catch(() => undefined)));
    // Catch any writes enqueued during the first drain.
    const again = [...this.tails.values()];
    await Promise.all(again.map((p) => p.catch(() => undefined)));
  }

  private async flush(item: QueueItem): Promise<void> {
    if (this.generations.get(item.sessionIndex) !== item.generation) {
      return;
    }
    const letter = this.latestLetter.get(item.sessionIndex) ?? item.letter;
    const text = optionTextForLetter(item.options, letter);
    const questionNumber = toBackendQuestionNumber(item.sessionIndex);
    const timeSpent = this.getTimeSpentSeconds?.(item.sessionIndex);
    await this.writer({
      session_id: this.sessionId,
      question_number: questionNumber,
      selected_answer: text,
      ...(typeof timeSpent === 'number' ? { time_spent_seconds: timeSpent } : {}),
    });
  }
}
