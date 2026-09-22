import { AssessmentDomain, SkillName, QuestionFormat } from '../engine/telemetrySchema';
import { AzureOpenAIClient } from './azureOpenAIClient';

export interface ActivityItem {
  id: string;
  slot: number; // 1 to 50
  domain: AssessmentDomain;
  skill: SkillName;
  format: QuestionFormat;
  subSkill: string;
  title: string;
  instructions: string;
  difficulty: number;
  expectedTimeMs: number;
  maxPoints: number;
  type: 'pattern_matrix' | 'robot_mission' | 'picture_match' | 'rule_shift' | 'motor_target';
  payload: any;
  hintText: string;
  source?: 'azure_openai' | 'procedural';
}

export interface QuestionBaseline {
  slot: number; // 1 to 50
  domain: AssessmentDomain;
  skill: SkillName;
  format: QuestionFormat;
  subSkill: string;
  title: string;
  baselinePrompt: string;
  maxPoints: number;
  difficulty: 1 | 2 | 3;
  type: 'pattern_matrix' | 'robot_mission' | 'picture_match' | 'rule_shift' | 'motor_target';
}

// Clean shape text (remove shape names like 'Square ⬛' and spoil hints)
export function cleanShapeText(text: string): string {
  if (!text) return text;
  let cleaned = text;
  // Remove parenthetical spoil/hint notes like (Original 4 Symbols), (Completes Pattern), etc.
  cleaned = cleaned.replace(/\s*\([^)]*(?:pattern|original|rule|distractor|wrong|correct|same|new symbol|new rule|old rule)[^)]*\)/gi, '');
  // Remove standalone shape name words next to symbols: "🔴 Circle" -> "🔴", "Triangle 🔺" -> "🔺"
  cleaned = cleaned.replace(/^\s*(?:circle|triangle|square|star|diamond|rectangle|hexagon)\s*([🔴🔵🟢🟡🟣🟨🟩🟦🟥⬛⬜🔺▲●■★◆◇○⬡⬢])\s*$/gi, '$1');
  cleaned = cleaned.replace(/^\s*([🔴🔵🟢🟡🟣🟨🟩🟦🟥⬛⬜🔺▲●■★◆◇○⬡⬢])\s*(?:circle|triangle|square|star|diamond|rectangle|hexagon)\s*$/gi, '$1');
  cleaned = cleaned.replace(/\b(circle|triangle|square|star|diamond|rectangle|hexagon)\s*([🔴🔵🟢🟡🟣🟨🟩🟦🟥⬛⬜🔺▲●■★◆◇○⬡⬢])/gi, '$2');
  cleaned = cleaned.replace(/([🔴🔵🟢🟡🟣🟨🟩🟦🟥⬛⬜🔺▲●■★◆◇○⬡⬢])\s*(circle|triangle|square|star|diamond|rectangle|hexagon)\b/gi, '$1');
  return cleaned.trim();
}

// ---------------------------------------------------------------------------
// Cognitive Assessment (Assessment 1) — 25 Task Baselines
// Mapped 1-to-1 from Cognitive_Assessment_25_Tasks.pdf
// ---------------------------------------------------------------------------
export const COGNITIVE_ASSESSMENT_BASELINES: QuestionBaseline[] = [
  { slot: 1, domain: 'cognitive_ability', skill: 'visual_memory', format: 'structured', subSkill: 'Working Memory — Visual Recall', title: 'Task 1: Visual Recall', baselinePrompt: 'Display symbols briefly, hide them, then identify which symbols appeared in the original set.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 2, domain: 'cognitive_ability', skill: 'working_memory', format: 'performance', subSkill: 'Working Memory — Sequential Memory', title: 'Task 2: Sequential Memory', baselinePrompt: 'Reconstruct the original sequence of symbols in the exact order shown.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 3, domain: 'cognitive_ability', skill: 'working_memory', format: 'performance', subSkill: 'Working Memory — Remember & Follow', title: 'Task 3: Remember & Follow', baselinePrompt: 'Remember the sequence of actions and perform them in the correct order.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 4, domain: 'cognitive_ability', skill: 'pattern_recognition', format: 'structured', subSkill: 'Fluid Reasoning — Pattern Recognition', title: 'Task 4: Pattern Recognition', baselinePrompt: 'Complete the visual pattern by selecting the missing element.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 5, domain: 'cognitive_ability', skill: 'logical_reasoning', format: 'structured', subSkill: 'Fluid Reasoning — Rule Detection', title: 'Task 5: Rule Detection', baselinePrompt: 'Deduce the underlying transformation rule and predict the next item.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 6, domain: 'cognitive_ability', skill: 'problem_solving', format: 'structured', subSkill: 'Fluid Reasoning — Problem Solving', title: 'Task 6: Problem Solving', baselinePrompt: 'Choose the most effective action to overcome the obstacle and reach the goal.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 7, domain: 'cognitive_ability', skill: 'flexibility', format: 'structured', subSkill: 'Cognitive Flexibility — Rule Switching', title: 'Task 7: Rule Switching', baselinePrompt: 'Switch from sorting by color to sorting by shape as the rule changes.', maxPoints: 2, difficulty: 2, type: 'rule_shift' },
  { slot: 8, domain: 'cognitive_ability', skill: 'visual_memory', format: 'structured', subSkill: 'Visual-Spatial — Visual Matching', title: 'Task 8: Visual Matching', baselinePrompt: 'Find the shape that perfectly matches the target among similar options.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 9, domain: 'cognitive_ability', skill: 'pattern_recognition', format: 'structured', subSkill: 'Visual-Spatial — Mental Rotation', title: 'Task 9: Mental Rotation', baselinePrompt: 'Select the option that represents the target shape after rotation.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 10, domain: 'cognitive_ability', skill: 'logical_reasoning', format: 'structured', subSkill: 'Visual-Spatial — Spatial Relationships', title: 'Task 10: Spatial Relationships', baselinePrompt: 'Identify relative spatial positions (above, inside, beside) accurately.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 11, domain: 'cognitive_ability', skill: 'sequencing', format: 'performance', subSkill: 'Visual-Spatial — Spatial Construction', title: 'Task 11: Spatial Construction', baselinePrompt: 'Select the correct order to assemble the target structure.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 12, domain: 'cognitive_ability', skill: 'attention', format: 'structured', subSkill: 'Processing Speed — Visual Search', title: 'Task 12: Visual Search', baselinePrompt: 'Scan the grid quickly and count the target symbols among distractors.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 13, domain: 'cognitive_ability', skill: 'attention', format: 'structured', subSkill: 'Processing Speed — Symbol Matching Speed', title: 'Task 13: Symbol Matching Speed', baselinePrompt: 'Verify whether two rapidly presented symbols match identically (YES/NO).', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 14, domain: 'cognitive_ability', skill: 'attention', format: 'structured', subSkill: 'Sustained Attention — Target Detection', title: 'Task 14: Target Detection', baselinePrompt: 'Detect occurrences of the target symbol in a continuous stream of stimuli.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 15, domain: 'cognitive_ability', skill: 'attention', format: 'structured', subSkill: 'Sustained Attention — Visual Attention Over Time', title: 'Task 15: Attention Over Time', baselinePrompt: 'Maintain attention over an extended sequence to spot target alerts.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 16, domain: 'cognitive_ability', skill: 'attention', format: 'structured', subSkill: 'Selective Attention — Distractor Filtering', title: 'Task 16: Selective Attention', baselinePrompt: 'Isolate the designated target and ignore surrounding visual noise.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 17, domain: 'cognitive_ability', skill: 'flexibility', format: 'structured', subSkill: 'Cognitive Flexibility — Change Sorting Rule', title: 'Task 17: Change Sorting Rule', baselinePrompt: 'Adapt sorting behavior when criteria shift from size to color.', maxPoints: 2, difficulty: 2, type: 'rule_shift' },
  { slot: 18, domain: 'cognitive_ability', skill: 'flexibility', format: 'structured', subSkill: 'Cognitive Flexibility — Switch Between Rules', title: 'Task 18: Switch Between Rules', baselinePrompt: 'Alternate flexibly between two rules across consecutive trials.', maxPoints: 2, difficulty: 3, type: 'rule_shift' },
  { slot: 19, domain: 'cognitive_ability', skill: 'problem_solving', format: 'structured', subSkill: 'Planning & Problem Solving — Find Best Route', title: 'Task 19: Find Best Route', baselinePrompt: 'Determine the fastest and unobstructed path to the destination.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 20, domain: 'cognitive_ability', skill: 'problem_solving', format: 'structured', subSkill: 'Planning & Problem Solving — Solve Problem', title: 'Task 20: Solve Problem', baselinePrompt: 'Identify the required action or bug fix to resolve the problem.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 21, domain: 'cognitive_ability', skill: 'flexibility', format: 'structured', subSkill: 'Planning & Flexibility — Find Alternative', title: 'Task 21: Find Alternative', baselinePrompt: 'Find an effective contingency plan when the primary option fails.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 22, domain: 'cognitive_ability', skill: 'following_instructions', format: 'structured', subSkill: 'Rules & Instructions — Multiple Rules', title: 'Task 22: Multiple Rules', baselinePrompt: 'Identify the item meeting all simultaneous compound criteria.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 23, domain: 'cognitive_ability', skill: 'following_instructions', format: 'structured', subSkill: 'Rules & Instructions — Multi-Step Instructions', title: 'Task 23: Multi-Step Instructions', baselinePrompt: 'Execute a multi-step sequence following precise instructions in order.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 24, domain: 'cognitive_ability', skill: 'logical_reasoning', format: 'structured', subSkill: 'Information Processing — Multiple Conditions', title: 'Task 24: Multiple Conditions Info', baselinePrompt: 'Query and match data satisfying multiple concurrent attributes.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 25, domain: 'cognitive_ability', skill: 'problem_solving', format: 'structured', subSkill: 'Decision Making — Choose Best Option', title: 'Task 25: Choose Best Option', baselinePrompt: 'Weigh practical options and select the most sensible, safe decision.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' }
];

// ---------------------------------------------------------------------------
// Functional Assessment (Assessment 2) — 25 Task Baselines
// Mapped 1-to-1 from Functional_Assessment_25_Tasks.pdf
// ---------------------------------------------------------------------------
export const FUNCTIONAL_ASSESSMENT_BASELINES: QuestionBaseline[] = [
  { slot: 1, domain: 'functional_skills', skill: 'organization', format: 'structured', subSkill: 'Organization — Workstation Setup', title: 'Task 1: Workstation Setup', baselinePrompt: 'Place work tools and items in their designated organizational locations.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 2, domain: 'functional_skills', skill: 'sequencing', format: 'performance', subSkill: 'Sequencing — Task Step Sequencing', title: 'Task 2: Task Step Sequencing', baselinePrompt: 'Sequence everyday workplace and study routine steps in logical order.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 3, domain: 'functional_skills', skill: 'following_instructions', format: 'structured', subSkill: 'Task Preparation — Tool Selection', title: 'Task 3: Tool Selection', baselinePrompt: 'Select the required tools and materials needed to perform a specified task.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 4, domain: 'functional_skills', skill: 'logical_reasoning', format: 'structured', subSkill: 'Functional Understanding — Tool Functions', title: 'Task 4: Match Tool & Function', baselinePrompt: 'Match each workplace tool with its intended practical function.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 5, domain: 'functional_skills', skill: 'following_instructions', format: 'structured', subSkill: 'Following Instructions — 1-Step Direction', title: 'Task 5: Simple Direction', baselinePrompt: 'Accurately execute a single straightforward workplace direction.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 6, domain: 'functional_skills', skill: 'following_instructions', format: 'structured', subSkill: 'Following Instructions — 2-Step Direction', title: 'Task 6: 2-Step Direction', baselinePrompt: 'Execute a sequential two-step workplace instruction in the right order.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 7, domain: 'functional_skills', skill: 'problem_solving', format: 'structured', subSkill: 'Task Initiation — Identify First Step', title: 'Task 7: Task Initiation', baselinePrompt: 'Identify the essential preliminary step before starting a workplace action.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 8, domain: 'functional_skills', skill: 'sequencing', format: 'structured', subSkill: 'Task Continuation — Identify Next Step', title: 'Task 8: Task Continuation', baselinePrompt: 'Identify the next logical action when in the middle of a routine task.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 9, domain: 'functional_skills', skill: 'organization', format: 'performance', subSkill: 'Task Completion — End-to-End Routine', title: 'Task 9: Complete Full Routine', baselinePrompt: 'Carry out and complete a multi-step workplace sorting and filing routine.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 10, domain: 'functional_skills', skill: 'attention', format: 'structured', subSkill: 'Self-Monitoring — Workplace Quality Check', title: 'Task 10: Quality Check', baselinePrompt: 'Inspect completed work to spot misplaced items or errors.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 11, domain: 'functional_skills', skill: 'problem_solving', format: 'structured', subSkill: 'Error Correction — Fix Misplaced Item', title: 'Task 11: Error Correction', baselinePrompt: 'Take the corrective action to resolve a detected error or misplaced item.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 12, domain: 'functional_skills', skill: 'problem_solving', format: 'structured', subSkill: 'Problem Solving — Workplace Obstacle', title: 'Task 12: Problem Solving', baselinePrompt: 'Resolve a common workplace barrier like finding a missing document or file.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 13, domain: 'functional_skills', skill: 'communication', format: 'structured', subSkill: 'Help-Seeking — Protocol When Blocked', title: 'Task 13: Help-Seeking Protocol', baselinePrompt: 'Seek appropriate help when faced with a system failure or roadblock.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 14, domain: 'functional_skills', skill: 'communication', format: 'structured', subSkill: 'Communication — Identify Person for Help', title: 'Task 14: Appropriate Person for Help', baselinePrompt: 'Identify which personnel (supervisor, mentor, technician) to ask for help.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 15, domain: 'functional_skills', skill: 'visual_memory', format: 'structured', subSkill: 'Schedule Following — Read Digital Schedule', title: 'Task 15: Read Digital Schedule', baselinePrompt: 'Read and interpret a digital timetable to identify scheduled activities.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 16, domain: 'functional_skills', skill: 'sequencing', format: 'structured', subSkill: 'Schedule Management — Identify Next Activity', title: 'Task 16: Next Activity on Schedule', baselinePrompt: 'Identify the upcoming activity on a daily schedule following current events.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 17, domain: 'functional_skills', skill: 'attention', format: 'structured', subSkill: 'Time Awareness — Digital Clock Reading', title: 'Task 17: Time Awareness', baselinePrompt: 'Read digital clock displays accurately to align with schedule times.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 18, domain: 'functional_skills', skill: 'logical_reasoning', format: 'structured', subSkill: 'Time Management — Calculate Duration', title: 'Task 18: Calculate Duration', baselinePrompt: 'Calculate the elapsed time and duration between task start and end times.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 19, domain: 'functional_skills', skill: 'organization', format: 'structured', subSkill: 'Organization — Workstation Cleanup', title: 'Task 19: Workstation Cleanup', baselinePrompt: 'Organize personal vs professional items into appropriate designated zones.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 20, domain: 'functional_skills', skill: 'problem_solving', format: 'structured', subSkill: 'Safety Awareness — Hazard Identification', title: 'Task 20: Workplace Safety', baselinePrompt: 'Identify physical workplace hazards and choose safe, preventative responses.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 21, domain: 'functional_skills', skill: 'flexibility', format: 'structured', subSkill: 'Flexibility — Schedule Disruption', title: 'Task 21: Handling Disruption', baselinePrompt: 'Adapt flexibly when routine facilities or rooms become temporarily unavailable.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 22, domain: 'functional_skills', skill: 'flexibility', format: 'structured', subSkill: 'Patience — Waiting for Shared Resources', title: 'Task 22: Waiting for Resources', baselinePrompt: 'Demonstrate patience and workplace etiquette when shared equipment is in use.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 23, domain: 'functional_skills', skill: 'following_instructions', format: 'structured', subSkill: 'Workplace Functioning — Supervisor Request', title: 'Task 23: Supervisor Request', baselinePrompt: 'Execute a direct instruction given by a workplace supervisor accurately.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 24, domain: 'functional_skills', skill: 'task_completion', format: 'performance', subSkill: 'Task Completion — Digital Workflow', title: 'Task 24: Digital Workflow Execution', baselinePrompt: 'Complete an end-to-end digital file management sequence.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 25, domain: 'functional_skills', skill: 'problem_solving', format: 'structured', subSkill: 'Troubleshooting — On-the-Fly Fix', title: 'Task 25: Workplace Troubleshooting', baselinePrompt: 'Diagnose and correct a misplaced file or common operational error.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' }
];

