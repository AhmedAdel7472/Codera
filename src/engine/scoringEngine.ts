// ---------------------------------------------------------------------------
// CodeRa Assessment Platform — Scoring Engine  v2.0
// ---------------------------------------------------------------------------
// Changes from v1:
//   • DOMAIN_CONFIG question counts updated: 15/15/10/10/10 → 12/12/10/8/8
//     (50 total; domain weights and max scores unchanged)
//   • FORMAT_CONFIG added for Schema-B format-weighted aggregation
//   • calculateFormatScores() added
//   • calculateItemScore() unchanged (formula is schema-version-agnostic)
// ---------------------------------------------------------------------------

import {
  AssessmentDomain,
  QuestionFormat,
  DomainScore,
  FormatScore,
  ItemTelemetry,
} from './telemetrySchema';

// ---------------------------------------------------------------------------
// Domain configuration — Schema A (domain-based allocation)
// ---------------------------------------------------------------------------
export const DOMAIN_CONFIG: Record<
  AssessmentDomain,
  {
    name: string;
    weight: number;
    maxScore: number;
    questionCount: number;
    recommendedTimeMin: number;
  }
> = {
  cognitive_ability:    { name: 'Cognitive Ability',              weight: 0.25, maxScore: 25, questionCount: 12, recommendedTimeMin: 15 },
  functional_skills:    { name: 'Functional Abilities',           weight: 0.25, maxScore: 25, questionCount: 12, recommendedTimeMin: 15 },
  communication_level:  { name: 'Communication Level',            weight: 0.20, maxScore: 20, questionCount: 10, recommendedTimeMin: 12 },
  behavioral_readiness: { name: 'Behavioral & Learning Readiness',weight: 0.15, maxScore: 15, questionCount:  8, recommendedTimeMin: 10 },
  fine_motor_technology:{ name: 'Fine Motor & Technology Skills', weight: 0.15, maxScore: 15, questionCount:  8, recommendedTimeMin: 10 },
};

// ---------------------------------------------------------------------------
// Format configuration — Schema B (format-based weighting)
// ---------------------------------------------------------------------------
export const FORMAT_CONFIG: Record<
  QuestionFormat,
  { label: string; weight: number; targetQuestionCount: number }
> = {
  structured:       { label: 'Structured Questions',  weight: 0.40, targetQuestionCount: 20 },
  performance:      { label: 'Performance Tasks',     weight: 0.30, targetQuestionCount: 15 },
  observation:      { label: 'Observation',           weight: 0.20, targetQuestionCount: 10 },
  coding_challenge: { label: 'Coding Challenge',      weight: 0.10, targetQuestionCount:  5 },
};

// ---------------------------------------------------------------------------
// Total question count for the base assessment (excludes coding challenge)
// ---------------------------------------------------------------------------
export const TOTAL_BASE_QUESTIONS = 50;
export const PART_ONE_QUESTIONS = 25;   // Q1–Q25
export const PART_TWO_QUESTIONS = 25;   // Q26–Q50

// ---------------------------------------------------------------------------
// Item-level scoring formula (unchanged from v1 — schema-agnostic)
// ---------------------------------------------------------------------------
export class ScoringEngine {
  /**
   * Calculates raw item score Q_i out of itemMaxPts.
   *
   *   Q_i = itemMaxPts × accuracy × multiplier_time × multiplier_hints × multiplier_attempts
   *
   * Multipliers:
   *   time    : max(0.7, 1.0 − 0.1 × max(0, (T_actual − T_exp) / T_exp))
   *   hints   : max(0.5, 1.0 − 0.15 × N_hints)
   *   attempts: max(0.6, 1.0 − 0.10 × (N_attempts − 1))
   */
  public static calculateItemScore(item: ItemTelemetry, itemMaxPts: number = 2.0): number {
    if (!item.is_correct && item.accuracy_score === 0) return 0;

    const accuracy = Math.max(0, Math.min(1.0, item.accuracy_score));

    const expectedMs = item.expected_time_ms || 90_000;
    const timeRatio  = Math.max(0, (item.response_time_ms - expectedMs) / Math.max(1_000, expectedMs));
    const multiplierTime     = Math.max(0.7, 1.0 - 0.1  * timeRatio);
    const multiplierHints    = Math.max(0.5, 1.0 - 0.15 * item.hints_used);
    const multiplierAttempts = Math.max(0.6, 1.0 - 0.10 * Math.max(0, item.attempts_count - 1));

    const rawPoints = itemMaxPts * accuracy * multiplierTime * multiplierHints * multiplierAttempts;
    return Math.max(0, Math.min(itemMaxPts, Math.round(rawPoints * 10) / 10));
  }

