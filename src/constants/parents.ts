/**
 * Parents / Parent Dashboard — Lovable `src/pages/Parents.tsx`.
 *
 * M8 data classification:
 * - Child name / year → SHARED Expo profile (`displayName`, `yearGroup`)
 * - Holiday Mode dates → REAL EXISTING LOCAL streak state (AsyncStorage)
 * - Exalo Score (62), Maths/English levels, weekly bars, chips, stats,
 *   preferences, recommendations → LOCAL STATIC PRODUCT SHELL (exact Lovable demo)
 * - GET /analytics/dashboard is NOT wired for this visual-parity milestone
 */

import { SCORE_HERO_VALUE } from './score';

/** Lovable PageShell: `max-w-md` = 28rem = 448; `px-5` = 20. */
export const PARENTS_CONTENT_MAX_WIDTH = 448;
export const PARENTS_PAGE_PADDING_X = 20;

/** Lovable HSL tokens used on Parents. */
export const PARENTS_CARD = '#121836'; // --card hsl(230 50% 14%)
export const PARENTS_BORDER = '#212A47'; // --border hsl(230 40% 22%)
export const PARENTS_MUTED = '#1F2740'; // --muted hsl(230 40% 20%)
export const PARENTS_MUTED_FOREGROUND = '#ACB9D2'; // --muted-foreground
export const PARENTS_FOREGROUND = '#F8FAFC'; // --foreground hsl(210 40% 98%)
export const PARENTS_PRIMARY = '#198CFF'; // --primary
export const PARENTS_PRIMARY_GLOW = '#4DB8FF'; // --primary-glow hsl(200 100% 65%)
export const PARENTS_PRIMARY_FOREGROUND = '#FFFFFF';
export const PARENTS_SECONDARY = '#9B4DE0'; // --secondary
export const PARENTS_SECONDARY_GLOW = '#C775F0'; // --secondary-glow
export const PARENTS_ACCENT = '#FF8A29'; // --accent
export const PARENTS_ACCENT_GLOW = '#FFB433'; // --accent-glow
export const PARENTS_SUCCESS = '#22C365'; // --success hsl(145 70% 45%)
export const PARENTS_DESTRUCTIVE = '#EF4444'; // --destructive hsl(0 84% 60%)

/** `bg-background/40` over page background. */
export const PARENTS_TILE_BG = 'rgba(8, 12, 33, 0.4)';
/** `bg-card/80` for section cards. */
export const PARENTS_SECTION_CARD_BG = 'rgba(18, 24, 54, 0.8)';
/** `bg-muted/40` for recommendation rows. */
export const PARENTS_MUTED_ROW_BG = 'rgba(31, 39, 64, 0.4)';

export const PARENTS_PRIMARY_GRAD = [PARENTS_PRIMARY, PARENTS_PRIMARY_GLOW] as const;
export const PARENTS_SUCCESS_GRAD = [PARENTS_SUCCESS, PARENTS_PRIMARY_GLOW] as const;

export const PARENTS_COPY = {
  title: 'Parent Dashboard',
  childLabel: 'Child',
  exaloScoreLabel: 'Exalo Score',
  holidayTitle: 'Holiday Mode',
  holidayActive: 'Active',
  holidayHint: 'Pauses streak, freeze days and grace window for the selected dates.',
  startDate: 'Start Date',
  endDate: 'End Date',
  activateHoliday: 'Activate Holiday Mode',
  endHoliday: 'End Holiday Mode',
  learningProfile: 'Learning Profile',
  maths: 'Maths',
  english: 'English',
  strengthsWeak: 'Strengths & Weak Topics',
  progressTitle: 'Progress & Performance',
  weeklyScore: 'Weekly Score',
  accuracy: 'Accuracy',
  topicsMastered: 'Topics Mastered',
  timeThisWeek: 'Time This Week',
  weeklyActivity: 'Weekly Activity',
  learningHistory: 'Learning History',
  trainModeHistory: 'Train Mode History',
  viewArrow: 'View →',
  mistakesReview: 'Mistakes Review',
  mistakesCount: '12 items',
  downloadReport: 'Download Progress Report',
  learningPrefs: 'Learning Preferences (AI)',
  difficultyMode: 'Difficulty Mode',
  difficultyValue: 'Adaptive',
  dailyGoal: 'Daily Goal',
  dailyGoalValue: '15 min',
  learningStyle: 'Learning Style',
  learningStyleValue: 'Balanced',
  recommendations: 'Recommendations',
  dayRemaining: 'day remaining',
  daysRemaining: 'days remaining',
} as const;

/** Lovable hardcoded weekly activity bars. */
export const PARENTS_WEEKLY = [40, 55, 60, 50, 75, 80, 70] as const;
export const PARENTS_WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/** Lovable localStorage defaults for subject levels. */
export const PARENTS_MATHS_LEVEL = 4;
export const PARENTS_ENGLISH_LEVEL = 3;
export const PARENTS_MATHS_PROGRESS_PCT = 62;
export const PARENTS_ENGLISH_PROGRESS_PCT = 45;

/** Same demo score as Lovable `exalo_score || 62` / Score screen. */
export const PARENTS_EXALO_SCORE = SCORE_HERO_VALUE;

export const PARENTS_STRENGTH_CHIPS = [
  { label: 'Number Skills', tone: 'success' as const },
  { label: 'Grammar', tone: 'success' as const },
  { label: 'Fractions', tone: 'destructive' as const },
  { label: 'Punctuation', tone: 'destructive' as const },
];

export const PARENTS_STATS = [
  { icon: 'Trophy' as const, label: PARENTS_COPY.weeklyScore, value: '+340', tint: 'success' as const },
  { icon: 'Target' as const, label: PARENTS_COPY.accuracy, value: '82%', tint: 'primary' as const },
  { icon: 'Award' as const, label: PARENTS_COPY.topicsMastered, value: '14', tint: 'secondary' as const },
  { icon: 'Clock' as const, label: PARENTS_COPY.timeThisWeek, value: '2h 40m', tint: 'accent' as const },
];

/** Lovable recommendation list — emoji preserved. */
export const PARENTS_RECOMMENDATIONS = [
  '📘 Practise Fractions (10 min)',
  '⏱ Take a Maths Test',
  '🔁 Revise Grammar',
] as const;

export type ParentsAccent = 'primary' | 'secondary' | 'accent' | 'success' | 'destructive';
