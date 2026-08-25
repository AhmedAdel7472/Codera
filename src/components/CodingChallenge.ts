// ---------------------------------------------------------------------------
// CodingChallenge.ts — CodeRa Phase 4
// Supplementary 5–10 min coding challenge for L3 / L4 students.
// NOT part of the 50-question base score — used as Placement Verification.
// ---------------------------------------------------------------------------

import { CodingChallengeResult } from '../engine/telemetrySchema';

// ---------------------------------------------------------------------------
// Challenge question definitions
// ---------------------------------------------------------------------------
export interface CodingChallengeQuestion {
  id: string;
  track: 'L3' | 'L4' | 'both';     // which path this question appears in
  title: string;
  concept: string;                   // e.g. "Loops", "Conditionals", "Debugging"
  storyContext: string;              // narrative framing for the puzzle
  mapHtml: string;                   // visual map HTML (puzzle diagram)
  availableBlocks: string[];
  correctSequence: string[];
  hint: string;
  maxTimeSec: number;                // per-question timer
  difficultyLabel: 'Medium' | 'Hard' | 'Expert';
}

export const CODING_CHALLENGE_QUESTIONS: CodingChallengeQuestion[] = [
  // ── Q1 (both tracks) ─────────────────────────────────────────────────────
  {
    id: 'cc_1',
    track: 'both',
    title: 'Loop the Robot',
    concept: 'Repetition / Loops',
    storyContext: 'Robo needs to water 3 flower pots in a row. Write a loop so Robo moves forward and waters each pot without repeating the blocks manually.',
    mapHtml: `[🤖 Robo] ─ Repeat 3 times: ─ [➡️ Move] ─ [💧 Water] ─ [🌸🌸🌸 Done!]`,
    availableBlocks: ['Repeat 3 ×', 'Move Forward ⬆️', 'Water Plant 💧', 'Stop 🛑', 'Turn Right ➡️'],
    correctSequence: ['Repeat 3 ×', 'Move Forward ⬆️', 'Water Plant 💧'],
    hint: 'Use REPEAT 3× to avoid writing the same blocks three times!',
    maxTimeSec: 120,
    difficultyLabel: 'Medium',
  },

  // ── Q2 (both tracks) ─────────────────────────────────────────────────────
  {
    id: 'cc_2',
    track: 'both',
    title: 'If the Door is Locked',
    concept: 'Conditionals / If-Else',
    storyContext: 'Robo reaches a door. IF the door is locked 🔒, Robo should use the key 🗝️. IF the door is open 🚪, Robo should just walk through.',
    mapHtml: `[🤖 Robo] ─ [❓ Door?] ─ IF Locked 🔒 ─ [🗝️ Use Key] ─ [🚪 Open] ─ [✅ Inside!]`,
    availableBlocks: ['IF Door Locked 🔒', 'Use Key 🗝️', 'Walk Through 🚶', 'ELSE', 'Stop 🛑'],
    correctSequence: ['IF Door Locked 🔒', 'Use Key 🗝️', 'ELSE', 'Walk Through 🚶'],
    hint: 'Think: IF one thing is true, do A. ELSE do B.',
    maxTimeSec: 120,
    difficultyLabel: 'Medium',
  },

  // ── Q3 (both tracks) ─────────────────────────────────────────────────────
  {
    id: 'cc_3',
    track: 'both',
    title: 'Fix the Bug 🐛',
    concept: 'Debugging',
    storyContext: 'Robo was supposed to turn RIGHT then move forward, but instead it turned LEFT and got stuck. Fix the bug in the code sequence below!',
    mapHtml: `[🤖 Robo] ─ ❌ Turn Left ⬅️ ─ [🧱 WALL! Stuck] → Fix: Turn Right ➡️ → [⭐ Goal!]`,
    availableBlocks: ['Turn Right ➡️', 'Move Forward ⬆️', 'Turn Left ⬅️', 'Stop 🛑', 'Jump 🦸'],
    correctSequence: ['Turn Right ➡️', 'Move Forward ⬆️'],
    hint: 'Find the wrong block and replace it with the correct direction!',
    maxTimeSec: 90,
    difficultyLabel: 'Medium',
  },

  // ── Q4 (L4 only) ──────────────────────────────────────────────────────────
  {
    id: 'cc_4',
    track: 'L4',
    title: 'Nested Loop Challenge',
    concept: 'Nested Loops',
    storyContext: 'Robo needs to stamp a 2×3 grid of stars ⭐. That means 2 columns, each with 3 rows. Build the nested loop!',
    mapHtml: `[🤖 Robo] ─ Outer Loop (2 cols): ─ Inner Loop (3 rows): ─ [⭐ Stamp!] ─ [↩️ Next Row] ─ [↩️ Next Col] ─ [✅ Grid Done!]`,
    availableBlocks: ['Repeat 2 × (Outer)', 'Repeat 3 × (Inner)', 'Stamp Star ⭐', 'Move Down ⬇️', 'Reset Column ↩️', 'Stop 🛑'],
    correctSequence: ['Repeat 2 × (Outer)', 'Repeat 3 × (Inner)', 'Stamp Star ⭐', 'Move Down ⬇️', 'Reset Column ↩️'],
    hint: 'The inner loop runs 3 times for EVERY one run of the outer loop!',
    maxTimeSec: 150,
    difficultyLabel: 'Expert',
  },

  // ── Q5 (L4 only) ──────────────────────────────────────────────────────────
  {
    id: 'cc_5',
    track: 'L4',
    title: 'Algorithm Design: Maze Solver',
    concept: 'Algorithmic Thinking',
    storyContext: 'Design a step-by-step algorithm for Robo to navigate from START to FINISH through the maze: Go right 2 steps → Go down 1 step → Go right 1 step → Pick up treasure → Return to start.',
    mapHtml: `[🚩 START] ─ →→ [⬜] → [⬜] ─ ↓ [⬜] ─ → [💎 Treasure!] ─ ← ↑ ← ← [🏁 FINISH]`,
    availableBlocks: ['Move Right ➡️ ×2', 'Move Down ⬇️ ×1', 'Move Right ➡️ ×1', 'Pick Up 🦾', 'Return to Start 🔄', 'Stop 🛑'],
    correctSequence: ['Move Right ➡️ ×2', 'Move Down ⬇️ ×1', 'Move Right ➡️ ×1', 'Pick Up 🦾', 'Return to Start 🔄'],
    hint: 'Think step-by-step: where does Robo start, and what is the SHORTEST path?',
    maxTimeSec: 150,
    difficultyLabel: 'Expert',
  },
];

