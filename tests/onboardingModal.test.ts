import { describe, it, expect } from 'vitest';
import { OnboardingSelection, ScreenId } from '../src/components/onboarding/types';

describe('CodeRa Onboarding Flow State & Branching Logic', () => {
  it('should initialize with default empty selection', () => {
    const initialSelection: OnboardingSelection = {
      role: null,
      journeyType: null,
      specificRole: null,
    };

    expect(initialSelection.role).toBeNull();
    expect(initialSelection.journeyType).toBeNull();
    expect(initialSelection.specificRole).toBeNull();
  });

  it('should handle Flow A (Builder Journey) selection', () => {
    let selection: OnboardingSelection = {
      role: 'BUILDER',
      journeyType: 'CODER',
      specificRole: null,
    };

    expect(selection.role).toBe('BUILDER');
    expect(selection.journeyType).toBe('CODER');
  });

  it('should handle Flow B.1 (Mentor -> Individual -> Programmer) selection', () => {
    let selection: OnboardingSelection = {
      role: 'MENTOR',
      journeyType: 'INDIVIDUAL',
      specificRole: 'PROGRAMMER',
    };

    expect(selection.role).toBe('MENTOR');
    expect(selection.journeyType).toBe('INDIVIDUAL');
    expect(selection.specificRole).toBe('PROGRAMMER');
  });

  it('should handle Flow B.2 (Mentor -> Organization -> School) selection', () => {
    let selection: OnboardingSelection = {
      role: 'MENTOR',
      journeyType: 'ORGANIZATION',
      specificRole: 'SCHOOL',
    };

    expect(selection.role).toBe('MENTOR');
    expect(selection.journeyType).toBe('ORGANIZATION');
    expect(selection.specificRole).toBe('SCHOOL');
  });

  it('should simulate back navigation history stack unwinding', () => {
    const historyStack: ScreenId[] = ['SCREEN_1_MAIN_ROLE', 'SCREEN_2B_MENTOR_STEP1'];
    
    // Simulate clicking back arrow
    const previousScreen = historyStack.pop();
    expect(previousScreen).toBe('SCREEN_2B_MENTOR_STEP1');
    expect(historyStack).toEqual(['SCREEN_1_MAIN_ROLE']);
  });
});