export const QUESTION_BASELINES: QuestionBaseline[] = [
  // --- DOMAIN 1: COGNITIVE ABILITIES (Q1 - Q12 | 25 Pts) ---
  { slot: 1, domain: 'cognitive_ability', skill: 'classification', format: 'structured', subSkill: 'Rule-Based Grouping', title: 'Logical Grouping', baselinePrompt: 'Identify which candidate follows the group classification rule.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 2, domain: 'cognitive_ability', skill: 'classification', format: 'structured', subSkill: 'Process Verification', title: 'Workflow Stage Check', baselinePrompt: 'Determine which stage immediately precedes the final labeling step.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 3, domain: 'cognitive_ability', skill: 'pattern_recognition', format: 'structured', subSkill: 'Geometric Transformation', title: 'Rotation Pattern', baselinePrompt: 'Identify the rotation angle that completes the 4-phase transformation.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 4, domain: 'cognitive_ability', skill: 'classification', format: 'structured', subSkill: 'Hardware Architecture', title: 'Input Device Identification', baselinePrompt: 'Select the hardware components that function as computer input devices.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 5, domain: 'cognitive_ability', skill: 'classification', format: 'structured', subSkill: 'Cause & Effect Logic', title: 'Sensor Trigger Action', baselinePrompt: 'Determine the automated safety system action when temperature threshold is exceeded.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 6, domain: 'cognitive_ability', skill: 'sequencing', format: 'structured', subSkill: 'Data Pipeline', title: 'Data Processing Workflow', baselinePrompt: 'Identify the required third stage in the data engineering workflow.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 7, domain: 'cognitive_ability', skill: 'sequencing', format: 'structured', subSkill: 'Branching Decisions', title: 'File Optimizer Branching', baselinePrompt: 'Determine the correct decision branch based on the file size threshold.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 8, domain: 'cognitive_ability', skill: 'pattern_recognition', format: 'structured', subSkill: 'Coordinate Grid Matrix', title: '2D Grid Matrix', baselinePrompt: 'Determine the missing coordinate element in the 3x3 matrix grid.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 9, domain: 'cognitive_ability', skill: 'pattern_recognition', format: 'structured', subSkill: 'State Transitions', title: 'Battery Consumption Math', baselinePrompt: 'Calculate remaining robot battery percentage after multiple sequential tasks.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  
  // --- Coding Readiness Questions (Cognitive) ---
  { slot: 10, domain: 'cognitive_ability', skill: 'sequencing', format: 'performance', subSkill: 'Coding Readiness: Execution Tracing', title: 'Script Failure Trace', baselinePrompt: 'Identify which program stages are skipped when a mid-sequence network error occurs.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 11, domain: 'cognitive_ability', skill: 'if_then_logic', format: 'structured', subSkill: 'Coding Readiness: Boolean Logic', title: 'Compound Logic Evaluation', baselinePrompt: 'Evaluate compound boolean criteria (AND condition) for Level 3 advancement.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 12, domain: 'cognitive_ability', skill: 'algorithmic_thinking', format: 'performance', subSkill: 'Coding Readiness: Loop Calculations', title: 'Loop Execution Angle', baselinePrompt: 'Calculate the total angular rotation resulting from a 4-iteration turn loop.', maxPoints: 3, difficulty: 3, type: 'pattern_matrix' },

  // --- DOMAIN 2: FUNCTIONAL ABILITIES (Q13 - Q24 | 25 Pts) ---
  { slot: 13, domain: 'functional_skills', skill: 'following_instructions', format: 'performance', subSkill: '1-Step Instruction', title: 'Hospital Supply Cart', baselinePrompt: 'Deliver emergency first-aid supplies directly to Room 101.', maxPoints: 2, difficulty: 1, type: 'robot_mission' },
  { slot: 14, domain: 'functional_skills', skill: 'following_instructions', format: 'performance', subSkill: '1-Step Instruction', title: 'Library Book Sorter', baselinePrompt: 'Retrieve the returned coding textbook from Shelf B.', maxPoints: 2, difficulty: 1, type: 'robot_mission' },
  { slot: 15, domain: 'functional_skills', skill: 'following_instructions', format: 'performance', subSkill: '2-Step Instruction', title: 'Campus Lab Navigation', baselinePrompt: 'Navigate to Computer Lab via reception turn and hallway traversal.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 16, domain: 'functional_skills', skill: 'following_instructions', format: 'performance', subSkill: '2-Step Instruction', title: 'Warehouse Shelf Retrieval', baselinePrompt: 'Turn toward Aisle 4 and advance to retrieve the inventory item.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 17, domain: 'functional_skills', skill: 'following_instructions', format: 'performance', subSkill: 'Multi-Step Task', title: 'Smart Farm Drone Survey', baselinePrompt: 'Fly forward, turn right into Sector C, and scan soil moisture.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 18, domain: 'functional_skills', skill: 'following_instructions', format: 'performance', subSkill: 'Multi-Step Task', title: 'Apartment Delivery Courier', baselinePrompt: 'Turn left at intersection, advance to Apartment 5B, and place package.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 19, domain: 'functional_skills', skill: 'task_completion', format: 'performance', subSkill: 'Task Completion', title: 'Cleanroom Security Entry', baselinePrompt: 'Unlock badge door, advance inside, collect sterile sample, and navigate to station.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 20, domain: 'functional_skills', skill: 'task_completion', format: 'performance', subSkill: 'Task Completion', title: 'Data Center Maintenance', baselinePrompt: 'Advance to server rack 7 and secure the backup hard drive.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 21, domain: 'functional_skills', skill: 'working_memory', format: 'performance', subSkill: 'Organization', title: '3D Printer Workflow Setup', baselinePrompt: 'Load filament spool, heat nozzle to 200°C, and calibrate print bed.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 22, domain: 'functional_skills', skill: 'working_memory', format: 'performance', subSkill: 'Organization', title: 'End-of-Shift Charging Dock', baselinePrompt: 'Guide Robo onto the wireless charging dock at the end of the shift.', maxPoints: 2, difficulty: 1, type: 'robot_mission' },
  { slot: 23, domain: 'functional_skills', skill: 'problem_solving', format: 'performance', subSkill: 'Independence', title: 'Facility Emergency Shutoff', baselinePrompt: 'Advance to sensor room, close emergency water valve, and signal command.', maxPoints: 3, difficulty: 3, type: 'robot_mission' },
  { slot: 24, domain: 'functional_skills', skill: 'problem_solving', format: 'performance', subSkill: 'Functional Problem Solving', title: 'Corridor Detour Routing', baselinePrompt: 'Navigate around the blocked fire door via service hall to reach emergency exit.', maxPoints: 2, difficulty: 3, type: 'robot_mission' },

  // --- DOMAIN 3: COMMUNICATION LEVEL (Q25 - Q34 | 20 Pts) ---
  { slot: 25, domain: 'communication_level', skill: 'listening', format: 'structured', subSkill: 'Assistive Tech Identification', title: 'Live Speech-to-Text Tool', baselinePrompt: 'Identify the assistive technology app that generates real-time text subtitles.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 26, domain: 'communication_level', skill: 'listening', format: 'structured', subSkill: 'Data Visualization', title: 'Project Timeline Chart', baselinePrompt: 'Select the visual scheduling tool used to track project milestones over time.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 27, domain: 'communication_level', skill: 'vocabulary', format: 'structured', subSkill: 'Hardware Terminology', title: 'Central Processor (CPU)', baselinePrompt: 'Identify the primary computer component responsible for executing program instructions.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 28, domain: 'communication_level', skill: 'vocabulary', format: 'structured', subSkill: 'Collaboration Software', title: 'Video Conferencing Platform', baselinePrompt: 'Choose the digital collaboration tool used for remote screen sharing and video calls.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 29, domain: 'communication_level', skill: 'understanding_instructions', format: 'structured', subSkill: 'Digital Classroom Etiquette', title: 'Mute Mic & Raise Hand', baselinePrompt: 'Execute the 2-step audio instruction: Mute microphone and raise virtual hand.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 30, domain: 'communication_level', skill: 'understanding_instructions', format: 'structured', subSkill: 'Cloud Submission Commands', title: 'Cloud Upload Icon', baselinePrompt: 'Identify the universal icon used to submit coding files to the cloud.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 31, domain: 'communication_level', skill: 'picture_matching', format: 'structured', subSkill: 'Accessibility Standards', title: 'Closed Captions [CC] Icon', baselinePrompt: 'Select the standard accessibility icon indicating closed captions/subtitles.', maxPoints: 2, difficulty: 1, type: 'picture_match' },
  { slot: 32, domain: 'communication_level', skill: 'verbal_comprehension', format: 'structured', subSkill: 'Technical Problem Response', title: 'Error Reporting Protocol', baselinePrompt: 'Choose the best communication response when encountering an unexpected code bug.', maxPoints: 2, difficulty: 3, type: 'picture_match' },
  { slot: 33, domain: 'communication_level', skill: 'verbal_comprehension', format: 'structured', subSkill: 'Clarification Requests', title: 'Constructive Help Request', baselinePrompt: 'Select the most professional and clear phrase to ask for help on an algorithm.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 34, domain: 'communication_level', skill: 'understanding_instructions', format: 'structured', subSkill: 'Project Demonstration', title: 'Live Solution Showcase', baselinePrompt: 'Identify the best method to communicate completed project outcomes to a client.', maxPoints: 2, difficulty: 3, type: 'picture_match' },

  // --- DOMAIN 4: BEHAVIORAL & LEARNING READINESS (Q35 - Q42 | 15 Pts) ---
  { slot: 35, domain: 'behavioral_readiness', skill: 'persistence', format: 'observation', subSkill: 'Attention', title: 'Sustain Attention', baselinePrompt: 'Maintains focus when a puzzle takes longer to solve.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 36, domain: 'behavioral_readiness', skill: 'persistence', format: 'observation', subSkill: 'Task Engagement', title: 'Remain Engaged', baselinePrompt: 'Remains engaged in the learning activity despite distractions.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 37, domain: 'behavioral_readiness', skill: 'adaptability', format: 'observation', subSkill: 'Instruction Following', title: 'Responds to Signals', baselinePrompt: 'Responds promptly when given a stop or transition instruction.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 38, domain: 'behavioral_readiness', skill: 'error_recovery', format: 'observation', subSkill: 'Response to Correction', title: 'Accept Redirection', baselinePrompt: 'Accepts gentle feedback and adjusts the approach calmly.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 39, domain: 'behavioral_readiness', skill: 'flexibility', format: 'observation', subSkill: 'Frustration Tolerance', title: 'Persevere on Error', baselinePrompt: 'Continues trying calmly after an initial error or bug.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 40, domain: 'behavioral_readiness', skill: 'adaptability', format: 'observation', subSkill: 'Transition', title: 'Smooth Transition', baselinePrompt: 'Moves smoothly from one activity to the next when time is up.', maxPoints: 2, difficulty: 1, type: 'pattern_matrix' },
  { slot: 41, domain: 'behavioral_readiness', skill: 'adaptability', format: 'observation', subSkill: 'Turn Taking / Waiting', title: 'Wait Appropriately', baselinePrompt: 'Waits patiently while another student or robot finishes their turn.', maxPoints: 1.5, difficulty: 1, type: 'pattern_matrix' },
  { slot: 42, domain: 'behavioral_readiness', skill: 'persistence', format: 'observation', subSkill: 'Motivation', title: 'Eager to Learn', baselinePrompt: 'Demonstrates willingness to try a new technology challenge.', maxPoints: 1.5, difficulty: 1, type: 'pattern_matrix' },

  // --- DOMAIN 5: FINE MOTOR & TECHNOLOGY SKILLS (Q43 - Q50 | 15 Pts) ---
  { slot: 43, domain: 'fine_motor_technology', skill: 'touch_interaction', format: 'performance', subSkill: 'Fine Motor Control', title: 'Object Precision', baselinePrompt: 'Tap or manipulate small digital targets with precision.', maxPoints: 2, difficulty: 2, type: 'motor_target' },
  { slot: 44, domain: 'fine_motor_technology', skill: 'mouse_control', format: 'performance', subSkill: 'Hand-Eye Coordination', title: 'Accurate Movement', baselinePrompt: 'Move pointer accurately to the target element.', maxPoints: 2, difficulty: 1, type: 'motor_target' },
  { slot: 45, domain: 'fine_motor_technology', skill: 'drag_and_drop', format: 'performance', subSkill: 'Object Manipulation', title: 'Assemble Structure', baselinePrompt: 'Which set of steps correctly assembles Robo\'s body? Choose the right order.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 46, domain: 'fine_motor_technology', skill: 'mouse_control', format: 'performance', subSkill: 'Mouse/Trackpad', title: 'Pointer Navigation', baselinePrompt: 'Control pointer speed and target alignment.', maxPoints: 2, difficulty: 2, type: 'motor_target' },
  { slot: 47, domain: 'fine_motor_technology', skill: 'keyboard_navigation', format: 'structured', subSkill: 'Keyboard Skills', title: 'Key Identification', baselinePrompt: 'Locate and press key directional arrows or spacebar.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  
  // --- Coding Readiness Questions (Technology) ---
  { slot: 48, domain: 'fine_motor_technology', skill: 'repetition_patterns', format: 'structured', subSkill: 'Coding Readiness: Loop Pattern', title: 'Repeat Pattern', baselinePrompt: 'Repeat this action 3 times: Move Forward → Turn Right. What is the pattern?', maxPoints: 1.5, difficulty: 2, type: 'pattern_matrix' },
  { slot: 49, domain: 'fine_motor_technology', skill: 'basic_robot_control', format: 'structured', subSkill: 'Coding Readiness: Debugging', title: 'Fix Bug', baselinePrompt: 'The robot turned left instead of right. Which block fixes the error?', maxPoints: 1.5, difficulty: 3, type: 'pattern_matrix' },
  { slot: 50, domain: 'fine_motor_technology', skill: 'basic_robot_control', format: 'performance', subSkill: 'Technology Independence', title: 'Independent Navigation', baselinePrompt: 'Complete the basic technology startup sequence independently.', maxPoints: 2, difficulty: 3, type: 'robot_mission' }
];

// Per-slot robot mission configurations: unique block sets, rich real-world scenarios, and customized route maps
const ROBOT_MISSION_CONFIGS: Record<number, { blocks: string[]; correctSequence: string[]; description: string; routeMap: string }> = {
  13: {
    blocks: ['Move Forward ⬆️', 'Turn Left ⬅️', 'Sound Siren 🚨'],
    correctSequence: ['Move Forward ⬆️'],
    description: 'Autonomous Hospital Cart: Deliver emergency first-aid kit directly to Room 101 down the straight corridor.',
    routeMap: '[ 🤖 Robo Cart ] ➔ ➡️ [ 🏥 Clear Corridor ] ➔ 📦 [ Room 101 First-Aid Kit ]'
  },
  14: {
    blocks: ['Pick Up Textbook 📚', 'Move Forward ⬆️', 'Turn Right ➡️'],
    correctSequence: ['Pick Up Textbook 📚'],
    description: 'Digital Library Sorter: Robo is parked in front of Shelf B. Retrieve the returned computer science textbook.',
    routeMap: '[ 🤖 Robo ] ➔ 📚 [ Shelf B (Target) ] ➔ 🦾 [ Pick Up Textbook ]'
  },
  15: {
    blocks: ['Turn Right ➡️', 'Move Forward ⬆️', 'Grab Item 🦾', 'Emergency Stop 🛑'],
    correctSequence: ['Turn Right ➡️', 'Move Forward ⬆️'],
    description: 'Campus Lab Navigation: Reach the Computer Lab by turning right at the Reception Desk and advancing forward.',
    routeMap: '[ 🤖 Robo ] ➔ ⤵️ [ Turn Right at Reception ] ➔ ➡️ [ Advance to Computer Lab 💻 ]'
  },
  16: {
    blocks: ['Turn Left ⬅️', 'Move Forward ⬆️', 'Sound Alarm 🔊', 'Drop Package 📦'],
    correctSequence: ['Turn Left ⬅️', 'Move Forward ⬆️'],
    description: 'Smart Warehouse Sorter: Turn left toward Aisle 4 and move forward to the inventory shelf.',
    routeMap: '[ 🤖 Robo ] ➔ ⤴️ [ Turn Left to Aisle 4 ] ➔ ➡️ [ Move to Inventory Shelf 📦 ]'
  },
  17: {
    blocks: ['Move Forward ⬆️', 'Turn Right ➡️', 'Scan Soil Moisture 🔍', 'Land Drone 🛬'],
    correctSequence: ['Move Forward ⬆️', 'Turn Right ➡️', 'Scan Soil Moisture 🔍'],
    description: 'Smart Agriculture Drone: Fly forward above crop row, turn right into Sector C, and scan soil moisture level.',
    routeMap: '[ 🚁 Drone ] ➔ ➡️ [ Fly Forward ] ➔ ⤵️ [ Turn Right Sector C ] ➔ 🔍 [ Scan Soil Moisture ]'
  },
  18: {
    blocks: ['Turn Left ⬅️', 'Move Forward ⬆️', 'Place Parcel 📦', 'Power Off 🛑'],
    correctSequence: ['Turn Left ⬅️', 'Move Forward ⬆️', 'Place Parcel 📦'],
    description: 'Autonomous Delivery Courier: Turn left at intersection, advance to Apartment 5B, and place the parcel on the mat.',
    routeMap: '[ 🤖 Courier ] ➔ ⤴️ [ Turn Left ] ➔ ➡️ [ Walk to Apt 5B ] ➔ 📦 [ Place Parcel ]'
  },
  19: {
    blocks: ['Unlock Door 🔑', 'Move Forward ⬆️', 'Collect Sample 🧪', 'Navigate to Station 🏢'],
    correctSequence: ['Unlock Door 🔑', 'Move Forward ⬆️', 'Collect Sample 🧪', 'Navigate to Station 🏢'],
    description: 'Cleanroom Lab Protocol: Unlock badge door, advance inside chamber, collect sterile sample, and navigate to station.',
    routeMap: '[ 🤖 Robo ] ➔ 🔑 [ Unlock Door ] ➔ ➡️ [ Advance ] ➔ 🧪 [ Sample ] ➔ 🏢 [ Testing Station ]'
  },
  20: {
    blocks: ['Move Forward ⬆️', 'Secure Hard Drive 💾', 'Jump Laser 🦘', 'Turn Left ⬅️'],
    correctSequence: ['Move Forward ⬆️', 'Secure Hard Drive 💾'],
    description: 'Data Center Maintenance: Move forward to Server Rack 7 and safely secure the backup hard drive.',
    routeMap: '[ 🤖 Robo ] ➔ ➡️ [ Advance to Rack 7 ] ➔ 💾 [ Secure Backup Hard Drive ]'
  },
  21: {
    blocks: ['Load Filament 🧵', 'Heat Nozzle 🔥', 'Calibrate Bed 📐', 'Cancel Print ❌'],
    correctSequence: ['Load Filament 🧵', 'Heat Nozzle 🔥', 'Calibrate Bed 📐'],
    description: '3D Printer Workflow Setup: Prepare 3D printer: load filament spool, heat nozzle to 200°C, and calibrate print bed.',
    routeMap: '[ 🧵 Load Filament ] ➔ 🔥 [ Heat Nozzle to 200°C ] ➔ 📐 [ Calibrate Print Bed ]'
  },
  22: {
    blocks: ['Dock at Charger ⚡', 'Power Off 🛑', 'Turn Left ⬅️'],
    correctSequence: ['Dock at Charger ⚡'],
    description: 'End-of-Shift Protocol: Robotics session complete! Guide Robo directly onto its wireless charging dock.',
    routeMap: '[ 🤖 Robo ] ➔ ⚡ [ Wireless Charging Dock ]'
  },
  23: {
    blocks: ['Move Forward ⬆️', 'Turn Right ➡️', 'Close Water Valve 🚰', 'Signal Command Center 📡'],
    correctSequence: ['Move Forward ⬆️', 'Turn Right ➡️', 'Close Water Valve 🚰', 'Signal Command Center 📡'],
    description: 'Emergency Facility Control: Advance through hallway, turn right to sensor room, close water valve, and signal command.',
    routeMap: '[ 🤖 Robo ] ➔ ➡️ [ Advance ] ➔ ⤵️ [ Turn Right ] ➔ 🚰 [ Close Valve ] ➔ 📡 [ Signal Command ]'
  },
  24: {
    blocks: ['Turn Right ➡️', 'Move Forward ⬆️', 'Turn Left ⬅️', 'Open Emergency Exit 🚪'],
    correctSequence: ['Turn Right ➡️', 'Move Forward ⬆️', 'Turn Left ⬅️', 'Open Emergency Exit 🚪'],
    description: 'Pathway Detour: Main corridor blocked by fire shutter. Turn right into Service Hall, advance, turn left, and open Exit Door.',
    routeMap: '[ 🤖 Robo ] ➔ ⤵️ [ Turn Right Detour ] ➔ ➡️ [ Advance ] ➔ ⤴️ [ Turn Left ] ➔ 🚪 [ Exit Door ]'
  },
  50: {
    blocks: ['Power On Workstation 💻', 'Verify VPN Link 🛡️', 'Launch CodeRa IDE 🚀', 'Join Virtual Classroom 🎓'],
    correctSequence: ['Power On Workstation 💻', 'Verify VPN Link 🛡️', 'Launch CodeRa IDE 🚀', 'Join Virtual Classroom 🎓'],
    description: 'Cloud Lab Startup: Full 4-step tech startup: Power on workstation, verify VPN link, launch CodeRa IDE, and connect.',
    routeMap: '[ 💻 Power On ] ➔ 🛡️ [ Verify VPN ] ➔ 🚀 [ Launch IDE ] ➔ 🎓 [ Join Classroom ]'
  }
};

// Rich picture_match configs: audioPromptText + emoji options per slot
const PICTURE_MATCH_CONFIGS: Record<number, { audioPromptText: string; options: Array<{ label: string; emoji: string; correct: boolean }> }> = {
  25: {
    audioPromptText: 'Which assistive technology app converts spoken audio into real-time text subtitles on screen?',
    options: [
      { label: 'Live Speech-to-Text App 📱', emoji: '📱', correct: true },
      { label: 'Analog Wall Clock ⏰', emoji: '⏰', correct: false },
      { label: 'Coffee Machine ☕', emoji: '☕', correct: false }
    ]
  },
  26: {
    audioPromptText: 'The team lead asks for a visual schedule showing project phases over time. Which tool is this?',
    options: [
      { label: 'Project Timeline Gantt Chart 📊', emoji: '📊', correct: true },
      { label: 'Audio Volume Slider 🔊', emoji: '🔊', correct: false },
      { label: 'Recycle Bin Icon 🗑️', emoji: '🗑️', correct: false }
    ]
  },
  27: {
    audioPromptText: 'What is the primary computer component that executes code and processes program logic?',
    options: [
      { label: 'Central Processor (CPU) 🧠', emoji: '🧠', correct: true },
      { label: 'Plastic Desk Mat 🖱️', emoji: '🖱️', correct: false },
      { label: 'Monitor Stand 🖥️', emoji: '🖥️', correct: false }
    ]
  },
  28: {
    audioPromptText: 'In a remote coding team, which digital tool allows you to video conference and screen-share code?',
    options: [
      { label: 'Video Conferencing Platform 💻', emoji: '💻', correct: true },
      { label: 'Pocket Calculator 🧮', emoji: '🧮', correct: false },
      { label: 'Paper Notebook 📓', emoji: '📓', correct: false }
    ]
  },
  29: {
    audioPromptText: 'Follow the 2-step instruction: First mute your microphone, then click the Raise Hand icon.',
    options: [
      { label: 'Mute Mic & Raise Hand 🎙️✋', emoji: '✋', correct: true },
      { label: 'Turn Up Volume 🔊', emoji: '🔊', correct: false },
      { label: 'Leave Video Call 🚪', emoji: '🚪', correct: false }
    ]
  },
  30: {
    audioPromptText: 'The trainer announces: "Submit your Python project file to the cloud portal." Which icon represents upload?',
    options: [
      { label: 'Cloud Upload Icon ☁️⬆️', emoji: '☁️', correct: true },
      { label: 'Bluetooth Disconnect 📴', emoji: '📴', correct: false },
      { label: 'Airplane Mode ✈️', emoji: '✈️', correct: false }
    ]
  },
  31: {
    audioPromptText: 'Which accessibility symbol indicates that Closed Captions and subtitles are available for this video?',
    options: [
      { label: 'Closed Captions [CC] 🔤', emoji: '🔤', correct: true },
      { label: 'Dark Mode Switch 🌓', emoji: '🌓', correct: false },
      { label: 'Screen Brightness ☀️', emoji: '☀️', correct: false }
    ]
  },
  32: {
    audioPromptText: 'When your code encounters an execution bug, what is the most constructive immediate communication step?',
    options: [
      { label: 'Copy error message & ask mentor 🙋', emoji: '🙋', correct: true },
      { label: 'Shut down computer & walk out 🚪', emoji: '🚪', correct: false },
      { label: 'Delete the entire project folder 🗑️', emoji: '🗑️', correct: false }
    ]
  },
  33: {
    audioPromptText: 'Which phrase represents a clear, professional way to request clarification on an algorithm step?',
    options: [
      { label: '"Could you explain Step 2 with an example?" 💬', emoji: '💬', correct: true },
      { label: '"I cannot do this at all" 😞', emoji: '😞', correct: false },
      { label: '"Skip the entire session" 🛑', emoji: '🛑', correct: false }
    ]
  },
  34: {
    audioPromptText: 'Your team has finished creating an accessibility website. How should you communicate results to the audience?',
    options: [
      { label: 'Live interactive demo presentation 📊', emoji: '📊', correct: true },
      { label: 'Keep code hidden on flash drive 🤐', emoji: '🤐', correct: false },
      { label: 'Power off the web server 🛑', emoji: '🛑', correct: false }
    ]
  }
};

// Per-slot cognitive configurations: Grade 8 to University SEN (Age 13-21) Logic & Pattern Metrics
const COGNITIVE_SLOT_CONFIGS: Record<number, { instructions: string; sequence?: string[]; grid?: string[][]; options: Array<{ label: string; emoji?: string; correct: boolean }>; hint: string }> = {
  1: {
    instructions: 'Logical Grouping: Group A contains [🔴 2 Dots, 🔴 4 Dots, 🔴 6 Dots] (Even Numbers). Group B contains [🔵 1 Dot, 🔵 3 Dots, 🔵 5 Dots] (Odd Numbers). Which item follows the Group A rule?',
    sequence: ['Group A (Even): 🔴 2 | 🔴 4 | 🔴 6', 'Group B (Odd): 🔵 1 | 🔵 3 | 🔵 5', 'Candidate Item = ❓'],
    options: [
      { label: '🔴 8 Dots (Even Rule)', emoji: '🔴', correct: true },
      { label: '🔵 7 Dots (Odd Number)', emoji: '🔵', correct: false },
      { label: '🟩 0 Dots (Empty)', emoji: '🟩', correct: false }
    ],
    hint: 'Group A only contains even numbers: 2, 4, 6, 8!'
  },
  2: {
    instructions: 'Workflow Inspection: An automated packaging line runs: [1. Scan QR 📷 → 2. Weigh Package ⚖️ → 3. Pack in Box 📦 → 4. Print Label 🏷️]. Which stage immediately precedes Print Label (Stage 4)?',
    sequence: ['1. 📷 Scan QR', '2. ⚖️ Weigh', '3. 📦 Pack in Box', '4. 🏷️ Print Label'],
    options: [
      { label: 'Pack in Box 📦 (Stage 3)', emoji: '📦', correct: true },
      { label: 'Scan QR 📷 (Stage 1)', emoji: '📷', correct: false },
      { label: 'Weigh Package ⚖️ (Stage 2)', emoji: '⚖️', correct: false }
    ],
    hint: 'Look at the step right before Stage 4!'
  },
  3: {
    instructions: 'Geometric Rotation Pattern: [90° Quarter Turn ↻] → [180° Half Turn ↻] → [270° Three-Quarter Turn ↻] → [❓ Complete Turn]. What rotation angle completes the full 4-phase cycle?',
    sequence: ['Phase 1: 90° ↻', 'Phase 2: 180° ↻', 'Phase 3: 270° ↻', 'Phase 4: ❓ Full Turn'],
    options: [
      { label: '360° Complete Turnaround 🔄', emoji: '🔄', correct: true },
      { label: '45° Half Step ↗️', emoji: '↗️', correct: false },
      { label: '90° Reset Step ➡️', emoji: '➡️', correct: false }
    ],
    hint: 'Adding 90° at each step: 270° + 90° = 360°!'
  },
  4: {
    instructions: 'Hardware Architecture: Which of the following device pairs are INPUT devices that capture data and feed it into the processor?',
    sequence: ['Category: Input Devices (Data In)', 'Target: Hardware that sends input signals', '❓ Candidate Pair: '],
    options: [
      { label: 'Keyboard & Microphone ⌨️🎙️', emoji: '⌨️', correct: true },
      { label: 'Monitor Display & Speaker 🖥️🔊', emoji: '🖥️', correct: false },
      { label: 'Power Supply Cord 🔌', emoji: '🔌', correct: false }
    ],
    hint: 'Input devices send user input into the computer!'
  },
  5: {
    instructions: 'Cause & Effect Rule: Temperature sensor reads 86°C. The system safety rule is: [IF Temp > 80°C → Activate Cooling Fan ❄️]. What is the immediate expected effect?',
    sequence: ['Sensor Reading: 86°C', 'Rule: IF Temp > 80°C THEN Activate Fan', 'System Action = ❓'],
    options: [
      { label: 'Activate Cooling Fan ❄️', emoji: '❄️', correct: true },
      { label: 'Dim Display Screen 🖥️', emoji: '🖥️', correct: false },
      { label: 'Increase Motor Speed 🏎️', emoji: '🏎️', correct: false }
    ],
    hint: '86°C is greater than 80°C, so the cooling rule triggers!'
  },
  6: {
    instructions: 'Data Pipeline Sequence: In data engineering: [Step 1: Ingest Data 📥 → Step 2: Clean & Filter 🧹 → Step 3: Run AI Model 🧠 → Step 4: Export Analytics 📊]. What happens at Step 3?',
    sequence: ['1. 📥 Ingest Data', '2. 🧹 Clean & Filter', '3. 🧠 Run AI Model', '4. 📊 Export Analytics'],
    options: [
      { label: 'Run AI Model 🧠 (Step 3)', emoji: '🧠', correct: true },
      { label: 'Ingest Data 📥 (Step 1)', emoji: '📥', correct: false },
      { label: 'Export Analytics 📊 (Step 4)', emoji: '📊', correct: false }
    ],
    hint: 'Check the 3rd item in the processing pipeline!'
  },
  7: {
    instructions: 'Branching Flowchart: A file optimizer rule states: [IF File Size < 25MB → Direct Upload ⚡. ELSE IF File Size >= 25MB → Compress ZIP First 🗜️]. Your project is 48MB. Which action is taken?',
    sequence: ['File Size: 48MB', 'Threshold: 25MB Maximum Direct', 'Required Action = ❓'],
    options: [
      { label: 'Compress ZIP First 🗜️ then Upload', emoji: '🗜️', correct: true },
      { label: 'Direct Upload ⚡ without Compression', emoji: '⚡', correct: false },
      { label: 'Permanently Delete Project 🗑️', emoji: '🗑️', correct: false }
    ],
    hint: '48MB is larger than 25MB, so the ELSE condition (Compress) applies!'
  },
  8: {
    instructions: '2D Coordinate Grid Matrix: Row 1: [A1, B1, C1]. Row 2: [A2, B2, C2]. Row 3: [A3, B3, ❓]. What cell coordinate completes the 3×3 matrix?',
    sequence: ['Row 1: A1 → B1 → C1', 'Row 2: A2 → B2 → C2', 'Row 3: A3 → B3 → ❓'],
    options: [
      { label: 'C3 (Column C, Row 3)', emoji: '🎯', correct: true },
      { label: 'D4 (Column D, Row 4)', emoji: '❌', correct: false },
      { label: 'B4 (Column B, Row 4)', emoji: '❌', correct: false }
    ],
    hint: 'Column C at Row 3 is C3!'
  },
  9: {
    instructions: 'Battery Consumption Logic: Robot battery starts at 100%. Each completed task consumes exactly 15% power. After 3 tasks, what is the remaining battery percentage?',
    sequence: ['Start: 100% 🔋', '3 Tasks × 15% = 45% consumed', 'Remaining Battery = ❓'],
    options: [
      { label: '55% Remaining (100 - 45)', emoji: '🔋', correct: true },
      { label: '70% Remaining', emoji: '⚠️', correct: false },
      { label: '40% Remaining', emoji: '🪫', correct: false }
    ],
    hint: '100 - (15 × 3) = 100 - 45 = 55%!'
  },
  10: {
    instructions: 'Coding Readiness — Execution Trace: Program steps: [1. Initialize Sensor 🔌 → 2. Connect WiFi 📡 → 3. Stream Telemetry 📊 → 4. Save Database 💾]. If network fails at Step 2, which steps are NEVER executed?',
    sequence: ['Step 1: 🔌 Init Sensor', 'Step 2: 📡 Connect WiFi (CRASHED 💥)', 'Unexecuted Steps = ❓'],
    options: [
      { label: 'Stream Telemetry 📊 & Save Database 💾', emoji: '⏭️', correct: true },
      { label: 'Initialize Sensor 🔌', emoji: '⏮️', correct: false },
      { label: 'Connect WiFi 📡', emoji: '⚠️', correct: false }
    ],
    hint: 'Execution halts at Step 2, so Steps 3 and 4 cannot run!'
  },
  11: {
    instructions: 'Coding Readiness — Boolean Condition: Rule: `IF (score >= 70 AND passed_challenge == true) → Advance to L3`. Student data: `score = 84`, `passed_challenge = true`. What is the result?',
    sequence: ['Condition: score >= 70 AND challenge == true', 'Student: score = 84 (>=70 ✓), challenge = true (✓)', 'Result = ❓'],
    options: [
      { label: 'Advance to Level 3 (L3) 🚀', emoji: '✅', correct: true },
      { label: 'Hold at Level 1 (L1) 🛑', emoji: '❌', correct: false },
      { label: 'Reset and Retake Exam 🔄', emoji: '⚠️', correct: false }
    ],
    hint: 'Both conditions are true (84 >= 70 and passed_challenge is true)!'
  },
  12: {
    instructions: 'Coding Readiness — Loop Calculation: A loop executes 4 times: `FOR i = 1 TO 4: [ Move_Forward(); Turn_Right_90(); ]`. What total angle has the robot turned in degrees?',
    sequence: ['Loop: 4 iterations', 'Turn per iteration: 90° Right', 'Total Angle = 4 × 90° = ❓'],
    options: [
      { label: '360° (Full 4-corner box turnaround) 🔄', emoji: '🔄', correct: true },
      { label: '180° (Half turnaround) ↔️', emoji: '↔️', correct: false },
      { label: '90° (Single corner turn) ↪️', emoji: '↪️', correct: false }
    ],
    hint: '4 turns of 90° each = 4 × 90 = 360°!'
  },
  48: {
    instructions: 'Coding Readiness — Loop Pattern: A repetitive robot motion pattern executes 3 iterations of: [Move Forward ⬆️ → Turn Right ➡️]. How many forward moves occur in total?',
    sequence: ['Iteration 1: ⬆️ ➡️', 'Iteration 2: ⬆️ ➡️', 'Iteration 3: ⬆️ ➡️'],
    options: [
      { label: '3 Forward Moves Total 3️⃣', emoji: '3️⃣', correct: true },
      { label: '1 Forward Move Total 1️⃣', emoji: '1️⃣', correct: false },
      { label: '6 Forward Moves Total 6️⃣', emoji: '6️⃣', correct: false }
    ],
    hint: '1 move forward per loop × 3 loops = 3 moves forward!'
  },
  49: {
    instructions: 'Coding Readiness — Debugging: Robot error analysis: The navigation unit steered LEFT ⬅️ instead of RIGHT ➡️ at Intersection 3. Which block replacement fixes the bug?',
    sequence: ['Bug Detected: Steer Left ⬅️', 'Required Correction: Replace with ❓'],
    options: [
      { label: 'Steer Right ➡️', emoji: '➡️', correct: true },
      { label: 'Reverse Backward ⬇️', emoji: '⬇️', correct: false },
      { label: 'Emergency Power Off 🛑', emoji: '🛑', correct: false }
    ],
    hint: 'Swap the incorrect Left turn block for a Right turn block!'
  },


  // ── Behavioral Readiness (slots 35–42) ──────────────────────────────────
  35: {
    instructions: 'Robo has been working on a hard puzzle for 2 minutes and still has not solved it. What should Robo do?',
    sequence: ['⏱️ 2 minutes passed...', '🤖 Puzzle still unsolved', '❓ What next?'],
    options: [
      { label: 'Keep trying patiently 💪', emoji: '💪', correct: true },
      { label: 'Quit immediately 🚪', emoji: '🚪', correct: false },
      { label: 'Throw the puzzle away 🗑️', emoji: '🗑️', correct: false }
    ],
    hint: 'Persistence means not giving up when things are hard!'
  },
  36: {
    instructions: 'During the coding activity, another student starts making noise. What should a focused learner do?',
    sequence: ['🔊 Noise nearby...', '💻 Coding activity on screen', '❓ What to do?'],
    options: [
      { label: 'Stay focused on the screen 👀', emoji: '👀', correct: true },
      { label: 'Join the noise 📢', emoji: '📢', correct: false },
      { label: 'Close the laptop 💤', emoji: '💤', correct: false }
    ],
    hint: 'A good learner stays focused even with distractions!'
  },
  37: {
    instructions: 'The teacher claps twice — this is the STOP signal. What should the student do?',
    sequence: ['👏👏 Teacher claps twice', '❓ Student should...'],
    options: [
      { label: 'Stop and look at the teacher 🛑', emoji: '🛑', correct: true },
      { label: 'Keep working and ignore it 🙉', emoji: '🙉', correct: false },
      { label: 'Run to the door 🏃', emoji: '🏃', correct: false }
    ],
    hint: 'Two claps = STOP and pay attention!'
  },
  38: {
    instructions: 'The teacher says "try a different way". The student\'s first approach was wrong. What should the student do?',
    sequence: ['❌ First attempt = wrong', '🗣️ Teacher: "Try a different way"', '❓ Student does...'],
    options: [
      { label: 'Calmly try again a new way 🔄', emoji: '🔄', correct: true },
      { label: 'Cry and refuse to continue 😭', emoji: '😭', correct: false },
      { label: 'Pretend not to hear 🙉', emoji: '🙉', correct: false }
    ],
    hint: 'Accepting feedback calmly makes you a better learner!'
  },
  39: {
    instructions: 'Robo makes an error in the code and stops moving. What is the BEST thing for the student to do?',
    sequence: ['🤖 Robo stops', '⚠️ Error in the code!', '❓ Best response?'],
    options: [
      { label: 'Take a breath and look for the bug 🔍', emoji: '🔍', correct: true },
      { label: 'Give up completely 😞', emoji: '😞', correct: false },
      { label: 'Get angry at the computer 😠', emoji: '😠', correct: false }
    ],
    hint: 'Staying calm and looking for the bug is the best move!'
  },
  40: {
    instructions: 'Time is up on the robot activity. The teacher says "Switch to the drawing activity". What should the student do?',
    sequence: ['⏰ Time is up!', '🗣️ Teacher: Switch activities now', '❓ Student does...'],
    options: [
      { label: 'Stop and move to drawing 🎨', emoji: '🎨', correct: true },
      { label: 'Refuse to switch 😤', emoji: '😤', correct: false },
      { label: 'Hide the robot 🙈', emoji: '🙈', correct: false }
    ],
    hint: 'Smooth transitions help the whole class!'
  },
  41: {
    instructions: 'Another student is having their turn with Robo. How should you wait?',
    sequence: ['🤖 Robo is busy with another student', '👧 Their turn is not done yet', '❓ You should...'],
    options: [
      { label: 'Wait quietly and watch 👀', emoji: '👀', correct: true },
      { label: 'Grab Robo from them 😡', emoji: '😡', correct: false },
      { label: 'Walk away and sulk 😔', emoji: '😔', correct: false }
    ],
    hint: 'Waiting patiently is a great team skill!'
  },
  42: {
    instructions: 'The teacher says "Today we try something new — coding a real robot!". How would an eager learner react?',
    sequence: ['🗣️ Teacher: New coding challenge today!', '🤖 A real robot is on the table', '❓ Eager learner does...'],
    options: [
      { label: 'Smile and say "Let\'s try it!" 😊', emoji: '😊', correct: true },
      { label: 'Say "I don\'t want to" 😑', emoji: '😑', correct: false },
      { label: 'Fall asleep 😴', emoji: '😴', correct: false }
    ],
    hint: 'Eagerness to learn opens every door!'
  },

  // ── Fine Motor / Technology (slots 45, 47) ──────────────────────────────
  45: {
    instructions: 'To build Robo correctly, which ORDER of steps is right?',
    sequence: ['Step A: 🔩 Attach wheels', 'Step B: 🔋 Insert battery', 'Step C: 💡 Turn on'],
    options: [
      { label: 'Wheels → Battery → Turn on 🔩🔋💡', emoji: '✅', correct: true },
      { label: 'Turn on → Wheels → Battery 💡🔩🔋', emoji: '❌', correct: false },
      { label: 'Battery → Turn on → Wheels 🔋💡🔩', emoji: '❌', correct: false }
    ],
    hint: 'Always attach parts before turning the robot on!'
  },
  47: {
    instructions: 'Which ARROW KEY moves the cursor DOWN on a keyboard?',
    sequence: ['⬆️ Up Arrow', '⬇️ Down Arrow', '⬅️ Left Arrow', '➡️ Right Arrow', '❓ Which one moves DOWN?'],
    options: [
      { label: 'Down Arrow ⬇️', emoji: '⬇️', correct: true },
      { label: 'Up Arrow ⬆️', emoji: '⬆️', correct: false },
      { label: 'Left Arrow ⬅️', emoji: '⬅️', correct: false }
    ],
    hint: 'The DOWN arrow points toward the bottom of the screen!'
  },
};

// ---------------------------------------------------------------------------
// 25 Dedicated Cognitive Task Procedural Fallback Configurations
// 1-to-1 match for Tasks 1 to 25 from Cognitive_Assessment_25_Tasks.pdf
// ---------------------------------------------------------------------------
export const COGNITIVE_25_TASK_CONFIGS: Record<
  number,
  {
    instructions: string;
    sequence?: string[];
    options: Array<{ label: string; emoji?: string; correct: boolean }>;
    hint: string;
  }
> = {
  1: {
    instructions: 'Task 1 — Visual Recall: Look at the symbols below and memorize them. After 5 seconds they will disappear, then select the symbols you saw.',
    sequence: ['🔴', '🔺', '⭐', '⬛'],
    options: [
      { label: '🔴  🔺  ⭐  ⬛', correct: true },
      { label: '🔴  🔷  ☀️  ⬛', correct: false },
      { label: '🔺  ⭐  🌙  🟢', correct: false }
    ],
    hint: 'Recall the 4 symbols shown at the start.'
  },
  2: {
    instructions: 'Task 2 — Sequential Memory: Remember the exact sequence of symbols. After 5 seconds they will disappear, then choose the original order.',
    sequence: ['⭐ ➔ 🔴 ➔ 🔺 ➔ ⬛'],
    options: [
      { label: '⭐  ➔  🔴  ➔  🔺  ➔  ⬛', correct: true },
      { label: '⬛  ➔  🔺  ➔  🔴  ➔  ⭐', correct: false },
      { label: '🔴  ➔  ⭐  ➔  ⬛  ➔  🔺', correct: false }
    ],
    hint: 'The sequence started with ⭐ and ended with ⬛!'
  },
  3: {
    instructions: 'Task 3 — Remember & Follow: Remember these 3 steps in order. After 5 seconds they will disappear, then choose the correct sequence.',
    sequence: ['1. 🔴 ➔ 2. 📦 ➔ 3. 🟢'],
    options: [
      { label: '🔴  ➔  📦  ➔  🟢', correct: true },
      { label: '🟢  ➔  🔴  ➔  📦', correct: false },
      { label: '📦  ➔  🟢  ➔  🔴', correct: false }
    ],
    hint: 'Remember: 🔴 first, then 📦, then 🟢!'
  },
  4: {
    instructions: 'Task 4 — Pattern Recognition: Complete the visual pattern. Choose what comes next:',
    sequence: ['🔴', '🔺', '🔴', '🔺', '🔴', '❓'],
    options: [
      { label: '🔺', correct: true },
      { label: '🔴', correct: false },
      { label: '⬛', correct: false }
    ],
    hint: 'The pattern alternates between 🔴 and 🔺!'
  },
  5: {
    instructions: 'Task 5 — Rule Detection: What shape completes the transformation rule?',
    sequence: ['●  ➔  ▲  ➔  ■', '▲  ➔  ■  ➔  ★', '■  ➔  ★  ➔  ❓'],
    options: [
      { label: '◆', correct: true },
      { label: '●', correct: false },
      { label: '▲', correct: false }
    ],
    hint: 'Each sequence shifts one step forward in the series!'
  },
  6: {
    instructions: 'Task 6 — Problem Solving: The robot\'s direct path is blocked by a safety fence 🚧. Which action safely reaches the goal?',
    sequence: ['Path A: Direct (Blocked by 🚧)', 'Path B: Side Corridor (Clear ✅)', 'Path C: Stairs (Inaccessible 🚫)'],
    options: [
      { label: 'Take Side Corridor B around fence ✅', correct: true },
      { label: 'Attempt to push through safety fence 🚧', correct: false },
      { label: 'Turn off and wait indefinitely 🛑', correct: false }
    ],
    hint: 'Find the open, unobstructed detour path!'
  },
  7: {
    instructions: 'Task 7 — Rule Switching: Round 1 was Sort by COLOR 🔴. NEW RULE: Sort by SHAPE ⭐ (Stars only). Which item follows the NEW rule?',
    sequence: ['Old Rule: COLOR 🔴', 'NEW RULE: SHAPE ⭐', '❓ Next Item: '],
    options: [
      { label: '🔵 ⭐', correct: true },
      { label: '🔴 ●', correct: false },
      { label: '🟩 ■', correct: false }
    ],
    hint: 'Ignore the old color rule! Switch to the new rule: choose the star ⭐!'
  },
  8: {
    instructions: 'Task 8 — Visual Matching: Find the shape that identically matches the target shape.',
    sequence: ['Target: ◆'],
    options: [
      { label: '◆', correct: true },
      { label: '◇', correct: false },
      { label: '○', correct: false }
    ],
    hint: 'Look for the exact solid matching shape!'
  },
  9: {
    instructions: 'Task 9 — Mental Rotation: If the target shape is rotated 90° clockwise ↻, which option represents it?',
    sequence: ['Target: └', '↻ Rotate 90° Clockwise'],
    options: [
      { label: '┌', correct: true },
      { label: '┐', correct: false },
      { label: '─', correct: false }
    ],
    hint: 'Imagine turning the corner a quarter-turn to the right!'
  },
  10: {
    instructions: 'Task 10 — Spatial Relationships: ● is placed above ■. Where is ■ relative to ●?',
    sequence: ['●', '⬇️', '■'],
    options: [
      { label: 'Below ⬇️', correct: true },
      { label: 'Above ⬆️', correct: false },
      { label: 'Beside ➡️', correct: false }
    ],
    hint: '■ is located underneath ●!'
  },
  11: {
    instructions: 'Task 11 — Spatial Construction: Memorize the arrangement of shapes. After 5 seconds it will disappear, then select the exact arrangement.',
    sequence: ['●', '▲', '■', '★'],
    options: [
      { label: '●  ▲  ■  ★', correct: true },
      { label: '■  ●  ★  ▲', correct: false },
      { label: '▲  ★  ●  ■', correct: false }
    ],
    hint: 'Remember the sequence from left to right: ● then ▲ then ■ then ★!'
  },
  12: {
    instructions: 'Task 12 — Visual Search: Count how many times the target symbol ★ appears below:',
    sequence: ['Target: ★', '★  ●  ▲  ★  ■  ★  ◆'],
    options: [
      { label: '3', correct: true },
      { label: '2', correct: false },
      { label: '4', correct: false }
    ],
    hint: 'Count each star: first one, middle one, third one = 3!'
  },
  13: {
    instructions: 'Task 13 — Symbol Matching Speed: Fast Match! Does the target symbol appear in the set below?',
    sequence: ['Target: ★', 'Set: ●  ▲  ★  ■'],
    options: [
      { label: 'YES', emoji: '✅', correct: true },
      { label: 'NO', emoji: '❌', correct: false },
      { label: 'Unsure', emoji: '❓', correct: false }
    ],
    hint: 'Look closely at the 3rd symbol in the set!'
  },
  14: {
    instructions: 'Task 14 — Target Detection: Count how many times the target 🚗 appears in the stream:',
    sequence: ['Target: 🚗', 'Stream: 🚗  🚲  ✈️  🚗  🚀  🚗  🚢'],
    options: [
      { label: '3', correct: true },
      { label: '1', correct: false },
      { label: '5', correct: false }
    ],
    hint: 'Position 1 is 🚗, Position 4 is 🚗, Position 6 is 🚗: 3 times!'
  },
  15: {
    instructions: 'Task 15 — Attention Over Time: In the sequence below, which positions contain the alert 🔴?',
    sequence: ['Positions 1-4: 🟢  🟢  🟢  🔴', 'Positions 5-8: 🟢  🟢  🔴  🟢'],
    options: [
      { label: 'Position 4 and 7', correct: true },
      { label: 'Position 1 and 8', correct: false },
      { label: 'Position 3 and 5', correct: false }
    ],
    hint: 'Count the positions where the red alerts appear: 4th and 7th!'
  },
  16: {
    instructions: 'Task 16 — Selective Attention: Select the item that satisfies BOTH conditions: BLUE + LARGE.',
    sequence: ['Condition 1: BLUE 🔵', 'Condition 2: LARGE 🔷'],
    options: [
      { label: '🔷', correct: true },
      { label: '🔹', correct: false },
      { label: '🔶', correct: false }
    ],
    hint: 'It must be both blue AND large!'
  },
  17: {
    instructions: 'Task 17 — Change the Sorting Rule: The rule just changed to Color: BLUE 🔵. Which item matches?',
    sequence: ['Old Rule: Sort by Size', 'NEW RULE: BLUE 🔵'],
    options: [
      { label: '🔵', correct: true },
      { label: '🔴', correct: false },
      { label: '🟩', correct: false }
    ],
    hint: 'Size no longer matters! Only the color Blue 🔵 counts!'
  },
  18: {
    instructions: 'Task 18 — Switch Between Rules: The rules alternate: Color ➔ Shape ➔ Color ➔ ?',
    sequence: ['Item 1: Color (🟡)', 'Item 2: Shape (🔺)', 'Item 3: Color (🟡)', 'Item 4: ❓ Which Rule?'],
    options: [
      { label: 'Shape (🔺)', correct: true },
      { label: 'Color (🟡)', correct: false },
      { label: 'Sound (🔊)', correct: false }
    ],
    hint: 'The rules alternate back and forth: Color ➔ Shape ➔ Color ➔ Shape!'
  },
  19: {
    instructions: 'Task 19 — Find the Best Route: Which route is the fastest unobstructed path from Start [A] to Goal [D]?',
    sequence: ['Route 1: A ➔ B ➔ D (3 steps, Clear ✅)', 'Route 2: A ➔ C ➔ E ➔ F ➔ D (5 steps ⏳)', 'Route 3: A ➔ G ➔ D (Blocked ⛔)'],
    options: [
      { label: 'Route 1 (3 steps, Clear) ✅', correct: true },
      { label: 'Route 2 (5 steps) ⏳', correct: false },
      { label: 'Route 3 (Blocked) ⛔', correct: false }
    ],
    hint: 'Route 1 is both clear and the shortest path!'
  },
  20: {
    instructions: 'Task 20 — Solve the Problem: The program crashed because the number field received text. What action solves this?',
    sequence: ['Bug: Type mismatch', 'Cause: Text entered in number field', 'Solution = ❓'],
    options: [
      { label: 'Convert text to number before processing', correct: true },
      { label: 'Delete the entire program and restart', correct: false },
      { label: 'Ignore error and run anyway', correct: false }
    ],
    hint: 'Converting text to a number resolves the type mismatch!'
  },
  21: {
    instructions: 'Task 21 — Find an Alternative: The classroom printer is out of paper. You have an urgent handout to print. What is the best alternative?',
    sequence: ['Goal: Print urgent handout', 'Problem: Printer out of paper', 'Alternative = ❓'],
    options: [
      { label: 'Print to the library network printer down the hall', correct: true },
      { label: 'Cancel class entirely', correct: false },
      { label: 'Keep pressing print on empty printer', correct: false }
    ],
    hint: 'Find another available printer to complete the task on time!'
  },
  22: {
    instructions: 'Task 22 — Multiple Rules: Select the item that is BLUE 🔵 AND a STAR ⭐ (NOT a Circle).',
    sequence: ['Rule 1: BLUE 🔵', 'Rule 2: STAR ⭐', 'Rule 3: NOT Circle'],
    options: [
      { label: '🔵 ⭐', correct: true },
      { label: '🔵 ●', correct: false },
      { label: '🟡 ⭐', correct: false }
    ],
    hint: 'Must be Blue AND Star, but NOT circle!'
  },
  23: {
    instructions: 'Task 23 — Multi-Step Instructions: Follow steps: 1. Open Folder 📁 ➔ 2. Copy File 📄 ➔ 3. Rename File ✏️ ➔ 4. Upload ☁️. Which is Step 3?',
    sequence: ['1. 📁 Open Folder', '2. 📄 Copy File', '3. ✏️ Rename File', '4. ☁️ Upload Cloud'],
    options: [
      { label: '3. ✏️ Rename File', correct: true },
      { label: '2. 📄 Copy File', correct: false },
      { label: '4. ☁️ Upload Cloud', correct: false }
    ],
    hint: 'Look at step 3 in the numbered sequence!'
  },
  24: {
    instructions: 'Task 24 — Multiple Conditions: From the student records, find the student who is: Grade 10 + Robotics Club + Active.',
    sequence: ['Alex: Grade 10 | Robotics | Active', 'Sam: Grade 9 | Robotics | Active', 'Jordan: Grade 10 | Art | Active'],
    options: [
      { label: 'Alex (Grade 10, Robotics, Active)', correct: true },
      { label: 'Sam (Grade 9)', correct: false },
      { label: 'Jordan (Art Club)', correct: false }
    ],
    hint: 'Alex matches all three requirements: Grade 10, Robotics, Active!'
  },
  25: {
    instructions: 'Task 25 — Choose the Best Option: You have tried solving a code syntax error for 15 minutes and cannot find it. What is the best decision?',
    sequence: ['Status: Stuck on syntax error for 15 mins', 'Goal: Learn and fix code', 'Best Action = ❓'],
    options: [
      { label: 'Check documentation or ask mentor for guidance 🙋', correct: true },
      { label: 'Give up and close laptop 🚪', correct: false },
      { label: 'Copy-paste random code without reading 🎲', correct: false }
    ],
    hint: 'Asking for help after trying independently is the smart decision!'
  }
};

// ---------------------------------------------------------------------------
// 25 Dedicated Functional Task Procedural Fallback Configurations
// 1-to-1 match for Tasks 1 to 25 from Functional_Assessment_25_Tasks.pdf
// ---------------------------------------------------------------------------
export const FUNCTIONAL_25_TASK_CONFIGS: Record<
  number,
  {
    instructions: string;
    sequence?: string[];
    options: Array<{ label: string; emoji?: string; correct: boolean }>;
    hint: string;
  }
> = {
  1: {
    instructions: 'Task 1 — Workstation Setup: Organize your workspace properly. Place the items in their designated spots: Pen goes into the Pencil Holder, ID goes into the ID Holder. Where does the Notebook go?',
    sequence: ['Pen ➔ ✏️ Pencil Holder', 'ID Badge ➔ 🪪 ID Holder', 'Notebook ➔ ❓ Where does it go?'],
    options: [
      { label: 'Inside your Work Bag 🎒', correct: true },
      { label: 'Into the Trash Bin 🗑️', correct: false },
      { label: 'On the Walkway Floor ⬇️', correct: false }
    ],
    hint: 'Notebooks belong safely inside your work bag or drawer!'
  },
  2: {
    instructions: 'Task 2 — Task Step Sequencing: Arrange the daily study routine steps in the correct logical order.',
    sequence: ['1. Open Bag 🎒', '2. Take Notebook 📓', '3. Write Notes ✍️', '4. ❓ Next Step'],
    options: [
      { label: 'Put Notebook Back in Bag 🎒', correct: true },
      { label: 'Tear up the notebook paper 📄', correct: false },
      { label: 'Leave the desk immediately 🏃', correct: false }
    ],
    hint: 'Always return materials to your bag when done writing!'
  },
  3: {
    instructions: 'Task 3 — Tool Selection: You need to prepare materials for a writing assignment. Which toolset do you select?',
    sequence: ['Task Goal: Writing Assignment 📝', 'Required Items = ❓'],
    options: [
      { label: 'Pen & Notebook 🖊️📓', correct: true },
      { label: 'Headphones & Game Controller 🎧🎮', correct: false },
      { label: 'Screwdriver & Wrench 🪛🔧', correct: false }
    ],
    hint: 'Writing tasks require a pen and paper or notebook!'
  },
  4: {
    instructions: 'Task 4 — Match Tool with Function: Match each tool with its correct workplace function.',
    sequence: ['Keyboard ➔ Typing ⌨️', 'Scissors ➔ Cutting ✂️', 'Clock ➔ ❓'],
    options: [
      { label: 'Checking the Time 🕒', correct: true },
      { label: 'Playing Music 🎵', correct: false },
      { label: 'Sweeping Floor 🧹', correct: false }
    ],
    hint: 'A clock is used to check the time!'
  },
  5: {
    instructions: 'Task 5 — Execute 1-Step Workplace Direction: Follow the instruction: "Place the client document into the Green Folder 📁".',
    sequence: ['Supervisor: "Put the document in the Green Folder"', 'Your Action = ❓'],
    options: [
      { label: 'Place document into Green Folder 📁', correct: true },
      { label: 'Shred the document 🗄️', correct: false },
      { label: 'Leave document on hallway floor 🚪', correct: false }
    ],
    hint: 'Follow the single direction: put it in the Green Folder!'
  },
  6: {
    instructions: 'Task 6 — Execute 2-Step Sequential Direction: Follow the two steps: "1. Select document 📄 ➔ 2. Move to Work Folder 📁". Which order is correct?',
    sequence: ['Step 1: Select document 📄', 'Step 2: Move to Work Folder 📁'],
    options: [
      { label: 'Select document 📄 ➔ Move to Work Folder 📁', correct: true },
      { label: 'Move folder first 📁 ➔ Select document 📄', correct: false },
      { label: 'Delete file 🗑️ ➔ Open browser 🌐', correct: false }
    ],
    hint: 'Complete Step 1 first, then Step 2!'
  },
  7: {
    instructions: 'Task 7 — Task Initiation (First Step): You need to send an important project report by email. What must you do FIRST?',
    sequence: ['Goal: Send project report ✉️', 'What is the FIRST step? ❓'],
    options: [
      { label: 'Review and verify the document 🔍', correct: true },
      { label: 'Click send immediately without looking 📤', correct: false },
      { label: 'Shut down the computer 🔌', correct: false }
    ],
    hint: 'Always review your document before sending!'
  },
  8: {
    instructions: 'Task 8 — Task Continuation (Next Step): You have just opened a new blank document. What is the next logical step to continue the task?',
    sequence: ['Step 1 Done: Blank document opened 📄', 'Next Step = ❓'],
    options: [
      { label: 'Enter project information ✍️', correct: true },
      { label: 'Turn off monitor screen 🖥️', correct: false },
      { label: 'Print empty blank page 🖨️', correct: false }
    ],
    hint: 'Now that the document is open, enter the required text!'
  },
  9: {
    instructions: 'Task 9 — Complete Full Routine: Complete the file sorting routine. Where should technical bug reports be filed?',
    sequence: ['Invoices ➔ Finance Folder 💼', 'Resumes ➔ HR Folder 👥', 'Bug Reports ➔ ❓'],
    options: [
      { label: 'IT / Engineering Folder 💻', correct: true },
      { label: 'Trash Bin 🗑️', correct: false },
      { label: 'Cafeteria Menu 🍽️', correct: false }
    ],
    hint: 'Software bug reports belong to IT / Engineering!'
  },
  10: {
    instructions: 'Task 10 — Workplace Self-Monitoring: Check this completed folder. Identify the file that does not belong:',
    sequence: ['Folder [Client Invoices]: Invoice_01.pdf ✅', 'Folder [Client Invoices]: Invoice_02.pdf ✅', 'Folder [Client Invoices]: Vacation_Photo.jpg ❓'],
    options: [
      { label: 'Vacation_Photo.jpg is in the wrong folder ⚠️', correct: true },
      { label: 'All files belong in this folder ✅', correct: false },
      { label: 'Invoice_01.pdf needs to be removed ❌', correct: false }
    ],
    hint: 'A vacation photo does not belong in business client invoices!'
  },
  11: {
    instructions: 'Task 11 — Error Correction: You found "Vacation_Photo.jpg" inside the Client Invoices folder. What is the correct way to fix this error?',
    sequence: ['Issue: Vacation_Photo.jpg in Client Invoices folder', 'Correction = ❓'],
    options: [
      { label: 'Move Vacation_Photo.jpg to Personal Photos folder 🖼️', correct: true },
      { label: 'Delete all client invoices 🗑️', correct: false },
      { label: 'Ignore it and do nothing 🙈', correct: false }
    ],
    hint: 'Move the misplaced photo to its proper personal folder!'
  },
  12: {
    instructions: 'Task 12 — Workplace Problem Solving: You cannot find "Project_Summary.docx" on your desktop. What is the best action to take?',
    sequence: ['Problem: File not found on desktop 📄', 'Best action = ❓'],
    options: [
      { label: 'Use the system search bar to look for the file name 🔍', correct: true },
      { label: 'Format and erase the computer hard drive ⚠️', correct: false },
      { label: 'Assume the file was never created 🤷', correct: false }
    ],
    hint: 'Use the search feature to find files by name!'
  },
  13: {
    instructions: 'Task 13 — Help-Seeking Protocol: Your coding software froze and shows an error message. What is the appropriate protocol?',
    sequence: ['Situation: Software frozen and not responding ⚠️', 'Appropriate response = ❓'],
    options: [
      { label: 'Inform trainer or supervisor and request technical assistance 🙋', correct: true },
      { label: 'Bang on the keyboard repeatedly ⌨️💥', correct: false },
      { label: 'Walk out of the classroom silently 🚪', correct: false }
    ],
    hint: 'Calmly report the issue and ask for technical assistance!'
  },
  14: {
    instructions: 'Task 14 — Identify Person for Help: You do not understand what is required for your assigned workplace task. Who should you ask?',
    sequence: ['Situation: Unclear about task instructions', 'Who to ask = ❓'],
    options: [
      { label: 'Supervisor or Mentor 👨‍🏫', correct: true },
      { label: 'A random visitor passing by 🚶', correct: false },
      { label: 'No one — guess and risk mistakes ❓', correct: false }
    ],
    hint: 'Your supervisor or mentor is responsible for clarifying tasks!'
  },
  15: {
    instructions: 'Task 15 — Read Digital Schedule: According to the daily timetable, what activity starts at 10:15?',
    sequence: ['09:00 - File Sorting 📁', '10:00 - Morning Break ☕', '10:15 - Computer Task 💻', 'Scheduled at 10:15 = ❓'],
    options: [
      { label: 'Computer Task 💻', correct: true },
      { label: 'File Sorting 📁', correct: false },
      { label: 'Lunch Break 🥪', correct: false }
    ],
    hint: 'Look at the 10:15 line on the schedule!'
  },
  16: {
    instructions: 'Task 16 — Schedule Management (Next Activity): It is 10:14 and morning break is ending. What activity should you transition to next?',
    sequence: ['Schedule: Sorting (9:00) ➔ Break (10:00) ➔ Computer Task (10:15)', 'Current Time: 10:14 ☕', 'Next Activity = ❓'],
    options: [
      { label: 'Computer Task at 10:15 💻', correct: true },
      { label: 'Go home for the day 🏠', correct: false },
      { label: 'Restart morning sorting 📁', correct: false }
    ],
    hint: 'The schedule transitions directly to Computer Task after break!'
  },
  17: {
    instructions: 'Task 17 — Time Awareness: Your afternoon robotics workshop starts at half past nine (09:30). Which digital clock shows this start time?',
    sequence: ['Target Start Time: Half past nine (09:30)', 'Which clock matches? ❓'],
    options: [
      { label: '09:30 ⏰', correct: true },
      { label: '12:00 🕛', correct: false },
      { label: '06:15 🕕', correct: false }
    ],
    hint: '09:30 matches half past nine!'
  },
  18: {
    instructions: 'Task 18 — Time Management: A data entry task started at 09:00 and was completed at 09:30. How long did the task take?',
    sequence: ['Start: 09:00 🕘', 'End: 09:30 🕤', 'Duration = ❓'],
    options: [
      { label: '30 Minutes ⏱️', correct: true },
      { label: '10 Minutes ⏱️', correct: false },
      { label: '2 Hours ⏱️', correct: false }
    ],
    hint: 'From 9:00 to 9:30 is exactly 30 minutes!'
  },
  19: {
    instructions: 'Task 19 — Workstation Cleanup & Organization: Clean your workstation. Separate official documents from personal items. Where should your personal lunch box go?',
    sequence: ['Zone A: Official Documents 📁', 'Zone B: Personal Items 🎒', 'Item: Lunch Box 🥪 ➔ ❓'],
    options: [
      { label: 'Zone B: Personal Items 🎒', correct: true },
      { label: 'Zone A: Official Documents 📁', correct: false },
      { label: 'Server Rack 🖥️', correct: false }
    ],
    hint: 'A lunch box is a personal item and belongs in Zone B!'
  },
  20: {
    instructions: 'Task 20 — Workplace Safety Awareness: You notice a thick power cable stretched loosely across a busy corridor walkway. What is the safest response?',
    sequence: ['Hazard: Cable across hallway walkway 🔌⚠️', 'Safe response = ❓'],
    options: [
      { label: 'Carefully walk around it and report the tripping hazard ⚠️', correct: true },
      { label: 'Run and jump over the wire quickly 🏃', correct: false },
      { label: 'Yank the cable out of the wall socket 🔌', correct: false }
    ],
    hint: 'Avoid the tripping hazard and notify building safety/supervisor!'
  },
  21: {
    instructions: 'Task 21 — Handling Schedule Disruption: Computer Lab A is closed today for urgent network maintenance. How should you adapt?',
    sequence: ['Notice: Lab A unavailable due to maintenance 🚧', 'Best adaptation = ❓'],
    options: [
      { label: 'Check the alternative schedule and use Computer Lab B 💻', correct: true },
      { label: 'Cancel your entire school day and leave 🏠', correct: false },
      { label: 'Force the locked Lab A door open 🚪', correct: false }
    ],
    hint: 'Switching to the backup room keeps your learning on track!'
  },
  22: {
    instructions: 'Task 22 — Waiting for Shared Resources: A colleague is currently using the shared office printer for a 2-minute print job. What should you do?',
    sequence: ['Status: Printer busy with colleague\'s print job 🖨️', 'What should you do? ❓'],
    options: [
      { label: 'Wait patiently for your turn nearby ⏳', correct: true },
      { label: 'Press Cancel on their active print job 🚫', correct: false },
      { label: 'Unplug the printer immediately 🔌', correct: false }
    ],
    hint: 'Waiting respectfully allows everyone to use shared resources smoothly!'
  },
  23: {
    instructions: 'Task 23 — Execute Supervisor Request: Your supervisor says: "Please transfer the finalized reports into the [Completed] archive folder." What action do you take?',
    sequence: ['Supervisor Request: Move finalized reports to [Completed] folder 📁', 'Your action = ❓'],
    options: [
      { label: 'Move finalized reports into [Completed] archive folder 📁', correct: true },
      { label: 'Leave reports loose on the desktop 🖥️', correct: false },
      { label: 'Delete the finalized reports 🗑️', correct: false }
    ],
    hint: 'Follow the specific instruction to move reports to [Completed]!'
  },
  24: {
    instructions: 'Task 24 — Digital Workflow Execution: Follow the 3-step digital routine: 1. Open file 📄 ➔ 2. Rename to "Final_Report" ✏️ ➔ 3. Which action completes this workflow?',
    sequence: ['1. Open file 📄', '2. Rename to "Final_Report" ✏️', '3. ❓ What completes the routine?'],
    options: [
      { label: 'Save file in the project folder 💾', correct: true },
      { label: 'Close without saving changes ❌', correct: false },
      { label: 'Delete the file 🗑️', correct: false }
    ],
    hint: 'Saving the renamed file finishes the digital workflow!'
  },
  25: {
    instructions: 'Task 25 — Workplace Troubleshooting: An accounting spreadsheet was accidentally saved inside the Marketing folder. How do you resolve this error?',
    sequence: ['Issue: Accounting file misplaced in Marketing folder 📂', 'How to resolve? ❓'],
    options: [
      { label: 'Move the file into the Accounting folder 📁', correct: true },
      { label: 'Delete the accounting spreadsheet permanently 🗑️', correct: false },
      { label: 'Restart the computer without fixing it 🔄', correct: false }
    ],
    hint: 'Moving the file to its correct department folder fixes the problem cleanly!'
  }
};

// ---------------------------------------------------------------------------
// ASSESSMENT 1 — PDF Task Blueprints (25 Cognitive Task Types)
//
// Each entry defines:
//   • cognitiveBlueprint : The LOCKED concept the AI must always test (from PDF)
//   • variationStrategy  : How the AI randomizes surface content per student
//   • slotMapping        : Which slot(s) in the 50-slot system use this blueprint
// ---------------------------------------------------------------------------
export interface Assessment1TaskBlueprint {
  taskNumber: number;
  taskName: string;
  skillArea: string;
  cognitiveBlueprint: string;
  variationStrategy: string;
  slotMapping: number[];
}

export const ASSESSMENT1_TASK_BLUEPRINTS: Assessment1TaskBlueprint[] = [
  {
    taskNumber: 1,
    taskName: 'Visual Recall',
    skillArea: 'Working Memory',
    cognitiveBlueprint:
      'Display a set of symbols for a brief time, then hide them and show a larger mixed set. ' +
      'The student must identify which items they saw in the original set. ' +
      'Tests visual working memory by requiring accurate recall from short-term exposure.',
    variationStrategy:
      'Randomize the symbols used (use emojis from technology, nature, or daily-life themes). ' +
      'Vary the size of the original set (3–6 items) and the distractor pool (6–10 items). ' +
      'Always keep exactly ONE correct answer option that lists the originally shown items.',
    slotMapping: [1]
  },
  {
    taskNumber: 2,
    taskName: 'Sequential Memory',
    skillArea: 'Working Memory',
    cognitiveBlueprint:
      'Present a sequence of symbols in a specific order, hide it, then show the same symbols in a scrambled order. ' +
      'The student reconstructs the original sequence. ' +
      'Tests ordered working memory and sequential processing.',
    variationStrategy:
      'Randomize the symbol set and sequence length (3–6 items). ' +
      'Always present one correct reconstruction option and two plausible wrong orders. ' +
      'Use emoji symbols from coding, robotics, or nature themes.',
    slotMapping: [2]
  },
  {
    taskNumber: 3,
    taskName: 'Remember & Follow',
    skillArea: 'Working Memory',
    cognitiveBlueprint:
      'Show a short sequence of 2–4 actions together, then hide the instructions. ' +
      'The student selects the correct ordered action sequence from memory. ' +
      'Tests prospective working memory and action sequencing under recall conditions.',
    variationStrategy:
      'Randomize action themes (robot commands, classroom tasks, lab procedures). ' +
      'Vary sequence length (2–4 steps). ' +
      'Present one correct sequence and two wrong sequences as options.',
    slotMapping: [3]
  },
  {
    taskNumber: 4,
    taskName: 'Pattern Recognition',
    skillArea: 'Fluid Reasoning',
    cognitiveBlueprint:
      'Display a visual pattern with one element missing. ' +
      'The student selects the element that logically completes the pattern. ' +
      'Tests fluid reasoning through abstract pattern completion.',
    variationStrategy:
      'Vary the pattern type (alternating, growing, color-rotating, shape-shifting). ' +
      'Use different symbol sets each time (geometric, emoji, letter-based). ' +
      'Ensure the correct answer is unambiguously derivable from the pattern rule.',
    slotMapping: [4]
  },
  {
    taskNumber: 5,
    taskName: 'Rule Detection',
    skillArea: 'Fluid Reasoning',
    cognitiveBlueprint:
      'Show several examples that all follow the same hidden rule. ' +
      'The student infers the rule and selects what should come next. ' +
      'Tests inductive fluid reasoning and rule abstraction.',
    variationStrategy:
      'Vary the rule type (transformation, substitution, increment, color-shift). ' +
      'Use different symbol domains per session. ' +
      'Present three options: correct next item, a plausible rule-follower from wrong position, and an unrelated item.',
    slotMapping: [5]
  },
  {
    taskNumber: 6,
    taskName: 'Problem Solving',
    skillArea: 'Fluid Reasoning',
    cognitiveBlueprint:
      'Present a visual problem situation with a blocked path or unmet condition. ' +
      'Offer three possible solution actions. ' +
      'The student selects the action that best solves the problem. ' +
      'Tests deductive fluid reasoning and solution evaluation.',
    variationStrategy:
      'Vary the problem domain (robot navigation, lab task, data pipeline, coding bug). ' +
      'Always have exactly one optimal solution and two sub-optimal/wrong ones. ' +
      'Use clear emoji to represent the situation visually.',
    slotMapping: [6]
  },
  {
    taskNumber: 7,
    taskName: 'Rule Switching',
    skillArea: 'Cognitive Flexibility',
    cognitiveBlueprint:
      'Ask the student to apply one sorting/classification rule, then switch to a new rule mid-task. ' +
      'The student must demonstrate the ability to abandon the old rule and apply the new one. ' +
      'Tests task-switching and cognitive flexibility under rule-change conditions.',
    variationStrategy:
      'Vary the rule pairs (color→shape, size→type, direction→function). ' +
      'Use different item sets (shapes, robot parts, data types). ' +
      'Present a question that asks which item follows the NEW rule, not the old one.',
    slotMapping: [7]
  },
  {
    taskNumber: 8,
    taskName: 'Visual Matching',
    skillArea: 'Visual-Spatial Processing',
    cognitiveBlueprint:
      'Show a target shape or symbol alongside several similar but distinct options. ' +
      'The student selects the exact matching item. ' +
      'Tests visual discrimination and spatial feature matching.',
    variationStrategy:
      'Use geometric shapes, circuit symbols, or robot parts as targets. ' +
      'Include visually similar distractors (minor rotations, color differences, feature additions). ' +
      'Exactly one option matches the target perfectly.',
    slotMapping: [8]
  },
  {
    taskNumber: 9,
    taskName: 'Mental Rotation',
    skillArea: 'Visual-Spatial Processing',
    cognitiveBlueprint:
      'Show a target shape. Present several rotated versions and ask which represents the same shape. ' +
      'Tests mental rotation ability and 3D/2D spatial reasoning.',
    variationStrategy:
      'Rotate shapes by varying angles (90°, 180°, 270°). ' +
      'Include mirror-flipped distractors as wrong answers. ' +
      'Vary shape complexity per difficulty level.',
    slotMapping: [9]
  },
  {
    taskNumber: 10,
    taskName: 'Spatial Relationships',
    skillArea: 'Visual-Spatial Processing',
    cognitiveBlueprint:
      'Show objects in specific spatial positions and ask the student to identify the relationship ' +
      '(above, below, left, right, diagonal). ' +
      'Tests spatial reasoning and positional vocabulary comprehension.',
    variationStrategy:
      'Vary the object pair (robot and sensor, star and grid cell, icon and container). ' +
      'Use above/below/left/right for easier levels; add diagonal for harder. ' +
      'Present three position options as answers.',
    slotMapping: [10]
  },
  {
    taskNumber: 11,
    taskName: 'Spatial Construction',
    skillArea: 'Visual-Spatial Processing',
    cognitiveBlueprint:
      'Display an arrangement of shapes, then hide it and ask the student to identify or recreate ' +
      'the same arrangement from options. ' +
      'Tests spatial memory and construction accuracy.',
    variationStrategy:
      'Vary the number of shapes (2–6) and their arrangement. ' +
      'Present one correct reconstruction and two arrangements with swapped or rotated elements. ' +
      'Use grids, quadrants, or free-form layouts.',
    slotMapping: [11]
  },
  {
    taskNumber: 12,
    taskName: 'Visual Search',
    skillArea: 'Processing Speed & Attention',
    cognitiveBlueprint:
      'Show a target symbol alongside a field of symbols. ' +
      'The student identifies whether and where the target appears as quickly as possible. ' +
      'Tests visual scanning speed and perceptual accuracy.',
    variationStrategy:
      'Vary the target symbol and the distractor symbols. ' +
      'Change the field size (8–20 items). ' +
      'Always ensure one unambiguously correct answer (found/not found, or which position).',
    slotMapping: [12]
  },
  {
    taskNumber: 13,
    taskName: 'Symbol Matching Speed',
    skillArea: 'Processing Speed',
    cognitiveBlueprint:
      'Show a target symbol, then a set of symbols. ' +
      'The student decides YES or NO — does the target appear in the set? ' +
      'Tests rapid comparison and processing speed.',
    variationStrategy:
      'Vary whether the target is present (50% present / 50% absent). ' +
      'Vary the set size and symbol types. ' +
      'Phrase as a multiple-choice question with YES/NO as options and one additional distractor.',
    slotMapping: [13]
  },
  {
    taskNumber: 14,
    taskName: 'Target Detection',
    skillArea: 'Sustained Attention',
    cognitiveBlueprint:
      'Display symbols one at a time in a sequence. ' +
      'The student must identify the moment the target symbol appears. ' +
      'Tests vigilance and sustained selective attention.',
    variationStrategy:
      'Vary the target symbol and the sequence. ' +
      'Ask the student to identify which position in the sequence the target appeared. ' +
      'Present three position options as answers.',
    slotMapping: [14]
  },
  {
    taskNumber: 15,
    taskName: 'Visual Attention Over Time',
    skillArea: 'Sustained Attention',
    cognitiveBlueprint:
      'Show a continuous stream of symbols and ask the student to track appearances of the target. ' +
      'Tests sustained attention across a longer time window.',
    variationStrategy:
      'Vary the target, stream length (10–20 items shown in sequence text), and number of target occurrences. ' +
      'Ask how many times the target appeared — present three count options as answers.',
    slotMapping: [15]
  },
  {
    taskNumber: 16,
    taskName: 'Selective Attention',
    skillArea: 'Selective Attention',
    cognitiveBlueprint:
      'Show a collection of items with varying features (color, shape, size). ' +
      'The student selects only items matching two simultaneous conditions (e.g., BLUE + LARGE). ' +
      'Tests dual-condition filtering and selective attention.',
    variationStrategy:
      'Vary condition pairs (color+shape, size+type, function+location). ' +
      'Use emoji or shape descriptors. ' +
      'Present three answer options: correct dual-match set, single-condition match, and unrelated set.',
    slotMapping: [16]
  },
  {
    taskNumber: 17,
    taskName: 'Change the Sorting Rule',
    skillArea: 'Cognitive Flexibility',
    cognitiveBlueprint:
      'Ask the student to sort items by one rule, then introduce a new rule and ask which item belongs ' +
      'in a specific category under the new rule. ' +
      'Tests cognitive flexibility and rule updating.',
    variationStrategy:
      'Vary the rule transition (color→shape, size→function, type→priority). ' +
      'Use items from coding, robotics, or school contexts. ' +
      'One correct answer under the NEW rule; two answers that reflect the old rule or neither.',
    slotMapping: [17]
  },
  {
    taskNumber: 18,
    taskName: 'Switch Between Rules',
    skillArea: 'Cognitive Flexibility',
    cognitiveBlueprint:
      'Display a rule indicator before each item and ask the student to apply the currently shown rule. ' +
      'Rules alternate between two options (e.g., COLOR vs SHAPE). ' +
      'Tests rapid rule-switching and inhibitory control.',
    variationStrategy:
      'Vary the two alternating rules and the item set. ' +
      'Ask which action applies given the current rule cue. ' +
      'Present three answers: correct rule-following action, action from the OTHER rule, and an unrelated action.',
    slotMapping: [18]
  },
  {
    taskNumber: 19,
    taskName: 'Find the Best Route',
    skillArea: 'Planning & Problem Solving',
    cognitiveBlueprint:
      'Show a simple map with a start, goal, multiple routes, and obstacles. ' +
      'The student chooses the route that successfully reaches the goal. ' +
      'Tests spatial planning and route evaluation.',
    variationStrategy:
      'Vary the map context (city streets, data center corridors, space station, school hallways). ' +
      'Use emoji route descriptions as sequence steps. ' +
      'Present three routes: one viable, one blocked, one that loops back.',
    slotMapping: [19]
  },
  {
    taskNumber: 20,
    taskName: 'Solve the Problem',
    skillArea: 'Planning & Problem Solving',
    cognitiveBlueprint:
      'Present a situation where the direct/obvious solution does not work due to a constraint. ' +
      'The student must select an alternative action that overcomes the constraint. ' +
      'Tests adaptive planning and constraint-aware problem solving.',
    variationStrategy:
      'Vary the blocked scenario (path blocked, resource unavailable, permission denied). ' +
      'Use tech/robotics contexts. ' +
      'Present three options: best workaround, doing nothing, and an action that worsens the situation.',
    slotMapping: [20]
  },
  {
    taskNumber: 21,
    taskName: 'Find an Alternative',
    skillArea: 'Planning & Cognitive Flexibility',
    cognitiveBlueprint:
      'Give the student an initial route or solution that then becomes unavailable mid-task. ' +
      'They must identify a valid alternative to still reach the goal. ' +
      'Tests adaptive re-planning and cognitive flexibility under disruption.',
    variationStrategy:
      'Vary the disruption type (path blocked, tool broken, data missing). ' +
      'Present three alternative actions: correct adaptive alternative, going back to the broken path, giving up.',
    slotMapping: [21]
  },
  {
    taskNumber: 22,
    taskName: 'Multiple Rules',
    skillArea: 'Following Rules & Instructions',
    cognitiveBlueprint:
      'Give the student two rules that must be followed simultaneously when selecting items. ' +
      'Tests dual-rule compliance and instruction-following under compound conditions.',
    variationStrategy:
      'Vary the two rules (include/exclude based on color, shape, type, size). ' +
      'Use coding/robotics item sets. ' +
      'Present three options: item satisfying both rules, item satisfying only one rule, item satisfying neither.',
    slotMapping: [22]
  },
  {
    taskNumber: 23,
    taskName: 'Multi-Step Instructions',
    skillArea: 'Following Rules & Instructions',
    cognitiveBlueprint:
      'Give the student a sequence of 3–4 ordered actions to complete. ' +
      'Tests sequential instruction-following and procedural working memory.',
    variationStrategy:
      'Vary the action domain (robot programming, file management, lab protocol). ' +
      'Present three options: correct ordered sequence, same steps in wrong order, sequence with a step missing.',
    slotMapping: [23]
  },
  {
    taskNumber: 24,
    taskName: 'Find Information Using Multiple Conditions',
    skillArea: 'Information Processing',
    cognitiveBlueprint:
      'Show a simple data table with columns (e.g., Name, Type, Status). ' +
      'The student finds the entry matching multiple specified conditions simultaneously. ' +
      'Tests conditional information lookup and logical conjunction.',
    variationStrategy:
      'Vary table content (files, robots, students, tasks). ' +
      'Use 2–3 conditions (e.g., Type=PDF AND Status=Complete). ' +
      'Present three answer options: correct row, row matching only one condition, row matching neither.',
    slotMapping: [24]
  },
  {
    taskNumber: 25,
    taskName: 'Choose the Best Option',
    skillArea: 'Decision Making',
    cognitiveBlueprint:
      'Present a situation with missing information or competing options. ' +
      'The student evaluates and selects the best course of action. ' +
      'Tests practical decision making, prioritization, and judgment.',
    variationStrategy:
      'Vary the decision scenario (asking for help, reporting a bug, choosing a file format). ' +
      'Always have one objectively best choice, one acceptable but sub-optimal choice, and one clearly wrong choice. ' +
      'Keep language simple and scenario relatable to tech/school contexts.',
    slotMapping: [25]
  }
];

// ---------------------------------------------------------------------------
// Map: slot number (1–50) → Assessment 1 task number (1–25)
// Slots not listed here have no PDF blueprint override (use standard prompt).
// ---------------------------------------------------------------------------
export const ASSESSMENT1_SLOT_TO_TASK: Record<number, number> = {
  // Cognitive Ability domain (slots 1–12) → Tasks 1–12
  1:  1,   // Visual Recall
  2:  2,   // Sequential Memory
  3:  3,   // Remember & Follow
  4:  4,   // Pattern Recognition
  5:  5,   // Rule Detection
  6:  6,   // Problem Solving
  7:  7,   // Rule Switching
  8:  8,   // Visual Matching
  9:  9,   // Mental Rotation
  10: 10,  // Spatial Relationships
  11: 11,  // Spatial Construction
  12: 12,  // Visual Search
  // Functional Skills domain (slots 13–24) → Tasks 13–23
  13: 13,  // Symbol Matching Speed
  14: 14,  // Target Detection
  15: 15,  // Visual Attention Over Time
  16: 16,  // Selective Attention
  17: 17,  // Change the Sorting Rule
  18: 18,  // Switch Between Rules
  19: 19,  // Find the Best Route
  20: 20,  // Solve the Problem
  21: 21,  // Find an Alternative
  22: 22,  // Multiple Rules
  23: 23,  // Multi-Step Instructions
  24: 24,  // Find Information Using Multiple Conditions
  // Communication Level domain (slots 25–34) → Task 25 + standard
  25: 25,  // Choose the Best Option
  // Slots 26–50: standard prompt (no PDF override, domain-specific generation)
};

// ---------------------------------------------------------------------------
// ASSESSMENT 2 — PDF Task Blueprints (25 Functional Task Types)
// Mapped 1-to-1 from Functional_Assessment_25_Tasks.pdf
// ---------------------------------------------------------------------------
export interface Assessment2TaskBlueprint {
  taskNumber: number;
  taskName: string;
  skillArea: string;
  cognitiveBlueprint: string;
  variationStrategy: string;
  slotMapping: number[];
}

export const ASSESSMENT2_TASK_BLUEPRINTS: Assessment2TaskBlueprint[] = [
  {
    taskNumber: 1,
    taskName: 'Workstation Setup & Tool Organization',
    skillArea: 'Organization',
    cognitiveBlueprint:
      'Present tools/items and their designated functional locations. The student identifies where a specific target item must be placed. ' +
      'Tests organization and systematic workspace setup.',
    variationStrategy:
      'Vary workplace/classroom items (stationery, electronics, safety gear) and designated holders/zones. ' +
      'Present 3 options: correct holder, clearly improper location (trash/floor), and unrelated container.',
    slotMapping: [1]
  },
  {
    taskNumber: 2,
    taskName: 'Task Step Sequencing',
    skillArea: 'Sequencing',
    cognitiveBlueprint:
      'Present steps in a routine work or study sequence. The student determines the next logical action or identifies the proper order. ' +
      'Tests procedural sequencing and order of operations.',
    variationStrategy:
      'Vary everyday routines (taking notes, starting computer session, cleaning up). ' +
      'Present 3 options: correct logical continuation, an action that destroys work, and premature termination.',
    slotMapping: [2]
  },
  {
    taskNumber: 3,
    taskName: 'Tool Selection for Required Task',
    skillArea: 'Task Preparation',
    cognitiveBlueprint:
      'State a specific workplace or school task. The student selects the appropriate set of tools required to execute it. ' +
      'Tests preparatory reasoning and tool utility understanding.',
    variationStrategy:
      'Vary the task goal (drafting document, repairing cord, measuring distance, testing code). ' +
      'Present 3 options: correct toolset, recreational/unrelated items, and mismatched trade tools.',
    slotMapping: [3]
  },
  {
    taskNumber: 4,
    taskName: 'Match Tool with its Function',
    skillArea: 'Functional Understanding',
    cognitiveBlueprint:
      'Provide workplace tools and their direct real-world functions. The student matches the target tool to what it accomplishes. ' +
      'Tests functional comprehension and object affordances.',
    variationStrategy:
      'Vary digital or physical tools (mouse, barcode scanner, timer, headphones, paper shredder). ' +
      'Present 3 options: correct function, completely absurd activity, and unrelated chore.',
    slotMapping: [4]
  },
  {
    taskNumber: 5,
    taskName: 'Execute Simple 1-Step Workplace Direction',
    skillArea: 'Following Instructions',
    cognitiveBlueprint:
      'A supervisor or system gives a single direct, clear command. The student identifies the exact complying action. ' +
      'Tests single-step verbal/text comprehension and direct execution.',
    variationStrategy:
      'Vary the instruction (filing a folder, handing an item, pressing save, attaching a cable). ' +
      'Present 3 options: exact compliance, opposite/destructive action, and passive neglect.',
    slotMapping: [5]
  },
  {
    taskNumber: 6,
    taskName: 'Execute 2-Step Sequential Workplace Direction',
    skillArea: 'Following Instructions',
    cognitiveBlueprint:
      'A directive contains two dependent sequential steps (First do A, then do B). The student identifies the correct ordered sequence. ' +
      'Tests sequential compliance and working memory for directives.',
    variationStrategy:
      'Vary the 2-step workplace action (e.g., select item then move, open app then log in, format disk then eject). ' +
      'Present 3 options: correct ordered pair, inverted order (B before A), and irrelevant action.',
    slotMapping: [6]
  },
  {
    taskNumber: 7,
    taskName: 'Task Initiation — Identify First Step',
    skillArea: 'Task Initiation',
    cognitiveBlueprint:
      'Given an objective or workflow, the student determines the necessary preliminary or first step before executing subsequent actions. ' +
      'Tests task initiation, foresight, and preparation.',
    variationStrategy:
      'Vary project scenarios (sending report, baking, coding robot, presenting slides). ' +
      'Present 3 options: essential preliminary check/first step, premature final action, and abrupt shutdown.',
    slotMapping: [7]
  },
  {
    taskNumber: 8,
    taskName: 'Task Continuation — Identify Next Step',
    skillArea: 'Task Continuation',
    cognitiveBlueprint:
      'Given an in-progress workflow where Step 1 is already complete, the student determines what step comes next. ' +
      'Tests mid-task momentum and ongoing procedural continuity.',
    variationStrategy:
      'Vary multi-step tasks (document editing, assembly, data entry). ' +
      'Present 3 options: correct continuation step, resetting everything, and skipping to finish without completing work.',
    slotMapping: [8]
  },
  {
    taskNumber: 9,
    taskName: 'Complete Full End-to-End Routine',
    skillArea: 'Task Completion',
    cognitiveBlueprint:
      'Present a comprehensive workplace sorting or filing routine with established category mappings. The student maps the final item. ' +
      'Tests comprehensive routine execution and categorization consistency.',
    variationStrategy:
      'Vary department folders (Finance, HR, Engineering, Operations, Legal) or warehouse bins. ' +
      'Present 3 options: correct category, trash/recycling, and random non-work venue.',
    slotMapping: [9]
  },
  {
    taskNumber: 10,
    taskName: 'Workplace Self-Monitoring & Quality Check',
    skillArea: 'Self-Monitoring',
    cognitiveBlueprint:
      'Display a batch of completed work where one element is flawed or misplaced. The student identifies which item needs correction. ' +
      'Tests quality control, attention to detail, and self-auditing.',
    variationStrategy:
      'Vary the item list (filenames in folder, tools in toolkit, parts in bin). One item is an obvious outlier. ' +
      'Present 3 options: correctly identified outlier, declaring everything perfect, and flagging an innocent valid item.',
    slotMapping: [10]
  },
  {
    taskNumber: 11,
    taskName: 'Error Correction',
    skillArea: 'Error Correction',
    cognitiveBlueprint:
      'Given a recognized mistake or misplaced workplace item, the student selects the correct remedy to resolve it without collateral damage. ' +
      'Tests targeted correction and restraint.',
    variationStrategy:
      'Vary the detected error (misplaced file, mislabeled box, wrong cable plugged in). ' +
      'Present 3 options: proper corrective fix, indiscriminate mass deletion, and passive ignorance.',
    slotMapping: [11]
  },
  {
    taskNumber: 12,
    taskName: 'Workplace Problem Solving',
    skillArea: 'Problem Solving',
    cognitiveBlueprint:
      'Present a realistic workplace roadblock (e.g., cannot find a file, tool missing, low battery). The student chooses the practical solution. ' +
      'Tests everyday applied problem solving.',
    variationStrategy:
      'Vary the roadblock scenario (searching files, locating charger, finding replacement toner). ' +
      'Present 3 options: standard effective tool/procedure, drastic destructive reaction, and giving up.',
    slotMapping: [12]
  },
  {
    taskNumber: 13,
    taskName: 'Workplace Help-Seeking Protocol',
    skillArea: 'Help-Seeking',
    cognitiveBlueprint:
      'An unexpected technical failure or persistent blocker occurs. The student chooses the calm, constructive protocol for seeking assistance. ' +
      'Tests self-advocacy, professional communication, and emotional regulation.',
    variationStrategy:
      'Vary technical snags (frozen screen, broken tool, missing credentials). ' +
      'Present 3 options: calm notification of supervisor/IT, physical frustration/tantrum, and abandonment.',
    slotMapping: [13]
  },
  {
    taskNumber: 14,
    taskName: 'Identify Appropriate Person for Help',
    skillArea: 'Functional Communication',
    cognitiveBlueprint:
      'Present a workplace role-specific question or issue. The student identifies the correct designated personnel to consult. ' +
      'Tests institutional awareness and social navigational competence.',
    variationStrategy:
      'Vary role types (Supervisor for instructions, IT Admin for passwords, Custodian for spills, Nurse for first aid). ' +
      'Present 3 options: designated professional, random outsider/passerby, and keeping silent.',
    slotMapping: [14]
  },
  {
    taskNumber: 15,
    taskName: 'Read Digital Schedule',
    skillArea: 'Schedule Following',
    cognitiveBlueprint:
      'Display a digital daily schedule table with times and event names. The student answers what occurs at a given timestamp. ' +
      'Tests schedule reading, digital timetable fluency, and temporal matching.',
    variationStrategy:
      'Vary daily timetable entries, activities, and target times. ' +
      'Present 3 options: correct scheduled activity, activity from different time slot, and unscheduled activity.',
    slotMapping: [15]
  },
  {
    taskNumber: 16,
    taskName: 'Schedule Management — Identify Next Activity',
    skillArea: 'Schedule Management',
    cognitiveBlueprint:
      'Given current progress or completion of one scheduled block, the student determines what event immediately follows. ' +
      'Tests daily schedule management and activity transition readiness.',
    variationStrategy:
      'Vary schedule sequences and current timestamp cues. ' +
      'Present 3 options: correct subsequent activity, looping back to start of day, and leaving premises.',
    slotMapping: [16]
  },
  {
    taskNumber: 17,
    taskName: 'Time Awareness — Digital Clock Reading',
    skillArea: 'Time Awareness',
    cognitiveBlueprint:
      'Provide a target verbal time (e.g. "half past nine", "quarter to two"). The student matches the correct digital clock readout. ' +
      'Tests time interpretation and digital literacy.',
    variationStrategy:
      'Vary target times across standard work hours (morning standup, noon lunch, afternoon wrap-up). ' +
      'Present 3 options: matching digital clock, reversed numbers or distractor clock times.',
    slotMapping: [17]
  },
  {
    taskNumber: 18,
    taskName: 'Time Management — Calculate Task Duration',
    skillArea: 'Time Management',
    cognitiveBlueprint:
      'Specify start time and end time for a workplace task. The student calculates the elapsed duration in minutes/hours. ' +
      'Tests practical time math and temporal estimation.',
    variationStrategy:
      'Vary start and end times (e.g., 9:00 to 9:30, 10:15 to 11:00, 1:00 to 1:45). ' +
      'Present 3 options: correct calculated elapsed duration, off-by-half-hour calculation, and absurd duration.',
    slotMapping: [18]
  },
  {
    taskNumber: 19,
    taskName: 'Workstation Cleanup & Organization',
    skillArea: 'Organization',
    cognitiveBlueprint:
      'Display distinct workstation zones (e.g., Official Documents vs Personal Items). The student sorts a given item into its proper zone. ' +
      'Tests workspace sanitation, compartmentalization, and boundary maintenance.',
    variationStrategy:
      'Vary items (water bottle, client contract, jacket, project circuit board, snack). ' +
      'Present 3 options: correct zone, opposite inappropriate zone, and hazard zone.',
    slotMapping: [19]
  },
  {
    taskNumber: 20,
    taskName: 'Workplace Safety Awareness',
    skillArea: 'Safety Awareness',
    cognitiveBlueprint:
      'Present a potential physical workplace or lab hazard (e.g., cable across walkway, spilled liquid, blocked fire exit). ' +
      'The student chooses the safe, protocol-compliant response. ' +
      'Tests environmental safety awareness and proactive prevention.',
    variationStrategy:
      'Vary hazards (loose cord, wet floor, heavy box on edge, ungrounded plug). ' +
      'Present 3 options: safe navigation + reporting hazard, reckless action, and aggravating the risk.',
    slotMapping: [20]
  },
  {
    taskNumber: 21,
    taskName: 'Handling Schedule Disruption & Flexibility',
    skillArea: 'Cognitive Flexibility',
    cognitiveBlueprint:
      'A planned room, machine, or schedule item is disrupted/unavailable. The student chooses the adaptive backup course of action. ' +
      'Tests workplace adaptability, resilience, and problem management under change.',
    variationStrategy:
      'Vary disrupted resources (room undergoing repairs, software server offline, bus delay). ' +
      'Present 3 options: designated contingency/backup plan, total abandonment/leaving, and obstinate refusal to move.',
    slotMapping: [21]
  },
  {
    taskNumber: 22,
    taskName: 'Waiting for Shared Resources',
    skillArea: 'Workplace Social Functioning',
    cognitiveBlueprint:
      'A colleague is using a shared resource (printer, tool station, coffee machine). The student chooses the appropriate waiting behavior. ' +
      'Tests patience, turn-taking, and peer respect in professional environments.',
    variationStrategy:
      'Vary shared items (3D printer, scanner, paper cutter, shared charging dock). ' +
      'Present 3 options: polite waiting/doing another minor task, forceful interruption/cancelling peer job, and destructive anger.',
    slotMapping: [22]
  },
  {
    taskNumber: 23,
    taskName: 'Execute Direct Supervisor Request',
    skillArea: 'Following Instructions',
    cognitiveBlueprint:
      'A supervisor gives an explicit task instruction with specific details. The student chooses the action that faithfully carries it out. ' +
      'Tests authority recognition, instructional fidelity, and task compliance.',
    variationStrategy:
      'Vary supervisor requests (moving specific files to Completed, organizing binders by date, notifying team). ' +
      'Present 3 options: exact compliant action, incomplete or delayed action, and contradicting action.',
    slotMapping: [23]
  },
  {
    taskNumber: 24,
    taskName: 'End-to-End Digital Workflow Execution',
    skillArea: 'Task Completion',
    cognitiveBlueprint:
      'Display a multi-step digital procedure (e.g., Open File -> Rename -> Save -> Upload). The student identifies the final step or missing link. ' +
      'Tests end-to-end digital competency and thoroughness.',
    variationStrategy:
      'Vary workflows (submitting homework, archiving code repo, exporting PDF graphic). ' +
      'Present 3 options: correct concluding action (saving/submitting), discarding without saving, and deleting assets.',
    slotMapping: [24]
  },
  {
    taskNumber: 25,
    taskName: 'On-the-Fly Workplace Bug/Troubleshooting',
    skillArea: 'Problem Solving',
    cognitiveBlueprint:
      'A simple operational error is observed in real-time (e.g., file saved in the wrong folder, wrong recipient in draft). ' +
      'The student determines the clean on-the-fly corrective action. ' +
      'Tests real-time troubleshooting and operational repair.',
    variationStrategy:
      'Vary minor operational bugs (misnamed folder, accidentally unshared link, wrong paper tray). ' +
      'Present 3 options: simple relocation/adjustment, panic and erasing entire project, and ignoring the known defect.',
    slotMapping: [25]
  }
];

// ---------------------------------------------------------------------------
// Student context passed to generateActivity() for adaptive AI generation
// ---------------------------------------------------------------------------
export interface StudentMetricsContext {
  studentName?: string;
  diagnosis?: string;
  interests?: string[];
  currentAccuracy?: number;
  averageResponseTimeMs?: number;
  domainScores?: Record<string, number>;
  placedTrack?: string;
}

export class ActivityGenerator {
  private client: AzureOpenAIClient;

  constructor() {
    this.client = new AzureOpenAIClient();
  }

  /**
   * Generates a fully coherent, valid ActivityItem for the given slot.
   * Leverages student telemetry metrics and diagnosis for adaptive generation.
   *
   * Flow:
   *   1. Build a complete, guaranteed procedural fallback payload from the slot config.
   *   2. If the slot is robot_mission or picture_match, return the procedural version immediately.
   *   3. Otherwise, call Azure OpenAI to generate a single cohesive JSON object.
   *   4. Strictly validate: exactly 3 options, exactly 1 correct, all labels non-empty.
   *   5. Any failure at steps 3-4 silently returns the slot-config fallback.
   */
  public async generateActivity(
    slot: number,
    studentMetrics?: StudentMetricsContext,
    assessmentType: 'cognitive_ability' | 'functional_skills' | 'all' = 'cognitive_ability'
  ): Promise<ActivityItem> {
    const base = assessmentType === 'cognitive_ability'
      ? (COGNITIVE_ASSESSMENT_BASELINES.find(b => b.slot === slot) || COGNITIVE_ASSESSMENT_BASELINES[0])
      : assessmentType === 'functional_skills'
      ? (FUNCTIONAL_ASSESSMENT_BASELINES.find(b => b.slot === slot) || FUNCTIONAL_ASSESSMENT_BASELINES[0])
      : (QUESTION_BASELINES.find(b => b.slot === slot) || QUESTION_BASELINES[0]);

    // ── Step 1: Build guaranteed fallback from slot config ──────────────────
    const fallbackPayload = assessmentType === 'cognitive_ability'
      ? (COGNITIVE_25_TASK_CONFIGS[slot] || this.buildProceduralPayload(base))
      : assessmentType === 'functional_skills'
      ? (FUNCTIONAL_25_TASK_CONFIGS[slot] || this.buildProceduralPayload(base))
      : this.buildProceduralPayload(base);

    const fallbackItem: ActivityItem = {
      id: `act_${assessmentType}_slot_${slot}_${Date.now()}`,
      slot,
      domain: base.domain,
      skill: base.skill,
      format: base.format,
      subSkill: base.subSkill,
      title: base.title,
      instructions: fallbackPayload.instructions || base.baselinePrompt,
      difficulty: base.difficulty,
      expectedTimeMs: 90_000,
      maxPoints: base.maxPoints,
      type: base.type,
      payload: fallbackPayload,
      hintText: fallbackPayload.hint || fallbackPayload.hintText || `Focus on the ${base.subSkill} carefully. Take your time!`,
      source: 'procedural'
    };

    // ── Step 2: Skip AI for interaction-based question types ────────────────
    if (base.type === 'robot_mission' || base.type === 'picture_match' || base.type === 'motor_target') {
      return fallbackItem;
    }

    // ── Step 3: Ask Azure OpenAI for a full coherent question + options ─────
    try {
      const domainLabel = base.domain.replace(/_/g, ' ');
      const skillLabel  = base.skill.replace(/_/g, ' ');

      // Build student adaptive context notes
      const metricsContextNotes = studentMetrics ? [
        `- Student Profile: ${studentMetrics.studentName || 'Student'}`,
        studentMetrics.diagnosis
          ? `- Medical/Educational Diagnosis: ${studentMetrics.diagnosis} (Tailor visual cues, simplify complex syntax, and support focus)`
          : '',
        studentMetrics.interests && studentMetrics.interests.length > 0
          ? `- Student Interests: ${studentMetrics.interests.join(', ')} (Incorporate themes where appropriate)`
          : '',
        studentMetrics.currentAccuracy !== undefined
          ? `- Current Session Accuracy: ${Math.round(studentMetrics.currentAccuracy * 100)}%`
          : '',
        studentMetrics.averageResponseTimeMs
          ? `- Avg Latency: ${Math.round(studentMetrics.averageResponseTimeMs / 1000)}s per item`
          : ''
      ].filter(Boolean).join('\n') : '';

      // ── Inject PDF blueprint if this slot is mapped ───────────
      let blueprint: { taskNumber: number; taskName: string; skillArea: string; cognitiveBlueprint: string; variationStrategy: string } | undefined;
      if (assessmentType === 'cognitive_ability') {
        blueprint = ASSESSMENT1_TASK_BLUEPRINTS.find(b => b.taskNumber === slot);
      } else if (assessmentType === 'functional_skills') {
        blueprint = ASSESSMENT2_TASK_BLUEPRINTS.find(b => b.taskNumber === slot);
      } else {
        const taskNumber = ASSESSMENT1_SLOT_TO_TASK[slot];
        blueprint = taskNumber != null
          ? ASSESSMENT1_TASK_BLUEPRINTS.find(b => b.taskNumber === taskNumber)
          : undefined;
      }

      // A lightweight student seed drives surface-content variation between students.
      // Different students get different emoji sets, numbers, and scenarios even for
      // the same cognitive concept.
      const studentSeed = studentMetrics?.studentName
        ? `[Student seed: ${studentMetrics.studentName.trim().slice(0, 8)}-${Date.now() % 9973}]`
        : `[Student seed: anon-${Date.now() % 9973}]`;

      // ── Build the prompt ────────────────────────────────────────────────────
      const blueprintHeader = assessmentType === 'functional_skills'
        ? '  ASSESSMENT 2 — FUNCTIONAL TASK BLUEPRINT (FROM PDF)'
        : '  ASSESSMENT 1 — COGNITIVE TASK BLUEPRINT (FROM PDF)';

      const blueprintSection = blueprint ? [
        '',
        '═══════════════════════════════════════════════════════════',
        blueprintHeader,
        '═══════════════════════════════════════════════════════════',
        `Task ${blueprint.taskNumber}: ${blueprint.taskName}`,
        `Skill Area: ${blueprint.skillArea}`,
        '',
        'FUNCTIONAL/COGNITIVE CONCEPT TO TEST (LOCKED — do NOT change this):',
        blueprint.cognitiveBlueprint,
        '',
        'SURFACE CONTENT VARIATION INSTRUCTIONS (randomize these):',
        blueprint.variationStrategy,
        '',
        studentSeed,
        '═══════════════════════════════════════════════════════════',
        'CRITICAL: The generated question MUST test the exact concept above.',
        'The scenario, symbols, numbers, and theme MUST be different from the default.',
        'Every student must receive a UNIQUE surface instance of this task.',
        '═══════════════════════════════════════════════════════════',
      ].join('\n') : '';

      const totalSlotsCount = (assessmentType === 'cognitive_ability' || assessmentType === 'functional_skills') ? 25 : 50;
      const examTitle = assessmentType === 'cognitive_ability'
        ? 'Assessment 1 — Cognitive Assessment'
        : assessmentType === 'functional_skills'
        ? 'Assessment 2 — Functional Assessment'
        : 'Full Assessment';

      const prompt = [
        'You are an inclusive education assessment designer for SEN students (Grade 8 to University, ages 13-21).',
        metricsContextNotes ? `\nStudent Adaptive Context:\n${metricsContextNotes}\n` : '',
        blueprintSection,
        'Generate a COMPLETE assessment question for:',
        `- Task / Slot: ${slot} of ${totalSlotsCount} (${examTitle})`,
        `- Domain: ${domainLabel}`,
        `- Skill: ${skillLabel}`,
        `- Sub-skill: ${base.subSkill}`,
        `- Difficulty: ${base.difficulty}/3`,
        '- Question type: pattern_matrix (multiple choice with a visual sequence)',
        '',
        'RULES (follow strictly):',
        '1. Write a clear, engaging question for SEN students',
        blueprint
          ? `1a. APPLY the ${assessmentType === 'functional_skills' ? 'Assessment 2 functional' : 'Assessment 1 cognitive'} blueprint above — the concept is fixed, only the surface content changes`
          : '',
        '2. CRITICAL VISUAL RULES FOR SHAPES AND SYMBOLS:',
        '   - NEVER write the text names of shapes next to shapes (do NOT write "Square ⬛", "Triangle 🔺", "Circle 🔴", or "⭐ Star"). Use ONLY the symbols/emojis themselves.',
        '   - For visual patterns and sequences, provide ONLY pure symbols/emojis in the "sequence" array (e.g. ["🔴", "🔺", "🔴", "🔺", "🔴", "❓"]).',
        '   - In options for visual questions, provide ONLY the clean symbols (e.g. label: "🔺" or label: "🔴 🔺 ⭐ ⬛"). DO NOT add explanations like "(Completes Pattern)" or "(Original Symbols)" into the label.',
        '3. Provide EXACTLY 3 answer options',
        '4. Mark EXACTLY 1 option as correct (correct: true), the other 2 must be false',
        '5. Options must directly and logically answer the question in "instructions"',
        '6. Output ONLY valid JSON — no markdown fences, no text outside the JSON',
        '',
        'JSON format:',
        '{',
        '  "title": "short title (max 6 words)",',
        '  "instructions": "the full question text shown to student",',
        '  "sequence": ["symbol 1", "symbol 2", "❓"],',
        '  "options": [',
        '    { "label": "correct answer symbol or text", "correct": true },',
        '    { "label": "wrong answer 1", "correct": false },',
        '    { "label": "wrong answer 2", "correct": false }',
        '  ],',
        '  "hintText": "one short helpful hint"',
        '}'
      ].join('\n');

      const aiResponseText = await this.client.generateCompletion(
        prompt,
        'You are an AI assessment designer for inclusive education. Output valid JSON only.'
      );

      if (!aiResponseText) {
        console.info(`[ActivityGenerator] Slot ${slot}: No AI response — using slot config fallback.`);
        return fallbackItem;
      }

      // ── Step 4: Parse ────────────────────────────────────────────────────
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn(`[ActivityGenerator] Slot ${slot}: AI returned non-JSON — using slot config fallback.`);
        return fallbackItem;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (_parseErr) {
        console.warn(`[ActivityGenerator] Slot ${slot}: AI JSON parse error — using slot config fallback.`);
        return fallbackItem;
      }

      // ── Step 4: Validate ─────────────────────────────────────────────────
      const hasTitle        = typeof parsed.title === 'string' && parsed.title.trim().length > 0;
      const hasInstructions = typeof parsed.instructions === 'string' && parsed.instructions.trim().length > 0;
      const hasOptions      = Array.isArray(parsed.options) && parsed.options.length === 3;

      if (!hasTitle || !hasInstructions || !hasOptions) {
        console.warn(`[ActivityGenerator] Slot ${slot}: AI response missing required fields — using slot config fallback.`);
        return fallbackItem;
      }

      const correctCount = (parsed.options as any[]).filter(o => o.correct === true).length;
      if (correctCount !== 1) {
        console.warn(`[ActivityGenerator] Slot ${slot}: AI gave ${correctCount} correct options (need 1) — using slot config fallback.`);
        return fallbackItem;
      }

      const allHaveLabels = (parsed.options as any[]).every(o => typeof o.label === 'string' && o.label.trim().length > 0);
      if (!allHaveLabels) {
        console.warn(`[ActivityGenerator] Slot ${slot}: AI option missing label — using slot config fallback.`);
        return fallbackItem;
      }

      // ── Step 5: Build coherent AI item with sanitized shape text ─────────
      const aiPayload = {
        instructions: parsed.instructions.trim(),
        sequence: Array.isArray(parsed.sequence) && parsed.sequence.length > 0
          ? (parsed.sequence as any[]).slice(0, 6).map(s => cleanShapeText(String(s)))
          : (fallbackPayload.sequence || []).map((s: string) => cleanShapeText(s)),
        options: (parsed.options as any[]).map(o => ({
          label:   cleanShapeText(String(o.label).trim()),
          emoji:   typeof o.emoji === 'string' ? o.emoji : '',
          correct: o.correct === true
        })),
        hint: typeof parsed.hintText === 'string' && parsed.hintText.trim().length > 0
          ? parsed.hintText.trim()
          : fallbackItem.hintText
      };

      console.info(`[ActivityGenerator] Slot ${slot}: AI question loaded successfully.`);

      return {
        ...fallbackItem,
        title:        parsed.title.trim(),
        instructions: aiPayload.instructions,
        hintText:     aiPayload.hint,
        payload:      aiPayload,
        source:       'azure_openai'
      };

    } catch (e) {
      console.warn(`[ActivityGenerator] Slot ${slot}: AI call failed — using slot config fallback.`, e);
      return fallbackItem;
    }
  }


  private buildProceduralPayload(base: QuestionBaseline): any {
    const slot = base.slot;

    // 1. Robot Mission
    if (base.type === 'robot_mission') {
      const config = ROBOT_MISSION_CONFIGS[slot] || {
        blocks: ['Move Forward ⬆️', 'Turn Right ➡️', 'Grab Item 🦾'],
        correctSequence: ['Move Forward ⬆️', 'Turn Right ➡️', 'Grab Item 🦾'],
        description: 'Guide Robo to the destination star!'
      };
      return {
        availableBlocks: config.blocks,
        correctSequence: config.correctSequence,
        description: config.description
      };
    }

    // 2. Picture Match
    if (base.type === 'picture_match') {
      const config = PICTURE_MATCH_CONFIGS[slot] || {
        audioPromptText: `Tap the correct option for: ${base.title}`,
        options: [
          { label: 'Option A (Correct)', emoji: '⭐', correct: true },
          { label: 'Option B', emoji: '🔴', correct: false },
          { label: 'Option C', emoji: '🟦', correct: false }
        ]
      };
      return config;
    }

    // 3. Motor Target
    if (base.type === 'motor_target') {
      return {
        targetSizePx: 50,
        targetShape: 'circle',
        instructionText: 'Click or tap inside the glowing blue target star!'
      };
    }

    // 4. Pattern Matrix / Rule Shift (Cognitive & Behavioral & Motor Qs)
    const cogConfig = COGNITIVE_SLOT_CONFIGS[slot] || {
      instructions: base.baselinePrompt,
      sequence: ['⭐ Choice A', '🔴 Choice B', '🟦 Choice C'],
      options: [
        { label: 'Correct Answer', emoji: '⭐', correct: true },
        { label: 'Wrong Answer 1', emoji: '🔴', correct: false },
        { label: 'Wrong Answer 2', emoji: '🟦', correct: false }
      ],
      hint: 'Look closely at the shapes and patterns.'
    };
    return cogConfig;
  }
}