// ---------------------------------------------------------------------------
// L3 path uses questions 1, 2, 3 (both-track questions only)
// L4 path uses all 5 questions
// ---------------------------------------------------------------------------
function getChallengesForTrack(baseTrack: string): CodingChallengeQuestion[] {
  if (baseTrack.includes('L4')) {
    return CODING_CHALLENGE_QUESTIONS; // all 5
  }
  // L3: only 'both' track questions (first 3)
  return CODING_CHALLENGE_QUESTIONS.filter(q => q.track === 'both');
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface ChallengeAnswerState {
  robotSequence: string[];
  isSolved: boolean;
  timedOut: boolean;
  timeSpentMs: number;
  attemptsCount: number;
}

// ---------------------------------------------------------------------------
// CodingChallenge class
// ---------------------------------------------------------------------------
export class CodingChallenge {
  private container: HTMLElement;
  private baseTrack: string;          // 'L3 Developer' or 'L4 Career Ready'
  private challenges: CodingChallengeQuestion[];
  private currentIndex: number = 0;
  private answers: ChallengeAnswerState[] = [];
  private startTimestamp: number = 0;
  private questionStartTimestamp: number = 0;
  private questionTimerSecondsRemaining: number = 0;
  private questionTimerInterval: any = null;
  private onComplete: (result: CodingChallengeResult) => void;

  constructor(
    container: HTMLElement,
    baseTrack: string,
    onComplete: (result: CodingChallengeResult) => void
  ) {
    this.container = container;
    this.baseTrack = baseTrack;
    this.onComplete = onComplete;
    this.challenges = getChallengesForTrack(baseTrack);
    this.answers = this.challenges.map(() => ({
      robotSequence: [],
      isSolved: false,
      timedOut: false,
      timeSpentMs: 0,
      attemptsCount: 0,
    }));
  }

  public start() {
    this.startTimestamp = Date.now();
    this.renderIntroScreen();
  }

  // ── Intro Screen ────────────────────────────────────────────────────────
  private renderIntroScreen() {
    const isL4 = this.baseTrack.includes('L4');
    const trackEmoji = isL4 ? '🚀' : '⭐';
    const trackColor = isL4 ? '#a855f7' : '#06b6d4';

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:70vh; text-align:center; padding:2.5rem 1rem; color:#fff;">
        <div style="font-size:4rem; margin-bottom:1.5rem; animation:bounce 1.5s infinite;">${trackEmoji}</div>

        <span style="background:rgba(6,182,212,0.15); border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:0.35rem 1.2rem; border-radius:20px; font-weight:800; font-size:0.85rem; text-transform:uppercase; margin-bottom:1.25rem;">
          🎉 Placement Verification — Coding Challenge Unlocked!
        </span>

        <h2 style="font-size:2rem; font-weight:800; margin-bottom:0.75rem; background:linear-gradient(135deg,#fff,${trackColor}); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
          ${this.baseTrack} — Coding Challenge
        </h2>

        <p style="color:var(--text-secondary); font-size:1.05rem; max-width:520px; line-height:1.65; margin-bottom:2rem;">
          Excellent work on the 50-question assessment! Your score qualified you for this
          <strong style="color:#fff;">${this.challenges.length}-question</strong> bonus coding challenge.
          This is <em>not</em> part of your base score — it verifies and strengthens your placement.
        </p>

        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; max-width:480px; width:100%; margin-bottom:2rem;">
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:1rem; border-radius:12px; text-align:center;">
            <div style="font-size:1.6rem; font-weight:900; color:var(--accent-cyan);">${this.challenges.length}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Challenges</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:1rem; border-radius:12px; text-align:center;">
            <div style="font-size:1.6rem; font-weight:900; color:var(--accent-amber);">~${Math.ceil(this.challenges.length * 2)} min</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Estimated Time</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:1rem; border-radius:12px; text-align:center;">
            <div style="font-size:1.6rem; font-weight:900; color:var(--accent-emerald);">Drag</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Block Coding</div>
          </div>
        </div>

        <button id="start-challenge-btn" class="btn btn-primary" style="font-size:1.15rem; padding:1rem 3rem; background:linear-gradient(135deg,var(--accent-cyan),var(--accent-blue)); font-weight:800; box-shadow:0 6px 20px rgba(6,182,212,0.4);">
          🚀 Start Coding Challenge
        </button>
        <button id="skip-challenge-btn" class="btn btn-secondary" style="margin-top:0.85rem; font-size:0.9rem; padding:0.6rem 1.5rem; opacity:0.75;">
          Skip (View Report Without Challenge)
        </button>
      </div>
    `;

    this.container.querySelector('#start-challenge-btn')?.addEventListener('click', () => {
      this.loadChallenge(0);
    });

    this.container.querySelector('#skip-challenge-btn')?.addEventListener('click', () => {
      this.completeChallenge(true);
    });
  }

  // ── Load a single challenge ──────────────────────────────────────────────
  private loadChallenge(index: number) {
    this.currentIndex = index;
    this.questionStartTimestamp = Date.now();
    const q = this.challenges[index];
    this.questionTimerSecondsRemaining = q.maxTimeSec;

    this.renderChallenge();
    this.startQuestionTimer();
  }

  private startQuestionTimer() {
    if (this.questionTimerInterval) clearInterval(this.questionTimerInterval);
    this.questionTimerInterval = setInterval(() => {
      this.questionTimerSecondsRemaining--;
      this.updateTimerUI();
      if (this.questionTimerSecondsRemaining <= 0) {
        clearInterval(this.questionTimerInterval);
        this.answers[this.currentIndex].timedOut = true;
        this.answers[this.currentIndex].timeSpentMs = this.challenges[this.currentIndex].maxTimeSec * 1000;
        this.advanceChallenge();
      }
    }, 1000);
  }

  private updateTimerUI() {
    const el = document.getElementById('cc-timer-display');
    const ring = document.getElementById('cc-timer-ring');
    if (el) {
      const m = Math.floor(this.questionTimerSecondsRemaining / 60);
      const s = String(this.questionTimerSecondsRemaining % 60).padStart(2, '0');
      el.textContent = `${m}:${s}`;
      el.style.color = this.questionTimerSecondsRemaining <= 15 ? '#ef4444' : 'var(--accent-cyan)';
    }
    if (ring) {
      const maxSec = this.challenges[this.currentIndex].maxTimeSec;
      ring.style.width = `${(this.questionTimerSecondsRemaining / maxSec) * 100}%`;
      ring.style.background = this.questionTimerSecondsRemaining <= 15 ? '#ef4444' : 'var(--accent-cyan)';
    }
  }

  // ── Render a coding challenge question ──────────────────────────────────
  private renderChallenge() {
    const q = this.challenges[this.currentIndex];
    const ans = this.answers[this.currentIndex];
    const maxSec = q.maxTimeSec;
    const totalChallenges = this.challenges.length;
    const progressPct = Math.round(((this.currentIndex) / totalChallenges) * 100);

    this.container.innerHTML = `
      <!-- Progress Bar -->
      <div style="background:rgba(15,23,42,0.7); border:1px solid var(--border-color); border-radius:14px; padding:0.85rem 1.25rem; margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.4rem;">💻</span>
            <div>
              <div style="font-weight:800; font-size:1rem; color:var(--accent-cyan);">
                Coding Challenge — ${this.baseTrack}
              </div>
              <div style="font-size:0.8rem; color:var(--text-secondary);">
                Challenge ${this.currentIndex + 1} of ${totalChallenges} • Concept: <strong style="color:#fff;">${q.concept}</strong>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <!-- Timer -->
            <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:0.4rem 0.9rem; border-radius:20px;">
              <span style="font-size:0.9rem;">⏱️</span>
              <span id="cc-timer-display" style="font-family:monospace; font-size:1.1rem; font-weight:800; color:var(--accent-cyan);">
                ${Math.floor(this.questionTimerSecondsRemaining / 60)}:${String(this.questionTimerSecondsRemaining % 60).padStart(2, '0')}
              </span>
              <div style="width:40px; height:5px; background:rgba(255,255,255,0.1); border-radius:3px; overflow:hidden;">
                <div id="cc-timer-ring" style="width:${(this.questionTimerSecondsRemaining / maxSec) * 100}%; height:100%; background:var(--accent-cyan); transition:width 0.9s linear;"></div>
              </div>
            </div>
            <span style="background:rgba(168,85,247,0.15); border:1px solid #a855f7; color:#c084fc; padding:0.3rem 0.75rem; border-radius:12px; font-size:0.8rem; font-weight:700;">
              ${q.difficultyLabel}
            </span>
          </div>
        </div>
        <!-- Progress track -->
        <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
          <div style="width:${progressPct}%; height:100%; background:linear-gradient(90deg,var(--accent-cyan),var(--accent-blue)); transition:width 0.4s ease;"></div>
        </div>
      </div>

      <!-- Challenge Card -->
      <div class="glass-card activity-card">
        <div class="activity-header">
          <h2 class="activity-title" style="font-size:1.5rem;">${q.title}</h2>
          <p class="activity-instructions" style="margin-bottom:0.75rem;">${q.storyContext}</p>

          <!-- Hint Button -->
          <button id="show-hint-btn" class="btn btn-secondary" style="font-size:0.8rem; padding:0.35rem 0.9rem; opacity:0.8;">
            💡 Show Hint
          </button>
          <div id="hint-panel" style="display:none; margin-top:0.75rem; background:rgba(245,158,11,0.1); border:1px solid var(--accent-amber); border-radius:10px; padding:0.75rem 1rem; font-size:0.9rem; color:var(--accent-amber);">
            💡 ${q.hint}
          </div>
        </div>

        <!-- Visual Map -->
        <div style="background:rgba(15,23,42,0.9); border:2px solid var(--accent-cyan); padding:1rem 1.5rem; border-radius:14px; margin:1rem 0; text-align:center; box-shadow:0 0 18px rgba(6,182,212,0.2); font-size:1.05rem; font-weight:700; color:#fff; line-height:1.8;">
          <div style="font-size:0.72rem; font-weight:800; color:var(--accent-cyan); text-transform:uppercase; letter-spacing:1px; margin-bottom:0.5rem;">🗺️ Visual Puzzle Map</div>
          ${q.mapHtml}
        </div>

        <!-- Drag-Drop Block Builder -->
        <div class="interactive-playground" id="cc-playground-area">
          ${this.renderBlockBuilder(q, ans)}
        </div>

        <!-- Submit / Next button -->
        <div class="activity-footer">
          <button id="cc-submit-btn" class="btn btn-primary" style="width:100%; font-size:1.1rem; padding:0.9rem 2rem; font-weight:800; background:linear-gradient(135deg,var(--accent-cyan),var(--accent-blue));">
            ${this.currentIndex === totalChallenges - 1 ? '🏁 Finish Challenge' : 'Confirm & Next ➔'}
          </button>
        </div>
      </div>
    `;

    this.attachChallengeListeners();
  }

  private renderBlockBuilder(q: CodingChallengeQuestion, ans: ChallengeAnswerState): string {
    return `
      <div class="robot-mission-container">
        <!-- Available Blocks -->
        <div>
          <h4 style="margin-bottom:0.5rem; font-size:0.9rem; color:var(--text-secondary);">Available Blocks:</h4>
          <div class="blocks-palette">
            ${q.availableBlocks.map(blk => `
              <button class="code-block cc-block-btn" data-block="${blk}">+ ${blk}</button>
            `).join('')}
          </div>
        </div>

        <!-- Sequence Builder -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <h4 style="font-size:0.9rem; color:var(--text-secondary); margin:0;">Your Sequence (${ans.robotSequence.length} steps):</h4>
            ${ans.robotSequence.length > 0 ? `
              <button id="cc-clear-btn" style="font-size:0.75rem; color:var(--accent-amber); background:rgba(245,158,11,0.1); border:1px solid var(--accent-amber); padding:0.25rem 0.6rem; border-radius:6px; cursor:pointer;">🗑️ Clear</button>
            ` : ''}
          </div>
          <div class="sequence-dropzone" id="cc-sequence-box">
            ${ans.robotSequence.length === 0
              ? '<span style="color:var(--text-secondary); font-size:0.85rem;">Click the blocks above to build your code sequence...</span>'
              : ans.robotSequence.map((blk, i) => `
                <div class="sequence-step" style="background:var(--accent-blue); padding:0.4rem 0.8rem; border-radius:6px; font-size:0.85rem; font-weight:600; display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                  <span>📌 ${i + 1}. ${blk}</span>
                  <button class="cc-remove-block" data-idx="${i}" style="background:rgba(0,0,0,0.25); border:none; color:#fff; width:20px; height:20px; border-radius:50%; cursor:pointer; font-size:0.75rem; display:flex; align-items:center; justify-content:center;">×</button>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
    `;
  }

  private attachChallengeListeners() {
    const q = this.challenges[this.currentIndex];
    const ans = this.answers[this.currentIndex];

    // Hint toggle
    this.container.querySelector('#show-hint-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('hint-panel');
      if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });

    // Block click
    this.container.querySelectorAll('.cc-block-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const blk = target.getAttribute('data-block');
        if (blk) {
          ans.robotSequence.push(blk);
          ans.attemptsCount++;
          this.rerenderBlockBuilder(q, ans);
        }
      });
    });

    // Remove block
    this.attachRemoveListeners(q, ans);

    // Clear
    this.container.querySelector('#cc-clear-btn')?.addEventListener('click', () => {
      ans.robotSequence = [];
      this.rerenderBlockBuilder(q, ans);
    });

    // Submit
    this.container.querySelector('#cc-submit-btn')?.addEventListener('click', () => {
      if (this.questionTimerInterval) {
        clearInterval(this.questionTimerInterval);
        this.questionTimerInterval = null;
      }
      const spent = Date.now() - this.questionStartTimestamp;
      ans.timeSpentMs = spent;
      this.scoreAnswer(ans, q);
      this.advanceChallenge();
    });
  }

  private attachRemoveListeners(q: CodingChallengeQuestion, ans: ChallengeAnswerState) {
    this.container.querySelectorAll('.cc-remove-block').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        ans.robotSequence.splice(idx, 1);
        this.rerenderBlockBuilder(q, ans);
      });
    });
  }

  private rerenderBlockBuilder(q: CodingChallengeQuestion, ans: ChallengeAnswerState) {
    const playground = document.getElementById('cc-playground-area');
    if (playground) {
      playground.innerHTML = this.renderBlockBuilder(q, ans);
      // Re-attach block + remove listeners
      playground.querySelectorAll('.cc-block-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const blk = (e.currentTarget as HTMLElement).getAttribute('data-block');
          if (blk) {
            ans.robotSequence.push(blk);
            ans.attemptsCount++;
            this.rerenderBlockBuilder(q, ans);
          }
        });
      });
      this.attachRemoveListeners(q, ans);
      playground.querySelector('#cc-clear-btn')?.addEventListener('click', () => {
        ans.robotSequence = [];
        this.rerenderBlockBuilder(q, ans);
      });
    }
  }

  private scoreAnswer(ans: ChallengeAnswerState, q: CodingChallengeQuestion) {
    const target = q.correctSequence;
    let matched = 0;
    ans.robotSequence.forEach((step, i) => {
      if (target[i] === step) matched++;
    });
    const accuracy = target.length > 0 ? matched / target.length : (ans.robotSequence.length > 0 ? 1.0 : 0.0);
    ans.isSolved = accuracy >= 0.8;
  }

  private advanceChallenge() {
    if (this.currentIndex < this.challenges.length - 1) {
      this.loadChallenge(this.currentIndex + 1);
    } else {
      this.completeChallenge(false);
    }
  }

  // ── Complete & compute result ────────────────────────────────────────────
  private completeChallenge(skipped: boolean) {
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }

    const totalMs = Date.now() - this.startTimestamp;
    const completed = this.answers.filter(a => a.isSolved).length;
    const total = this.challenges.length;
    const accuracyPct = skipped ? 0 : Math.round((completed / total) * 100);

    let placementVerification: CodingChallengeResult['placement_verification'];
    if (skipped || !this.answers.some(a => a.isSolved)) {
      placementVerification = 'Not Attempted';
    } else if (accuracyPct >= 80) {
      placementVerification = this.baseTrack.includes('L4') ? 'Strong' : 'Confirmed';
    } else if (accuracyPct >= 60) {
      placementVerification = 'Confirmed';
    } else {
      placementVerification = 'Borderline';
    }

    const skillsDemonstrated: string[] = [];
    this.challenges.forEach((q, i) => {
      if (this.answers[i]?.isSolved) {
        skillsDemonstrated.push(q.concept);
      }
    });

    const result: CodingChallengeResult = {
      attempted: !skipped,
      total_challenges: total,
      completed_challenges: completed,
      accuracy_pct: accuracyPct,
      time_taken_ms: totalMs,
      placement_verification: placementVerification,
      skills_demonstrated: [...new Set(skillsDemonstrated)],
    };

    if (!skipped) {
      this.renderSummaryScreen(result);
    } else {
      this.onComplete(result);
    }
  }

  // ── Summary Screen ───────────────────────────────────────────────────────
  private renderSummaryScreen(result: CodingChallengeResult) {
    const pctColor = result.accuracy_pct >= 80 ? 'var(--accent-emerald)' : result.accuracy_pct >= 60 ? 'var(--accent-amber)' : '#ef4444';
    const verificationBg = result.placement_verification === 'Strong'
      ? 'rgba(16,185,129,0.2)' : result.placement_verification === 'Confirmed'
      ? 'rgba(6,182,212,0.15)' : 'rgba(245,158,11,0.15)';
    const verificationBorder = result.placement_verification === 'Strong'
      ? 'var(--accent-emerald)' : result.placement_verification === 'Confirmed'
      ? 'var(--accent-cyan)' : 'var(--accent-amber)';
    const verificationColor = result.placement_verification === 'Strong'
      ? 'var(--accent-emerald)' : result.placement_verification === 'Confirmed'
      ? 'var(--accent-cyan)' : 'var(--accent-amber)';
    const timeTakenMin = (result.time_taken_ms / 60000).toFixed(1);

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:70vh; text-align:center; padding:2.5rem 1rem; color:#fff; animation:fadeIn 0.4s ease;">
        <div style="font-size:4rem; margin-bottom:1rem;">🏆</div>

        <h2 style="font-size:2rem; font-weight:800; margin-bottom:0.5rem;">
          Coding Challenge Complete!
        </h2>
        <p style="color:var(--text-secondary); font-size:1rem; margin-bottom:2rem;">
          Here are your Placement Verification results.
        </p>

        <!-- Score -->
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; max-width:480px; width:100%; margin-bottom:1.75rem;">
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:1.25rem; border-radius:14px;">
            <div style="font-size:2rem; font-weight:900; color:${pctColor};">${result.accuracy_pct}%</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Accuracy</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:1.25rem; border-radius:14px;">
            <div style="font-size:2rem; font-weight:900; color:var(--accent-cyan);">${result.completed_challenges}/${result.total_challenges}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Solved</div>
          </div>
          <div style="background:rgba(15,23,42,0.8); border:1px solid var(--border-color); padding:1.25rem; border-radius:14px;">
            <div style="font-size:2rem; font-weight:900; color:#fff;">${timeTakenMin}m</div>
            <div style="font-size:0.75rem; color:var(--text-secondary);">Time Taken</div>
          </div>
        </div>

        <!-- Placement Verification Badge -->
        <div style="background:${verificationBg}; border:2px solid ${verificationBorder}; color:${verificationColor}; padding:1rem 2.5rem; border-radius:16px; font-weight:900; font-size:1.25rem; margin-bottom:1.5rem; box-shadow:0 0 20px ${verificationBg};">
          Placement Verification: ${result.placement_verification}
        </div>

        <!-- Skills demonstrated -->
        ${result.skills_demonstrated.length > 0 ? `
          <div style="margin-bottom:2rem;">
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.6rem; font-weight:700; text-transform:uppercase;">Skills Demonstrated:</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; justify-content:center;">
              ${result.skills_demonstrated.map(s => `
                <span style="background:rgba(16,185,129,0.15); border:1px solid var(--accent-emerald); color:var(--accent-emerald); padding:0.3rem 0.75rem; border-radius:12px; font-size:0.82rem; font-weight:700;">✅ ${s}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <button id="cc-view-report-btn" class="btn btn-primary" style="font-size:1.1rem; padding:1rem 2.5rem; font-weight:800; background:linear-gradient(135deg,var(--accent-cyan),var(--accent-blue));">
          📊 View Full Assessment Report
        </button>
      </div>
    `;

    this.container.querySelector('#cc-view-report-btn')?.addEventListener('click', () => {
      this.onComplete(result);
    });
  }
}
