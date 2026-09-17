import { IMPLEMENTED_ROUTES, Routes, type RoutePath } from '@/constants/routes';
import type { InitialRouteDecision, OnboardingState, UserProfile } from '@/types';

/**
 * Decide where bootstrap should land based on persisted state.
 */
export function resolveInitialRoute(
  onboarding: OnboardingState,
  _profile: UserProfile,
): InitialRouteDecision {
  if (!onboarding.completed) {
    const target = stepToRoute(onboarding.currentStep);
    return {
      target,
      href: toImplementedHref(target),
      reason: `Onboarding incomplete (step ${onboarding.currentStep})`,
    };
  }

  return {
    target: Routes.Home,
    href: Routes.Home,
    reason: 'Onboarding complete — open Home',
  };
}

export function stepToRoute(step: OnboardingState['currentStep']): RoutePath {
  switch (step) {
    case 1:
      return Routes.OnboardingEmail;
    case 2:
      return Routes.OnboardingName;
    case 3:
      return Routes.OnboardingYear;
    case 4:
      return Routes.OnboardingSchool;
    case 5:
      return Routes.OnboardingAvatar;
    default:
      return Routes.Onboarding;
  }
}

/**
 * Until product screens are mounted, fall back to the root gallery/bootstrap route.
 */
export function toImplementedHref(target: RoutePath): RoutePath {
  if (IMPLEMENTED_ROUTES.has(target)) {
    return target;
  }
  return Routes.Root;
}

export function isRouteImplemented(path: string): boolean {
  return IMPLEMENTED_ROUTES.has(path);
}
