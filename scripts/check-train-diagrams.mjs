/**
 * Diagram coverage + fixture interpretability checks (no Jest).
 * Run: node scripts/check-train-diagrams.mjs
 *
 * Uses:
 * - scripts/diagram-coverage-inventory.json (counts only; no full bank dump)
 * - scripts/diagram-fixtures/*.json (representative payloads)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const fails = [];

function assert(cond, msg) {
  if (!cond) fails.push(msg);
}

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function finite(n) {
  return typeof n === 'number' && Number.isFinite(n);
}

const IMPLEMENTED = new Set([
  '2.0|array_model',
  '2.0|bar_model',
  '2.0|circle_model',
  '2.0|fraction_strip',
  '2.0|set_model',
  '2.0|shaded_rectangle',
  '2.0|number_line',
  '2.0|magnitude_bar',
  '2.0|pictorial_quantity',
  'area_diagram_v1|unit_square_grid',
  'area_diagram_v1|rectilinear_l_shape',
  'area_diagram_v1|multi_rectangle_composite',
  'area_diagram_v1|shaded_remaining_region',
  'area_diagram_v1|labelled_rectangle',
  'area_diagram_v1|labelled_square',
  'area_diagram_v1|labelled_triangle_base_height',
  'area_diagram_v1|triangle_on_unit_grid',
  'area_diagram_v1|outer_inner_nested_rectangles',
  'area_diagram_v1|rectangle_with_rectangular_cutout',
  'angles_diagram_v1|angles_missing_angle_semantic_a7',
]);

const inventoryPath = path.join(__dirname, 'diagram-coverage-inventory.json');
assert(fs.existsSync(inventoryPath), 'inventory file missing');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
assert(inventory.active_diagram_total === 611, `expected 611 active diagrams, got ${inventory.active_diagram_total}`);

let covered = 0;
for (const row of inventory.keys) {
  assert(!!row.schema_version, 'inventory row missing schema_version');
  assert(!!row.visual_type, 'inventory row missing visual_type');
  const key = `${row.schema_version}|${row.visual_type}`;
  const implemented = IMPLEMENTED.has(key);
  assert(implemented, `missing renderer mapping for ${key}`);
  if (implemented) covered += row.active_count;
}
assert(covered === 611, `dispatch coverage ${covered}/611`);

function isNumberStyleNumberLine(data) {
  return finite(Number(data.start)) && finite(Number(data.end)) && Number(data.start) !== Number(data.end);
}

function isFractionStyleNumberLine(data) {
  if (isNumberStyleNumberLine(data)) return false;
  return !!asRecord(data.operand_a);
}

function validateArea(data, label) {
  assert(data.schema_version === 'area_diagram_v1', `${label}: schema`);
  assert(typeof data.visual_type === 'string', `${label}: visual_type`);
  const figures = Array.isArray(data.figures) ? data.figures : [];
  const cutouts = Array.isArray(data.cutouts) ? data.cutouts : [];
  for (const f of figures) {
    const d = asRecord(f.display);
    if (!d) continue;
    if (Array.isArray(d.points)) {
      for (const p of d.points) {
        assert(finite(p.x) && finite(p.y), `${label}: triangle point finite`);
      }
    } else {
      assert(
        [d.x, d.y, d.w, d.h].every((n) => finite(Number(n))),
        `${label}: display rect finite`,
      );
    }
  }
  for (const c of cutouts) {
    const d = asRecord(c.display);
    assert(d, `${label}: cutout has display even if kind absent`);
    assert(
      [d.x, d.y, d.w, d.h].every((n) => finite(Number(n))),
      `${label}: cutout display finite`,
    );
    // kind may be absent — must not be required
  }
  if (data.grid) {
    const g = asRecord(data.grid);
    assert(g && finite(Number(g.rows)) && finite(Number(g.cols)), `${label}: grid rows/cols`);
  }
}

function validateAngles(data, label) {
  assert(data.schema_version === 'angles_diagram_v1', `${label}: schema`);
  const vertices = Array.isArray(data.vertices) ? data.vertices : [];
  const rays = Array.isArray(data.rays) ? data.rays : [];
  const sectors = Array.isArray(data.angle_sectors) ? data.angle_sectors : [];
  const byId = new Map(vertices.map((v) => [v.id, v]));
  for (const v of vertices) {
    assert(finite(v.x) && finite(v.y), `${label}: vertex finite ${v.id}`);
  }
  const rayById = new Map();
  for (const r of rays) {
    assert(byId.has(r.origin), `${label}: ray origin ${r.origin}`);
    assert(finite(r.angle_deg_display) && finite(r.length), `${label}: ray numeric ${r.id}`);
    rayById.set(r.id, r);
  }
  for (const s of sectors) {
    assert(byId.has(s.vertex), `${label}: sector vertex ${s.id}`);
    assert(rayById.has(s.ray_from) && rayById.has(s.ray_to), `${label}: sector rays ${s.id}`);
  }
  const bindings = asRecord(data.authoritative_sector_bindings) ?? {};
  for (const [angleId, b] of Object.entries(bindings)) {
    assert(byId.has(b.vertex), `${label}: binding vertex ${angleId}`);
    assert(rayById.has(b.ray_from) && rayById.has(b.ray_to), `${label}: binding rays ${angleId}`);
  }
  const lt = asRecord(data.layout_transform);
  if (lt) {
    assert(Array.isArray(lt.pivot) && lt.pivot.every(finite), `${label}: pivot`);
    assert(Array.isArray(lt.translate) && lt.translate.every(finite), `${label}: translate`);
    assert(finite(lt.scale), `${label}: scale`);
  }
}

function validateSchema2(data, label) {
  assert(data.schema_version === '2.0', `${label}: schema 2.0`);
  assert(typeof data.visual_type === 'string', `${label}: visual_type`);
  const vt = data.visual_type;
  if (vt === 'number_line') {
    const num = isNumberStyleNumberLine(data);
    const frac = isFractionStyleNumberLine(data);
    assert(num || frac, `${label}: number_line must be Number or Fraction shape`);
    assert(!(num && frac), `${label}: number_line cannot be both`);
    if (label.includes('fraction_number_line')) {
      assert(frac && !num, `${label}: routed to fraction renderer`);
    }
    if (label.includes('number_number_line')) {
      assert(num && !frac, `${label}: routed to number renderer`);
    }
  }
  if (vt === 'magnitude_bar') {
    assert(Array.isArray(data.values) && data.values.every((n) => finite(Number(n))), `${label}: values`);
    assert(Array.isArray(data.bar_lengths), `${label}: bar_lengths`);
  }
  if (vt === 'pictorial_quantity') {
    assert(Array.isArray(data.groups), `${label}: groups`);
  }
  if (vt === 'bar_model' && label.includes('foa_bar')) {
    assert(Array.isArray(data.foa_panels) || Array.isArray(data.stages), `${label}: FOA panels/stages`);
    assert(data.operand_a == null, `${label}: FOA without top-level operand_a`);
  }
  if (vt === 'set_model' || vt === 'array_model') {
    assert(finite(Number(data.groups_total)), `${label}: groups_total`);
  }
}

const fixtureDir = path.join(__dirname, 'diagram-fixtures');
const fixtures = fs.readdirSync(fixtureDir).filter((f) => f.endsWith('.json'));
assert(fixtures.length >= 20, `expected many fixtures, got ${fixtures.length}`);

const requiredVisuals = [
  'circle_model',
  'bar_model',
  'fraction_strip',
  'shaded_rectangle',
  'set_model',
  'array_model',
  'magnitude_bar',
  'pictorial_quantity',
  'unit_square_grid',
  'rectilinear_l_shape',
  'multi_rectangle_composite',
  'shaded_remaining_region',
  'labelled_rectangle',
  'labelled_square',
  'labelled_triangle_base_height',
  'triangle_on_unit_grid',
  'outer_inner_nested_rectangles',
  'rectangle_with_rectangular_cutout',
  'angles_missing_angle_semantic_a7',
];
const seenVt = new Set();

for (const file of fixtures) {
  const payload = JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
  const data = payload.diagram_data ?? payload;
  assert(typeof data.schema_version === 'string', `${file}: schema_version`);
  assert(typeof data.visual_type === 'string', `${file}: visual_type`);
  seenVt.add(data.visual_type);
  const key = `${data.schema_version}|${data.visual_type}`;
  assert(IMPLEMENTED.has(key), `${file}: unimplemented key ${key}`);

  if (data.schema_version === 'area_diagram_v1') validateArea(data, file);
  else if (data.schema_version === 'angles_diagram_v1') validateAngles(data, file);
  else if (data.schema_version === '2.0') validateSchema2(data, file);
}

for (const vt of requiredVisuals) {
  assert(seenVt.has(vt), `missing representative fixture for ${vt}`);
}
assert(
  fixtures.some((f) => f.includes('fraction_number_line')),
  'missing fraction number_line fixture',
);
assert(
  fixtures.some((f) => f.includes('number_number_line')),
  'missing number number_line fixture',
);
assert(fixtures.some((f) => f.includes('foa_bar')), 'missing FOA bar fixture');
assert(fixtures.some((f) => f.includes('cutout_no_kind')), 'missing cutout-no-kind fixture');

// ---------------------------------------------------------------------------
// Targeted semantic checks (Area unit_square_grid + Angles bindings)
// ---------------------------------------------------------------------------

/** Mirrors src/components/train/diagrams/area/unitSquareShading.ts */
function resolveUnitSquareShading(gridRaw) {
  const grid = asRecord(gridRaw);
  if (!grid) return null;
  const rows = Number(grid.rows);
  const cols = Number(grid.cols);
  const cellPx = Number(grid.cell_px) || 24;
  if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows <= 0 || cols <= 0) return null;
  const tones = new Map();
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) tones.set(`${r},${c}`, 'unshaded');
  }
  const occupiedRaw = Array.isArray(grid.occupied_cells) ? grid.occupied_cells : null;
  const regionA = Array.isArray(grid.region_a) ? grid.region_a : null;
  if (occupiedRaw && occupiedRaw.length > 0) {
    let occupiedCount = 0;
    for (const pair of occupiedRaw) {
      if (!Array.isArray(pair) || pair.length < 2) return null;
      const r = Math.trunc(pair[0]);
      const c = Math.trunc(pair[1]);
      if (!Number.isFinite(r) || !Number.isFinite(c) || r < 0 || c < 0) return null;
      if (r >= rows || c >= cols) return null;
      const key = `${r},${c}`;
      if (
        regionA &&
        Number.isFinite(regionA[0]) &&
        Number.isFinite(regionA[1]) &&
        r < regionA[0] &&
        c < regionA[1]
      ) {
        tones.set(key, 'region_a');
      } else if (regionA) {
        tones.set(key, 'region_b');
      } else {
        tones.set(key, 'shaded');
      }
      occupiedCount += 1;
    }
    return { rows, cols, cellPx, tones, occupiedCount };
  }
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) tones.set(`${r},${c}`, 'shaded');
  }
  return { rows, cols, cellPx, tones, occupiedCount: rows * cols };
}

