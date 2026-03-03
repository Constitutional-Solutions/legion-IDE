/**
 * Philang Lexer — tokenizes G-Series Glyph sequences.
 *
 * Each Glyph is a first-class citizen with a numeric value ($V$) and a
 * resonant frequency ($f$).  The lexer recognises the canonical G-Series
 * identifiers (G0, G1, G8 … G81567) and turns an input string into an
 * array of GlyphToken objects.
 */

export interface GlyphDefinition {
  id: string;
  name: string;
  value: number;
  freq: number;
}

export interface GlyphToken extends GlyphDefinition {
  position: number;
}

export interface ResonantProfile {
  totalFrequency: number;
  semanticSum: number;
}

/** Canonical G-Series Glyph table (section 3.1 of the LEGION spec). */
export const GLYPHS: readonly GlyphDefinition[] = [
  { id: "G0",     name: "Origin",     value: 0,     freq: 0       },
  { id: "G1",     name: "Unity",      value: 1,     freq: 432     },
  { id: "G8",     name: "Infinity",   value: 8,     freq: 528     },
  { id: "G15",    name: "Love",       value: 15,    freq: 639     },
  { id: "G67",    name: "Wisdom",     value: 67,    freq: 741     },
  { id: "G81",    name: "Transform",  value: 81,    freq: 852     },
  { id: "G144",   name: "Completion", value: 144,   freq: 963     },
  { id: "G567",   name: "Creation",   value: 567,   freq: 396     },
  { id: "G1618",  name: "Golden",     value: 1618,  freq: 1.618   },
  { id: "G81567", name: "Universal",  value: 81567, freq: 81567   },
];

// Build a lookup map keyed on glyph ID for O(1) access.
const GLYPH_MAP: Map<string, GlyphDefinition> = new Map(
  GLYPHS.map((g) => [g.id, g])
);

/**
 * Tokenize an input string into GlyphToken objects.
 *
 * Tokens are whitespace-separated glyph identifiers (e.g. "G1 G15 G81").
 * Unrecognised tokens are silently skipped.
 *
 * @param input - Raw Philang source string.
 * @returns Array of recognised GlyphToken objects.
 */
export function tokenize(input: string): GlyphToken[] {
  const tokens: GlyphToken[] = [];
  const parts = input.trim().split(/\s+/);

  for (let pos = 0; pos < parts.length; pos++) {
    const raw = parts[pos].toUpperCase();
    const def = GLYPH_MAP.get(raw);
    if (def) {
      tokens.push({ ...def, position: pos });
    }
  }

  return tokens;
}

/**
 * Calculate the resonant profile of a token array.
 *
 * - `totalFrequency` — additive sum of each token's base frequency.
 * - `semanticSum`    — additive sum of each token's decimal value
 *                      (Module_Identity = Σ Gᵢ per spec section 3.2).
 *
 * @param tokens - Array of GlyphToken objects (e.g. from `tokenize`).
 * @returns ResonantProfile with totalFrequency and semanticSum.
 */
export function getResonantProfile(tokens: GlyphToken[]): ResonantProfile {
  let totalFrequency = 0;
  let semanticSum = 0;

  for (const token of tokens) {
    totalFrequency += token.freq;
    semanticSum += token.value;
  }

  return { totalFrequency, semanticSum };
}
