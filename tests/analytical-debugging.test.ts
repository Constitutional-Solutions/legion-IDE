import {
  analyzeHydraulicFlow,
  cartographSemanticBasins,
  verifyElectroHarmonicWaveform,
} from "../src/phase1/analytical-debugging";

describe("Phase 1 analytical semantic debugging", () => {
  describe("cartographSemanticBasins()", () => {
    it("groups states into shared semantic basins and exposes nested sub-states", () => {
      const basins = cartographSemanticBasins([
        {
          id: "tensor-a",
          glyphs: [
            { id: "G15", value: 15, freq: 639 },
            { id: "G15", value: 15, freq: 639 },
            { id: "G1", value: 1, freq: 432 },
          ],
        },
        {
          id: "tensor-b",
          glyphs: [
            { id: "G15", value: 15, freq: 639 },
            { id: "G15", value: 15, freq: 639 },
            { id: "G1", value: 1, freq: 432 },
          ],
        },
      ]);

      expect(basins).toHaveLength(1);
      expect(basins[0].subStates.map((s) => s.id)).toEqual(["tensor-a", "tensor-b"]);
      expect(basins[0].fractured).toBe(false);
    });

    it("marks a basin as fractured when coherence falls below threshold", () => {
      const basins = cartographSemanticBasins([
        {
          id: "noisy-loop",
          glyphs: [{ id: "G1", value: 1, freq: 432 }],
        },
      ]);

      expect(basins[0].fractured).toBe(true);
    });
  });

  describe("analyzeHydraulicFlow()", () => {
    it("flags high-pressure latency zones as turbulence", () => {
      const report = analyzeHydraulicFlow([
        { gate: "parse", latencyMs: 10 },
        { gate: "encode", latencyMs: 10 },
        { gate: "render", latencyMs: 30 },
      ]);

      expect(report.turbulentZones.map((z) => z.gate)).toEqual(["render"]);
    });
  });

  describe("verifyElectroHarmonicWaveform()", () => {
    it("passes near-432Hz channels as resonant", () => {
      const report = verifyElectroHarmonicWaveform([431.5, 432, 432.4]);
      expect(report.thermalNoise).toBe(false);
      expect(report.resonant).toBe(true);
    });

    it("flags thermal noise for channels above harmonic threshold", () => {
      const report = verifyElectroHarmonicWaveform([432, 800]);
      expect(report.thermalNoise).toBe(true);
      expect(report.resonant).toBe(false);
    });
  });
});