/** Mirrors src/components/train/diagrams/angles/sectorBindings.ts */
function resolveSectorsWithBindings(data) {
  if (!Array.isArray(data.angle_sectors)) return null;
  const bindings = asRecord(data.authoritative_sector_bindings);
  const out = [];
  for (const raw of data.angle_sectors) {
    const s = asRecord(raw);
    if (!s || typeof s.id !== 'string') return null;
    const angleId = typeof s.angle_id === 'string' ? s.angle_id : s.id;
    if (!finite(s.arc_radius)) return null;
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
      if (!b) return null;
      if (
        typeof b.vertex !== 'string' ||
        typeof b.ray_from !== 'string' ||
        typeof b.ray_to !== 'string'
      ) {
        return null;
      }
      vertex = b.vertex;
      rayFrom = b.ray_from;
      rayTo = b.ray_to;
      fromBinding = true;
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
      arcRadius: s.arc_radius,
      labelRadius: s.label_radius ?? s.arc_radius,
      vertex,
      rayFrom,
      rayTo,
      fromBinding,
    });
  }
  return out;
}

// Area: observed stem payload (52083) must shade exactly occupied_cells
{
  const file = 'area_unit_square_grid_occupied_52083.json';
  const payload = JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
  const data = payload.diagram_data;
  const shading = resolveUnitSquareShading(data.grid);
  assert(!!shading, '52083 shading resolves');
  const expected = data.grid.occupied_cells.map(([r, c]) => `${r},${c}`).sort();
  const actual = [...shading.tones.entries()]
    .filter(([, t]) => t !== 'unshaded')
    .map(([k]) => k)
    .sort();
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `52083 shaded cells mismatch expected=${expected.join('|')} actual=${actual.join('|')}`,
  );
  assert(shading.occupiedCount === 7, '52083 occupiedCount 7');
  assert(shading.tones.get('0,0') === 'shaded', '52083 cell 0,0 shaded');
  assert(shading.tones.get('1,0') === 'unshaded', '52083 cell 1,0 unshaded (not occupied)');
}

