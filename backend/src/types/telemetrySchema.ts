// ---------------------------------------------------------------------------
// CodeRa Assessment Platform — Backend Telemetry Schema v2.0
// ---------------------------------------------------------------------------

export type AssessmentDomain =
  | 'cognitive_ability'
  | 'functional_skills'
  | 'communication_level'
  | 'behavioral_readiness'
  | 'fine_motor_technology';

export type QuestionFormat =
  | 'structured'
  | 'performance'
  | 'observation'
  | 'coding_challenge';

export type SkillName =
  | 'pattern_recognition'
  | 'logical_reasoning'
  | 'sequencing'
  | 'classification'
  | 'cause_and_effect'
  | 'visual_memory'
  | 'algorithmic_thinking'
  | 'if_then_logic'
  | 'repetition_patterns'
  | 'following_instructions'
  | 'attention'
  | 'working_memory'
  | 'task_completion'
  | 'problem_solving'
  | 'listening'
  | 'vocabulary'
  | 'understanding_instructions'
  | 'picture_matching'
  | 'verbal_comprehension'
  | 'persistence'
  | 'adaptability'
  | 'flexibility'
  | 'error_recovery'
  | 'response_to_feedback'
  | 'mouse_control'
  | 'touch_interaction'
  | 'drag_and_drop'
  | 'keyboard_navigation'
  | 'basic_robot_control';

export type AgeGroup =
  | '4-6'
  | '7-9'
  | '10-12'
  | '13+'
  | '13-16'
  | '16-18'
  | '18-21'
  | '21+';

export interface FineMotorMetrics {
  drag_accuracy_pct: number;
  click_precision_px: number;
  path_smoothness_ratio: number;
}

export interface BehavioralMetrics {
  hesitation_time_ms: number;
  recovery_after_rule_change: boolean;
  adaptation_speed_ms: number;
  attempts_after_hint: number;
}

export interface ItemTelemetry {
  item_id: string;
  domain: AssessmentDomain;
  skill: SkillName;
  format: QuestionFormat;
  difficulty_level: number;
  is_correct: boolean;
  accuracy_score: number;
  response_time_ms: number;
  expected_time_ms: number;
  attempts_count: number;
  hints_used: number;
  fine_motor?: FineMotorMetrics;
  behavioral?: BehavioralMetrics;
}

export interface DomainScore {
  domain: AssessmentDomain;
  domain_name: string;
  weight_pct: number;
  max_score: number;
  raw_accuracy_pct: number;
  efficiency_index: number;
  earned_score: number;
  skills_breakdown: Record<string, number>;
}

export interface FormatScore {
  format: QuestionFormat;
  weight_pct: number;
  question_count: number;
  raw_accuracy_pct: number;
  earned_contribution: number;
}

export interface CodingChallengeResult {
  attempted: boolean;
  total_challenges: number;
  completed_challenges: number;
  accuracy_pct: number;
  time_taken_ms: number;
  placement_verification: 'Strong' | 'Confirmed' | 'Borderline' | 'Not Attempted';
  skills_demonstrated: string[];
}

export interface QuestionTimeRecord {
  questionSlot: number;
  part: 1 | 2;
  domain: AssessmentDomain;
  subSkill: string;
  questionTitle: string;
  questionStartTimestamp: number;
  questionEndTimestamp: number;
  totalDurationMs: number;
  pausedDurationMs: number;
  activeDurationMs: number;
  responseLatencyMs: number | null;
  answeredAt: number | null;
  timedOut: boolean;
  wasAnswered: boolean;
  remainingTimeWhenAnsweredMs: number | null;
  breaksDuringQuestion: number;
  earnedScore: number;
  maxScore: number;
}

export interface BreakEvent {
  breakIndex: number;
  questionSlotAtPause: number;
  domainAtPause: AssessmentDomain;
  pauseStartTimestamp: number;
  resumeTimestamp: number;
  breakDurationMs: number;
  countdownRemainingAtPause: number;
}

export interface PartBreakRecord {
  partBreakStart: number;
  partBreakEnd: number | null;
  breakDurationMs: number | null;
  studentInitiatedEarly: boolean;
}

export interface StudentSessionTelemetry {
  schema_version: '1.0' | '2.0';
  session_id: string;
  student_name: string;
  age_group: AgeGroup;
  start_time: string;
  end_time?: string;
  item_telemetries: ItemTelemetry[];
  domain_scores: Record<AssessmentDomain, DomainScore>;
  format_scores?: Record<QuestionFormat, FormatScore>;
  coding_readiness_score?: number;
  coding_challenge_result?: CodingChallengeResult;
  total_score: number;
  placed_track: string;
  recommended_track: string;
  flags: string[];
  qualitative_summary?: string;
  question_time_records: QuestionTimeRecord[];
  break_events: BreakEvent[];
  part_break_record?: PartBreakRecord;
  total_breaks_count: number;
  total_break_duration_ms: number;
  total_active_duration_ms: number;
  total_wall_clock_duration_ms: number;
  domain_time_summary: Record<AssessmentDomain, {
    totalActiveMs: number;
    totalPausedMs: number;
    questionsTimedOut: number;
    avgResponseLatencyMs: number;
  }>;
}
