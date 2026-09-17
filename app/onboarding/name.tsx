import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell, PrimaryButton, TextInputField } from '@/components';
import { OnboardingAssets, Routes } from '@/constants';
import { useAppContext } from '@/providers';
import { useResponsive } from '@/hooks';
import { colors, fonts, typography } from '@/theme';

/**
 * Onboarding step 2 — Name (Lovable Onboarding.tsx step 2).
 * Hero: TP-059 onb-astronaut-wave.png.
 * Must NOT mark onboarding completed or navigate to Home.
 */
export default function OnboardingNameScreen() {
  const router = useRouter();
  const { onboarding, setOnboardingState } = useAppContext();
  const { s, fs } = useResponsive();
  const [name, setName] = useState(onboarding.displayName ?? '');

  useEffect(() => {
    setName(onboarding.displayName ?? '');
  }, [onboarding.displayName]);

  const canContinue = name.trim().length > 0;

  const handleContinue = async () => {
    if (!canContinue) {
      return;
    }
    await setOnboardingState({
      ...onboarding,
      displayName: name.trim(),
      currentStep: 3,
      completed: false,
    });
    router.push(Routes.OnboardingYear);
  };

  const handleBack = () => {
    void setOnboardingState({ ...onboarding, currentStep: 1, completed: false });
    router.replace(Routes.OnboardingEmail);
  };

  return (
    <OnboardingShell step={2} onBack={handleBack}>
      <View>
        <View style={[styles.hero, { backgroundColor: colors.backgroundDeep }]}>
          <Image
            source={OnboardingAssets.astronautWave}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Astronaut waving hello"
          />
          <View style={[styles.hiChip, { top: s(16), right: s(16), paddingHorizontal: s(12), paddingVertical: s(6) }]}>
            <Text style={{ fontFamily: fonts.display, fontSize: fs(12), color: colors.textPrimary }}>
              Hi there! 👋
            </Text>
          </View>
        </View>

        <View style={[styles.form, { padding: s(24), gap: s(16) }]}>
          <Text style={[styles.title, { fontSize: fs(24), lineHeight: fs(30) }]}>
            What would you{'\n'}like to be <Text style={{ color: colors.orange }}>called?</Text>
          </Text>
          <Text style={[typography.caption, { fontSize: fs(12), color: colors.textSecondary }]}>
            This is how we'll cheer for you.
          </Text>

          <TextInputField
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            accessibilityLabel="Display name"
          />

          <Text style={[typography.caption, { fontSize: fs(11), color: colors.textSecondary }]}>
            Pick a name you like — you'll see it everywhere!
          </Text>

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
  hiChip: {
    position: 'absolute',
    backgroundColor: colors.backgroundCard,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderMuted,
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
