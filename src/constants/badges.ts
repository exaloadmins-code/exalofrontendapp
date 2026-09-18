/**
 * Badges / Achievements — Lovable `src/lib/badges.ts` + `StreakBadges.tsx`.
 *
 * M8 data classification:
 * - BADGE definitions / statuses / progress → LOCAL STATIC PRODUCT SHELL
 *   (exact Lovable catalog). Not from backend.
 * - Replace later when a real achievements API exists.
 * - Do NOT invent counts, rules, or unlocked states beyond Lovable.
 */

export type BadgeStatus = 'locked' | 'in_progress' | 'unlocked';
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'Maths' | 'English' | 'Performance' | 'Milestones';
export type BadgeGroup =
  | 'Learning Mastery'
  | 'Performance'
  | 'Engagement Milestones'
  | 'Special / Rare';

export type Badge = {
  name: string;
  /** Genuine emoji from Lovable — preserve as Text, not Lucide substitutes. */
  icon: string;
  desc: string;
  status: BadgeStatus;
  progress?: number;
  rarity: BadgeRarity;
  category: BadgeCategory;
  group: BadgeGroup;
};

/** Lovable PageShell: `max-w-md` = 28rem = 448; `px-5` = 20. */
export const BADGES_CONTENT_MAX_WIDTH = 448;
export const BADGES_PAGE_PADDING_X = 20;

/** Lovable HSL tokens used on Badges. */
export const BADGES_CARD = '#121836'; // --card hsl(230 50% 14%)
export const BADGES_BORDER = '#212A47'; // --border hsl(230 40% 22%)
export const BADGES_MUTED = '#1F2740'; // --muted hsl(230 40% 20%)
export const BADGES_MUTED_FOREGROUND = '#ACB9D2'; // --muted-foreground
export const BADGES_PRIMARY = '#198CFF'; // --primary hsl(212 100% 55%)
export const BADGES_PRIMARY_FOREGROUND = '#FFFFFF';
export const BADGES_FOREGROUND = '#F8FAFC'; // --foreground hsl(210 40% 98%)

/** Hero: `from-violet-600 via-indigo-600 to-blue-700`. */
export const BADGES_HERO_GRADIENT = ['#7C3AED', '#4F46E5', '#1D4ED8'] as const;

export type RarityStyle = {
  ring: string;
  chipBg: string;
  chipText: string;
  label: string;
};

export const RARITY_STYLES: Record<BadgeRarity, RarityStyle> = {
  common: {
    ring: 'rgba(52, 211, 153, 0.4)', // ring-emerald-400/40
    chipBg: 'rgba(16, 185, 129, 0.15)', // bg-emerald-500/15
    chipText: '#6EE7B7', // text-emerald-300
    label: 'Common',
  },
  rare: {
    ring: 'rgba(56, 189, 248, 0.5)', // ring-sky-400/50
    chipBg: 'rgba(14, 165, 233, 0.15)',
    chipText: '#7DD3FC',
    label: 'Rare',
  },
  epic: {
    ring: 'rgba(167, 139, 250, 0.5)', // ring-violet-400/50
    chipBg: 'rgba(139, 92, 246, 0.15)',
    chipText: '#C4B5FD',
    label: 'Epic',
  },
  legendary: {
    ring: 'rgba(252, 211, 77, 0.6)', // ring-amber-300/60
    chipBg: 'rgba(251, 191, 36, 0.15)',
    chipText: '#FCD34D',
    label: 'Legendary',
  },
};

export const BADGE_FILTERS = ['All', 'Maths', 'English', 'Performance', 'Milestones'] as const;
export type BadgeFilter = (typeof BADGE_FILTERS)[number];

export const BADGE_GROUPS: BadgeGroup[] = [
  'Learning Mastery',
  'Performance',
  'Engagement Milestones',
  'Special / Rare',
];

/**
 * Exact Lovable `BADGES` catalog (`C:\projects\exalo\src\lib\badges.ts`).
 * Status / progress values are Lovable demo shell — not live achievements.
 */
