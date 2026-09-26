import { Href, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown } from 'lucide-react-native';
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
  HOME_LOGO_BOTTOM,
  HOME_LOGO_CLEAR_LEFT,
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

/** Lovable Index.tsx chip right inset (`right: 3%`). */
const CHIP_RIGHT_INSET = 0.03;
/** Preferred Lovable chip top (`top: 3%`). */
const CHIP_TOP_PREFERRED = 0.03;
/** Gap between logo clear-line and chip left when sharing the header row. */
const LOGO_CHIP_GAP_X = 0.008;
/**
 * Place chip just below logo ink when a readable name would collide horizontally.
 * Streak/Badges hotspots begin at 14%; logo ink ends ~12.8%.
 */
const CHIP_TOP_BELOW_LOGO = HOME_LOGO_BOTTOM + 0.004;

/**
 * Approximate rendered width of `text` at Fredoka semibold (Lovable text-xs / scaled).
 * Tuned so short names like "Preethi" reserve a useful chip (not "P…").
 */
function estimateNameWidth(text: string, fontSize: number): number {
  const lovableCap = fontSize * 5; // max-w-[5rem]
  const estimated = Math.ceil(text.length * fontSize * 0.55);
  return Math.min(lovableCap, Math.max(fontSize * 2, estimated));
}

/**
 * Minimum name slot that stays usable. Short names (≤7, e.g. "Preethi") require
 * the full estimate; longer names keep ≥5 glyphs so we never collapse to "P…".
 */
function minUsefulNameWidth(text: string, fontSize: number): number {
  const full = estimateNameWidth(text, fontSize);
  if (text.length <= 7) {
    return full;
  }
  return Math.min(full, Math.ceil(5 * fontSize * 0.55));
}

/**
 * Lovable Index.tsx Home profile chip + narrow native adaptation.
 *
 * Default (sufficient horizontal room for a useful name):
 *   top 3%, right 3%, width capped to the logo-clear → right-inset column,
 *   height max(6%, 36). Long names may truncate inside that column.
 *
 * Before leaving the Lovable top row, avatar may shrink slightly (≥24) so a
 * short readable name can stay right-anchored over the baked profile.
 *
 * Only when even that useful-minimum still intersects EXALO ink:
 *   keep a readable chip width + right anchor; move top just below the logo
 *   band; mask the baked "Niam" chip so the wrong name does not show through.
 *
 * Tablet / normal phones with room keep the preferred top — no unnecessary drop.
 * Tablet typography/avatar caps are unchanged.
 */
