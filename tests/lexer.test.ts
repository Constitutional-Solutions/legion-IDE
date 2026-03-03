import { tokenize, getResonantProfile, GLYPHS } from "../src/philang/lexer";

describe("Philang Lexer", () => {
  describe("GLYPHS table", () => {
    it("contains exactly 10 canonical glyphs", () => {
      expect(GLYPHS).toHaveLength(10);
    });

    it("has G0 with value 0 and freq 0", () => {
      const g = GLYPHS.find((g) => g.id === "G0");
      expect(g).toBeDefined();
      expect(g!.value).toBe(0);
      expect(g!.freq).toBe(0);
    });

    it("has G1 (Unity) at 432 Hz", () => {
      const g = GLYPHS.find((g) => g.id === "G1");
      expect(g!.freq).toBe(432);
    });

    it("has G144 (Completion) at 963 Hz", () => {
      const g = GLYPHS.find((g) => g.id === "G144");
      expect(g!.freq).toBe(963);
    });
  });

  describe("tokenize()", () => {
    it("returns empty array for empty string", () => {
      expect(tokenize("")).toHaveLength(0);
    });

    it("tokenizes a single glyph", () => {
      const tokens = tokenize("G1");
      expect(tokens).toHaveLength(1);
      expect(tokens[0].id).toBe("G1");
      expect(tokens[0].value).toBe(1);
      expect(tokens[0].freq).toBe(432);
      expect(tokens[0].position).toBe(0);
    });

    it("tokenizes multiple glyphs separated by whitespace", () => {
      const tokens = tokenize("G1 G15 G81");
      expect(tokens).toHaveLength(3);
      expect(tokens.map((t) => t.id)).toEqual(["G1", "G15", "G81"]);
    });

    it("is case-insensitive", () => {
      const tokens = tokenize("g1 g15");
      expect(tokens).toHaveLength(2);
      expect(tokens[0].id).toBe("G1");
    });

    it("skips unrecognised tokens", () => {
      const tokens = tokenize("G1 UNKNOWN G8");
      expect(tokens).toHaveLength(2);
      expect(tokens.map((t) => t.id)).toEqual(["G1", "G8"]);
    });

    it("assigns correct position indices", () => {
      const tokens = tokenize("G0 G1 G8");
      expect(tokens[0].position).toBe(0);
      expect(tokens[1].position).toBe(1);
      expect(tokens[2].position).toBe(2);
    });
  });

  describe("getResonantProfile()", () => {
    it("returns zero profile for empty token array", () => {
      const profile = getResonantProfile([]);
      expect(profile.totalFrequency).toBe(0);
      expect(profile.semanticSum).toBe(0);
    });

    it("sums frequencies and values correctly", () => {
      const tokens = tokenize("G1 G8");
      const profile = getResonantProfile(tokens);
      // G1: freq=432, value=1; G8: freq=528, value=8
      expect(profile.totalFrequency).toBe(432 + 528);
      expect(profile.semanticSum).toBe(1 + 8);
    });

    it("G144 contributes 963 Hz to totalFrequency", () => {
      const tokens = tokenize("G144");
      const profile = getResonantProfile(tokens);
      expect(profile.totalFrequency).toBe(963);
      expect(profile.semanticSum).toBe(144);
    });
  });
});
