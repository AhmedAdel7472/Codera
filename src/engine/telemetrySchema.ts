// ---------------------------------------------------------------------------
// CodeRa Assessment Platform — Telemetry Schema  v2.0
// ---------------------------------------------------------------------------
// BREAKING CHANGES vs v1.0:
//   • schemaVersion field added to StudentSessionTelemetry (absent = '1.0')
//   • QuestionFormat type added; ItemTelemetry gains a `format` field
//   • SkillName expanded with coding-readiness skills
//   • age_group expanded to cover G8–University
//   • coding_readiness_score and coding_challenge_result added to session
//   • Placement levels renamed to L1–L4 (handled in placementEngine.ts)
// ---------------------------------------------------------------------------

export type AssessmentDomain =
  | 'cognitive_ability'
  | 'functional_skills'
  | 'communication_level'
  | 'behavioral_readiness'
  | 'fine_motor_technology';

// ---------------------------------------------------------------------------
// Question format tags (Schema B dimension — runs orthogonal to domain)
//   Structured     = 40% weight of final format score
//   Performance    = 30%
//   Observation    = 20%
//   CodingChallenge= 10%  (only appears in the bonus module for L3/L4)
// ---------------------------------------------------------------------------
export type QuestionFormat =
  | 'structured'
  | 'performance'
  | 'observation'
  | 'coding_challenge';

export type SkillName =
  // Cognitive
  | 'pattern_recognition'
  | 'logical_reasoning'
  | 'sequencing'
  | 'classification'
  | 'cause_and_effect'
  | 'visual_memory'
  // Cognitive — Coding Readiness (new in v2)
  | 'algorithmic_thinking'
  | 'if_then_logic'
  | 'repetition_patterns'
  // Functional
  | 'following_instructions'
  | 'attention'
  | 'working_memory'
  | 'task_completion'
  | 'problem_solving'
  // Communication
  | 'listening'
  | 'vocabulary'
  | 'understanding_instructions'
  | 'picture_matching'
  | 'verbal_comprehension'
  // Behavioral
  | 'persistence'
  | 'adaptability'
  | 'flexibility'
  | 'error_recovery'
  | 'response_to_feedback'
  // Fine Motor / Technology
  | 'mouse_control'
  | 'touch_interaction'
  | 'drag_and_drop'
  | 'keyboard_navigation'
  | 'basic_robot_control';

// ---------------------------------------------------------------------------
// Age groups — expanded from child-only to G8–University (v2)
// ---------------------------------------------------------------------------
export type AgeGroup =
  | '4-6'           // legacy (v1) — kept for backward compatibility
  | '7-9'           // legacy (v1)
  | '10-12'         // legacy (v1)
  | '13+'           // legacy (v1, used for G8+)
  | '13-16'         // Grade 8–10
  | '16-18'         // Grade 11–12
  | '18-21'         // University Year 1–4
  | '21+';          // University Final / Beyond

// ---------------------------------------------------------------------------
// Fine-motor telemetry
// ---------------------------------------------------------------------------
export interface FineMotorMetrics {
  drag_accuracy_pct: number;       // 0–100%
  click_precision_px: number;      // distance from target center
  path_smoothness_ratio: number;   // 0.0–1.0 (ideal vs actual path)
}

// ---------------------------------------------------------------------------
// Behavioral telemetry
// ---------------------------------------------------------------------------
export interface BehavioralMetrics {
  hesitation_time_ms: number;
  recovery_after_rule_change: boolean;
  adaptation_speed_ms: number;
  attempts_after_hint: number;
}

// ---------------------------------------------------------------------------
// Per-item telemetry
// ---------------------------------------------------------------------------
export interface ItemTelemetry {
  item_id: string;
  domain: AssessmentDomain;
  skill: SkillName;
  /** NEW v2: orthogonal format tag for Schema-B aggregation */
  format: QuestionFormat;
  difficulty_level: number;        // 1 (easy) to 5 (advanced)
  is_correct: boolean;
  accuracy_score: number;          // 0.0–1.0 (partial credit possible)
  response_time_ms: number;
  expected_time_ms: number;
  attempts_count: number;
  hints_used: number;
  fine_motor?: FineMotorMetrics;
  behavioral?: BehavioralMetrics;
}

