import { StudentSessionTelemetry } from '../types/telemetrySchema.js';

export interface TrackRecommendation {
  primaryTrack: string;
  recommendedTrack: string;
  flags: string[];
  description: string;
}

export class PlacementService {
  public determinePlacement(session: StudentSessionTelemetry): TrackRecommendation {
    const score = session.total_score;
    const flags: string[] = [];

    let track = 'Explorer';
    let description = 'Foundational digital literacy, spatial puzzles, block basics.';

    if (score >= 91) {
      track = 'Future Engineer';
      description = 'Advanced computational thinking, text-based code transition, AI fundamentals.';
    } else if (score >= 76) {
      track = 'Innovator';
      description = 'Complex logic, visual script automation, problem-solving.';
    } else if (score >= 51) {
      track = 'Creator';
      description = 'Multi-step logic, intermediate block coding, sensor interaction.';
    } else if (score >= 26) {
      track = 'Builder';
      description = 'Structured block programming, basic robotics navigation.';
    }

    // Safety checks on specific domains
    const motorDomain = session.domain_scores?.fine_motor_technology;
    if (motorDomain && motorDomain.raw_accuracy_pct < 40) {
      flags.push('Low Motor Precision: Recommend assistive touch/mouse accommodation');
    }

    const commDomain = session.domain_scores?.communication_level;
    if (commDomain && commDomain.raw_accuracy_pct < 40) {
      flags.push('Communication Support: Visual instructions recommended over audio');
    }

    return {
      primaryTrack: track,
      recommendedTrack: track,
      flags,
      description
    };
  }
}

export const placementService = new PlacementService();