// Area: full-rectangle grid (no occupied_cells) shades all cells
{
  const file = 'area_unit_square_grid_52069.json';
  const payload = JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
  const shading = resolveUnitSquareShading(payload.diagram_data.grid);
  assert(!!shading, '52069 shading resolves');
  assert(shading.occupiedCount === 7 * 4, '52069 full grid shaded count');
  assert(
    [...shading.tones.values()].every((t) => t === 'shaded'),
    '52069 every cell shaded',
  );
}

// Area: dual region tones
{
  const file = 'area_unit_square_grid_regions_52226.json';
  const payload = JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
  const shading = resolveUnitSquareShading(payload.diagram_data.grid);
  assert(!!shading, '52226 shading resolves');
  assert(shading.tones.get('0,0') === 'region_a', '52226 (0,0) region_a');
  const hasB = [...shading.tones.values()].includes('region_b');
  assert(hasB, '52226 has region_b cells');
}

// Area: malformed OOB fails closed
{
  const file = 'area_unit_square_grid_malformed_oob.json';
  const payload = JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
  const shading = resolveUnitSquareShading(payload.diagram_data.grid);
  assert(shading == null, 'malformed OOB unit grid fails closed');
}

// Source uses occupied_cells resolver
{
  const areaSrc = fs.readFileSync(
    path.join(root, 'src/components/train/diagrams/area/AreaDiagramV1.tsx'),
    'utf8',
  );
  assert(areaSrc.includes('resolveUnitSquareShading'), 'AreaDiagramV1 uses unit square shading resolver');
  assert(areaSrc.includes('unitSquareShading'), 'AreaDiagramV1 imports unitSquareShading');
}

