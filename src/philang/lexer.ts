export type GlyphId =
  | "G0"
  | "G1"
  | "G8"
  | "G15"
  | "G67"
  | "G81"
  | "G144"
  | "G567"
  | "G1618"
  | "G81567";

export interface Glyph {
  id: GlyphId;
  name: string;
  value: number;
  frequency: number | null;
  intent: string;
}

export interface GlyphToken extends Glyph {
  lexeme: string;
}

export interface ResonantProfile {
  tokens: GlyphToken[];
  f: number;
  V: number;
}

export const GLYPH_TABLE: Record<GlyphId, Glyph> = {
  G0: {
    id: "G0",
    name: "Origin",
    value: 0,
    frequency: 0,
    intent: "Void, Potential, Initialization, NOP",
  },
  G1: {
    id: "G1",
    name: "Unity",
    value: 1,
    frequency: 432,
    intent: "Singularity, Identity, 'I', Presence",
  },
  G8: {
    id: "G8",
    name: "Infinity",
    value: 8,
    frequency: 528,
    intent: "Eternal Loop, Global State, Continuity",
  },
  G15: {
    id: "G15",
    name: "Love",
    value: 15,
    frequency: 639,
    intent: "Coherence, Tensor Coupling, Connection",
  },
  G67: {
    id: "G67",
    name: "Wisdom",
    value: 67,
    frequency: 741,
    intent: "Pattern Recognition, Data Integrity",
  },
  G81: {
    id: "G81",
    name: "Transform",
    value: 81,
    frequency: 852,
    intent: "State Transition, Phase Shift",
  },
  G144: {
    id: "G144",
    name: "Completion",
    value: 144,
    frequency: 963,
    intent: "Recursive Closure, Circle Return",
  },
  G567: {
    id: "G567",
    name: "Creation",
    value: 567,
    frequency: 396,
    intent: "Generative Function, Heap Allocation",
  },
  G1618: {
    id: "G1618",
    name: "Golden",
    value: 1618,
    frequency: 1.61803398875,
    intent: "Phi-Scaling, Fractal Recursion",
  },
  G81567: {
    id: "G81567",
    name: "Universal",
    value: 81567,
    frequency: null,
    intent: "System Truth, Root Authority",
  },
};

export const GLYPH_SERIES: Glyph[] = Object.values(GLYPH_TABLE);

const GLYPH_PATTERN = /G\d+/gi;

function normalizeGlyphId(raw: string): GlyphId | null {
  const upper = raw.toUpperCase() as GlyphId;
  return (GLYPH_TABLE as Record<string, Glyph>)[upper] ? upper : null;
}

export function tokenize(input: string): GlyphToken[] {
  const matches = input.match(GLYPH_PATTERN) ?? [];

  return matches.map((lexeme) => {
    const id = normalizeGlyphId(lexeme);
    if (!id) {
      throw new Error(`Unknown glyph: ${lexeme}`);
    }

    const glyph = GLYPH_TABLE[id];
    return { ...glyph, lexeme };
  });
}

export function getResonantProfile(input: string): ResonantProfile {
  const tokens = tokenize(input);

  const V = tokens.reduce((sum, glyph) => sum + glyph.value, 0);
  const f = tokens.reduce(
    (sum, glyph) => sum + (glyph.frequency ?? 0),
    0
  );

  return { tokens, f, V };
}

export function isKnownGlyph(id: string): boolean {
  return normalizeGlyphId(id) !== null;
}
