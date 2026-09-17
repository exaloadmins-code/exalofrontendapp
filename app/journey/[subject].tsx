import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  JOURNEY_HOTSPOTS,
  JOURNEY_OVERLAYS,
  ResponsiveArtboard,
  computeArtboardRect,
  percentRectToLayout,
  resolveJourneyRoute,
} from '@/artboard';
import { ComingSoonPlaceholder } from '@/components/placeholder/ComingSoonPlaceholder';
import { JourneyAssets } from '@/constants/assets';
import {
  JOURNEY_HEADER_STYLE,
  JOURNEY_PROFILE_PILL_STYLE,
  journeyPathSubtitle,
  journeySubjectLabel,
  journeyTitle,
  normalizeJourneySubject,
} from '@/constants/journey';
import { resolveAvatarSource } from '@/constants/onboarding';
import { Routes } from '@/constants/routes';
import { useAppContext } from '@/providers';
import { JOURNEY_ARTBOARD } from '@/responsive';
import { colors, fonts } from '@/theme';

type SurfaceBox = { width: number; height: number };

/**
 * Lovable-faithful Journey (portrait primary; landscape = true viewport contain).
 *
 * Artwork: TP-071 `journey-bg-clean.png` (derivative of TP-070 with baked header removed).
 * Header: native dynamic title/subtitle from route → JOURNEY_SUBJECT_CONFIG.
 * Profile: Lovable `BakedProfileOverlay` geometry + `profile.avatarId` → ONBOARDING_AVATARS.
 * No runtime concealment layer.
 */
export default function JourneyScreen() {
  const router = useRouter();
  const { subject: subjectParam } = useLocalSearchParams<{ subject: string }>();
  const subject = normalizeJourneySubject(subjectParam);
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
      JOURNEY_ARTBOARD.width,
      JOURNEY_ARTBOARD.height,
      { fit: 'lovableHome' },
    );
  }, [available]);

  const hotspots = useMemo(() => {
    if (!subject) {
      return [];
    }
    const subjectLabel = journeySubjectLabel(subject);
    const minTouch = artboard && artboard.scale < 0.42 ? 52 : 44;
    return JOURNEY_HOTSPOTS.map((h) => ({
      id: h.id,
      label:
        h.label === 'Test' || h.label === 'Focus' || h.label === 'Train'
          ? `${h.label} — ${subjectLabel}`
          : h.label,
      percent: h.percent,
      minTouch,
      onPress: () => {
        const route = resolveJourneyRoute(h.route, subject);
        if (route === Routes.Home || h.id === 'back' || h.id === 'nav-home') {
          router.replace(Routes.Home as Href);
          return;
        }
        router.push(route as Href);
      },
    }));
  }, [router, artboard, subject]);

  const profileBox = artboard ? percentRectToLayout(artboard, JOURNEY_OVERLAYS.profile) : null;
  const header = JOURNEY_OVERLAYS.headerText;
  const headerOrigin = artboard
    ? percentRectToLayout(artboard, {
        top: header.top,
        left: header.left,
        width: header.width,
        height:
          header.titleHeight +
          JOURNEY_HEADER_STYLE.titleToSubtitleGapPctOfArtboard +
          header.subtitleHeight,
      })
    : null;

  const titleFontSize = artboard
    ? (JOURNEY_HEADER_STYLE.title.artboardFontSizePct / 100) * artboard.height
    : 0;
  const titleLineHeight = artboard
    ? (JOURNEY_HEADER_STYLE.title.artboardLineHeightPct / 100) * artboard.height
    : 0;
  const subtitleFontSize = artboard
    ? (JOURNEY_HEADER_STYLE.subtitle.artboardFontSizePct / 100) * artboard.height
    : 0;
  const subtitleLineHeight = artboard
    ? (JOURNEY_HEADER_STYLE.subtitle.artboardLineHeightPct / 100) * artboard.height
    : 0;
  const titleSubtitleGap = artboard
    ? (JOURNEY_HEADER_STYLE.titleToSubtitleGapPctOfArtboard / 100) * artboard.height
    : 0;

  const chipHeight = profileBox ? Math.max(profileBox.height, 44) : 44;
  const pill = JOURNEY_PROFILE_PILL_STYLE;
  const avatarSize = chipHeight * pill.avatarFromChip;
  const nameFontSize = chipHeight * pill.nameFontFromChip;
  const chipGap = chipHeight * pill.gapFromChip;
  const chevronSize = chipHeight * pill.chevronFromChip;
  const nameMaxWidth = chipHeight * pill.nameMaxWidthFromChip;

  if (!subject) {
    return (
      <ComingSoonPlaceholder
        title="Journey unavailable"
        subtitle="That subject path is not supported. Return Home and open Maths or English."
      />
    );
  }

  const title = journeyTitle(subject);
  const subjectLabel = journeySubjectLabel(subject);
  const pathSubtitle = journeyPathSubtitle();

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      onLayout={onSurfaceLayout}
      accessibilityLabel={title}
    >
      {available && artboard ? (
        <>
          <ResponsiveArtboard
            testID="journey-artboard"
            source={JourneyAssets.artboard}
            referenceWidth={JOURNEY_ARTBOARD.width}
            referenceHeight={JOURNEY_ARTBOARD.height}
            contentWidth={available.width}
            contentHeight={available.height}
            fit="lovableHome"
            hotspots={hotspots}
            accessibilityLabel={`${title} screen with Test, Focus and Train rockets`}
          />

          {headerOrigin ? (
            <View
              pointerEvents="none"
              style={[
                styles.headerTextBlock,
                {
                  left: headerOrigin.left,
                  top: headerOrigin.top,
                  width: headerOrigin.width,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.subjectTitle,
                  {
                    height: titleLineHeight,
                    fontSize: titleFontSize,
                    lineHeight: titleLineHeight,
                    letterSpacing: JOURNEY_HEADER_STYLE.title.letterSpacing,
                    color: JOURNEY_HEADER_STYLE.title.color,
                    fontWeight: JOURNEY_HEADER_STYLE.title.fontWeight,
                    textAlignVertical: 'center',
                  },
                  {
                    fontVariationSettings: `'wght' ${JOURNEY_HEADER_STYLE.title.fontVariationWght}`,
                  } as TextStyle,
                ]}
              >
                {subjectLabel}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.pathSubtitle,
                  {
                    marginTop: titleSubtitleGap,
                    fontSize: subtitleFontSize,
                    lineHeight: subtitleLineHeight,
                    letterSpacing: JOURNEY_HEADER_STYLE.subtitle.letterSpacing,
                    color: JOURNEY_HEADER_STYLE.subtitle.color,
                    fontWeight: JOURNEY_HEADER_STYLE.subtitle.fontWeight,
                  },
                  {
                    fontVariationSettings: `'wght' ${JOURNEY_HEADER_STYLE.subtitle.fontVariationWght}`,
                  } as TextStyle,
                ]}
              >
                {pathSubtitle}
              </Text>
            </View>
          ) : null}

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
  headerTextBlock: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'flex-start',
  },
  subjectTitle: {
    fontFamily: fonts.display,
    includeFontPadding: false,
    textAlign: 'left',
    backgroundColor: 'transparent',
    textShadowColor: 'transparent',
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
  },
  pathSubtitle: {
    fontFamily: fonts.display,
    includeFontPadding: false,
    textAlign: 'left',
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    textShadowColor: 'transparent',
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
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
