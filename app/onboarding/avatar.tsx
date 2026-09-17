import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { OnboardingShell, PrimaryButton } from '@/components';
import { ONBOARDING_AVATARS, Routes } from '@/constants';
import { useAppContext } from '@/providers';
import { useResponsive } from '@/hooks';
import { colors, fonts, typography } from '@/theme';

/**
 * Onboarding step 5 — Avatar (Lovable Onboarding.tsx step 5).
 * Assets: TP-025…TP-030. Only this screen may set completed: true → Home.
 */
export default function OnboardingAvatarScreen() {
  const router = useRouter();
  const { onboarding, profile, setOnboardingState, setProfileState } = useAppContext();
  const { s, fs } = useResponsive();
  const [avatar, setAvatar] = useState(onboarding.avatarId ?? '');

  useEffect(() => {
    setAvatar(onboarding.avatarId ?? '');
  }, [onboarding.avatarId]);

  const canFinish = !!avatar;

  const handleFinish = async () => {
    if (!avatar) {
      return;
    }

    const completedState = {
      ...onboarding,
      avatarId: avatar,
      currentStep: 5 as const,
      completed: true,
    };

    await setOnboardingState(completedState);
    await setProfileState({
      ...profile,
      displayName: onboarding.displayName,
      email: onboarding.email,
      yearGroup: onboarding.yearGroup,
      schoolName: onboarding.schoolName,
      avatarId: avatar,
    });

    router.replace(Routes.Home as Href);
  };

  const handleBack = () => {
    void setOnboardingState({
      ...onboarding,
      currentStep: 4,
      completed: false,
    });
    router.replace(Routes.OnboardingSchool);
  };

  return (
    <OnboardingShell step={5} onBack={handleBack}>
      <View style={[styles.form, { padding: s(24), gap: s(20) }]}>
        <View>
          <Text style={[styles.title, { fontSize: fs(24), lineHeight: fs(30) }]}>
            Pick an <Text style={{ color: colors.orange }}>avatar</Text>
            {'\n'}to represent you!
          </Text>
          <Text
            style={[
              typography.caption,
              { fontSize: fs(12), color: colors.textSecondary, marginTop: s(4) },
            ]}
          >
            Choose your space explorer 🚀
          </Text>
        </View>

        <View style={[styles.grid, { gap: s(12) }]}>
          {ONBOARDING_AVATARS.map((item) => {
            const selected = avatar === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setAvatar(item.id)}
                style={[
                  styles.avatarCell,
                  {
                    width: '30%',
                    flexGrow: 1,
                    aspectRatio: 1,
                    borderRadius: s(16),
                    borderWidth: 2,
                    borderColor: selected ? colors.orange : colors.borderMuted,
                    backgroundColor: colors.backgroundDeep,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Avatar ${item.id}`}
              >
                <Image source={item.source} style={styles.avatarImage} resizeMode="cover" />
                {selected ? (
                  <View style={[styles.check, { width: s(20), height: s(20), borderRadius: s(10) }]}>
                    <Text style={{ color: colors.white, fontSize: fs(11), fontWeight: '700' }}>✓</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton
          label="Let's Go! 🚀"
          tone="purple"
          disabled={!canFinish}
          onPress={handleFinish}
          showChevron={false}
          fullWidth
          style={{ minHeight: s(48), borderRadius: s(16) }}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
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
  avatarCell: {
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  check: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
