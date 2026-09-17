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
    label: 'Maths',
    route: '/journey/maths',
    percent: { top: 32, left: 4, width: 40, height: 32 },
  },
  {
    id: 'english',
    label: 'English',
    route: '/journey/english',
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
} as const;
