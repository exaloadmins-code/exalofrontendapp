import { Href, useLocalSearchParams, useRouter } from 'expo-router';
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
  computeArtboardRect,
  percentRectToLayout,
  TRAIN_CHROME_HOTSPOTS,
  TRAIN_DIFFICULTY_HOTSPOTS,
  resolveTrainChromeRoute,
  trainTopicHotspotPercent,
} from '@/artboard';
import { ComingSoonPlaceholder } from '@/components/placeholder/ComingSoonPlaceholder';
import { TrainAssets } from '@/constants/assets';
import {
  JOURNEY_PROFILE_PILL_STYLE,
  normalizeJourneySubject,
} from '@/constants/journey';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import {
  TRAIN_DIFFICULTY_DEFAULT,
  TRAIN_DIFFICULTY_LABEL_STYLE,
  TRAIN_DIFFICULTY_SELECTED,
  TRAIN_PROFILE_OVERLAY,
  trainScreenTitle,
  trainTopicsFor,
  type TrainDifficulty,
} from '@/constants/train';
import { useAppContext } from '@/providers';
import { TRAIN_ARTBOARD } from '@/responsive';
import { setTrainSelection } from '@/services/trainSelection';
import { colors, fonts } from '@/theme';

type SurfaceBox = { width: number; height: number };

/**
 * M3 Train Selection — Lovable `TrainMode` (`/train/:subject`) parity.
 *
 * Artboards: TP-073 maths / TP-074 english (843×1264). Hotspots from TrainMode.tsx.
 * Catalogue: `src/constants/train.ts` (TEMPORARY frontend-only).
 * Topic tap → M3 boundary placeholder (no gameplay, no `/train/start`).
 */
export default function TrainSelectionScreen() {
  const router = useRouter();
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);
  const { profile } = useAppContext();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [surface, setSurface] = useState<SurfaceBox | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<TrainDifficulty>(TRAIN_DIFFICULTY_DEFAULT);

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

  const topics = subject ? trainTopicsFor(subject) : [];

  const chromeHotspots = useMemo(() => {
    if (!subject) {
      return [];
    }
    const minTouch = artboard && artboard.scale < 0.42 ? 52 : 44;
    return TRAIN_CHROME_HOTSPOTS.map((h) => ({
      id: h.id,
      label: h.label,
      percent: h.percent,
      minTouch,
      onPress: () => {
        const route = resolveTrainChromeRoute(h.route, subject);
        if (h.id === 'nav-home') {
          router.replace(Routes.Home as Href);
          return;
        }
        if (h.id === 'back') {
          router.push(route as Href);
          return;
        }
        router.push(route as Href);
      },
    }));
  }, [router, artboard, subject]);

  const difficultyHotspots = useMemo(() => {
    const minTouch = artboard && artboard.scale < 0.42 ? 52 : 44;
    return TRAIN_DIFFICULTY_HOTSPOTS.map((h) => ({
      id: `diff-${h.id}`,
      label: h.label,
      percent: h.percent,
      minTouch,
      onPress: () => setSelectedDifficulty(h.id),
    }));
  }, [artboard]);

  const topicHotspots = useMemo(() => {
    if (!subject) {
      return [];
    }
    const minTouch = artboard && artboard.scale < 0.42 ? 52 : 44;
    return topics.map((topic, index) => ({
      id: `topic-${topic.slug}`,
      label: topic.label,
      percent: trainTopicHotspotPercent(index),
      minTouch,
      onPress: () => {
        setTrainSelection({
          subject,
          topicSlug: topic.slug,
          topicLabel: topic.label,
          difficulty: selectedDifficulty,
        });
        router.push({
          pathname: '/train/[subject]/[topic]',
          params: {
            subject,
            topic: topic.slug,
            difficulty: selectedDifficulty,
          },
        } as Href);
      },
    }));
  }, [router, artboard, subject, topics, selectedDifficulty]);

  const hotspots = useMemo(
    () => [...chromeHotspots, ...difficultyHotspots, ...topicHotspots],
    [chromeHotspots, difficultyHotspots, topicHotspots],
  );

  const profileBox = artboard
    ? percentRectToLayout(artboard, TRAIN_PROFILE_OVERLAY)
    : null;
  const labelTop = artboard
    ? artboard.y + (TRAIN_DIFFICULTY_LABEL_STYLE.topPct / 100) * artboard.height
    : 0;

  const pill = JOURNEY_PROFILE_PILL_STYLE;
  const chipHeight = profileBox ? Math.max(profileBox.height, 40) : 40;
  const avatarSize = chipHeight * pill.avatarFromChip;
  const nameFontSize = chipHeight * pill.nameFontFromChip;
  const chipGap = chipHeight * pill.gapFromChip;
  const chevronSize = chipHeight * pill.chevronFromChip;
  const nameMaxWidth = chipHeight * pill.nameMaxWidthFromChip;

  if (!subject) {
    return (
      <ComingSoonPlaceholder
        title="Train unavailable"
        subtitle="That subject path is not supported. Return Home and open Maths or English Train from Journey."
      />
    );
  }

  const title = trainScreenTitle(subject);
  const artboardSource =
    subject === 'english' ? TrainAssets.english : TrainAssets.maths;

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      onLayout={onSurfaceLayout}
      accessibilityLabel={title}
    >
      {available && artboard ? (
        <>
          <ResponsiveArtboard
            testID="train-artboard"
            source={artboardSource}
            referenceWidth={TRAIN_ARTBOARD.width}
            referenceHeight={TRAIN_ARTBOARD.height}
            contentWidth={available.width}
            contentHeight={available.height}
            fit="lovableHome"
            hotspots={hotspots}
            accessibilityLabel={`${title} with difficulty selector and topic grid`}
          >
            {(board) => (
              <>
                {TRAIN_DIFFICULTY_HOTSPOTS.map((d) => {
                  if (selectedDifficulty !== d.id) {
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
            {`Selected Difficulty: ${selectedDifficulty.toUpperCase()}`}
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
                    style={[styles.avatarLetter, { fontSize: nameFontSize * 0.85 }]}
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
              <Text style={[styles.chevron, { fontSize: chevronSize, color: pill.chevronColor }]}>
                ▾
              </Text>
            </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    zIndex: 2,
  },
  avatarCircle: {
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarLetter: {
    fontFamily: fonts.display,
    fontWeight: '700',
    color: colors.white,
  },
  profileName: {
    fontFamily: fonts.display,
    color: colors.white,
    flexShrink: 1,
  },
  chevron: {
    marginTop: -1,
  },
});
