/**
 * Streak constants — Lovable `src/lib/streak.ts` + Streak.tsx insights.
 *
 * Data classification (M8A):
 * - RULES / GOAL / CAPS → local product rules (Lovable parity), not backend.
 * - INSIGHTS_* → TEMPORARY UI DEMO (hardcoded in Lovable Streak.tsx).
 * - Calendar / current / best / shields → REAL EXISTING LOCAL STATE (AsyncStorage).
 * - Backend analytics → NOT available for streak calendar (see services/streak.ts).
 */

export const STREAK_GOAL_MINUTES = 5;
export const FREEZE_CAP = 10;
export const FREEZE_INITIAL = 5;
export const GRACE_WINDOW_DAYS = 3;
export const RESET_AFTER_DAYS = 7;

/** Calendar window shown on Lovable Streak (“Last 5 weeks”). */
export const STREAK_HISTORY_DAYS = 35;

/**
 * Lovable `PageShell`: `mx-auto max-w-md px-5` (border-box).
 * Tailwind default `max-w-md` = 28rem = 448px includes `px-5` = 1.25rem = 20px
 * → inner usable content = 448 − 40 = 408px at the reference width.
 * Sticky CTA: outer `px-4` (16) + inner `max-w-md` (448) — gutters outside the cap.
 */
export const STREAK_CONTENT_MAX_WIDTH = 448;
export const STREAK_PAGE_PADDING_X = 20;
export const STREAK_CTA_PADDING_X = 16;

/** Lovable muted-foreground — light enough for Lucide Shield on navy stat cards. */
export const STREAK_MUTED_FOREGROUND = '#ACB9D2';
/**
 * Lovable sticky CTA: `fixed … bottom-20` → 5rem = 80px.
 * Expo adds `insets.bottom` on top so home-indicator / system UI never collide.
 */
export const STREAK_STICKY_BOTTOM_OFFSET = 80;
/** Lovable `--destructive`: hsl(0 84% 60%). */
export const STREAK_DESTRUCTIVE = '#EF4343';
/** Lovable `--accent-glow`: hsl(38 100% 60%). */
export const STREAK_ACCENT_GLOW = '#FFB433';
/** Lovable `--primary-glow`: hsl(200 100% 65%). */
export const STREAK_PRIMARY_GLOW = '#4DC3FF';
/** Lovable `--success`: hsl(145 70% 45%). */
export const STREAK_SUCCESS = '#22C365';

export const STREAK_DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

/**
 * TEMPORARY UI DEMO — values hardcoded in Lovable `Streak.tsx` insights grid.
 * Not from backend. Replace when real analytics exist.
 */
export const STREAK_INSIGHT_DEMO = {
  averageStreakLabel: '6 days',
  mostActiveLabel: '6–8 pm',
  consistencyLabel: '82% of learners',
  dataClass: 'TEMPORARY_UI_DEMO' as const,
};

export const STREAK_COPY = {
  title: 'Your Streak',
  titleEmoji: '🔥',
  keepAliveTitle: 'Keep your streak alive',
  calendarTitle: 'Last 5 weeks',
  insightsTitle: 'Streak insights',
  todayGoalEyebrow: "Today's goal",
  todayGoalTitle: '5–10 minutes of learning',
  todayGoalBody: 'A short daily mission keeps your brain sharp.',
  continueLearning: 'Continue Learning',
  stickyCta: 'Continue Streak — Start Learning',
  stayConsistentTitle: 'Stay consistent',
  stayConsistentBody: 'Consistency builds mastery over time.',
  stayConsistentFoot:
    'Students with 7+ day streaks learn faster than those who only practice once a week.',
  legendActive: 'Active',
  legendMissed: 'Missed',
  legendToday: 'Today',
} as const;
