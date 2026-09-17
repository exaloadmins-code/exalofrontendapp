"""Derive journey-bg-clean.png from TP-070 — edge-first starfield fill of baked header text."""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "journey" / "journey-bg.png"
OUT = ROOT / "assets" / "journey" / "journey-bg-clean.png"


def lum(c: tuple[int, int, int]) -> float:
    return (c[0] + c[1] + c[2]) / 3.0


def main() -> None:
    im = Image.open(SRC).convert("RGB")
    px = im.load()
    w, h = im.size

    mask = [[False] * w for _ in range(h)]

    # Title band — avoid back control (x < 95)
    for y in range(int(h * 0.028), int(h * 0.082)):
        for x in range(95, int(w * 0.36)):
            r, g, b = px[x, y]
            L = lum((r, g, b))
            # White glyphs + anti-alias + residual mid-tones
            if L >= 85 and abs(r - g) < 45 and abs(g - b) < 50:
                # Exclude deep starfield blues that aren't text
                if L >= 100 or (r > 70 and g > 70 and b > 70):
                    mask[y][x] = True

    # Subtitle band
    for y in range(int(h * 0.070), int(h * 0.100)):
        for x in range(95, int(w * 0.45)):
            r, g, b = px[x, y]
            L = lum((r, g, b))
            if 90 <= L <= 230 and abs(r - g) < 40:
                mask[y][x] = True

    # Dilate 4px to swallow fringe
    for _ in range(4):
        dilated = [row[:] for row in mask]
        for y in range(h):
            for x in range(w):
                if mask[y][x]:
                    for dy in (-1, 0, 1):
                        for dx in (-1, 0, 1):
                            ny, nx = y + dy, x + dx
                            if 0 <= ny < h and 0 <= nx < w:
                                dilated[ny][nx] = True
        mask = dilated

    # Clamp mask to header edit window so we never touch rocket/back/planet
    x0, y0, x1, y1 = 93, 38, 300, 118
    for y in range(h):
        for x in range(w):
            if not (x0 <= x <= x1 and y0 <= y <= y1):
                mask[y][x] = False

    remaining = {(x, y) for y in range(y0, y1 + 1) for x in range(x0, x1 + 1) if mask[y][x]}
    print("masked pixels", len(remaining))

    out = im.copy()
    opx = out.load()

    def neighbor_fill(x: int, y: int):
        samples: list[tuple[int, int, int]] = []
        weights: list[float] = []
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in remaining:
                    dist = (dx * dx + dy * dy) ** 0.5
                    samples.append(opx[nx, ny])
                    weights.append(1.0 / max(dist, 0.5))
        if not samples:
            return None
        tw = sum(weights)
        r = int(sum(s[0] * wt for s, wt in zip(samples, weights)) / tw)
        g = int(sum(s[1] * wt for s, wt in zip(samples, weights)) / tw)
        b = int(sum(s[2] * wt for s, wt in zip(samples, weights)) / tw)
        return (r, g, b)

    # Edge-first: repeatedly fill frontier pixels that border known good pixels
    guard = 0
    while remaining and guard < 20000:
        guard += 1
        frontier = []
        for x, y in remaining:
            ok = False
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in remaining:
                        ok = True
                        break
                if ok:
                    break
            if ok:
                frontier.append((x, y))
        if not frontier:
            # isolated pockets — force fill from larger radius
            for x, y in list(remaining):
                fill = neighbor_fill(x, y)
                if fill is None:
                    # fall back to local dark wash sampled near window edge
                    fill = opx[x0, y]
                opx[x, y] = fill
                remaining.discard((x, y))
            break
        for x, y in frontier:
            fill = neighbor_fill(x, y)
            if fill is None:
                continue
            opx[x, y] = fill
            remaining.discard((x, y))
        if guard % 50 == 0:
            print("remaining", len(remaining))

    print("remaining after fill", len(remaining))

    # Smooth only inside edit window among changed pixels
    changed = []
    orig_px = im.load()
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if opx[x, y] != orig_px[x, y]:
                changed.append((x, y))

    for _ in range(3):
        snap = out.copy()
        spx = snap.load()
        for x, y in changed:
            acc = [0, 0, 0]
            n = 0
            for dy in range(-2, 3):
                for dx in range(-2, 3):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        c = spx[nx, ny]
                        acc[0] += c[0]
                        acc[1] += c[1]
                        acc[2] += c[2]
                        n += 1
            opx[x, y] = (acc[0] // n, acc[1] // n, acc[2] // n)

    bright = 0
    for y in range(int(h * 0.032), int(h * 0.095)):
        for x in range(95, int(w * 0.40)):
            if lum(opx[x, y]) > 180:
                bright += 1
    print("bright leftover >180", bright)

    out.save(OUT, "PNG")
    print("saved", OUT, out.size)

    diff_out = 0
    diff_in = 0
    for y in range(h):
        for x in range(w):
            if orig_px[x, y] != opx[x, y]:
                if x0 <= x <= x1 and y0 <= y <= y1:
                    diff_in += 1
                else:
                    diff_out += 1
    print("changed inside", diff_in, "outside", diff_out)


if __name__ == "__main__":
    main()
