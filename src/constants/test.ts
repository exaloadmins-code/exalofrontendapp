/**
 * Lovable TestMode copy + visual tokens (`pages/TestMode.tsx`).
 * Gameplay / results reuse Train QuizPlayer tokens (`trainGameplay` / `trainResults`).
 *
 * TIMER: intentional Exalo production departure from Lovable (Lovable has no Test timer).
 */

/** Lovable `perTopic = 2` → 10 topics × 2 = 20 question mock paper. */
export const TEST_QUESTIONS_PER_TOPIC = 2;

/**
 * TEMPORARY testing duration for Exalo production Test Mode.
 * Change this single constant later (e.g. 5 → 20) without rewriting timer logic.
 * Planned production target: 20 minutes.
 */
export const TEST_DURATION_MINUTES = 5;

export const TEST_DURATION_SECONDS = TEST_DURATION_MINUTES * 60;
export const TEST_DURATION_MS = TEST_DURATION_SECONDS * 1000;

/**
 * Product-spec instruction copy / display values for the Test Instructions screen.
 * Runtime Test configuration (paper size, timer) will be updated in a separate milestone.
 * Do NOT wire Start Test / gameplay to these numbers yet.
 */
export const TEST_INSTRUCTIONS_DISPLAY = {
  questionCount: 45,
  durationMinutes: 45,
} as const;

export const TEST_COPY = {
  loading: (subjectType: string) => `Building your ${subjectType} mock paper…`,
  errorTitle: "Couldn't load test",
  back: 'Back',
  missingSubjectTitle: 'Test unavailable',
  missingSubjectBody:
    'Choose Maths or English Test from Journey to continue.',
  goBack: 'Go back',
  title: (subjectType: string) => `Test Mode · ${subjectType}`,
  subtitle: (loaded: number, expected: number) =>
    `Balanced mock paper — ${loaded} of ${expected} questions across all topics`,
  /** Pre-test instructions (shown before Start Test). */
  instructionsEyebrow: 'Test mode',
  instructionsHeading: 'Before you launch',
  instructionsIntro: (subjectType: string) =>
    `Ready for your ${subjectType} mock test?`,
  startTest: 'Start Test',
  startingTest: 'Starting…',
  statQuestionsLabel: 'Questions',
  statMinutesLabel: 'Minutes',
  /** Learner-safe Maths API start failure — never surface URL/env/stack. */
  startErrorTitle: "Couldn't start test",
  startErrorBody:
    'We could not start your Maths test right now. Please try again in a moment.',
  /** Learner-safe Maths API finish / results failure. */
  finishErrorTitle: "Couldn't finish test",
  finishErrorBody:
    'We could not save your test results right now. Please try again.',
  /**
   * Behavioral bullets only — match current Test gameplay.
   * Question count / duration are shown separately via TEST_INSTRUCTIONS_DISPLAY.
   */
  instructionBullets: [
    'Choose one answer for each question — or skip and come back later.',
    'Move freely with Previous, Next, or the question navigator.',
    'Flag questions for review — flagging does not affect your score.',
    'Unanswered questions score 0.',
    "When time runs out, your test ends automatically and you'll see your results.",
    'You can finish early even if some questions are unanswered or flagged.',
  ] as const,
  finishTest: 'Finish test',
  flagForReviewLabel: 'Flag for review',
  flaggedLabel: 'Flagged for review',
  flagShort: 'Flag',
  flaggedShort: 'Flagged',
} as const;

export const TEST = {
  background: '#070421',
  loadingText: 'rgba(221, 214, 254, 0.9)',
  panel: 'rgba(26, 23, 72, 0.8)',
  panelBorder: 'rgba(139, 92, 255, 0.4)',
  errorBorder: 'rgba(244, 63, 94, 0.4)',
  errorText: 'rgba(254, 205, 211, 0.9)',
  cta: '#7C3AED',
  emptyMaxWidth: 448,
  /** Countdown text in Test gameplay header. */
  timerText: '#FDE68A',
  timerUrgent: '#FDA4AF',
} as const;

/** Format remaining whole seconds as `MM:SS` (e.g. 05:00, 00:07). */
export function formatTestCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
