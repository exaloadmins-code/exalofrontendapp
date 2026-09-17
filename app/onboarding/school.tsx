import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ExaloSelect, OnboardingShell, PrimaryButton, SecondaryButton } from '@/components';
import { ONBOARDING_SCHOOLS, OnboardingAssets, Routes } from '@/constants';
import { useAppContext } from '@/providers';
import { useResponsive } from '@/hooks';
import { colors, fonts, typography } from '@/theme';

/**
 * Onboarding step 4 — School.
 * Selection via shared ExaloSelect dropdown (searchable — 19 local schools).
 * Dataset unchanged from Lovable / ONBOARDING_SCHOOLS.
 */
export default function OnboardingSchoolScreen() {
  const router = useRouter();
  const { onboarding, setOnboardingState } = useAppContext();
  const { s, fs } = useResponsive();
  const [school, setSchool] = useState<string | null>(onboarding.schoolName);

  useEffect(() => {
    setSchool(onboarding.schoolName);
  }, [onboarding.schoolName]);

  const handleSchoolChange = (next: string | null) => {
    setSchool(next);
    void setOnboardingState({
      ...onboarding,
      schoolName: next,
      currentStep: 4,
      completed: false,
    });
  };

  const advance = async (nextSchool: string | null) => {
    await setOnboardingState({
      ...onboarding,
      schoolName: nextSchool?.trim() ? nextSchool.trim() : null,
      currentStep: 5,
      completed: false,
    });
    router.push(Routes.OnboardingAvatar);
  };

  const handleContinue = () => {
    void advance(school);
  };

  const handleSkip = () => {
    void advance(null);
  };

  const handleBack = () => {
    void setOnboardingState({ ...onboarding, currentStep: 3, completed: false });
    router.replace(Routes.OnboardingYear);
  };

  return (
    <OnboardingShell step={4} onBack={handleBack}>
      <View>
        <View style={[styles.hero, { backgroundColor: colors.backgroundDeep }]}>
          <Image
            source={OnboardingAssets.goalAstronaut}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Astronaut with goal flag"
          />
        </View>

        <View style={[styles.form, { padding: s(24), gap: s(14) }]}>
          <Text style={[styles.title, { fontSize: fs(24), lineHeight: fs(30) }]}>
            Which <Text style={{ color: colors.orange }}>school</Text>
            {'\n'}are you targeting?
          </Text>
          <Text style={[typography.caption, { fontSize: fs(12), color: colors.textSecondary }]}>
            We'll help you prepare for your goal! 🎯
          </Text>

          <ExaloSelect
            options={ONBOARDING_SCHOOLS}
            value={school}
            onChange={handleSchoolChange}
            placeholder="Select your school"
            searchable
            searchPlaceholder="Search for your school"
            accessibilityLabel="Select your school"
            maxListHeight={s(220)}
          />

          <View style={{ flexDirection: 'row', gap: s(8), marginTop: s(4) }}>
            <View style={{ flex: 1 }}>
              <SecondaryButton
                label="Skip for now"
                onPress={handleSkip}
                style={{ minHeight: s(44), borderRadius: s(16) }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Continue"
                tone="purple"
                onPress={handleContinue}
                fullWidth
                style={{ minHeight: s(44), borderRadius: s(16) }}
              />
            </View>
          </View>
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
});
