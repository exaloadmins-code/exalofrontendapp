export {
  computeArtboardRect,
  percentRectToLayout,
} from './artboardMath';
export type { ArtboardRect, PercentRect, LayoutBox, ArtboardFitMode } from './artboardMath';
export { ResponsiveArtboard } from './ResponsiveArtboard';
export type { HotspotDef } from './ResponsiveArtboard';
export { HOME_HOTSPOTS, HOME_ARROW_HOTSPOTS, HOME_OVERLAYS, HOME_COUNT_COVER, HOME_LOGO_CLEAR_LEFT, HOME_LOGO_BOTTOM } from './homeHotspots';
export {
  JOURNEY_HOTSPOTS,
  JOURNEY_OVERLAYS,
  JOURNEY_HEADER_ROW,
  resolveJourneyRoute,
} from './journeyHotspots';
export {
  TRAIN_DIFFICULTY_HOTSPOTS,
  TRAIN_CHROME_HOTSPOTS,
  trainTopicHotspotPercent,
  resolveTrainChromeRoute,
} from './trainHotspots';
