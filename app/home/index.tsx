import { Href, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  HOME_ARROW_HOTSPOTS,
  HOME_COUNT_COVER,
  HOME_HOTSPOTS,
  HOME_OVERLAYS,
  ResponsiveArtboard,
  computeArtboardRect,
  percentRectToLayout,
} from '@/artboard';
import { HomeAssets } from '@/constants/assets';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import { useAppContext } from '@/providers';
import { HOME_ARTBOARD } from '@/responsive';
import { colors, fonts } from '@/theme';

/** Vertical pill lighting around the Score inset (sampled from artboard). */
const SCORE_EMPTY_GRADIENT = ['#000E2E', '#010E2B', '#000D2C'] as const;

type SurfaceBox = { width: number; height: number };

/**
 * Lovable-faithful Home (portrait primary; landscape = true viewport contain).
 *
 * Available box = intersection of:
 * - measured Home container (onLayout) — equals PhoneViewport shell when correct
 * - visible window (useWindowDimensions) — defends against parent minHeight bugs
 *
 * Fit: lovableHome contain = min(aw/rw, ah/rh, 1), then center.
 * Portrait @ 390×844 → width-limited (~390×585). Landscape @ 844×390 → height-limited.
 *
 * Safe-area: artboard uses the Home surface (full shell), not inset-shrunk content.
 * Interactive overlays keep min touch size when landscape scale is small.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAppContext();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [surface, setSurface] = useState<SurfaceBox | null>(null);

  const name = profile.displayName?.trim() || 'Explorer';
  const avatarSource = resolveAvatarSource(profile.avatarId);
  const streakCount = profile.streak;
  const badgesUnlocked = profile.badgeCount;
  /** Live Exalo Score — zero/empty triggers Score inset concealment only. */
  const exaloScore = profile.exaloScore ?? 0;
  const isEmptyScore = exaloScore <= 0;

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

  /**
   * Visible Home stage: never larger than the window.
   * Fixes landscape when a parent still reported portrait minHeight.
   */
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
      HOME_ARTBOARD.width,
      HOME_ARTBOARD.height,
      { fit: 'lovableHome' },
    );
  }, [available]);

  const navigateHomeHotspot = useCallback(
    (route: string) => {
      if (route === '/home') {
        return;
      }
      router.push(route as Href);
    },
    [router],
  );

  const hotspots = useMemo(() => {
    const minTouch = artboard && artboard.scale < 0.42 ? 52 : 44;
    return HOME_HOTSPOTS.map((h) => ({
      id: h.id,
      label: h.label,
      percent: h.percent,
      minTouch,
      onPress: () => navigateHomeHotspot(h.route),
    }));
  }, [artboard, navigateHomeHotspot]);

  const profileBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.profile) : null;
  const streakBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.streakCount) : null;
  const badgesBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.badgesCount) : null;
  const scoreEmptyBox =
    artboard && isEmptyScore
      ? percentRectToLayout(artboard, HOME_OVERLAYS.scoreEmptyInset)
      : null;
  const chipHeight = profileBox ? Math.max(profileBox.height, 36) : 36;
  const countFontSize = artboard ? Math.min(artboard.width * 0.05, 28) : 16;

  /**
   * Arrow pills sit below the Lovable card hotspots. Render as top-layer
   * Pressables (above decorative overlays) using the same navigate callback
   * as the Maths/English cards. RN hit-tests the topmost Pressable only —
   * no duplicate router.push when targets slightly overlap after minTouch pad.
   */
  const arrowHitMin = artboard && artboard.scale < 0.42 ? 52 : 44;
  const mathsArrowHit = useMemo(() => {
    if (!artboard) {
      return null;
    }
    const box = percentRectToLayout(artboard, HOME_ARROW_HOTSPOTS.mathsArrow.percent);
    const hitW = Math.max(box.width, arrowHitMin);
    const hitH = Math.max(box.height, arrowHitMin);
    return {
      left: box.left - (hitW - box.width) / 2,
      top: box.top - (hitH - box.height) / 2,
      width: hitW,
      height: hitH,
    };
  }, [artboard, arrowHitMin]);
  const englishArrowHit = useMemo(() => {
    if (!artboard) {
      return null;
    }
    const box = percentRectToLayout(artboard, HOME_ARROW_HOTSPOTS.englishArrow.percent);
    const hitW = Math.max(box.width, arrowHitMin);
    const hitH = Math.max(box.height, arrowHitMin);
    return {
      left: box.left - (hitW - box.width) / 2,
      top: box.top - (hitH - box.height) / 2,
      width: hitW,
      height: hitH,
    };
  }, [artboard, arrowHitMin]);

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      onLayout={onSurfaceLayout}
    >
      {available && artboard ? (
        <>
          <ResponsiveArtboard
            testID="home-artboard"
            source={HomeAssets.artboardV2}
            referenceWidth={HOME_ARTBOARD.width}
            referenceHeight={HOME_ARTBOARD.height}
            contentWidth={available.width}
            contentHeight={available.height}
            fit="lovableHome"
            hotspots={hotspots}
            accessibilityLabel="Exalo home screen with rocket, Maths and English, streak, badges, and score"
          />

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
                },
              ]}
            >
              <View style={styles.avatarCircle}>
                {avatarSource ? (
                  <Image
                    source={avatarSource}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    accessibilityLabel={`${name} avatar`}
                  />
                ) : (
                  <Text style={styles.avatarLetter}>{name.charAt(0).toUpperCase()}</Text>
                )}
              </View>
              <Text style={styles.profileName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.chevron}>▾</Text>
            </Pressable>
          ) : null}

          {streakBox ? (
            <View
              pointerEvents="none"
              style={[
                styles.countOverlay,
                {
                  left: streakBox.left,
                  top: streakBox.top,
                  width: streakBox.width,
                  height: streakBox.height,
                  backgroundColor: HOME_COUNT_COVER.streak,
                  borderRadius:
                    Math.min(streakBox.width, streakBox.height) *
                    HOME_COUNT_COVER.radiusFromMinEdge,
                },
              ]}
            >
              <Text style={[styles.countText, { fontSize: countFontSize }]}>{streakCount}</Text>
            </View>
          ) : null}
          {badgesBox ? (
            <View
              pointerEvents="none"
              style={[
                styles.countOverlay,
                {
                  left: badgesBox.left,
                  top: badgesBox.top,
                  width: badgesBox.width,
                  height: badgesBox.height,
                  backgroundColor: HOME_COUNT_COVER.badges,
                  borderRadius:
                    Math.min(badgesBox.width, badgesBox.height) *
                    HOME_COUNT_COVER.radiusFromMinEdge,
                },
              ]}
            >
              <Text style={[styles.countText, { fontSize: countFontSize }]}>{badgesUnlocked}</Text>
            </View>
          ) : null}

          {/*
            Zero/empty Score only: cover the COMPLETE baked inset (fill + rounded
            border + outer shadow) with pill-matched gradient, then bare "0".
            score > 0: no cover / no overlay (populated Score unchanged).
          */}
          {scoreEmptyBox ? (
            <View
              pointerEvents="none"
              style={[
                styles.countOverlay,
                styles.scoreEmptyCover,
                {
                  left: scoreEmptyBox.left,
                  top: scoreEmptyBox.top,
                  width: scoreEmptyBox.width,
                  height: scoreEmptyBox.height,
                },
              ]}
            >
              <LinearGradient
                colors={[...SCORE_EMPTY_GRADIENT]}
                locations={[0, 0.45, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <Text
                style={[
                  styles.countText,
                  styles.scoreEmptyDigit,
                  { fontSize: countFontSize },
                ]}
              >
                {exaloScore}
              </Text>
            </View>
          ) : null}

          {/*
            Explicit arrow hit targets — baked pills sit below card hotspots.
            Transparent; zIndex above decorative overlays; same nav as cards.
          */}
          {mathsArrowHit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={HOME_ARROW_HOTSPOTS.mathsArrow.label}
              onPress={() => navigateHomeHotspot(HOME_ARROW_HOTSPOTS.mathsArrow.route)}
              style={[styles.arrowHit, mathsArrowHit]}
            />
          ) : null}
          {englishArrowHit ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={HOME_ARROW_HOTSPOTS.englishArrow.label}
              onPress={() => navigateHomeHotspot(HOME_ARROW_HOTSPOTS.englishArrow.route)}
              style={[styles.arrowHit, englishArrowHit]}
            />
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
  profileChip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
    paddingLeft: 4,
    borderRadius: 999,
    backgroundColor: '#1a1748',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(139, 92, 255, 0.4)',
    zIndex: 2,
  },
  avatarCircle: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarLetter: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 12,
    color: colors.white,
  },
  profileName: {
    fontFamily: fonts.display,
    fontWeight: '600',
    fontSize: 12,
    color: colors.white,
    maxWidth: 80,
  },
  chevron: {
    fontSize: 14,
    color: '#C4B5FD',
    marginTop: -2,
  },
  /**
   * Positioning shell for Streak/Badges counts. Fill is applied per-instance
   * via HOME_COUNT_COVER to conceal baked empty squares on the artboard —
   * not a decorative count "card".
   */
  countOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    overflow: 'hidden',
  },
  countText: {
    fontFamily: fonts.display,
    fontWeight: '800',
    color: colors.white,
  },
  /**
   * Expanded Score concealment shell — sharp corners so the cover extends past
   * the baked rounded border/shadow (inset radius would leave corners peeking).
   */
  scoreEmptyCover: {
    borderRadius: 0,
    backgroundColor: HOME_COUNT_COVER.scoreEmpty,
  },
  /** Bare digit over zero-score cover — never a second box. */
  scoreEmptyDigit: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    includeFontPadding: false,
  },
  /**
   * Transparent Maths/English arrow hit target. Sits above decorative overlays
   * (zIndex 3); no visible chrome.
   */
  arrowHit: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 3,
  },
});
