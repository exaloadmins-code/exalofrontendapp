import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  OnboardingShell,
  PrimaryButton,
  SecondaryButton,
  TextInputField,
} from '@/components';
import { ONBOARDING_SCHOOLS, OnboardingAssets, Routes } from '@/constants';
import { useAppContext } from '@/providers';
import { useResponsive } from '@/hooks';
import { colors, fonts, typography } from '@/theme';

/**
 * Onboarding step 4 — School.
 *
 * Searchable free-text combobox: suggestions attach under the input when open.
 * Custom school names allowed (trimmed string only — no IDs, no list mutation).
 * Dataset unchanged from ONBOARDING_SCHOOLS.
 */
export default function OnboardingSchoolScreen() {
  const router = useRouter();
  const { onboarding, setOnboardingState } = useAppContext();
  const { s, fs } = useResponsive();
  const [school, setSchool] = useState(onboarding.schoolName ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSchool(onboarding.schoolName ?? '');
  }, [onboarding.schoolName]);

  const query = school.trim().toLowerCase();

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const name of ONBOARDING_SCHOOLS) {
      if (seen.has(name)) {
        continue;
      }
      seen.add(name);
      if (!query || name.toLowerCase().includes(query)) {
        out.push(name);
      }
    }
    return out;
  }, [query]);

  /** Open + has matches — collapse entirely on zero matches (custom text still valid). */
  const showDropdown = open && suggestions.length > 0;

  const listMax = s(220);
  const radius = s(16);

  const handleChangeText = (next: string) => {
    setSchool(next);
    setOpen(true);
  };

  /**
   * Single authoritative selection path.
   * Do not close the dropdown from TextInput onBlur — on touch devices blur
   * fires before Pressable.onPress, and any deferred close unmounts the row
   * before the press completes (blocking selection).
   */
  const selectSchool = (name: string) => {
    setSchool(name);
    setOpen(false);
  };

  const advance = async (nextSchool: string | null) => {
    setOpen(false);
    await setOnboardingState({
      ...onboarding,
      schoolName: nextSchool,
      currentStep: 5,
      completed: false,
    });
    router.push(Routes.OnboardingAvatar);
  };

  const canContinue = school.trim().length > 0;

  const handleContinue = () => {
    const trimmed = school.trim();
    if (!trimmed) return;
    void advance(trimmed);
  };

  /** Existing Expo semantics: Skip clears school (does not keep partial typed text). */
  const handleSkip = () => {
    void advance(null);
  };

  const handleBack = () => {
    setOpen(false);
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

          <View
            style={{
              zIndex: showDropdown ? 20 : 1,
              elevation: showDropdown ? 8 : 0,
            }}
          >
            <TextInputField
              value={school}
              onChangeText={handleChangeText}
              placeholder="Search for your school"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              onFocus={() => setOpen(true)}
              accessibilityLabel="School name"
              bottomCornerRadius={showDropdown ? 0 : undefined}
              disableFocusRing={showDropdown}
              leftIcon={
                <Text
                  style={{ fontSize: fs(14), color: colors.textMuted }}
                  accessibilityElementsHidden
                >
                  ⌕
                </Text>
              }
              belowControl={
                showDropdown ? (
                  <View
                    style={[
                      styles.panel,
                      {
                        // Same outer width as the TextInput chrome (shared parent).
                        // Top edge omitted — input bottom border is the single seam.
                        borderWidth: 2,
                        borderTopWidth: 0,
                        borderColor: colors.inputRing,
                        borderBottomLeftRadius: radius,
                        borderBottomRightRadius: radius,
                        backgroundColor: colors.inputBackground,
                        maxHeight: listMax,
                        overflow: 'hidden',
                      },
                    ]}
                  >
                    <ScrollView
                      nestedScrollEnabled
                      // "always" keeps the keyboard from consuming the first tap so
                      // suggestion Pressables receive the press while keyboard is open.
                      keyboardShouldPersistTaps="always"
                      showsVerticalScrollIndicator={false}
                      showsHorizontalScrollIndicator={false}
                      style={{ maxHeight: listMax, backgroundColor: colors.inputBackground }}
                      contentContainerStyle={{ paddingBottom: s(6) }}
                    >
                      {suggestions.map((name) => {
                        const isSelected = school.trim() === name;
                        return (
                          <Pressable
                            key={name}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            accessibilityLabel={name}
                            onPress={() => selectSchool(name)}
                            style={({ pressed }) => [
                              styles.suggestion,
                              {
                                minHeight: s(44),
                                paddingHorizontal: s(16),
                                paddingVertical: s(10),
                                backgroundColor: isSelected
                                  ? 'rgba(255,138,60,0.15)'
                                  : pressed
                                    ? 'rgba(36,51,86,0.55)'
                                    : 'transparent',
                                borderLeftWidth: isSelected ? 3 : 0,
                                borderLeftColor: colors.orange,
                              },
                            ]}
                          >
                            <Text
                              style={{
                                flex: 1,
                                fontFamily: fonts.display,
                                fontSize: fs(14),
                                fontWeight: isSelected ? '600' : '500',
                                color: colors.textPrimary,
                                paddingRight: s(8),
                              }}
                              numberOfLines={2}
                            >
                              {isSelected ? (
                                <Text style={{ color: colors.orange }}>● </Text>
                              ) : (
                                <Text style={{ color: colors.textMuted }}>○ </Text>
                              )}
                              {name}
                            </Text>
                            <Text
                              accessibilityElementsHidden
                              importantForAccessibility="no"
                              style={{
                                fontFamily: fonts.display,
                                fontSize: fs(14),
                                color: colors.textMuted,
                              }}
                            >
                              ›
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                ) : null
              }
            />
          </View>

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
                disabled={!canContinue}
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
  panel: {
    width: '100%',
  },
  suggestion: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
