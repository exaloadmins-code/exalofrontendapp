import { PercentRect } from './artboardMath';

/**
 * Lovable Journey hotspot regions — percentages of the 843×1264 artboard
 * (from C:\projects\exalo\src\pages\Journey.tsx).
 *
 * Mode order (top → bottom): Test (red) → Focus (orange) → Train (grey).
 * Maths and English share the same artboard + hotspot layout.
 * Visible subject heading is overlaid from JOURNEY_SUBJECT_CONFIG (TP-070 bakes "Maths").
 */
export const JOURNEY_HOTSPOTS: {
  id: string;
  label: string;
  /** Route template; `{subject}` replaced at runtime. Absolute routes have no placeholder. */
  route: string;
  percent: PercentRect;
}[] = [
  {
    id: 'back',
    label: 'Back',
    route: '/home',
    percent: { top: 2, left: 2, width: 12, height: 6 },
  },
  {
    id: 'test',
    label: 'Test',
    route: '/test/{subject}',
    percent: { top: 12, left: 10, width: 85, height: 30 },
  },
  {
    id: 'focus',
    label: 'Focus',
    route: '/focus/{subject}',
    percent: { top: 44, left: 10, width: 85, height: 26 },
  },
  {
    id: 'train',
    label: 'Train',
    route: '/train/{subject}',
    percent: { top: 72, left: 10, width: 85, height: 20 },
  },
  {
    id: 'nav-home',
    label: 'Home',
    route: '/home',
    percent: { bottom: 1, left: 3, width: 20, height: 10 },
  },
  {
    id: 'score',
    label: 'Score',
    route: '/score',
    percent: { bottom: 1, left: 26, width: 48, height: 10 },
  },
  {
    id: 'parents',
    label: 'Parents',
    route: '/parents',
    percent: { bottom: 1, right: 3, width: 20, height: 10 },
  },
];

/** Lovable BakedProfileOverlay on Journey — top-right chip covering baked profile. */
export const JOURNEY_OVERLAYS = {
  profile: {
    top: 2,
    right: 2,
    width: 32,
    height: 8,
  } satisfies PercentRect,
  /**
   * Shared Journey header text block (title + subtitle).
   *
   * Header ROW geometry (TP-070 / Lovable, 843×1264):
   * - Back hotspot: top 2% / height 6% (hit target; do not move)
   * - Back arrow ink ≈ y 48–70 → visual center Y ≈ 59
   * - Maths title ink ≈ y 44–73 → visual center Y ≈ 58.5
   * → shared header-row center Y = 59 (title line-box centered on this)
   *
   * Subtitle is a second row under the title column (same left edge).
   * Left from baked title ink x≈99.
   */
  headerText: {
    /**
     * Top of the title LINE BOX so its vertical center matches the shared
     * header-row center (back arrow / title ink), not the raw ink top.
     * = (59 - 48/2) / 1264
     */
    top: ((59 - 48 / 2) / 1264) * 100,
    left: (99 / 843) * 100,
    width: 42,
    /** Line box for title (includes English descender room). */
    titleHeight: (48 / 1264) * 100,
    /** Line box for subtitle. */
    subtitleHeight: (28 / 1264) * 100,
  },
} as const;

/**
 * Shared header-row visual center on the Journey artboard (reference px / %).
 * Back arrow ink center ≈ title ink center on TP-070; Expo title line box is
 * centered on this Y so RN font metrics do not drop the title below Back.
 */
export const JOURNEY_HEADER_ROW = {
  /** Back hotspot — Lovable Journey.tsx (unchanged). */
  back: { top: 2, left: 2, width: 12, height: 6 },
  /** TP-070 back-arrow ink visual center Y (artboard px). */
  backArrowCenterYPx: 59,
  /** TP-070 Maths title ink visual center Y (artboard px). */
  titleInkCenterYPx: 58.5,
  /** Authoritative shared row center used for native title placement. */
  rowCenterYPx: 59,
  titleLineHeightPx: 48,
} as const;

export function resolveJourneyRoute(template: string, subject: string): string {
  return template.replace('{subject}', subject);
}
