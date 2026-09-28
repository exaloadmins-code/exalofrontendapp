/**
 * Focus Mode setup copy + visual tokens.
 *
 * Setup uses dedicated Focus artboards (TP-075 / TP-076) — independent
 * Focus-specific derivative compositions referenced from Train (TP-073 / TP-074).
 * Static PNG already contains FOCUS MODE, Focus instruction, badge-free cards,
 * and a clean action region (no Train promo). Runtime: difficulty glow, topic
 * checkboxes, profile chip, START FOCUS CTA. Gameplay reuses Train QuizPlayer.
 */

import type { PercentRect } from '@/artboard';
import { trainTopicHotspotPercent } from '@/artboard';
import { TRAIN_ARTBOARD } from '@/responsive';

export const FOCUS_QUESTIONS_PER_RUN = 20;

export const FOCUS_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export type FocusDifficulty = (typeof FOCUS_DIFFICULTIES)[number];

/**
 * Checkbox sits in the clean upper-left of each Focus topic card
 * (Train badge footprint; Focus PNG has no 1–10 digits).
 */
export const FOCUS_TOPIC_CHECKBOX = {
  centerXFromCard: 2.5,
  centerYFromCardByRow: [0.65, 4.15] as const,
  sizeWidthPct: 3.4,
} as const;

/** Square checkbox percent rect for topic index 0–9. */
export function focusTopicCheckboxPercent(index: number): PercentRect {
  const card = trainTopicHotspotPercent(index);
  const sizeW = FOCUS_TOPIC_CHECKBOX.sizeWidthPct;
  const sizeH = sizeW * (TRAIN_ARTBOARD.width / TRAIN_ARTBOARD.height);
  const row = Math.floor(index / 5);
  const cyOff =
    FOCUS_TOPIC_CHECKBOX.centerYFromCardByRow[row] ??
    FOCUS_TOPIC_CHECKBOX.centerYFromCardByRow[0];
  const cx = (card.left ?? 0) + FOCUS_TOPIC_CHECKBOX.centerXFromCard;
  const cy = (card.top ?? 0) + cyOff;
  return {
    left: cx - sizeW / 2,
    top: cy - sizeH / 2,
    width: sizeW,
    height: sizeH,
  };
}

/**
 * Verified clean action bands on the Focus artboards (Train-derived pixels).
 *
 * START FOCUS is a native overlay centered in each subject's free band
 * (not baked into the PNG). Maths and English use independent Y geometry —
 * do not force a shared CTA top %.
 *
 * Maths (APPROVED — do not change):
 *   cards end y=978 → free 979…1153 (EXALO SCORE chrome)
 *
 * English:
 *   cards end y=987 → free 988…1116 (dashed footer-shelf chrome;
 *   SCORE text sits lower on the PNG — freeBottom is the visual shelf top)
 */
export const FOCUS_CLEAN_BAND = {
  maths: { cardBottom: 978, freeTop: 979, footerTop: 1153 },
  english: { cardBottom: 987, freeTop: 988, footerTop: 1116 },
} as const;

export type FocusCleanBandSubject = keyof typeof FOCUS_CLEAN_BAND;

/** Horizontal CTA footprint — centered at 50% artboard width. */
export const FOCUS_START_CTA_LAYOUT = {
  leftPct: 16,
  widthPct: 68,
  /** ~5.8% of 1264 artboard height. */
  heightPct: 5.8,
} as const;

/**
 * Derive START FOCUS percent rect from verified free-space bounds.
 * Vertically centers the button between freeTop and footerTop.
 */
export function focusStartCtaPercent(
  subject: FocusCleanBandSubject,
): PercentRect {
  const band = FOCUS_CLEAN_BAND[subject];
  const artH = TRAIN_ARTBOARD.height;
  const buttonH = (FOCUS_START_CTA_LAYOUT.heightPct / 100) * artH;
  const freeCenterY = (band.freeTop + band.footerTop) / 2;
  const buttonTop = freeCenterY - buttonH / 2;
  return {
    left: FOCUS_START_CTA_LAYOUT.leftPct,
    top: (buttonTop / artH) * 100,
    width: FOCUS_START_CTA_LAYOUT.widthPct,
    height: FOCUS_START_CTA_LAYOUT.heightPct,
  };
}

export const FOCUS_COPY = {
  title: 'Focus Mode',
  modeLabel: 'FOCUS MODE',
  instruction:
    'Choose one difficulty and at least two topics to start your mission!',
  intro:
    'Choose at least two topics and one difficulty to practise.',
  topicsHeading: 'Topics',
  selectAll: 'Select all',
  clearAll: 'Clear all',
  difficultyHeading: 'Difficulty',
  start: 'START FOCUS',
  loading: 'Loading…',
  missingSubjectTitle: 'Focus unavailable',
  missingSubjectBody:
    'Choose Maths or English Focus from Journey to continue.',
  goBack: 'Go back',
} as const;

export const FOCUS = {
  background: '#070421',
  contentMaxWidth: 672,
  panel: 'rgba(26, 23, 72, 0.8)',
  panelBorder: 'rgba(139, 92, 255, 0.4)',
  topicRowBg: 'rgba(15, 11, 52, 0.7)',
  topicRowBorder: 'rgba(139, 92, 255, 0.3)',
  topicRowBorderActive: 'rgba(167, 139, 250, 1)',
  checkboxBorder: 'rgba(196, 181, 253, 0.85)',
  checkboxBg: 'rgba(8, 12, 33, 0.55)',
  checkboxCheckedBg: '#7C3AED',
  checkboxCheck: '#FFFFFF',
  backBtnBg: '#1a1748',
  backBtnBorder: 'rgba(139, 92, 255, 0.4)',
  subjectEyebrow: 'rgba(196, 181, 253, 0.8)',
  intro: 'rgba(221, 214, 254, 0.8)',
  selectAll: '#C4B5FD',
  diffOnBg: '#7C3AED',
  diffOnBorder: '#A78BFA',
  diffOffBg: 'rgba(15, 11, 52, 0.7)',
  diffOffBorder: 'rgba(139, 92, 255, 0.3)',
  diffOffText: 'rgba(221, 214, 254, 0.9)',
  errorBg: 'rgba(244, 63, 94, 0.15)',
  errorBorder: 'rgba(251, 113, 133, 0.4)',
  errorText: '#FFE4E6',
  ctaFrom: '#8B5CF6',
  ctaTo: '#6D28D9',
  ctaBorder: '#A78BFA',
  modeLabel: '#FFC814',
  modeLabelOutline: '#160C04',
  instruction: '#F5F8FF',
  timerText: '#DDD6FE',
  topicGridSmMinWidth: 640,
} as const;

export function formatFocusElapsed(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  if (hours >= 1) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
