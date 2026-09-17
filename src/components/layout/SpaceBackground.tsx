import { Image, StyleSheet, View } from 'react-native';
import { BackgroundAssets, PlanetAssets } from '@/constants';
import { colors } from '@/theme';
import { useResponsiveScale } from '@/hooks';

type SpaceBackgroundProps = {
  showPlanets?: boolean;
  dimmed?: boolean;
};

/**
 * Full-bleed EXALO space backdrop using production background artwork.
 */
export function SpaceBackground({ showPlanets = false, dimmed = false }: SpaceBackgroundProps) {
  const { s, effectiveWidth } = useResponsiveScale();

  return (
    <View pointerEvents="none" style={styles.root}>
      <Image
        source={BackgroundAssets.planets}
        style={styles.background}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      {showPlanets ? (
        <>
          <Image
            source={PlanetAssets.purple}
            style={[
              styles.planet,
              {
                top: s(48),
                left: s(8),
                width: s(78),
                height: s(52),
              },
            ]}
            resizeMode="contain"
          />
          <Image
            source={PlanetAssets.blue}
            style={[
              styles.planet,
              {
                top: s(56),
                right: s(4),
                width: s(86),
                height: s(58),
                left: undefined,
              },
            ]}
            resizeMode="contain"
          />
        </>
      ) : null}
      <View
        style={[
          styles.vignette,
          dimmed && styles.dimmed,
          { opacity: dimmed ? 0.55 : 0.28 },
        ]}
      />
      <View style={[styles.cloudLeft, { width: effectiveWidth * 0.22 }]} />
      <View style={[styles.cloudRight, { width: effectiveWidth * 0.22 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.backgroundDark,
    overflow: 'hidden',
  },
  background: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  planet: {
    position: 'absolute',
    opacity: 0.95,
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.backgroundDark,
  },
  dimmed: {
    backgroundColor: colors.overlay,
  },
  cloudLeft: {
    position: 'absolute',
    left: -20,
    bottom: '18%',
    height: '42%',
    borderTopRightRadius: 120,
    borderBottomRightRadius: 80,
    backgroundColor: 'rgba(24, 48, 110, 0.22)',
  },
  cloudRight: {
    position: 'absolute',
    right: -20,
    bottom: '16%',
    height: '44%',
    borderTopLeftRadius: 120,
    borderBottomLeftRadius: 80,
    backgroundColor: 'rgba(24, 48, 110, 0.22)',
  },
});