  // ---------------------------------------------------------------------------
  // Domain scores (Schema A aggregation)
  // ---------------------------------------------------------------------------
  public static calculateDomainScores(
    items: ItemTelemetry[],
    itemMaxPtsMap?: Record<string, number>,
  ): Record<AssessmentDomain, DomainScore> {
    const domains = Object.keys(DOMAIN_CONFIG) as AssessmentDomain[];
    const result: Record<string, DomainScore> = {};

    for (const domainKey of domains) {
      const config = DOMAIN_CONFIG[domainKey];
      const domainItems = items.filter(i => i.domain === domainKey);

      if (domainItems.length === 0) {
        result[domainKey] = {
          domain: domainKey,
          domain_name: config.name,
          weight_pct: config.weight * 100,
          max_score: config.maxScore,
          raw_accuracy_pct: 0,
          efficiency_index: 0,
          earned_score: 0,
          skills_breakdown: {},
        };
        continue;
      }

      let totalEarnedDomainPts = 0;
      let totalAcc = 0;
      const skillsMap: Record<string, { totalEarnedRatio: number; count: number }> = {};

      for (const item of domainItems) {
        const maxPts  = itemMaxPtsMap?.[item.item_id] ?? 2.0;
        const itemPts = this.calculateItemScore(item, maxPts);
        totalEarnedDomainPts += itemPts;
        totalAcc += item.accuracy_score;

        if (!skillsMap[item.skill]) skillsMap[item.skill] = { totalEarnedRatio: 0, count: 0 };
        skillsMap[item.skill].totalEarnedRatio += itemPts / Math.max(0.1, maxPts);
        skillsMap[item.skill].count += 1;
      }

      const count       = domainItems.length;
      const avgAcc      = (totalAcc / count) * 100;
      const earnedScore = Math.min(config.maxScore, Math.round(totalEarnedDomainPts * 10) / 10);

      const skillsBreakdown: Record<string, number> = {};
      for (const [skill, val] of Object.entries(skillsMap)) {
        skillsBreakdown[skill] = Math.round((val.totalEarnedRatio / val.count) * 100);
      }

      result[domainKey] = {
        domain: domainKey,
        domain_name: config.name,
        weight_pct: config.weight * 100,
        max_score: config.maxScore,
        raw_accuracy_pct: Math.round(avgAcc),
        efficiency_index: Math.round((earnedScore / config.maxScore) * 100) / 100,
        earned_score: earnedScore,
        skills_breakdown: skillsBreakdown,
      };
    }

    return result as Record<AssessmentDomain, DomainScore>;
  }

  // ---------------------------------------------------------------------------
  // Format scores (Schema B aggregation) — NEW in v2
  //
  // For each format bucket, we compute:
  //   raw_accuracy_pct — mean accuracy across items in that format
  //   earned_contribution — raw_accuracy × format_weight × 100
  //     (so all four contributions sum to the total score when multiplied by accuracy)
  // ---------------------------------------------------------------------------
  public static calculateFormatScores(
    items: ItemTelemetry[],
    itemMaxPtsMap?: Record<string, number>,
  ): Record<QuestionFormat, FormatScore> {
    const formats = Object.keys(FORMAT_CONFIG) as QuestionFormat[];
    const result: Record<string, FormatScore> = {};

    for (const fmt of formats) {
      const config     = FORMAT_CONFIG[fmt];
      const fmtItems   = items.filter(i => i.format === fmt);

      if (fmtItems.length === 0) {
        result[fmt] = {
          format: fmt,
          weight_pct: config.weight * 100,
          question_count: 0,
          raw_accuracy_pct: 0,
          earned_contribution: 0,
        };
        continue;
      }

      let totalPtsEarned = 0;
      let totalPtsMax    = 0;
      let totalAcc       = 0;

      for (const item of fmtItems) {
        const maxPts  = itemMaxPtsMap?.[item.item_id] ?? 2.0;
        const itemPts = this.calculateItemScore(item, maxPts);
        totalPtsEarned += itemPts;
        totalPtsMax    += maxPts;
        totalAcc       += item.accuracy_score;
      }

      const count          = fmtItems.length;
      const avgAccPct      = Math.round((totalAcc / count) * 100);
      const earnedRatio    = totalPtsMax > 0 ? totalPtsEarned / totalPtsMax : 0;
      const contribution   = Math.round(earnedRatio * config.weight * 100 * 10) / 10;

      result[fmt] = {
        format: fmt,
        weight_pct: config.weight * 100,
        question_count: count,
        raw_accuracy_pct: avgAccPct,
        earned_contribution: contribution,
      };
    }

    return result as Record<QuestionFormat, FormatScore>;
  }

  // ---------------------------------------------------------------------------
  // Total Technology Readiness Score (0–100)
  // ---------------------------------------------------------------------------
  public static calculateTotalScore(
    domainScores: Record<AssessmentDomain, DomainScore>,
  ): number {
    let total = 0;
    for (const ds of Object.values(domainScores)) {
      total += ds.earned_score;
    }
    return Math.min(100, Math.round(total * 10) / 10);
  }

  // ---------------------------------------------------------------------------
  // Coding Readiness sub-score (0–100) — NEW in v2
  // Average accuracy across all items tagged with coding-readiness skills
  // ---------------------------------------------------------------------------
  public static calculateCodingReadinessScore(items: ItemTelemetry[]): number {
    const codingSkills = new Set([
      'algorithmic_thinking',
      'if_then_logic',
      'repetition_patterns',
      'sequencing',
      'cause_and_effect',
      'pattern_recognition',
      'logical_reasoning',
    ]);

    const crItems = items.filter(i => codingSkills.has(i.skill));
    if (crItems.length === 0) return 0;

    const avgAcc = crItems.reduce((acc, i) => acc + i.accuracy_score, 0) / crItems.length;
    return Math.round(avgAcc * 100);
  }
}
