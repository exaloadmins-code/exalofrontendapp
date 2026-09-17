import type { OnboardingState, OnboardingStep } from '@/types';

export const defaultOnboardingState = (): OnboardingState => ({
  completed: false,
  currentStep: 1,
  email: null,
  displayName: null,
  yearGroup: null,
  schoolName: null,
  avatarId: null,
});

/**
 * True only when all required five-step fields exist.
 * School is optional (Lovable "Skip for now").
 */
export function isLegitimateOnboardingComplete(state: OnboardingState): boolean {
  return Boolean(
    state.email?.trim() &&
      state.displayName?.trim() &&
      state.yearGroup &&
      state.avatarId?.trim(),
  );
}

/**
 * Derive the first unfinished step from persisted fields.
 * Used to repair stale M1 `completed: true` stubs and keep resume consistent.
 */
export function deriveOnboardingStep(state: OnboardingState): OnboardingStep {
  if (!state.email?.trim()) {
    return 1;
  }
  if (!state.displayName?.trim()) {
    return 2;
  }
  if (!state.yearGroup) {
    return 3;
  }
  if (!state.avatarId?.trim()) {
    return state.currentStep === 5 ? 5 : 4;
  }
  return 5;
}

/**
 * Normalize storage after M1 Name-stub pollution and partial fills.
 * `completed` means ALL required steps finished — never "reached Name".
 */
export function sanitizeOnboardingState(raw: Partial<OnboardingState> | null | undefined): OnboardingState {
  const merged: OnboardingState = {
    ...defaultOnboardingState(),
    ...(raw ?? {}),
  };

  if (merged.completed && !isLegitimateOnboardingComplete(merged)) {
    merged.completed = false;
  }

  if (!merged.completed) {
    merged.currentStep = deriveOnboardingStep(merged);
  }

  return merged;
}
