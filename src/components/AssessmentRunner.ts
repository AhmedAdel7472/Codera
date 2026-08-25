import {
  AssessmentDomain,
  ItemTelemetry,
  StudentSessionTelemetry,
  QuestionTimeRecord,
  BreakEvent,
  PartBreakRecord,
  CodingChallengeResult,
} from '../engine/telemetrySchema';
import { ActivityGenerator, ActivityItem, QUESTION_BASELINES, StudentMetricsContext } from '../ai/activityGenerator';
import { ScoringEngine, DOMAIN_CONFIG, TOTAL_BASE_QUESTIONS, PART_ONE_QUESTIONS } from '../engine/scoringEngine';
import { PlacementEngine, PlacementResult } from '../engine/placementEngine';
import { QualitativeAnalyzer } from '../ai/qualitativeAnalyzer';
import { renderReportDashboard } from './ReportDashboard';
import { CodingChallenge } from './CodingChallenge';
import confetti from 'canvas-confetti';

export interface StoredUserAnswer {
  selectedAnswerIndex: number | null;
  robotSequence: string[];
  motorClicks: { x: number; y: number; dist: number }[];
  attemptsCount: number;
  hintsUsed: number;
  timeSpentMs: number;
  isSolved: boolean;
  timedOut: boolean;
  answeredAt: number | null;
  responseLatencyMs: number | null;
  remainingTimeWhenAnsweredMs: number | null;
  breaksDuringQuestion: number;
}

export interface SavedAssessmentSession {
  schemaVersion: '2.0';
  studentName: string;
  currentQuestionIndex: number;
  totalTimerSeconds: number;
  currentQuestionRemainingSeconds: number;
  isPaused: boolean;
  isOnPartBreak: boolean;
  partBreakRemainingSeconds: number;
  isTimerVisible: boolean;
  cachedActivities: (ActivityItem | null)[];
  userAnswers: StoredUserAnswer[];
  questionTimeRecords: QuestionTimeRecord[];
  breakEvents: BreakEvent[];
  partBreakRecord: PartBreakRecord | null;
  savedAt: number;
}

export class AssessmentRunner {
  public static STORAGE_KEY = 'codera_active_assessment_session';
  public static LEGACY_STORAGE_KEY = 'cognix_active_assessment_session';
  public static QUESTION_TIME_LIMIT_SEC = 90; // 1 minute 30 seconds
  public static PART_BREAK_LIMIT_SEC = 300;   // 5 minutes optional break between Part 1 and Part 2

  private container: HTMLElement;
  private generator: ActivityGenerator;
  private analyzer: QualitativeAnalyzer;
  private studentName: string = 'Alex Rivers';

  // 50-Question Plan & State
  private cachedActivities: (ActivityItem | null)[] = new Array(TOTAL_BASE_QUESTIONS).fill(null);
  private userAnswers: StoredUserAnswer[] = [];
  private questionTimeRecords: QuestionTimeRecord[] = [];
  private breakEvents: BreakEvent[] = [];
  private currentQuestionIndex: number = 0; // 0 to 49

  // Timers & Toggles
  private totalTimerSeconds: number = 0;
  private questionTimerSecondsRemaining: number = AssessmentRunner.QUESTION_TIME_LIMIT_SEC;
  private itemStartTimestamp: number = 0;
  private itemFirstInteractionTimestamp: number | null = null;
  private currentPauseStartTimestamp: number | null = null;
  private pauseDurationForCurrentQuestionMs: number = 0;
  private isPaused: boolean = false;

  // Part Break state
  private isOnPartBreak: boolean = false;
  private partBreakRemainingSeconds: number = AssessmentRunner.PART_BREAK_LIMIT_SEC;
  private partBreakTimerInterval: any = null;
  private partBreakRecord: PartBreakRecord | null = null;

  // Accessibility Toggles
  private isTimerVisible: boolean = true;
  private isSignLanguageModalOpen: boolean = false;
  private isAudioMuted: boolean = true; // Audio is muted by default as requested

  private globalTimerInterval: any = null;
  private questionTimerInterval: any = null;

  private loadGen: number = 0;
  private isLoadingNextQuestion: boolean = false;
  private motorTargetPos: { top: number; left: number } = { top: 80, left: 240 };

