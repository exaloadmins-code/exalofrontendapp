/**
 * Lovable FocusMode setup copy + visual tokens (`pages/FocusMode.tsx`).
 * Gameplay / results reuse Train QuizPlayer tokens (`trainGameplay` / `trainResults`).
 */

export const FOCUS_QUESTIONS_PER_RUN = 20;

export const FOCUS_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type FocusDifficulty = (typeof FOCUS_DIFFICULTIES)[number];

export const FOCUS_COPY = {
  title: 'Focus Mode',
  intro:
    'Choose the topics and difficulty levels you want to practise.',
  topicsHeading: 'Topics',
  selectAll: 'Select all',
  clearAll: 'Clear all',
  difficultyHeading: 'Difficulty',
  start: (topicCount: number) => `Start (${topicCount} topics)`,
  loading: 'Loading…',
  missingSubjectTitle: 'Focus unavailable',
  missingSubjectBody:
    'Choose Maths or English Focus from Journey to continue.',
  goBack: 'Go back',
} as const;

export const FOCUS = {
  background: '#070421',
  contentMaxWidth: 672, // max-w-2xl
  panel: 'rgba(26, 23, 72, 0.8)',
  panelBorder: 'rgba(139, 92, 255, 0.4)',
  topicRowBg: 'rgba(15, 11, 52, 0.7)',
  topicRowBorder: 'rgba(139, 92, 255, 0.3)',
  topicRowBorderActive: 'rgba(167, 139, 250, 1)',
  checkboxBorder: 'rgba(139, 92, 255, 0.5)',
  checkboxCheckedBg: '#7C3AED',
  backBtnBg: '#1a1748',
  backBtnBorder: 'rgba(139, 92, 255, 0.4)',
  subjectEyebrow: 'rgba(196, 181, 253, 0.8)',
  intro: 'rgba(221, 214, 254, 0.8)',
  selectAll: '#C4B5FD',
  diffOnBg: '#7C3AED',
  diffOnBorder: '#A78BFA',
  diffOffBg: 'rgba(15, 11, 52, 0.7)',
  diffOffBorder: 'rgba(139, 92, 255, 0.3)',
  diffOffText: 'rgba(221, 214, 254, 0.9)',
  errorBg: 'rgba(244, 63, 94, 0.15)',
  errorBorder: 'rgba(251, 113, 133, 0.4)',
  errorText: '#FFE4E6',
  ctaFrom: '#8B5CF6',
  ctaTo: '#6D28D9',
  ctaBorder: '#A78BFA',
  /** Tailwind `sm` breakpoint for 2-column topic grid. */
  topicGridSmMinWidth: 640,
} as const;
