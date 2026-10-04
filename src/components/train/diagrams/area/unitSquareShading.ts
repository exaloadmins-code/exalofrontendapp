/**
 * Pure helpers for area_diagram_v1 unit_square_grid shading.
 * Authoritative field: grid.occupied_cells as [row, col] pairs.
 * Optional region_a / region_b: [rows, cols] top-left blocks for dual shading.
 * When occupied_cells is absent: entire rows×cols rectangle is the shaded shape.
 */

import { asPositiveInt, asRecord } from '../guards';

export type CellTone = 'unshaded' | 'shaded' | 'region_a' | 'region_b';

export type UnitSquareShading = {
  rows: number;
  cols: number;
  cellPx: number;
  /** key = `${row},${col}` */
  tones: Map<string, CellTone>;
  occupiedCount: number;
};

function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

function parseCellPair(raw: unknown): { row: number; col: number } | null {
  if (!Array.isArray(raw) || raw.length < 2) return null;
  // occupied_cells are 0-based [row, col].
  const r =
    typeof raw[0] === 'number' && Number.isFinite(raw[0])
      ? Math.trunc(raw[0])
      : null;
  const c =
    typeof raw[1] === 'number' && Number.isFinite(raw[1])
      ? Math.trunc(raw[1])
      : null;
  if (r == null || c == null || r < 0 || c < 0) return null;
  return { row: r, col: c };
}

function parseRegionDims(raw: unknown): { rows: number; cols: number } | null {
  if (!Array.isArray(raw) || raw.length < 2) return null;
  const rows = asPositiveInt(raw[0]);
  const cols = asPositiveInt(raw[1]);
  if (rows == null || cols == null) return null;
  return { rows, cols };
}

/**
 * Resolve which cells must be shaded from authoritative grid payload.
 * Returns null if grid geometry is unusable.
 */
export function resolveUnitSquareShading(
  gridRaw: unknown,
): UnitSquareShading | null {
  const grid = asRecord(gridRaw);
  if (!grid) return null;
  const rows = asPositiveInt(grid.rows);
  const cols = asPositiveInt(grid.cols);
  const cellPx = asPositiveInt(grid.cell_px) ?? 24;
  if (rows == null || cols == null) return null;

  const tones = new Map<string, CellTone>();
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      tones.set(cellKey(r, c), 'unshaded');
    }
  }

  const occupiedRaw = Array.isArray(grid.occupied_cells)
    ? grid.occupied_cells
    : null;
  const regionA = parseRegionDims(grid.region_a);
  const regionB = parseRegionDims(grid.region_b);

  if (occupiedRaw && occupiedRaw.length > 0) {
    let occupiedCount = 0;
    for (const pair of occupiedRaw) {
      const cell = parseCellPair(pair);
      if (!cell) return null; // malformed cell — fail closed
      if (cell.row >= rows || cell.col >= cols) return null;
      const key = cellKey(cell.row, cell.col);
      if (regionA && cell.row < regionA.rows && cell.col < regionA.cols) {
        tones.set(key, 'region_a');
      } else if (regionA && regionB) {
        // Remaining occupied cells belong to region B (or further regions).
        tones.set(key, 'region_b');
      } else {
        tones.set(key, 'shaded');
      }
      occupiedCount += 1;
    }
    return { rows, cols, cellPx, tones, occupiedCount };
  }

  // No occupied_cells: authoritative full-rectangle grid region (rows×cols).
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      tones.set(cellKey(r, c), 'shaded');
    }
  }
  return { rows, cols, cellPx, tones, occupiedCount: rows * cols };
}

export function cellToneAt(
  shading: UnitSquareShading,
  row: number,
  col: number,
): CellTone {
  return shading.tones.get(cellKey(row, col)) ?? 'unshaded';
}
