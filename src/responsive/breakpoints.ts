/**
 * MVP responsive breakpoints — logical viewport widths (iOS points / Android dp).
 * Do not use physical pixels for layout decisions.
 */
export const MVP = {
  phoneMinWidth: 320,
  phoneMaxWidth: 430,
  tabletMinWidth: 600,
  tabletMaxWidth: 1024,
} as const;

/** Lovable Home artboard intrinsic size (TP-003). */
export const HOME_ARTBOARD = {
  width: 843,
  height: 1264,
} as const;

export type DeviceClass = 'phone' | 'tablet' | 'other';
export type Orientation = 'portrait' | 'landscape';

export function getDeviceClass(viewportWidth: number): DeviceClass {
  if (viewportWidth >= MVP.tabletMinWidth) {
    return 'tablet';
  }
  if (viewportWidth >= MVP.phoneMinWidth && viewportWidth <= MVP.phoneMaxWidth) {
    return 'phone';
  }
  // Narrower than 320 or between 431–599: treat as phone-like for layout.
  if (viewportWidth < MVP.tabletMinWidth) {
    return 'phone';
  }
  return 'other';
}

export function getOrientation(width: number, height: number): Orientation {
  return width >= height ? 'landscape' : 'portrait';
}
