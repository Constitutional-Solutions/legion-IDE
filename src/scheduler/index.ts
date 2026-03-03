/**
 * Love Theorem Scheduler — cooperative process execution simulation.
 *
 * Implements the scheduler described in section 5 of the LEGION spec.
 *
 * The Coherence Value L(s, s') measures phase alignment between a running
 * state and an incoming instruction:
 *
 *   L(s, s') = (φ × cos(θ_s − θ_s')) / E_entropy
 *
 * where:
 *   φ         = 1.61803398875 (Golden Ratio)
 *   θ         = phase angle of the process/instruction (0 to 2π)
 *   E_entropy = entropy coefficient (defaults to 1; must be > 0)
 *
 * The raw value is then normalised to [0, 1] so callers can apply the
 * PLV threshold of 0.618 directly.  An instruction is only dispatched
 * when coherence > 0.618 (the reciprocal of φ).
 */

const PHI = 1.61803398875;
/** Phase-Locking Value threshold required for instruction execution. */
export const PLV_THRESHOLD = 0.618;

export interface GlyphRef {
  id: string;
  value: number;
  freq: number;
}

/** A schedulable unit with a phase angle and an associated glyph sequence. */
export class Process {
  /** Phase angle in radians [0, 2π]. */
  phaseAngle: number;
  /** Glyph sequence that defines this process's semantic identity. */
  glyphs: GlyphRef[];

  constructor(phaseAngle: number, glyphs: GlyphRef[] = []) {
    if (!Number.isFinite(phaseAngle)) {
      throw new RangeError(`Process: phaseAngle must be a finite number (got ${phaseAngle})`);
    }
    this.phaseAngle = phaseAngle;
    this.glyphs = glyphs;
  }

  /**
   * Compute the coherence between a system state and an instruction.
   *
   * Raw L is mapped from [−φ, φ] → [0, 1] so that:
   *   - perfect phase alignment  → coherence = 1.0
   *   - phase opposition (π rad) → coherence = 0.0
   *
   * @param state       - Current system state process.
   * @param instruction - Incoming instruction process.
   * @param entropy     - Thermal noise coefficient E_entropy (default 1).
   * @returns Normalised coherence in [0, 1].
   */
  static checkCoherence(
    state: Process,
    instruction: Process,
    entropy = 1
  ): number {
    if (entropy <= 0) {
      throw new RangeError(`checkCoherence: entropy must be > 0 (got ${entropy})`);
    }
    const raw = (PHI * Math.cos(state.phaseAngle - instruction.phaseAngle)) / entropy;
    // raw ∈ [−φ/entropy, φ/entropy]; normalise to [0, 1]
    const maxRaw = PHI / entropy;
    return (raw + maxRaw) / (2 * maxRaw);
  }

  /**
   * Attempt to execute a callback if coherence with `instruction` is above
   * the PLV threshold (0.618).
   *
   * @param instruction - Process representing the instruction to run.
   * @param callback    - Side-effect to invoke on success.
   * @param entropy     - Optional entropy coefficient.
   * @returns `true` if the instruction was executed; `false` otherwise.
   */
  execute(
    instruction: Process,
    callback: () => void,
    entropy = 1
  ): boolean {
    const coherence = Process.checkCoherence(this, instruction, entropy);
    if (coherence > PLV_THRESHOLD) {
      callback();
      return true;
    }
    return false;
  }
}