export const BADGES: Badge[] = [
  {
    name: 'Fractions Master',
    icon: '🧮',
    desc: 'Solve 100 fraction questions with 85%+ accuracy',
    status: 'unlocked',
    rarity: 'rare',
    category: 'Maths',
    group: 'Learning Mastery',
  },
  {
    name: 'Percentages Pro',
    icon: '％',
    desc: 'Master percentage problems across all difficulty levels',
    status: 'in_progress',
    progress: 65,
    rarity: 'rare',
    category: 'Maths',
    group: 'Learning Mastery',
  },
  {
    name: 'Algebra Starter',
    icon: '🅰️',
    desc: 'Complete your first 20 algebra problems',
    status: 'in_progress',
    progress: 40,
    rarity: 'common',
    category: 'Maths',
    group: 'Learning Mastery',
  },
  {
    name: 'Grammar Expert',
    icon: '✍️',
    desc: 'Master 50 grammar challenges',
    status: 'unlocked',
    rarity: 'rare',
    category: 'English',
    group: 'Learning Mastery',
  },
  {
    name: 'Reading Comprehension Champion',
    icon: '📖',
    desc: 'Ace 25 reading comprehension passages',
    status: 'locked',
    rarity: 'epic',
    category: 'English',
    group: 'Learning Mastery',
  },
  {
    name: '90% Accuracy Club',
    icon: '🎯',
    desc: 'Maintain 90%+ accuracy across 20 sessions',
    status: 'in_progress',
    progress: 80,
    rarity: 'epic',
    category: 'Performance',
    group: 'Performance',
  },
  {
    name: 'Perfect Score',
    icon: '💯',
    desc: 'Achieve a perfect score in any session',
    status: 'unlocked',
    rarity: 'rare',
    category: 'Performance',
    group: 'Performance',
  },
  {
    name: 'Speed Solver',
    icon: '⚡',
    desc: 'Solve 50 questions under target time',
    status: 'in_progress',
    progress: 30,
    rarity: 'rare',
    category: 'Performance',
    group: 'Performance',
  },
  {
    name: 'Consistent High Scorer',
    icon: '📈',
    desc: 'Score 80%+ in 10 sessions in a row',
    status: 'locked',
    rarity: 'epic',
    category: 'Performance',
    group: 'Performance',
  },
  {
    name: 'First 10 Sessions',
    icon: '🔟',
    desc: 'Complete your first 10 learning sessions',
    status: 'unlocked',
    rarity: 'common',
    category: 'Milestones',
    group: 'Engagement Milestones',
  },
  {
    name: '50 Sessions Completed',
    icon: '🏁',
    desc: 'Complete 50 learning sessions in total',
    status: 'in_progress',
    progress: 54,
    rarity: 'rare',
    category: 'Milestones',
    group: 'Engagement Milestones',
  },
  {
    name: '100 Questions Mastered',
    icon: '🧠',
    desc: 'Master 100 questions across all subjects',
    status: 'in_progress',
    progress: 72,
    rarity: 'rare',
    category: 'Milestones',
    group: 'Engagement Milestones',
  },
  {
    name: '30 Topics Attempted',
    icon: '🗺️',
    desc: 'Try out 30 different learning topics',
    status: 'locked',
    rarity: 'epic',
    category: 'Milestones',
    group: 'Engagement Milestones',
  },
  {
    name: 'Problem Solver Elite',
    icon: '🧩',
    desc: 'Solve 25 advanced challenge problems',
    status: 'locked',
    rarity: 'legendary',
    category: 'Performance',
    group: 'Special / Rare',
  },
  {
    name: 'Maths Explorer',
    icon: '🚀',
    desc: 'Explore every maths category at least once',
    status: 'in_progress',
    progress: 55,
    rarity: 'epic',
    category: 'Maths',
    group: 'Special / Rare',
  },
  {
    name: 'English Champion',
    icon: '🏆',
    desc: 'Master every English category',
    status: 'locked',
    rarity: 'legendary',
    category: 'English',
    group: 'Special / Rare',
  },
  {
    name: 'Focus Master',
    icon: '🧘',
    desc: 'Complete 10 focus-mode sessions without errors',
    status: 'locked',
    rarity: 'legendary',
    category: 'Performance',
    group: 'Special / Rare',
  },
];

export const BADGES_COPY = {
  title: 'Achievements',
  titleEmoji: '🏅',
  summaryLine: 'Your learning achievements and milestones',
  badgesEarned: 'Badges earned',
  inProgress: 'In progress',
  collectionComplete: 'Collection complete',
  rarityLegend: 'Rarity',
  statusUnlocked: 'Unlocked',
  statusInProgress: 'In Progress',
  statusLocked: 'Locked',
  progressSuffix: '% complete',
} as const;

export const getBadgeStats = () => {
  const total = BADGES.length;
  const unlocked = BADGES.filter((b) => b.status === 'unlocked').length;
  const inProgress = BADGES.filter((b) => b.status === 'in_progress').length;
  const pct = Math.round((unlocked / total) * 100);
  return { total, unlocked, inProgress, pct };
};
