import { useMemo } from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import {
  DeviceClass,
  getDeviceClass,
  getOrientation,
  HOME_ARTBOARD,
  MVP,
  Orientation,
} from './breakpoints';

export type DeviceLayout = {
  viewportWidth: number;
  viewportHeight: number;
  deviceClass: DeviceClass;
  isPhone: boolean;
  isTablet: boolean;
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  safeAreaInsets: EdgeInsets;
  /** Viewport minus safe-area insets. */
  contentWidth: number;
  contentHeight: number;
  isWeb: boolean;
  mvp: typeof MVP;
  homeArtboard: typeof HOME_ARTBOARD;
};

/**
 * Centralized device / viewport / safe-area contract for M1+.
 * Prefer this over scattering width > N checks in screens.
 */
export function useDeviceLayout(): DeviceLayout {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return useMemo(() => {
    const deviceClass = getDeviceClass(width);
    const orientation = getOrientation(width, height);
    const contentWidth = Math.max(0, width - insets.left - insets.right);
    const contentHeight = Math.max(0, height - insets.top - insets.bottom);

    return {
      viewportWidth: width,
      viewportHeight: height,
      deviceClass,
      isPhone: deviceClass === 'phone',
      isTablet: deviceClass === 'tablet',
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      safeAreaInsets: insets,
      contentWidth,
      contentHeight,
      isWeb,
      mvp: MVP,
      homeArtboard: HOME_ARTBOARD,
    };
  }, [width, height, insets, isWeb]);
}