  private isExiting: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.generator = new ActivityGenerator();
    this.analyzer = new QualitativeAnalyzer();
    this.initUserAnswers();
  }

  // ---------------------------------------------------------------------------
  // Session Persistence with Legacy Migration
  // ---------------------------------------------------------------------------
  public static getSavedSession(): SavedAssessmentSession | null {
    try {
      // 1. Try primary new key
      let data = localStorage.getItem(AssessmentRunner.STORAGE_KEY);
      // 2. Fallback to legacy key migration
      if (!data) {
        data = localStorage.getItem(AssessmentRunner.LEGACY_STORAGE_KEY);
      }
      if (!data) return null;

      const parsed: SavedAssessmentSession = JSON.parse(data);
      if (parsed && Array.isArray(parsed.userAnswers) && parsed.userAnswers.length === TOTAL_BASE_QUESTIONS) {
        return parsed;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  public static clearSavedSession(): void {
    try {
      localStorage.removeItem(AssessmentRunner.STORAGE_KEY);
      localStorage.removeItem(AssessmentRunner.LEGACY_STORAGE_KEY);
      localStorage.removeItem('codera_active_assessment_session');
      localStorage.removeItem('cognix_active_assessment_session');
      localStorage.removeItem('eduverse_assessment_session_v2');
      localStorage.removeItem('eduverse_assessment_session');
      localStorage.removeItem('active_assessment_session');
    } catch (e) {}
  }

  public stopAllTimers(): void {
    if (this.globalTimerInterval) {
      clearInterval(this.globalTimerInterval);
      this.globalTimerInterval = null;
    }
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }
    if (this.partBreakTimerInterval) {
      clearInterval(this.partBreakTimerInterval);
      this.partBreakTimerInterval = null;
    }
  }

  public exitAndReset(reload: boolean = true): void {
    this.isExiting = true;
    this.detachBeforeUnload();
    this.stopAllTimers();
    AssessmentRunner.clearSavedSession();

    try {
      localStorage.removeItem(AssessmentRunner.STORAGE_KEY);
      localStorage.removeItem(AssessmentRunner.LEGACY_STORAGE_KEY);
      localStorage.removeItem('eduverse_assessment_session_v2');
      localStorage.removeItem('eduverse_assessment_session');
    } catch (e) {}

    const testPage = document.getElementById('childTestPage');
    if (testPage) {
      testPage.classList.add('hidden');
      testPage.classList.remove('exam-active');
    }
    const header = document.querySelector('header');
    if (header) header.classList.remove('hidden');
    const main = document.querySelector('main');
    if (main) main.classList.remove('hidden');
    const footer = document.querySelector('footer');
    if (footer) footer.classList.remove('hidden');
    document.body.classList.remove('exam-mode');
    document.body.classList.remove('ceo-view-mode');
    window.scrollTo(0, 0);

    if (reload) {
      window.location.href = window.location.pathname;
    }
  }

  public saveSession(studentName: string = this.studentName) {
    if (this.isExiting) return;
    try {
      this.studentName = studentName;
      const sessionData: SavedAssessmentSession = {
        schemaVersion: '2.0',
        studentName,
        currentQuestionIndex: this.currentQuestionIndex,
        totalTimerSeconds: this.totalTimerSeconds,
        currentQuestionRemainingSeconds: this.questionTimerSecondsRemaining,
        isPaused: this.isPaused,
        isOnPartBreak: this.isOnPartBreak,
        partBreakRemainingSeconds: this.partBreakRemainingSeconds,
        isTimerVisible: this.isTimerVisible,
        cachedActivities: this.cachedActivities,
        userAnswers: this.userAnswers,
        questionTimeRecords: this.questionTimeRecords,
        breakEvents: this.breakEvents,
        partBreakRecord: this.partBreakRecord,
        savedAt: Date.now()
      };
      localStorage.setItem(AssessmentRunner.STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {}
  }

  private beforeUnloadHandler = () => {
    if (!this.isExiting) {
      this.saveSession(this.studentName);
    }
  };

  private attachBeforeUnload() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private detachBeforeUnload() {
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private initUserAnswers() {
    this.userAnswers = new Array(TOTAL_BASE_QUESTIONS).fill(null).map(() => ({
      selectedAnswerIndex: null,
      robotSequence: [],
      motorClicks: [],
      attemptsCount: 0,
      hintsUsed: 0,
      timeSpentMs: 0,
      isSolved: false,
      timedOut: false,
      answeredAt: null,
      responseLatencyMs: null,
      remainingTimeWhenAnsweredMs: null,
      breaksDuringQuestion: 0
    }));
    this.questionTimeRecords = [];
    this.breakEvents = [];
    this.partBreakRecord = null;
  }

  public async startSession(studentName: string = 'Alex Rivers', restoreIfAvailable: boolean = true) {
    this.studentName = studentName;
    const saved = restoreIfAvailable ? AssessmentRunner.getSavedSession() : null;

    if (saved) {
      this.currentQuestionIndex = Math.max(0, Math.min(TOTAL_BASE_QUESTIONS - 1, saved.currentQuestionIndex || 0));
      this.cachedActivities = saved.cachedActivities || new Array(TOTAL_BASE_QUESTIONS).fill(null);
      this.userAnswers = saved.userAnswers;
      this.questionTimeRecords = saved.questionTimeRecords || [];
      this.breakEvents = saved.breakEvents || [];
      this.partBreakRecord = saved.partBreakRecord || null;
      this.totalTimerSeconds = saved.totalTimerSeconds || 0;
      this.questionTimerSecondsRemaining = saved.currentQuestionRemainingSeconds || AssessmentRunner.QUESTION_TIME_LIMIT_SEC;
      this.isPaused = saved.isPaused || false;
      this.isOnPartBreak = saved.isOnPartBreak || false;
      this.partBreakRemainingSeconds = saved.partBreakRemainingSeconds || AssessmentRunner.PART_BREAK_LIMIT_SEC;
      this.isTimerVisible = saved.isTimerVisible !== false;

      this.startGlobalTimer(this.totalTimerSeconds);
      this.attachBeforeUnload();

      if (this.isOnPartBreak) {
        this.renderPartBreakScreen();
      } else if (this.isPaused) {
        await this.loadQuestion(this.currentQuestionIndex, false);
        this.pauseAssessment();
      } else {
        await this.loadQuestion(this.currentQuestionIndex, false);
      }
    } else {
      this.currentQuestionIndex = 0;
      this.cachedActivities = new Array(TOTAL_BASE_QUESTIONS).fill(null);
      this.initUserAnswers();
      this.totalTimerSeconds = 0;
      this.questionTimerSecondsRemaining = AssessmentRunner.QUESTION_TIME_LIMIT_SEC;
      this.isPaused = false;
      this.isOnPartBreak = false;
      this.isTimerVisible = true;

      this.startGlobalTimer(0);
      this.attachBeforeUnload();

      this.saveSession(studentName);
      
      // Proactively prefetch upcoming question buffer in background
      this.prefetchBufferAhead(0);

      await this.loadQuestion(0, true);
    }
  }

  private startGlobalTimer(initialSeconds: number = 0) {
    this.totalTimerSeconds = initialSeconds;
    if (this.globalTimerInterval) clearInterval(this.globalTimerInterval);
    this.globalTimerInterval = setInterval(() => {
      if (!this.isPaused && !this.isOnPartBreak) {
        this.totalTimerSeconds++;
        if (this.totalTimerSeconds % 3 === 0) {
          this.saveSession(this.studentName);
        }
        const timerEl = document.getElementById('global-timer');
        if (timerEl) {
          const mins = String(Math.floor(this.totalTimerSeconds / 60)).padStart(2, '0');
          const secs = String(this.totalTimerSeconds % 60).padStart(2, '0');
          timerEl.textContent = `${mins}:${secs}`;
        }
      }
    }, 1000);
  }

  public speakAudio(text: string, force: boolean = false) {
    if (this.isAudioMuted && !force) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {}
  }

  private getStudentMetricsContext(): StudentMetricsContext {
    const answered = this.userAnswers.filter(a => a.answeredAt !== null);
    const correctCount = answered.filter(a => a.isSolved || (a.selectedAnswerIndex !== null && this.cachedActivities[this.userAnswers.indexOf(a)]?.payload?.options?.[a.selectedAnswerIndex]?.correct)).length;
    const accuracy = answered.length > 0 ? correctCount / answered.length : 1.0;
    const avgLatency = this.questionTimeRecords.length > 0
      ? (this.questionTimeRecords.reduce((acc, r) => acc + (r.durationActiveSeconds || 0), 0) / this.questionTimeRecords.length) * 1000
      : 25000;

    let parentProfile: any = {};
    try {
      const savedProfile = localStorage.getItem('codera_parent_profile') || localStorage.getItem('cognix_parent_profile');
      if (savedProfile) parentProfile = JSON.parse(savedProfile);
    } catch (e) {}

    return {
      studentName: this.studentName,
      diagnosis: parentProfile.diagnosis || undefined,
      interests: parentProfile.interests || undefined,
      currentAccuracy: accuracy,
      averageResponseTimeMs: avgLatency
    };
  }

  private startQuestionTimer() {
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }

    if (this.questionTimerSecondsRemaining <= 0) {
      this.questionTimerSecondsRemaining = AssessmentRunner.QUESTION_TIME_LIMIT_SEC;
    }

    this.questionTimerInterval = setInterval(() => {
      if (!this.isPaused && !this.isOnPartBreak) {
        this.questionTimerSecondsRemaining--;
        this.updateQuestionTimerUI();

        if (this.questionTimerSecondsRemaining <= 0) {
          clearInterval(this.questionTimerInterval);
          this.questionTimerInterval = null;
          this.handleQuestionTimeout();
        }
      }
    }, 1000);
  }

  private updateQuestionTimerUI() {
    const qTimerEl = document.getElementById('question-timer-display');
    const qRingEl = document.getElementById('question-timer-ring');
    if (qTimerEl) {
      const mins = Math.floor(this.questionTimerSecondsRemaining / 60);
      const secs = String(this.questionTimerSecondsRemaining % 60).padStart(2, '0');
      qTimerEl.textContent = `${mins}:${secs}`;

      if (this.questionTimerSecondsRemaining <= 15) {
        qTimerEl.style.color = '#ef4444';
      } else {
        qTimerEl.style.color = 'var(--accent-cyan)';
      }
    }
    if (qRingEl) {
      const pct = (this.questionTimerSecondsRemaining / AssessmentRunner.QUESTION_TIME_LIMIT_SEC) * 100;
      qRingEl.style.width = `${pct}%`;
    }
  }

  private async loadQuestion(targetIndex: number, resetTimer: boolean = true) {
    if (targetIndex < 0 || targetIndex >= TOTAL_BASE_QUESTIONS) return;

    this.motorTargetPos = { top: 80, left: 240 };
    const myGen = ++this.loadGen;

    this.currentQuestionIndex = targetIndex;
    const baseline = QUESTION_BASELINES[targetIndex];

    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }

    if (resetTimer || this.questionTimerSecondsRemaining <= 3) {
      this.questionTimerSecondsRemaining = AssessmentRunner.QUESTION_TIME_LIMIT_SEC;
    }

    this.itemFirstInteractionTimestamp = null;
    this.pauseDurationForCurrentQuestionMs = 0;

    if (!this.cachedActivities[targetIndex]) {
      this.renderLoadingState(targetIndex);
      const metrics = this.getStudentMetricsContext();
      this.cachedActivities[targetIndex] = await this.generator.generateActivity(baseline.slot, metrics);
      if (myGen !== this.loadGen) return;
    }

    this.isLoadingNextQuestion = false;
    const activeActivity = this.cachedActivities[targetIndex];
    if (activeActivity) {
      activeActivity.type = baseline.type;
      if (baseline.type !== 'robot_mission' && activeActivity.payload) {
        delete activeActivity.payload.availableBlocks;
        delete activeActivity.payload.correctSequence;
      }
      this.shuffleActivityOptions(activeActivity);
    }

    this.itemStartTimestamp = Date.now();
    this.saveSession(this.studentName);
    this.render();

    // Auto-speak audio prompt for picture_match questions ONLY if not muted
    if (!this.isAudioMuted && activeActivity && activeActivity.type === 'picture_match') {
      const promptText = activeActivity.payload?.audioPromptText || activeActivity.instructions;
      if (promptText) {
        this.speakAudio(promptText);
      }
    }

    if (!this.isPaused && !this.isOnPartBreak) {
      this.startQuestionTimer();
    }

    // Proactively prefetch lookahead questions ahead so next clicks load instantly in 0ms!
    this.prefetchBufferAhead(targetIndex);
  }

  private shuffleActivityOptions(activity: ActivityItem) {
    if (!activity.payload || !Array.isArray(activity.payload.options) || activity.payload._shuffled || activity.payload.options.length < 2) {
      return;
    }
    const options = activity.payload.options;
    const correctOpt = options.find((o: any) => o.correct) || options[0];

    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    activity.payload.options = shuffled;
    activity.payload.correctIndex = shuffled.indexOf(correctOpt);
    activity.payload._shuffled = true;
  }

  private renderLoadingState(targetIndex: number) {
    const baseline = QUESTION_BASELINES[targetIndex];
    const domainConfig = DOMAIN_CONFIG[baseline.domain];

    const playground = this.container.querySelector('#playground-area');
    if (playground) {
      playground.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--accent-cyan);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem; animation: pulse 1.2s infinite ease-in-out;">⚡</div>
          <h3 style="font-size: 1.2rem; font-weight: 700;">Preparing Question ${targetIndex + 1}...</h3>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">${domainConfig.name} • ${baseline.subSkill}</p>
        </div>
      `;
    }
  }

  private async prefetchNextQuestion(nextIndex: number) {
    if (nextIndex >= 0 && nextIndex < TOTAL_BASE_QUESTIONS && !this.cachedActivities[nextIndex]) {
      const baseline = QUESTION_BASELINES[nextIndex];
      const metrics = this.getStudentMetricsContext();
      this.generator.generateActivity(baseline.slot, metrics).then(activity => {
        if (!this.cachedActivities[nextIndex]) {
          this.cachedActivities[nextIndex] = activity;
        }
      }).catch(() => {});
    }
  }

  private prefetchBufferAhead(currentIndex: number) {
    // Look ahead 3 questions in advance to ensure 0ms latency on user clicking Next
    for (let offset = 1; offset <= 3; offset++) {
      const target = currentIndex + offset;
      if (target < TOTAL_BASE_QUESTIONS) {
        this.prefetchNextQuestion(target);
      }
    }
  }

  public pauseAssessment() {
    if (this.isPaused || this.isOnPartBreak) return;
    this.isPaused = true;
    this.currentPauseStartTimestamp = Date.now();
    const currentAns = this.userAnswers[this.currentQuestionIndex];
    if (currentAns) {
      currentAns.breaksDuringQuestion++;
    }

    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.style.display = 'flex';
    this.saveSession(this.studentName);
  }

  public resumeAssessment() {
    if (!this.isPaused) return;
    const now = Date.now();
    if (this.currentPauseStartTimestamp) {
      const breakDuration = now - this.currentPauseStartTimestamp;
      this.pauseDurationForCurrentQuestionMs += breakDuration;

      const baseline = QUESTION_BASELINES[this.currentQuestionIndex];
      this.breakEvents.push({
        breakIndex: this.breakEvents.length + 1,
        questionSlotAtPause: this.currentQuestionIndex + 1,
        domainAtPause: baseline.domain,
        pauseStartTimestamp: this.currentPauseStartTimestamp,
        resumeTimestamp: now,
        breakDurationMs: breakDuration,
        countdownRemainingAtPause: this.questionTimerSecondsRemaining
      });
    }

    this.isPaused = false;
    this.currentPauseStartTimestamp = null;

    const overlay = document.getElementById('pause-overlay');
    if (overlay) overlay.style.display = 'none';

    this.startQuestionTimer();
    this.saveSession(this.studentName);
  }

  // ---------------------------------------------------------------------------
  // Mandatory 2-Part Break Screen Logic
  // ---------------------------------------------------------------------------
  private triggerPartBreak() {
    this.isOnPartBreak = true;
    const now = Date.now();
    this.partBreakRemainingSeconds = AssessmentRunner.PART_BREAK_LIMIT_SEC;

    this.partBreakRecord = {
      partBreakStart: now,
      partBreakEnd: null,
      breakDurationMs: null,
      studentInitiatedEarly: false
    };

    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }

    this.saveSession(this.studentName);
    this.renderPartBreakScreen();

    // Start 5-minute countdown interval
    if (this.partBreakTimerInterval) clearInterval(this.partBreakTimerInterval);
    this.partBreakTimerInterval = setInterval(() => {
      this.partBreakRemainingSeconds--;
      const timerEl = document.getElementById('part-break-timer');
      if (timerEl) {
        const mins = Math.floor(this.partBreakRemainingSeconds / 60);
        const secs = String(this.partBreakRemainingSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }

      if (this.partBreakRemainingSeconds <= 0) {
        this.resumeFromPartBreak(false);
      }
    }, 1000);
  }

  private resumeFromPartBreak(early: boolean = true) {
    if (!this.isOnPartBreak) return;
    if (this.partBreakTimerInterval) {
      clearInterval(this.partBreakTimerInterval);
      this.partBreakTimerInterval = null;
    }

    const now = Date.now();
    if (this.partBreakRecord) {
      this.partBreakRecord.partBreakEnd = now;
      this.partBreakRecord.breakDurationMs = now - this.partBreakRecord.partBreakStart;
      this.partBreakRecord.studentInitiatedEarly = early;
    }

    this.isOnPartBreak = false;
    this.loadQuestion(PART_ONE_QUESTIONS, true); // Move to Q26 (index 25)
  }

  private renderPartBreakScreen() {
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    } catch(e) {}

    const mins = Math.floor(this.partBreakRemainingSeconds / 60);
    const secs = String(this.partBreakRemainingSeconds % 60).padStart(2, '0');

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:75vh; text-align:center; padding:2rem 1rem; color:#fff;" dir="ltr">
        <div style="font-size:4rem; margin-bottom:1rem; animation:bounce 2s infinite;">🎉</div>
        <span style="background:rgba(16,185,129,0.2); border:1px solid var(--accent-emerald); color:var(--accent-emerald); padding:0.35rem 1rem; border-radius:20px; font-weight:800; font-size:0.9rem; margin-bottom:1rem;">
          DAY 1 COMPLETED (COGNITIVE & FUNCTIONAL DOMAINS)
        </span>
        <h2 style="font-size:2.2rem; font-weight:800; margin-bottom:0.5rem; background:linear-gradient(135deg, #fff, var(--accent-cyan)); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
          Awesome Job! Time for an Optional Break ☕
        </h2>
        <p style="color:var(--text-secondary); max-width:520px; font-size:1.05rem; margin-bottom:2rem; line-height:1.6;">
          You finished Day 1 (25 / 50 questions)! Take a rest, stretch, or get water before starting Day 2 (Communication, Behavior & Motor).
        </p>

        <div style="background:rgba(15,23,42,0.9); border:2px solid var(--accent-cyan); padding:1.25rem 2.5rem; border-radius:20px; margin-bottom:2rem; box-shadow:0 0 25px rgba(6,182,212,0.25);">
          <div style="font-size:0.85rem; color:var(--text-secondary); font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-bottom:0.5rem;">
            Break Countdown
          </div>
          <div id="part-break-timer" style="font-family:monospace; font-size:3rem; font-weight:900; color:var(--accent-cyan);">
            ${mins}:${secs}
          </div>
        </div>

        <button id="resume-part2-btn" class="btn btn-primary" style="font-size:1.15rem; padding:1rem 3rem; background:linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); font-weight:800; box-shadow:0 6px 20px rgba(6,182,212,0.4); cursor:pointer;">
          🚀 Start Day 2 Assessment Now (15 mins)
        </button>
      </div>
    `;

    const resumeBtn = this.container.querySelector('#resume-part2-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.resumeFromPartBreak(true));
    }
  }

  private handleQuestionTimeout() {
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }
    this.questionTimerSecondsRemaining = AssessmentRunner.QUESTION_TIME_LIMIT_SEC;

    const answerState = this.userAnswers[this.currentQuestionIndex];
    if (answerState) {
      answerState.timedOut = true;
      answerState.isSolved = false;
    }

    this.recordQuestionTimeData(false);
    this.advanceToNextQuestion();
  }

  private recordQuestionTimeData(wasAnswered: boolean) {
    const endTimestamp = Date.now();
    const answerState = this.userAnswers[this.currentQuestionIndex];
    const baseline = QUESTION_BASELINES[this.currentQuestionIndex];
    const activity = this.cachedActivities[this.currentQuestionIndex];

    const totalDurationMs = endTimestamp - this.itemStartTimestamp;
    const activeDurationMs = Math.max(1000, totalDurationMs - this.pauseDurationForCurrentQuestionMs);

    answerState.timeSpentMs += activeDurationMs;
    const part: 1 | 2 = (this.currentQuestionIndex < PART_ONE_QUESTIONS) ? 1 : 2;

    const record: QuestionTimeRecord = {
      questionSlot: baseline.slot,
      part,
      domain: baseline.domain,
      subSkill: baseline.subSkill,
      questionTitle: activity?.title || baseline.title,
      questionStartTimestamp: this.itemStartTimestamp,
      questionEndTimestamp: endTimestamp,
      totalDurationMs,
      pausedDurationMs: this.pauseDurationForCurrentQuestionMs,
      activeDurationMs,
      responseLatencyMs: answerState.responseLatencyMs,
      answeredAt: answerState.answeredAt,
      timedOut: answerState.timedOut,
      wasAnswered,
      remainingTimeWhenAnsweredMs: answerState.remainingTimeWhenAnsweredMs,
      breaksDuringQuestion: answerState.breaksDuringQuestion,
      earnedScore: 0,
      maxScore: baseline.maxPoints
    };

    this.questionTimeRecords[this.currentQuestionIndex] = record;
  }

  private advanceToNextQuestion() {
    this.isLoadingNextQuestion = true;

    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.questionTimerInterval = null;
    }

    this.questionTimerSecondsRemaining = AssessmentRunner.QUESTION_TIME_LIMIT_SEC;

    // Check for Part 1 completion (after Q25 / index 24)
    if (this.currentQuestionIndex === PART_ONE_QUESTIONS - 1) {
      this.isLoadingNextQuestion = false;
      this.triggerPartBreak();
      return;
    }

    if (this.currentQuestionIndex < TOTAL_BASE_QUESTIONS - 1) {
      const currentDomain = QUESTION_BASELINES[this.currentQuestionIndex].domain;
      const nextDomain = QUESTION_BASELINES[this.currentQuestionIndex + 1].domain;

      if (currentDomain !== nextDomain) {
        this.showDomainTransitionBanner(nextDomain, () => {
          this.loadQuestion(this.currentQuestionIndex + 1, true);
        });
      } else {
        this.loadQuestion(this.currentQuestionIndex + 1, true);
      }
    } else {
      this.isLoadingNextQuestion = false;
      this.completeAssessment();
    }
  }

  private showDomainTransitionBanner(nextDomain: AssessmentDomain, callback: () => void) {
    const domainCfg = DOMAIN_CONFIG[nextDomain];
    const playground = this.container.querySelector('#playground-area');
    if (playground) {
      playground.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--accent-cyan); animation: fadeIn 0.4s ease;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎉</div>
          <h2 style="font-size: 1.6rem; font-weight: 800; color: #fff;">Domain Completed!</h2>
          <p style="font-size: 1rem; color: var(--text-secondary); margin-top: 0.5rem; margin-bottom: 1.5rem;">
            Great job! Moving to <strong>${domainCfg.name}</strong> (${domainCfg.questionCount} Questions)...
          </p>
          <div style="display:inline-block; padding: 0.6rem 1.5rem; background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue)); color: #fff; font-weight: 700; border-radius: 12px;">
            Starting Domain...
          </div>
        </div>
      `;
    }
    setTimeout(callback, 2200);
  }

  private render() {
    const activity = this.cachedActivities[this.currentQuestionIndex];
    if (!activity) return;

    const baseline = QUESTION_BASELINES[this.currentQuestionIndex];
    const domainConfig = DOMAIN_CONFIG[baseline.domain];
    const answerState = this.userAnswers[this.currentQuestionIndex];

    const partNum: 1 | 2 = (this.currentQuestionIndex < PART_ONE_QUESTIONS) ? 1 : 2;
    const partQuestionNum = (this.currentQuestionIndex % PART_ONE_QUESTIONS) + 1;

    // Accurate total completed calculation
    const totalCompleted = this.userAnswers.filter((a, idx) => idx < this.currentQuestionIndex || (a && (a.isSolved || a.timedOut))).length;

    this.container.innerHTML = `
      <!-- Pause Overlay -->
      <div id="pause-overlay" style="display:${this.isPaused ? 'flex' : 'none'}; position:fixed; inset:0; background:rgba(15,23,42,0.7); backdrop-filter:blur(12px); z-index:300; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem;">
        <div style="background:#fff; border-radius:2rem; border:4px solid #fff; padding:2.5rem 2rem; max-width:450px; width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); display:flex; flex-direction:column; align-items:center;">
          <div style="font-size:3.5rem; margin-bottom:0.75rem; animation:bounce 1.5s infinite;">⏸️</div>
          <h2 style="font-size:1.8rem; font-weight:900; color:#1e293b; margin-bottom:0.4rem;">Assessment Paused</h2>
          <p style="color:#64748b; margin-bottom:1.75rem; font-size:0.95rem; line-height:1.5;">
            Take a deep breath or a short sensory break! Your progress is safely saved.
          </p>
          <button id="resume-btn" class="btn btn-primary" style="font-size:1.05rem; padding:0.85rem 2rem; width:100%; font-weight:800;">
            ▶️ Resume Assessment
          </button>
        </div>
      </div>

      <!-- Sign Language Accessibility Modal -->
      <div id="sign-language-modal" style="display:${this.isSignLanguageModalOpen ? 'flex' : 'none'}; position:fixed; inset:0; background:rgba(15,23,42,0.7); backdrop-filter:blur(12px); z-index:350; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem;">
        <div style="background:#ffffff; border:4px solid #ffffff; padding:2rem; border-radius:2rem; max-width:460px; width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
          <div style="font-size:3rem; margin-bottom:0.75rem;">🤟</div>
          <h3 style="font-size:1.5rem; font-weight:900; color:#1e293b; margin-bottom:0.4rem;">Sign Language Support</h3>
          <p style="color:#64748b; font-size:0.92rem; margin-bottom:1.25rem; line-height:1.5;">
            Visual sign language instructions for Question ${this.currentQuestionIndex + 1}.
          </p>
          <div style="background:#f8fafc; border:2px dashed #cbd5e1; padding:1.25rem; border-radius:1.25rem; margin-bottom:1.5rem;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🤖🤟</div>
            <div style="font-size:0.85rem; color:#10b981; font-weight:800;">[ Sign Language Animation Preview ]</div>
            <div style="font-size:0.8rem; color:#64748b; margin-top:0.4rem;">"${activity.instructions}"</div>
          </div>
          <button id="close-sign-language-btn" class="btn btn-secondary" style="width:100%; padding:0.75rem;">
            Close Window
          </button>
        </div>
      </div>

      <!-- Exit Confirmation Overlay -->
      <div id="exit-confirm-overlay" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.8); backdrop-filter:blur(14px); z-index:99999; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:2rem;">
        <div style="background:#ffffff; border-radius:2rem; border:4px solid #ffffff; padding:2.5rem 2rem; max-width:440px; width:100%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
          <div style="font-size:3.5rem; margin-bottom:0.75rem;">⚠️</div>
          <h2 style="font-size:1.7rem; font-weight:900; color:#1e293b; margin-bottom:0.4rem;">Exit &amp; Reset Assessment?</h2>
          <p style="color:#64748b; margin-bottom:1.75rem; font-size:0.92rem; line-height:1.5;">
            Exiting will stop your current progress, clear all saved assessment cache, and restart from the beginning.
          </p>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:center;">
            <button id="cancel-exit-btn" class="btn btn-secondary" style="padding:0.75rem 1.4rem; font-weight:800; cursor:pointer;">Cancel</button>
            <button id="confirm-exit-btn" class="btn btn-primary" style="background:#ef4444; border-bottom:4px solid #dc2626; padding:0.75rem 1.4rem; font-weight:800; box-shadow:0 4px 15px rgba(239,68,68,0.35); cursor:pointer;">
              🚪 Yes, Exit &amp; Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Skill Ladder Domain Progress Strip (CodeRa Green & White) -->
      <div style="background: #ffffff; border: 4px solid #ffffff; border-radius: 2rem; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 15px 35px -10px rgba(0,0,0,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:42px; height:42px; border-radius:1rem; background:#4ade80; border-bottom:4px solid #22c55e; display:flex; align-items:center; justify-content:center; font-size:1.4rem; box-shadow:0 4px 10px rgba(74,222,128,0.35);">
              🐸
            </div>
            <div>
              <div style="font-size:0.75rem; font-weight:900; text-transform:uppercase; letter-spacing:1px; color:#10b981;">
                ${domainConfig.name}
              </div>
              <div style="font-size:1.1rem; font-weight:900; color:#1e293b;">
                ${baseline.subSkill}
              </div>
            </div>
          </div>
          <div style="background:#fef3c7; border:2px solid #fde68a; color:#d97706; padding:0.4rem 0.9rem; border-radius:1rem; font-weight:900; font-size:0.85rem; display:flex; align-items:center; gap:0.4rem;">
            ⭐ <span>${totalCompleted} of 50 Completed</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem;">
          ${[
            { id: 'cognitive', name: 'Cognitive Logic', icon: '🧠', range: [0, 11], total: 12 },
            { id: 'functional', name: 'Robot Missions', icon: '🤖', range: [12, 23], total: 12 },
            { id: 'communication', name: 'Communication', icon: '💬', range: [24, 33], total: 10 },
            { id: 'behavioral', name: 'Behavioral Prep', icon: '🌟', range: [34, 41], total: 8 },
            { id: 'motor', name: 'Tech & Motors', icon: '🦾', range: [42, 49], total: 8 }
          ].map(d => {
            const isCurrentDomain = this.currentQuestionIndex >= d.range[0] && this.currentQuestionIndex <= d.range[1];
            const isCompletedDomain = this.currentQuestionIndex > d.range[1];
            const answeredInDomain = this.userAnswers.filter((a, idx) => idx >= d.range[0] && idx <= d.range[1] && (idx < this.currentQuestionIndex || (a && (a.isSolved || a.timedOut)))).length;
            const pct = Math.min(100, Math.round((answeredInDomain / d.total) * 100));

            let cardBg = '#ffffff';
            let borderColor = '#e2e8f0';
            let borderBottom = '2px solid #e2e8f0';
            let textColor = '#64748b';
            let barBg = '#cbd5e1';

            if (isCompletedDomain) {
              cardBg = '#ecfdf5';
              borderColor = '#a7f3d0';
              borderBottom = '2px solid #a7f3d0';
              textColor = '#10b981';
              barBg = '#34d399';
            } else if (isCurrentDomain) {
              cardBg = '#eff6ff';
              borderColor = '#60a5fa';
              borderBottom = '4px solid #3b82f6';
              textColor = '#1e40af';
              barBg = '#3b82f6';
            }

            return `
              <div style="background:${cardBg}; border:2px solid ${borderColor}; border-bottom:${borderBottom}; border-radius:1rem; padding:0.75rem 0.85rem; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.3s ease;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                  <span style="font-size:0.78rem; font-weight:800; color:${textColor};">${d.icon} ${d.name}</span>
                  ${isCompletedDomain ? '<span style="font-size:0.8rem; color:#10b981; font-weight:900;">✓</span>' : ''}
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#64748b; margin-bottom:0.35rem; font-weight:700;">
                  <span>${answeredInDomain}/${d.total} Qs</span>
                  <span style="font-weight:900; color:${textColor};">${pct}%</span>
                </div>
                <div style="width:100%; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
                  <div style="width:${pct}%; height:100%; background:${barBg}; border-radius:3px; transition:width 0.3s ease;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="glass-card activity-card">
        <div class="activity-header">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span class="activity-domain-badge">${domainConfig.name}</span>
              <span style="font-size:0.82rem; font-weight:800; color:#64748b; background:#f1f5f9; padding:0.35rem 0.75rem; border-radius:10px;">
                Q${this.currentQuestionIndex + 1} of 50 • ${baseline.subSkill}
              </span>
              ${activity.source === 'azure_openai'
                ? `<span style="font-size:0.75rem; font-weight:900; background:#ecfeff; border:2px solid #a5f3fc; color:#0891b2; padding:0.25rem 0.65rem; border-radius:10px; display:inline-flex; align-items:center; gap:4px;" title="Generated dynamically via Azure OpenAI">🤖 Azure AI</span>`
                : `<span style="font-size:0.75rem; font-weight:900; background:#fefce8; border:2px solid #fef08a; color:#ca8a04; padding:0.25rem 0.65rem; border-radius:10px; display:inline-flex; align-items:center; gap:4px;" title="Loaded from deterministic Slot Config (Offline/Fallback)">⚡ Slot Config (Offline)</span>`
              }
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">

              <!-- 🔊 / 🔇 Audio Play & Mute Toggle Button -->
              <button id="speak-question-btn" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.85rem; font-weight:800; background:${this.isAudioMuted ? '#f8fafc' : '#ecfdf5'}; border:2px solid ${this.isAudioMuted ? '#cbd5e1' : '#a7f3d0'}; border-bottom:4px solid ${this.isAudioMuted ? '#94a3b8' : '#6ee7b7'}; color:${this.isAudioMuted ? '#64748b' : '#059669'};" title="${this.isAudioMuted ? 'Audio is Muted (Click to Unmute & Listen)' : 'Audio is Active (Click to Mute)'}">
                ${this.isAudioMuted ? '🔇 Audio (Muted)' : '🔊 Audio (On)'}
              </button>

              <!-- 🤟 Sign Language Toggle -->
              <button id="toggle-sign-language-btn" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.85rem; font-weight:800; background:#f5f3ff; border:2px solid #ddd6fe; border-bottom:4px solid #c4b5fd; color:#7c3aed;" title="Sign Language Instruction">
                🤟 Sign Language
              </button>

              <!-- 👁️ Timer Visibility Toggle -->
              <button id="toggle-timer-vis-btn" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.85rem; font-weight:800;" title="Show/Hide Timer">
                ${this.isTimerVisible ? '👁️ Hide Timer' : '🙈 Show Timer'}
              </button>

              <!-- ⏱️ Per-question countdown timer -->
              <div id="question-timer-container" style="display:${this.isTimerVisible ? 'flex' : 'none'}; align-items:center; gap:0.5rem; background:#ffffff; border:2px solid #e2e8f0; padding:0.4rem 0.9rem; border-radius:20px; box-shadow:0 2px 5px rgba(0,0,0,0.03);">
                <span style="font-size:0.95rem;">⏱️</span>
                <span id="question-timer-display" style="font-family:monospace; font-size:1.1rem; font-weight:900; color:${this.questionTimerSecondsRemaining <= 15 ? '#ef4444' : '#1e293b'};">
                  ${Math.floor(this.questionTimerSecondsRemaining / 60)}:${String(this.questionTimerSecondsRemaining % 60).padStart(2, '0')}
                </span>
                <div style="width:48px; height:6px; background:#f1f5f9; border-radius:3px; overflow:hidden;">
                  <div id="question-timer-ring" style="width:${(this.questionTimerSecondsRemaining / AssessmentRunner.QUESTION_TIME_LIMIT_SEC) * 100}%; height:100%; background:${this.questionTimerSecondsRemaining <= 15 ? '#ef4444' : '#10b981'}; transition:width 0.9s linear;"></div>
                </div>
              </div>

              <!-- Pause Button -->
              <button id="pause-btn" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.85rem; font-weight:800;" title="Pause Assessment">
                ⏸️ Pause
              </button>
              <!-- Exit Exam Button -->
              <button id="exit-exam-btn" class="btn btn-secondary" style="padding:0.45rem 0.85rem; font-size:0.85rem; font-weight:800; background:#fee2e2; border:2px solid #fca5a5; border-bottom:4px solid #f87171; color:#ef4444;" title="Exit and Reset Exam">
                🚪 Exit
              </button>
            </div>
          </div>

          <h2 class="activity-title">${activity.title}</h2>
          <p class="activity-instructions">${activity.instructions}</p>
        </div>

        <div class="interactive-playground" id="playground-area">
          ${this.renderPlaygroundContent(activity, answerState)}
        </div>

        <div class="activity-footer">
          <div class="nav-buttons-group" style="width:100%;">
            <button
              class="btn btn-primary"
              id="submit-answer-btn"
              ${this.isLoadingNextQuestion ? 'disabled' : ''}
              style="background: ${this.isLoadingNextQuestion ? '#94a3b8' : '#3b82f6'}; border: none; border-bottom: 6px solid ${this.isLoadingNextQuestion ? '#64748b' : '#2563eb'}; color: #ffffff; border-radius: 1.25rem; font-weight: 900; width: 100%; font-size: 1.15rem; padding: 1.1rem 2rem; transition: all 0.2s ease; cursor: pointer;"
            >
              ${this.isLoadingNextQuestion
                ? '<span style="display:flex;align-items:center;justify-content:center;gap:0.6rem;"><span style="width:18px;height:18px;border-radius:50%;border:3px solid rgba(255,255,255,0.4);border-top-color:#fff;animation:spin 0.8s linear infinite;"></span> Loading Next Question...</span>'
                : 'Confirm &amp; Next ➔'
              }
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderPlaygroundContent(activity: ActivityItem, answerState: StoredUserAnswer): string {
    const payload = activity.payload || {};

    if (activity.type === 'robot_mission') {
      const blocks: string[] = payload.availableBlocks || ['Move Forward ⬆️', 'Turn Right ➡️', 'Grab Item 🦾'];
      const slot = activity.slot;

      let mapHtml = payload.routeMap || '';
      if (!mapHtml) {
        if (slot === 13) {
          mapHtml = `[ 🤖 Robo ] ➔ ➡️ [ ◽ Path ] ➔ ➡️ [ ⭐ Star ]`;
        } else if (slot === 14 || slot === 15) {
          mapHtml = `[ 🤖 Robo ] ➔ ➡️ [ ◽ Walk Forward ] ➔ ⤵️ [ Turn Right ] ➔ 🦾 [ 💎 Gem ]`;
        } else if (slot === 16) {
          mapHtml = `[ 🤖 Robo ] ➔ ⤴️ [ Turn Left ] ➔ ➡️ [ ◽ Walk Forward ] ➔ 📦 [ Package ]`;
        } else if (slot === 17 || slot === 21) {
          mapHtml = `[ 🤖 Robo ] ➔ ➡️ [ ◽ Move Forward ] ➔ ⤵️ [ Turn Right ] ➔ 🦾 [ 💎 Gem ]`;
        } else if (slot === 18) {
          mapHtml = `[ 🤖 Robo ] ➔ ⤴️ [ Turn Left ] ➔ ➡️ [ ◽ Walk Forward ] ➔ 📦 [ Drop Package ]`;
        } else if (slot === 19 || slot === 23) {
          mapHtml = `[ 🤖 Robo ] ➔ 🚪 [ Open Door ] ➔ ➡️ [ Move ] ➔ 🦾 [ Grab Treasure ] ➔ 🏠 [ Return Home ]`;
        } else if (slot === 24) {
          mapHtml = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:0.4rem;">
              <div>[ 🤖 Robo ] ➔ ➡️ [ 🧱 BIG ROCK! (Blocked!) ]</div>
              <div style="color:#d97706; font-size:0.95rem;">⤵️ Turn Right Around Rock ➔ ➡️ Move Forward ➔ ⤴️ Turn Left</div>
              <div>[ 💎 Gem Treasure ]</div>
            </div>
          `;
        } else if (slot === 50) {
          mapHtml = `[ ⚡ Power On ] ➔ 📡 [ Connect ] ➔ 📱 [ Open App ] ➔ 🎓 [ Start Learning ]`;
        } else {
          mapHtml = `[ 🤖 Robo ] ➔ ➡️ [ ◽ Path ] ➔ 🦾 [ Target Goal ]`;
        }
      }

      return `
        <div style="background: #f0fdf4; border: 2px solid #86efac; padding: 1rem 1.5rem; border-radius: 1.25rem; margin-bottom: 1.25rem; text-align: center; box-shadow: 0 4px 15px rgba(16,185,129,0.08);">
          <div style="font-size: 0.78rem; font-weight: 900; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem;">
            🗺️ Mission Route Map
          </div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #1e293b;">
            ${mapHtml}
          </div>
        </div>

        <div class="robot-mission-container">
          <div>
            <h4 style="margin-bottom:0.5rem; font-size:0.9rem; color:#64748b; font-weight:800;">Available Actions:</h4>
            <div class="blocks-palette">
              ${blocks.map((blk: string) => `
                <button class="code-block" data-block="${blk}">+ ${blk}</button>
              `).join('')}
            </div>
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <h4 style="font-size:0.9rem; color:#64748b; margin:0; font-weight:800;">Sequence (${answerState.robotSequence.length} steps):</h4>
              ${answerState.robotSequence.length > 0 ? `
                <button id="clear-sequence-btn" style="font-size:0.75rem; font-weight:800; color:#d97706; background:#fef3c7; border:1px solid #fde68a; padding:0.25rem 0.65rem; border-radius:8px; cursor:pointer;">🗑️ Clear</button>
              ` : ''}
            </div>
            <div class="sequence-dropzone" id="sequence-box">
              ${answerState.robotSequence.length === 0
                ? '<span style="color:#94a3b8; font-size:0.9rem; font-weight:600; text-align:center; padding:1.5rem 0;">Click action blocks on the left to build your robot sequence...</span>'
                : answerState.robotSequence.map((blk, i) => `
                <div class="sequence-step" style="background:#3b82f6; padding:0.5rem 0.9rem; border-radius:10px; font-size:0.9rem; font-weight:800; display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
                  <span>📌 ${i + 1}. ${blk}</span>
                  <button class="remove-block-btn" data-idx="${i}" style="background:rgba(0,0,0,0.25); border:none; color:#fff; width:22px; height:22px; border-radius:50%; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; justify-content:center; flex-shrink:0;">×</button>
                </div>
              `).join('')
              }
            </div>
          </div>
        </div>
      `;
    }

    if (activity.type === 'picture_match') {
      const audioPrompt = payload.audioPromptText || activity.instructions || 'Select the matching item';
      const options: any[] = payload.options && payload.options.length > 0 ? payload.options : [
        { label: 'Option A', emoji: '🤖' },
        { label: 'Option B', emoji: '🍎' },
        { label: 'Option C', emoji: '⚽' }
      ];
      return `
        <div style="margin-bottom: 1.25rem; font-size:1.1rem; color:#059669; font-weight:800; text-align:center; background:#ecfdf5; border:2px solid #a7f3d0; border-radius:1.25rem; padding:0.85rem 1.25rem; display:flex; align-items:center; justify-content:center; gap:0.75rem; flex-wrap:wrap;">
          <span>🔊 "${audioPrompt}"</span>
          <button id="listen-audio-btn" style="background:#ffffff; border:2px solid #a7f3d0; color:#059669; border-radius:10px; padding:0.35rem 0.85rem; font-size:0.85rem; cursor:pointer; font-weight:800; transition:all 0.2s;">
            🔊 Listen Again
          </button>
        </div>
        <div class="options-grid-3">
          ${options.slice(0, 3).map((opt: any, idx: number) => {
            const label = typeof opt === 'string' ? opt : (opt.label || `Option ${idx + 1}`);
            const emoji = typeof opt === 'object' && opt.emoji ? opt.emoji : (['🤖','🍎','⚽'][idx] || '🎯');
            return `
              <button class="option-btn-3 ${answerState.selectedAnswerIndex === idx ? 'selected' : ''}" data-opt="${idx}">
                <span style="font-size: 2.5rem; display:block; margin-bottom:0.25rem;">${emoji}</span>
                <span style="font-size: 1rem; font-weight:800;">${label}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    }

    if (activity.type === 'motor_target') {
      const targetsCount = payload.targetsCount || 3;
      const allHit = answerState.motorClicks.length >= targetsCount;
      return `
        <div class="motor-canvas-container" id="motor-canvas">
          ${!allHit ? `<div class="motor-target" id="target-element" style="top: ${this.motorTargetPos.top}px; left: ${this.motorTargetPos.left}px;"></div>` : ''}
          <div style="position:absolute; bottom:12px; left:16px; font-size:0.9rem; color:#64748b; font-weight:800;">
            Targets Clicked: ${answerState.motorClicks.length} / ${targetsCount}
            ${allHit ? ' ✅ All targets hit!' : ''}
          </div>
        </div>
      `;
    }

    let sequenceList = Array.isArray(payload.sequence) ? payload.sequence : null;
    let gridMatrix = Array.isArray(payload.grid) ? payload.grid : null;

    let optionsList = Array.isArray(payload.options) && payload.options.length > 0
      ? payload.options.slice(0, 3)
      : [{ label: 'Choice A' }, { label: 'Choice B' }, { label: 'Choice C' }];

    return `
      ${gridMatrix ? `
        <div style="display:flex; justify-content:center; margin-bottom:1.5rem;">
          <div style="background: #ffffff; border: 2px solid #a7f3d0; padding: 1.25rem 1.75rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
            <div style="display:grid; grid-template-columns: repeat(${gridMatrix[0].length}, 1fr); gap: 0.85rem; text-align: center;">
              ${gridMatrix.map(row => row.map((cell: string) => `
                <div style="font-size: 1.6rem; background: #f8fafc; padding: 0.85rem 1.4rem; border-radius: 12px; border: 2px solid #e2e8f0; color: ${cell.includes('❓') ? '#10b981' : '#1e293b'}; font-weight: 900;">
                  ${cell}
                </div>
              `).join('')).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      ${sequenceList ? `
        <div style="font-size: 1.6rem; display: flex; gap: 0.85rem; margin-bottom: 1.5rem; background: #ffffff; border: 2px solid #e2e8f0; padding: 1.25rem 1.75rem; border-radius: 1.5rem; justify-content: center; align-items: center; flex-wrap: wrap; text-align: center; box-shadow: 0 6px 20px -5px rgba(0,0,0,0.04);">
          ${sequenceList.map((item: string) => `<span style="background:#f8fafc; border:2px solid #e2e8f0; padding:0.5rem 1rem; border-radius:12px; font-weight:900; color:${item.includes('❓') ? '#10b981' : '#1e293b'}">${item}</span>`).join('')}
        </div>
      ` : ''}

      <div class="options-grid-3">
        ${optionsList.map((opt: any, idx: number) => {
          const labelText = typeof opt === 'string' ? opt : (opt.label || opt.text || JSON.stringify(opt));
          const emoji = typeof opt === 'object' && opt.emoji ? opt.emoji : '';
          return `
            <button class="option-btn-3 ${answerState.selectedAnswerIndex === idx ? 'selected' : ''}" data-opt="${idx}">
              ${emoji ? `<span style="font-size: 2.3rem; display:block; margin-bottom:0.25rem;">${emoji}</span>` : ''}
              <span style="font-size:1.05rem; font-weight:800;">${labelText}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  private registerInteraction() {
    if (!this.itemFirstInteractionTimestamp) {
      this.itemFirstInteractionTimestamp = Date.now();
      const answerState = this.userAnswers[this.currentQuestionIndex];
      if (answerState) {
        answerState.responseLatencyMs = Math.max(100, this.itemFirstInteractionTimestamp - this.itemStartTimestamp - this.pauseDurationForCurrentQuestionMs);
      }
    }
  }

  private attachEventListeners() {
    const answerState = this.userAnswers[this.currentQuestionIndex];

    // Options click (3 choice grid)
    const optionBtns = this.container.querySelectorAll('.option-btn-3');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.registerInteraction();
        const target = e.currentTarget as HTMLElement;
        const optIdx = parseInt(target.getAttribute('data-opt') || '0', 10);
        answerState.selectedAnswerIndex = optIdx;
        answerState.isSolved = true;
        answerState.answeredAt = Date.now();
        answerState.remainingTimeWhenAnsweredMs = this.questionTimerSecondsRemaining * 1000;
        answerState.attemptsCount = Math.max(1, answerState.attemptsCount + 1);

        this.render();
      });
    });

    // Code blocks click
    const blockBtns = this.container.querySelectorAll('.code-block');
    blockBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.registerInteraction();
        const target = e.currentTarget as HTMLElement;
        const blockName = target.getAttribute('data-block');
        if (blockName) {
          answerState.robotSequence.push(blockName);
          answerState.isSolved = answerState.robotSequence.length > 0;
          answerState.answeredAt = Date.now();
          answerState.attemptsCount = Math.max(1, answerState.attemptsCount + 1);
          this.render();
        }
      });
    });

    // Remove block
    const removeBtns = this.container.querySelectorAll('.remove-block-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = e.currentTarget as HTMLElement;
        const idx = parseInt(target.getAttribute('data-idx') || '0', 10);
        answerState.robotSequence.splice(idx, 1);
        answerState.isSolved = answerState.robotSequence.length > 0;
        this.render();
      });
    });

    // Clear sequence
    const clearSeqBtn = this.container.querySelector('#clear-sequence-btn');
    if (clearSeqBtn) {
      clearSeqBtn.addEventListener('click', () => {
        answerState.robotSequence = [];
        answerState.isSolved = false;
        this.render();
      });
    }

    // Audio button handlers
    const speakQuestionBtn = this.container.querySelector('#speak-question-btn');
    if (speakQuestionBtn) {
      speakQuestionBtn.addEventListener('click', () => {
        const activity = this.cachedActivities[this.currentQuestionIndex];
        if (this.isAudioMuted) {
          this.isAudioMuted = false;
          if (activity) {
            const promptText = activity.payload?.audioPromptText || activity.instructions;
            this.speakAudio(promptText, true);
          }
        } else {
          this.isAudioMuted = true;
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
        }
        this.render();
      });
    }

    const listenAudioBtn = this.container.querySelector('#listen-audio-btn');
    if (listenAudioBtn) {
      listenAudioBtn.addEventListener('click', () => {
        const activity = this.cachedActivities[this.currentQuestionIndex];
        if (activity) {
          const promptText = activity.payload?.audioPromptText || activity.instructions;
          this.speakAudio(promptText, true);
        }
      });
    }

    // Sign Language toggle
    const toggleSignLanguageBtn = this.container.querySelector('#toggle-sign-language-btn');
    if (toggleSignLanguageBtn) {
      toggleSignLanguageBtn.addEventListener('click', () => {
        this.isSignLanguageModalOpen = true;
        this.render();
      });
    }

    const closeSignLanguageBtn = this.container.querySelector('#close-sign-language-btn');
    if (closeSignLanguageBtn) {
      closeSignLanguageBtn.addEventListener('click', () => {
        this.isSignLanguageModalOpen = false;
        this.render();
      });
    }

    // Timer visibility toggle
    const toggleTimerVisBtn = this.container.querySelector('#toggle-timer-vis-btn');
    if (toggleTimerVisBtn) {
      toggleTimerVisBtn.addEventListener('click', () => {
        this.isTimerVisible = !this.isTimerVisible;
        this.render();
      });
    }

    // Fine Motor Target click
    const targetEl = this.container.querySelector('#target-element');
    const canvasEl = this.container.querySelector('#motor-canvas');
    if (targetEl && canvasEl) {
      targetEl.addEventListener('click', (e: any) => {
        this.registerInteraction();
        const rect = targetEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const dist = Math.sqrt(Math.pow(clickX - rect.width / 2, 2) + Math.pow(clickY - rect.height / 2, 2));

        answerState.motorClicks.push({ x: clickX, y: clickY, dist });
        answerState.attemptsCount = Math.max(1, answerState.attemptsCount + 1);

        const canvasRect = canvasEl.getBoundingClientRect();
        const newTop = Math.floor(Math.random() * (canvasRect.height - 80)) + 10;
        const newLeft = Math.floor(Math.random() * (canvasRect.width - 80)) + 10;
        this.motorTargetPos = { top: newTop, left: newLeft };

        const requiredCount = this.cachedActivities[this.currentQuestionIndex]?.payload?.targetsCount || 3;
        if (answerState.motorClicks.length >= requiredCount) {
          answerState.selectedAnswerIndex = 0;
          answerState.isSolved = true;
          answerState.answeredAt = Date.now();
          answerState.remainingTimeWhenAnsweredMs = this.questionTimerSecondsRemaining * 1000;
        }
        this.render();
      });
    }

    // Pause & Resume buttons
    const pauseBtn = this.container.querySelector('#pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseAssessment());
    }

    const resumeBtn = this.container.querySelector('#resume-btn');
    if (resumeBtn) {
      resumeBtn.addEventListener('click', () => this.resumeAssessment());
    }

    // Exit Exam button and modal handlers
    const exitBtn = this.container.querySelector('#exit-exam-btn');
    const exitOverlay = this.container.querySelector('#exit-confirm-overlay') as HTMLElement;
    const cancelExitBtn = this.container.querySelector('#cancel-exit-btn');
    const confirmExitBtn = this.container.querySelector('#confirm-exit-btn');

    if (exitBtn && exitOverlay) {
      exitBtn.addEventListener('click', () => {
        exitOverlay.style.display = 'flex';
      });
    }
    if (cancelExitBtn && exitOverlay) {
      cancelExitBtn.addEventListener('click', () => {
        exitOverlay.style.display = 'none';
      });
    }
    if (confirmExitBtn) {
      confirmExitBtn.addEventListener('click', () => {
        this.exitAndReset(true);
      });
    }

    // Confirm & Next Submit Button
    const submitAnswerBtn = this.container.querySelector('#submit-answer-btn');
    if (submitAnswerBtn) {
      submitAnswerBtn.addEventListener('click', () => {
        if (this.isLoadingNextQuestion) return;

        // Playful celebratory confetti on answering
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.75 },
            colors: ['#4ADE80', '#3B82F6', '#FBBF24', '#F472B6']
          });
        } catch (e) {}

        this.recordQuestionTimeData(answerState.isSolved);
        this.advanceToNextQuestion();
      });
    }
  }

  private showCompletionLoadingScreen() {
    try {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#4ADE80', '#3B82F6', '#FBBF24', '#F472B6', '#8B5CF6']
      });
    } catch (e) {}

    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; text-align:center; padding:3rem 1rem;">
        <div style="font-size:4rem; margin-bottom:1.5rem; animation:bounce 1.5s infinite;">🎉</div>
        <h2 style="font-size:2rem; font-weight:800; color:#fff; margin-bottom:0.75rem;">Assessment Complete!</h2>
        <p style="color:var(--text-secondary); font-size:1.05rem; margin-bottom:2rem; max-width:460px;">
          Amazing work completing all 50 questions! Your results are being compiled and your personalised CodeRa AI report is being generated...
        </p>
        <div style="display:flex; align-items:center; gap:0.75rem; background:rgba(6,182,212,0.12); border:1px solid rgba(6,182,212,0.3); padding:1rem 2rem; border-radius:20px;">
          <div style="width:18px; height:18px; border-radius:50%; border:3px solid var(--accent-cyan); border-top-color:transparent; animation:spin 0.9s linear infinite;"></div>
          <span style="color:var(--accent-cyan); font-weight:700; font-size:1rem;">Generating Your CodeRa Report...</span>
        </div>
      </div>
    `;
  }

  private async completeAssessment() {
    if (this.globalTimerInterval) clearInterval(this.globalTimerInterval);
    if (this.questionTimerInterval) clearInterval(this.questionTimerInterval);

    this.detachBeforeUnload();
    AssessmentRunner.clearSavedSession();

    this.showCompletionLoadingScreen();

    const itemTelemetries: ItemTelemetry[] = [];
    const itemMaxPtsMap: Record<string, number> = {};

    // Compile telemetry across all 50 questions
    for (let i = 0; i < TOTAL_BASE_QUESTIONS; i++) {
      const activity = this.cachedActivities[i];
      const answerState = this.userAnswers[i];
      const baseline = QUESTION_BASELINES[i];
      if (!activity) continue;

      let isCorrect = false;
      let accuracyScore = 0.0;

      if (activity.type === 'robot_mission' || Array.isArray(activity.payload?.availableBlocks)) {
        const targetSeq: string[] = activity.payload?.correctSequence || [];
        let matched = 0;
        answerState.robotSequence.forEach((step, idx) => {
          if (targetSeq[idx] === step) matched++;
        });
        accuracyScore = targetSeq.length > 0 ? matched / targetSeq.length : (answerState.robotSequence.length > 0 ? 1.0 : 0.0);
        isCorrect = accuracyScore >= 0.8;
      } else if (activity.type === 'motor_target') {
        isCorrect = answerState.motorClicks.length > 0;
        accuracyScore = Math.min(1.0, answerState.motorClicks.length / (activity.payload?.targetsCount || 3));
      } else {
        isCorrect = (answerState.selectedAnswerIndex === (activity.payload?.correctIndex ?? 0));
        accuracyScore = isCorrect ? 1.0 : 0.0;
      }

      itemMaxPtsMap[activity.id] = baseline.maxPoints;

      itemTelemetries.push({
        item_id: activity.id,
        domain: activity.domain,
        skill: activity.skill,
        format: activity.format,
        difficulty_level: activity.difficulty,
        is_correct: isCorrect,
        accuracy_score: accuracyScore,
        response_time_ms: Math.max(1000, answerState.timeSpentMs),
        expected_time_ms: 90000,
        attempts_count: Math.max(1, answerState.attemptsCount),
        hints_used: answerState.hintsUsed
      });

      if (this.questionTimeRecords[i]) {
        this.questionTimeRecords[i].earnedScore = ScoringEngine.calculateItemScore(itemTelemetries[i], baseline.maxPoints);
      }
    }

    // Calculate domain, format & placement scores (v2 schema)
    const domainScores = ScoringEngine.calculateDomainScores(itemTelemetries, itemMaxPtsMap);
    const formatScores = ScoringEngine.calculateFormatScores(itemTelemetries, itemMaxPtsMap);
    const codingReadinessScore = ScoringEngine.calculateCodingReadinessScore(itemTelemetries);

    const totalScore = ScoringEngine.calculateTotalScore(domainScores);
    const placement = PlacementEngine.evaluatePlacement(totalScore, domainScores, itemTelemetries, '2.0');

    // Domain Time Summaries
    const domainsList: AssessmentDomain[] = [
      'cognitive_ability', 'functional_skills', 'communication_level', 'behavioral_readiness', 'fine_motor_technology'
    ];
    const domainTimeSummary: Record<AssessmentDomain, any> = {} as any;

    domainsList.forEach(d => {
      const records = this.questionTimeRecords.filter(r => r && r.domain === d);
      const totalActiveMs = records.reduce((acc, r) => acc + (r.activeDurationMs || 0), 0);
      const totalPausedMs = records.reduce((acc, r) => acc + (r.pausedDurationMs || 0), 0);
      const questionsTimedOut = records.filter(r => r.timedOut).length;
      const validLatencies = records.map(r => r.responseLatencyMs).filter(l => l !== null) as number[];
      const avgResponseLatencyMs = validLatencies.length > 0 ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) : 0;

      domainTimeSummary[d] = {
        totalActiveMs,
        totalPausedMs,
        questionsTimedOut,
        avgResponseLatencyMs
      };
    });

    const totalActiveDurationMs = this.questionTimeRecords.reduce((acc, r) => acc + (r?.activeDurationMs || 0), 0);
    const totalBreakDurationMs = this.breakEvents.reduce((acc, b) => acc + b.breakDurationMs, 0) + (this.partBreakRecord?.breakDurationMs || 0);

    const session: StudentSessionTelemetry = {
      schema_version: '2.0',
      session_id: `codera_sess_${Date.now()}`,
      student_name: this.studentName || 'Alex Rivers',
      age_group: '13-16',
      start_time: new Date(Date.now() - this.totalTimerSeconds * 1000).toISOString(),
      end_time: new Date().toISOString(),
      item_telemetries: itemTelemetries,
      domain_scores: domainScores,
      format_scores: formatScores,
      coding_readiness_score: codingReadinessScore,
      total_score: totalScore,
      placed_track: placement.baseTrack,
      recommended_track: placement.recommendedTrack,
      flags: placement.flags.map(f => f.id),

      question_time_records: this.questionTimeRecords,
      break_events: this.breakEvents,
      part_break_record: this.partBreakRecord || undefined,
      total_breaks_count: this.breakEvents.length + (this.partBreakRecord ? 1 : 0),
      total_break_duration_ms: totalBreakDurationMs,
      total_active_duration_ms: totalActiveDurationMs,
      total_wall_clock_duration_ms: totalActiveDurationMs + totalBreakDurationMs,
      domain_time_summary: domainTimeSummary
    };

    // Generate AI Qualitative Summary
    const reportSummary = await this.analyzer.generateReportSummary(session, placement);
    session.qualitative_summary = reportSummary;

    // Save session to registry for Parent Portal retrieval
    try {
      const raw = localStorage.getItem('codera_all_sessions') || localStorage.getItem('cognix_all_sessions') || '[]';
      const sessionsArr: StudentSessionTelemetry[] = JSON.parse(raw);
      sessionsArr.unshift(session);
      localStorage.setItem('codera_all_sessions', JSON.stringify(sessionsArr));
    } catch(e) {}

    // Gated Child Experience: Render Screening Video & Booking Screen (NO SCORES FOR CHILD)
    this.renderChildScreeningAndBookingScreen(session);
  }

  private renderChildScreeningAndBookingScreen(session: StudentSessionTelemetry) {
    try {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
    } catch(e) {}

    this.container.innerHTML = `
      <div class="min-h-screen bg-slate-950 text-white p-6 md:p-12 flex items-center justify-center" dir="ltr">
        <div class="max-w-2xl w-full bg-slate-900/90 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl space-y-6 text-center animate-fadeIn">
          
          <div class="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center text-4xl font-black shadow-lg shadow-emerald-500/30 animate-bounce">
            🎉
          </div>

          <div class="space-y-2">
            <span class="px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-extrabold">
              Assessment Completed!
            </span>
            <h2 class="text-3xl md:text-4xl font-black tracking-tight text-white">
              Awesome Job, ${this.studentName}! 🚀
            </h2>
            <p class="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              You have successfully completed your 2-Day Placement Assessment! To finalize your profile and release your detailed report to your Parent Portal, please upload a short screening video or schedule a specialist session.
            </p>
          </div>

          <!-- 2 Screening Options Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            
            <!-- Option A: Screening Video Upload -->
            <div id="optionVideoCard" class="bg-slate-800/80 p-5 rounded-2xl border-2 border-indigo-500/50 hover:border-indigo-400 cursor-pointer transition-all space-y-3 relative group">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold">
                📹
              </div>
              <h4 class="font-black text-white text-sm">Upload Screening Video</h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                Upload a 1–2 minute video of the student demonstrating basic motor or verbal exercises for specialist review.
              </p>
              <input type="file" id="childScreeningVideoInput" accept="video/*" class="hidden" />
              <button type="button" id="childVideoUploadBtn" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer">
                <i class="fa-solid fa-cloud-arrow-up mr-1"></i> Select Video File
              </button>
              <div id="videoFileSelectedBadge" class="hidden text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                <i class="fa-solid fa-circle-check"></i> <span id="videoFileName">screening.mp4</span>
              </div>
            </div>

            <!-- Option B: Book Specialist Session -->
            <div id="optionBookingCard" class="bg-slate-800/80 p-5 rounded-2xl border-2 border-purple-500/50 hover:border-purple-400 cursor-pointer transition-all space-y-3 relative group">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold">
                🗓️
              </div>
              <h4 class="font-black text-white text-sm">Schedule Specialist Live Session</h4>
              <p class="text-xs text-slate-400 leading-relaxed">
                Book a 15-minute live screening consultation with an SEN specialist assessor.
              </p>
              <select id="specialistSlotSelect" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 outline-none">
                <option value="Tomorrow at 4:00 PM">Tomorrow at 4:00 PM</option>
                <option value="Saturday at 11:00 AM">Saturday at 11:00 AM</option>
                <option value="Sunday at 2:00 PM">Sunday at 2:00 PM</option>
              </select>
            </div>

          </div>

          <!-- Privacy & Protection Callout -->
          <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3 text-left">
            <div class="text-xl">🔒</div>
            <div>
              <strong>Parent Privacy Protection:</strong> Assessment scores and track matrices are safely reserved for your parent's dashboard and will be unlocked upon screening confirmation.
            </div>
          </div>

          <!-- Submit & Return to Home Button -->
          <button id="submitScreeningAndExitBtn" class="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 transition-all cursor-pointer transform hover:scale-[1.01]">
            <span>Submit Screening & Proceed to Parent Portal 🚀</span>
          </button>

        </div>
      </div>
    `;

    // Attach event listeners
    const videoInput = this.container.querySelector('#childScreeningVideoInput') as HTMLInputElement;
    const videoBtn = this.container.querySelector('#childVideoUploadBtn');
    const videoBadge = this.container.querySelector('#videoFileSelectedBadge');
    const videoFileName = this.container.querySelector('#videoFileName');

    if (videoBtn && videoInput) {
      videoBtn.addEventListener('click', () => videoInput.click());
      videoInput.addEventListener('change', () => {
        if (videoInput.files && videoInput.files[0]) {
          if (videoBadge && videoFileName) {
            videoFileName.textContent = videoInput.files[0].name;
            videoBadge.classList.remove('hidden');
          }
        }
      });
    }

    const submitExitBtn = this.container.querySelector('#submitScreeningAndExitBtn');
    if (submitExitBtn) {
      submitExitBtn.addEventListener('click', () => {
        // Save session to localStorage
        try {
          const raw = localStorage.getItem('codera_all_sessions') || localStorage.getItem('cognix_all_sessions') || '[]';
          const sessions: StudentSessionTelemetry[] = JSON.parse(raw);
          const found = sessions.find(s => s.session_id === session.session_id) || session;
          (found as any).screening_video_uploaded = true;
          (found as any).screening_session_booked = true;
          localStorage.setItem('codera_all_sessions', JSON.stringify(sessions));
        } catch(e) {}

        AssessmentRunner.clearSavedSession();
        if (typeof (window as any).openParentDashboard === 'function') {
          (window as any).openParentDashboard();
        } else {
          (window as any).returnToLandingPage();
        }
      });
    }
  }
}
