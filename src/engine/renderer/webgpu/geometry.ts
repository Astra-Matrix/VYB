/** Unit cube centered at origin, 24 vertices (face normals), 36 indices. */
export const UNIT_CUBE_VERTICES = new Float32Array([
  // +X
  0.5, -0.5, -0.5, 1, 0, 0, 0.5, 0.5, -0.5, 1, 0, 0, 0.5, 0.5, 0.5, 1, 0, 0, 0.5, -0.5, 0.5, 1, 0, 0,
  // -X
  -0.5, -0.5, 0.5, -1, 0, 0, -0.5, 0.5, 0.5, -1, 0, 0, -0.5, 0.5, -0.5, -1, 0, 0, -0.5, -0.5, -0.5, -1, 0, 0,
  // +Y
  -0.5, 0.5, -0.5, 0, 1, 0, -0.5, 0.5, 0.5, 0, 1, 0, 0.5, 0.5, 0.5, 0, 1, 0, 0.5, 0.5, -0.5, 0, 1, 0,
  // -Y
  -0.5, -0.5, 0.5, 0, -1, 0, -0.5, -0.5, -0.5, 0, -1, 0, 0.5, -0.5, -0.5, 0, -1, 0, 0.5, -0.5, 0.5, 0, -1, 0,
  // +Z
  -0.5, -0.5, 0.5, 0, 0, 1, 0.5, -0.5, 0.5, 0, 0, 1, 0.5, 0.5, 0.5, 0, 0, 1, -0.5, 0.5, 0.5, 0, 0, 1,
  // -Z
  0.5, -0.5, -0.5, 0, 0, -1, -0.5, -0.5, -0.5, 0, 0, -1, -0.5, 0.5, -0.5, 0, 0, -1, 0.5, 0.5, -0.5, 0, 0, -1,
]);

export const UNIT_CUBE_INDICES = new Uint16Array([
  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22,
  20, 22, 23,
]);

/** XZ ground grid lines (y = 0). */
export function buildGridLineVertices(halfExtent: number, spacing: number): Float32Array {
  const lines: number[] = [];
  for (let i = -halfExtent; i <= halfExtent; i += spacing) {
    lines.push(-halfExtent, 0, i, halfExtent, 0, i);
    lines.push(i, 0, -halfExtent, i, 0, halfExtent);
  }
  return new Float32Array(lines);
}
