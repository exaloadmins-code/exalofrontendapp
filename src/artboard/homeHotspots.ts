import { PercentRect } from './artboardMath';

/**
 * Lovable Home hotspot regions — percentages of the 843×1264 artboard
 * (from C:\projects\exalo\src\pages\Index.tsx).
 */
export const HOME_HOTSPOTS: {
  id: string;
  label: string;
  route: string;
  percent: PercentRect;
}[] = [
  {
    id: 'streak',
    label: 'Streak',
    route: '/streak',
    percent: { top: 14, left: 4, width: 40, height: 16 },
  },
  {
    id: 'badges',
    label: 'Badges',
    route: '/badges',
    percent: { top: 14, right: 4, width: 40, height: 16 },
  },
  {
    id: 'maths',
    label: 'Open Maths',
    route: '/journey/maths',
    /** Lovable card body (arrow pills sit below this rect — see mathsArrow). */
    percent: { top: 32, left: 4, width: 40, height: 32 },
  },
  {
    id: 'english',
    label: 'Open English',
    route: '/journey/english',
    /** Lovable card body (arrow pills sit below this rect — see englishArrow). */
    percent: { top: 32, right: 4, width: 40, height: 32 },
  },
  {
    id: 'nav-home',
    label: 'Home',
    route: '/home',
    percent: { bottom: 3, left: 4, width: 18, height: 14 },
  },
  {
    id: 'parents',
    label: 'Parents',
    route: '/parents',
    percent: { bottom: 3, right: 4, width: 18, height: 14 },
  },
  {
    id: 'score',
    label: 'Score',
    route: '/score',
    percent: { bottom: 3, left: 26, width: 48, height: 14 },
  },
];

/**
 * Dedicated hit targets for the baked Maths/English arrow pills.
 *
 * Measured on `exalo-home-v2.png` (843×1264): pills sit at ~66.7–69.6% Y —
 * entirely BELOW the Lovable card hotspot (ends 64%). Card expansion alone
 * cannot cover them without eating unrelated space; these targets must be
 * separate Pressables rendered above decorative Home overlays.
 */
export const HOME_ARROW_HOTSPOTS = {
  mathsArrow: {
    id: 'mathsArrow',
    label: 'Open Maths',
    route: '/journey/maths',
    percent: { top: 65.5, left: 10, width: 16, height: 5.5 },
  },
  englishArrow: {
    id: 'englishArrow',
    label: 'Open English',
    route: '/journey/english',
    percent: { top: 65.5, left: 73.5, width: 16, height: 5.5 },
  },
} as const;

/**
 * Home overlay anchors (% of fitted artboard).
 *
 * `profile` documents Lovable Index.tsx `top/right/height` percentages.
 * Runtime uses `profileChipMetrics` in `app/home/index.tsx`: right-anchored,
 * content-aware width, with a narrow-artboard vertical adaptation when a
 * readable name would intersect EXALO logo ink.
 */
export const HOME_OVERLAYS = {
  profile: {
    top: 3,
    right: 3,
    width: 24,
    height: 6,
  } satisfies PercentRect,
  streakCount: {
    top: 27,
    left: 20,
    width: 13,
    height: 7,
  } satisfies PercentRect,
  badgesCount: {
    top: 27,
    right: 9,
    width: 13,
    height: 7,
  } satisfies PercentRect,
  /**
   * Full baked empty Score inset left of "/100" (interior + rounded border +
   * outer outline/shadow). Used ONLY when exaloScore <= 0. Extends past the
   * outer shell so no rounded square remains visible; artboard PNG unchanged.
   */
  scoreEmptyInset: {
    top: 82.8,
    left: 37,
    width: 18,
    height: 12.8,
  } satisfies PercentRect,
} as const;

/**
 * Conceal empty count squares baked into `exalo-home-v2.png`.
 * Colors sampled from the card/pill fill around those insets — not a new visible box.
 * Artwork file is intentionally left unchanged.
 */
export const HOME_COUNT_COVER = {
  /** STREAK card panel fill under the count inset. */
  streak: '#030F28',
  /** BADGES card panel fill under the count inset. */
  badges: '#070B34',
  /**
   * EXALO SCORE pill fill around the empty inset (zero-score only).
   * Sampled from the pill ring outside the full inset shell — not inset grey.
   */
  scoreEmpty: '#010E2B',
  /** Match baked Streak/Badges inset corner rounding (~22% of box min-edge). */
  radiusFromMinEdge: 0.22,
} as const;

/**
 * Right extent of EXALO wordmark + motion dashes on TP-003 (header band, left
 * of baked profile). Measured ~61.8% of artboard width.
 */
export const HOME_LOGO_CLEAR_LEFT = 0.62;

/**
 * Bottom of EXALO logo ink band on TP-003 (~12.5% artboard height). Below this,
 * logo no longer occupies the right header corridor — chip may use useful width.
 * Streak/Badges hotspots begin at 14%.
 */
export const HOME_LOGO_BOTTOM = 0.128;