// Angles: known + x bind to authoritative sectors
function assertAngleBindingFixture(file, knownNeedle, expectedKnownRays, expectedXRays) {
  const payload = JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
  const data = payload.diagram_data;
  const sectors = resolveSectorsWithBindings(data);
  assert(!!sectors, `${file}: sectors resolve via bindings`);
  assert(sectors.every((s) => s.fromBinding), `${file}: all sectors from bindings`);
  const known = sectors.find((s) => s.label.includes(knownNeedle));
  const xSec = sectors.find((s) => /^x/i.test(s.label.trim()));
  assert(!!known, `${file}: known label sector`);
  assert(!!xSec, `${file}: x sector`);
  assert(
    known.rayFrom === expectedKnownRays[0] && known.rayTo === expectedKnownRays[1],
    `${file}: known rays ${known.rayFrom}->${known.rayTo}`,
  );
  assert(
    xSec.rayFrom === expectedXRays[0] && xSec.rayTo === expectedXRays[1],
    `${file}: x rays ${xSec.rayFrom}->${xSec.rayTo}`,
  );
  const bindKnown = data.authoritative_sector_bindings[known.angleId];
  const bindX = data.authoritative_sector_bindings[xSec.angleId];
  assert(bindKnown.ray_from === known.rayFrom && bindKnown.ray_to === known.rayTo, `${file}: known binding honored`);
  assert(bindX.ray_from === xSec.rayFrom && bindX.ray_to === xSec.rayTo, `${file}: x binding honored`);
}

