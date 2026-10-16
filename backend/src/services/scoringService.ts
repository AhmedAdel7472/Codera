import {
  AssessmentDomain,
  ItemTelemetry,
  DomainScore,
  QuestionFormat,
  FormatScore,
  StudentSessionTelemetry,
} from '../types/telemetrySchema.js';

export interface DomainConfig {
  weight_pct: number;
  max_score: number;
  question_count: number;
  name: string;
}

export const DOMAIN_CONFIGS: Record<AssessmentDomain, DomainConfig> = {
  cognitive_ability: {
    weight_pct: 25,
    max_score: 25,
    question_count: 5,
    name: 'Cognitive Ability',
  },
  functional_skills: {
    weight_pct: 25,
    max_score: 25,
    question_count: 5,
    name: 'Functional Skills',
  },
  communication_level: {
    weight_pct: 20,
    max_score: 20,
    question_count: 4,
    name: 'Communication Level',
  },
  behavioral_readiness: {
    weight_pct: 15,
    max_score: 15,
    question_count: 3,
    name: 'Behavioral Readiness',
  },
  fine_motor_technology: {
    weight_pct: 15,
    max_score: 15,
    question_count: 3,
    name: 'Fine Motor & Technology',
  },
};

export class ScoringService {
  /**
   * Calculate single item raw score [0, 5]
   */
  public calculateItemScore(item: ItemTelemetry): number {
    const accuracy = Math.max(0, Math.min(1, item.accuracy_score ?? (item.is_correct ? 1 : 0)));
    if (accuracy === 0) return 0;

    // Time multiplier: max(0.7, 1.0 - 0.1 * max(0, (T_actual - T_expected) / T_expected))
    let timeMultiplier = 1.0;
    if (item.expected_time_ms > 0 && item.response_time_ms > item.expected_time_ms) {
      const overtimeRatio = (item.response_time_ms - item.expected_time_ms) / item.expected_time_ms;
      timeMultiplier = Math.max(0.7, 1.0 - 0.1 * overtimeRatio);
    }

    // Hints multiplier: max(0.5, 1.0 - 0.15 * N_hints)
    const hintMultiplier = Math.max(0.5, 1.0 - 0.15 * (item.hints_used || 0));

    // Attempts multiplier: max(0.6, 1.0 - 0.10 * (N_attempts - 1))
    const attempts = Math.max(1, item.attempts_count || 1);
    const attemptMultiplier = Math.max(0.6, 1.0 - 0.10 * (attempts - 1));

    return parseFloat((5.0 * accuracy * timeMultiplier * hintMultiplier * attemptMultiplier).toFixed(2));
  }

  /**
   * Re-computes and verifies the complete score breakdown on the server
   */
  public verifySessionScores(session: StudentSessionTelemetry): StudentSessionTelemetry {
    const domainScores: Record<AssessmentDomain, DomainScore> = {} as any;
    const formatScores: Record<QuestionFormat, FormatScore> = {
      structured: { format: 'structured', weight_pct: 40, question_count: 0, raw_accuracy_pct: 0, earned_contribution: 0 },
      performance: { format: 'performance', weight_pct: 30, question_count: 0, raw_accuracy_pct: 0, earned_contribution: 0 },
      observation: { format: 'observation', weight_pct: 20, question_count: 0, raw_accuracy_pct: 0, earned_contribution: 0 },
      coding_challenge: { format: 'coding_challenge', weight_pct: 10, question_count: 0, raw_accuracy_pct: 0, earned_contribution: 0 },
    };

    let totalEarned = 0;

    for (const [domainKey, config] of Object.entries(DOMAIN_CONFIGS) as [AssessmentDomain, DomainConfig][]) {
      const itemsInDomain = session.item_telemetries.filter(i => i.domain === domainKey);
      let domainEarned = 0;
      let totalAcc = 0;
      const skillsMap: Record<string, { total: number; count: number }> = {};

      itemsInDomain.forEach(item => {
        const itemEarned = this.calculateItemScore(item);
        domainEarned += itemEarned;
        totalAcc += item.accuracy_score;

        const skill = item.skill || 'general';
        if (!skillsMap[skill]) skillsMap[skill] = { total: 0, count: 0 };
        skillsMap[skill].total += item.accuracy_score;
        skillsMap[skill].count += 1;

        // Tally formats
        const fmt = item.format || 'structured';
        if (formatScores[fmt]) {
          formatScores[fmt].question_count += 1;
          formatScores[fmt].raw_accuracy_pct += item.accuracy_score;
        }
      });

      const count = itemsInDomain.length || 1;
      const rawAccPct = Math.round((totalAcc / count) * 100);
      const skillsBreakdown: Record<string, number> = {};
      for (const [s, data] of Object.entries(skillsMap)) {
        skillsBreakdown[s] = Math.round((data.total / data.count) * 100);
      }

      domainScores[domainKey] = {
        domain: domainKey,
        domain_name: config.name,
        weight_pct: config.weight_pct,
        max_score: config.max_score,
        raw_accuracy_pct: rawAccPct,
        efficiency_index: parseFloat((domainEarned / config.max_score).toFixed(2)),
        earned_score: parseFloat(domainEarned.toFixed(2)),
        skills_breakdown: skillsBreakdown,
      };

      totalEarned += domainEarned;
    }

    session.domain_scores = domainScores;
    session.total_score = Math.min(100, Math.round(totalEarned));
    session.format_scores = formatScores;

    return session;
  }
}

export const scoringService = new ScoringService();
