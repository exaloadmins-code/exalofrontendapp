/**
 * Lovable onboarding catalogue — keep in lockstep with
 * C:\projects\exalo\src\pages\Onboarding.tsx
 */
import { AvatarAssets } from './assets';

export const ONBOARDING_TOTAL_STEPS = 5 as const;

export const ONBOARDING_YEARS = ['Year 4', 'Year 5', 'Year 6'] as const;
export type OnboardingYearOption = (typeof ONBOARDING_YEARS)[number];

export const ONBOARDING_SCHOOLS = [
  'King Edward VI Grammar School',
  "St Olave's Grammar School",
  'North London Collegiate School',
  'Westminster School',
  'Eton College',
  'Harrow School',
  'Tiffin School',
  "Tiffin Girls' School",
  'Henrietta Barnett School',
  "Queen Elizabeth's School, Barnet",
  "Wilson's School",
  'Sutton Grammar School',
  'Reading School',
  'Kendrick School',
  'Manchester Grammar School',
  'Latymer School',
  'City of London School',
  'Dulwich College',
  "St Paul's School",
] as const;

export const ONBOARDING_AVATARS = [
  { id: 'a1', source: AvatarAssets.avatar1 },
  { id: 'a2', source: AvatarAssets.avatar2 },
  { id: 'a3', source: AvatarAssets.avatar3 },
  { id: 'a4', source: AvatarAssets.avatar4 },
  { id: 'a5', source: AvatarAssets.avatar5 },
  { id: 'a6', source: AvatarAssets.avatar6 },
] as const;

export type OnboardingAvatarId = (typeof ONBOARDING_AVATARS)[number]['id'];

/**
 * Maps persisted `avatarId` (onboarding / profile) to an approved AvatarAssets source.
 * Returns null when missing or unknown — callers may show the intentional letter fallback.
 */
export function resolveAvatarSource(avatarId: string | null | undefined) {
  const id = avatarId?.trim();
  if (!id) {
    return null;
  }
  const match = ONBOARDING_AVATARS.find((item) => item.id === id);
  return match?.source ?? null;
}
