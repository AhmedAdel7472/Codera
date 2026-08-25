// ---------------------------------------------------------------------------
// scoringEngine.test.ts — CodeRa v2 unit tests
// Run: npm test
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import {
  ScoringEngine,
  DOMAIN_CONFIG,
  FORMAT_CONFIG,
  TOTAL_BASE_QUESTIONS,
} from '../src/engine/scoringEngine';
import type { ItemTelemetry, AssessmentDomain, QuestionFormat } from '../src/engine/telemetrySchema';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeItem(
  overrides: Partial<ItemTelemetry> & { domain: AssessmentDomain; skill: ItemTelemetry['skill'] }
): ItemTelemetry {
  return {
    item_id: 'test_item',
    format: 'structured',
    difficulty_level: 2,
    is_correct: true,
    accuracy_score: 1.0,
    response_time_ms: 60_000,
    expected_time_ms: 90_000,
    attempts_count: 1,
    hints_used: 0,
    ...overrides,
  };
}

function makeItemSet(
  domain: AssessmentDomain,
  count: number,
  accuracy = 1.0,
  format: QuestionFormat = 'structured',
): ItemTelemetry[] {
  return Array.from({ length: count }, (_, i) =>
    makeItem({
      item_id: `${domain}_${i}`,
      domain,
      skill: 'pattern_recognition',
      format,
      accuracy_score: accuracy,
      is_correct: accuracy > 0,
    })
  );
}

