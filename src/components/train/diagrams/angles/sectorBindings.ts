/**
 * Pure helpers: resolve angle sector geometry from authoritative bindings.
 */

import { asFiniteNumber, asRecord } from '../guards';

export type ResolvedSector = {
  sectorId: string;
  angleId: string;
  label: string;
  drawArc: boolean;
  arcRadius: number;
  labelRadius: number;
  vertex: string;
  rayFrom: string;
  rayTo: string;
  /** true when geometry came from authoritative_sector_bindings */
  fromBinding: boolean;
};

/**
 * For each angle_sector, geometry (vertex/rays) MUST come from
 * authoritative_sector_bindings[angle_id] when bindings are present.
 * Label/draw_arc/radii still come from the sector entry.
 *
 * Returns null on broken refs / mismatches (fail closed).
 */
export function resolveSectorsWithBindings(
  data: Record<string, unknown>,
): ResolvedSector[] | null {
  if (!Array.isArray(data.angle_sectors)) return null;
  const bindings = asRecord(data.authoritative_sector_bindings);
  const out: ResolvedSector[] = [];

  for (const raw of data.angle_sectors) {
    const s = asRecord(raw);
    if (!s || typeof s.id !== 'string') return null;
    const angleId = typeof s.angle_id === 'string' ? s.angle_id : s.id;
    const arcRadius = asFiniteNumber(s.arc_radius);
    const labelRadius = asFiniteNumber(s.label_radius) ?? arcRadius;
    if (arcRadius == null || labelRadius == null) return null;

    const sectorVertex = typeof s.vertex === 'string' ? s.vertex : null;
    const sectorFrom = typeof s.ray_from === 'string' ? s.ray_from : null;
    const sectorTo = typeof s.ray_to === 'string' ? s.ray_to : null;
    if (!sectorVertex || !sectorFrom || !sectorTo) return null;

    let vertex = sectorVertex;
    let rayFrom = sectorFrom;
    let rayTo = sectorTo;
    let fromBinding = false;

    if (bindings) {
      const b = asRecord(bindings[angleId]);
      if (!b) return null; // binding required for every sector angle_id
      if (
        typeof b.vertex !== 'string' ||
        typeof b.ray_from !== 'string' ||
        typeof b.ray_to !== 'string'
      ) {
        return null;
      }
      // Authoritative geometry wins.
      vertex = b.vertex;
      rayFrom = b.ray_from;
      rayTo = b.ray_to;
      fromBinding = true;
      // If sector also declares rays, they must agree (detect corruption).
      if (
        sectorVertex !== vertex ||
        sectorFrom !== rayFrom ||
        sectorTo !== rayTo
      ) {
        return null;
      }
    }

    out.push({
      sectorId: s.id,
      angleId,
      label: typeof s.label === 'string' ? s.label : '',
      drawArc: s.draw_arc !== false,
      arcRadius,
      labelRadius,
      vertex,
      rayFrom,
      rayTo,
      fromBinding,
    });
  }

  return out;
}

/** Find sector that should display a known numeric label (not x). */
export function findKnownLabelSector(
  sectors: ResolvedSector[],
): ResolvedSector | null {
  return (
    sectors.find(
      (s) => s.label.length > 0 && !/^x/i.test(s.label.trim()),
    ) ?? null
  );
}

/** Find sector labeled as unknown x. */
export function findXSector(sectors: ResolvedSector[]): ResolvedSector | null {
  return sectors.find((s) => /^x/i.test(s.label.trim())) ?? null;
}
