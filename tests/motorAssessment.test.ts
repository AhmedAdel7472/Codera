import { describe, it, expect } from 'vitest';
import { MOTOR_ASSESSMENT_TASKS } from '../src/motor/taskDefinitions';
import { MotorScoringEngine } from '../src/motor/motorScoring';
import { OneEuroFilter } from '../src/motor/trackerService';
import { MotorTaskResult } from '../src/motor/types';

describe('Motor Assessment (Camera & Hand Tracking)', () => {
  it('defines exactly 25 tasks with proper section distribution', () => {
    expect(MOTOR_ASSESSMENT_TASKS.length).toBe(25);

    const postureTasks = MOTOR_ASSESSMENT_TASKS.filter(t => t.section === 'posture');
    const wristTasks = MOTOR_ASSESSMENT_TASKS.filter(t => t.section === 'wrist');
    const fingerTasks = MOTOR_ASSESSMENT_TASKS.filter(t => t.section === 'fingers');
    const coordTasks = MOTOR_ASSESSMENT_TASKS.filter(t => t.section === 'coordination');

    expect(postureTasks.length).toBe(3);
    expect(wristTasks.length).toBe(4);
    expect(fingerTasks.length).toBe(8);
    expect(coordTasks.length).toBe(10);

    // Verify slots are 1 to 25 sequentially
    const slots = MOTOR_ASSESSMENT_TASKS.map(t => t.slot);
    expect(slots).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it('includes interactive game type for memory sequence in slot 25', () => {
    const task25 = MOTOR_ASSESSMENT_TASKS.find(t => t.slot === 25);
    expect(task25).toBeDefined();
    expect(task25?.id).toBe('motor_coord_10');
    expect(task25?.interactiveGameType).toBe('memory_sequence');
  });

  it('calculates weighted score using 10/25/35/30 section weights', () => {
    // Generate synthetic results with perfect 5/5 score
    const perfectResults: MotorTaskResult[] = MOTOR_ASSESSMENT_TASKS.map(task => ({
      task,
      score: 5,
      accuracy: 1.0,
      speedRating: 1.0,
      steadinessRating: 0.95,
      rangeOfMotionDeg: 120,
      completedAt: Date.now(),
      durationMs: 4000,
      attemptsCount: 1,
      parentVerifiedFallback: false,
      notesAr: ['تم التحقق آليًا بدقة.'],
      handTested: 'اليمين',
    }));

    const report = MotorScoringEngine.computeReport('Test Child', perfectResults, 60000);
    expect(report.overallScore).toBe(100);
    expect(report.mouseReadiness.ready).toBe(true);
    expect(report.keyboardReadiness.ready).toBe(true);
    expect(report.sectionScores.posture.percentage).toBe(100);
    expect(report.sectionScores.wrist.percentage).toBe(100);
    expect(report.sectionScores.fingers.percentage).toBe(100);
    expect(report.sectionScores.coordination.percentage).toBe(100);
  });

  it('computes real asymmetry when Right and Left hand tasks differ', () => {
    const asymResults: MotorTaskResult[] = MOTOR_ASSESSMENT_TASKS.map(task => ({
      task,
      score: task.slot <= 12 ? 5 : 2.5,
      accuracy: 0.9,
      speedRating: 0.8,
      steadinessRating: 0.85,
      rangeOfMotionDeg: 100,
      completedAt: Date.now(),
      durationMs: 5000,
      attemptsCount: 1,
      parentVerifiedFallback: false,
      notesAr: [],
      handTested: task.slot % 2 === 1 ? 'اليمين' : 'اليسار',
    }));

    const report = MotorScoringEngine.computeReport('Asymmetry Test', asymResults, 80000);
    expect(report.asymmetryIndex).toBeDefined();
    expect(['اليمين', 'اليسار', 'متوازن']).toContain(report.asymmetryIndex.dominantHand);
    expect(typeof report.asymmetryIndex.asymmetryPercent).toBe('number');
  });

  it('smooths coordinates with OneEuroFilter without lag or distortion', () => {
    const filter = new OneEuroFilter(1.2, 0.006, 1.0);
    let t = 0;
    // Initial value
    const v1 = filter.filter(0.5, t);
    expect(v1).toBe(0.5);

    // Minor jitter around 0.5: filter dampens it
    t += 33;
    const v2 = filter.filter(0.52, t);
    expect(v2).toBeGreaterThan(0.5);
    expect(v2).toBeLessThan(0.52);

    // Fast intentional movement to 0.9: filter tracks smoothly forward
    t += 33;
    const v3 = filter.filter(0.9, t);
    expect(v3).toBeGreaterThan(0.55);
  });
});