// ---------------------------------------------------------------------------
// Domain aggregate
// ---------------------------------------------------------------------------
export interface DomainScore {
  domain: AssessmentDomain;
  domain_name: string;
  weight_pct: number;
  max_score: number;
  raw_accuracy_pct: number;
  efficiency_index: number;        // 0.0–1.0
  earned_score: number;
  skills_breakdown: Record<string, number>; // skill → 0-100%
}

// ---------------------------------------------------------------------------
// NEW v2: Format-weighted aggregate (Schema B)
// ---------------------------------------------------------------------------
export interface FormatScore {
  format: QuestionFormat;
  weight_pct: number;              // 40 / 30 / 20 / 10
  question_count: number;
  raw_accuracy_pct: number;
  earned_contribution: number;     // contribution to total score
}

// ---------------------------------------------------------------------------
// NEW v2: Coding Challenge result (L3/L4 bonus — not part of 50Q base score)
// ---------------------------------------------------------------------------
export interface CodingChallengeResult {
  attempted: boolean;
  total_challenges: number;        // 5
  completed_challenges: number;
  accuracy_pct: number;
  time_taken_ms: number;
  /** Placement Verification label shown on report */
  placement_verification: 'Strong' | 'Confirmed' | 'Borderline' | 'Not Attempted';
  skills_demonstrated: string[];
}

// ---------------------------------------------------------------------------
// Per-question timing record (unchanged from v1, extended for v2 break logic)
// ---------------------------------------------------------------------------
export interface QuestionTimeRecord {
  questionSlot: number;            // 1–50 (was 1–60 in v1)
  part: 1 | 2;                     // NEW v2: which part of the 2-part split
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

// ---------------------------------------------------------------------------
// Break events (unchanged from v1)
// ---------------------------------------------------------------------------
export interface BreakEvent {
  breakIndex: number;
  questionSlotAtPause: number;
  domainAtPause: AssessmentDomain;
  pauseStartTimestamp: number;
  resumeTimestamp: number;
  breakDurationMs: number;
  countdownRemainingAtPause: number;
}

// ---------------------------------------------------------------------------
// NEW v2: Mandatory inter-part break record
// ---------------------------------------------------------------------------
export interface PartBreakRecord {
  partBreakStart: number;          // timestamp when break screen shown
  partBreakEnd: number | null;     // timestamp when student clicked Resume
  breakDurationMs: number | null;
  studentInitiatedEarly: boolean;  // true if resumed before 5-min countdown
}

// ---------------------------------------------------------------------------
// Full session telemetry
// ---------------------------------------------------------------------------
export interface StudentSessionTelemetry {
  /**
   * Schema version — used by report renderer to choose correct label set.
   *   '1.0' (or absent) = legacy 60Q Cognix Explorer/Builder/Creator/Innovator
   *   '2.0'             = CodeRa 50Q L1–L4
   */
  schema_version: '1.0' | '2.0';

  session_id: string;
  student_name: string;
  age_group: AgeGroup;
  start_time: string;
  end_time?: string;

  item_telemetries: ItemTelemetry[];
  domain_scores: Record<AssessmentDomain, DomainScore>;

  /** NEW v2: format-weighted scores (Schema B aggregation) */
  format_scores?: Record<QuestionFormat, FormatScore>;

  /** NEW v2: sub-score across all coding-readiness-tagged items */
  coding_readiness_score?: number;  // 0–100

  /** NEW v2: bonus challenge result for L3/L4 students */
  coding_challenge_result?: CodingChallengeResult;

  total_score: number;             // 0–100
  placed_track: string;            // e.g. 'L2 Programmer'
  recommended_track: string;
  flags: string[];
  qualitative_summary?: string;

  // CEO Time & Analytics
  question_time_records: QuestionTimeRecord[];
  break_events: BreakEvent[];

  /** NEW v2: mandatory part-break record (between Q25 and Q26) */
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
