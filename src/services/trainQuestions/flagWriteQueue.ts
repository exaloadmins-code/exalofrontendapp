/**
 * Per-question serialized latest-write queue for Maths Test flag POSTs.
 * Mirrors answerWriteQueue latest-wins semantics.
 */

import { flagTestQuestion } from '@/services/api/testApi';
import { toBackendQuestionNumber } from '@/services/trainQuestions/numbering';

type QueueItem = {
  sessionIndex: number;
  flagged: boolean;
  generation: number;
};

export class TestFlagWriteQueue {
  private readonly sessionId: number;
  private readonly generations = new Map<number, number>();
  private readonly tails = new Map<number, Promise<void>>();
  private readonly latestFlagged = new Map<number, boolean>();

  constructor(sessionId: number) {
    this.sessionId = sessionId;
  }

  enqueue(sessionIndex: number, flagged: boolean): Promise<void> {
    const generation = (this.generations.get(sessionIndex) ?? 0) + 1;
    this.generations.set(sessionIndex, generation);
    this.latestFlagged.set(sessionIndex, flagged);

    const item: QueueItem = { sessionIndex, flagged, generation };
    const prev = this.tails.get(sessionIndex) ?? Promise.resolve();
    const next = prev
      .catch(() => undefined)
      .then(() => this.flush(item));
    this.tails.set(sessionIndex, next);
    return next;
  }

  async drain(): Promise<void> {
    const pending = [...this.tails.values()];
    await Promise.all(pending.map((p) => p.catch(() => undefined)));
    const again = [...this.tails.values()];
    await Promise.all(again.map((p) => p.catch(() => undefined)));
  }

  private async flush(item: QueueItem): Promise<void> {
    if (this.generations.get(item.sessionIndex) !== item.generation) {
      return;
    }
    const flagged =
      this.latestFlagged.get(item.sessionIndex) ?? item.flagged;
    await flagTestQuestion({
      session_id: this.sessionId,
      question_number: toBackendQuestionNumber(item.sessionIndex),
      flagged,
    });
  }
}
