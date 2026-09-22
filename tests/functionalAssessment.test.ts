import { describe, it, expect } from 'vitest';
import {
  FUNCTIONAL_ASSESSMENT_BASELINES,
  FUNCTIONAL_25_TASK_CONFIGS,
  ASSESSMENT2_TASK_BLUEPRINTS,
  ActivityGenerator
} from '../src/ai/activityGenerator';

describe('Assessment 2: Functional Assessment (25 Tasks)', () => {
  it('has exactly 25 task baselines with valid domain and slots 1 to 25', () => {
    expect(FUNCTIONAL_ASSESSMENT_BASELINES.length).toBe(25);
    FUNCTIONAL_ASSESSMENT_BASELINES.forEach((b, index) => {
      expect(b.slot).toBe(index + 1);
      expect(b.domain).toBe('functional_skills');
      expect(b.title).toContain(`Task ${index + 1}:`);
      expect(b.baselinePrompt.length).toBeGreaterThan(10);
      expect(b.maxPoints).toBeGreaterThanOrEqual(1);
    });
  });

  it('has exactly 25 procedural task fallback configurations with 3 options and 1 correct answer', () => {
    for (let slot = 1; slot <= 25; slot++) {
      const config = FUNCTIONAL_25_TASK_CONFIGS[slot];
      expect(config).toBeDefined();
      expect(config.instructions).toContain(`Task ${slot}`);
      expect(config.options).toBeDefined();
      expect(config.options.length).toBe(3);

      const correctCount = config.options.filter(opt => opt.correct).length;
      expect(correctCount).toBe(1);

      config.options.forEach(opt => {
        expect(opt.label.trim().length).toBeGreaterThan(0);
      });

      expect(config.hint.length).toBeGreaterThan(5);
    }
  });

  it('has exactly 25 task blueprints with locked concepts and variation strategies', () => {
    expect(ASSESSMENT2_TASK_BLUEPRINTS.length).toBe(25);
    ASSESSMENT2_TASK_BLUEPRINTS.forEach((bp, index) => {
      expect(bp.taskNumber).toBe(index + 1);
      expect(bp.taskName.length).toBeGreaterThan(0);
      expect(bp.skillArea.length).toBeGreaterThan(0);
      expect(bp.cognitiveBlueprint.length).toBeGreaterThan(20);
      expect(bp.variationStrategy.length).toBeGreaterThan(20);
      expect(bp.slotMapping).toEqual([index + 1]);
    });
  });

  it('generates fully populated ActivityItems for functional_skills mode', async () => {
    const generator = new ActivityGenerator();
    
    // Test a sample of slots in functional_skills mode
    const testSlots = [1, 5, 10, 15, 20, 25];
    for (const slot of testSlots) {
      const activity = await generator.generateActivity(slot, undefined, 'functional_skills');
      expect(activity).toBeDefined();
      expect(activity.slot).toBe(slot);
      expect(activity.domain).toBe('functional_skills');
      expect(activity.instructions).toBeTruthy();
      expect(activity.payload).toBeDefined();
      expect(activity.payload.options).toBeDefined();
      expect(activity.payload.options.length).toBe(3);
      expect(activity.payload.options.filter((o: any) => o.correct).length).toBe(1);
    }
  });
});
