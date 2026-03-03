import { describe, expect, it } from "vitest";
import { getResonantProfile, tokenize } from "../src/philang/lexer";

describe("tokenize", () => {
  it("tokenizes known glyphs in order", () => {
    const tokens = tokenize("G1 G8\nG15");
    expect(tokens.map((t) => t.id)).toEqual(["G1", "G8", "G15"]);
  });

  it("throws on unknown glyphs", () => {
    expect(() => tokenize("G1 G999")).toThrow(/unknown glyph/i);
  });
});

describe("getResonantProfile", () => {
  it("sums resonant frequency (f) and semantic sum (V)", () => {
    const { f, V } = getResonantProfile("G1, G8 G15");
    expect(f).toBeCloseTo(1599);
    expect(V).toBe(24);
  });

  it("ignores variable frequency while keeping semantic weight", () => {
    const { f, V } = getResonantProfile("G1 G81567 G8");
    expect(f).toBeCloseTo(960);
    expect(V).toBe(81576);
  });

  it("handles phi-based glyphs with fractional frequencies", () => {
    const { f, V } = getResonantProfile("G1618");
    expect(f).toBeCloseTo(1.61803398875);
    expect(V).toBe(1618);
  });
});
