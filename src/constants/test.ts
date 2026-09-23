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
    `Balanced mock paper — ${loaded} of ${expected} questions across all 10 topics`,
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
