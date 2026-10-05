/**
 * Shared Results copy + visual tokens (Train / Focus / Test).
 * Correctness is revealed here only — never during gameplay.
 *
 * Colorful “space mission complete” tokens are presentation-only.
 * Scoring / review logic lives in services/trainResults.ts and must not
 * be driven by these strings or colors.
 */
export const TRAIN_RESULTS_COPY = {
  missionComplete: 'Mission complete!',
  /** Compact score line retained for accessibility / fallbacks. */
  scoreLine: (correct: number, total: number, pct: number) =>
    `${correct} / ${total} correct · ${pct}%`,
  summaryPercentLabel: 'Accuracy',
  summaryCorrect: 'Correct',
  summaryWrong: 'Wrong',
  summaryUnanswered: 'Unanswered',
  summaryTotalSubtle: (total: number) => `${total} questions in this session`,
  missionReviewEyebrow: 'Mission review',
  reviewHeading: 'Questions to review',
  reviewSubtitleOne: '1 question needs another look',
  reviewSubtitleMany: (count: number) =>
    `${count} questions need another look`,
  reviewBreakdown: (wrong: number, unanswered: number) =>
    `${wrong} wrong · ${unanswered} unanswered`,
  topicNeedsOne: '1 question to review',
  topicNeedsMany: (count: number) => `${count} questions to review`,
  legendWrong: 'Wrong',
  legendUnanswered: 'Unanswered',
  /** Fallback when question.Subject is missing — not a curriculum name. */
  topicUnavailable: 'Topic unavailable',
  chipIncorrectA11y: (n: number) => `Question ${n}, incorrect`,
  chipUnansweredA11y: (n: number) => `Question ${n}, unanswered`,
  closeDetail: 'Close',
  doneDetail: 'Done',
  previous: 'Previous',
  next: 'Next',
  detailPosition: (current: number, total: number) =>
    `${current} of ${total}`,
  statusIncorrect: 'Incorrect',
  statusUnanswered: 'Unanswered',
  yourAnswer: 'Your answer',
  notAnswered: 'Not answered',
  correctAnswer: 'Correct answer',
  questionLabel: 'Question',
  explanation: "Let's learn",
  encouragePerfectTitle: 'Outstanding work!',
  encouragePerfectBody: 'You got every question right!',
  encourageHighTitle: 'Amazing mission!',
  encourageHighBody: 'You’re doing brilliantly — keep going!',
  encourageMidTitle: 'Great progress!',
  encourageMidBody: 'You’re getting stronger with every mission!',
  encourageLowTitle: 'Keep going!',
  encourageLowBody: 'Every question you review makes you stronger!',
  /** Short single-line fallback retained for a11y / older call sites. */
  encouragePerfect: 'Perfect mission!',
  encourageHigh: 'Amazing mission!',
  encourageMid: 'Great progress!',
  encourageLow: 'Keep going!',
  perfectTitle: 'Perfect mission!',
  perfectBody: 'Nothing to review — fantastic work!',
  /**
   * Wrong = 0 but unanswered remain — Mission Review has no cards,
   * but this is NOT a perfect result.
   */
  noWrongReviewTitle: 'Nothing incorrect to review',
  noWrongReviewBody:
    'Unanswered questions still count in your score — see the summary above.',
  nextMissionHeading: 'Ready for another mission?',
  tryAgain: 'Try again',
  home: 'Home',
  missingTitle: 'Results unavailable',
  missingBody:
    'No Train result is available in memory. Finish a Train run and tap See results, or return to Train selection.',
  goBack: 'Go back',
  starsA11y: (earned: number) =>
    `${earned} of 3 performance stars earned`,
} as const;

export type TrainResultsEncouragement = {
  title: string;
  body: string;
};

/** Presentation-only encouragement (does not affect scoring). */
export function trainResultsEncouragementBanner(
  percent: number,
): TrainResultsEncouragement {
  if (percent >= 100) {
    return {
      title: TRAIN_RESULTS_COPY.encouragePerfectTitle,
      body: TRAIN_RESULTS_COPY.encouragePerfectBody,
    };
  }
  if (percent >= 75) {
    return {
      title: TRAIN_RESULTS_COPY.encourageHighTitle,
      body: TRAIN_RESULTS_COPY.encourageHighBody,
    };
  }
  if (percent >= 50) {
    return {
      title: TRAIN_RESULTS_COPY.encourageMidTitle,
      body: TRAIN_RESULTS_COPY.encourageMidBody,
    };
  }
  return {
    title: TRAIN_RESULTS_COPY.encourageLowTitle,
    body: TRAIN_RESULTS_COPY.encourageLowBody,
  };
}

