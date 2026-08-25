import { describe, it, expect } from 'vitest';
import { ScoringEngine, DOMAIN_CONFIG } from '../src/engine/scoringEngine';
import { PlacementEngine } from '../src/engine/placementEngine';
import { ItemTelemetry } from '../src/engine/telemetrySchema';

describe('Standardized 50-Question Matrix Integration', () => {
  it('validates 50-question domain configuration and weights', () => {
    let totalWeight = 0;
    let totalMaxScore = 0;
    let totalQuestions = 0;

    for (const [key, cfg] of Object.entries(DOMAIN_CONFIG)) {
      totalWeight += cfg.weight;
      totalMaxScore += cfg.maxScore;
      totalQuestions += cfg.questionCount;
    }

    expect(totalWeight).toBeCloseTo(1.0);
    expect(totalMaxScore).toBe(100);
    expect(totalQuestions).toBe(50);
  });

  it('evaluates a full 50-question session to L4 Career Ready', () => {
    const mockItem: ItemTelemetry = {
      item_id: 'q1',
      domain: 'cognitive_ability',
      skill: 'pattern_recognition',
      format: 'structured',
      difficulty_level: 3,
      is_correct: true,
      accuracy_score: 1.0,
      response_time_ms: 5000,
      expected_time_ms: 10000,
      attempts_count: 1,
      hints_used: 0,
    };

    const fullSessionItems: ItemTelemetry[] = [];
    const ptsMap: Record<string, number> = {};

    // Cognitive: 12 Qs
    for (let i = 0; i < 12; i++) {
      const id = `cog_${i}`;
      fullSessionItems.push({ ...mockItem, item_id: id, domain: 'cognitive_ability' });
      ptsMap[id] = 25 / 12;
    }
    // Functional: 12 Qs
    for (let i = 0; i < 12; i++) {
      const id = `func_${i}`;
      fullSessionItems.push({ ...mockItem, item_id: id, domain: 'functional_skills' });
      ptsMap[id] = 25 / 12;
    }
    // Communication: 10 Qs
    for (let i = 0; i < 10; i++) {
      const id = `comm_${i}`;
      fullSessionItems.push({ ...mockItem, item_id: id, domain: 'communication_level' });
      ptsMap[id] = 20 / 10;
    }
    // Behavioral: 8 Qs
    for (let i = 0; i < 8; i++) {
      const id = `beh_${i}`;
      fullSessionItems.push({ ...mockItem, item_id: id, domain: 'behavioral_readiness' });
      ptsMap[id] = 15 / 8;
    }
    // Fine Motor: 8 Qs
    for (let i = 0; i < 8; i++) {
      const id = `motor_${i}`;
      fullSessionItems.push({ ...mockItem, item_id: id, domain: 'fine_motor_technology' });
      ptsMap[id] = 15 / 8;
    }

    const domainScores = ScoringEngine.calculateDomainScores(fullSessionItems, ptsMap);
    const totalScore = ScoringEngine.calculateTotalScore(domainScores);
    const placement = PlacementEngine.evaluatePlacement(totalScore, domainScores, fullSessionItems, '2.0');

    expect(totalScore).toBe(100);
    expect(placement.baseTrack).toBe('L4 Career Ready');
    expect(placement.qualifiesForCodingChallenge).toBe(true);
    expect(placement.flags).toHaveLength(0);
  });
});
