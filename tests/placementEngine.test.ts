// ---------------------------------------------------------------------------
// placementEngine.test.ts — CodeRa v2 unit tests
// Run: npm test
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import {
  PlacementEngine,
  PLACEMENT_LEVELS_V2,
  PLACEMENT_LEVELS_V1,
  CODING_CHALLENGE_MIN_SCORE,
} from '../src/engine/placementEngine';
import {
  ScoringEngine,
  DOMAIN_CONFIG,
} from '../src/engine/scoringEngine';
import type {
  AssessmentDomain,
  DomainScore,
  ItemTelemetry,
} from '../src/engine/telemetrySchema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function emptyDomainScores(): Record<AssessmentDomain, DomainScore> {
  const result: Record<string, DomainScore> = {};
  for (const [key, cfg] of Object.entries(DOMAIN_CONFIG)) {
    result[key] = {
      domain: key as AssessmentDomain,
      domain_name: cfg.name,
      weight_pct: cfg.weight * 100,
      max_score: cfg.maxScore,
      raw_accuracy_pct: 0,
      efficiency_index: 0,
      earned_score: 0,
      skills_breakdown: {},
    };
  }
  return result as Record<AssessmentDomain, DomainScore>;
}

function domainScoresForTotal(total: number): Record<AssessmentDomain, DomainScore> {
  // Distribute the total proportionally across domains to simulate a real score
  const scores = emptyDomainScores();
  for (const [key, cfg] of Object.entries(DOMAIN_CONFIG)) {
    const proportion = cfg.maxScore / 100;
    scores[key as AssessmentDomain].earned_score = Math.round(total * proportion * 10) / 10;
  }
  return scores;
}

function makeItems(count = 10): ItemTelemetry[] {
  return Array.from({ length: count }, (_, i) => ({
    item_id: `item_${i}`,
    domain: 'cognitive_ability' as AssessmentDomain,
    skill: 'pattern_recognition' as ItemTelemetry['skill'],
    format: 'structured' as ItemTelemetry['format'],
    difficulty_level: 2,
    is_correct: true,
    accuracy_score: 1.0,
    response_time_ms: 60_000,
    expected_time_ms: 90_000,
    attempts_count: 1,
    hints_used: 0,
  }));
}

