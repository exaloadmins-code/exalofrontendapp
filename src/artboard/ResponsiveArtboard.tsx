import { Image, ImageSourcePropType, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { ReactNode, useMemo } from 'react';
import {
  ArtboardRect,
  PercentRect,
  computeArtboardRect,
  percentRectToLayout,
} from './artboardMath';

export type HotspotDef = {
  id: string;
  label: string;
  percent: PercentRect;
  onPress: () => void;
  minTouch?: number;
};

type ResponsiveArtboardProps = {
  source: ImageSourcePropType;
  referenceWidth: number;
  referenceHeight: number;
  contentWidth: number;
  contentHeight: number;
  hotspots?: HotspotDef[];
  children?: (artboard: ArtboardRect) => ReactNode;
  /** Defaults to `contain`. Home uses `lovableHome`. */
  fit?: 'contain' | 'lovableHome';
  maxWidthFraction?: number;
  maxHeightFraction?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * Fits a reference artboard into the content box and attaches
 * %-based hotspots to the rendered artwork bounds.
 */
export function ResponsiveArtboard({
  source,
  referenceWidth,
  referenceHeight,
  contentWidth,
  contentHeight,
  hotspots = [],
  children,
  fit = 'contain',
  maxWidthFraction,
  maxHeightFraction,
  style,
  accessibilityLabel = 'Exalo screen artboard',
  testID,
}: ResponsiveArtboardProps) {
  const artboard = useMemo(
    () =>
      computeArtboardRect(contentWidth, contentHeight, referenceWidth, referenceHeight, {
        fit,
        maxWidthFraction,
        maxHeightFraction,
      }),
    [
      contentWidth,
      contentHeight,
      referenceWidth,
      referenceHeight,
      fit,
      maxWidthFraction,
      maxHeightFraction,
    ],
  );

  return (
    <View
      testID={testID}
      style={[styles.root, { width: contentWidth, height: contentHeight, alignSelf: 'center' }, style]}
    >
      <Image
        source={source}
        accessibilityLabel={accessibilityLabel}
        style={{
          position: 'absolute',
          left: artboard.x,
          top: artboard.y,
          width: artboard.width,
          height: artboard.height,
        }}
        resizeMode="stretch"
      />
      {children?.(artboard)}
      {hotspots.map((h) => {
        const box = percentRectToLayout(artboard, h.percent);
        const min = h.minTouch ?? 44;
        const hitW = Math.max(box.width, min);
        const hitH = Math.max(box.height, min);
        const padX = (hitW - box.width) / 2;
        const padY = (hitH - box.height) / 2;
        return (
          <Pressable
            key={h.id}
            accessibilityRole="button"
            accessibilityLabel={h.label}
            onPress={h.onPress}
            style={{
              position: 'absolute',
              left: box.left - padX,
              top: box.top - padY,
              width: hitW,
              height: hitH,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
  },
});
