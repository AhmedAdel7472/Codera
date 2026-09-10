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
  { slot: 19, domain: 'cognitive_ability', skill: 'problem_solving', format: 'performance', subSkill: 'Planning & Problem Solving — Find Best Route', title: 'Task 19: Find Best Route', baselinePrompt: 'Determine the fastest and unobstructed path to the destination.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 20, domain: 'cognitive_ability', skill: 'problem_solving', format: 'structured', subSkill: 'Planning & Problem Solving — Solve Problem', title: 'Task 20: Solve Problem', baselinePrompt: 'Identify the required action or bug fix to resolve the problem.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 21, domain: 'cognitive_ability', skill: 'flexibility', format: 'performance', subSkill: 'Planning & Flexibility — Find Alternative', title: 'Task 21: Find Alternative', baselinePrompt: 'Find an effective contingency plan when the primary option fails.', maxPoints: 2, difficulty: 3, type: 'robot_mission' },
  { slot: 22, domain: 'cognitive_ability', skill: 'following_instructions', format: 'structured', subSkill: 'Rules & Instructions — Multiple Rules', title: 'Task 22: Multiple Rules', baselinePrompt: 'Identify the item meeting all simultaneous compound criteria.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 23, domain: 'cognitive_ability', skill: 'following_instructions', format: 'structured', subSkill: 'Rules & Instructions — Multi-Step Instructions', title: 'Task 23: Multi-Step Instructions', baselinePrompt: 'Execute a multi-step sequence following precise instructions in order.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 24, domain: 'cognitive_ability', skill: 'logical_reasoning', format: 'structured', subSkill: 'Information Processing — Multiple Conditions', title: 'Task 24: Multiple Conditions Info', baselinePrompt: 'Query and match data satisfying multiple concurrent attributes.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 25, domain: 'cognitive_ability', skill: 'problem_solving', format: 'structured', subSkill: 'Decision Making — Choose Best Option', title: 'Task 25: Choose Best Option', baselinePrompt: 'Weigh practical options and select the most sensible, safe decision.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' }
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
    instructions: 'Task 1 — Visual Recall: Look at the symbols shown: [🔴 Circle, 🔺 Triangle, ⭐ Star, ⬛ Square]. Select the group containing the exact symbols you saw before.',
    sequence: ['Original Symbols:', '🔴 Circle', '🔺 Triangle', '⭐ Star', '⬛ Square'],
    options: [
      { label: '🔴 🔺 ⭐ ⬛ (Original 4 Symbols)', emoji: '⭐', correct: true },
      { label: '🔴 🔷 ☀️ ⬛ (Contains Distractors)', emoji: '🔷', correct: false },
      { label: '🔺 ⭐ 🌙 🟢 (Wrong Items)', emoji: '🌙', correct: false }
    ],
    hint: 'Recall the 4 symbols shown at the start: Circle, Triangle, Star, Square.'
  },
  2: {
    instructions: 'Task 2 — Sequential Memory: Symbols were shown in this exact order: [⭐ Star → 🔴 Circle → 🔺 Triangle → ⬛ Square]. Which option restores the original order?',
    sequence: ['Scrambled Items: ⬛ Square, 🔺 Triangle, ⭐ Star, 🔴 Circle', 'Target: Restore Original Sequence'],
    options: [
      { label: '⭐ → 🔴 → 🔺 → ⬛ (Original Order)', emoji: '⭐', correct: true },
      { label: '⬛ → 🔺 → 🔴 → ⭐ (Reversed)', emoji: '⬛', correct: false },
      { label: '🔴 → ⭐ → ⬛ → 🔺 (Scrambled)', emoji: '🔴', correct: false }
    ],
    hint: 'The sequence started with Star ⭐ and ended with Square ⬛!'
  },
  3: {
    instructions: 'Task 3 — Remember & Follow: Remember these 3 steps: [1. Click Red Circle 🔴 → 2. Move to Blue Box 📦 → 3. Press Green Button 🟢]. Which sequence is correct?',
    sequence: ['Step 1: Click 🔴', 'Step 2: Move to 📦', 'Step 3: Press 🟢'],
    options: [
      { label: '🔴 Circle → 📦 Box → 🟢 Button (Correct Order)', emoji: '🟢', correct: true },
      { label: '🟢 Button → 🔴 Circle → 📦 Box (Wrong Order)', emoji: '🔴', correct: false },
      { label: '📦 Box → 🟢 Button → 🔴 Circle (Wrong Order)', emoji: '📦', correct: false }
    ],
    hint: 'Remember: Red Circle first, then Box, then Green Button!'
  },
  4: {
    instructions: 'Task 4 — Pattern Recognition: Identify the repeating pattern: [🔴 🔺 🔴 🔺 🔴 ❓]. Choose what comes next!',
    sequence: ['🔴 Circle', '🔺 Triangle', '🔴 Circle', '🔺 Triangle', '🔴 Circle', '❓ Next Symbol'],
    options: [
      { label: '🔺 Triangle (Completes Pattern)', emoji: '🔺', correct: true },
      { label: '🔴 Circle (Repeats Same)', emoji: '🔴', correct: false },
      { label: '⬛ Square (New Symbol)', emoji: '⬛', correct: false }
    ],
    hint: 'The pattern alternates between Circle 🔴 and Triangle 🔺!'
  },
  5: {
    instructions: 'Task 5 — Rule Detection: Notice the transformation rule: [🔴 → 🔺 → ⬛] and [🔺 → ⬛ → ⭐]. What comes next in: [⬛ → ⭐ → ❓]?',
    sequence: ['Example 1: 🔴 → 🔺 → ⬛', 'Example 2: 🔺 → ⬛ → ⭐', 'Solve: ⬛ → ⭐ → ❓'],
    options: [
      { label: '💎 Diamond (Next in Series)', emoji: '💎', correct: true },
      { label: '🔴 Circle (Old Symbol)', emoji: '🔴', correct: false },
      { label: '🔺 Triangle (Previous)', emoji: '🔺', correct: false }
    ],
    hint: 'Each sequence shifts one step forward in the symbol series!'
  },
  6: {
    instructions: 'Task 6 — Problem Solving: A delivery robot\'s main path to the charging pad is blocked by a safety fence 🚧. Which action safely reaches the goal?',
    sequence: ['Path A: Direct (Blocked by 🚧)', 'Path B: Side Corridor (Clear ✅)', 'Path C: Stairs (Inaccessible 🚫)'],
    options: [
      { label: 'Take Side Corridor B around fence ✅', emoji: '✅', correct: true },
      { label: 'Attempt to push through safety fence 🚧', emoji: '🚧', correct: false },
      { label: 'Turn off and wait indefinitely 🛑', emoji: '🛑', correct: false }
    ],
    hint: 'Find the open, unobstructed detour path!'
  },
  7: {
    instructions: 'Task 7 — Rule Switching: Round 1 was \'Sort by COLOR (Red)\'. Round 2 NEW RULE: \'Sort by SHAPE (Stars only, any color)\'. Which item follows the NEW rule?',
    sequence: ['Old Rule: Sort by COLOR 🔴', 'NEW RULE: Sort by SHAPE ⭐ (Stars)', 'Select the item matching the NEW rule:'],
    options: [
      { label: '🔵 Blue Star (Matches Shape Rule) ⭐', emoji: '⭐', correct: true },
      { label: '🔴 Red Circle (Follows Old Rule) 🔴', emoji: '🔴', correct: false },
      { label: '🟩 Green Square (Neither) 🟩', emoji: '🟩', correct: false }
    ],
    hint: 'Ignore the old color rule! Switch to the new rule: choose the Star ⭐!'
  },
  8: {
    instructions: 'Task 8 — Visual Matching: Target Shape: [ Hexagon ⬡ with a center dot • ]. Find the identical matching shape among the options:',
    sequence: ['Target: ⬡ [Hexagon + Center Dot •]', 'Examine all features carefully!'],
    options: [
      { label: '⬡ [Hexagon with Center Dot •] (Exact Match)', emoji: '⬡', correct: true },
      { label: '⬡ [Hexagon without Dot] (Missing Feature)', emoji: '⬡', correct: false },
      { label: '⬢ [Solid Filled Hexagon] (Wrong Fill)', emoji: '⬢', correct: false }
    ],
    hint: 'Check both the outline shape and the internal dot!'
  },
  9: {
    instructions: 'Task 9 — Mental Rotation: Target shape is an \'L-bracket\' ⌐ pointing Top-Right. If rotated 90° clockwise ↻, which option represents the rotated shape?',
    sequence: ['Original: ⌐ (Top-Right)', 'Rotation: 90° Clockwise ↻', 'Candidate = ❓'],
    options: [
      { label: '¬ (Bottom-Right) [90° Clockwise] ↻', emoji: '¬', correct: true },
      { label: '⌐ (Unchanged) [0°]', emoji: '⌐', correct: false },
      { label: 'L (180° Inverted)', emoji: 'L', correct: false }
    ],
    hint: 'Imagine turning the shape a quarter-turn to the right!'
  },
  10: {
    instructions: 'Task 10 — Spatial Relationships: A blue circle 🔵 is INSIDE a yellow square 🟨, and a green triangle 🔺 is ABOVE the yellow square. Which statement is correct?',
    sequence: ['🔺 Green Triangle (Above)', '🟨 Yellow Square', '🔵 Blue Circle (Inside Square)'],
    options: [
      { label: 'Blue circle 🔵 is inside yellow square 🟨', emoji: '🔵', correct: true },
      { label: 'Green triangle 🔺 is inside blue circle 🔵', emoji: '🔺', correct: false },
      { label: 'Yellow square 🟨 is above green triangle 🔺', emoji: '🟨', correct: false }
    ],
    hint: 'Look at the nested description: Blue is INSIDE Yellow!'
  },
  11: {
    instructions: 'Task 11 — Spatial Construction: To assemble the robotic arm, which 3 parts must be joined in order: [Base Plate 🔩 → Swivel Joint ⚙️ → Gripper Hand 🦾]?',
    sequence: ['Target: Functional Robot Arm', 'Parts: 🦾 Gripper, 🔩 Base, ⚙️ Joint'],
    options: [
      { label: '1. 🔩 Base Plate → 2. ⚙️ Joint → 3. 🦾 Gripper', emoji: '🦾', correct: true },
      { label: '1. 🦾 Gripper → 2. 🔩 Base Plate → 3. ⚙️ Joint', emoji: '⚙️', correct: false },
      { label: '1. ⚙️ Joint → 2. 🦾 Gripper → 3. 🔩 Base Plate', emoji: '🔩', correct: false }
    ],
    hint: 'Always build upward starting from the Base Plate 🔩!'
  },
  12: {
    instructions: 'Task 12 — Visual Search: Scan the items below and count how many Target Stars ⭐ appear among the distractors: [⭐ 🔴 ⭐ 🔷 ⭐ 🟢 ⬛]?',
    sequence: ['Display: ⭐  🔴  ⭐  🔷  ⭐  🟢  ⬛', 'Target to Count: ⭐ Stars'],
    options: [
      { label: 'Exactly 3 Stars ⭐', emoji: '⭐', correct: true },
      { label: 'Only 2 Stars ⭐', emoji: '2️⃣', correct: false },
      { label: '4 Stars ⭐', emoji: '4️⃣', correct: false }
    ],
    hint: 'Count each star: first one, middle one, third one = 3!'
  },
  13: {
    instructions: 'Task 13 — Symbol Matching Speed: Fast Match! Do these two symbols match exactly: [ 🛡️ Shield ] vs [ 🛡️ Shield ]?',
    sequence: ['Left Symbol: 🛡️', 'Right Symbol: 🛡️', 'Do they match?'],
    options: [
      { label: 'YES — Exact Match ✅', emoji: '✅', correct: true },
      { label: 'NO — Different ❌', emoji: '❌', correct: false },
      { label: 'Cannot Determine ❓', emoji: '❓', correct: false }
    ],
    hint: 'Both items are the identical Shield 🛡️ symbol!'
  },
  14: {
    instructions: 'Task 14 — Target Detection: Keep attention on this stream of items: [ 🚗 🚲 ✈️ 🚗 🚀 🚗 🚢 ]. Whenever you see the Target CAR 🚗, mark it. How many times did 🚗 appear?',
    sequence: ['Item Stream: 🚗 🚲 ✈️ 🚗 🚀 🚗 🚢', 'Target: 🚗'],
    options: [
      { label: 'Detected 3 times 🚗', emoji: '🚗', correct: true },
      { label: 'Detected 1 time 🚗', emoji: '1️⃣', correct: false },
      { label: 'Detected 5 times 🚗', emoji: '5️⃣', correct: false }
    ],
    hint: 'Item 1 is 🚗, Item 4 is 🚗, Item 6 is 🚗: 3 occurrences!'
  },
  15: {
    instructions: 'Task 15 — Attention Over Time: Over an 8-stage sequence, a beacon flashed [🟢 🟢 🟢 🔴 🟢 🟢 🔴 🟢]. Which stages had the RED alert 🔴?',
    sequence: ['Stages 1-4: 🟢 🟢 🟢 🔴', 'Stages 5-8: 🟢 🟢 🔴 🟢'],
    options: [
      { label: 'Stage 4 and Stage 7 🔴', emoji: '🔴', correct: true },
      { label: 'Stage 1 and Stage 8 🟢', emoji: '🟢', correct: false },
      { label: 'Stage 3 and Stage 5 🟡', emoji: '🟡', correct: false }
    ],
    hint: 'Count the positions of the red alerts: 4th and 7th!'
  },
  16: {
    instructions: 'Task 16 — Selective Attention: Find the KEY 🔑 located in the center of the cluttered toolbox, ignoring surrounding wires 🔌, nuts 🔩, and screws 🪛.',
    sequence: ['Surrounding: 🔩 🪛 🔌 🔩 🪛', 'Target in Center: 🔑', 'Filter out the noise!'],
    options: [
      { label: 'Center Key 🔑 (Target Identified)', emoji: '🔑', correct: true },
      { label: 'Corner Nut 🔩 (Distractor)', emoji: '🔩', correct: false },
      { label: 'Wire Clutter 🔌 (Distractor)', emoji: '🔌', correct: false }
    ],
    hint: 'Focus only on the key 🔑 and ignore all background clutter!'
  },
  17: {
    instructions: 'Task 17 — Change the Sorting Rule: The sorting rule just changed from \'Sort by Size\' to \'Sort by Color: BLUE\'. Which item goes into the bin?',
    sequence: ['Old Category: Large Items', 'NEW CATEGORY: BLUE Items 🔵', 'Candidate Items: [🔴 Big Red Ball, 🔵 Small Blue Gem, 🟩 Big Green Box]'],
    options: [
      { label: '🔵 Small Blue Gem (Matches New Color Rule)', emoji: '🔵', correct: true },
      { label: '🔴 Big Red Ball (Follows Old Size Rule)', emoji: '🔴', correct: false },
      { label: '🟩 Big Green Box (Wrong Color)', emoji: '🟩', correct: false }
    ],
    hint: 'Size does not matter now! Only the color Blue 🔵 counts!'
  },
  18: {
    instructions: 'Task 18 — Switch Between Rules: Alternate rules: Item 1 = Color (Yellow 🟡), Item 2 = Shape (Triangle 🔺), Item 3 = Color (Yellow 🟡). What rule applies to Item 4?',
    sequence: ['Item 1: Color Rule 🟡', 'Item 2: Shape Rule 🔺', 'Item 3: Color Rule 🟡', 'Item 4: ❓ Which Rule?'],
    options: [
      { label: 'Shape Rule 🔺 (Alternating Pattern)', emoji: '🔺', correct: true },
      { label: 'Color Rule 🟡 (Break in Pattern)', emoji: '🟡', correct: false },
      { label: 'Sound Rule 🔊 (Unrelated)', emoji: '🔊', correct: false }
    ],
    hint: 'The rules switch back and forth: Color → Shape → Color → Shape!'
  },
  19: {
    instructions: 'Task 19 — Find the Best Route: Robo needs to get from Start [A] to Goal [D]. Route 1 is 3 steps (clean). Route 2 is 5 steps with traffic. Route 3 is blocked. Which is best?',
    sequence: ['Route 1: A → B → D (3 steps, Clear ✅)', 'Route 2: A → C → E → F → D (5 steps ⏳)', 'Route 3: A → G → D (Blocked ⛔)'],
    options: [
      { label: 'Route 1: 3 steps, fastest and clear 🚀', emoji: '🚀', correct: true },
      { label: 'Route 2: 5 steps with traffic 🐢', emoji: '🐢', correct: false },
      { label: 'Route 3: Blocked path ⛔', emoji: '⛔', correct: false }
    ],
    hint: 'Route 1 is both clear and the shortest number of steps!'
  },
  20: {
    instructions: 'Task 20 — Solve the Problem: The program crashed because input variable \'age\' received text instead of a number. What action solves the bug?',
    sequence: ['Bug: Type Error (Expected number, got string)', 'Root Cause: No data type validation', 'Solution = ❓'],
    options: [
      { label: 'Convert input to integer before processing 🔢', emoji: '🔢', correct: true },
      { label: 'Delete the whole program and restart ❌', emoji: '❌', correct: false },
      { label: 'Ignore the error and run anyway ⚠️', emoji: '⚠️', correct: false }
    ],
    hint: 'Converting the input text into a number resolves the type mismatch!'
  },
  21: {
    instructions: 'Task 21 — Find an Alternative: The primary printer is out of paper 📄❌. You have an urgent handout to print for class. What is the best alternative plan?',
    sequence: ['Goal: Print urgent class handout', 'Problem: Primary printer out of paper', 'Alternative Action = ❓'],
    options: [
      { label: 'Send job to the Library network printer down the hall 🖨️', emoji: '🖨️', correct: true },
      { label: 'Cancel class and do not print 🚫', emoji: '🚫', correct: false },
      { label: 'Keep pressing print on empty printer 🔄', emoji: '🔄', correct: false }
    ],
    hint: 'Find another available printer to complete the task on time!'
  },
  22: {
    instructions: 'Task 22 — Multiple Rules: Select the item that satisfies ALL 3 rules: [1. Must be BLUE 🔵] AND [2. Must be a STAR ⭐] AND [3. Must have a BORDER 🔲].',
    sequence: ['Rule 1: BLUE 🔵', 'Rule 2: STAR ⭐', 'Rule 3: BORDER 🔲'],
    options: [
      { label: 'Blue Star with Border 🔲⭐ (All 3 Rules Satisfied)', emoji: '⭐', correct: true },
      { label: 'Blue Circle with Border 🔲🔵 (Fails Shape Rule)', emoji: '🔵', correct: false },
      { label: 'Yellow Star with Border 🔲⭐ (Fails Color Rule)', emoji: '🟡', correct: false }
    ],
    hint: 'Must be Blue AND Star AND Bordered: only one item has all three!'
  },
  23: {
    instructions: 'Task 23 — Multi-Step Instructions: Follow carefully: \'First open Folder A 📁, THEN copy File 1 📄, THEN rename it to Final.doc ✏️, FINALLY upload to Cloud ☁️\'. Which step is Step 3?',
    sequence: ['1. Open Folder A 📁', '2. Copy File 1 📄', '3. Rename to Final.doc ✏️', '4. Upload to Cloud ☁️'],
    options: [
      { label: 'Rename it to Final.doc ✏️ (Step 3)', emoji: '✏️', correct: true },
      { label: 'Copy File 1 📄 (Step 2)', emoji: '📄', correct: false },
      { label: 'Upload to Cloud ☁️ (Step 4)', emoji: '☁️', correct: false }
    ],
    hint: 'Look at the 3rd step in the sequence: Rename!'
  },
  24: {
    instructions: 'Task 24 — Multiple Conditions: From the student table, find the candidate who: [Grade = 10] AND [Club = Robotics 🤖] AND [Status = Active ✅].',
    sequence: ['Sam: Grade 9, Robotics, Active', 'Alex: Grade 10, Robotics, Active ✅', 'Jordan: Grade 10, Art, Active'],
    options: [
      { label: 'Alex (Grade 10, Robotics 🤖, Active ✅)', emoji: '🤖', correct: true },
      { label: 'Sam (Grade 9 — wrong grade)', emoji: '👤', correct: false },
      { label: 'Jordan (Art Club — wrong club)', emoji: '🎨', correct: false }
    ],
    hint: 'Alex matches all three requirements: Grade 10, Robotics, Active!'
  },
  25: {
    instructions: 'Task 25 — Choose the Best Option: You are working on a coding project and get completely stuck on a syntax error after trying for 15 minutes. What is the best decision?',
    sequence: ['Situation: Stuck on syntax error for 15 mins', 'Goal: Learn and make progress', 'Decision = ❓'],
    options: [
      { label: 'Check the documentation or ask the mentor for guidance 🙋', emoji: '🙋', correct: true },
      { label: 'Give up and close the laptop for the day 🚪', emoji: '🚪', correct: false },
      { label: 'Copy-paste random code without reading it 🎲', emoji: '🎲', correct: false }
    ],
    hint: 'Asking for help after trying independently is the smart, professional decision!'
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
    assessmentType: 'cognitive_ability' | 'all' = 'cognitive_ability'
  ): Promise<ActivityItem> {
    const base = assessmentType === 'cognitive_ability'
      ? (COGNITIVE_ASSESSMENT_BASELINES.find(b => b.slot === slot) || COGNITIVE_ASSESSMENT_BASELINES[0])
      : (QUESTION_BASELINES.find(b => b.slot === slot) || QUESTION_BASELINES[0]);

    // ── Step 1: Build guaranteed fallback from slot config ──────────────────
    const fallbackPayload = assessmentType === 'cognitive_ability'
      ? (COGNITIVE_25_TASK_CONFIGS[slot] || this.buildProceduralPayload(base))
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

      // ── Inject Assessment 1 PDF blueprint if this slot is mapped ───────────
      const taskNumber = assessmentType === 'cognitive_ability'
        ? slot
        : ASSESSMENT1_SLOT_TO_TASK[slot];
      const blueprint  = taskNumber != null
        ? ASSESSMENT1_TASK_BLUEPRINTS.find(b => b.taskNumber === taskNumber)
        : undefined;

      // A lightweight student seed drives surface-content variation between students.
      // Different students get different emoji sets, numbers, and scenarios even for
      // the same cognitive concept.
      const studentSeed = studentMetrics?.studentName
        ? `[Student seed: ${studentMetrics.studentName.trim().slice(0, 8)}-${Date.now() % 9973}]`
        : `[Student seed: anon-${Date.now() % 9973}]`;

      // ── Build the prompt ────────────────────────────────────────────────────
      const blueprintSection = blueprint ? [
        '',
        '═══════════════════════════════════════════════════════════',
        '  ASSESSMENT 1 — COGNITIVE TASK BLUEPRINT (FROM PDF)',
        '═══════════════════════════════════════════════════════════',
        `Task ${blueprint.taskNumber}: ${blueprint.taskName}`,
        `Skill Area: ${blueprint.skillArea}`,
        '',
        'COGNITIVE CONCEPT TO TEST (LOCKED — do NOT change this):',
        blueprint.cognitiveBlueprint,
        '',
        'SURFACE CONTENT VARIATION INSTRUCTIONS (randomize these):',
        blueprint.variationStrategy,
        '',
        studentSeed,
        '═══════════════════════════════════════════════════════════',
        'CRITICAL: The generated question MUST test the exact cognitive concept above.',
        'The scenario, symbols, numbers, and theme MUST be different from the default.',
        'Every student must receive a UNIQUE surface instance of this cognitive task.',
        '═══════════════════════════════════════════════════════════',
      ].join('\n') : '';

      const totalSlotsCount = assessmentType === 'cognitive_ability' ? 25 : 50;
      const examTitle = assessmentType === 'cognitive_ability' ? 'Assessment 1 — Cognitive Assessment' : 'Full Assessment';

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
          ? '1a. APPLY the Assessment 1 cognitive blueprint above — the concept is fixed, only the surface content changes'
          : '',
        '2. The "sequence" array shows the visual puzzle to the student (2-5 short emoji+text items)',
        '3. Provide EXACTLY 3 answer options',
        '4. Mark EXACTLY 1 option as correct (correct: true), the other 2 must be false',
        '5. Options must directly and logically answer the question in "instructions"',
        '6. Use simple language and supportive emojis',
        '7. Output ONLY valid JSON — no markdown fences, no text outside the JSON',
        '',
        'JSON format:',
        '{',
        '  "title": "short title (max 6 words)",',
        '  "instructions": "the full question text shown to student",',
        '  "sequence": ["emoji + text 1", "emoji + text 2", "emoji + ?"],',
        '  "options": [',
        '    { "label": "correct answer text", "emoji": "emoji", "correct": true },',
        '    { "label": "wrong answer 1", "emoji": "emoji", "correct": false },',
        '    { "label": "wrong answer 2", "emoji": "emoji", "correct": false }',
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

      // ── Step 5: Build coherent AI item ───────────────────────────────────
      const aiPayload = {
        instructions: parsed.instructions.trim(),
        sequence: Array.isArray(parsed.sequence) && parsed.sequence.length > 0
          ? (parsed.sequence as any[]).slice(0, 6).map(String)
          : (fallbackPayload.sequence || []),
        options: (parsed.options as any[]).map(o => ({
          label:   String(o.label).trim(),
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
