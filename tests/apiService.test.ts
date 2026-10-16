import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { apiService } from '../src/services/apiService';
import { StudentSessionTelemetry } from '../src/engine/telemetrySchema';

// Provide localStorage mock for Node test environment
beforeAll(() => {
  let store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
});

describe('Frontend apiService (Offline-First Resilience Layer)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves sessions using localStorage fallback when offline', async () => {
    const dummySession: StudentSessionTelemetry = {
      schema_version: '2.0',
      session_id: 'test_unit_001',
      student_name: 'Sarah Connor',
      age_group: '13-16',
      start_time: new Date().toISOString(),
      item_telemetries: [],
      domain_scores: {} as any,
      total_score: 85,
      placed_track: 'Innovator',
      recommended_track: 'Innovator',
      flags: [],
      question_time_records: [],
      break_events: [],
      total_breaks_count: 0,
      total_break_duration_ms: 0,
      total_active_duration_ms: 100000,
      total_wall_clock_duration_ms: 100000,
      domain_time_summary: {} as any
    };

    const res = await apiService.saveAssessmentSession(dummySession);
    expect(res.success).toBe(true);

    const stored = await apiService.getAllAssessmentSessions();
    expect(stored.length).toBeGreaterThanOrEqual(1);
    expect(stored.find(s => s.session_id === 'test_unit_001')).toBeDefined();
  });

  it('saves and retrieves motor reports correctly', async () => {
    const dummyMotorReport: any = {
      studentName: 'Sarah Connor',
      sessionTimestamp: Date.now(),
      totalDurationMs: 60000,
      overallScore: 92,
      sectionScores: {
        posture: { score: 25, max: 25, percentage: 100 },
        wrist: { score: 23, max: 25, percentage: 92 },
        fingers: { score: 22, max: 25, percentage: 88 },
        coordination: { score: 22, max: 25, percentage: 88 }
      },
      mouseReadiness: { ready: true, rating: 'متقدم', score: 95, points: [] },
      keyboardReadiness: { ready: true, rating: 'متقدم', score: 90, points: [] },
      asymmetryIndex: { dominantHand: 'اليمين', asymmetryPercent: 2, descriptionAr: 'متوازن' },
      tremorAndStability: { rating: 'ممتاز', tremorScore: 98, descriptionAr: 'مستقر' },
      targetedSupportFlags: [],
      recommendationsAr: ['ممتاز'],
      taskResults: []
    };

    const res = await apiService.saveMotorReport(dummyMotorReport);
    expect(res.success).toBe(true);

    const latest = await apiService.getLatestMotorReport();
    expect(latest).not.toBeNull();
    expect(latest?.studentName).toBe('Sarah Connor');
    expect(latest?.overallScore).toBe(92);
  });

  it('saves student profiles to student registry', async () => {
    const dummyProfile = {
      id: 'std_999',
      studentFullName: 'Sarah Connor',
      age: 15,
      gradeLevel: 'Grade 10',
      preferredLanguage: 'ar'
    };

    const res = await apiService.saveStudentProfile(dummyProfile);
    expect(res.success).toBe(true);

    const registry = await apiService.getStudentRegistry();
    expect(registry.length).toBeGreaterThanOrEqual(1);
    expect(registry.some((s: any) => s.studentFullName === 'Sarah Connor')).toBe(true);
  });
});
