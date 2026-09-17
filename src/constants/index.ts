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
export { Routes, IMPLEMENTED_ROUTES } from './routes';
export type { RoutePath } from './routes';
