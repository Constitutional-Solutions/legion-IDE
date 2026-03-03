import { encode, encodeGlyphs } from "../src/radix-core/index";

const PHI = 1.61803398875;
const BASE_UNIT = 144000;
const MAJOR_DIVISOR = 360;

describe("Radix-Core encoder", () => {
  describe("encode()", () => {
    it("returns a string starting with 'FSOU.'", () => {
      expect(encode(0).startsWith("FSOU.")).toBe(true);
    });

    it("returns two-level hierarchical address (FSOU.<major>.<minor>)", () => {
      const parts = encode(100).split(".");
      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe("FSOU");
    });

    it("encodes 0 as FSOU.0.0", () => {
      expect(encode(0)).toBe("FSOU.0.0");
    });

    it("produces consistent output for the same input", () => {
      expect(encode(12345)).toBe(encode(12345));
    });

    it("applies (value * PHI) % 144000 formula correctly", () => {
      const value = 1000;
      const coordinate = (value * PHI) % BASE_UNIT;
      const major = Math.floor(coordinate / MAJOR_DIVISOR);
      const minor = Math.floor(coordinate % MAJOR_DIVISOR);
      const expected = `FSOU.${major.toString(36).toUpperCase()}.${minor.toString(36).toUpperCase()}`;
      expect(encode(value)).toBe(expected);
    });

    it("keeps coordinate within [0, 144000)", () => {
      // For any value, the FSOU parts must decode to a coordinate in [0, 144000)
      for (const v of [1, 432, 144000, 1_000_000]) {
        const parts = encode(v).split(".");
        const major = parseInt(parts[1], 36);
        const minor = parseInt(parts[2], 36);
        const coord = major * MAJOR_DIVISOR + minor;
        expect(coord).toBeGreaterThanOrEqual(0);
        expect(coord).toBeLessThan(BASE_UNIT);
      }
    });

    it("throws RangeError for negative values", () => {
      expect(() => encode(-1)).toThrow(RangeError);
    });

    it("throws RangeError for non-finite values", () => {
      expect(() => encode(Infinity)).toThrow(RangeError);
      expect(() => encode(NaN)).toThrow(RangeError);
    });
  });

  describe("encodeGlyphs()", () => {
    it("returns FSOU.0.0 for empty glyph array", () => {
      expect(encodeGlyphs([])).toBe("FSOU.0.0");
    });

    it("computes resonance as sum(value * freq) before encoding", () => {
      const glyphs = [
        { value: 1, freq: 432 },
        { value: 8, freq: 528 },
      ];
      const resonance = 1 * 432 + 8 * 528;
      expect(encodeGlyphs(glyphs)).toBe(encode(resonance));
    });
  });
});
