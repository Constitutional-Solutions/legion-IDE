import { Process, PLV_THRESHOLD } from "../src/scheduler/index";

const PHI = 1.61803398875;

describe("Love Theorem Scheduler", () => {
  describe("PLV_THRESHOLD", () => {
    it("is 0.618", () => {
      expect(PLV_THRESHOLD).toBe(0.618);
    });
  });

  describe("Process constructor", () => {
    it("stores phaseAngle and glyphs", () => {
      const p = new Process(Math.PI, [{ id: "G1", value: 1, freq: 432 }]);
      expect(p.phaseAngle).toBe(Math.PI);
      expect(p.glyphs).toHaveLength(1);
    });

    it("defaults to empty glyph array", () => {
      const p = new Process(0);
      expect(p.glyphs).toEqual([]);
    });

    it("throws for non-finite phaseAngle", () => {
      expect(() => new Process(NaN)).toThrow(RangeError);
      expect(() => new Process(Infinity)).toThrow(RangeError);
    });
  });

  describe("Process.checkCoherence()", () => {
    it("returns 1.0 when phases are identical (perfect alignment)", () => {
      const s = new Process(Math.PI / 4);
      const coherence = Process.checkCoherence(s, s);
      expect(coherence).toBeCloseTo(1.0);
    });

    it("returns 0.0 when phases are π radians apart (opposition)", () => {
      const s = new Process(0);
      const instr = new Process(Math.PI);
      const coherence = Process.checkCoherence(s, instr);
      expect(coherence).toBeCloseTo(0.0);
    });

    it("returns 0.5 when phases are π/2 apart (quadrature)", () => {
      const s = new Process(0);
      const instr = new Process(Math.PI / 2);
      const coherence = Process.checkCoherence(s, instr);
      expect(coherence).toBeCloseTo(0.5);
    });

    it("always returns a value in [0, 1]", () => {
      for (let i = 0; i <= 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const s = new Process(0);
        const instr = new Process(angle);
        const c = Process.checkCoherence(s, instr);
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
    });

    it("throws when entropy is 0 or negative", () => {
      const s = new Process(0);
      expect(() => Process.checkCoherence(s, s, 0)).toThrow(RangeError);
      expect(() => Process.checkCoherence(s, s, -1)).toThrow(RangeError);
    });

    it("coherence above PLV_THRESHOLD for near-aligned phases", () => {
      const s = new Process(0);
      const instr = new Process(0.1); // small angle difference
      const coherence = Process.checkCoherence(s, instr);
      expect(coherence).toBeGreaterThan(PLV_THRESHOLD);
    });

    it("coherence below PLV_THRESHOLD for near-opposed phases", () => {
      const s = new Process(0);
      const instr = new Process(Math.PI * 0.9);
      const coherence = Process.checkCoherence(s, instr);
      expect(coherence).toBeLessThan(PLV_THRESHOLD);
    });
  });

  describe("process.execute()", () => {
    it("invokes callback when coherence exceeds PLV_THRESHOLD", () => {
      const state = new Process(0);
      const instruction = new Process(0.1); // near-aligned
      let executed = false;
      const result = state.execute(instruction, () => { executed = true; });
      expect(result).toBe(true);
      expect(executed).toBe(true);
    });

    it("does NOT invoke callback when coherence is below PLV_THRESHOLD", () => {
      const state = new Process(0);
      const instruction = new Process(Math.PI); // fully opposed
      let executed = false;
      const result = state.execute(instruction, () => { executed = true; });
      expect(result).toBe(false);
      expect(executed).toBe(false);
    });
  });
});
