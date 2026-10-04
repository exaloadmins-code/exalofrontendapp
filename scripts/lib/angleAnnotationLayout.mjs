/**
 * JS mirror of src/components/train/diagrams/angles/annotationLayout.ts
 * for Node fixture validation (no TS loader in this repo).
 */

const DEG = Math.PI / 180;

export function estimateTextBox(text, fontSize) {
  const t = (text || '?').trim() || '?';
  return {
    w: Math.max(fontSize * 0.62 * t.length, fontSize * 1.1),
    h: fontSize * 1.15,
  };
}

export function boxFromCenter(id, kind, cx, cy, w, h) {
  return { id, kind, cx, cy, w, h };
}

export function boxesOverlap(a, b, pad = 0) {
  return (
    Math.abs(a.cx - b.cx) * 2 < a.w + b.w + pad * 2 &&
    Math.abs(a.cy - b.cy) * 2 < a.h + b.h + pad * 2
  );
}

function boxHitsAny(box, obstacles, pad = 0) {
  return obstacles.some((o) => boxesOverlap(box, o, pad));
}

function polar(vx, vy, angleDeg, radius) {
  return {
    x: vx + radius * Math.cos(angleDeg * DEG),
    y: vy - radius * Math.sin(angleDeg * DEG),
  };
}

function absSweep(sweep) {
  return Math.abs(sweep);
}

function bisectorDeg(a0, sweep) {
  return a0 + sweep / 2;
}

export function clampAngleInsideSector(angleDeg, a0, sweep, marginFrac = 0.12) {
  const span = absSweep(sweep);
  if (span < 1e-6) return a0;
  const margin = Math.min(span * marginFrac, span * 0.45);
  const bis = bisectorDeg(a0, sweep);
  let delta = angleDeg - bis;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  const maxDelta = span / 2 - margin;
  if (delta > maxDelta) delta = maxDelta;
  if (delta < -maxDelta) delta = -maxDelta;
  return bis + delta;
}

export function normalizeSweep(fromDeg, toDeg) {
  let sweep = toDeg - fromDeg;
  while (sweep <= -180) sweep += 360;
  while (sweep > 180) sweep -= 360;
  if (sweep < 0) sweep += 360;
  if (sweep > 180) sweep = sweep - 360;
  return sweep === 0 ? 0 : sweep;
}

function angularDistToSectorEdges(ang, a0, sweep) {
  const bis = bisectorDeg(a0, sweep);
  let d = ang - bis;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return absSweep(sweep) / 2 - Math.abs(d);
}

