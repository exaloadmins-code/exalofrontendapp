/**
 * Lovable QuizPlayer visual tokens (`components/QuizPlayer.tsx`).
 * Gameplay is composable — these are screen-local, not global theme overrides.
 */
export const TRAIN_GAMEPLAY = {
  background: '#070421',
  cardFrom: 'rgba(26, 23, 72, 0.95)',
  cardTo: 'rgba(15, 11, 52, 0.95)',
  cardBorder: 'rgba(139, 92, 255, 0.4)',
  cardShadow: 'rgba(139, 92, 246, 0.5)',
  panel: '#1a1748',
  panelBorder: 'rgba(139, 92, 255, 0.4)',
  optionBg: 'rgba(15, 11, 52, 0.7)',
  optionBorder: 'rgba(139, 92, 255, 0.3)',
  optionHoverBg: '#181149',
  badgeBg: 'rgba(139, 92, 255, 0.4)',
  badgeBorder: 'rgba(167, 139, 250, 0.5)',
  violetMuted: 'rgba(196, 181, 253, 0.8)',
  violetSoft: 'rgba(221, 214, 254, 0.7)',
  violetText: 'rgba(221, 214, 254, 0.8)',
  cta: '#7C3AED',
  ctaHover: '#8B5CF6',
  correctBg: 'rgba(16, 185, 129, 0.2)',
  correctBorder: '#34D399',
  correctBannerBg: 'rgba(16, 185, 129, 0.15)',
  correctBannerBorder: 'rgba(52, 211, 153, 0.4)',
  correctText: '#D1FAE5',
  correctIcon: '#6EE7B7',
  wrongBg: 'rgba(244, 63, 94, 0.2)',
  wrongBorder: '#FB7185',
  wrongIcon: '#FDA4AF',
  errorBorder: 'rgba(244, 63, 94, 0.4)',
  errorText: 'rgba(254, 205, 211, 0.9)',
  explainBg: 'rgba(245, 158, 11, 0.1)',
  explainBorder: 'rgba(251, 191, 36, 0.4)',
  explainText: '#FEF3C7',
  contentMaxWidth: 672, // max-w-2xl
  emptyMaxWidth: 448, // max-w-md
} as const;

export const TRAIN_GAMEPLAY_COPY = {
  correctBanner: 'Correct! Nice work.',
  explanationTitle: 'Explanation',
  nextQuestion: 'Next question',
  seeResults: 'See results',
  loading: 'Loading questions…',
  emptyTitle: 'No questions found',
  emptyBody:
    'The Questions table returned no rows for this selection. Check that `Subject_Type`, `Subject` and `Difficulty` values match exactly.',
  errorTitle: "Couldn't load questions",
  goBack: 'Go back',
  back: 'Back',
} as const;