function profileChipMetrics(
  artboard: { x: number; y: number; width: number; height: number },
  surfaceWidth: number,
  displayName: string,
) {
  const height = Math.max((6 / 100) * artboard.height, 36);
  const gap = 6;
  const paddingLeft = 4;
  const paddingRight = 8;
  let avatarSize = Math.round(Math.min(36, Math.max(22, height - 8)));
  const nameFontSize = Math.round(Math.min(16, Math.max(11, height * 0.33)));
  const chevronSize = Math.round(Math.min(16, Math.max(12, nameFontSize + 2)));

  const chromeFor = (avatar: number) =>
    paddingLeft + paddingRight + avatar + chevronSize + gap * 2;

  const fullNameWidth = estimateNameWidth(displayName, nameFontSize);
  const minNameWidth = minUsefulNameWidth(displayName, nameFontSize);

  const right =
    surfaceWidth - (artboard.x + artboard.width) + CHIP_RIGHT_INSET * artboard.width;
  const chipRightX = artboard.x + artboard.width * (1 - CHIP_RIGHT_INSET);
  const logoClearX = artboard.x + artboard.width * (HOME_LOGO_CLEAR_LEFT + LOGO_CHIP_GAP_X);
  const availableAtPreferred = Math.max(0, Math.floor(chipRightX - logoClearX));
  const preferredTop = artboard.y + CHIP_TOP_PREFERRED * artboard.height;

  const intersectsLogo = (avatar: number, nameW: number) =>
    chipRightX - (chromeFor(avatar) + nameW) < logoClearX - 0.5;

  /** Prefer Lovable top row: modest avatar shrink before vertical move. */
  while (intersectsLogo(avatarSize, minNameWidth) && avatarSize > 24) {
    avatarSize -= 1;
  }

  const collidesAtPreferredTop = intersectsLogo(avatarSize, minNameWidth);
  const chromeWidth = chromeFor(avatarSize);
  const fullChipWidth = chromeWidth + fullNameWidth;

  /**
   * Preferred row: never grow left of logo clear (prevents logo/dash overlap).
   * Below logo: wider content-aware max so the full display name can show.
   */
  const maxWidth = collidesAtPreferredTop
    ? Math.max(fullChipWidth, Math.floor(artboard.width * 0.48))
    : availableAtPreferred;

  const nameMaxWidth = Math.max(24, maxWidth - chromeWidth);

  const top = collidesAtPreferredTop
    ? artboard.y + CHIP_TOP_BELOW_LOGO * artboard.height
    : preferredTop;

  /** Lovable 24% column — masks baked profile when the live chip drops. */
  const maskWidth = Math.floor(artboard.width * 0.24);

  return {
    top,
    preferredTop,
    right,
    height,
    avatarSize,
    nameFontSize,
    chevronSize,
    nameMaxWidth,
    maxWidth,
    maskWidth,
    gap,
    paddingLeft,
    paddingRight,
    displacedBelowLogo: collidesAtPreferredTop,
  };
}

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

  const chip = artboard && available ? profileChipMetrics(artboard, available.width, name) : null;
  const streakBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.streakCount) : null;
  const badgesBox = artboard ? percentRectToLayout(artboard, HOME_OVERLAYS.badgesCount) : null;
  const scoreEmptyBox =
    artboard && isEmptyScore
      ? percentRectToLayout(artboard, HOME_OVERLAYS.scoreEmptyInset)
      : null;
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

          {chip?.displacedBelowLogo ? (
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.bakedProfileMask,
                {
                  top: chip.preferredTop,
                  right: chip.right,
                  width: chip.maskWidth,
                  height: chip.height,
                },
              ]}
            />
          ) : null}

          {chip ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile menu"
              onPress={() => router.push(Routes.Profile as Href)}
              style={[
                styles.profileChip,
                {
                  top: chip.top,
                  right: chip.right,
                  height: chip.height,
                  maxWidth: chip.maxWidth,
                  gap: chip.gap,
                  paddingLeft: chip.paddingLeft,
                  paddingRight: chip.paddingRight,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarCircle,
                  {
                    height: chip.avatarSize,
                    width: chip.avatarSize,
                    borderRadius: chip.avatarSize / 2,
                  },
                ]}
              >
                {avatarSource ? (
                  <Image
                    source={avatarSource}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    accessibilityLabel={`${name} avatar`}
                  />
                ) : (
                  <Text style={[styles.avatarLetter, { fontSize: Math.round(chip.avatarSize * 0.4) }]}>
                    {name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.profileName,
                  {
                    fontSize: chip.nameFontSize,
                    lineHeight: Math.round(chip.nameFontSize * 1.25),
                    maxWidth: chip.nameMaxWidth,
                  },
                ]}
                numberOfLines={1}
              >
                {name}
              </Text>
              <ChevronDown
                size={chip.chevronSize}
                color="#C4B5FD"
                strokeWidth={2.25}
              />
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
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#1a1748',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'rgba(139, 92, 255, 0.4)',
    zIndex: 2,
  },
  /**
   * When the live chip drops below the logo band, paint over the baked "Niam"
   * profile so the wrong name does not show through (artwork unchanged).
   */
  bakedProfileMask: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#1a1748',
    zIndex: 1,
  },
  avatarCircle: {
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
    color: colors.white,
  },
  profileName: {
    fontFamily: fonts.display,
    fontWeight: '600',
    color: colors.white,
    flexShrink: 1,
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