assertAngleBindingFixture(
  'angles_vertical_opposite_53928.json',
  '140',
  ['r0', 'r1'],
  ['r2', 'r3'],
);
assertAngleBindingFixture(
  'angles_right_angle_split_53892.json',
  '68',
  ['rH', 'rC'],
  ['rC', 'rV'],
);
assertAngleBindingFixture(
  'angles_straight_129_53933.json',
  '129',
  ['rR', 'rM'],
  ['rM', 'rL'],
);
assertAngleBindingFixture(
  'angles_straight_69_53950.json',
  '69',
  ['rR', 'rM'],
  ['rM', 'rL'],
);

// Right-angle marker rays resolve
{
  const payload = JSON.parse(
    fs.readFileSync(path.join(fixtureDir, 'angles_right_angle_split_53892.json'), 'utf8'),
  );
  const data = payload.diagram_data;
  const ram = data.right_angle_markers[0];
  const rayIds = new Set(data.rays.map((r) => r.id));
  assert(rayIds.has(ram.ray_a) && rayIds.has(ram.ray_b), 'right-angle marker rays resolve');
  assert(ram.vertex === 'O', 'right-angle marker at O');
}

// Broken binding mismatch fails closed
{
  const payload = JSON.parse(
    fs.readFileSync(path.join(fixtureDir, 'angles_malformed_binding_mismatch.json'), 'utf8'),
  );
  const sectors = resolveSectorsWithBindings(payload.diagram_data);
  assert(sectors == null, 'binding mismatch fails closed');
}

// ---------------------------------------------------------------------------
// Annotation collision layout (mirrors annotationLayout.ts via scripts/lib)
// ---------------------------------------------------------------------------
const {
  layoutAngleAnnotations,
  boxesOverlap,
  normalizeSweep,
  angleInsideSector,
} = await import('./lib/angleAnnotationLayout.mjs');

