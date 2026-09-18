import { RoutePath, Routes } from '@/constants/routes';

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type OnboardingState = {
  completed: boolean;
  currentStep: OnboardingStep;
  email: string | null;
  displayName: string | null;
  yearGroup: 'Year 4' | 'Year 5' | 'Year 6' | null;
  schoolName: string | null;
  avatarId: string | null;
};

export type UserProfile = {
  displayName: string | null;
  email: string | null;
  /**
   * Year label shown on Profile. Onboarding writes Year 4/5/6;
   * Profile edit allows free text (Lovable ProfileMenu parity).
   */
  yearGroup: string | null;
  schoolName: string | null;
  avatarId: string | null;
  streak: number;
  badgeCount: number;
  exaloScore: number;
};

export type AppBootstrapPhase =
  | 'idle'
  | 'fonts'
  | 'assets'
  | 'storage'
  | 'onboarding'
  | 'profile'
  | 'navigate'
  | 'ready'
  | 'error';

export type InitialRouteDecision = {
  /** Logical destination based on persisted state. */
  target: RoutePath;
  /** Actual href to open (falls back to Root until product screens exist). */
  href: RoutePath;
  reason: string;
};

export type AppRouteName =
  | 'root'
  | 'onboarding'
  | 'home'
  | 'maths'
  | 'train';

export { Routes };
export type { RoutePath };
