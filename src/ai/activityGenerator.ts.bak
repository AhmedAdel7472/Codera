import { AssessmentDomain, SkillName } from '../engine/telemetrySchema';
import { AzureOpenAIClient } from './azureOpenAIClient';

export interface ActivityItem {
  id: string;
  slot: number; // 1 to 60
  domain: AssessmentDomain;
  skill: SkillName;
  subSkill: string;
  title: string;
  instructions: string;
  difficulty: number;
  expectedTimeMs: number;
  maxPoints: number;
  type: 'pattern_matrix' | 'robot_mission' | 'picture_match' | 'rule_shift' | 'motor_target';
  payload: any;
  hintText: string;
}

export interface QuestionBaseline {
  slot: number; // 1 to 60
  domain: AssessmentDomain;
  skill: SkillName;
  subSkill: string;
  title: string;
  baselinePrompt: string;
  maxPoints: number;
  difficulty: 1 | 2 | 3;
  type: 'pattern_matrix' | 'robot_mission' | 'picture_match' | 'rule_shift' | 'motor_target';
}

export const QUESTION_BASELINES: QuestionBaseline[] = [
  // --- DOMAIN 1: COGNITIVE ABILITIES (Q1 - Q15 | 25 Pts) ---
  { slot: 1, domain: 'cognitive_ability', skill: 'classification', subSkill: 'Visual Discrimination', title: 'Match Identical Shapes', baselinePrompt: 'Match the identical shapes.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 2, domain: 'cognitive_ability', skill: 'classification', subSkill: 'Visual Discrimination', title: 'Spot the Difference', baselinePrompt: 'Identify the object that is different.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 3, domain: 'cognitive_ability', skill: 'pattern_recognition', subSkill: 'Visual Discrimination', title: 'Match the Pattern', baselinePrompt: 'Match the same visual pattern.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 4, domain: 'cognitive_ability', skill: 'classification', subSkill: 'Classification', title: 'Group Together', baselinePrompt: 'Which objects belong together in the same group?', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 5, domain: 'cognitive_ability', skill: 'classification', subSkill: 'Classification', title: 'Does Not Belong', baselinePrompt: 'Which object does not belong in this group?', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 6, domain: 'cognitive_ability', skill: 'sequencing', subSkill: 'Sequencing', title: 'Next in Sequence', baselinePrompt: 'What comes next in the sequence?', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 7, domain: 'cognitive_ability', skill: 'sequencing', subSkill: 'Sequencing', title: 'Order the Story', baselinePrompt: 'Arrange the pictures in the correct logical order.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 8, domain: 'cognitive_ability', skill: 'pattern_recognition', subSkill: 'Pattern Recognition', title: 'Complete Visual Pattern', baselinePrompt: 'Complete the visual pattern.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 9, domain: 'cognitive_ability', skill: 'pattern_recognition', subSkill: 'Pattern Recognition', title: 'Identify Missing Element', baselinePrompt: 'Identify the missing element in the grid.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 10, domain: 'cognitive_ability', skill: 'pattern_recognition', subSkill: 'Pattern Recognition', title: 'Continue Pattern', baselinePrompt: 'Continue the pattern to the next step.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 11, domain: 'cognitive_ability', skill: 'logical_reasoning', subSkill: 'Logical Reasoning', title: 'Solve the Problem', baselinePrompt: 'Which answer solves the logical problem?', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 12, domain: 'cognitive_ability', skill: 'logical_reasoning', subSkill: 'Logical Reasoning', title: 'What Happens Next', baselinePrompt: 'What should logically happen next?', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 13, domain: 'cognitive_ability', skill: 'problem_solving', subSkill: 'Problem Solving', title: 'Best Solution', baselinePrompt: 'Select the best solution for this situation.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 14, domain: 'cognitive_ability', skill: 'problem_solving', subSkill: 'Problem Solving', title: 'Sequence to Solve', baselinePrompt: 'Identify the correct sequence of actions to solve the problem.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 15, domain: 'cognitive_ability', skill: 'cause_and_effect', subSkill: 'Cause & Effect', title: 'Predict Cause & Effect', baselinePrompt: 'What will happen if this action is performed?', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },

  // --- DOMAIN 2: FUNCTIONAL ABILITIES (Q16 - Q30 | 25 Pts) ---
  { slot: 16, domain: 'functional_skills', skill: 'following_instructions', subSkill: '1-Step Instruction', title: 'Follow Simple Instruction', baselinePrompt: 'Follow a simple 1-step instruction.', maxPoints: 1, difficulty: 1, type: 'robot_mission' },
  { slot: 17, domain: 'functional_skills', skill: 'following_instructions', subSkill: '1-Step Instruction', title: 'Independent Instruction', baselinePrompt: 'Complete a second independent 1-step action.', maxPoints: 1, difficulty: 1, type: 'robot_mission' },
  { slot: 18, domain: 'functional_skills', skill: 'following_instructions', subSkill: '2-Step Instruction', title: 'Two-Step Action', baselinePrompt: 'Complete two actions in the correct order.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 19, domain: 'functional_skills', skill: 'following_instructions', subSkill: '2-Step Instruction', title: 'Direct Execution', baselinePrompt: 'Complete the task smoothly without repeating steps.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 20, domain: 'functional_skills', skill: 'following_instructions', subSkill: 'Multi-Step Task', title: 'Three-Step Activity', baselinePrompt: 'Complete a 3-step structured activity.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 21, domain: 'functional_skills', skill: 'following_instructions', subSkill: 'Multi-Step Task', title: 'Sequential Workflow', baselinePrompt: 'Complete the activity in the exact correct sequence.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 22, domain: 'functional_skills', skill: 'task_completion', subSkill: 'Task Completion', title: 'Finish Structured Task', baselinePrompt: 'Start and finish the structured robotics task.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 23, domain: 'functional_skills', skill: 'task_completion', subSkill: 'Task Completion', title: 'Minimal Prompt Task', baselinePrompt: 'Complete the goal with minimal visual prompting.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 24, domain: 'functional_skills', skill: 'working_memory', subSkill: 'Organization', title: 'Organize Tools', baselinePrompt: 'Organize the programming blocks before beginning.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 25, domain: 'functional_skills', skill: 'working_memory', subSkill: 'Organization', title: 'Return Materials', baselinePrompt: 'Return all unused blocks to their correct place.', maxPoints: 1, difficulty: 1, type: 'robot_mission' },
  { slot: 26, domain: 'functional_skills', skill: 'problem_solving', subSkill: 'Independence', title: 'Independent Task', baselinePrompt: 'Complete the familiar coding mission independently.', maxPoints: 2, difficulty: 3, type: 'robot_mission' },
  { slot: 27, domain: 'functional_skills', skill: 'problem_solving', subSkill: 'Independence', title: 'Ask for Help', baselinePrompt: 'Identify when and how to request assistance appropriately.', maxPoints: 1, difficulty: 2, type: 'pattern_matrix' },
  { slot: 28, domain: 'functional_skills', skill: 'problem_solving', subSkill: 'Functional Problem Solving', title: 'Overcome Blockade', baselinePrompt: 'Identify what to do when a path cannot be completed.', maxPoints: 2, difficulty: 3, type: 'robot_mission' },
  { slot: 29, domain: 'functional_skills', skill: 'attention', subSkill: 'Learning Routine', title: 'Learning Routine', baselinePrompt: 'Follow the expected technology learning routine.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 30, domain: 'functional_skills', skill: 'task_completion', subSkill: 'Functional Learning', title: 'Practical Learning Task', baselinePrompt: 'Complete a simple practical digital learning task.', maxPoints: 1, difficulty: 2, type: 'robot_mission' },

  // --- DOMAIN 3: COMMUNICATION LEVEL (Q31 - Q40 | 20 Pts) ---
  { slot: 31, domain: 'communication_level', skill: 'listening', subSkill: 'Receptive Communication', title: 'Listen & Follow', baselinePrompt: 'Follow a spoken audio instruction.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 32, domain: 'communication_level', skill: 'listening', subSkill: 'Receptive Communication', title: 'Identify Object', baselinePrompt: 'Identify the requested target object from audio prompt.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 33, domain: 'communication_level', skill: 'vocabulary', subSkill: 'Expressive Communication', title: 'Name Component', baselinePrompt: 'Select the correct name for the highlighted technology item.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 34, domain: 'communication_level', skill: 'vocabulary', subSkill: 'Expressive Communication', title: 'Express Choice', baselinePrompt: 'Communicate the correct preference or action needed.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 35, domain: 'communication_level', skill: 'understanding_instructions', subSkill: 'Following Instructions', title: 'Two-Step Audio', baselinePrompt: 'Follow a 2-step audio communication instruction.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 36, domain: 'communication_level', skill: 'understanding_instructions', subSkill: 'Following Instructions', title: 'Classroom Tech Instruction', baselinePrompt: 'Follow a functional technology classroom command.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 37, domain: 'communication_level', skill: 'picture_matching', subSkill: 'Identification', title: 'Identify Digital Icon', baselinePrompt: 'Identify the matching digital icon or symbol.', maxPoints: 2, difficulty: 1, type: 'picture_match' },
  { slot: 38, domain: 'communication_level', skill: 'verbal_comprehension', subSkill: 'Question Response', title: 'Answer WH-Question', baselinePrompt: 'Answer the question: "Which tool helps robots move?"', maxPoints: 2, difficulty: 3, type: 'picture_match' },
  { slot: 39, domain: 'communication_level', skill: 'verbal_comprehension', subSkill: 'Functional Communication', title: 'Request Clarification', baselinePrompt: 'Choose the symbol used to request help or clarification.', maxPoints: 2, difficulty: 2, type: 'picture_match' },
  { slot: 40, domain: 'communication_level', skill: 'understanding_instructions', subSkill: 'Problem Solving Communication', title: 'Communicate Solution', baselinePrompt: 'Communicate the correct solution choice to the team.', maxPoints: 2, difficulty: 3, type: 'picture_match' },

  // --- DOMAIN 4: BEHAVIORAL & LEARNING READINESS (Q41 - Q50 | 15 Pts) ---
  { slot: 41, domain: 'behavioral_readiness', skill: 'persistence', subSkill: 'Attention', title: 'Sustain Attention', baselinePrompt: 'Maintains focus when a puzzle takes longer to solve.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 42, domain: 'behavioral_readiness', skill: 'persistence', subSkill: 'Task Engagement', title: 'Remain Engaged', baselinePrompt: 'Remains engaged in the learning activity despite distractions.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 43, domain: 'behavioral_readiness', skill: 'adaptability', subSkill: 'Instruction Following', title: 'Responds to Signals', baselinePrompt: 'Responds promptly when given a stop or transition instruction.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 44, domain: 'behavioral_readiness', skill: 'error_recovery', subSkill: 'Response to Correction', title: 'Accept Redirection', baselinePrompt: 'Accepts gentle feedback and adjusts the approach calmly.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 45, domain: 'behavioral_readiness', skill: 'flexibility', subSkill: 'Frustration Tolerance', title: 'Persevere on Error', baselinePrompt: 'Continues trying calmly after an initial error or bug.', maxPoints: 2, difficulty: 3, type: 'pattern_matrix' },
  { slot: 46, domain: 'behavioral_readiness', skill: 'adaptability', subSkill: 'Transition', title: 'Smooth Transition', baselinePrompt: 'Moves smoothly from one activity to the next when time is up.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 47, domain: 'behavioral_readiness', skill: 'adaptability', subSkill: 'Turn Taking / Waiting', title: 'Wait Appropriately', baselinePrompt: 'Waits patiently while another student or robot finishes their turn.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 48, domain: 'behavioral_readiness', skill: 'persistence', subSkill: 'Motivation', title: 'Eager to Learn', baselinePrompt: 'Demonstrates willingness to try a new technology challenge.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },
  { slot: 49, domain: 'behavioral_readiness', skill: 'response_to_feedback', subSkill: 'Independence', title: 'Independent Effort', baselinePrompt: 'Attempts the problem independently before asking for help.', maxPoints: 1, difficulty: 2, type: 'pattern_matrix' },
  { slot: 50, domain: 'behavioral_readiness', skill: 'response_to_feedback', subSkill: 'Help Seeking', title: 'Polite Help Request', baselinePrompt: 'Requests assistance politely and appropriately when stuck.', maxPoints: 1, difficulty: 1, type: 'pattern_matrix' },

  // --- DOMAIN 5: FINE MOTOR & TECHNOLOGY SKILLS (Q51 - Q60 | 15 Pts) ---
  { slot: 51, domain: 'fine_motor_technology', skill: 'touch_interaction', subSkill: 'Fine Motor Control', title: 'Object Precision', baselinePrompt: 'Tap or manipulate small digital targets with precision.', maxPoints: 2, difficulty: 2, type: 'motor_target' },
  { slot: 52, domain: 'fine_motor_technology', skill: 'mouse_control', subSkill: 'Hand-Eye Coordination', title: 'Accurate Movement', baselinePrompt: 'Move pointer accurately to the target element.', maxPoints: 1, difficulty: 1, type: 'motor_target' },
  { slot: 53, domain: 'fine_motor_technology', skill: 'drag_and_drop', subSkill: 'Object Manipulation', title: 'Assemble Structure', baselinePrompt: 'Drag blocks to assemble a simple structure.', maxPoints: 2, difficulty: 2, type: 'robot_mission' },
  { slot: 54, domain: 'fine_motor_technology', skill: 'mouse_control', subSkill: 'Mouse/Trackpad', title: 'Pointer Navigation', baselinePrompt: 'Control pointer speed and target alignment.', maxPoints: 2, difficulty: 2, type: 'motor_target' },
  { slot: 55, domain: 'fine_motor_technology', skill: 'keyboard_navigation', subSkill: 'Keyboard Skills', title: 'Key Identification', baselinePrompt: 'Locate and press key directional arrows or spacebar.', maxPoints: 2, difficulty: 2, type: 'pattern_matrix' },
  { slot: 56, domain: 'fine_motor_technology', skill: 'touch_interaction', subSkill: 'Touchscreen', title: 'Touch Target', baselinePrompt: 'Select the highlighted item cleanly on screen.', maxPoints: 1, difficulty: 1, type: 'motor_target' },
  { slot: 57, domain: 'fine_motor_technology', skill: 'drag_and_drop', subSkill: 'Drag & Drop', title: 'Drag Block to Slot', baselinePrompt: 'Complete a digital drag-and-drop alignment.', maxPoints: 1, difficulty: 1, type: 'robot_mission' },
  { slot: 58, domain: 'fine_motor_technology', skill: 'basic_robot_control', subSkill: 'Digital Navigation', title: 'Select App Icon', baselinePrompt: 'Open or select the correct learning activity application.', maxPoints: 1, difficulty: 2, type: 'picture_match' },
  { slot: 59, domain: 'fine_motor_technology', skill: 'basic_robot_control', subSkill: 'Tech Problem Solving', title: 'Fix Screen Freeze', baselinePrompt: 'Identify what button to click if a digital task freezes.', maxPoints: 1, difficulty: 3, type: 'pattern_matrix' },
  { slot: 60, domain: 'fine_motor_technology', skill: 'basic_robot_control', subSkill: 'Technology Independence', title: 'Independent Navigation', baselinePrompt: 'Complete the basic technology startup sequence independently.', maxPoints: 2, difficulty: 3, type: 'robot_mission' }
];

export class ActivityGenerator {
  private client: AzureOpenAIClient;

  constructor() {
    this.client = new AzureOpenAIClient();
  }

  /**
   * Generates a unique assessment activity (1 of 60) based on its fixed baseline specification.
   * Ensures EXACTLY 3 answer choices per question.
   */
  public async generateActivity(slot: number): Promise<ActivityItem> {
    const safeSlot = Math.max(1, Math.min(60, slot));
    const baseline = QUESTION_BASELINES[safeSlot - 1];

    const prompt = `You are generating Question #${baseline.slot} of 60 for the Cognix SEN Placement Assessment (aged 6-12).
Baseline Competency: "${baseline.baselinePrompt}" (Domain: ${baseline.domain}, Sub-skill: ${baseline.subSkill}, Difficulty: ${baseline.difficulty}/3).

CRITICAL REQUIREMENT:
- Generate a child-friendly, engaging variation of this question.
- MUST HAVE EXACTLY 3 ANSWER CHOICES (A, B, C).
- 1 choice MUST be fully correct, 2 choices MUST be plausible wrong distractors.
- Keep language simple, positive, encouraging, and easy to read.

Return ONLY valid JSON with no markdown wrapping:
{
  "title": "${baseline.title}",
  "instructions": "Clear simple question prompt for the child",
  "type": "${baseline.type}",
  "hintText": "Step-by-step encouraging hint",
  "payload": {
    "options": [
      { "label": "Option A text or emoji", "correct": true },
      { "label": "Option B text or emoji", "correct": false },
      { "label": "Option C text or emoji", "correct": false }
    ],
    "correctIndex": 0
  }
}`;

    try {
      const aiResponse = await this.client.generateCompletion(prompt);

      if (aiResponse) {
        let cleanJson = aiResponse.trim();
        if (cleanJson.startsWith('```json')) {
          cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
        }
        const lastBrace = cleanJson.lastIndexOf('}');
        if (lastBrace !== -1) cleanJson = cleanJson.substring(0, lastBrace + 1);

        const parsed = JSON.parse(cleanJson);
        if (parsed.instructions && parsed.payload && Array.isArray(parsed.payload.options)) {
          // Force exactly 3 options
          if (parsed.payload.options.length > 3) {
            parsed.payload.options = parsed.payload.options.slice(0, 3);
          }
          
          return {
            id: `q_slot_${baseline.slot}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            slot: baseline.slot,
            domain: baseline.domain,
            skill: baseline.skill,
            subSkill: baseline.subSkill,
            title: parsed.title || baseline.title,
            instructions: parsed.instructions,
            difficulty: baseline.difficulty,
            expectedTimeMs: 90000, // 1:30 fixed timer
            maxPoints: baseline.maxPoints,
            type: baseline.type,
            payload: parsed.payload,
            hintText: parsed.hintText || 'Take your time and think carefully!'
          };
        }
      }
    } catch (e) {
      // Fall through to procedural fallback
    }

    return this.generateDynamicFallback(safeSlot);
  }

  /**
   * Procedural generator creating a deterministic unique 3-choice variation for any of the 60 question slots.
   */
  public generateDynamicFallback(slot: number): ActivityItem {
    const safeSlot = Math.max(1, Math.min(60, slot));
    const baseline = QUESTION_BASELINES[safeSlot - 1];
    const id = `fallback_q_${safeSlot}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let payload: any = {};
    let instructions = baseline.baselinePrompt;
    let hintText = 'Look at all options carefully before picking.';

    // Generate custom 3-choice payload based on baseline skill
    if (baseline.type === 'robot_mission') {
      const blocks = ['Move Forward ⬆️', 'Turn Right ➡️', 'Grab Item 🦾'];
      payload = {
        availableBlocks: blocks,
        correctSequence: ['Move Forward ⬆️', 'Grab Item 🦾'],
        options: [
          { label: 'Move Forward ➔ Grab Item', correct: true },
          { label: 'Turn Right ➔ Turn Right', correct: false },
          { label: 'Grab Item ➔ Stop', correct: false }
        ],
        correctIndex: 0
      };
      hintText = 'Add the move block first, then grab the item!';
    } else if (baseline.type === 'picture_match') {
      payload = {
        audioPromptText: `Select the item: ${baseline.title}`,
        options: [
          { label: 'Target Item 🎯', emoji: '🤖', correct: true },
          { label: 'Other Item A', emoji: '🍎', correct: false },
          { label: 'Other Item B', emoji: '⚽', correct: false }
        ],
        correctIndex: 0
      };
      hintText = 'Click the robot icon!';
    } else if (baseline.type === 'motor_target') {
      payload = {
        targetsCount: 3,
        movementSpeed: 1.2,
        options: [
          { label: 'Target Center 🎯', correct: true },
          { label: 'Side Corner 📐', correct: false },
          { label: 'Outer Boundary ⭕', correct: false }
        ],
        correctIndex: 0
      };
      hintText = 'Click directly inside the glowing circle.';
    } else {
      // General MCQ (exactly 3 choices)
      if (baseline.domain === 'cognitive_ability') {
        payload = {
          sequence: ['🔵', '🔴', '🔵', '🔴', '?'],
          options: [
            { label: '🔵 Blue Circle', correct: true },
            { label: '🟢 Green Circle', correct: false },
            { label: '🟡 Yellow Star', correct: false }
          ],
          correctIndex: 0
        };
        hintText = 'Notice how Blue and Red repeat one after another.';
      } else if (baseline.domain === 'behavioral_readiness') {
        payload = {
          options: [
            { label: 'Stay calm, wait your turn, and try politely', correct: true },
            { label: 'Get upset and stop working', correct: false },
            { label: 'Leave the room immediately', correct: false }
          ],
          correctIndex: 0
        };
        hintText = 'Choose the option that shows patience and self-control.';
      } else {
        payload = {
          options: [
            { label: 'Correct Solution Action 🌟', correct: true },
            { label: 'Incorrect Action A ❌', correct: false },
            { label: 'Incorrect Action B 🛑', correct: false }
          ],
          correctIndex: 0
        };
      }
    }

    // Shuffle 3 options deterministically while tracking correctIndex
    if (payload.options && Array.isArray(payload.options) && payload.options.length === 3) {
      const correctItem = payload.options.find((o: any) => o.correct) || payload.options[0];
      const shuffled = this.shuffleArray([...payload.options]);
      payload.options = shuffled;
      payload.correctIndex = shuffled.indexOf(correctItem);
    }

    return {
      id,
      slot: baseline.slot,
      domain: baseline.domain,
      skill: baseline.skill,
      subSkill: baseline.subSkill,
      title: `Q${baseline.slot}: ${baseline.title}`,
      instructions,
      difficulty: baseline.difficulty,
      expectedTimeMs: 90000, // 1:30 fixed timer
      maxPoints: baseline.maxPoints,
      type: baseline.type,
      payload,
      hintText
    };
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

