/**
 * Journey subject catalogue — Lovable uses one shared artboard for both subjects.
 * Display labels and a11y titles resolve only through this config (never hardcode in JSX).
 */
export const JOURNEY_SUBJECTS = ['maths', 'english'] as const;

export type JourneySubject = (typeof JOURNEY_SUBJECTS)[number];

export const JOURNEY_SUBJECT_CONFIG = {
  maths: {
    slug: 'maths',
    label: 'Maths',
    title: 'Maths Journey',
  },
  english: {
    slug: 'english',
    label: 'English',
    title: 'English Journey',
  },
} as const;

export const JOURNEY_HEADER_COPY = {
  pathSubtitle: 'Choose your path',
} as const;

/**
 * Native header typography on the clean Journey artboard (TP-071).
 *
 * Values recovered from TP-070 / Lovable `journey-bg.png` baked ink (843×1264)
 * plus Fredoka glyph calibration (PIL measure of TP-001):
 * - Maths ink box ≈ (99,44)–(214,73) → glyph h 30, left ≈ 11.74%
 * - Subtitle ink ≈ (97,90)–(291,111) → glyph h ≈ 22, gap ≈ 16px
 * - Fredoka “Maths” matches ink at artboard fontSize 44 (w≈115 vs 116)
 * - Fredoka “Choose your path” matches subtitle width at artboard fontSize 25
 *
 * Runtime sizes = artboardFontSizePct × displayed artboard height (ResponsiveArtboard scale).
 * Font: TP-001 Fredoka. Weight medium (500) — baked raster has no discrete CSS weight;
 * medium matches Lovable UI chips / prior PO direction without the oversized box factor.
 */
export const JOURNEY_HEADER_STYLE = {
  title: {
    /** 44 / 1264 — calibrated to baked Maths glyph, not a guessed sizeFromBox. */
    artboardFontSizePct: (44 / 1264) * 100,
    /** Room for English descenders (g); Maths sits optically within the same rule. */
    artboardLineHeightPct: (48 / 1264) * 100,
    fontWeight: '500' as const,
    fontVariationWght: 500,
    color: '#FFFFFF',
    letterSpacing: 0,
  },
  subtitle: {
    /** 25 / 1264 — calibrated to baked subtitle string width/height. */
    artboardFontSizePct: (25 / 1264) * 100,
    artboardLineHeightPct: (28 / 1264) * 100,
    fontWeight: '500' as const,
    fontVariationWght: 500,
    color: '#B8B7C5',
    letterSpacing: 0,
  },
  /**
   * Gap between title ink bottom (y=73) and subtitle ink top (y=90) = 16px
   * on the 1264-tall artboard.
   */
  titleToSubtitleGapPctOfArtboard: (16 / 1264) * 100,
} as const;

/**
 * Lovable `BakedProfileOverlay` chrome, expressed relative to the Journey chip
 * height (8% of artboard). Reference at 390-wide contain: chipH ≈ 46.8px,
 * avatar 36 (h-9), name text-sm 14 / font-semibold, gap-2 8, chevron h-4 16,
 * pl-1 / pr-3 / py-1.
 */
export const JOURNEY_PROFILE_PILL_STYLE = {
  backgroundColor: '#1a1748',
  borderColor: 'rgba(139, 92, 255, 0.4)',
  borderWidth: 1,
  /** avatar 36 / chipH 46.8 */
  avatarFromChip: 36 / 46.8,
  /** text-sm 14 / chipH 46.8 */
  nameFontFromChip: 14 / 46.8,
  nameFontWeight: '600' as const,
  nameFontVariationWght: 600,
  nameColor: '#FFFFFF',
  /** max-w-[7rem] ≈ 112 at the 390 contain reference */
  nameMaxWidthFromChip: 112 / 46.8,
  /** gap-2 = 8 */
  gapFromChip: 8 / 46.8,
  /** pl-1 = 4, pr-3 = 12 */
  paddingLeftFromChip: 4 / 46.8,
  paddingRightFromChip: 12 / 46.8,
  /** chevron h-4 = 16; violet-300 */
  chevronFromChip: 16 / 46.8,
  chevronColor: '#C4B5FD',
  /** ring-2 ring-white/10 on avatar */
  avatarRingWidth: 2,
  avatarRingColor: 'rgba(255, 255, 255, 0.1)',
} as const;

export function normalizeJourneySubject(raw: string | string[] | undefined): JourneySubject | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const slug = (value ?? '').trim().toLowerCase();
  if (slug === 'maths' || slug === 'english') {
    return slug;
  }
  return null;
}

export function journeySubjectLabel(subject: JourneySubject): string {
  return JOURNEY_SUBJECT_CONFIG[subject].label;
}

export function journeyTitle(subject: JourneySubject): string {
  return JOURNEY_SUBJECT_CONFIG[subject].title;
}

export function journeyPathSubtitle(): string {
  return JOURNEY_HEADER_COPY.pathSubtitle;
}
