// ---------------------------------------------------------------------------
// CodeRA Platform — Motor Assessment Types (Backend)
// ---------------------------------------------------------------------------

export type MotorSection = 'posture' | 'wrist' | 'fingers' | 'coordination';

export interface MotorTaskDefinition {
  id: string;
  slot: number;
  section: MotorSection;
  sectionTitleAr: string;
  titleAr: string;
  titleEn: string;
  requiredActionAr: string;
  observationCriterionAr: string;
  targetDurationSec: number;
  minHoldDurationSec?: number;
  repetitionsRequired?: number;
  cameraDistancePromptAr?: string;
  allowParentVerificationFallback?: boolean;
}

export interface MotorTaskResult {
  task: MotorTaskDefinition;
  score: number; // 0 to 5 points
  accuracy: number; // 0 to 1
  speedRating: number; // 0 to 1
  steadinessRating: number; // 0 to 1 (stability)
  rangeOfMotionDeg: number;
  completedAt: number;
  durationMs: number;
  attemptsCount: number;
  parentVerifiedFallback: boolean;
  notesAr: string[];
  handTested?: 'اليمين' | 'اليسار' | 'كلتا اليدين';
}

export interface MotorAssessmentReportData {
  studentName: string;
  sessionTimestamp: number;
  totalDurationMs: number;
  overallScore: number; // 0 to 100
  sectionScores: {
    posture: { score: number; max: number; percentage: number };
    wrist: { score: number; max: number; percentage: number };
    fingers: { score: number; max: number; percentage: number };
    coordination: { score: number; max: number; percentage: number };
  };
  mouseReadiness: {
    ready: boolean;
    rating: 'متقدم' | 'مؤهل' | 'يحتاج دعم تدريبي' | 'غير مؤهل حاليًا';
    score: number; // 0 to 100
    points: string[];
  };
  keyboardReadiness: {
    ready: boolean;
    rating: 'متقدم' | 'مؤهل' | 'يحتاج دعم تدريبي' | 'غير مؤهل حاليًا';
    score: number; // 0 to 100
    points: string[];
  };
  asymmetryIndex: {
    dominantHand: 'اليمين' | 'اليسار' | 'متوازن';
    asymmetryPercent: number;
    descriptionAr: string;
  };
  tremorAndStability: {
    rating: 'ممتاز' | 'مستقر' | 'رعشة خفيفة' | 'تشتت حركي ملحوظ';
    tremorScore: number;
    descriptionAr: string;
  };
  targetedSupportFlags: string[];
  recommendationsAr: string[];
  taskResults: MotorTaskResult[];
}
