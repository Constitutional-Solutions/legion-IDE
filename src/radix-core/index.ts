/**
 * Radix-Core — Base-144,000 FSOU semantic address encoder.
 *
 * Implements the Semantic Basin Algorithm from section 4.2 of the LEGION spec.
 * Standard integers are mapped into a two-level hierarchical FSOU address via:
 *
 *   coordinate = (value × φ) mod 144,000
 *
 * where φ = 1.61803398875 (the Golden Ratio).
 *
 * The coordinate is then decomposed into a two-level hierarchy so the address
 * reads as "FSOU.<major>.<minor>" using base-36 encoding for each level.
 *
 * Decomposition split: 144,000 = 400 × 360
 *   major = floor(coordinate / 360)   [0 … 399] → up to 3 base-36 chars
 *   minor = coordinate mod 360        [0 … 359] → up to 2 base-36 chars
 */

const PHI = 1.61803398875;
const BASE_UNIT = 144000;
const MAJOR_DIVISOR = 360;

/**
 * Encode a non-negative integer as an FSOU semantic address.
 *
 * @param value - Source integer (must be ≥ 0).
 * @returns Hierarchical FSOU address string, e.g. "FSOU.A1.B2".
 */
export function encode(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`encode: value must be a non-negative finite number (got ${value})`);
  }

  const coordinate = (value * PHI) % BASE_UNIT;
  const major = Math.floor(coordinate / MAJOR_DIVISOR);
  const minor = Math.floor(coordinate % MAJOR_DIVISOR);

  return `FSOU.${major.toString(36).toUpperCase()}.${minor.toString(36).toUpperCase()}`;
}

/**
 * Encode a resonance value derived from a glyph sequence.
 *
 * Given an array of glyphs (objects with `value` and `freq` properties), the
 * resonance is computed as Σ(glyph.value × glyph.freq), then encoded with
 * `encode()`.
 *
 * @param glyphs - Array of objects with numeric `value` and `freq` fields.
 * @returns Hierarchical FSOU address string.
 */
export function encodeGlyphs(glyphs: Array<{ value: number; freq: number }>): string {
  const resonance = glyphs.reduce((sum, g) => sum + g.value * g.freq, 0);
  return encode(resonance);
}