function rightAngleObstacle(m) {
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

function buildAngleCandidates(s, font, text) {
  const { w, h } = estimateTextBox(text, font);
  const span = absSweep(s.sweep);
  const bis = bisectorDeg(s.a0, s.sweep);
  const minR = Math.max(s.arcRadius + font * 0.55, s.labelRadius * 0.75, font * 1.8);
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
  const cands = [];
  for (const r of radii) {
    for (const frac of angFracs) {
      const rawAng = bis + (s.sweep >= 0 ? 1 : -1) * span * frac;
      const ang = clampAngleInsideSector(rawAng, s.a0, s.sweep, 0.14);
      const distToEdge = angularDistToSectorEdges(ang, s.a0, s.sweep);
      if (distToEdge < Math.min(7, span * 0.1)) continue;
      const p = polar(s.vx, s.vy, ang, r);
      const box = boxFromCenter(`cand-${s.sectorId}`, 'angle', p.x, p.y, w, h);
      const radialPenalty = Math.abs(r - s.labelRadius) / Math.max(1, s.labelRadius);
      const angPenalty = Math.abs(ang - bis) / Math.max(1, span);
      cands.push({
        angleDeg: ang,
        radius: r,
        x: p.x,
        y: p.y,
        box,
        score: radialPenalty * 0.6 + angPenalty * 1.2,
      });
    }
  }
  cands.sort((a, b) => a.score - b.score);
  return cands;
}

function pickBestAnglePlacement(s, font, obstacles, pad) {
  if (!s.label) return null;
  const cands = buildAngleCandidates(s, font, s.label);
  if (!cands.length) return null;
  let best = cands[0];
  for (const c of cands) {
    if (!boxHitsAny(c.box, obstacles, pad)) {
      best = c;
      break;
    }
  }
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

function buildPointCandidates(p, font, densestBisectorDeg) {
  const { w, h } = estimateTextBox(p.text, font);
  const dist0 = Math.max(font * 1.4, 14);
  const dists = [dist0, dist0 * 1.35, dist0 * 1.7, dist0 * 2.1];
  const dirs = [];
  if (p.isCentralO) {
    const away = densestBisectorDeg != null ? densestBisectorDeg + 180 : 45;
    dirs.push(away, away + 45, away - 45, away + 90, away - 90);
  } else {
    const prefAng =
      Math.hypot(p.preferredOx, p.preferredOy) > 1e-6
        ? Math.atan2(-p.preferredOy, p.preferredOx) / DEG
        : 45;
    dirs.push(prefAng, prefAng + 40, prefAng - 40, prefAng + 90);
    if (p.rayAnglesDeg?.length >= 2) {
      const wrap = p.rayAnglesDeg.map((a) => ((a % 360) + 360) % 360).sort((a, b) => a - b);
      let bestGap = -1;
      let gapBis = 0;
      for (let i = 0; i < wrap.length; i += 1) {
        const a = wrap[i];
        const b = wrap[(i + 1) % wrap.length];
        const gap = i === wrap.length - 1 ? b + 360 - a : b - a;
        if (gap > bestGap) {
          bestGap = gap;
          gapBis = a + gap / 2;
        }
      }
      dirs.push(gapBis);
    }
  }
  const cands = [];
  for (const dist of dists) {
    for (const ang of dirs) {
      const pt = polar(p.vx, p.vy, ang, dist);
      cands.push({
        x: pt.x,
        y: pt.y,
        box: boxFromCenter(`pt-${p.id}`, 'point', pt.x, pt.y, w, h),
        score: dist,
      });
    }
  }
  cands.sort((a, b) => a.score - b.score);
  return cands;
}

export function layoutAngleAnnotations(input) {
  const pad = Math.max(2, input.angleFont * 0.12);
  const obstacles = [];
  for (const ra of input.rightAngles || []) obstacles.push(rightAngleObstacle(ra));
  for (const s of input.sectors) {
    const mid = bisectorDeg(s.a0, s.sweep);
    const p = polar(s.vx, s.vy, mid, s.arcRadius);
    obstacles.push(
      boxFromCenter(`arc-${s.sectorId}`, 'arc', p.x, p.y, Math.max(6, s.arcRadius * 0.2), Math.max(6, s.arcRadius * 0.2)),
    );
    obstacles.push(
      boxFromCenter(`vert-${s.vertexId}`, 'vertex_dot', s.vx, s.vy, Math.max(10, s.arcRadius * 0.22), Math.max(10, s.arcRadius * 0.22)),
    );
  }

  const labeled = input.sectors
    .filter((s) => s.label && s.label.trim().length > 0)
    .slice()
    .sort((a, b) => absSweep(a.sweep) - absSweep(b.sweep));

  const angleLabels = [];
  for (const s of labeled) {
    const placed = pickBestAnglePlacement(s, input.angleFont, obstacles, pad);
    if (!placed) continue;
    angleLabels.push(placed);
    obstacles.push(placed.box);
  }

  let densest = null;
  if (angleLabels.length) {
    let sx = 0;
    let sy = 0;
    for (const l of angleLabels) {
      if (typeof l.placeAngleDeg !== 'number') continue;
      sx += Math.cos(l.placeAngleDeg * DEG);
      sy += Math.sin(l.placeAngleDeg * DEG);
    }
    densest = Math.atan2(sy, sx) / DEG;
  }

  const pointLabels = [];
  const pointsOrdered = [
    ...(input.points || []).filter((p) => !p.isCentralO),
    ...(input.points || []).filter((p) => p.isCentralO),
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
    if (!chosen) continue;
    const placed = {
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

export function angleInsideSector(placeAngleDeg, a0, sweep, eps = 0.5) {
  const bis = bisectorDeg(a0, sweep);
  let d = placeAngleDeg - bis;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return Math.abs(d) <= absSweep(sweep) / 2 + eps;
}
