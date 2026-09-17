/**
 * Responsive artboard geometry.
 * Maps a fixed reference artboard into viewport + safe-area bounds (contain).
 */

export type ArtboardRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

export type PercentRect = {
  /** 0–100 from artboard left, or omit if using right */
  left?: number;
  /** 0–100 from artboard top, or omit if using bottom */
  top?: number;
  /** 0–100 from artboard right */
  right?: number;
  /** 0–100 from artboard bottom */
  bottom?: number;
  width: number;
  height: number;
};

export type LayoutBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ArtboardFitMode =
  /** Classic contain — entire artboard visible; may letterbox. */
  | 'contain'
  /**
   * Lovable Home rendered result (`Index.tsx` + Tailwind preflight).
   *
   * Source markup: `max-h-screen w-auto object-contain` on the img, flex-centered
   * in `min-h-screen bg-background`.
   *
   * Tailwind preflight also applies `img { max-width: 100%; height: auto; }`.
   * Together with `max-h-screen`, the **actual computed layout** is viewport
   * **contain** (not height-only fill). Verified at 390×844:
   * Lovable img ≈ 390×585 with ~130px vertical letterboxing.
   */
  | 'lovableHome';

/**
 * Fit reference artboard into a viewport box.
 *
 * Portrait Home (lovableHome): typically width-limited → vertical letterbox.
 * Landscape Home: typically height-limited → horizontal letterbox; full TP-003
 * visible (same contain math as Lovable max-h-screen + max-width:100%).
 */
export function computeArtboardRect(
  contentWidth: number,
  contentHeight: number,
  referenceWidth: number,
  referenceHeight: number,
  options?: {
    fit?: ArtboardFitMode;
    /** Only used by plain `contain`. */
    maxWidthFraction?: number;
    maxHeightFraction?: number;
  },
): ArtboardRect {
  const fit = options?.fit ?? 'contain';

  if (fit === 'lovableHome') {
    // Viewport contain — always constrained by BOTH axes (never width-only).
    const scale = Math.min(
      contentWidth / referenceWidth,
      contentHeight / referenceHeight,
      1,
    );
    const width = referenceWidth * scale;
    const height = referenceHeight * scale;
    const x = (contentWidth - width) / 2;
    const y = (contentHeight - height) / 2;
    return { x, y, width, height, scale };
  }

  const maxW = contentWidth * (options?.maxWidthFraction ?? 1);
  const maxH = contentHeight * (options?.maxHeightFraction ?? 1);
  const scale = Math.min(maxW / referenceWidth, maxH / referenceHeight);
  const width = referenceWidth * scale;
  const height = referenceHeight * scale;
  const x = (contentWidth - width) / 2;
  const y = (contentHeight - height) / 2;
  return { x, y, width, height, scale };
}

/** Convert a %-of-artboard rect into absolute layout inside the rendered artboard. */
export function percentRectToLayout(
  artboard: ArtboardRect,
  pct: PercentRect,
): LayoutBox {
  const width = (pct.width / 100) * artboard.width;
  const height = (pct.height / 100) * artboard.height;

  let left: number;
  if (pct.left != null) {
    left = artboard.x + (pct.left / 100) * artboard.width;
  } else if (pct.right != null) {
    left = artboard.x + artboard.width - (pct.right / 100) * artboard.width - width;
  } else {
    left = artboard.x;
  }

  let top: number;
  if (pct.top != null) {
    top = artboard.y + (pct.top / 100) * artboard.height;
  } else if (pct.bottom != null) {
    top = artboard.y + artboard.height - (pct.bottom / 100) * artboard.height - height;
  } else {
    top = artboard.y;
  }

  return { left, top, width, height };
}
