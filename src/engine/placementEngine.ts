// ---------------------------------------------------------------------------
// CodeRa Assessment Platform — Placement Engine  v2.0
// ---------------------------------------------------------------------------
// Changes from v1:
//   • Track names renamed: Explorer/Builder/Creator/Innovator → L1–L4
//   • Score thresholds updated: 0-49/50-69/70-84/85-100
//   • qualifiesForCodingChallenge flag added (score ≥ 70)
//   • Safety-override flag descriptions updated to new level names
//   • Schema-version awareness: PlacementResult carries schemaVersion
//   • Legacy (v1) level names exported for backward-compat report rendering
// ---------------------------------------------------------------------------

import { AssessmentDomain, DomainScore, ItemTelemetry } from './telemetrySchema';

// ---------------------------------------------------------------------------
// Level definitions
// ---------------------------------------------------------------------------

/** CodeRa v2 levels */
export const PLACEMENT_LEVELS_V2 = [
  { id: 'L1', name: 'Coder',        minScore:  0, maxScore: 49 },
  { id: 'L2', name: 'Programmer',   minScore: 50, maxScore: 69 },
  { id: 'L3', name: 'Developer',    minScore: 70, maxScore: 84 },
  { id: 'L4', name: 'Career Ready', minScore: 85, maxScore: 100 },
] as const;

/** Legacy Cognix v1 levels — kept for backward-compat report rendering */
export const PLACEMENT_LEVELS_V1 = [
  { name: 'Explorer',        minScore:  0, maxScore: 59 },
  { name: 'Builder',         minScore: 60, maxScore: 74 },
  { name: 'Creator',         minScore: 75, maxScore: 89 },
  { name: 'Innovator',       minScore: 90, maxScore: 100 },
] as const;

/** Minimum score to qualify for the Coding Challenge bonus module */
export const CODING_CHALLENGE_MIN_SCORE = 70;

// ---------------------------------------------------------------------------
// PlacementResult interface
// ---------------------------------------------------------------------------
export interface PlacementResult {
  schemaVersion: '1.0' | '2.0';
  totalScore: number;
  /** e.g. 'L3 Developer' or 'Creator' depending on schema version */
  baseTrack: string;
  recommendedTrack: string;
  /** True if student score ≥ CODING_CHALLENGE_MIN_SCORE (L3 or L4) */
  qualifiesForCodingChallenge: boolean;
  flags: {
    id: string;
    type: 'warning' | 'info' | 'critical';
    title: string;
    description: string;
  }[];
  requiresSupport: boolean;
  performanceIndicators: {
    overallAccuracy: number;
    avgResponseSpeedRatio: number;
    hintDependencyRatio: number;
    adaptabilityIndex: number;
    learningProgressVelocity: 'High' | 'Steady' | 'Needs Practice';
  };
}

// ---------------------------------------------------------------------------
// PlacementEngine
// ---------------------------------------------------------------------------
export class PlacementEngine {
  /**
   * Evaluate placement using the v2 L1–L4 thresholds.
   * For legacy sessions (schemaVersion '1.0'), call evaluatePlacementV1() instead.
   */
  public static evaluatePlacement(
    totalScore: number,
    domainScores: Record<AssessmentDomain, DomainScore>,
    items: ItemTelemetry[],
    schemaVersion: '1.0' | '2.0' = '2.0',
  ): PlacementResult {
    return schemaVersion === '1.0'
      ? this.evaluatePlacementV1(totalScore, domainScores, items)
      : this.evaluatePlacementV2(totalScore, domainScores, items);
  }

