/**
 * Exalo Score — Lovable `src/pages/Score.tsx`.
 *
 * M8 data classification:
 * - Hero score (62/100) and breakdown values → LOCAL STATIC PRODUCT SHELL
 *   (exact Lovable hardcoded demo). Not from backend.
 * - GET /analytics/dashboard exists in exam-prep-api but is NOT wired —
 *   response semantics were not mapped for this visual-parity milestone.
 * - Replace later when a real Exalo Score contract is approved.
 */

export const SCORE_CONTENT_MAX_WIDTH = 448;
export const SCORE_PAGE_PADDING_X = 20;

/** Lovable HSL tokens used on Score. */
export const SCORE_CARD = '#121836'; // --card
export const SCORE_BORDER = '#212A47'; // --border
export const SCORE_MUTED = '#1F2740'; // --muted
export const SCORE_MUTED_FOREGROUND = '#ACB9D2'; // --muted-foreground
export const SCORE_FOREGROUND = '#F8FAFC'; // --foreground
export const SCORE_PRIMARY = '#198CFF'; // --primary hsl(212 100% 55%)
export const SCORE_SECONDARY = '#9B4DE0'; // --secondary hsl(270 70% 55%)
export const SCORE_ACCENT = '#FF8A29'; // --accent hsl(25 100% 58%) — progress fill

/** Hero: `from-primary to-secondary` (bg-gradient-to-br). */
export const SCORE_HERO_GRADIENT = [SCORE_PRIMARY, SCORE_SECONDARY] as const;

/** Lovable hardcoded hero score. */
export const SCORE_HERO_VALUE = 62;
export const SCORE_HERO_MAX = 100;

export const SCORE_COPY = {
  title: 'Exalo Score',
  titleEmoji: '🚀',
  yourScore: 'Your Score',
  rising: "You're rising fast! 🚀",
  breakdown: 'Breakdown',
} as const;

export type ScoreBreakdownItem = {
  name: string;
  value: number;
  desc: string;
  /** Lucide icon key — mapped in the screen. */
  icon: 'Target' | 'Zap' | 'Repeat' | 'Mountain';
  /** Tailwind text-* color → hex. */
  iconColor: string;
};

/**
 * Exact Lovable `breakdown` array (Score.tsx).
 * Values are TEMPORARY_UI_DEMO / local static shell.
 */
export const SCORE_BREAKDOWN: ScoreBreakdownItem[] = [
  {
    name: 'Accuracy',
    value: 65,
    icon: 'Target',
    desc: 'How often you answer correctly',
    iconColor: '#60A5FA', // text-blue-400
  },
  {
    name: 'Speed',
    value: 70,
    icon: 'Zap',
    desc: 'How fast you solve questions',
    iconColor: '#FACC15', // text-yellow-400
  },
  {
    name: 'Consistency',
    value: 55,
    icon: 'Repeat',
    desc: 'Practising regularly',
    iconColor: '#34D399', // text-emerald-400
  },
  {
    name: 'Difficulty',
    value: 60,
    icon: 'Mountain',
    desc: 'Tackling harder challenges',
    iconColor: '#C084FC', // text-purple-400
  },
];
