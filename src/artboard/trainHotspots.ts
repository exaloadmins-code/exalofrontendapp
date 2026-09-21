import { PercentRect } from './artboardMath';
import { TRAIN_DIFFICULTIES, type TrainDifficulty } from '@/constants/train';
import { TRAIN_ARTBOARD } from '@/responsive';

/**
 * Lovable TrainMode hotspot regions — percentages of the 843×1264 artboard
 * (`C:\projects\exalo\src\pages\TrainMode.tsx`).
 *
 * Maths and English share layout; only the baked artboard + topic slug list differ.
 */

/** Pixel-measured difficulty pills → % of artboard. */
const DIFFICULTY_PX: Record<TrainDifficulty, { x: number; y: number; w: number; h: number }> = {
  easy: { x: 40, y: 230, w: 246, h: 84 },
  medium: { x: 304, y: 230, w: 239, h: 84 },
  hard: { x: 561, y: 230, w: 241, h: 84 },
};

function pxToPercent(rect: { x: number; y: number; w: number; h: number }): PercentRect {
  return {
    left: (rect.x / TRAIN_ARTBOARD.width) * 100,
    top: (rect.y / TRAIN_ARTBOARD.height) * 100,
    width: (rect.w / TRAIN_ARTBOARD.width) * 100,
    height: (rect.h / TRAIN_ARTBOARD.height) * 100,
  };
}

export const TRAIN_DIFFICULTY_HOTSPOTS: {
  id: TrainDifficulty;
  label: string;
  percent: PercentRect;
}[] = TRAIN_DIFFICULTIES.map((id) => ({
  id,
  label: id,
  percent: pxToPercent(DIFFICULTY_PX[id]),
}));

/** Topic grid: 5×2 — Lovable cardW 17.5%, gapX 1.5%, startX 3%, rowYs 29 / 51.5, cardH 18%. */
const TOPIC_COLS = 5;
const TOPIC_CARD_W = 17.5;
const TOPIC_GAP_X = 1.5;
const TOPIC_START_X = 3;
const TOPIC_ROW_YS = [29, 51.5] as const;
const TOPIC_CARD_H = 18;

export function trainTopicHotspotPercent(index: number): PercentRect {
  const r = Math.floor(index / TOPIC_COLS);
  const c = index % TOPIC_COLS;
  return {
    top: TOPIC_ROW_YS[r] ?? TOPIC_ROW_YS[0],
    left: TOPIC_START_X + c * (TOPIC_CARD_W + TOPIC_GAP_X),
    width: TOPIC_CARD_W,
    height: TOPIC_CARD_H,
  };
}

export const TRAIN_CHROME_HOTSPOTS: {
  id: string;
  label: string;
  /** Absolute route or template with `{subject}`. */
  route: string;
  percent: PercentRect;
}[] = [
  {
    id: 'back',
    label: 'Back',
    route: '/journey/{subject}',
    percent: { top: 1.5, left: 2, width: 10, height: 5 },
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

export function resolveTrainChromeRoute(template: string, subject: string): string {
  return template.replace('{subject}', subject);
}