function applyLayoutTransform(x, y, t) {
  const [px, py] = t.pivot;
  const [tx, ty] = t.translate;
  const rad = ((t.rotation_deg || 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = x - px;
  const dy = y - py;
  return {
    x: px + t.scale * (dx * cos - dy * sin) + tx,
    y: py + t.scale * (dx * sin + dy * cos) + ty,
  };
}

function buildLayoutInputFromFixture(file) {
  const payload = JSON.parse(fs.readFileSync(path.join(fixtureDir, file), 'utf8'));
  const data = payload.diagram_data;
  const sectors = resolveSectorsWithBindings(data);
  assert(!!sectors, `${file}: sectors for layout`);
  const lt = data.layout_transform;
  const vertexMap = new Map(
    data.vertices.map((v) => {
      const p = applyLayoutTransform(v.x, v.y, lt);
      return [v.id, { ...v, x: p.x, y: p.y }];
    }),
  );
  const rayMap = new Map(data.rays.map((r) => [r.id, r]));
  const sectorGeoms = sectors
    .filter((s) => s.label)
    .map((s) => {
      const v = vertexMap.get(s.vertex);
      const rf = rayMap.get(s.rayFrom);
      const rt = rayMap.get(s.rayTo);
      assert(!!v && !!rf && !!rt, `${file}: sector geom ${s.sectorId}`);
      return {
        sectorId: s.sectorId,
        angleId: s.angleId,
        label: s.label,
        vertexId: s.vertex,
        vx: v.x,
        vy: v.y,
        a0: rf.angle_deg_display,
        sweep: normalizeSweep(rf.angle_deg_display, rt.angle_deg_display),
        arcRadius: s.arcRadius,
        labelRadius: s.labelRadius,
      };
    });

  const rightAngles = [];
  for (let i = 0; i < (data.right_angle_markers || []).length; i += 1) {
    const m = data.right_angle_markers[i];
    const vertex = vertexMap.get(m.vertex);
    const rayFrom = rayMap.get(m.ray_a || m.ray_from);
    const rayTo = rayMap.get(m.ray_b || m.ray_to);
    assert(!!vertex && !!rayFrom && !!rayTo, `${file}: right angle ${i}`);
    const size = m.size || 20;
    const DEG = Math.PI / 180;
    const p1 = {
      x: vertex.x + size * Math.cos(rayFrom.angle_deg_display * DEG),
      y: vertex.y - size * Math.sin(rayFrom.angle_deg_display * DEG),
    };
    const p2 = {
      x: p1.x + size * Math.cos(rayTo.angle_deg_display * DEG),
      y: p1.y - size * Math.sin(rayTo.angle_deg_display * DEG),
    };
    const p3 = {
      x: vertex.x + size * Math.cos(rayTo.angle_deg_display * DEG),
      y: vertex.y - size * Math.sin(rayTo.angle_deg_display * DEG),
    };
    rightAngles.push({
      id: `ra-${i}`,
      p1,
      p2,
      p3,
      vertex: { x: vertex.x, y: vertex.y },
    });
  }

  const pointIds = Array.isArray(data.required_point_labels)
    ? data.required_point_labels
    : data.vertices.map((v) => v.id);
  const raysByOrigin = new Map();
  for (const r of data.rays) {
    const list = raysByOrigin.get(r.origin) || [];
    list.push(r.angle_deg_display);
    raysByOrigin.set(r.origin, list);
  }
  const points = pointIds
    .map((id) => {
      const v = vertexMap.get(id);
      if (!v) return null;
      const text = v.pupil_label || id;
      return {
        id,
        text,
        vx: v.x,
        vy: v.y,
        preferredOx: (v.label_offset?.[0] ?? 10) * Math.max(1, lt.scale || 1),
        preferredOy: (v.label_offset?.[1] ?? -12) * Math.max(1, lt.scale || 1),
        rayAnglesDeg: raysByOrigin.get(id) || [],
        isCentralO: text === 'O' || id === 'O',
      };
    })
    .filter(Boolean);

  const font = 14;
  const layout = layoutAngleAnnotations({
    sectors: sectorGeoms,
    points,
    rightAngles,
    angleFont: font,
    pointFont: font * 0.9,
  });
  return { data, sectors, sectorGeoms, layout, rightAngles };
}

function assertNoAngleOverlaps(file, layout) {
  for (let i = 0; i < layout.angleLabels.length; i += 1) {
    for (let j = i + 1; j < layout.angleLabels.length; j += 1) {
      assert(
        !boxesOverlap(layout.angleLabels[i].box, layout.angleLabels[j].box, 1),
        `${file}: angle labels overlap ${layout.angleLabels[i].text} vs ${layout.angleLabels[j].text}`,
      );
    }
  }
}

function assertLabelsInsideSectors(file, sectorGeoms, layout) {
  for (const al of layout.angleLabels) {
    const g = sectorGeoms.find((s) => s.sectorId === al.sectorId);
    assert(!!g, `${file}: layout sector ${al.sectorId}`);
    assert(
      angleInsideSector(al.placeAngleDeg, g.a0, g.sweep),
      `${file}: ${al.text} left its sector`,
    );
  }
}

const layoutFixtures = [
  'angles_vertical_opposite_53928.json',
  'angles_straight_93_53897.json',
  'angles_straight_129_53933.json',
  'angles_right_angle_split_53892.json',
  'angles_right_14_53915.json',
  'angles_triangle_35_40_53943.json',
  'angles_triangle_110_40_53967.json',
  'angles_quad_50_53888.json',
  'angles_around_80_53881.json',
  'angles_around_130_53893.json',
];

for (const file of layoutFixtures) {
  assert(fs.existsSync(path.join(fixtureDir, file)), `layout fixture missing ${file}`);
  const { sectors, sectorGeoms, layout, rightAngles } = buildLayoutInputFromFixture(file);
  assertLabelsInsideSectors(file, sectorGeoms, layout);
  assertNoAngleOverlaps(file, layout);

  const known = layout.angleLabels.find((l) => l.text && !/^x/i.test(l.text.trim()));
  const xLab = layout.angleLabels.find((l) => /^x/i.test(l.text.trim()));
  if (known && xLab) {
    assert(!boxesOverlap(known.box, xLab.box, 1), `${file}: known/x overlap`);
    // Binding association preserved: labels map to expected sector ids from resolver
    const knownSec = sectors.find((s) => s.sectorId === known.sectorId);
    const xSec = sectors.find((s) => s.sectorId === xLab.sectorId);
    assert(!!knownSec && !!xSec, `${file}: known/x sector ids`);
    assert(knownSec.angleId !== xSec.angleId, `${file}: known/x distinct angle ids`);
  }

  // Right-angle square vs primary labels
  if (rightAngles.length && known && xLab) {
    const raObs = layout.obstacles.find((o) => o.kind === 'right_angle');
    assert(!!raObs, `${file}: right-angle obstacle present`);
    assert(!boxesOverlap(known.box, raObs, 0.5), `${file}: known overlaps right-angle square`);
    assert(!boxesOverlap(xLab.box, raObs, 0.5), `${file}: x overlaps right-angle square`);
  }

  // Central O vs primary angle labels
  const oLab = layout.pointLabels.find((p) => p.text === 'O' || p.id === 'O');
  if (oLab && known) {
    assert(!boxesOverlap(oLab.box, known.box, 0.5), `${file}: O overlaps known`);
  }
  if (oLab && xLab) {
    assert(!boxesOverlap(oLab.box, xLab.box, 0.5), `${file}: O overlaps x`);
  }

  // Triangle/quad: point labels vs degree labels at same vertex neighbourhood
  if (file.includes('triangle') || file.includes('quad')) {
    for (const pl of layout.pointLabels) {
      for (const al of layout.angleLabels) {
        assert(
          !boxesOverlap(pl.box, al.box, 0.5),
          `${file}: point ${pl.text} overlaps ${al.text}`,
        );
      }
    }
  }
}

// Source uses annotation layout helper
{
  const angSrc = fs.readFileSync(
    path.join(root, 'src/components/train/diagrams/angles/AnglesDiagramV1.tsx'),
    'utf8',
  );
  assert(angSrc.includes('layoutAngleAnnotations'), 'Angles uses annotation layout');
  assert(
    fs.existsSync(path.join(root, 'src/components/train/diagrams/angles/annotationLayout.ts')),
    'annotationLayout.ts exists',
  );
}

// Angles source uses binding resolver + readable font scaling
{
  const angSrc = fs.readFileSync(
    path.join(root, 'src/components/train/diagrams/angles/AnglesDiagramV1.tsx'),
    'utf8',
  );
  assert(angSrc.includes('resolveSectorsWithBindings'), 'Angles uses binding resolver');
  assert(angSrc.includes('TARGET_LABEL_PX'), 'Angles scales label font to screen px');
}

// Source-level: TrainQuestionDiagram must use dispatcher, not only number_line
const diagramEntry = path.join(root, 'src/components/train/TrainQuestionDiagram.tsx');
const src = fs.readFileSync(diagramEntry, 'utf8');
assert(src.includes('DiagramDispatcher') || src.includes('diagrams/'), 'TrainQuestionDiagram wires dispatcher');

const registrySrc = fs.readFileSync(
  path.join(root, 'src/components/train/diagrams/registry.ts'),
  'utf8',
);
assert(registrySrc.includes('IMPLEMENTED_DIAGRAM_KEYS'), 'registry exports keys');

// Duplicate answer batch removed
const indexSrc = fs.readFileSync(
  path.join(root, 'app/train/[subject]/[topic]/index.tsx'),
  'utf8',
);
assert(indexSrc.includes('await queue.drain()'), 'drain before complete retained');
assert(
  !/for\s*\(.*answers\.length[\s\S]*enqueue/.test(indexSrc),
  'blind final re-enqueue loop must be removed',
);

if (fails.length) {
  console.error('check-train-diagrams: FAIL');
  for (const f of fails) console.error(' -', f);
  process.exit(1);
}
console.log(`check-train-diagrams: PASS (${covered}/611 dispatch keys covered, ${fixtures.length} fixtures)`);
