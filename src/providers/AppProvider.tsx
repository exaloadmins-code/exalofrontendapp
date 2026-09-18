import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { Href, usePathname, useRootNavigationState, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { AssetProvider } from './AssetProvider';
import { ThemeProvider } from './ThemeProvider';
import { Routes } from '@/constants/routes';
import { resolveInitialRoute } from '@/navigation';
import { preloadImageAssets } from '@/services/assets';
import { defaultOnboardingState, defaultProfile, storage } from '@/services/storage';
import { colors, typography } from '@/theme';
import type {
  AppBootstrapPhase,
  InitialRouteDecision,
  OnboardingState,
  UserProfile,
} from '@/types';

/** Register custom fonts here when brand faces are added to /assets/fonts. */
const CUSTOM_FONTS: Record<string, number> = {
  /** TP-001 Fredoka (OFL-1.1) — variable wdth/wght; use fontWeight 500–700. */
  Fredoka: require('../../assets/fonts/Fredoka-wdth-wght.ttf'),
};

type AppContextValue = {
  isReady: boolean;
  phase: AppBootstrapPhase;
  error: string | null;
  onboarding: OnboardingState;
  profile: UserProfile;
  initialRoute: InitialRouteDecision | null;
  refreshSession: () => Promise<void>;
  setOnboardingState: (next: OnboardingState) => Promise<void>;
  setProfileState: (next: UserProfile) => Promise<void>;
  /** __DEV__ only — clears local onboarding/profile and returns to Email. */
  resetOnboardingDev: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

type AppProviderProps = {
  children: ReactNode;
};

function urlRequestsOnboardingReset(url: string | null): boolean {
  if (!url) {
    return false;
  }
  try {
    const parsed = Linking.parse(url);
    const q = parsed.queryParams ?? {};
    const flag = q.resetOnboarding ?? q.reset;
    const value = Array.isArray(flag) ? flag[0] : flag;
    return value === '1' || value === 'true';
  } catch {
    return url.includes('resetOnboarding=1') || url.includes('reset=1');
  }
}

async function shouldResetOnboardingDev(): Promise<boolean> {
  if (!__DEV__) {
    return false;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('resetOnboarding') === '1' || params.get('reset') === '1') {
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  const initial = await Linking.getInitialURL();
  return urlRequestsOnboardingReset(initial);
}

/**
 * Bootstraps EXALO in order:
 * 1. fonts
 * 2. image assets
 * 3. AsyncStorage (+ optional __DEV__ reset)
 * 4. onboarding state
 * 5. profile
 * 6. navigate to the correct route
 */
export function AppProvider({ children }: AppProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const navigationState = useRootNavigationState();
  const [phase, setPhase] = useState<AppBootstrapPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingState>(defaultOnboardingState);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [initialRoute, setInitialRoute] = useState<InitialRouteDecision | null>(null);
  const [isReady, setIsReady] = useState(false);
  /** Apply bootstrap route once per bootstrap cycle — never fight Avatar→Home replace. */
  const initialNavAppliedRef = useRef(false);

  const bootstrap = useCallback(async () => {
    try {
      setError(null);
      setIsReady(false);
      setAssetsReady(false);
      initialNavAppliedRef.current = false;

      setPhase('fonts');
      if (Object.keys(CUSTOM_FONTS).length > 0) {
        try {
          const Font = await import('expo-font');
          await Promise.race([
            Font.loadAsync(CUSTOM_FONTS),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Font load timed out')), 10000);
            }),
          ]);
        } catch (fontError) {
          console.warn('[EXALO] Font load skipped:', fontError);
        }
      }

      setPhase('assets');
      await preloadImageAssets();
      setAssetsReady(true);

      setPhase('storage');
      await storage.init();

      if (await shouldResetOnboardingDev()) {
        await storage.resetOnboardingSession();
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete('resetOnboarding');
            url.searchParams.delete('reset');
            window.history.replaceState({}, '', url.pathname + url.search + url.hash);
          } catch {
            /* ignore */
          }
        }
      }

      setPhase('onboarding');
      const onboardingState = await storage.getOnboarding();
      setOnboarding(onboardingState);

      setPhase('profile');
      const profileState = await storage.getProfile();
      setProfile(profileState);

      setPhase('navigate');
      const decision = resolveInitialRoute(onboardingState, profileState);
      setInitialRoute(decision);

      setPhase('ready');
      setIsReady(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialise EXALO';
      setError(message);
      setPhase('error');
      setAssetsReady(true);
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!navigationState?.key) {
      return;
    }
    if (!isReady || !initialRoute || phase === 'error') {
      return;
    }
    if (initialNavAppliedRef.current) {
      return;
    }
    initialNavAppliedRef.current = true;

    /**
     * Preserve deep links / refresh on feature screens (M8 `/badges`, `/streak`,
     * journey, etc.). Only force bootstrap navigation from `/`, or when
     * onboarding is still incomplete (must land on the correct step).
     */
    const needsOnboarding = initialRoute.href.startsWith('/onboarding');
    const onRoot = !pathname || pathname === '/';
    if (!needsOnboarding && !onRoot) {
      return;
    }

    router.replace(initialRoute.href as Href);
  }, [navigationState?.key, isReady, initialRoute, phase, router, pathname]);

  const setOnboardingState = useCallback(async (next: OnboardingState) => {
    setOnboarding(next);
    await storage.setOnboarding(next);
  }, []);

  const setProfileState = useCallback(async (next: UserProfile) => {
    setProfile(next);
    await storage.setProfile(next);
  }, []);

  const resetOnboardingDev = useCallback(async () => {
    if (!__DEV__) {
      return;
    }
    await storage.resetOnboardingSession();
    const fresh = defaultOnboardingState();
    const freshProfile = defaultProfile();
    setOnboarding(fresh);
    setProfile(freshProfile);
    initialNavAppliedRef.current = false;
    setInitialRoute({
      target: Routes.OnboardingEmail,
      href: Routes.OnboardingEmail,
      reason: 'DEV reset — restart onboarding at Email',
    });
    router.replace(Routes.OnboardingEmail as Href);
    // Mark applied so bootstrap effect does not immediately fight this replace.
    initialNavAppliedRef.current = true;
  }, [router]);

  const value = useMemo<AppContextValue>(
    () => ({
      isReady,
      phase,
      error,
      onboarding,
      profile,
      initialRoute,
      refreshSession: bootstrap,
      setOnboardingState,
      setProfileState,
      resetOnboardingDev,
    }),
    [
      isReady,
      phase,
      error,
      onboarding,
      profile,
      initialRoute,
      bootstrap,
      setOnboardingState,
      setProfileState,
      resetOnboardingDev,
    ],
  );

  const showSplash = phase !== 'ready' && phase !== 'error';

  return (
    <ThemeProvider>
      <AssetProvider ready={assetsReady}>
        <AppContext.Provider value={value}>
          {children}
          {showSplash ? <BootstrapSplash phase={phase} /> : null}
          {phase === 'error' ? <BootstrapError message={error} onRetry={bootstrap} /> : null}
        </AppContext.Provider>
      </AssetProvider>
    </ThemeProvider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
}

function BootstrapSplash({ phase }: { phase: AppBootstrapPhase }) {
  return (
    <View style={styles.splash} pointerEvents="auto">
      <ActivityIndicator size="large" color={colors.orange} />
      <Text style={styles.splashTitle}>EXALO</Text>
      <Text style={styles.splashCaption}>Initialising · {phase}</Text>
    </View>
  );
}

function BootstrapError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <View style={styles.splash} pointerEvents="auto">
      <Text style={styles.splashTitle}>Launch interrupted</Text>
      <Text style={styles.splashCaption}>{message ?? 'Unknown error'}</Text>
      <Text style={styles.retry} onPress={onRetry}>
        Tap to retry
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
    zIndex: 100,
  },
  splashTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  splashCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retry: {
    ...typography.button,
    color: colors.orange,
    marginTop: 8,
  },
});