  // ---------------------------------------------------------------------------
  // v2 placement (L1–L4, new thresholds)
  // ---------------------------------------------------------------------------
  private static evaluatePlacementV2(
    totalScore: number,
    domainScores: Record<AssessmentDomain, DomainScore>,
    items: ItemTelemetry[],
  ): PlacementResult {
    // Determine base level
    let baseLevel = PLACEMENT_LEVELS_V2[0]; // default L1
    for (const level of PLACEMENT_LEVELS_V2) {
      if (totalScore >= level.minScore && totalScore <= level.maxScore) {
        baseLevel = level;
        break;
      }
    }
    const baseTrack = `${baseLevel.id} ${baseLevel.name}`;

    const flags: PlacementResult['flags'] = [];

    // --- Safety override flags (v2 thresholds) ---

    // 1. Cognitive < 40% of 25 = 10
    const cogScore = domainScores.cognitive_ability?.earned_score ?? 0;
    if (cogScore < 10) {
      flags.push({
        id: 'FLAG_COGNITIVE_DEFICIENCY',
        type: 'critical',
        title: 'Cognitive Foundation Support',
        description:
          'Student demonstrated difficulty with pattern recognition and logical reasoning. ' +
          'Targeted logic-puzzle sessions recommended before advancing to L2 Programmer.',
      });
    }

    // 2. Functional Skills < 40% of 25 = 10
    const funcScore = domainScores.functional_skills?.earned_score ?? 0;
    if (funcScore < 10) {
      flags.push({
        id: 'FLAG_FUNCTIONAL_DEFICIENCY',
        type: 'critical',
        title: 'Multi-Step Mission Support',
        description:
          'Student requires scaffolded instruction following and working-memory exercises. ' +
          'Consider structured task-sequencing activities before L2 Programmer placement.',
      });
    }

    // 3. Communication < 35% of 20 = 7
    const commScore = domainScores.communication_level?.earned_score ?? 0;
    if (commScore < 7) {
      flags.push({
        id: 'FLAG_COMMUNICATION_SUPPORT',
        type: 'warning',
        title: 'Verbal & Visual Comprehension Support',
        description:
          'Audio-visual cues and simplified instructions recommended. ' +
          'Student may benefit from AAC or sign-language support during coding activities.',
      });
    }

    // 4. Behavioral Readiness < 35% of 15 = 5.25
    const behScore = domainScores.behavioral_readiness?.earned_score ?? 0;
    if (behScore < 5.25) {
      flags.push({
        id: 'FLAG_BEHAVIORAL_ADAPTABILITY',
        type: 'warning',
        title: 'Error Recovery & Resilience Support',
        description:
          'Student showed hesitation or frustration during unexpected rule changes. ' +
          'Guided error-recovery feedback and low-stakes practice challenges advised.',
      });
    }

    // 5. Fine Motor / Technology < 35% of 15 = 5.25
    const motorScore = domainScores.fine_motor_technology?.earned_score ?? 0;
    if (motorScore < 5.25) {
      flags.push({
        id: 'FLAG_FINE_MOTOR_SUPPORT',
        type: 'info',
        title: 'Digital Navigation Practice',
        description:
          'Drag-and-drop and target-precision practice recommended. ' +
          'Assistive technology or alternative input devices may improve accessibility.',
      });
    }

    const requiresSupport = flags.some(f => f.type === 'critical');
    const recommendedTrack = requiresSupport && baseLevel.id !== 'L1'
      ? `${baseTrack} (with Targeted Support)`
      : baseTrack;

    const qualifiesForCodingChallenge = totalScore >= CODING_CHALLENGE_MIN_SCORE;

    return {
      schemaVersion: '2.0',
      totalScore,
      baseTrack,
      recommendedTrack,
      qualifiesForCodingChallenge,
      flags,
      requiresSupport,
      performanceIndicators: this.buildPerformanceIndicators(items),
    };
  }