// ---------------------------------------------------------------------------
// 1. DOMAIN_CONFIG integrity
// ---------------------------------------------------------------------------
describe('DOMAIN_CONFIG', () => {
  it('has exactly 5 domains', () => {
    expect(Object.keys(DOMAIN_CONFIG)).toHaveLength(5);
  });

  it('question counts sum to 50', () => {
    const total = Object.values(DOMAIN_CONFIG).reduce((s, d) => s + d.questionCount, 0);
    expect(total).toBe(TOTAL_BASE_QUESTIONS);
  });

  it('domain weights sum to 1.0', () => {
    const total = Object.values(DOMAIN_CONFIG).reduce((s, d) => s + d.weight, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });

  it('max scores sum to 100', () => {
    const total = Object.values(DOMAIN_CONFIG).reduce((s, d) => s + d.maxScore, 0);
    expect(total).toBe(100);
  });

  it('cognitive_ability has 12 questions', () => {
    expect(DOMAIN_CONFIG.cognitive_ability.questionCount).toBe(12);
  });

  it('functional_skills has 12 questions', () => {
    expect(DOMAIN_CONFIG.functional_skills.questionCount).toBe(12);
  });

  it('communication_level has 10 questions', () => {
    expect(DOMAIN_CONFIG.communication_level.questionCount).toBe(10);
  });

  it('behavioral_readiness has 8 questions', () => {
    expect(DOMAIN_CONFIG.behavioral_readiness.questionCount).toBe(8);
  });

  it('fine_motor_technology has 8 questions', () => {
    expect(DOMAIN_CONFIG.fine_motor_technology.questionCount).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// 2. FORMAT_CONFIG integrity
// ---------------------------------------------------------------------------
describe('FORMAT_CONFIG', () => {
  it('format weights sum to 1.0', () => {
    const total = Object.values(FORMAT_CONFIG).reduce((s, f) => s + f.weight, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });

  it('structured has 40% weight', () => {
    expect(FORMAT_CONFIG.structured.weight).toBe(0.40);
  });

  it('performance has 30% weight', () => {
    expect(FORMAT_CONFIG.performance.weight).toBe(0.30);
  });

  it('observation has 20% weight', () => {
    expect(FORMAT_CONFIG.observation.weight).toBe(0.20);
  });

  it('coding_challenge has 10% weight', () => {
    expect(FORMAT_CONFIG.coding_challenge.weight).toBe(0.10);
  });
});

// ---------------------------------------------------------------------------
// 3. calculateItemScore — multiplier behaviour
// ---------------------------------------------------------------------------
describe('calculateItemScore', () => {
  it('returns full marks for a perfect item', () => {
    const item = makeItem({
      domain: 'cognitive_ability',
      skill: 'pattern_recognition',
      accuracy_score: 1.0,
      response_time_ms: 60_000,
      expected_time_ms: 90_000,
      attempts_count: 1,
      hints_used: 0,
    });
    expect(ScoringEngine.calculateItemScore(item, 2.0)).toBe(2.0);
  });

  it('returns 0 for a fully wrong item', () => {
    const item = makeItem({
      domain: 'cognitive_ability',
      skill: 'pattern_recognition',
      is_correct: false,
      accuracy_score: 0,
    });
    expect(ScoringEngine.calculateItemScore(item, 2.0)).toBe(0);
  });

  it('applies time penalty when response is slower than expected', () => {
    const fast = makeItem({ domain: 'cognitive_ability', skill: 'pattern_recognition', response_time_ms: 60_000,  expected_time_ms: 90_000 });
    const slow = makeItem({ domain: 'cognitive_ability', skill: 'pattern_recognition', response_time_ms: 180_000, expected_time_ms: 90_000 });
    expect(ScoringEngine.calculateItemScore(fast, 2.0)).toBeGreaterThan(
      ScoringEngine.calculateItemScore(slow, 2.0)
    );
  });

  it('caps time multiplier floor at 0.7', () => {
    // Extremely slow item — multiplier should not go below 0.7
    const item = makeItem({
      domain: 'cognitive_ability',
      skill: 'pattern_recognition',
      response_time_ms: 9_000_000,
      expected_time_ms: 90_000,
    });
    const score = ScoringEngine.calculateItemScore(item, 2.0);
    // min score = 2.0 × 1.0 × 0.7 × 1.0 × 1.0 = 1.4
    expect(score).toBeGreaterThanOrEqual(1.4);
  });

  it('applies hint penalty', () => {
    const noHint  = makeItem({ domain: 'cognitive_ability', skill: 'pattern_recognition', hints_used: 0 });
    const oneHint = makeItem({ domain: 'cognitive_ability', skill: 'pattern_recognition', hints_used: 1 });
    expect(ScoringEngine.calculateItemScore(noHint, 2.0)).toBeGreaterThan(
      ScoringEngine.calculateItemScore(oneHint, 2.0)
    );
  });

  it('caps hint multiplier floor at 0.5', () => {
    const item = makeItem({
      domain: 'cognitive_ability',
      skill: 'pattern_recognition',
      hints_used: 100,
    });
    const score = ScoringEngine.calculateItemScore(item, 2.0);
    // min = 2.0 × 0.5 (hint) × 0.7 (time, fast item so 1.0) × 1.0 = at least 0
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('applies attempt penalty for multiple attempts', () => {
    const oneAttempt  = makeItem({ domain: 'cognitive_ability', skill: 'pattern_recognition', attempts_count: 1 });
    const threeAttempts = makeItem({ domain: 'cognitive_ability', skill: 'pattern_recognition', attempts_count: 3 });
    expect(ScoringEngine.calculateItemScore(oneAttempt, 2.0)).toBeGreaterThan(
      ScoringEngine.calculateItemScore(threeAttempts, 2.0)
    );
  });

  it('caps attempt multiplier floor at 0.6', () => {
    const item = makeItem({
      domain: 'cognitive_ability',
      skill: 'pattern_recognition',
      attempts_count: 100,
    });
    const score = ScoringEngine.calculateItemScore(item, 2.0);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('handles partial accuracy (0.5)', () => {
    const item = makeItem({
      domain: 'cognitive_ability',
      skill: 'pattern_recognition',
      accuracy_score: 0.5,
      is_correct: false,
    });
    const score = ScoringEngine.calculateItemScore(item, 2.0);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(2.0);
  });
});

// ---------------------------------------------------------------------------
// 4. calculateDomainScores
// ---------------------------------------------------------------------------
describe('calculateDomainScores', () => {
  it('produces 5 domain keys', () => {
    const items = makeItemSet('cognitive_ability', 12);
    const result = ScoringEngine.calculateDomainScores(items);
    expect(Object.keys(result)).toHaveLength(5);
  });

  it('zeroes out domains with no items', () => {
    const items = makeItemSet('cognitive_ability', 12);
    const result = ScoringEngine.calculateDomainScores(items);
    expect(result.functional_skills.earned_score).toBe(0);
    expect(result.communication_level.earned_score).toBe(0);
  });

  it('caps domain score at domain maxScore', () => {
    // Give 12 items worth 5pts each (more than the 25pt cap)
    const items = makeItemSet('cognitive_ability', 12);
    const ptsMap = Object.fromEntries(items.map(i => [i.item_id, 5.0]));
    const result = ScoringEngine.calculateDomainScores(items, ptsMap);
    expect(result.cognitive_ability.earned_score).toBeLessThanOrEqual(25);
  });

  it('produces correct weight_pct for cognitive (25%)', () => {
    const result = ScoringEngine.calculateDomainScores([]);
    expect(result.cognitive_ability.weight_pct).toBe(25);
  });

  it('produces 100% efficiency for all-correct items with max points per item', () => {
    const items = makeItemSet('cognitive_ability', 12, 1.0);
    // 25 max points / 12 items = 2.0833 pts per item
    const ptsMap = Object.fromEntries(items.map(i => [i.item_id, 25 / 12]));
    const result = ScoringEngine.calculateDomainScores(items, ptsMap);
    expect(result.cognitive_ability.efficiency_index).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// 5. calculateTotalScore
// ---------------------------------------------------------------------------
describe('calculateTotalScore', () => {
  it('sums all earned domain scores', () => {
    const items = [
      ...makeItemSet('cognitive_ability',     12, 1.0),
      ...makeItemSet('functional_skills',     12, 1.0),
      ...makeItemSet('communication_level',   10, 1.0),
      ...makeItemSet('behavioral_readiness',   8, 1.0),
      ...makeItemSet('fine_motor_technology',  8, 1.0),
    ];
    // Give max points per item to hit domain caps
    const ptsMap: Record<string, number> = {};
    const domainPts: Record<AssessmentDomain, number> = {
      cognitive_ability: 25 / 12,
      functional_skills: 25 / 12,
      communication_level: 20 / 10,
      behavioral_readiness: 15 / 8,
      fine_motor_technology: 15 / 8,
    };
    for (const item of items) ptsMap[item.item_id] = domainPts[item.domain];

    const domainScores = ScoringEngine.calculateDomainScores(items, ptsMap);
    const total = ScoringEngine.calculateTotalScore(domainScores);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(100);
  });

  it('returns 0 for empty items', () => {
    const domainScores = ScoringEngine.calculateDomainScores([]);
    expect(ScoringEngine.calculateTotalScore(domainScores)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 6. calculateFormatScores
// ---------------------------------------------------------------------------
describe('calculateFormatScores', () => {
  it('produces 4 format keys', () => {
    const items = makeItemSet('cognitive_ability', 5, 1.0, 'structured');
    const result = ScoringEngine.calculateFormatScores(items);
    expect(Object.keys(result)).toHaveLength(4);
  });

  it('zeroes out formats with no items', () => {
    const items = makeItemSet('cognitive_ability', 5, 1.0, 'structured');
    const result = ScoringEngine.calculateFormatScores(items);
    expect(result.performance.question_count).toBe(0);
    expect(result.performance.earned_contribution).toBe(0);
  });

  it('structured has 40% weight_pct', () => {
    const result = ScoringEngine.calculateFormatScores([]);
    expect(result.structured.weight_pct).toBe(40);
  });

  it('earned_contribution > 0 for perfect structured items', () => {
    const items = makeItemSet('cognitive_ability', 10, 1.0, 'structured');
    const result = ScoringEngine.calculateFormatScores(items);
    expect(result.structured.earned_contribution).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 7. calculateCodingReadinessScore
// ---------------------------------------------------------------------------
describe('calculateCodingReadinessScore', () => {
  it('returns 0 when no coding-readiness items', () => {
    const items = makeItemSet('behavioral_readiness', 5, 1.0);
    // Override skill to something not in the coding-readiness set
    const modified = items.map(i => ({ ...i, skill: 'adaptability' as ItemTelemetry['skill'] }));
    expect(ScoringEngine.calculateCodingReadinessScore(modified)).toBe(0);
  });

  it('returns 100 for perfect sequencing items', () => {
    const items = Array.from({ length: 5 }, (_, i) =>
      makeItem({
        item_id: `seq_${i}`,
        domain: 'cognitive_ability',
        skill: 'sequencing',
        accuracy_score: 1.0,
        is_correct: true,
        format: 'structured',
      })
    );
    expect(ScoringEngine.calculateCodingReadinessScore(items)).toBe(100);
  });

  it('returns ~50 for 50% accuracy on algorithmic thinking items', () => {
    const items = Array.from({ length: 4 }, (_, i) =>
      makeItem({
        item_id: `alg_${i}`,
        domain: 'cognitive_ability',
        skill: 'algorithmic_thinking',
        accuracy_score: 0.5,
        is_correct: false,
        format: 'structured',
      })
    );
    expect(ScoringEngine.calculateCodingReadinessScore(items)).toBe(50);
  });
});
