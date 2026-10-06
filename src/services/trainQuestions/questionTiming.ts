/**
 * Cumulative active per-question timing for Maths Focus analytics.
 *
 * Semantics:
 * - Accumulates only while app is ACTIVE and a question is visible
 * - Navigation flushes the question being left, then resumes the new one
 * - Revisit adds to prior cumulative (not delta-only, not reset)
 * - Background / inactive time is excluded
 * - Independent of whether an answer is selected
 * - freezeForCompletion builds final question_times for ALL session questions
 */

export type FocusQuestionTimeEntry = {
  question_number: number;
  time_spent_seconds: number;
};

export class FocusQuestionTiming {
  private readonly cumulativeSecondsByQuestion = new Map<number, number>();
  private activeQuestionIndex: number | null = null;
  private activeQuestionStartedAtMs: number | null = null;
  private appActive = true;
  private frozen = false;

  reset(): void {
    this.cumulativeSecondsByQuestion.clear();
    this.activeQuestionIndex = null;
    this.activeQuestionStartedAtMs = null;
    this.appActive = true;
    this.frozen = false;
  }

  /** AppState active ↔ inactive/background. */
  setAppActive(active: boolean): void {
    if (this.frozen) {
      return;
    }
    if (!active && this.appActive) {
      this.flushActiveSegment();
      this.appActive = false;
      this.activeQuestionStartedAtMs = null;
      return;
    }
    if (active && !this.appActive) {
      this.appActive = true;
      if (this.activeQuestionIndex != null) {
        this.activeQuestionStartedAtMs = Date.now();
      }
    }
  }

  /**
   * Switch visible question (Back / Next / jump).
   * Flushes the previous question, then starts/resumes the new one if active.
   */
  setVisibleQuestion(sessionIndex: number): void {
    if (this.frozen) {
      return;
    }
    if (!Number.isInteger(sessionIndex) || sessionIndex < 0) {
      throw new Error(`Invalid Focus timing question index: ${sessionIndex}`);
    }
    if (this.activeQuestionIndex === sessionIndex) {
      if (
        this.appActive &&
        this.activeQuestionStartedAtMs == null &&
        !this.frozen
      ) {
        this.activeQuestionStartedAtMs = Date.now();
      }
      return;
    }
    this.flushActiveSegment();
    this.activeQuestionIndex = sessionIndex;
    this.activeQuestionStartedAtMs =
      this.appActive && !this.frozen ? Date.now() : null;
  }

  /**
   * Authoritative cumulative seconds for a question.
   * Flushes the active segment first when querying the visible question.
   */
  getCumulativeSeconds(sessionIndex: number): number {
    if (sessionIndex === this.activeQuestionIndex && !this.frozen) {
      this.flushActiveSegment();
      if (this.appActive && this.activeQuestionIndex === sessionIndex) {
        this.activeQuestionStartedAtMs = Date.now();
      }
    }
    return this.cumulativeSecondsByQuestion.get(sessionIndex) ?? 0;
  }

  /**
   * Flush + freeze. Returns 1-based question_times for every session question
   * (including unanswered / never-visited → 0).
   */
  freezeForCompletion(totalQuestions: number): FocusQuestionTimeEntry[] {
    if (!Number.isInteger(totalQuestions) || totalQuestions < 0) {
      throw new Error(`Invalid Focus totalQuestions: ${totalQuestions}`);
    }
    this.flushActiveSegment();
    this.frozen = true;
    this.activeQuestionStartedAtMs = null;
    const out: FocusQuestionTimeEntry[] = [];
    for (let i = 0; i < totalQuestions; i += 1) {
      out.push({
        question_number: i + 1,
        time_spent_seconds: this.cumulativeSecondsByQuestion.get(i) ?? 0,
      });
    }
    return out;
  }

  private flushActiveSegment(): void {
    if (
      this.frozen ||
      !this.appActive ||
      this.activeQuestionIndex == null ||
      this.activeQuestionStartedAtMs == null
    ) {
      return;
    }
    const elapsedSec = Math.max(
      0,
      Math.floor((Date.now() - this.activeQuestionStartedAtMs) / 1000),
    );
    const prev =
      this.cumulativeSecondsByQuestion.get(this.activeQuestionIndex) ?? 0;
    this.cumulativeSecondsByQuestion.set(
      this.activeQuestionIndex,
      prev + elapsedSec,
    );
    this.activeQuestionStartedAtMs = null;
  }
}
