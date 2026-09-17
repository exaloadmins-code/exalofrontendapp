import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export type DeviceSize = 'smallPhone' | 'standardPhone' | 'largePhone' | 'tablet';

/**
 * PRIMARY DESIGN TARGET — iPhone 14 portrait.
 * Layouts are authored here; `s` / `fs` scale down on smaller phones,
 * but never upscale past this width (especially on desktop web).
 */
export const BASE_WIDTH = 390;
export const BASE_HEIGHT = 844;

/** Outer page padding at the primary design size. */
export const BASE_PAGE_PADDING_X = 16;

/** Max content/card column width at the primary design size (390 − 16 − 16 ≈ 358). */
export const BASE_CONTENT_MAX_WIDTH = 360;

/** Target phone widths we support after the 390 design is correct. */
export const TARGET_WIDTHS = [375, 390, 393, 412, 430] as const;

export function getDeviceSize(width: number): DeviceSize {
  if (width >= 768) {
    return 'tablet';
  }
  if (width >= 412) {
    return 'largePhone';
  }
  if (width >= 385) {
    return 'standardPhone';
  }
  return 'smallPhone';
}

export function isSmallPhone(width: number): boolean {
  return getDeviceSize(width) === 'smallPhone';
}

export function isStandardPhone(width: number): boolean {
  return getDeviceSize(width) === 'standardPhone';
}

export function isLargePhone(width: number): boolean {
  return getDeviceSize(width) === 'largePhone';
}

export function isTablet(width: number): boolean {
  return getDeviceSize(width) === 'tablet';
}

/**
 * Width used for `s()` / `fs()` scale — never larger than the iPhone 14 design width.
 * Prevents desktop browsers from blowing up the mobile UI.
 */
export function getEffectiveDesignWidth(windowWidth: number): number {
  return Math.min(windowWidth, BASE_WIDTH);
}

/**
 * Responsive helpers — authored for iPhone 14 (390 × 844).
 *
 * Scale factor = effectiveWidth / 390 where effectiveWidth = min(windowWidth, 390).
 * Scale never exceeds 1 (no upscaling on large phones or desktop web).
 */
export function useResponsive() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  return useMemo(() => {
    const effectiveWidth = getEffectiveDesignWidth(windowWidth);
    const scale = effectiveWidth / BASE_WIDTH; // always ≤ 1

    const effectiveHeight = Math.min(windowHeight, BASE_HEIGHT);
    const verticalScale = Math.min(effectiveHeight / BASE_HEIGHT, 1);

    const deviceSize = getDeviceSize(isWeb ? effectiveWidth : windowWidth);

    const s = (size: number) => Math.round(size * scale * 10) / 10;
    const fs = (size: number) => Math.round(size * scale * 10) / 10;
    const hs = (size: number) => Math.round(size * verticalScale * 10) / 10;
    const ms = (size: number, factor = 0.5) =>
      Math.round((size + (s(size) - size) * factor) * 10) / 10;

    const screenPaddingX = s(BASE_PAGE_PADDING_X);
    const contentMaxWidth = s(BASE_CONTENT_MAX_WIDTH);

    return {
      /** Raw window width (desktop may be 1366+). */
      width: windowWidth,
      /** Raw window height. */
      height: windowHeight,
      /** Width used for layout/scale (≤ 390). Prefer this over `width` for UI math. */
      effectiveWidth,
      scale,
      verticalScale,
      deviceSize,
      isWeb,
      s,
      fs,
      hs,
      ms,
      contentMaxWidth,
      screenPaddingX,
      /** Phone shell max width for web preview. */
      phoneShellMaxWidth: BASE_WIDTH,
      phoneShellMinHeight: BASE_HEIGHT,
      isSmallPhone: deviceSize === 'smallPhone',
      isStandardPhone: deviceSize === 'standardPhone',
      isLargePhone: deviceSize === 'largePhone',
      isTablet: !isWeb && deviceSize === 'tablet',
      isCompact: deviceSize === 'smallPhone',
      isWide: !isWeb && (deviceSize === 'largePhone' || deviceSize === 'tablet'),
    };
  }, [windowWidth, windowHeight, isWeb]);
}

/** @deprecated Prefer `useResponsive` — kept for existing design-system components. */
export function useResponsiveScale() {
  return useResponsive();
}
