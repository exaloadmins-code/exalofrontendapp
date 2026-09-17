import { Image } from 'react-native';
import { Asset } from 'expo-asset';
import {
  AstronautAssets,
  AvatarAssets,
  BackgroundAssets,
  BrandingAssets,
  DecorativeAssets,
  GamificationAssets,
  HomeAssets,
  JourneyAssets,
  MiscellaneousAssets,
  NavigationAssets,
  OnboardingAssets,
  PlanetAssets,
  RocketAssets,
  SubjectAssets,
  assets,
} from '@/constants/assets';

type ModuleId = number;

/**
 * Flatten every registered image module for prefetch / Asset.loadAsync.
 * Keep requires centralised in `src/constants/assets.ts` only.
 */
export function collectImageModules(): ModuleId[] {
  const buckets = [
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
    GamificationAssets,
    NavigationAssets,
    DecorativeAssets,
    MiscellaneousAssets,
  ] as const;

  const modules: ModuleId[] = [];

  for (const bucket of buckets) {
    for (const value of Object.values(bucket)) {
      if (typeof value === 'number') {
        modules.push(value);
      }
    }
  }

  return modules;
}

/**
 * Prefetch / decode registered EXALO images before first paint of product UI.
 */
export async function preloadImageAssets(): Promise<ModuleId[]> {
  const modules = collectImageModules();
  if (modules.length === 0) {
    return modules;
  }

  await Asset.loadAsync(modules);

  await Promise.all(
    modules.map(
      (moduleId) =>
        new Promise<void>((resolve) => {
          const resolved = Image.resolveAssetSource(moduleId);
          if (!resolved?.uri) {
            resolve();
            return;
          }
          Image.prefetch(resolved.uri)
            .catch(() => undefined)
            .finally(() => resolve());
        }),
    ),
  );

  return modules;
}

export { assets };