// ---------------------------------------------------------------------------
// 1. PLACEMENT_LEVELS_V2 constants
// ---------------------------------------------------------------------------
describe('PLACEMENT_LEVELS_V2', () => {
  it('has exactly 4 levels', () => {
    expect(PLACEMENT_LEVELS_V2).toHaveLength(4);
  });

  it('L1 Coder spans 0–49', () => {
    const l1 = PLACEMENT_LEVELS_V2.find(l => l.id === 'L1');
    expect(l1?.minScore).toBe(0);
    expect(l1?.maxScore).toBe(49);
  });

  it('L2 Programmer spans 50–69', () => {
    const l2 = PLACEMENT_LEVELS_V2.find(l => l.id === 'L2');
    expect(l2?.minScore).toBe(50);
    expect(l2?.maxScore).toBe(69);
  });

  it('L3 Developer spans 70–84', () => {
    const l3 = PLACEMENT_LEVELS_V2.find(l => l.id === 'L3');
    expect(l3?.minScore).toBe(70);
    expect(l3?.maxScore).toBe(84);
  });

  it('L4 Career Ready spans 85–100', () => {
    const l4 = PLACEMENT_LEVELS_V2.find(l => l.id === 'L4');
    expect(l4?.minScore).toBe(85);
    expect(l4?.maxScore).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// 2. PLACEMENT_LEVELS_V1 backward compat
// ---------------------------------------------------------------------------
describe('PLACEMENT_LEVELS_V1', () => {
  it('has exactly 4 legacy levels', () => {
    expect(PLACEMENT_LEVELS_V1).toHaveLength(4);
  });

  it('still contains Explorer, Builder, Creator, Innovator', () => {
    const names = PLACEMENT_LEVELS_V1.map(l => l.name);
    expect(names).toContain('Explorer');
    expect(names).toContain('Builder');
    expect(names).toContain('Creator');
    expect(names).toContain('Innovator');
  });
});

// ---------------------------------------------------------------------------
// 3. CODING_CHALLENGE_MIN_SCORE
// ---------------------------------------------------------------------------
describe('CODING_CHALLENGE_MIN_SCORE', () => {
  it('is 70', () => {
    expect(CODING_CHALLENGE_MIN_SCORE).toBe(70);
  });
});

// ---------------------------------------------------------------------------
// 4. v2 placement — threshold boundary tests (the critical ones)
// ---------------------------------------------------------------------------
describe('evaluatePlacement v2 — threshold boundaries', () => {
  function place(score: number) {
    return PlacementEngine.evaluatePlacement(
      score,
      domainScoresForTotal(score),
      makeItems(),
      '2.0',
    );
  }

  // L1 boundaries
  it('score 0  → L1 Coder', () => {
    expect(place(0).baseTrack).toBe('L1 Coder');
  });

  it('score 49 → L1 Coder', () => {
    expect(place(49).baseTrack).toBe('L1 Coder');
  });

  // L1→L2 boundary
  it('score 50 → L2 Programmer (not L1)', () => {
    expect(place(50).baseTrack).toBe('L2 Programmer');
  });

  // L2 boundaries
  it('score 69 → L2 Programmer', () => {
    expect(place(69).baseTrack).toBe('L2 Programmer');
  });

  // L2→L3 boundary
  it('score 70 → L3 Developer (not L2)', () => {
    expect(place(70).baseTrack).toBe('L3 Developer');
  });

  // L3 boundaries
  it('score 84 → L3 Developer', () => {
    expect(place(84).baseTrack).toBe('L3 Developer');
  });

  // L3→L4 boundary
  it('score 85 → L4 Career Ready (not L3)', () => {
    expect(place(85).baseTrack).toBe('L4 Career Ready');
  });

  // L4 ceiling
  it('score 100 → L4 Career Ready', () => {
    expect(place(100).baseTrack).toBe('L4 Career Ready');
  });
});

// ---------------------------------------------------------------------------
// 5. Coding Challenge gating
// ---------------------------------------------------------------------------
describe('qualifiesForCodingChallenge', () => {
  function place(score: number) {
    return PlacementEngine.evaluatePlacement(
      score,
      domainScoresForTotal(score),
      makeItems(),
      '2.0',
    );
  }

  it('score 69 → does NOT qualify for Coding Challenge', () => {
    expect(place(69).qualifiesForCodingChallenge).toBe(false);
  });

  it('score 70 → qualifies for Coding Challenge', () => {
    expect(place(70).qualifiesForCodingChallenge).toBe(true);
  });

  it('score 84 → qualifies for Coding Challenge (L3)', () => {
    expect(place(84).qualifiesForCodingChallenge).toBe(true);
  });

  it('score 85 → qualifies for Coding Challenge (L4)', () => {
    expect(place(85).qualifiesForCodingChallenge).toBe(true);
  });

  it('score 100 → qualifies for Coding Challenge', () => {
    expect(place(100).qualifiesForCodingChallenge).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. Safety override flags — trigger thresholds
// ---------------------------------------------------------------------------
describe('safety override flags', () => {
  it('FLAG_COGNITIVE_DEFICIENCY fires when cognitive < 10', () => {
    const scores = emptyDomainScores();
    scores.cognitive_ability.earned_score = 9; // below threshold
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_COGNITIVE_DEFICIENCY')).toBe(true);
  });

  it('FLAG_COGNITIVE_DEFICIENCY does NOT fire when cognitive = 10', () => {
    const scores = emptyDomainScores();
    scores.cognitive_ability.earned_score = 10;
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_COGNITIVE_DEFICIENCY')).toBe(false);
  });

  it('FLAG_FUNCTIONAL_DEFICIENCY fires when functional < 10', () => {
    const scores = emptyDomainScores();
    scores.functional_skills.earned_score = 9;
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_FUNCTIONAL_DEFICIENCY')).toBe(true);
  });

  it('FLAG_COMMUNICATION_SUPPORT fires when communication < 7', () => {
    const scores = emptyDomainScores();
    scores.communication_level.earned_score = 6;
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_COMMUNICATION_SUPPORT')).toBe(true);
  });

  it('FLAG_COMMUNICATION_SUPPORT does NOT fire when communication = 7', () => {
    const scores = emptyDomainScores();
    scores.communication_level.earned_score = 7;
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_COMMUNICATION_SUPPORT')).toBe(false);
  });

  it('FLAG_BEHAVIORAL_ADAPTABILITY fires when behavioral < 5.25', () => {
    const scores = emptyDomainScores();
    scores.behavioral_readiness.earned_score = 5.0;
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_BEHAVIORAL_ADAPTABILITY')).toBe(true);
  });

  it('FLAG_BEHAVIORAL_ADAPTABILITY does NOT fire when behavioral = 5.25', () => {
    const scores = emptyDomainScores();
    scores.behavioral_readiness.earned_score = 5.25;
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_BEHAVIORAL_ADAPTABILITY')).toBe(false);
  });

  it('FLAG_FINE_MOTOR_SUPPORT fires when motor < 5.25', () => {
    const scores = emptyDomainScores();
    scores.fine_motor_technology.earned_score = 5.0;
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.flags.some(f => f.id === 'FLAG_FINE_MOTOR_SUPPORT')).toBe(true);
  });

  it('requiresSupport is true when a critical flag fires', () => {
    const scores = emptyDomainScores();
    scores.cognitive_ability.earned_score = 5; // triggers critical flag
    const result = PlacementEngine.evaluatePlacement(50, scores, makeItems(), '2.0');
    expect(result.requiresSupport).toBe(true);
  });

  it('requiresSupport is false with no critical flags', () => {
    const scores = domainScoresForTotal(75);
    const result = PlacementEngine.evaluatePlacement(75, scores, makeItems(), '2.0');
    expect(result.requiresSupport).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. Schema version branching
// ---------------------------------------------------------------------------
describe('schema version branching', () => {
  it('v1.0 session returns legacy track names (Explorer)', () => {
    const scores = domainScoresForTotal(30);
    const result = PlacementEngine.evaluatePlacement(30, scores, makeItems(), '1.0');
    expect(result.baseTrack).toBe('Explorer');
    expect(result.schemaVersion).toBe('1.0');
  });

  it('v1.0 session always returns qualifiesForCodingChallenge = false', () => {
    const scores = domainScoresForTotal(95);
    const result = PlacementEngine.evaluatePlacement(95, scores, makeItems(), '1.0');
    expect(result.qualifiesForCodingChallenge).toBe(false);
  });

  it('v2.0 session returns L1–L4 track names', () => {
    const scores = domainScoresForTotal(30);
    const result = PlacementEngine.evaluatePlacement(30, scores, makeItems(), '2.0');
    expect(result.baseTrack).toMatch(/^L[1-4]/);
    expect(result.schemaVersion).toBe('2.0');
  });

  it('default (no schemaVersion arg) behaves as v2.0', () => {
    const scores = domainScoresForTotal(55);
    const result = PlacementEngine.evaluatePlacement(55, scores, makeItems());
    expect(result.schemaVersion).toBe('2.0');
    expect(result.baseTrack).toBe('L2 Programmer');
  });
});

// ---------------------------------------------------------------------------
// 8. recommendedTrack with targeted support annotation
// ---------------------------------------------------------------------------
describe('recommendedTrack annotation', () => {
  it('adds "(with Targeted Support)" when critical flag fires on non-L1 student', () => {
    const scores = domainScoresForTotal(55); // L2
    scores.cognitive_ability.earned_score = 5; // triggers critical flag
    const result = PlacementEngine.evaluatePlacement(55, scores, makeItems(), '2.0');
    expect(result.recommendedTrack).toContain('with Targeted Support');
  });

  it('does NOT annotate L1 student even with critical flag', () => {
    const scores = emptyDomainScores(); // all zeros → L1
    scores.cognitive_ability.earned_score = 5; // critical flag, but base is L1
    const result = PlacementEngine.evaluatePlacement(25, scores, makeItems(), '2.0');
    expect(result.recommendedTrack).not.toContain('with Targeted Support');
  });
});
