import { Href, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import {
  ResponsiveArtboard,
  TRAIN_CHROME_HOTSPOTS,
  TRAIN_DIFFICULTY_HOTSPOTS,
  computeArtboardRect,
  percentRectToLayout,
  trainTopicHotspotPercent,
} from '@/artboard';
import { FocusAssets } from '@/constants/assets';
import {
  FOCUS,
  FOCUS_COPY,
  FOCUS_DIFFICULTIES,
  focusStartCtaPercent,
  focusTopicCheckboxPercent,
  type FocusDifficulty,
} from '@/constants/focus';
import {
  JOURNEY_PROFILE_PILL_STYLE,
  type JourneySubject,
} from '@/constants/journey';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import {
  TRAIN_DIFFICULTY_LABEL_STYLE,
  TRAIN_DIFFICULTY_SELECTED,
  TRAIN_PROFILE_OVERLAY,
  type TrainDifficulty,
  type TrainTopic,
} from '@/constants/train';
import { useAppContext } from '@/providers';
import { TRAIN_ARTBOARD } from '@/responsive';
import { colors, fonts } from '@/theme';

export type FocusSetupViewProps = {
  subject: JourneySubject;
  subjectLabel: string;
  topics: readonly TrainTopic[];
  selectedTopics: string[];
  selectedDifficulty: FocusDifficulty | null;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onToggleTopic: (label: string) => void;
  onSelectDifficulty: (d: FocusDifficulty) => void;
  onStart: () => void;
};

type SurfaceBox = { width: number; height: number };

function toTrainDiff(d: FocusDifficulty): TrainDifficulty {
  return d.toLowerCase() as TrainDifficulty;
}

/**
 * Focus setup — dedicated Focus artboard (TP-075 / TP-076) + interactive layer.
 *
 * Static PNG already contains FOCUS MODE, Focus instruction, Train-geometry
 * topic cards without 1–10 badges, clean action region, and Train-position footer.
 *
 * Runtime overlays only:
 * - difficulty glow (Train hotspot geometry)
 * - topic checkboxes + full-card multi-select Pressables
 * - live profile chip
 * - START FOCUS CTA (centered in verified clean band)
 * - optional error
 *
 * No Train artboard. No promo/title/badge repair masks.
 */
export function FocusSetupView({
  subject,
  subjectLabel,
  topics,
  selectedTopics,
  selectedDifficulty,
  loading,
  error,
  onBack,
  onToggleTopic,
  onSelectDifficulty,
  onStart,
}: FocusSetupViewProps) {
  const router = useRouter();
  const { profile } = useAppContext();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [surface, setSurface] = useState<SurfaceBox | null>(null);

  const name = profile.displayName?.trim() || 'Explorer';
  const avatarSource = resolveAvatarSource(profile.avatarId);

  const onSurfaceLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (width <= 0 || height <= 0) {
      return;
    }
    setSurface((prev) => {
      if (
        prev &&
        Math.abs(prev.width - width) < 0.5 &&
        Math.abs(prev.height - height) < 0.5
      ) {
        return prev;
      }
      return { width, height };
    });
  }, []);

  const available = useMemo(() => {
    if (!surface) {
      return null;
    }
    return {
      width: Math.min(surface.width, windowWidth),
      height: Math.min(surface.height, windowHeight),
    };
  }, [surface, windowWidth, windowHeight]);

  const artboard = useMemo(() => {
    if (!available) {
      return null;
    }
    return computeArtboardRect(
      available.width,
      available.height,
      TRAIN_ARTBOARD.width,
      TRAIN_ARTBOARD.height,
      { fit: 'lovableHome' },
    );
  }, [available]);

  const selectedTrainDiff =
    selectedDifficulty != null ? toTrainDiff(selectedDifficulty) : null;

  const minTouch = artboard && artboard.scale < 0.42 ? 52 : 44;

  const chromeHotspots = useMemo(
    () =>
      TRAIN_CHROME_HOTSPOTS.filter((h) => h.id === 'back').map((h) => ({
        id: h.id,
        label: h.label,
        percent: h.percent,
        minTouch,
        onPress: onBack,
      })),
    [minTouch, onBack],
  );

  const difficultyHotspots = useMemo(
    () =>
      TRAIN_DIFFICULTY_HOTSPOTS.map((h) => ({
        id: `diff-${h.id}`,
        label: h.label,
        percent: h.percent,
        minTouch,
        onPress: () => {
          const focusLabel = FOCUS_DIFFICULTIES.find(
            (d) => d.toLowerCase() === h.id,
          );
          if (focusLabel) {
            onSelectDifficulty(focusLabel);
          }
        },
      })),
    [minTouch, onSelectDifficulty],
  );

  const hotspots = useMemo(
    () => [...chromeHotspots, ...difficultyHotspots],
    [chromeHotspots, difficultyHotspots],
  );

  const labelTop = artboard
    ? artboard.y + (TRAIN_DIFFICULTY_LABEL_STYLE.topPct / 100) * artboard.height
    : 0;

  const profileBox = artboard
    ? percentRectToLayout(artboard, TRAIN_PROFILE_OVERLAY)
    : null;

  const pill = JOURNEY_PROFILE_PILL_STYLE;
  const chipHeight = profileBox ? Math.max(profileBox.height, 40) : 40;
  const avatarSize = chipHeight * pill.avatarFromChip;
  const nameFontSize = chipHeight * pill.nameFontFromChip;
  const chipGap = chipHeight * pill.gapFromChip;
  const chevronSize = chipHeight * pill.chevronFromChip;
  const nameMaxWidth = chipHeight * pill.nameMaxWidthFromChip;

  const artboardSource =
    subject === 'english' ? FocusAssets.english : FocusAssets.maths;

  const canStart =
    selectedTopics.length >= 2 &&
    selectedDifficulty != null &&
    !loading;

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      onLayout={onSurfaceLayout}
      accessibilityLabel={`${subjectLabel} Focus Mode`}
    >
      {available && artboard ? (
        <>
          <ResponsiveArtboard
            testID="focus-setup-artboard"
            source={artboardSource}
            referenceWidth={TRAIN_ARTBOARD.width}
            referenceHeight={TRAIN_ARTBOARD.height}
            contentWidth={available.width}
            contentHeight={available.height}
            fit="lovableHome"
            hotspots={hotspots}
            accessibilityLabel={`${subjectLabel} Focus Mode with topic grid and difficulty selector`}
          >
            {(board) => (
              <>
                {TRAIN_DIFFICULTY_HOTSPOTS.map((d) => {
                  if (selectedTrainDiff !== d.id) {
                    return null;
                  }
                  const box = percentRectToLayout(board, d.percent);
                  const selected = TRAIN_DIFFICULTY_SELECTED[d.id];
                  const glowStyle: ViewStyle =
                    Platform.OS === 'web'
                      ? ({
                          boxShadow: `0 0 20px ${selected.glowColor}, 0 0 45px ${selected.glowColorSoft}`,
                        } as ViewStyle)
                      : {
                          shadowColor: selected.glowColor,
                          shadowOpacity: 0.9,
                          shadowRadius: 20,
                          shadowOffset: { width: 0, height: 0 },
                          elevation: 12,
                        };
                  return (
                    <View
                      key={`glow-${d.id}`}
                      pointerEvents="none"
                      style={[
                        styles.diffGlow,
                        {
                          left: box.left,
                          top: box.top,
                          width: box.width,
                          height: box.height,
                          backgroundColor: selected.backgroundColor,
                        },
                        glowStyle,
                      ]}
                    />
                  );
                })}

                {topics.map((topic, index) => {
                  const cardBox = percentRectToLayout(
                    board,
                    trainTopicHotspotPercent(index),
                  );
                  const checkBox = percentRectToLayout(
                    board,
                    focusTopicCheckboxPercent(index),
                  );
                  const checked = selectedTopics.includes(topic.label);
                  const checkSize = Math.min(checkBox.width, checkBox.height);
                  return (
                    <Pressable
                      key={`topic-${topic.slug}`}
                      accessibilityRole="checkbox"
                      accessibilityLabel={topic.label}
                      accessibilityState={{ checked }}
                      onPress={() => onToggleTopic(topic.label)}
                      style={{
                        position: 'absolute',
                        left: cardBox.left,
                        top: cardBox.top,
                        width: cardBox.width,
                        height: cardBox.height,
                        zIndex: 2,
                      }}
                    >
                      <View
                        pointerEvents="none"
                        style={[
                          styles.checkbox,
                          {
                            left: checkBox.left - cardBox.left,
                            top: checkBox.top - cardBox.top,
                            width: checkSize,
                            height: checkSize,
                            borderRadius: Math.max(4, checkSize * 0.22),
                          },
                          checked ? styles.checkboxChecked : null,
                        ]}
                      >
                        {checked ? (
                          <Text
                            style={[
                              styles.checkboxMark,
                              { fontSize: Math.max(10, checkSize * 0.62) },
                            ]}
                          >
                            ✓
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}

                {(() => {
                  const ctaBox = percentRectToLayout(
                    board,
                    focusStartCtaPercent(
                      subject === 'english' ? 'english' : 'maths',
                    ),
                  );
                  const labelSize = Math.max(14, Math.min(22, ctaBox.height * 0.42));
                  return (
                    <Pressable
                      testID="focus-start-cta"
                      accessibilityRole="button"
                      accessibilityLabel={FOCUS_COPY.start}
                      accessibilityState={{ disabled: !canStart }}
                      disabled={!canStart}
                      onPress={onStart}
                      style={({ pressed }) => [
                        styles.startCta,
                        {
                          left: ctaBox.left,
                          top: ctaBox.top,
                          width: ctaBox.width,
                          height: ctaBox.height,
                          borderRadius: Math.max(14, ctaBox.height * 0.42),
                          backgroundColor: canStart
                            ? FOCUS.ctaFrom
                            : 'rgba(109, 40, 217, 0.28)',
                          borderColor: canStart
                            ? FOCUS.ctaBorder
                            : 'rgba(167, 139, 250, 0.28)',
                          opacity: !canStart ? 0.55 : pressed ? 0.88 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.startCtaLabel,
                          {
                            fontSize: labelSize,
                            color: canStart
                              ? '#FFFFFF'
                              : 'rgba(245, 243, 255, 0.55)',
                          },
                        ]}
                      >
                        {loading ? FOCUS_COPY.loading : FOCUS_COPY.start}
                      </Text>
                    </Pressable>
                  );
                })()}
              </>
            )}
          </ResponsiveArtboard>

          <Text
            pointerEvents="none"
            style={[
              styles.diffLabel,
              {
                top: labelTop,
                left: artboard.x,
                width: artboard.width,
                fontSize: TRAIN_DIFFICULTY_LABEL_STYLE.fontSize,
                letterSpacing: TRAIN_DIFFICULTY_LABEL_STYLE.letterSpacing,
                color: TRAIN_DIFFICULTY_LABEL_STYLE.color,
                fontWeight: TRAIN_DIFFICULTY_LABEL_STYLE.fontWeight,
                textShadowColor: TRAIN_DIFFICULTY_LABEL_STYLE.textShadowColor,
                textShadowRadius: TRAIN_DIFFICULTY_LABEL_STYLE.textShadowRadius,
                textShadowOffset: TRAIN_DIFFICULTY_LABEL_STYLE.textShadowOffset,
              },
            ]}
          >
            {selectedTrainDiff
              ? `Selected Difficulty: ${selectedTrainDiff.toUpperCase()}`
              : 'Select Difficulty: EASY · MEDIUM · HARD'}
          </Text>

          {profileBox ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile menu"
              onPress={() => router.push(Routes.Profile as Href)}
              style={[
                styles.profileChip,
                {
                  left: profileBox.left,
                  top: profileBox.top,
                  minWidth: profileBox.width,
                  height: chipHeight,
                  gap: chipGap,
                  paddingLeft: chipHeight * pill.paddingLeftFromChip,
                  paddingRight: chipHeight * pill.paddingRightFromChip,
                  backgroundColor: pill.backgroundColor,
                  borderColor: pill.borderColor,
                  borderWidth: pill.borderWidth,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarCircle,
                  {
                    height: avatarSize,
                    width: avatarSize,
                    borderRadius: avatarSize / 2,
                    borderWidth: pill.avatarRingWidth,
                    borderColor: pill.avatarRingColor,
                  },
                ]}
              >
                {avatarSource ? (
                  <Image
                    source={avatarSource}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    accessibilityLabel={`${name} avatar`}
                  />
                ) : (
                  <Text
                    style={[
                      styles.avatarLetter,
                      { fontSize: nameFontSize * 0.85 },
                    ]}
                  >
                    {name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.profileName,
                  {
                    fontSize: nameFontSize,
                    maxWidth: nameMaxWidth,
                    fontWeight: pill.nameFontWeight,
                  },
                  {
                    fontVariationSettings: `'wght' ${pill.nameFontVariationWght}`,
                  } as TextStyle,
                ]}
                numberOfLines={1}
              >
                {name}
              </Text>
              <Text
                style={[
                  styles.chevron,
                  { fontSize: chevronSize, color: pill.chevronColor },
                ]}
              >
                ▾
              </Text>
            </Pressable>
          ) : null}

          {error ? (
            <View
              pointerEvents="none"
              style={[
                styles.errorBox,
                {
                  left: artboard.x + artboard.width * 0.1,
                  top: artboard.y + artboard.height * 0.66,
                  width: artboard.width * 0.8,
                },
              ]}
            >
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  diffGlow: {
    position: 'absolute',
    borderRadius: 999,
    zIndex: 1,
  },
  checkbox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: FOCUS.checkboxBorder,
    backgroundColor: FOCUS.checkboxBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: FOCUS.checkboxCheckedBg,
    borderColor: FOCUS.checkboxCheckedBg,
  },
  checkboxMark: {
    color: FOCUS.checkboxCheck,
    fontWeight: '800',
    includeFontPadding: false,
    textAlign: 'center',
  },
  startCta: {
    position: 'absolute',
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  startCtaLabel: {
    fontFamily: fonts.display,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
    textAlign: 'center',
  },
  diffLabel: {
    position: 'absolute',
    zIndex: 2,
    textAlign: 'center',
    fontFamily: fonts.display,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  profileChip: {
    position: 'absolute',
    zIndex: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
  },
  avatarCircle: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2558',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontFamily: fonts.display,
    fontWeight: '700',
  },
  profileName: {
    color: '#FFFFFF',
    fontFamily: fonts.display,
  },
  chevron: {
    fontFamily: fonts.display,
  },
  errorBox: {
    position: 'absolute',
    zIndex: 5,
    borderRadius: 12,
    backgroundColor: FOCUS.errorBg,
    borderWidth: 1,
    borderColor: FOCUS.errorBorder,
    padding: 10,
  },
  errorText: {
    fontFamily: fonts.display,
    fontSize: 13,
    fontWeight: '500',
    color: FOCUS.errorText,
    textAlign: 'center',
  },
});