  // ---------------------------------------------------------------------------
  // v1 placement (legacy Explorer/Builder/Creator/Innovator) — unchanged logic
  // Kept so that legacy sessions are never re-evaluated under v2 thresholds.
  // ---------------------------------------------------------------------------
  private static evaluatePlacementV1(
    totalScore: number,
    domainScores: Record<AssessmentDomain, DomainScore>,
    items: ItemTelemetry[],
  ): PlacementResult {
    let baseTrack = 'Explorer';
    if      (totalScore >= 90) baseTrack = 'Innovator';
    else if (totalScore >= 75) baseTrack = 'Creator';
    else if (totalScore >= 60) baseTrack = 'Builder';

    const flags: PlacementResult['flags'] = [];

    const cogScore   = domainScores.cognitive_ability?.earned_score   ?? 0;
    const funcScore  = domainScores.functional_skills?.earned_score   ?? 0;
    const commScore  = domainScores.communication_level?.earned_score ?? 0;
    const behScore   = domainScores.behavioral_readiness?.earned_score ?? 0;
    const motorScore = domainScores.fine_motor_technology?.earned_score ?? 0;

    if (cogScore   < 10)   flags.push({ id: 'FLAG_COGNITIVE_DEFICIENCY',   type: 'critical', title: 'Cognitive Foundation Support',            description: 'Student demonstrated difficulty in pattern recognition and logical reasoning.' });
    if (funcScore  < 10)   flags.push({ id: 'FLAG_FUNCTIONAL_DEFICIENCY',  type: 'critical', title: 'Multi-Step Mission Support',              description: 'Student requires scaffolded instruction following and working memory exercises.' });
    if (commScore  <  7)   flags.push({ id: 'FLAG_COMMUNICATION_SUPPORT',  type: 'warning',  title: 'Verbal & Visual Comprehension Support',   description: 'Audio visual cues and simplified instructions recommended.' });
    if (behScore   <  5.25)flags.push({ id: 'FLAG_BEHAVIORAL_ADAPTABILITY',type: 'warning',  title: 'Error Recovery & Resilience Support',     description: 'Guided error-recovery feedback advised.' });
    if (motorScore <  5.25)flags.push({ id: 'FLAG_FINE_MOTOR_SUPPORT',     type: 'info',     title: 'Digital Navigation Practice',             description: 'Drag-and-drop and target precision practice recommended.' });

    const requiresSupport  = flags.some(f => f.type === 'critical');
    const recommendedTrack = requiresSupport && baseTrack !== 'Explorer'
      ? `${baseTrack} (with Targeted Support)`
      : baseTrack;

    return {
      schemaVersion: '1.0',
      totalScore,
      baseTrack,
      recommendedTrack,
      qualifiesForCodingChallenge: false, // coding challenge did not exist in v1
      flags,
      requiresSupport,
      performanceIndicators: this.buildPerformanceIndicators(items),
    };
  }

  // ---------------------------------------------------------------------------
  // Shared performance indicator calculation (schema-agnostic)
  // ---------------------------------------------------------------------------
  private static buildPerformanceIndicators(
    items: ItemTelemetry[],
  ): PlacementResult['performanceIndicators'] {
    const totalItems   = items.length || 1;
    const correctCount = items.filter(i => i.is_correct).length;
    const totalHints   = items.reduce((acc, i) => acc + i.hints_used, 0);
    const avgSpeedRatio = items.reduce(
      (acc, i) => acc + i.response_time_ms / Math.max(1_000, i.expected_time_ms), 0
    ) / totalItems;

    // Adaptability from behavioral items
    const behavioralItems = items.filter(i => i.domain === 'behavioral_readiness');
    let adaptabilityIndex = 0.75;
    if (behavioralItems.length > 0) {
      adaptabilityIndex = Math.round(
        (behavioralItems.reduce((acc, i) => acc + i.accuracy_score, 0) / behavioralItems.length) * 100
      ) / 100;
    }

    // Velocity: first half vs second half accuracy
    let velocity: 'High' | 'Steady' | 'Needs Practice' = 'Steady';
    if (items.length >= 4) {
      const half           = Math.floor(items.length / 2);
      const firstHalfAcc   = items.slice(0, half).reduce((a, b) => a + b.accuracy_score, 0) / half;
      const secondHalfAcc  = items.slice(half).reduce((a, b) => a + b.accuracy_score, 0) / (items.length - half);
      if (secondHalfAcc - firstHalfAcc > 0.15)  velocity = 'High';
      else if (secondHalfAcc < 0.4)             velocity = 'Needs Practice';
    }

    return {
      overallAccuracy:           Math.round((correctCount / totalItems) * 100),
      avgResponseSpeedRatio:     Math.round(avgSpeedRatio * 100) / 100,
      hintDependencyRatio:       Math.round((totalHints / totalItems) * 100) / 100,
      adaptabilityIndex,
      learningProgressVelocity:  velocity,
    };
  }
}
