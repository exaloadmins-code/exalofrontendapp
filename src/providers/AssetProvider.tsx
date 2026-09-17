import { ReactNode, createContext, useContext, useMemo } from 'react';
import {
  AstronautAssets,
  AvatarAssets,
  BackgroundAssets,
  BrandingAssets,
  DecorativeAssets,
  GamificationAssets,
  MiscellaneousAssets,
  NavigationAssets,
  OnboardingAssets,
  PlanetAssets,
  RocketAssets,
  SubjectAssets,
  assets,
} from '@/constants/assets';

export type AssetRegistry = typeof assets;

type AssetContextValue = {
  ready: boolean;
  assets: AssetRegistry;
  branding: typeof BrandingAssets;
  backgrounds: typeof BackgroundAssets;
  planets: typeof PlanetAssets;
  rockets: typeof RocketAssets;
  astronauts: typeof AstronautAssets;
  avatars: typeof AvatarAssets;
  onboarding: typeof OnboardingAssets;
  subjects: typeof SubjectAssets;
  gamification: typeof GamificationAssets;
  navigation: typeof NavigationAssets;
  decorative: typeof DecorativeAssets;
  miscellaneous: typeof MiscellaneousAssets;
};

const AssetContext = createContext<AssetContextValue | null>(null);

type AssetProviderProps = {
  children: ReactNode;
  ready: boolean;
};

/**
 * Exposes the central image registry after bootstrap preload completes.
 * Screens should consume this instead of scattering `require()` calls.
 */
export function AssetProvider({ children, ready }: AssetProviderProps) {
  const value = useMemo<AssetContextValue>(
    () => ({
      ready,
      assets,
      branding: BrandingAssets,
      backgrounds: BackgroundAssets,
      planets: PlanetAssets,
      rockets: RocketAssets,
      astronauts: AstronautAssets,
      avatars: AvatarAssets,
      onboarding: OnboardingAssets,
      subjects: SubjectAssets,
      gamification: GamificationAssets,
      navigation: NavigationAssets,
      decorative: DecorativeAssets,
      miscellaneous: MiscellaneousAssets,
    }),
    [ready],
  );

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
}

export function useAssetContext(): AssetContextValue {
  const ctx = useContext(AssetContext);
  if (!ctx) {
    throw new Error('useAssetContext must be used within AssetProvider');
  }
  return ctx;
}
