/**
 * Deterministic collision-aware annotation layout for Angles diagrams.
 * Does NOT change sector membership — only adjusts placement within a sector
 * (or near a vertex for point labels).
 */

const DEG = Math.PI / 180;

export type Box = {
  id: string;
  kind: 'angle' | 'point' | 'vertex_dot' | 'right_angle' | 'arc' | 'ray';
  /** centre */
  cx: number;
  cy: number;
  w: number;
  h: number;
};

export type SectorGeom = {
  sectorId: string;
  angleId: string;
  label: string;
  vertexId: string;
  vx: number;
  vy: number;
  /** ray_from angle (deg, math convention: CCW from +x, SVG y-down handled by caller) */
  a0: number;
  /** signed sweep from a0 toward ray_to (same convention as existing renderer) */
  sweep: number;
  arcRadius: number;
  labelRadius: number;
};

export type RightAngleGeom = {
  id: string;
  /** three corners of the square marker polyline */
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  p3: { x: number; y: number };
  vertex: { x: number; y: number };
};

export type PointGeom = {
  id: string;
  text: string;
  vx: number;
  vy: number;
  /** preferred payload offset (already scaled) */
  preferredOx: number;
  preferredOy: number;
  /** outgoing ray angles at this vertex (deg), for outward placement */
  rayAnglesDeg: number[];
  /** polygon neighbour directions if known (unit outward preference) */
  isCentralO: boolean;
};

export type PlacedLabel = {
  id: string;
  kind: 'angle' | 'point';
  text: string;
  x: number;
  y: number;
  box: Box;
  /** sector id for angle labels */
  sectorId?: string;
  /** final placement angle (deg) for angle labels */
  placeAngleDeg?: number;
  placeRadius?: number;
};

export type AnnotationLayoutInput = {
  sectors: SectorGeom[];
  points: PointGeom[];
  rightAngles: RightAngleGeom[];
  /** approximate text size in viewBox units */
  angleFont: number;
  pointFont: number;
};

export type AnnotationLayoutResult = {
  angleLabels: PlacedLabel[];
  pointLabels: PlacedLabel[];
  obstacles: Box[];
};

function absSweep(sweep: number): number {
  return Math.abs(sweep);
}

export function estimateTextBox(
  text: string,
  fontSize: number,
): { w: number; h: number } {
  const t = text.trim() || '?';
  // Approximate glyph aspect for degree labels / short point ids.
  const w = Math.max(fontSize * 0.62 * t.length, fontSize * 1.1);
  const h = fontSize * 1.15;
  return { w, h };
}

export function boxFromCenter(
  id: string,
  kind: Box['kind'],
  cx: number,
  cy: number,
  w: number,
  h: number,
): Box {
  return { id, kind, cx, cy, w, h };
}

export function boxesOverlap(a: Box, b: Box, pad = 0): boolean {
  return (
    Math.abs(a.cx - b.cx) * 2 < a.w + b.w + pad * 2 &&
    Math.abs(a.cy - b.cy) * 2 < a.h + b.h + pad * 2
  );
}

export function boxHitsAny(box: Box, obstacles: Box[], pad = 0): boolean {
  return obstacles.some((o) => boxesOverlap(box, o, pad));
}

/** Point on ray at radius (math angles: cos/sin with y-up; SVG uses y-down so caller uses -sin). */
export function polar(
  vx: number,
  vy: number,
  angleDeg: number,
  radius: number,
): { x: number; y: number } {
  return {
    x: vx + radius * Math.cos(angleDeg * DEG),
    y: vy - radius * Math.sin(angleDeg * DEG),
  };
}

export function bisectorDeg(a0: number, sweep: number): number {
  return a0 + sweep / 2;
}

/**
 * Clamp an angle so it stays strictly inside the open sector (a0, a0+sweep).
 */
export function clampAngleInsideSector(
  angleDeg: number,
  a0: number,
  sweep: number,
  marginFrac = 0.12,
): number {
  const span = absSweep(sweep);
  if (span < 1e-6) return a0;
  const margin = Math.min(span * marginFrac, span * 0.45);
  const lo = sweep >= 0 ? a0 + margin : a0 + sweep + margin;
  const hi = sweep >= 0 ? a0 + sweep - margin : a0 - margin;
  // Normalize angle into the sector interval via projection onto bisector delta.
  const bis = bisectorDeg(a0, sweep);
  let delta = angleDeg - bis;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  const maxDelta = span / 2 - margin;
  if (delta > maxDelta) delta = maxDelta;
  if (delta < -maxDelta) delta = -maxDelta;
  void lo;
  void hi;
  return bis + delta;
}