/** @deprecated Prefer trainResultsEncouragementBanner — kept for compatibility. */
export function trainResultsEncouragement(percent: number): string {
  return trainResultsEncouragementBanner(percent).title;
}

/**
 * Session decoration only — not XP, not storage, not badges.
 * 0–49% → 1 star, 50–74% → 2, 75–100% → 3.
 */
export function trainResultsPerformanceStars(percent: number): number {
  if (percent >= 75) return 3;
  if (percent >= 50) return 2;
  return 1;
}

export const TRAIN_RESULTS = {
  background: '#070421',
  contentMaxWidth: 672,
  scoreColor: 'rgba(221, 214, 254, 0.85)',
  cardBg: 'rgba(26, 23, 72, 0.88)',
  cardBorder: 'rgba(139, 92, 255, 0.4)',
  rowCorrectBg: 'rgba(16, 185, 129, 0.14)',
  rowCorrectBorder: 'rgba(52, 211, 153, 0.55)',
  rowWrongBg: 'rgba(244, 63, 94, 0.14)',
  rowWrongBorder: 'rgba(251, 113, 133, 0.55)',
  rowUnansweredBg: 'rgba(245, 158, 11, 0.14)',
  rowUnansweredBorder: 'rgba(251, 191, 36, 0.55)',
  unansweredIcon: 'rgba(252, 211, 77, 0.95)',
  correctAccent: '#34D399',
  wrongAccent: '#FB7185',
  unansweredAccent: '#FBBF24',
  mutedText: 'rgba(221, 214, 254, 0.75)',
  labelText: 'rgba(196, 181, 253, 0.9)',
  heroAccent: '#C4B5FD',
  explainBg: 'rgba(99, 102, 241, 0.14)',
  explainBorder: 'rgba(129, 140, 248, 0.45)',
  perfectBg: 'rgba(16, 185, 129, 0.14)',
  perfectBorder: 'rgba(52, 211, 153, 0.5)',
  cta: '#7C3AED',
  homeBg: '#1a1748',
  homeBorder: 'rgba(139, 92, 255, 0.45)',
  panelBorder: 'rgba(139, 92, 255, 0.4)',
  /** Donut track behind Correct / Wrong / Unanswered arcs. */
  donutTrack: 'rgba(139, 92, 255, 0.22)',
  /** Achievement / star gold. */
  starGold: '#FBBF24',
  starGoldSoft: 'rgba(251, 191, 36, 0.28)',
  starUnearned: 'rgba(148, 163, 184, 0.35)',
  /** Space accents (cyan / violet / pink — not semantic C/W/U). */
  cyanAccent: '#22D3EE',
  violetAccent: '#A78BFA',
  pinkDecor: '#F472B6',
  bannerBg: 'rgba(124, 58, 237, 0.22)',
  bannerBorder: 'rgba(34, 211, 238, 0.4)',
  bannerTitle: '#E9D5FF',
  yourAnswerBg: 'rgba(244, 63, 94, 0.12)',
  yourAnswerBorder: 'rgba(251, 113, 133, 0.4)',
  correctAnswerBg: 'rgba(16, 185, 129, 0.12)',
  correctAnswerBorder: 'rgba(52, 211, 153, 0.4)',
  unansweredAnswerBg: 'rgba(245, 158, 11, 0.12)',
  unansweredAnswerBorder: 'rgba(251, 191, 36, 0.4)',
  medallionRing: 'rgba(251, 191, 36, 0.45)',
  medallionGlow: 'rgba(167, 139, 250, 0.18)',
  qBadgeBg: 'rgba(124, 58, 237, 0.45)',
  qBadgeWrong: 'rgba(244, 63, 94, 0.35)',
  qBadgeUnanswered: 'rgba(245, 158, 11, 0.35)',
  reviewCardBg: 'rgba(15, 11, 52, 0.92)',
  planetViolet: '#8B5CF6',
  planetCyan: '#22D3EE',
  planetPink: '#F472B6',
  planetGold: '#FBBF24',
  /** Topic-card accent cycle (presentation only). */
  topicAccents: [
    '#A78BFA',
    '#22D3EE',
    '#F472B6',
    '#FBBF24',
    '#34D399',
  ] as const,
  modalBackdrop: 'rgba(7, 4, 33, 0.78)',
  modalBg: 'rgba(20, 16, 58, 0.98)',
  modalBorder: 'rgba(139, 92, 255, 0.45)',
  modalMaxWidth: 520,
  chipMinHeight: 44,
} as const;
