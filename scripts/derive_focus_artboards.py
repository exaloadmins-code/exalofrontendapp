"""
Compose dedicated Focus selection artboards (TP-075 / TP-076).

Train (TP-073 / TP-074) is the geometric SOURCE OF TRUTH — read only, never modified.

Strategy (exact-band composition, NOT broad %-masks):
  1. Copy the entire Train PNG into a new Focus canvas.
  2. Measure from Train pixels:
       - row-1 / row-2 card tops and COMPLETE bottoms (name + Accuracy + % + border)
       - promotional-strip top / bottom (dashed capsule)
       - footer top (EXALO SCORE chrome)
  3. Protect cards: never write clean-sky into y <= row2_bot.
  4. Protect footer: never write into y >= footer_top.
  5. Replace promo ONLY for y > row2_bot (clean_top = row2_bot + 1).
     Train often paints row-2 Accuracy over the dashed promo edge, so
     promo_top may be ABOVE row2_bot — clean fill must still wait for cards.
  6. Restore complete Train topic-card rectangles (both rows) so card bottoms
     are byte-identical to Train.
  7. Clear 1–10 badge circles for native checkboxes.
  8. Paint FOCUS MODE + Focus instruction (Fredoka TP-001).

Outputs:
  assets/focus/maths-focus-mode.png
  assets/focus/english-focus-mode.png

Classification: THIRD-PARTY DERIVATIVE of TP-073 / TP-074 — LICENSE REVIEW REQUIRED.
Not EXALO ORIGINAL. Not a runtime-patched Train artboard.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONT_PATH = ROOT / "assets" / "fonts" / "Fredoka-wdth-wght.ttf"

JOBS = [
    {
        "src": ROOT / "assets" / "train" / "maths-train-mode.png",
        "out": ROOT / "assets" / "focus" / "maths-focus-mode.png",
        "tp_src": "TP-073",
        "tp_out": "TP-075",
    },
    {
        "src": ROOT / "assets" / "train" / "english-train-mode.png",
        "out": ROOT / "assets" / "focus" / "english-focus-mode.png",
        "tp_src": "TP-074",
        "tp_out": "TP-076",
    },
]

FOCUS_MODE_LABEL = "FOCUS MODE"
FOCUS_INSTRUCTION = (
    "Choose one difficulty and at least two topics to start your mission!"
)

TOPIC_CARD_W = 17.5
TOPIC_GAP_X = 1.5
TOPIC_START_X = 3.0
TOPIC_ROW_YS = (29.0, 51.5)

BADGE_CX_FROM_CARD = 2.5
BADGE_CY_FROM_CARD_BY_ROW = (0.65, 4.15)
BADGE_RADIUS_W_PCT = 2.65


def lum(c: tuple[int, int, int]) -> float:
    return (c[0] + c[1] + c[2]) / 3.0


def topic_origin(index: int) -> tuple[float, float]:
    r, c = divmod(index, 5)
    return TOPIC_START_X + c * (TOPIC_CARD_W + TOPIC_GAP_X), TOPIC_ROW_YS[r]


def badge_circle(w: int, h: int, index: int) -> tuple[float, float, float]:
    left, top = topic_origin(index)
    row = index // 5
    cx = ((left + BADGE_CX_FROM_CARD) / 100.0) * w
    cy = ((top + BADGE_CY_FROM_CARD_BY_ROW[row]) / 100.0) * h
    radius = (BADGE_RADIUS_W_PCT / 100.0) * w
    return cx, cy, radius


def dilate(mask: list[list[bool]], w: int, h: int, rounds: int = 2) -> list[list[bool]]:
    for _ in range(rounds):
        nxt = [row[:] for row in mask]
        for y in range(h):
            for x in range(w):
                if not mask[y][x]:
                    continue
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < h and 0 <= nx < w:
                            nxt[ny][nx] = True
        mask = nxt
    return mask


def edge_fill(
    opx,
    remaining: set[tuple[int, int]],
    w: int,
    h: int,
    fallback: tuple[int, int, int],
) -> None:
    def neighbor_fill(x: int, y: int):
        samples: list[tuple[int, int, int]] = []
        weights: list[float] = []
        for dy in range(-4, 5):
            for dx in range(-4, 5):
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
        return (
            int(sum(s[0] * wt for s, wt in zip(samples, weights)) / tw),
            int(sum(s[1] * wt for s, wt in zip(samples, weights)) / tw),
            int(sum(s[2] * wt for s, wt in zip(samples, weights)) / tw),
        )

    guard = 0
    while remaining and guard < 60000:
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
            for x, y in list(remaining):
                opx[x, y] = neighbor_fill(x, y) or fallback
                remaining.discard((x, y))
            break
        for x, y in frontier:
            opx[x, y] = neighbor_fill(x, y) or fallback
            remaining.discard((x, y))


def _is_near_white(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    return r > 200 and g > 200 and b > 200 and abs(r - g) < 35 and abs(g - b) < 35


def _is_promo_cyan(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    return b > 140 and g > 100 and r < 120 and b > r + 40


def _is_promo_gold(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    return r > 150 and g > 110 and b < 105 and r > b + 45


def _is_bright_cyan_text(c: tuple[int, int, int]) -> bool:
    r, g, b = c
    return r < 100 and g > 140 and b > 180


def _promo_signal_count(px, y: int, w: int, x0: int, x1: int) -> int:
    n = 0
    for x in range(max(0, x0), min(w, x1 + 1)):
        c = px[x, y]
        if (
            _is_near_white(c)
            or _is_promo_cyan(c)
            or _is_promo_gold(c)
            or _is_bright_cyan_text(c)
        ):
            n += 1
    return n


def _is_wide_promo_dash(px, y: int, w: int) -> bool:
    whites = [x for x in range(w) if _is_near_white(px[x, y])]
    if len(whites) < 80:
        return False
    return whites[-1] - whites[0] > 500


def _measure_row_top(px, w: int, h: int, y_lo: int, y_hi: int) -> int:
    """First Y where ≥4 cards show a top-rim glow."""
    for y in range(y_lo, min(y_hi, h)):
        hits = 0
        for c in range(5):
            left = TOPIC_START_X + c * (TOPIC_CARD_W + TOPIC_GAP_X)
            x0 = int(((left + 2.0) / 100.0) * w)
            x1 = int(((left + TOPIC_CARD_W - 2.0) / 100.0) * w)
            bright = sum(
                1
                for x in range(x0, x1)
                if px[x, y][2] > 90
                and px[x, y][1] < 130
                and px[x, y][0] < 100
            )
            if bright > (x1 - x0) * 0.35:
                hits += 1
        if hits >= 4:
            return y
    raise RuntimeError(f"could not locate card row top in y={y_lo}-{y_hi}")


def _measure_row1_accuracy_bottom(px, w: int, h: int) -> int:
    """Last Y of row-1 Accuracy / % white glyphs (above the inter-row gap)."""
    last = 0
    for y in range(560, min(h - 1, 610)):
        for c in range(5):
            left = TOPIC_START_X + c * (TOPIC_CARD_W + TOPIC_GAP_X)
            x0 = int(((left + 3.0) / 100.0) * w)
            x1 = int(((left + TOPIC_CARD_W - 3.0) / 100.0) * w)
            white = sum(1 for x in range(x0, x1) if _is_near_white(px[x, y]))
            if white >= 10:
                last = max(last, y)
    if last < 560:
        raise RuntimeError("could not locate row-1 Accuracy bottom")
    return last + 6


def _card_center_has_glyph(px, w: int, y: int) -> bool:
    """True if any row-2 card center has name / Accuracy / % glyphs at y."""
    for c in range(5):
        left = TOPIC_START_X + c * (TOPIC_CARD_W + TOPIC_GAP_X)
        x0 = int(((left + 5.0) / 100.0) * w)
        x1 = int(((left + 12.5) / 100.0) * w)
        white = sum(1 for x in range(x0, x1) if _is_near_white(px[x, y]))
        cyan = sum(
            1
            for x in range(x0, x1)
            if px[x, y][0] < 100 and px[x, y][1] > 120 and px[x, y][2] > 160
        )
        light = sum(
            1
            for x in range(x0, x1)
            if px[x, y][0] > 160
            and px[x, y][1] > 160
            and px[x, y][2] > 170
            and px[x, y][0] < 240
        )
        if white >= 8 or cyan >= 4 or light >= 10:
            return True
    return False


def _measure_row2_card_bottom(px, w: int, h: int, row2_top: int, promo_top: int) -> int:
    """
    Complete row-2 bottom including topic name, Accuracy label, %, and card rim.

    Train paints name near the dashed promo edge, a short gap, Accuracy, another
    short gap, then percentage digits, then the card bottom border. Stopping at
    the Accuracy label (or the name) truncates percentages — especially English.
    """
    bands: list[tuple[int, int]] = []
    in_band = False
    start = end = 0
    # Percentages sit well below the dashed promo edge — scan far enough.
    y_hi = min(h - 1, promo_top + 160)
    for y in range(row2_top + 140, y_hi):
        if _card_center_has_glyph(px, w, y):
            if not in_band:
                start = y
                in_band = True
            end = y
        elif in_band:
            bands.append((start, end))
            in_band = False
    if in_band:
        bands.append((start, end))

    # Name band: substantial glyph run ending near the dashed promo top
    name = None
    for b0, b1 in bands:
        if (b1 - b0) >= 8 and promo_top - 15 <= b1 <= promo_top + 25:
            name = (b0, b1)

    acc = None
    if name is not None:
        target = name[1] + 35  # row-1 name→Accuracy offset on this artboard
        candidates = [
            b
            for b in bands
            if b[0] >= name[1] + 12
            and b[0] <= name[1] + 55
            and (b[1] - b[0]) >= 8
        ]
        if candidates:
            acc = min(candidates, key=lambda b: abs(b[0] - target))

    pct = None
    if acc is not None:
        pct_cands = [
            b
            for b in bands
            if b[0] >= acc[1] + 8
            and b[0] <= acc[1] + 55
            and (b[1] - b[0]) >= 8
        ]
        if pct_cands:
            pct = max(pct_cands, key=lambda b: b[1])

    content_bot = None
    if pct is not None:
        content_bot = pct[1]
    elif acc is not None:
        # Acc found but % band missed — apply observed Acc→% span (~40px)
        content_bot = acc[1] + 42
    elif name is not None:
        content_bot = name[1] + 90
    elif bands:
        content_bot = bands[-1][1]
    else:
        raise RuntimeError("could not locate row-2 card bottom")

    # Soft purple/cyan card rim sits a few px below the last % glyph.
    rim_bot = content_bot
    for y in range(content_bot, min(h - 1, content_bot + 28)):
        hits = 0
        for c in range(5):
            left = TOPIC_START_X + c * (TOPIC_CARD_W + TOPIC_GAP_X)
            x0 = int(((left + 1.0) / 100.0) * w)
            x1 = int(((left + TOPIC_CARD_W - 1.0) / 100.0) * w)
            rim = sum(
                1
                for x in range(x0, x1)
                if px[x, y][2] > 70
                and px[x, y][0] < 120
                and px[x, y][1] < 140
            )
            if rim > (x1 - x0) * 0.12:
                hits += 1
        if hits >= 3:
            rim_bot = y

    return min(h - 1, max(content_bot + 8, rim_bot + 2))


def measure_train_geometry(train: Image.Image) -> dict[str, int]:
    """Exact pixel bounds from Train — never from Focus, never broad %-guesses."""
    w, h = train.size
    px = train.load()

    promo_top = None
    px0, px1 = 20, w - 20
    for y in range(820, 920):
        whites = [x for x in range(w) if _is_near_white(px[x, y])]
        if len(whites) > 100 and whites[-1] - whites[0] > 600:
            promo_top = y
            px0 = max(0, whites[0] - 10)
            px1 = min(w - 1, whites[-1] + 10)
            break
    if promo_top is None:
        raise RuntimeError("could not locate promo dashed top")

    for y in range(promo_top, min(h - 1, 1125)):
        xs: list[int] = []
        for x in range(w):
            c = px[x, y]
            if (
                _is_near_white(c)
                or _is_promo_cyan(c)
                or _is_promo_gold(c)
                or _is_bright_cyan_text(c)
            ):
                xs.append(x)
        if len(xs) > 8:
            px0 = min(px0, max(0, xs[0] - 6))
            px1 = max(px1, min(w - 1, xs[-1] + 6))

    footer_top = None
    for y in range(1135, min(h - 1, 1220)):
        white_c = sum(
            1
            for x in range(int(w * 0.28), int(w * 0.72))
            if px[x, y][0] > 210 and px[x, y][1] > 210 and px[x, y][2] > 210
        )
        dark = sum(
            1
            for x in range(w)
            if px[x, y][0] < 40 and px[x, y][1] < 50 and px[x, y][2] < 80
        )
        if white_c >= 45 and dark >= int(w * 0.70):
            footer_top = y
            break
    if footer_top is None:
        for y in range(1145, min(h - 1, 1220)):
            yellow = sum(
                1
                for x in range(int(w * 0.30), int(w * 0.70))
                if px[x, y][0] > 195 and px[x, y][1] > 165 and px[x, y][2] < 100
            )
            if yellow >= 8:
                footer_top = y
                break
    if footer_top is None:
        raise RuntimeError("could not locate footer top")

    promo_bot = promo_top
    for y in range(promo_top, footer_top - 2):
        if _promo_signal_count(px, y, w, px0, px1) >= 4:
            promo_bot = y
    promo_bot = min(promo_bot + 4, footer_top - 2)
    for y in range(promo_bot + 1, footer_top - 1):
        mid = sum(1 for x in range(px0, px1 + 1) if 45 <= lum(px[x, y]) <= 140)
        if mid > 80:
            promo_bot = y
        else:
            break

    # Complete card bounds from Train pixels.
    # Row-2 bottom is measured directly (glyphs under the dashed promo edge),
    # NOT truncated at promo_top. Clean fill starts at row2_bot + 1.
    row1_bot = _measure_row1_accuracy_bottom(px, w, h)
    row2_top = _measure_row_top(px, w, h, y_lo=640, y_hi=670)
    row2_bot = _measure_row2_card_bottom(px, w, h, row2_top, promo_top)
    card_h = row2_bot - row2_top
    row1_top = row1_bot - card_h
    if row1_top < 300:
        row1_top = _measure_row_top(px, w, h, y_lo=340, y_hi=400)

    if not (row1_top < row1_bot < row2_top < row2_bot < footer_top):
        raise RuntimeError(
            f"card geometry assert failed: r1={row1_top}-{row1_bot} "
            f"r2={row2_top}-{row2_bot} footer={footer_top}"
        )
    if not (promo_top < promo_bot < footer_top):
        raise RuntimeError(
            f"promo geometry assert failed: promo=({promo_top},{promo_bot}) footer={footer_top}"
        )

    clean_top = row2_bot + 1
    if clean_top >= footer_top:
        raise RuntimeError(
            f"no room for clean area: row2_bot={row2_bot} footer={footer_top}"
        )

    return {
        "row1_top": row1_top,
        "row1_bot": row1_bot,
        "row2_top": row2_top,
        "row2_bot": row2_bot,
        "clean_top": clean_top,
        "promo_top": promo_top,
        "promo_bot": promo_bot,
        "footer_top": footer_top,
        "px0": px0,
        "px1": px1,
        "w": w,
        "h": h,
    }


def _sample_sky_pixel(
    spx,
    x: int,
    y: int,
    w: int,
    h: int,
    px0: int,
    px1: int,
    gap0: int,
    gap1: int,
    fallback: tuple[int, int, int],
) -> tuple[int, int, int]:
    def ok(c: tuple[int, int, int]) -> bool:
        return lum(c) < 95 and not (
            _is_near_white(c)
            or _is_promo_cyan(c)
            or _is_promo_gold(c)
            or _is_bright_cyan_text(c)
        )

    for dx in (1, 2, 4, 8, 16, 32, 48):
        for sx in (px0 - dx, px1 + dx):
            if 0 <= sx < w and ok(spx[sx, y]):
                return spx[sx, y]

    if gap1 > gap0:
        gap_h = gap1 - gap0
        sy = gap0 + ((y - gap0) % gap_h)
        for sx in [x] + [x + d for d in (-4, 4, -12, 12, -28, 28, -50, 50)]:
            if 0 <= sx < w and gap0 <= sy < h and ok(spx[sx, sy]):
                return spx[sx, sy]

    samples: list[tuple[int, int, int]] = []
    for sx in list(range(0, max(1, px0))) + list(range(min(w - 1, px1 + 1), w)):
        c = spx[sx, y]
        if ok(c):
            samples.append(c)
            if len(samples) >= 24:
                break
    if samples:
        return (
            int(sum(s[0] for s in samples) / len(samples)),
            int(sum(s[1] for s in samples) / len(samples)),
            int(sum(s[2] for s in samples) / len(samples)),
        )
    return fallback


def _card_rect(
    w: int,
    index: int,
    row_tops: tuple[int, int],
    row_bots: tuple[int, int],
) -> tuple[int, int, int, int]:
    left, _ = topic_origin(index)
    row = index // 5
    x0 = max(0, int((left / 100.0) * w) - 1)
    x1 = min(w - 1, int(((left + TOPIC_CARD_W) / 100.0) * w) + 1)
    y0 = row_tops[row]
    y1 = row_bots[row]
    return x0, y0, x1, y1


def restore_topic_cards(out: Image.Image, src: Image.Image, geo: dict[str, int]) -> None:
    """Copy complete Train topic-card artwork (both rows) into Focus."""
    w, h = out.size
    opx = out.load()
    spx = src.load()
    row_tops = (geo["row1_top"], geo["row2_top"])
    row_bots = (geo["row1_bot"], geo["row2_bot"])
    n = 0
    for i in range(10):
        x0, y0, x1, y1 = _card_rect(w, i, row_tops, row_bots)
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                opx[x, y] = spx[x, y]
                n += 1
    print(
        f"  restored topic-card pixels: {n}  "
        f"row1={geo['row1_top']}-{geo['row1_bot']} "
        f"row2={geo['row2_top']}-{geo['row2_bot']}"
    )


def replace_promo_band(out: Image.Image, src: Image.Image, geo: dict[str, int]) -> None:
    """
    Replace the promotional strip with clean sky.

    Fills from the dashed promo_top through promo_bot so inter-card dash
    fragments are removed. restore_topic_cards() then copies complete Train
    card rectangles through row2_bot, so names/Accuracy/%/borders return.
    Footer (y >= footer_top) is never written.
    """
    w, h = out.size
    opx = out.load()
    spx = src.load()
    # Fill the full promo Y span; cards are restored afterward.
    y0 = geo["promo_top"]
    y1 = geo["promo_bot"]
    x0, x1 = geo["px0"], geo["px1"]
    # Sky reference: dark band just above the dashed edge (may be short).
    gap1 = geo["promo_top"] - 2
    gap0 = max(geo["row1_bot"] + 4, gap1 - 30)
    if gap1 <= gap0:
        gap0, gap1 = 0, 0
    footer_top = geo["footer_top"]
    fallback = (0, 14, 42)
    n = 0

    for y in range(y0, y1 + 1):
        if y >= footer_top:
            continue
        for x in range(x0, x1 + 1):
            opx[x, y] = _sample_sky_pixel(
                spx, x, y, w, h, x0, x1, gap0, gap1, fallback
            )
            n += 1
    print(
        f"  promo sky fill pixels: {n}  y={y0}-{y1} x={x0}-{x1} "
        f"(cards restored through row2_bot={geo['row2_bot']}, "
        f"clean_top={geo['clean_top']})"
    )


def clear_topic_badges(out: Image.Image, src: Image.Image) -> None:
    w, h = out.size
    opx = out.load()
    spx = src.load()
    remaining: set[tuple[int, int]] = set()
    for i in range(10):
        left, top = topic_origin(i)
        samples: list[tuple[int, int, int]] = []
        for ox, oy in ((6.5, 2.5), (8.0, 3.5), (5.5, 4.5), (7.0, 5.0), (9.0, 4.0)):
            x = int(((left + ox) / 100.0) * w)
            y = int(((top + oy) / 100.0) * h)
            if 0 <= x < w and 0 <= y < h:
                r, g, b = spx[x, y]
                if lum((r, g, b)) < 95:
                    samples.append((r, g, b))
        fill = (
            (
                int(sum(c[0] for c in samples) / len(samples)),
                int(sum(c[1] for c in samples) / len(samples)),
                int(sum(c[2] for c in samples) / len(samples)),
            )
            if samples
            else (0, 18, 56)
        )
        cx, cy, radius = badge_circle(w, h, i)
        r_pad = radius + 1.5
        for y in range(max(0, int(cy - r_pad - 1)), min(h, int(cy + r_pad + 2))):
            for x in range(max(0, int(cx - r_pad - 1)), min(w, int(cx + r_pad + 2))):
                if (x - cx) ** 2 + (y - cy) ** 2 <= r_pad * r_pad:
                    opx[x, y] = fill
                    remaining.add((x, y))
    edge_fill(opx, set(remaining), w, h, fallback=(0, 18, 56))
    print(f"  badge clear pixels: {len(remaining)}")


def mask_train_mode_glyphs(px, w: int, h: int) -> list[list[bool]]:
    mask = [[False] * w for _ in range(h)]
    # Cover full Train MODE gold band (~y 111–159) so FOCUS MODE can sit below subject.
    y0, y1 = int(h * 0.055), int(h * 0.145)
    x0, x1 = int(w * 0.22), int(w * 0.80)
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            if r > 170 and g > 110 and b < 100 and r >= g:
                mask[y][x] = True
                continue
            if r < 55 and g < 45 and b < 55 and lum((r, g, b)) < 40:
                near = False
                for dy in range(-3, 4):
                    for dx in range(-3, 4):
                        nx, ny = x + dx, y + dy
                        if not (x0 <= nx < x1 and y0 <= ny < y1):
                            continue
                        rr, gg, bb = px[nx, ny]
                        if rr > 170 and gg > 110 and bb < 100 and rr >= gg:
                            near = True
                            break
                    if near:
                        break
                if near:
                    mask[y][x] = True
    return dilate(mask, w, h, rounds=2)


def mask_instruction_glyphs(px, w: int, h: int) -> list[list[bool]]:
    mask = [[False] * w for _ in range(h)]
    y0, y1 = int(h * 0.140), int(h * 0.185)
    x0, x1 = int(w * 0.12), int(w * 0.88)
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            L = lum((r, g, b))
            if L >= 140 and abs(r - g) < 35 and abs(g - b) < 35:
                mask[y][x] = True
            elif L >= 90 and abs(r - g) < 30 and abs(g - b) < 30 and min(r, g, b) > 60:
                mask[y][x] = True
    return dilate(mask, w, h, rounds=2)


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        font = ImageFont.truetype(str(FONT_PATH), size=size)
        try:
            font.set_variation_by_axes([700, 100])
        except Exception:
            pass
        return font
    except OSError:
        return ImageFont.load_default()


def _measure_subject_title_bottom(px, w: int, h: int) -> int:
    """Bottom Y of the white MATHS / ENGLISH subject title (center band)."""
    last = 0
    x0, x1 = int(w * 0.28), int(w * 0.72)
    for y in range(int(h * 0.028), int(h * 0.095)):
        white = sum(
            1
            for x in range(x0, x1)
            if px[x, y][0] > 220
            and px[x, y][1] > 220
            and px[x, y][2] > 220
        )
        if white >= 80:
            last = y
    if last < int(h * 0.04):
        raise RuntimeError("could not locate subject title bottom")
    return last


def paint_focus_title(out: Image.Image) -> tuple[int, int]:
    """
    Paint FOCUS MODE below the subject title with Train-parity breathing room.

    Train MODE gold sits ~22px under the subject title bottom. Do not paint at
    the old 0.070h anchor (that overlapped MATHS / ENGLISH).
    """
    w, h = out.size
    opx = out.load()
    subject_bot = _measure_subject_title_bottom(opx, w, h)
    m = mask_train_mode_glyphs(opx, w, h)
    remaining = {(x, y) for y in range(h) for x in range(w) if m[y][x]}
    print(f"  title clear pixels: {len(remaining)}  subject_bot={subject_bot}")
    edge_fill(opx, remaining, w, h, fallback=(0, 12, 38))

    draw = ImageDraw.Draw(out)
    # Slightly under Train MODE optical size so a larger subject gap still fits
    # instruction above Easy / Medium / Hard.
    font_size = int(h * 0.050)
    font = load_font(font_size)
    max_w = int(w * 0.58)
    for _ in range(14):
        bbox = draw.textbbox((0, 0), FOCUS_MODE_LABEL, font=font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        if tw <= max_w and th <= int(h * 0.060):
            break
        font_size = max(20, int(font_size * 0.92))
        font = load_font(font_size)
    bbox = draw.textbbox((0, 0), FOCUS_MODE_LABEL, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (w - tw) // 2 - bbox[0]
    # Clear breathing room between subject title and FOCUS MODE (not touching).
    gap_after_subject = 36
    y = subject_bot + gap_after_subject - bbox[1]
    outline = (22, 12, 4)
    for dx in range(-3, 4):
        for dy in range(-3, 4):
            if dx == 0 and dy == 0:
                continue
            if dx * dx + dy * dy > 10:
                continue
            draw.text((x + dx, y + dy), FOCUS_MODE_LABEL, font=font, fill=outline)
    draw.text((x + 2, y + 3), FOCUS_MODE_LABEL, font=font, fill=(12, 6, 2))
    draw.text((x, y), FOCUS_MODE_LABEL, font=font, fill=(255, 200, 20))
    mode_top = y + bbox[1]
    mode_bot = mode_top + th
    print(f"  FOCUS MODE y={mode_top}-{mode_bot}  gap_subject->mode={mode_top - subject_bot}")
    return mode_top, mode_bot


def paint_focus_instruction(out: Image.Image, mode_bot: int) -> tuple[int, int]:
    """Paint instruction with clear breathing room under FOCUS MODE."""
    w, h = out.size
    opx = out.load()
    m = mask_instruction_glyphs(opx, w, h)
    remaining = {(x, y) for y in range(h) for x in range(w) if m[y][x]}
    print(f"  instruction clear pixels: {len(remaining)}")
    edge_fill(opx, remaining, w, h, fallback=(0, 12, 38))

    draw = ImageDraw.Draw(out)
    font_size = int(h * 0.0175)
    font = load_font(font_size)
    max_w = int(w * 0.88)
    for _ in range(18):
        bbox = draw.textbbox((0, 0), FOCUS_INSTRUCTION, font=font)
        tw = bbox[2] - bbox[0]
        if tw <= max_w:
            break
        font_size = max(11, int(font_size * 0.92))
        font = load_font(font_size)
    bbox = draw.textbbox((0, 0), FOCUS_INSTRUCTION, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (w - tw) // 2 - bbox[0]
    # Train: MODE ends ~159, instruction ~193 → ~34px gap.
    # Keep instruction above difficulty controls (~y 220+).
    gap_after_mode = 28
    y = mode_bot + gap_after_mode - bbox[1]
    max_instr_bot = int(h * 0.171)  # ~216 — leave air above Easy/Medium/Hard
    if y + bbox[1] + th > max_instr_bot:
        y = max_instr_bot - th - bbox[1]
    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        draw.text((x + dx, y + dy), FOCUS_INSTRUCTION, font=font, fill=(0, 8, 28))
    draw.text((x, y), FOCUS_INSTRUCTION, font=font, fill=(245, 248, 255))
    instr_top = y + bbox[1]
    instr_bot = instr_top + th
    print(
        f"  instruction y={instr_top}-{instr_bot}  "
        f"gap_mode->instr={instr_top - mode_bot}"
    )
    return instr_top, instr_bot


def compose_one(src: Path, out: Path) -> dict[str, int]:
    train = Image.open(src).convert("RGB")
    geo = measure_train_geometry(train)
    print(
        "  geometry:",
        f"row1={geo['row1_top']}-{geo['row1_bot']}",
        f"row2={geo['row2_top']}-{geo['row2_bot']}",
        f"clean={geo['clean_top']}-{geo['promo_bot']}",
        f"promo_edge={geo['promo_top']}",
        f"footer_top={geo['footer_top']}",
    )
    assert geo["clean_top"] > geo["row2_bot"], "clean area must start after row-2 cards"

    focus = train.copy()
    replace_promo_band(focus, train, geo)
    restore_topic_cards(focus, train, geo)
    clear_topic_badges(focus, train)
    _mode_top, mode_bot = paint_focus_title(focus)
    paint_focus_instruction(focus, mode_bot)

    out.parent.mkdir(parents=True, exist_ok=True)
    focus.save(out, format="PNG", optimize=True)
    print(f"  wrote {out.relative_to(ROOT)}")
    return geo


def main() -> None:
    for job in JOBS:
        print(f"{job['tp_out']} <- {job['tp_src']}: {job['src'].name} -> {job['out'].name}")
        if not job["src"].exists():
            raise SystemExit(f"missing {job['src']}")
        compose_one(job["src"], job["out"])
    print("done")


if __name__ == "__main__":
    main()