function rightAngleObstacle(m: RightAngleGeom): Box {
  const xs = [m.vertex.x, m.p1.x, m.p2.x, m.p3.x];
  const ys = [m.vertex.y, m.p1.y, m.p2.y, m.p3.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return boxFromCenter(
    m.id,
    'right_angle',
    (minX + maxX) / 2,
    (minY + maxY) / 2,
    Math.max(8, maxX - minX) * 1.15,
    Math.max(8, maxY - minY) * 1.15,
  );
}

function arcObstacle(s: SectorGeom): Box {
  const mid = bisectorDeg(s.a0, s.sweep);
  const p = polar(s.vx, s.vy, mid, s.arcRadius);
  const thick = Math.max(6, s.arcRadius * 0.12);
  // Rough AABB covering the arc wedge midpoint region.
  const span = absSweep(s.sweep);
  const chord = 2 * s.arcRadius * Math.sin(((span / 2) * DEG) / 1);
  return boxFromCenter(
    `arc-${s.sectorId}`,
    'arc',
    p.x,
    p.y,
    Math.max(thick, chord * 0.35),
    Math.max(thick, s.arcRadius * 0.2),
  );
}

function rayStubObstacles(s: SectorGeom): Box[] {
  const len = Math.max(s.arcRadius * 0.85, s.labelRadius * 0.7);
  const thick = Math.max(4, s.arcRadius * 0.06);
  const out: Box[] = [];
  for (const ang of [s.a0, s.a0 + s.sweep]) {
    const p = polar(s.vx, s.vy, ang, len * 0.55);
    out.push(
      boxFromCenter(`ray-${s.sectorId}-${ang}`, 'ray', p.x, p.y, thick, thick * 3),
    );
  }
  // Keep clear of the vertex itself.
  out.push(
    boxFromCenter(
      `vert-${s.vertexId}`,
      'vertex_dot',
      s.vx,
      s.vy,
      Math.max(10, s.arcRadius * 0.22),
      Math.max(10, s.arcRadius * 0.22),
    ),
  );
  return out;
}

type AngleCandidate = {
  angleDeg: number;
  radius: number;
  x: number;
  y: number;
  box: Box;
  score: number;
};

function buildAngleCandidates(
  s: SectorGeom,
  font: number,
  text: string,
): AngleCandidate[] {
  const { w, h } = estimateTextBox(text, font);
  const span = absSweep(s.sweep);
  const bis = bisectorDeg(s.a0, s.sweep);
  const minR = Math.max(
    s.arcRadius + font * 0.55,
    s.labelRadius * 0.75,
    font * 1.8,
  );
  // Narrow sectors push labels farther out along the bisector.
  const narrowBoost = span < 35 ? font * 1.2 : span < 55 ? font * 0.6 : 0;
  const baseR = Math.max(minR, s.labelRadius + narrowBoost * 0.35);
  const radii = [
    baseR,
    baseR + font * 0.55,
    baseR + font * 1.1,
    baseR + font * 1.7,
    baseR + font * 2.4,
    Math.max(baseR, s.arcRadius + font * 1.8),
  ];
  const angFracs =
    span < 28
      ? [0, 0.08, -0.08, 0.14, -0.14]
      : [0, 0.12, -0.12, 0.2, -0.2, 0.28, -0.28];

  const cands: AngleCandidate[] = [];
  for (const r of radii) {
    for (const frac of angFracs) {
      const rawAng = bis + sweepSign(s.sweep) * span * frac;
      const ang = clampAngleInsideSector(rawAng, s.a0, s.sweep, 0.14);
      // Reject if too close to a bounding ray.
      const distToEdge = angularDistToSectorEdges(ang, s.a0, s.sweep);
      if (distToEdge < Math.min(7, span * 0.1)) continue;
      const p = polar(s.vx, s.vy, ang, r);
      const box = boxFromCenter(`cand-${s.sectorId}`, 'angle', p.x, p.y, w, h);
      // Prefer closer to payload labelRadius and nearer bisector.
      const radialPenalty = Math.abs(r - s.labelRadius) / Math.max(1, s.labelRadius);
      const angPenalty = Math.abs(ang - bis) / Math.max(1, span);
      const score = radialPenalty * 0.6 + angPenalty * 1.2 + (r < minR ? 2 : 0);
      cands.push({ angleDeg: ang, radius: r, x: p.x, y: p.y, box, score });
    }
  }
  cands.sort((a, b) => a.score - b.score);
  return cands;
}

function sweepSign(sweep: number): number {
  return sweep >= 0 ? 1 : -1;
}

function angularDistToSectorEdges(
  ang: number,
  a0: number,
  sweep: number,
): number {
  const bis = bisectorDeg(a0, sweep);
  let d = ang - bis;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  const half = absSweep(sweep) / 2;
  return half - Math.abs(d);
}

function pickBestAnglePlacement(
  s: SectorGeom,
  font: number,
  obstacles: Box[],
  pad: number,
): PlacedLabel | null {
  if (!s.label) return null;
  const cands = buildAngleCandidates(s, font, s.label);
  if (!cands.length) return null;
  let best = cands[0]!;
  for (const c of cands) {
    if (!boxHitsAny(c.box, obstacles, pad)) {
      best = c;
      break;
    }
    // Keep lowest-score colliding as last resort (still inside sector).
    if (c.score < best.score) best = c;
  }
  // If all collide, try one more push outward on bisector only.
  if (boxHitsAny(best.box, obstacles, pad)) {
    const bis = bisectorDeg(s.a0, s.sweep);
    for (const extra of [1.0, 1.4, 1.8, 2.2]) {
      const r = Math.max(s.arcRadius, s.labelRadius) + font * extra;
      const p = polar(s.vx, s.vy, bis, r);
      const { w, h } = estimateTextBox(s.label, font);
      const box = boxFromCenter(s.sectorId, 'angle', p.x, p.y, w, h);
      if (!boxHitsAny(box, obstacles, pad)) {
        best = { angleDeg: bis, radius: r, x: p.x, y: p.y, box, score: 0 };
        break;
      }
    }
  }
  return {
    id: s.sectorId,
    kind: 'angle',
    text: s.label,
    x: best.x,
    y: best.y,
    box: { ...best.box, id: s.sectorId },
    sectorId: s.sectorId,
    placeAngleDeg: best.angleDeg,
    placeRadius: best.radius,
  };
}

function meanAngleDeg(angles: number[]): number | null {
  if (!angles.length) return null;
  let sx = 0;
  let sy = 0;
  for (const a of angles) {
    sx += Math.cos(a * DEG);
    sy += Math.sin(a * DEG);
  }
  return (Math.atan2(sy, sx) / DEG);
}

function buildPointCandidates(
  p: PointGeom,
  font: number,
  densestBisectorDeg: number | null,
): { x: number; y: number; box: Box; score: number }[] {
  const { w, h } = estimateTextBox(p.text, font);
  const dist0 = Math.max(font * 1.4, 14);
  const dists = [dist0, dist0 * 1.35, dist0 * 1.7, dist0 * 2.1];

  const dirs: number[] = [];
  if (p.isCentralO) {
    // Prefer away from densest annotation bisector.
    const away =
      densestBisectorDeg != null ? densestBisectorDeg + 180 : 45;
    dirs.push(away, away + 45, away - 45, away + 90, away - 90, 30, -30, 135, -135);
  } else if (p.rayAnglesDeg.length >= 2) {
    // Exterior bisector of the two extreme local edges ≈ opposite interior.
    const sorted = [...p.rayAnglesDeg].sort((a, b) => a - b);
    // Place outside: average of outward normals — use preferred offset angle if non-zero.
    const prefAng =
      Math.hypot(p.preferredOx, p.preferredOy) > 1e-6
        ? (Math.atan2(-p.preferredOy, p.preferredOx) / DEG)
        : null;
    if (prefAng != null) dirs.push(prefAng);
    // Also try exterior directions between consecutive rays (largest gap).
    const wrap = sorted.map((a) => ((a % 360) + 360) % 360).sort((a, b) => a - b);
    let bestGap = -1;
    let gapBis = 0;
    for (let i = 0; i < wrap.length; i += 1) {
      const a = wrap[i]!;
      const b = wrap[(i + 1) % wrap.length]!;
      const gap = i === wrap.length - 1 ? b + 360 - a : b - a;
      if (gap > bestGap) {
        bestGap = gap;
        gapBis = a + gap / 2;
      }
    }
    dirs.push(gapBis, gapBis + 20, gapBis - 20);
    for (const a of sorted) dirs.push(a + 90, a - 90);
  } else {
    const prefAng =
      Math.hypot(p.preferredOx, p.preferredOy) > 1e-6
        ? (Math.atan2(-p.preferredOy, p.preferredOx) / DEG)
        : 45;
    dirs.push(prefAng, prefAng + 40, prefAng - 40, prefAng + 90, prefAng - 90);
  }

  // Deduplicate roughly
  const uniq: number[] = [];
  for (const d of dirs) {
    const n = ((d % 360) + 360) % 360;
    if (!uniq.some((u) => Math.abs(u - n) < 8 || Math.abs(u - n) > 352)) {
      uniq.push(n);
    }
  }

  const cands: { x: number; y: number; box: Box; score: number }[] = [];
  for (const dist of dists) {
    for (const ang of uniq) {
      const pt = polar(p.vx, p.vy, ang, dist);
      const box = boxFromCenter(`pt-${p.id}`, 'point', pt.x, pt.y, w, h);
      // Prefer closer + preferred direction.
      const pref = polar(
        p.vx,
        p.vy,
        Math.hypot(p.preferredOx, p.preferredOy) > 1e-6
          ? Math.atan2(-p.preferredOy, p.preferredOx) / DEG
          : ang,
        dist0,
      );
      const score =
        Math.hypot(pt.x - pref.x, pt.y - pref.y) / Math.max(1, dist0) +
        (dist - dist0) / dist0;
      cands.push({ x: pt.x, y: pt.y, box, score });
    }
  }
  cands.sort((a, b) => a.score - b.score);
  return cands;
}

/**
 * Layout all angle + point annotations with deterministic collision avoidance.
 */
export function layoutAngleAnnotations(
  input: AnnotationLayoutInput,
): AnnotationLayoutResult {
  const pad = Math.max(2, input.angleFont * 0.12);
  const obstacles: Box[] = [];

  for (const ra of input.rightAngles) {
    obstacles.push(rightAngleObstacle(ra));
  }
  for (const s of input.sectors) {
    obstacles.push(arcObstacle(s));
    obstacles.push(...rayStubObstacles(s));
  }

  // Place labeled sectors: narrowest first (hardest), then by label length.
  const labeled = input.sectors
    .filter((s) => s.label.trim().length > 0)
    .slice()
    .sort((a, b) => {
      const da = absSweep(a.sweep) - absSweep(b.sweep);
      if (Math.abs(da) > 1) return da;
      return a.label.length - b.label.length;
    });

  const angleLabels: PlacedLabel[] = [];
  for (const s of labeled) {
    const placed = pickBestAnglePlacement(s, input.angleFont, obstacles, pad);
    if (!placed) continue;
    angleLabels.push(placed);
    obstacles.push(placed.box);
  }

  // Densest annotation direction (for O offset).
  let densest: number | null = null;
  if (angleLabels.length) {
    densest = meanAngleDeg(
      angleLabels
        .map((l) => l.placeAngleDeg)
        .filter((a): a is number => typeof a === 'number'),
    );
  }

  const pointLabels: PlacedLabel[] = [];
  // Perimeter points first, central O last so it can dodge.
  const pointsOrdered = [
    ...input.points.filter((p) => !p.isCentralO),
    ...input.points.filter((p) => p.isCentralO),
  ];

  for (const p of pointsOrdered) {
    const cands = buildPointCandidates(p, input.pointFont, densest);
    let chosen = cands[0];
    for (const c of cands) {
      if (!boxHitsAny(c.box, obstacles, pad)) {
        chosen = c;
        break;
      }
    }
    if (!chosen) {
      // Fallback: preferred offset.
      const { w, h } = estimateTextBox(p.text, input.pointFont);
      const x = p.vx + (p.preferredOx || 12);
      const y = p.vy + (p.preferredOy || -12);
      chosen = {
        x,
        y,
        box: boxFromCenter(p.id, 'point', x, y, w, h),
        score: 99,
      };
    }
    const placed: PlacedLabel = {
      id: p.id,
      kind: 'point',
      text: p.text,
      x: chosen.x,
      y: chosen.y,
      box: { ...chosen.box, id: `pt-${p.id}` },
    };
    pointLabels.push(placed);
    obstacles.push(placed.box);
  }

  return { angleLabels, pointLabels, obstacles };
}

/** Test helper: whether two placed labels overlap. */
export function placedLabelsOverlap(
  a: PlacedLabel,
  b: PlacedLabel,
  pad = 0,
): boolean {
  return boxesOverlap(a.box, b.box, pad);
}
