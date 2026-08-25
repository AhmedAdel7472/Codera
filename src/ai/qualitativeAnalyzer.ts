import { StudentSessionTelemetry } from '../engine/telemetrySchema';
import { PlacementResult } from '../engine/placementEngine';
import { AzureOpenAIClient } from './azureOpenAIClient';

export class QualitativeAnalyzer {
  private client: AzureOpenAIClient;

  constructor() {
    this.client = new AzureOpenAIClient();
  }

  /**
   * Generates a comprehensive qualitative assessment report using telemetry metrics.
   */
  public async generateReportSummary(
    session: StudentSessionTelemetry,
    placement: PlacementResult
  ): Promise<string> {
    const domainSummaryStr = Object.values(session.domain_scores || {})
      .map(d => `${d.domain_name}: ${d.earned_score}/${d.max_score} (${Math.round((d.earned_score/d.max_score)*100)}%)`)
      .join(', ');

    const prompt = `Analyze this student assessment telemetry and provide a detailed 4-paragraph diagnostic report:
Student Name: ${session.student_name}
Overall Score: ${placement.totalScore}/100
Placed Level: ${placement.recommendedTrack}
Accuracy: ${placement.performanceIndicators.overallAccuracy}%
Adaptability Index: ${placement.performanceIndicators.adaptabilityIndex}
Learning Velocity: ${placement.performanceIndicators.learningProgressVelocity}
Domain Scores: ${domainSummaryStr}
Timeouts Count: ${session.question_time_records?.filter(r => r?.timedOut).length || 0}
Total Active Time: ${Math.round((session.total_active_duration_ms || 0)/60000)} mins
Flags: ${placement.flags.map(f => `${f.title}: ${f.description}`).join(' | ') || 'None'}

Include:
1. Executive Diagnostic Summary
2. Domain-by-Domain Performance Analysis (mentioning specific weak/strong domains)
3. Behavioral & Motor Skills Observations (latency, timeouts, hesitation)
4. Specific SEN Accommodations & Action Plan for Educator/Parent.`;

    const aiText = await this.client.generateCompletion(
      prompt,
      'You are an expert educational psychologist and SEN assessment specialist. Provide detailed, compassionate, highly specific diagnostic reports.'
    );

    if (aiText && aiText.length > 200) {
      return aiText;
    }

    // Dynamic, data-driven diagnostic report
    return this.getBuiltInReport(session, placement);
  }

  private getBuiltInReport(session: StudentSessionTelemetry, placement: PlacementResult): string {
    const { totalScore, recommendedTrack, performanceIndicators, flags } = placement;

    const domainScores = Object.values(session.domain_scores || {});
    const sortedDomains = [...domainScores].sort((a, b) => {
      const pctA = a.max_score > 0 ? a.earned_score / a.max_score : 0;
      const pctB = b.max_score > 0 ? b.earned_score / b.max_score : 0;
      return pctB - pctA;
    });

    const topDomain = sortedDomains[0];
    const lowestDomain = sortedDomains[sortedDomains.length - 1];

    const topPct = topDomain && topDomain.max_score > 0 ? Math.round((topDomain.earned_score / topDomain.max_score) * 100) : 0;
    const lowPct = lowestDomain && lowestDomain.max_score > 0 ? Math.round((lowestDomain.earned_score / lowestDomain.max_score) * 100) : 0;

    const timeRecords = session.question_time_records || [];
    const timedOutCount = timeRecords.filter(r => r?.timedOut).length;
    const avgLatencySec = timeRecords.length > 0
      ? (timeRecords.reduce((acc, r) => acc + (r?.responseLatencyMs || 0), 0) / timeRecords.length / 1000).toFixed(1)
      : '0';

    let summary = `### Executive Diagnostic Summary\n`;
    summary += `**${session.student_name}** has completed the 60-question Cognix SEN Assessment, achieving an overall **Readiness Score of ${totalScore}/100**. Based on comprehensive telemetry, the student is placed into **${recommendedTrack}**.\n\n`;

    summary += `### Domain-by-Domain Analysis\n`;
    summary += `- **Primary Strength**: **${topDomain?.domain_name || 'Cognitive Skills'}** (${topPct}% mastery). Demonstrates confident grasp of these core concepts.\n`;
    summary += `- **Primary Growth Area**: **${lowestDomain?.domain_name || 'Fine Motor'}** (${lowPct}% mastery). Benefits from targeted support and scaffolded practice in this area.\n\n`;

    summary += `### Behavioral & Cognitive Telemetry Observations\n`;
    summary += `Across the 60 assessment items, average initial response latency was **${avgLatencySec} seconds**. `;

    if (timedOutCount > 0) {
      summary += `The student experienced **${timedOutCount} countdown timeouts**, suggesting potential processing fatigue or hesitation during multi-step tasks. `;
    } else {
      summary += `The student maintained active pacing with **0 timeouts**, showing sustained attention throughout the assessment. `;
    }

    summary += `Adaptability Index recorded at **${performanceIndicators.adaptabilityIndex}** with a **${performanceIndicators.learningProgressVelocity}** velocity.\n\n`;

    summary += `### Recommended Educational Accommodations & Action Plan\n`;
    if (lowPct < 60) {
      summary += `1. **Scaffolded Learning**: Break complex multi-step instructions into single 1-step visual prompts.\n`;
      summary += `2. **Sensory & Pace Support**: Allow 10-second processing buffers before prompting for responses.\n`;
    } else {
      summary += `1. **Accelerated Challenges**: Provide multi-step logic and independent coding challenges.\n`;
    }

    if (flags.length > 0) {
      summary += `\n> [!WARNING]\n> **Identified Support Flags**: ${flags.map(f => f.title).join(' • ')}.`;
    } else {
      summary += `\n> [!TIP]\n> **Exceptional Performance**: Student displayed balanced competence across all 5 evaluation domains.`;
    }

    return summary;
  }
}

