import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingShell, PrimaryButton, TextInputField } from '@/components';
import { OnboardingAssets, Routes } from '@/constants';
import { useAppContext } from '@/providers';
import { useResponsive } from '@/hooks';
import { isValidEmail } from '@/utils';
import { colors, fonts, typography } from '@/theme';

/**
 * Onboarding step 1 — Email (Lovable Onboarding.tsx step 1).
 * Hero: TP-058 onb-rocket.png. Envelope: Text glyph (TP-069 rejected).
 */
export default function OnboardingEmailScreen() {
  const router = useRouter();
  const { onboarding, setOnboardingState } = useAppContext();
  const { s, fs } = useResponsive();
  const [email, setEmail] = useState(onboarding.email ?? '');

  useEffect(() => {
    setEmail(onboarding.email ?? '');
  }, [onboarding.email]);

  const valid = isValidEmail(email);

  const handleContinue = async () => {
    if (!valid) {
      return;
    }
    await setOnboardingState({
      ...onboarding,
      email: email.trim(),
      currentStep: 2,
      completed: false,
    });
    router.push(Routes.OnboardingName);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <OnboardingShell step={1} onBack={handleBack}>
      <View>
        <View style={styles.hero}>
          <Image
            source={OnboardingAssets.rocket}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel="Exalo rocket launching"
          />
          <Text style={[styles.brandTitle, { fontSize: fs(36), top: s(24) }]}>EXALO</Text>
          <Text style={[styles.brandTagline, { fontSize: fs(14), top: s(68), lineHeight: fs(20) }]}>
            Learn. Practice. Improve.{'\n'}
            <Text style={{ fontWeight: '700' }}>Fly High!</Text> 🚀
          </Text>
        </View>

        <View style={[styles.form, { padding: s(24), gap: s(12) }]}>
          <Text style={[typography.caption, { fontSize: fs(14), textAlign: 'center', color: colors.textSecondary }]}>
            Let's start your <Text style={{ color: colors.orange, fontWeight: '700' }}>learning journey!</Text> ✨
          </Text>

          <TextInputField
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="done"
            onSubmitEditing={handleContinue}
            leftIcon={<Text style={{ fontSize: fs(16), color: colors.textMuted }}>✉</Text>}
            containerStyle={{ marginBottom: s(4) }}
            accessibilityLabel="Email"
          />

          <PrimaryButton
            label="Continue"
            tone="blue"
            disabled={!valid}
            onPress={handleContinue}
            fullWidth
            style={{ minHeight: s(48), borderRadius: s(16) }}
          />

          <Text
            style={[
              typography.caption,
              {
                fontSize: fs(10),
                color: colors.textMuted,
                textAlign: 'center',
                marginTop: s(4),
                lineHeight: fs(14),
              },
            ]}
          >
            By continuing, you agree to Exalo's Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundDeep,
    overflow: 'hidden',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  brandTagline: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.display,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
  },
  form: {
    backgroundColor: colors.backgroundCard,
  },
});
