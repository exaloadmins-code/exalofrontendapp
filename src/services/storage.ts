import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingState, UserProfile } from '@/types';
import { defaultOnboardingState, sanitizeOnboardingState } from './onboardingState';

export { defaultOnboardingState, sanitizeOnboardingState } from './onboardingState';

const KEYS = {
  onboarding: '@exalo/onboarding',
  profile: '@exalo/profile',
  bootstrapped: '@exalo/bootstrapped',
} as const;

export const defaultProfile = (): UserProfile => ({
  displayName: null,
  email: null,
  yearGroup: null,
  schoolName: null,
  avatarId: null,
  streak: 0,
  badgeCount: 0,
  exaloScore: 0,
});

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/**
 * Thin AsyncStorage facade for EXALO persistence.
 */
export const storage = {
  async init(): Promise<void> {
    await AsyncStorage.getItem(KEYS.bootstrapped);
    await AsyncStorage.setItem(KEYS.bootstrapped, '1');
  },

  async getOnboarding(): Promise<OnboardingState> {
    const raw = await readJson<OnboardingState>(KEYS.onboarding, defaultOnboardingState());
    return sanitizeOnboardingState(raw);
  },

  async setOnboarding(state: OnboardingState): Promise<void> {
    await writeJson(KEYS.onboarding, sanitizeOnboardingState(state));
  },

  async clearOnboarding(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.onboarding);
  },

  async getProfile(): Promise<UserProfile> {
    return readJson(KEYS.profile, defaultProfile());
  },

  async setProfile(profile: UserProfile): Promise<void> {
    await writeJson(KEYS.profile, profile);
  },

  async clearProfile(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.profile);
  },

  /** Clears local onboarding + profile only (no backend / DB). */
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.onboarding, KEYS.profile, KEYS.bootstrapped]);
  },

  /** Development reset of local identity bootstrap. */
  async resetOnboardingSession(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.onboarding, KEYS.profile]);
  },
};

export type StorageService = typeof storage;
