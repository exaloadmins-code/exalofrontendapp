/**
 * TEMPORARY frontend-only Train Selection catalogue (M3).
 *
 * Labels/order match Lovable `TrainMode.tsx` + `lib/subjects.ts` + `lib/englishTopics.ts`.
 * Topic artwork and difficulty pills are baked into TP-073 / TP-074 artboards —
 * this module supplies slug/label order for hotspots and CTA handoff only.
 *
 * Replace later with the real backend curriculum/catalogue without redesigning
 * the Train Selection visual components.
 *
 * Do NOT treat this as a production question bank.
 */

import type { JourneySubject } from './journey';

/** Lovable difficulty ids (lowercase) — baked pill labels on the artboard. */
export const TRAIN_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type TrainDifficulty = (typeof TRAIN_DIFFICULTIES)[number];

export const TRAIN_DIFFICULTY_DEFAULT: TrainDifficulty = 'easy';

/**
 * Maths topic order — Lovable `TrainMode` TOPICS.maths / `MATHS_TOPICS`.
 * Display labels are baked into maths-train-mode.png (TP-073).
 */
export const TRAIN_MATHS_TOPICS = [
  { slug: 'number-skills', label: 'Number Skills' },
  { slug: 'fractions', label: 'Fractions' },
  { slug: 'decimals', label: 'Decimals' },
  { slug: 'percentages', label: 'Percentages' },
  { slug: 'ratio-proportion', label: 'Ratio & Proportion' },
  { slug: 'algebra', label: 'Algebra' },
  { slug: 'geometry', label: 'Geometry' },
  { slug: 'angles', label: 'Angles' },
  { slug: 'measurement', label: 'Measurement' },
  { slug: 'word-problems', label: 'Word Problems' },
] as const;

/**
 * English topic order — Lovable `ENGLISH_TOPIC_SLUGS` / `ENGLISH_TOPICS`.
 * Display labels are baked into english-train-mode.png (TP-074).
 */
export const TRAIN_ENGLISH_TOPICS = [
  { slug: 'synonyms-antonyms', label: 'Synonyms & Antonyms' },
  { slug: 'word-analogies', label: 'Word Analogies' },
  { slug: 'odd-one-out', label: 'Odd One Out' },
  { slug: 'shuffled-sentences', label: 'Shuffled Sentences' },
  { slug: 'cloze-passages', label: 'Cloze Passages' },
  { slug: 'comprehension-literal', label: 'Comprehension: Literal' },
  { slug: 'comprehension-inferential', label: 'Comprehension: Inferential' },
  { slug: 'spelling-rules-traps', label: 'Spelling Rules & Traps' },
  { slug: 'homophones-confused-words', label: 'Homophones & Confused Words' },
  { slug: 'grammar-punctuation', label: 'Grammar & Punctuation' },
] as const;

export type TrainTopic = {
  slug: string;
  label: string;
};

export function trainTopicsFor(subject: JourneySubject): readonly TrainTopic[] {
  return subject === 'english' ? TRAIN_ENGLISH_TOPICS : TRAIN_MATHS_TOPICS;
}

export function trainTopicLabel(subject: JourneySubject, slug: string): string | undefined {
  return trainTopicsFor(subject).find((t) => t.slug === slug)?.label;
}

export function normalizeTrainDifficulty(raw: string | string[] | undefined): TrainDifficulty {
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim().toLowerCase() ?? '';
  if (value === 'medium' || value === 'hard' || value === 'easy') {
    return value;
  }
  return TRAIN_DIFFICULTY_DEFAULT;
}

/** Lovable difficulty selected-pill tint + glow (TrainMode DIFFICULTY_SELECTED_STYLE). */
export const TRAIN_DIFFICULTY_SELECTED = {
  easy: {
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    glowColor: 'rgba(34, 211, 238, 0.9)',
    glowColorSoft: 'rgba(34, 211, 238, 0.6)',
  },
  medium: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    glowColor: 'rgba(251, 146, 60, 0.9)',
    glowColorSoft: 'rgba(251, 146, 60, 0.6)',
  },
  hard: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    glowColor: 'rgba(248, 113, 113, 0.9)',
    glowColorSoft: 'rgba(248, 113, 113, 0.6)',
  },
} as const;

/**
 * Lovable difficulty label under the pills:
 * `Selected Difficulty: {EASY|MEDIUM|HARD}` — text-[10px] font-semibold uppercase tracking-[0.18em].
 */
export const TRAIN_DIFFICULTY_LABEL_STYLE = {
  /** Artboard Y of label top (322 / 1264). */
  topPct: (322 / 1264) * 100,
  fontSize: 10,
  fontWeight: '600' as const,
  letterSpacing: 0.18 * 10,
  color: '#FFFFFF',
  textShadowColor: 'rgba(255,255,255,0.75)',
  textShadowRadius: 8,
  textShadowOffset: { width: 0, height: 0 },
} as const;

/**
 * Lovable `BakedProfileOverlay` on TrainMode — slightly tighter than Journey
 * (top 1.5% / height 6% / minWidth 30% vs Journey 2% / 8% / 32%).
 */
export const TRAIN_PROFILE_OVERLAY = {
  top: 1.5,
  right: 2,
  width: 30,
  height: 6,
} as const;

export function trainScreenTitle(subject: JourneySubject): string {
  return subject === 'english' ? 'English Train Mode' : 'Maths Train Mode';
}
