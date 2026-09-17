/**
 * Canonical Expo Router paths for EXALO.
 */
export const Routes = {
  Root: '/',
  Gallery: '/gallery',
  Onboarding: '/onboarding',
  OnboardingEmail: '/onboarding/email',
  OnboardingName: '/onboarding/name',
  OnboardingYear: '/onboarding/year',
  OnboardingSchool: '/onboarding/school',
  OnboardingAvatar: '/onboarding/avatar',
  Home: '/home',
  JourneyMaths: '/journey/maths',
  JourneyEnglish: '/journey/english',
  Streak: '/streak',
  Badges: '/badges',
  Score: '/score',
  Parents: '/parents',
  Profile: '/profile',
  Maths: '/maths',
  Train: '/train',
} as const;

export type RoutePath = (typeof Routes)[keyof typeof Routes];

/** Routes that currently have a mounted screen module. */
export const IMPLEMENTED_ROUTES: ReadonlySet<string> = new Set([
  Routes.Root,
  Routes.Gallery,
  Routes.OnboardingEmail,
  Routes.OnboardingName,
  Routes.OnboardingYear,
  Routes.OnboardingSchool,
  Routes.OnboardingAvatar,
  Routes.Home,
  Routes.JourneyMaths,
  Routes.JourneyEnglish,
  Routes.Streak,
  Routes.Badges,
  Routes.Score,
  Routes.Parents,
  Routes.Profile,
]);
