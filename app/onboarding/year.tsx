import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell, PrimaryButton } from '@/components';
import { ONBOARDING_YEARS, OnboardingAssets, Routes, type OnboardingYearOption } from '@/constants';
import { useAppContext } from '@/providers';
import { useResponsive } from '@/hooks';
import { colors, fonts, typography } from '@/theme';

/**
 * Onboarding step 3 — Year (Lovable Onboarding.tsx step 3).
 * Hero: TP-058 onb-rocket.png. Options: Year 4 / 5 / 6 only.
 */
export default function OnboardingYearScreen() {
  const router = useRouter();
  const { onboarding, setOnboardingState } = useAppContext();
  const { s, fs } = useResponsive();
  const [year, setYear] = useState<OnboardingYearOption | ''>(onboarding.yearGroup ?? '');

  useEffect(() => {
    setYear(onboarding.yearGroup ?? '');
  }, [onboarding.yearGroup]);

  const canContinue = !!year;

  const handleContinue = async () => {
    if (!year) {
      return;
    }
    await setOnboardingState({
      ...onboarding,
      yearGroup: year,
      currentStep: 4,
      completed: false,
    });
    router.push(Routes.OnboardingSchool);
  };

  const handleBack = () => {
    void setOnboardingState({ ...onboarding, currentStep: 2, completed: false });
    router.replace(Routes.OnboardingName);
  };

  return (
    <OnboardingShell step={3} onBack={handleBack}>
      <View>
        <View style={[styles.hero, { backgroundColor: colors.backgroundDeep }]}>
          <Image
            source={OnboardingAssets.rocket}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Rocket"
          />
        </View>

        <View style={[styles.form, { padding: s(24), gap: s(16) }]}>
          <Text style={[styles.title, { fontSize: fs(24), lineHeight: fs(30) }]}>
            Which <Text style={{ color: colors.orange }}>year</Text>
            {'\n'}are you in?
          </Text>
          <Text style={[typography.caption, { fontSize: fs(12), color: colors.textSecondary }]}>
            We'll tailor everything just for you!
          </Text>

          <View style={[styles.grid, { gap: s(12) }]}>
            {ONBOARDING_YEARS.map((y) => {
              const selected = year === y;
              return (
                <Pressable
                  key={y}
                  onPress={() => setYear(y)}
                  style={[
                    styles.yearChip,
                    {
                      minHeight: s(48),
                      borderRadius: s(16),
                      borderColor: selected ? colors.orange : colors.borderMuted,
                      backgroundColor: selected ? 'rgba(255,138,60,0.15)' : 'rgba(36,51,86,0.4)',
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: fonts.display,
                      fontSize: fs(14),
                      fontWeight: '600',
                      color: selected ? colors.textPrimary : colors.textSecondary,
                    }}
                  >
                    {y}
                  </Text>
                  {selected ? (
                    <Text style={{ color: colors.orange, fontSize: fs(14), marginLeft: 6 }}>✓</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            label="Continue"
            tone="purple"
            disabled={!canContinue}
            onPress={handleContinue}
            fullWidth
            style={{ minHeight: s(48), borderRadius: s(16) }}
          />
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  form: {
    backgroundColor: colors.backgroundCard,
  },
  title: {
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearChip: {
    width: '48%',
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
