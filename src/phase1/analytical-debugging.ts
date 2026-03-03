import { PLV_THRESHOLD } from "../scheduler/index";
import { encodeGlyphs } from "../radix-core/index";

const PHI = 1.61803398875;

export interface ResonantGlyph {
  id?: string;
  value: number;
  freq: number;
}

export interface SemanticState {
  id: string;
  glyphs: ResonantGlyph[];
}

export interface BasinSubState {
  id: string;
  resonance: number;
  coherence: number;
}

export interface SemanticBasin {
  address: string;
  coherence: number;
  fractured: boolean;
  subStates: BasinSubState[];
}

/**
 * Build a multi-scalar semantic basin map in Base-144,000 FSOU space.
 * States with aligned glyph resonance are grouped into shared basins.
 */
export function cartographSemanticBasins(states: SemanticState[]): SemanticBasin[] {
  const basins = new Map<string, BasinSubState[]>();

  for (const state of states) {
    const address = encodeGlyphs(state.glyphs);
    const resonance = state.glyphs.reduce((sum, g) => sum + g.value * g.freq, 0);
    const g15Count = state.glyphs.filter((g) => g.id === "G15" || g.value === 15).length;
    const coherence = state.glyphs.length === 0 ? 0 : g15Count / state.glyphs.length;

    const current = basins.get(address) ?? [];
    current.push({ id: state.id, resonance, coherence });
    basins.set(address, current);
  }

  return Array.from(basins.entries()).map(([address, subStates]) => {
    const coherence = subStates.reduce((sum, s) => sum + s.coherence, 0) / subStates.length;
    return {
      address,
      coherence,
      fractured: coherence < PLV_THRESHOLD,
      subStates,
    };
  });
}

export interface FlowSample {
  gate: string;
  latencyMs: number;
}

export interface FlowZone {
  gate: string;
  latencyMs: number;
  pressure: number;
  turbulent: boolean;
}

export interface HydraulicFlowReport {
  baselineLatency: number;
  zones: FlowZone[];
  turbulentZones: FlowZone[];
}

/**
 * Represent throughput as a hydraulic system; high-pressure zones are turbulence.
 */
export function analyzeHydraulicFlow(samples: FlowSample[]): HydraulicFlowReport {
  const baselineLatency =
    samples.length === 0
      ? 0
      : samples.reduce((sum, sample) => sum + sample.latencyMs, 0) / samples.length;

  const zones = samples.map((sample) => {
    const pressure = baselineLatency === 0 ? 0 : sample.latencyMs / baselineLatency;
    return {
      gate: sample.gate,
      latencyMs: sample.latencyMs,
      pressure,
      turbulent: pressure > PHI,
    };
  });

  return {
    baselineLatency,
    zones,
    turbulentZones: zones.filter((zone) => zone.turbulent),
  };
}

export interface WaveformVerification {
  clockHz: number;
  observedHz: number;
  driftHz: number;
  thermalNoise: boolean;
  resonant: boolean;
}

/**
 * Verify electro-harmonic alignment against the 432Hz system clock.
 */
export function verifyElectroHarmonicWaveform(
  channelsHz: number[],
  clockHz = 432,
  harmonicThresholdHz = clockHz * PHI
): WaveformVerification {
  const observedHz =
    channelsHz.length === 0
      ? 0
      : channelsHz.reduce((sum, hz) => sum + hz, 0) / channelsHz.length;
  const driftHz = Math.abs(observedHz - clockHz);
  const thermalNoise = channelsHz.some((hz) => hz > harmonicThresholdHz);

  return {
    clockHz,
    observedHz,
    driftHz,
    thermalNoise,
    resonant: !thermalNoise && driftHz <= clockHz * 0.01,
  };
}
