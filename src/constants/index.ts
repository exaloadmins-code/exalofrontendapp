export {
  assets,
  BrandingAssets,
  BackgroundAssets,
  HomeAssets,
  JourneyAssets,
  PlanetAssets,
  RocketAssets,
  AstronautAssets,
  AvatarAssets,
  OnboardingAssets,
  SubjectAssets,
  MathsTopicAssets,
  GamificationAssets,
  NavigationAssets,
  DecorativeAssets,
  MiscellaneousAssets,
} from './assets';
export {
  ONBOARDING_TOTAL_STEPS,
  ONBOARDING_YEARS,
  ONBOARDING_SCHOOLS,
  ONBOARDING_AVATARS,
  resolveAvatarSource,
} from './onboarding';
export type { OnboardingYearOption, OnboardingAvatarId } from './onboarding';
export {
  JOURNEY_SUBJECTS,
  JOURNEY_SUBJECT_CONFIG,
  JOURNEY_HEADER_COPY,
  JOURNEY_HEADER_STYLE,
  JOURNEY_PROFILE_PILL_STYLE,
  normalizeJourneySubject,
  journeySubjectLabel,
  journeyTitle,
  journeyPathSubtitle,
} from './journey';
export type { JourneySubject } from './journey';
export {
  STREAK_GOAL_MINUTES,
  FREEZE_CAP,
  FREEZE_INITIAL,
  GRACE_WINDOW_DAYS,
  RESET_AFTER_DAYS,
  STREAK_HISTORY_DAYS,
  STREAK_CONTENT_MAX_WIDTH,
  STREAK_PAGE_PADDING_X,
  STREAK_CTA_PADDING_X,
  STREAK_DAY_LABELS,
  STREAK_INSIGHT_DEMO,
  STREAK_COPY,
} from './streak';
export {
  BADGES,
  BADGE_FILTERS,
  BADGE_GROUPS,
  BADGES_CONTENT_MAX_WIDTH,
  BADGES_PAGE_PADDING_X,
  BADGES_COPY,
  RARITY_STYLES,
  getBadgeStats,
} from './badges';
export type {
  Badge,
  BadgeStatus,
  BadgeRarity,
  BadgeCategory,
  BadgeGroup,
  BadgeFilter,
} from './badges';
export {
  SCORE_CONTENT_MAX_WIDTH,
  SCORE_PAGE_PADDING_X,
  SCORE_COPY,
  SCORE_HERO_VALUE,
  SCORE_HERO_MAX,
  SCORE_BREAKDOWN,
} from './score';
export type { ScoreBreakdownItem } from './score';
export {
  PROFILE_CONTENT_MAX_WIDTH,
  PROFILE_PAGE_PADDING_X,
  PROFILE_COPY,
  SUPPORT_EMAIL,
  PROFILE_ACCENT_STYLES,
} from './profile';
export type { ProfileAccent } from './profile';
export {
  PARENTS_CONTENT_MAX_WIDTH,
  PARENTS_PAGE_PADDING_X,
  PARENTS_COPY,
  PARENTS_WEEKLY,
  PARENTS_EXALO_SCORE,
} from './parents';
export type { ParentsAccent } from './parents';
export { Routes, IMPLEMENTED_ROUTES } from './routes';
export type { RoutePath } from './routes';
