/**
 * Lovable QuizPlayer finished-state copy + tokens (`components/QuizPlayer.tsx`).
 */
export const TRAIN_RESULTS_COPY = {
  titleSuffix: '— Results',
  scoreLine: (correct: number, total: number, pct: number) =>
    `${correct} / ${total} correct · ${pct}%`,
  reviewLine: (index: number, chosen: string, correct: string) =>
    `Q${index} — you chose ${chosen} · correct ${correct}`,
  /** Test timeout partial paper — no fabricated choice letter. */
  unansweredLine: (index: number) => `Q${index} — Unanswered`,
  tryAgain: 'Try again',
  home: 'Home',
  missingTitle: 'Results unavailable',
  missingBody:
    'No Train result is available in memory. Finish a Train run and tap See results, or return to Train selection.',
  goBack: 'Go back',
} as const;

export const TRAIN_RESULTS = {
  background: '#070421',
  contentMaxWidth: 672,
  scoreColor: 'rgba(221, 214, 254, 0.8)',
  rowCorrectBg: 'rgba(16, 185, 129, 0.1)',
  rowCorrectBorder: 'rgba(16, 185, 129, 0.4)',
  rowWrongBg: 'rgba(244, 63, 94, 0.1)',
  rowWrongBorder: 'rgba(244, 63, 94, 0.4)',
  rowUnansweredBg: 'rgba(139, 92, 255, 0.1)',
  rowUnansweredBorder: 'rgba(139, 92, 255, 0.35)',
  unansweredIcon: 'rgba(196, 181, 253, 0.9)',
  cta: '#7C3AED',
  homeBg: '#1a1748',
  homeBorder: 'rgba(139, 92, 255, 0.4)',
  panelBorder: 'rgba(139, 92, 255, 0.4)',
} as const;
