import { Href, useRouter } from 'expo-router';
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

  const hotspots = useMemo(() => {
    const minTouch = artboard && artboard.scale < 0.42 ? 52 : 44;
    return HOME_HOTSPOTS.map((h) => ({
      id: h.id,
      label: h.label,
      percent: h.percent,
      minTouch,
      onPress: () => {
        if (h.route === '/home') {
          return;
        }
        router.push(h.route as Href);
      },
    }));
  }, [router, artboard]);

  const profileBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.profile) : null;
  const streakBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.streakCount) : null;
  const badgesBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.badgesCount) : null;
  const chipHeight = profileBox ? Math.max(profileBox.height, 36) : 36;
  const fontSize = artboard ? Math.min(artboard.width * 0.05, 28) : 16;

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
                },
              ]}
            >
              <Text style={[styles.countText, { fontSize }]}>{streakCount}</Text>
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
                },
              ]}
            >
              <Text style={[styles.countText, { fontSize }]}>{badgesUnlocked}</Text>
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
  countOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  countText: {
    fontFamily: fonts.display,
    fontWeight: '800',
    color: colors.white,
  },
});
