// ---------------------------------------------------------------------------
// CodeRA Platform — Motor Assessment Runner (Camera & Live Hand Tracking)
// Fully responsive, Arabic-first interface based on Evaluation.docx
// ---------------------------------------------------------------------------

import { MOTOR_ASSESSMENT_TASKS } from './taskDefinitions';
import { MotorTaskDefinition, MotorTaskResult } from './types';
import { MotorTrackerService, HandFrameData, ArmFrameData } from './trackerService';
import { MotorSoundService } from './soundService';
import { MotorScoringEngine } from './motorScoring';
import { MotorReportDashboard } from './MotorReportDashboard';
import { apiService } from '../services/apiService';

export class MotorAssessmentRunner {
  private container: HTMLElement;
  private studentName: string = 'Alex Rivers';
  private tracker: MotorTrackerService;
  private currentTaskIndex: number = 0;
  private taskResults: MotorTaskResult[] = [];
  
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  
  private taskStartTime: number = 0;
  private taskHoldStartTime: number | null = null;
  private currentRepetitionsDone: number = 0;
  private attemptsCount: number = 1;
  private isProcessing: boolean = false;
  private latestArms: ArmFrameData[] = [];
  private holdProgressMs: number = 0;
  private lastFrameTime: number = performance.now();

  // Movement tracking state machine & checklist
  private wristDirections = { up: false, down: false, left: false, right: false };
  private palmDirections = { up: false, down: false };
  private cycleCount: number = 0;
  private cyclePhase: 'open' | 'closed' | 'pinched' | 'neutral' = 'neutral';
  private thumbOppositions = { index: false, middle: false, ring: false, pinky: false };
  private checklistItems: { id: string; label: string; done: boolean }[] = [];

  // Strict-recognition state
  private dwellTimers: Record<string, number> = {};
  private graceMs: number = 1500;
  private handPresentMs: number = 0;
  private palmBase: 'A' | 'B' | null = null;
  private wristBase: { x: number; y: number } | null = null;
  private maxDeviation: number = 0;
  private tremorSum: number = 0;
  private tremorN: number = 0;

  /** True only once `cond` has been continuously satisfied for `ms`. */
  private dwell(key: string, cond: boolean, dt: number, ms: number): boolean {
    if (!cond) {
      this.dwellTimers[key] = 0;
      return false;
    }
    this.dwellTimers[key] = (this.dwellTimers[key] || 0) + dt;
    return this.dwellTimers[key] >= ms;
  }

  // Interactive target states for Section 4
  private targetPos: { x: number; y: number } = { x: 0.5, y: 0.5 };
  private targetSpeed: { vx: number; vy: number } = { vx: 0.004, vy: 0.003 };
  private sequentialTargets: { id: number; x: number; y: number; hit: boolean }[] = [];
  private currentSequenceIndex: number = 0;
  private keyboardKeys: { key: string; x: number; y: number; w: number; h: number; active: boolean }[] = [];
  private activeKeyIndex: number = 0;

  // Finger isolation & tracking games
  private fingerIsolationStage: 'index' | 'middle' = 'index';
  private trackingScoreMs: number = 0;

  // Visual-Motor Memory Sequence game (Task 25 / motor_coord_10)
  private memoryPads: { id: number; color: string; label: string; x: number; y: number; r: number; active: boolean }[] = [];
  private memorySequence: number[] = [0, 2, 1];
  private memoryStepIndex: number = 0;
  private memoryPhase: 'demo' | 'user' = 'demo';
  private memoryDemoTimer: number = 0;
  private memoryDemoStep: number = 0;

  // Dominant hand detection
  private lastHandedness: 'Right' | 'Left' = 'Right';

  constructor(container: HTMLElement) {
    this.container = container;
    this.tracker = new MotorTrackerService();
  }

  public async startSession(studentName: string) {
    this.studentName = studentName;
    this.currentTaskIndex = 0;
    this.taskResults = [];
    this.renderWelcomeGate();
    // Pre-warm the MediaPipe hand tracking model in the background immediately!
    this.tracker.initializeModel().catch(() => {});
  }

  /**
   * Welcome & Camera Permission Gate
   */
  private renderWelcomeGate() {
    this.container.innerHTML = `
      <div class="motor-welcome-screen" style="
        min-height: 100vh;
        background: radial-gradient(circle at 50% 20%, #1e293b 0%, #0a0f1d 100%);
        color: #f8fafc;
        font-family: 'Cairo', 'Inter', sans-serif;
        direction: rtl;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
      ">
        <div style="
          max-width: 680px;
          width: 100%;
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(6, 182, 212, 0.4);
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.2);
          text-align: center;
          position: relative;
        ">
          <!-- Close button -->
          <button id="exit-motor-welcome" style="
            position: absolute;
            top: 1.25rem;
            left: 1.25rem;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #94a3b8;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          ">✕</button>

          <div style="width: 76px; height: 76px; border-radius: 22px; background: linear-gradient(135deg, #06b6d4, #10b981); margin: 0 auto 1.5rem auto; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; box-shadow: 0 8px 24px rgba(6, 182, 212, 0.4);">
            🖐️
          </div>

          <span style="background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.4); color: #38bdf8; font-weight: 800; font-size: 0.85rem; padding: 0.35rem 1rem; border-radius: 9999px;">
            تقييم المهارات الحركية وتتبع اليدين
          </span>

          <h2 style="margin: 1rem 0 0.5rem 0; font-size: 1.85rem; font-weight: 900; color: #ffffff;">
            مرحبًا بك يا <span style="color: #38bdf8;">${this.studentName}</span>
          </h2>

          <p style="color: #cbd5e1; font-size: 0.98rem; line-height: 1.6; margin: 0 auto 1.5rem auto; max-width: 540px;">
            يقوم هذا التقييم الذكي بتحليل حركات اليد، مرونة المعصم، وعزل حركة الأصابع والتنسيق البصري الحركي باستخدام كاميرا الجهاز مباشرة للتحقق من جاهزية استخدام الماوس والكيبورد.
          </p>

          <!-- Instructions Card -->
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 1.25rem; margin-bottom: 2rem; text-align: right;">
            <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: #10b981; display: flex; align-items: center; gap: 0.5rem;">
              <span>📋</span>
              <span>تعليمات مهمة قبل البدء:</span>
            </h4>
            <ul style="margin: 0; padding-right: 1.25rem; color: #cbd5e1; font-size: 0.9rem; line-height: 1.7;">
              <li>اجلس في مكان ذي إضاءة جيدة ومباشرة.</li>
              <li>ضع الجهاز (أو الهاتف) على مسافة مريحة بين <b>30 إلى 50 سم</b>.</li>
              <li>تأكد من ظهور اليدين والذراعين بوضوح داخل إطار الكاميرا.</li>
              <li>جميع المعالجات تتم محليًا داخل متصفحك بأمان وخصوصية تامة 100%.</li>
            </ul>
          </div>

          <!-- Action Button -->
          <button id="start-camera-exam-btn" style="
            width: 100%;
            background: linear-gradient(135deg, #06b6d4, #10b981);
            color: #ffffff;
            font-size: 1.15rem;
            font-weight: 800;
            padding: 1rem;
            border-radius: 16px;
            border: none;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(6, 182, 212, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            transition: transform 0.2s, box-shadow 0.2s;
          ">
            <span>📷</span>
            <span>تشغيل الكاميرا وبدء التقييم</span>
          </button>
        </div>
      </div>
    `;

    const startBtn = document.getElementById('start-camera-exam-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.initializeCameraAndStart();
      });
    }

    const exitBtn = document.getElementById('exit-motor-welcome');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.exit();
      });
    }
  }

  /**
   * Initialize MediaPipe & Camera, then mount assessment UI
   */
  private async initializeCameraAndStart() {
    // 1. Mount Active Assessment UI immediately so the user sees the interface
    this.mountAssessmentUI();
    this.updateDetectedStatus('جاري تشغيل الكاميرا... 📷');

    // 2. Start video feed immediately — browser prompts camera permission right away!
    if (this.videoEl) {
      const ok = await this.tracker.startCamera(this.videoEl);
      if (!ok) {
        alert('تعذر تشغيل الكاميرا. يرجى التأكد من منح الإذن للمتصفح وإعادة المحاولة.');
        this.renderWelcomeGate();
        return;
      }
    }

    // 3. Ensure AI tracking model is ready (with live status updates)
    this.updateDetectedStatus('جاري تفعيل نموذج التتبع الذكي... ⏳');
    const isModelReady = await this.tracker.initializeModel((msg) => {
      this.updateDetectedStatus(msg);
    });

    if (!isModelReady) {
      this.updateDetectedStatus('تعذر تحميل النموذج التلقائي. التقييم متاح عبر التأكيد اليدوي من المشرف 👥');
    }

    // 4. Launch task 1
    this.loadTask(0);
    this.startTrackingLoop();
  }

  /**
   * Mount Active Assessment UI
   */
  private mountAssessmentUI() {
    this.container.innerHTML = `
      <div class="motor-runner-wrapper" style="
        width: 100%;
        min-height: 100vh;
        background: #090d16;
        color: #f8fafc;
        font-family: 'Cairo', 'Inter', sans-serif;
        direction: rtl;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      ">
        <style>
          @keyframes fadeInOut {
            0% { opacity: 0; transform: scale(0.9); }
            20% { opacity: 1; transform: scale(1); }
            80% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(1.05); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulseGlow {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.08); opacity: 1; }
          }
        </style>
        <!-- Top Status Bar -->
        <header style="
          background: rgba(15, 23, 42, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
        ">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="font-size: 1.4rem;">🖐️</span>
            <div>
              <span id="motor-section-badge" style="font-size: 0.78rem; font-weight: 800; color: #38bdf8; text-transform: uppercase;"></span>
              <h2 id="motor-task-title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;"></h2>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <!-- Progress indicator -->
            <div style="text-align: left;">
              <span id="motor-task-counter" style="font-weight: 800; color: #38bdf8; font-size: 0.95rem;">المهمة 1 من 25</span>
              <div style="width: 120px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden; margin-top: 0.2rem;">
                <div id="motor-progress-bar" style="width: 4%; height: 100%; background: linear-gradient(90deg, #06b6d4, #10b981); transition: width 0.3s;"></div>
              </div>
            </div>

            <!-- Sound toggle -->
            <button id="motor-mute-btn" title="كتم/تشغيل الصوت" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem;">
              🔊
            </button>

            <!-- Exit button -->
            <button id="motor-exit-btn" title="خروج" style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 0.4rem 0.9rem; border-radius: 10px; cursor: pointer; font-size: 0.85rem; font-weight: 700;">
              إنهاء
            </button>
          </div>
        </header>

        <!-- Main Body: Viewport + Telemetry -->
        <main style="flex: 1; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; overflow: hidden;">
          
          <!-- Interactive Movement Guide HUD Overlay -->
          <div id="motor-hud-overlay" style="
            position: absolute;
            top: 1rem;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(12px);
            border: 2px solid rgba(6, 182, 212, 0.5);
            border-radius: 20px;
            padding: 0.85rem 1.4rem;
            max-width: 680px;
            width: 92%;
            box-shadow: 0 12px 30px rgba(0,0,0,0.6), 0 0 25px rgba(6,182,212,0.25);
            z-index: 55;
            display: flex;
            flex-direction: column;
            gap: 0.55rem;
          ">
            <!-- Header: Target Gesture & Detected state -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.85rem;">
                <!-- AI Generated Hand Pose Photo Thumbnail for Kids -->
                <div id="motor-guide-card" style="
                  position: relative;
                  width: 68px;
                  height: 68px;
                  border-radius: 16px;
                  overflow: hidden;
                  border: 2px solid #06b6d4;
                  box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4);
                  background: #0f172a;
                  flex-shrink: 0;
                  cursor: pointer;
                  transition: transform 0.2s ease;
                " title="انقر لتكبير صورة الحركة 💡">
                  <img id="motor-guide-img" src="" alt="شكل اليد المطلوب" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                  <div style="
                    position: absolute;
                    bottom: 0;
                    inset-inline: 0;
                    background: rgba(15, 23, 42, 0.88);
                    color: #38bdf8;
                    font-size: 0.6rem;
                    font-weight: 800;
                    text-align: center;
                    padding: 1px 0;
                  ">شاهد اليد 💡</div>
                </div>

                <div>
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span id="motor-hud-target-icon" style="font-size: 1.3rem;">✋</span>
                    <span style="font-size: 0.72rem; color: #38bdf8; font-weight: 800; text-transform: uppercase;">الحركة المطلوبة:</span>
                  </div>
                  <div id="motor-hud-target-title" style="font-size: 0.98rem; font-weight: 800; color: #ffffff;">بسط الأصابع كاملة</div>
                  <div id="motor-guide-tip" style="font-size: 0.78rem; color: #94a3b8; font-weight: 600; margin-top: 2px;"></div>
                </div>
              </div>

              <!-- Live Detected Status Pill -->
              <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); padding: 0.35rem 0.9rem; border-radius: 9999px;">
                <span style="font-size: 0.72rem; color: #94a3b8;">الحالة المرصودة: </span>
                <b id="motor-hud-detected-text" style="font-size: 0.82rem; color: #38bdf8;">في انتظار الحركة...</b>
              </div>
            </div>

            <!-- Dynamic Interactive Checklist Badges -->
            <div id="motor-hud-checklist" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.45rem;">
            </div>
          </div>

          <!-- Video & Canvas Viewport Container -->
          <div id="motor-viewport" style="
            position: relative;
            width: 100%;
            max-width: 720px;
            aspect-ratio: 4 / 3;
            background: #000000;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(6, 182, 212, 0.15);
            border: 2px solid rgba(6, 182, 212, 0.3);
            margin-top: 4rem;
          ">
            <!-- Floating Kid Hand Pose Picture in Top-Right Corner of Video -->
            <div id="motor-pip-guide" style="
              position: absolute;
              top: 12px;
              right: 12px;
              background: rgba(15, 23, 42, 0.88);
              backdrop-filter: blur(8px);
              border: 2px solid #06b6d4;
              border-radius: 16px;
              padding: 6px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
              z-index: 50;
              cursor: pointer;
              transition: transform 0.2s ease;
            " title="انقر لتكبير صورة الحركة">
              <span style="font-size: 0.65rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 3px;">
                <span>💡 شكل اليد</span>
              </span>
              <img id="motor-pip-guide-img" src="" alt="شكل اليد المطلوب" style="
                width: 78px;
                height: 78px;
                border-radius: 10px;
                object-fit: cover;
                border: 1px solid rgba(255,255,255,0.2);
                display: block;
              " />
            </div>

            <!-- Hidden Camera Video -->
            <video id="motor-video" playsinline style="display: none; width: 100%; height: 100%; object-fit: cover;"></video>
            
            <!-- Tracking Canvas Overlay -->
            <canvas id="motor-canvas" width="640" height="480" style="width: 100%; height: 100%; display: block; direction: ltr;"></canvas>

            <!-- Success Burst Overlay -->
            <div id="motor-success-badge" style="
              position: absolute;
              inset: 0;
              background: rgba(16, 185, 129, 0.25);
              display: none;
              align-items: center;
              justify-content: center;
              font-size: 2rem;
              font-weight: 900;
              color: #10b981;
              backdrop-filter: blur(4px);
              z-index: 60;
              animation: fadeInOut 0.8s ease;
            ">
              <div style="background: rgba(15, 23, 42, 0.9); border: 2px solid #10b981; border-radius: 20px; padding: 1rem 2rem; display: flex; align-items: center; gap: 0.75rem;">
                <span>✨</span>
                <span>أحسنت! حركة ممتازة</span>
              </div>
            </div>
          </div>

          <!-- Interactive Control & Fallback Footer -->
          <div style="
            margin-top: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            z-index: 40;
          ">
            <button id="motor-repeat-voice-btn" style="
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: #e2e8f0;
              font-weight: 700;
              padding: 0.6rem 1.2rem;
              border-radius: 12px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
            ">
              <span>🔊</span>
              <span>إعادة سماع التوجيه</span>
            </button>

            <!-- Parent Fallback Verification (For complex occluded poses like interlocking circles) -->
            <button id="motor-parent-verify-btn" style="
              background: linear-gradient(135deg, #10b981, #059669);
              border: none;
              color: #ffffff;
              font-weight: 800;
              padding: 0.6rem 1.4rem;
              border-radius: 12px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
            ">
              <span>✔️</span>
              <span>تأكيد نجاح الطفل يدويًا</span>
            </button>

            <button id="motor-skip-btn" style="
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #94a3b8;
              font-weight: 600;
              padding: 0.6rem 1rem;
              border-radius: 12px;
              cursor: pointer;
            ">
              تخطي المهمة ⏩
            </button>
          </div>

          <!-- Hand Pose Lightbox Modal -->
          <div id="motor-lightbox-modal" style="
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 200;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
          ">
            <div style="
              background: #0f172a;
              border: 2px solid #06b6d4;
              border-radius: 24px;
              padding: 1.5rem;
              max-width: 440px;
              width: 100%;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0,0,0,0.8);
            ">
              <h3 id="motor-lightbox-title" style="margin: 0 0 0.85rem 0; font-size: 1.2rem; color: #38bdf8; font-weight: 800;">دليل حركة اليد 💡</h3>
              <img id="motor-lightbox-img" src="" alt="شكل اليد المطلوب" style="width: 100%; aspect-ratio: 1/1; border-radius: 16px; object-fit: cover; border: 1px solid rgba(255,255,255,0.15);" />
              <p id="motor-lightbox-tip" style="color: #cbd5e1; font-size: 0.95rem; margin: 1rem 0 1.25rem 0; font-weight: 600;"></p>
              <button id="motor-lightbox-close" style="
                background: linear-gradient(135deg, #06b6d4, #10b981);
                border: none;
                color: #ffffff;
                font-weight: 800;
                font-size: 0.95rem;
                padding: 0.6rem 2rem;
                border-radius: 12px;
                cursor: pointer;
              ">فهمت، لنبدأ! 🚀</button>
            </div>
          </div>

        </main>
      </div>
    `;

    this.videoEl = document.getElementById('motor-video') as HTMLVideoElement;
    this.canvasEl = document.getElementById('motor-canvas') as HTMLCanvasElement;
    if (this.canvasEl) {
      this.canvasCtx = this.canvasEl.getContext('2d');
    }

    // Attach event listeners
    const muteBtn = document.getElementById('motor-mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = MotorSoundService.toggleMute();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    const repeatVoiceBtn = document.getElementById('motor-repeat-voice-btn');
    if (repeatVoiceBtn) {
      repeatVoiceBtn.addEventListener('click', () => {
        const currentTask = MOTOR_ASSESSMENT_TASKS[this.currentTaskIndex];
        if (currentTask) {
          MotorSoundService.speakArabic(currentTask.requiredActionAr);
        }
      });
    }

    const parentVerifyBtn = document.getElementById('motor-parent-verify-btn');
    if (parentVerifyBtn) {
      parentVerifyBtn.addEventListener('click', () => {
        this.completeCurrentTask(true);
      });
    }

    const skipBtn = document.getElementById('motor-skip-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        this.completeCurrentTask(false, 1.5);
      });
    }

    const exitBtn = document.getElementById('motor-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من رغبتك في إنهاء التقييم الحركي؟')) {
          this.exit();
        }
      });
    }
  }

  /**
   * Load and initialize a specific task
   */
  private loadTask(index: number) {
    if (index >= MOTOR_ASSESSMENT_TASKS.length) {
      this.finishAssessment();
      return;
    }

    this.currentTaskIndex = index;
    const task = MOTOR_ASSESSMENT_TASKS[index];
    this.taskStartTime = performance.now();
    this.taskHoldStartTime = null;
    this.currentRepetitionsDone = 0;
    this.attemptsCount = 1;

    // Update UI elements
    const sectionBadge = document.getElementById('motor-section-badge');
    const taskTitle = document.getElementById('motor-task-title');
    const taskCounter = document.getElementById('motor-task-counter');
    const progressBar = document.getElementById('motor-progress-bar');
    const instructionText = document.getElementById('motor-instruction-text');

    if (sectionBadge) sectionBadge.textContent = task.sectionTitleAr;
    if (taskTitle) taskTitle.textContent = `${task.slot}. ${task.titleAr}`;
    if (taskCounter) taskCounter.textContent = `المهمة ${task.slot} من ${MOTOR_ASSESSMENT_TASKS.length}`;
    if (progressBar) {
      const pct = Math.round((task.slot / MOTOR_ASSESSMENT_TASKS.length) * 100);
      progressBar.style.width = `${pct}%`;
    }
    if (instructionText) {
      instructionText.textContent = task.requiredActionAr;
    }

    // Reset interactive target games for Section 4
    this.setupInteractiveGame(task);

    // Speak instructions
    MotorSoundService.speakArabic(task.requiredActionAr);
  }

  private setupInteractiveGame(task: MotorTaskDefinition) {
    this.wristDirections = { up: false, down: false, left: false, right: false };
    this.palmDirections = { up: false, down: false };
    this.cycleCount = 0;
    this.cyclePhase = 'neutral';
    this.thumbOppositions = { index: false, middle: false, ring: false, pinky: false };
    this.holdProgressMs = 0;
    this.trackingScoreMs = 0;
    this.fingerIsolationStage = 'index';
    this.dwellTimers = {};
    this.graceMs = 1500;
    this.handPresentMs = 0;
    this.palmBase = null;
    this.wristBase = null;
    this.maxDeviation = 0;
    this.tremorSum = 0;
    this.tremorN = 0;

    // Define target icon, title, and checklist items per task
    let targetIcon = '✋';
    let targetTitle = task.titleAr;
    this.checklistItems = [];

    switch (task.id) {
      case 'motor_posture_1':
        targetIcon = '📏';
        targetTitle = 'اجلس بثبات على مسافة 30 إلى 50 سم من الكاميرا';
        this.checklistItems = [
          { id: 'dist', label: 'المسافة المثالية (30-50 سم)', done: false },
          { id: 'hold', label: 'تثبيت الوضعية لمدة ثانيتين', done: false },
        ];
        break;

      case 'motor_posture_2':
        targetIcon = '✋';
        targetTitle = 'افرد ذراعك بالكامل ووجّه الكف لأعلى ثم لأسفل';
        this.checklistItems = [
          { id: 'up', label: '1. توجيه الكف لأعلى ✋', done: false },
          { id: 'down', label: '2. توجيه الكف لأسفل 🤚', done: false },
        ];
        break;

      case 'motor_posture_3':
        targetIcon = '💪';
        targetTitle = 'اثنِ ذراعك وحافظ على استقرار اليد دون اهتزاز';
        this.checklistItems = [
          { id: 'flex', label: 'ثني المرفق', done: false },
          { id: 'steady', label: 'ثبات اليد والاتزان', done: false },
        ];
        break;

      case 'motor_wrist_1':
      case 'motor_wrist_2':
      case 'motor_wrist_3':
      case 'motor_wrist_4':
        targetIcon = '🔄';
        targetTitle = task.slot === 5 ? 'حرك المعصم في 4 اتجاهات بوضعية القبضة الكاملة ✊' : 'حرك المعصم في جميع الاتجاهات الأربعة';
        this.checklistItems = [
          { id: 'up', label: '⬆️ للأعلى', done: false },
          { id: 'down', label: '⬇️ للأسفل', done: false },
          { id: 'left', label: '⬅️ لليسار', done: false },
          { id: 'right', label: '➡️ لليمين', done: false },
        ];
        break;

      case 'motor_finger_1':
        targetIcon = '✋';
        targetTitle = 'افتح جميع أصابع اليد ومُدّها بشكل مستقيم كامل';
        this.checklistItems = [
          { id: 'ext', label: 'بسط جميع الأصابع ✋', done: false },
          { id: 'hold', label: 'تثبيت الوضعية ثانيتين', done: false },
        ];
        break;

      case 'motor_finger_2':
        targetIcon = '✊';
        targetTitle = 'اغلق جميع الأصابع بإحكام لتشكيل قبضة كاملة وقوية';
        this.checklistItems = [
          { id: 'fist', label: 'تشكيل قبضة محكمة ✊', done: false },
          { id: 'hold', label: 'تثبيت القبضة ثانيتين', done: false },
        ];
        break;

      case 'motor_finger_3':
        targetIcon = '☝️';
        targetTitle = 'اعزل السبابة بمفردها ثم اعزل الوسطى بمفردها';
        this.fingerIsolationStage = 'index';
        this.checklistItems = [
          { id: 'iso_index', label: '1. عزل السبابة ☝️', done: false },
          { id: 'iso_middle', label: '2. عزل الوسطى 🖐️', done: false },
        ];
        break;

      case 'motor_finger_4':
        targetIcon = '👌';
        targetTitle = 'المس رأس الإبهام بكل إصبع بالتتابع';
        this.checklistItems = [
          { id: 'i', label: '1. السبابة', done: false },
          { id: 'm', label: '2. الوسطى', done: false },
          { id: 'r', label: '3. البنصر', done: false },
          { id: 'p', label: '4. الخنصر', done: false },
        ];
        break;

      case 'motor_finger_5':
        targetIcon = '🤏';
        targetTitle = 'نفّذ حركة القرص بين الإبهام والسبابة ثم باعد بينهما (3 مرات)';
        this.checklistItems = [
          { id: 'c1', label: 'قرصة 1', done: false },
          { id: 'c2', label: 'قرصة 2', done: false },
          { id: 'c3', label: 'قرصة 3', done: false },
        ];
        break;

      case 'motor_finger_6':
        targetIcon = '⚡';
        targetTitle = 'افتح أصابع يدك ثم اغلقها قبضة بسرعة 3 مرات متتالية';
        this.checklistItems = [
          { id: 'c1', label: 'دورة 1 ✋✊', done: false },
          { id: 'c2', label: 'دورة 2 ✋✊', done: false },
          { id: 'c3', label: 'دورة 3 ✋✊', done: false },
        ];
        break;

      case 'motor_finger_7':
        targetIcon = '✍️';
        targetTitle = 'قرّب الإبهام والسبابة والوسطى معًا (وضعية مسك القلم)';
        this.checklistItems = [
          { id: 'tripod', label: 'تقريب الأصابع الثلاثة', done: false },
          { id: 'hold', label: 'تثبيت الوضعية ثانيتين', done: false },
        ];
        break;

      case 'motor_finger_8':
        targetIcon = '🔗';
        targetTitle = 'شكّل حلقتين بكلتا اليدين واشبكهما كحلقتين مترابطتين';
        this.checklistItems = [
          { id: 'hands', label: 'اليدين في المشهد 👐', done: false },
          { id: 'inter', label: 'تشبيك الحلقتين 🔗', done: false },
        ];
        break;

      case 'motor_coord_2':
        targetIcon = '⭐';
        targetTitle = 'تتبّع النجمة الصفراء المتحركة بإصبع السبابة';
        this.trackingScoreMs = 0;
        this.checklistItems = [
          { id: 'track_prog', label: 'التتبع المستمر (3 ثوانٍ) ⭐', done: false },
        ];
        break;

      case 'motor_coord_10':
        targetIcon = '🧠';
        targetTitle = 'شاهد تسلسل إضاءة الألوان ثم المسها بنفس الترتيب';
        this.memoryPhase = 'demo';
        this.memoryDemoTimer = 0;
        this.memoryDemoStep = 0;
        this.memoryStepIndex = 0;
        this.memorySequence = [0, 2, 1];
        this.memoryPads = [
          { id: 0, color: '#ef4444', label: 'أحمر', x: 0.35, y: 0.38, r: 40, active: false },
          { id: 1, color: '#10b981', label: 'أخضر', x: 0.65, y: 0.38, r: 40, active: false },
          { id: 2, color: '#3b82f6', label: 'أزرق', x: 0.35, y: 0.68, r: 40, active: false },
          { id: 3, color: '#f59e0b', label: 'أصفر', x: 0.65, y: 0.68, r: 40, active: false },
        ];
        this.checklistItems = [
          { id: 'mem_1', label: '1. اللون الأول 🔴', done: false },
          { id: 'mem_2', label: '2. اللون الثاني 🔵', done: false },
          { id: 'mem_3', label: '3. اللون الثالث 🟢', done: false },
        ];
        break;

      default:
        targetIcon = '🎯';
        targetTitle = task.titleAr;
        this.checklistItems = [
          { id: 'target', label: 'إصابة الهدف المحدد 🎯', done: false },
        ];
        break;
    }

    // Update HUD DOM
    const iconEl = document.getElementById('motor-hud-target-icon');
    const titleEl = document.getElementById('motor-hud-target-title');
    const detectedEl = document.getElementById('motor-hud-detected-text');
    const checklistEl = document.getElementById('motor-hud-checklist');

    if (iconEl) iconEl.textContent = targetIcon;
    if (titleEl) titleEl.textContent = targetTitle;
    if (detectedEl) {
      detectedEl.textContent = 'في انتظار الحركة...';
      detectedEl.style.color = '#38bdf8';
    }

    if (checklistEl) {
      checklistEl.innerHTML = this.checklistItems.map(item => `
        <div id="chk-${item.id}" style="
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.25s ease;
        ">
          <span class="chk-status">⬜</span>
          <span>${item.label}</span>
        </div>
      `).join('');
    }

    // Set interactive targets for games
    if (task.interactiveGameType === 'point_target' || task.interactiveGameType === 'mouse_click_sim') {
      this.targetPos = { x: 0.5, y: 0.45 };
    } else if (task.interactiveGameType === 'track_target') {
      this.targetPos = { x: 0.3, y: 0.4 };
      this.targetSpeed = { vx: 0.005, vy: 0.003 };
    } else if (task.interactiveGameType === 'sequence_targets') {
      this.sequentialTargets = [
        { id: 1, x: 0.25, y: 0.35, hit: false },
        { id: 2, x: 0.75, y: 0.35, hit: false },
        { id: 3, x: 0.75, y: 0.65, hit: false },
        { id: 4, x: 0.25, y: 0.65, hit: false },
      ];
      this.currentSequenceIndex = 0;
    } else if (task.interactiveGameType === 'keyboard_targets') {
      this.keyboardKeys = [
        { key: 'A', x: 0.2, y: 0.65, w: 0.12, h: 0.15, active: true },
        { key: 'S', x: 0.38, y: 0.65, w: 0.12, h: 0.15, active: false },
        { key: 'D', x: 0.56, y: 0.65, w: 0.12, h: 0.15, active: false },
        { key: 'F', x: 0.74, y: 0.65, w: 0.12, h: 0.15, active: false },
      ];
      this.activeKeyIndex = 0;
    }
  }

  private updateChecklistItem(id: string, isDone: boolean) {
    const item = this.checklistItems.find(c => c.id === id);
    if (item && !item.done && isDone) {
      item.done = true;
      MotorSoundService.playTick();
      const el = document.getElementById(`chk-${id}`);
      if (el) {
        el.style.background = 'rgba(16, 185, 129, 0.3)';
        el.style.borderColor = '#10b981';
        el.style.color = '#6ee7b7';
        el.innerHTML = `<span>✔️</span> <span>${item.label}</span>`;
      }
    }
  }

  private updateDetectedStatus(text: string, isMatch: boolean = false) {
    const el = document.getElementById('motor-hud-detected-text');
    if (el) {
      el.textContent = text;
      el.style.color = isMatch ? '#10b981' : '#38bdf8';
    }
  }

  /**
   * Main High-Speed Render & Detection Loop
   */
  private startTrackingLoop() {
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(100, now - this.lastFrameTime);
      this.lastFrameTime = now;

      if (this.canvasCtx && this.canvasEl && this.videoEl) {
        const handsData = this.tracker.processVideoFrame();
        this.latestArms = this.tracker.processArms(handsData);
        this.renderCanvasFrame(handsData);
        if (!this.isProcessing) {
          this.evaluateCurrentTask(handsData, dt);
        }
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  /**
   * Render camera feed + neon skeleton + targets on canvas
   */
  private renderCanvasFrame(handsData: HandFrameData[]) {
    if (!this.canvasCtx || !this.canvasEl || !this.videoEl) return;
    const ctx = this.canvasCtx;
    const w = this.canvasEl.width;
    const h = this.canvasEl.height;

    ctx.save();
    // Mirror video for natural user reflection
    ctx.translate(w, 0);
    ctx.scale(-1, 1);

    // Draw camera video feed
    if (this.videoEl.readyState >= 2) {
      ctx.drawImage(this.videoEl, 0, 0, w, h);
      // Soft dark tint for high-contrast neon skeleton overlay
      ctx.fillStyle = 'rgba(10, 15, 29, 0.4)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
    }

    // Distance Calibration Guide Box (Target 30-50 cm)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.15, h * 0.15, w * 0.7, h * 0.7);

    // Render interactive targets for Section 4 if applicable
    const currentTask = MOTOR_ASSESSMENT_TASKS[this.currentTaskIndex];
    if (currentTask) {
      this.renderInteractiveTargets(ctx, w, h, currentTask);
    }

    // Render Hands Neon Skeleton (both hands if visible)
    handsData.forEach((hand) => {
      this.drawHandSkeleton(ctx, hand, w, h);
    });

    // Render Arm Skeletons for BOTH arms (shoulder → elbow → wrist)
    if (this.latestArms.length > 0) {
      this.latestArms.forEach((arm) => {
        ctx.strokeStyle = arm.side === 'left' ? '#f59e0b' : '#10b981';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.shadowColor = arm.side === 'left' ? '#f59e0b' : '#10b981';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(arm.shoulder.x * w, arm.shoulder.y * h);
        ctx.lineTo(arm.elbow.x * w, arm.elbow.y * h);
        ctx.lineTo(arm.wrist.x * w, arm.wrist.y * h);
        ctx.stroke();
        ctx.shadowBlur = 0;

        [arm.shoulder, arm.elbow, arm.wrist].forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x * w, p.y * h, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        });
      });
    }

    ctx.restore();

    // Status badges (unmirrored space, clean LTR text alignment)
    const drawBadge = (text: string, y: number, bg: string, fg: string) => {
      ctx.font = 'bold 13px Cairo, sans-serif';
      ctx.direction = 'ltr';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const padX = 12;
      const boxW = Math.min(w - 32, ctx.measureText(text).width + padX * 2);
      ctx.fillStyle = bg;
      ctx.fillRect(16, y, boxW, 28);
      ctx.fillStyle = fg;
      ctx.fillText(text, 16 + padX, y + 14);
    };

    // 1. Distance & Hand Status
    if (handsData.length > 0) {
      const distanceCm = handsData[0].jointAngles.handDistanceCm;
      drawBadge(
        `المسافة: ~${distanceCm} سم (${handsData.length === 1 ? 'يد واحدة' : 'اليدين معًا'})`,
        16,
        distanceCm >= 25 && distanceCm <= 55 ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.9)',
        '#ffffff'
      );
    } else {
      drawBadge('ضع يدك أمام الكاميرا للبدء', 16, 'rgba(239, 68, 68, 0.85)', '#ffffff');
    }

    // 2. Arm Status
    if (this.latestArms.length > 0) {
      const armTexts = this.latestArms.map(a => `${a.side === 'left' ? 'اليسرى' : 'اليمنى'}: ${a.elbowAngleDeg}°`).join(' • ');
      drawBadge(`تتبع الذراع (${armTexts})`, 48, 'rgba(245, 158, 11, 0.95)', '#0f172a');
    } else {
      drawBadge('تتبع الذراعين نشط (اجعل المرفق واليد في المشهد)', 48, 'rgba(100, 116, 139, 0.85)', '#ffffff');
    }

    // 3. Live Hold Countdown Meter (when holding a required posture)
    if (currentTask && this.holdProgressMs > 0) {
      const reqHold = (currentTask.minHoldDurationSec || 2.0) * 1000;
      const pct = Math.min(1.0, this.holdProgressMs / reqHold);
      const remainingSec = Math.max(0, ((reqHold - this.holdProgressMs) / 1000)).toFixed(1);

      // Glowing progress bar at bottom of canvas
      const barY = h - 36;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(16, barY, w - 32, 24);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(16, barY, (w - 32) * pct, 24);

      ctx.direction = 'ltr';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Cairo, sans-serif';
      ctx.fillText(`اثبت على الوضعية: متبقي ${remainingSec} ثانية... ✨`, w / 2, barY + 13);
    }
  }

  /**
   * Draw Neon Hand Skeleton (Connections + Landmarks)
   */
  private drawHandSkeleton(ctx: CanvasRenderingContext2D, hand: HandFrameData, w: number, h: number) {
    const lm = hand.landmarks;

    // Connections map (MediaPipe 21 landmarks)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [5, 9], [9, 10], [10, 11], [11, 12],   // Middle
      [9, 13], [13, 14], [14, 15], [15, 16], // Ring
      [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [0, 17]                                // Palm base
    ];

    // Draw connection lines with cyan neon glow
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;

    connections.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(lm[i].x * w, lm[i].y * h);
      ctx.lineTo(lm[j].x * w, lm[j].y * h);
      ctx.stroke();
    });

    // Draw landmark joints
    lm.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x * w, pt.y * h, idx === 8 || idx === 4 ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = idx === 8 ? '#10b981' : idx === 4 ? '#f59e0b' : '#38bdf8';
      ctx.fill();
    });

    ctx.shadowBlur = 0; // reset shadow
  }

  /**
   * Render Interactive Targets on screen
   */
  private renderInteractiveTargets(ctx: CanvasRenderingContext2D, w: number, h: number, task: MotorTaskDefinition) {
    if (task.interactiveGameType === 'point_target' || task.interactiveGameType === 'mouse_click_sim') {
      const cx = this.targetPos.x * w;
      const cy = this.targetPos.y * h;

      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.fill();
    } else if (task.interactiveGameType === 'track_target') {
      // Move target
      this.targetPos.x += this.targetSpeed.vx;
      this.targetPos.y += this.targetSpeed.vy;
      if (this.targetPos.x < 0.2 || this.targetPos.x > 0.8) this.targetSpeed.vx *= -1;
      if (this.targetPos.y < 0.25 || this.targetPos.y > 0.75) this.targetSpeed.vy *= -1;

      const cx = this.targetPos.x * w;
      const cy = this.targetPos.y * h;
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (task.interactiveGameType === 'sequence_targets') {
      this.sequentialTargets.forEach((tg) => {
        const cx = tg.x * w;
        const cy = tg.y * h;
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fillStyle = tg.hit ? 'rgba(16, 185, 129, 0.8)' : 'rgba(30, 41, 59, 0.85)';
        ctx.strokeStyle = tg.hit ? '#10b981' : '#38bdf8';
        ctx.lineWidth = 3;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Cairo, sans-serif';
        ctx.fillText(`${tg.id}`, cx - 6, cy + 6);
      });
    } else if (task.interactiveGameType === 'keyboard_targets') {
      this.keyboardKeys.forEach((k) => {
        const kx = k.x * w;
        const ky = k.y * h;
        const kw = k.w * w;
        const kh = k.h * h;

        ctx.fillStyle = k.active ? 'rgba(6, 182, 212, 0.85)' : 'rgba(30, 41, 59, 0.85)';
        ctx.strokeStyle = k.active ? '#38bdf8' : 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 2;
        ctx.fillRect(kx, ky, kw, kh);
        ctx.strokeRect(kx, ky, kw, kh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Cairo, sans-serif';
        ctx.fillText(k.key, kx + kw / 2 - 8, ky + kh / 2 + 8);
      });
    } else if (task.interactiveGameType === 'memory_sequence') {
      // Draw 4 color pads
      this.memoryPads.forEach((pad) => {
        const px = pad.x * w;
        const py = pad.y * h;
        const pr = pad.r;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);

        if (pad.active) {
          ctx.fillStyle = pad.color;
          ctx.shadowColor = pad.color;
          ctx.shadowBlur = 28;
          ctx.fill();
          ctx.lineWidth = 5;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
        } else {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = pad.color;
          ctx.stroke();
        }
        ctx.restore();

        ctx.fillStyle = pad.active ? '#ffffff' : pad.color;
        ctx.font = 'bold 16px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pad.label, px, py);
      });

      // Status text on canvas top center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px Cairo, sans-serif';
      ctx.textAlign = 'center';
      if (this.memoryPhase === 'demo') {
        ctx.fillText('👀 شاهد تسلسل الألوان جيداً...', w / 2, 50);
      } else {
        ctx.fillText(`👆 المس اللون رقم (${this.memoryStepIndex + 1} من 3)`, w / 2, 50);
      }
    }
  }

  /**
   * Real-time posture & gesture evaluator
   */
  private evaluateCurrentTask(handsData: HandFrameData[], dt: number) {
    const currentTask = MOTOR_ASSESSMENT_TASKS[this.currentTaskIndex];
    if (!currentTask) return;

    const hasHands = handsData.length > 0;
    const hasArms = this.latestArms.length > 0;

    // Gate: need either hand or arm detected in frame
    if (!hasHands && !hasArms) {
      this.holdProgressMs = Math.max(0, this.holdProgressMs - dt);
      this.updateDetectedStatus('ضع يدك أمام الكاميرا للبدء');
      return;
    }

    // Strict gate: hand must be visible & stable, plus a short grace period at task start
    if (!hasHands) {
      this.handPresentMs = 0;
      this.holdProgressMs = 0;
      this.updateDetectedStatus('ضع يدك أمام الكاميرا للبدء');
      return;
    }
    this.handPresentMs += dt;
    if (this.graceMs > 0 || this.handPresentMs < 1000) {
      this.graceMs = Math.max(0, this.graceMs - dt);
      this.holdProgressMs = 0;
      this.updateDetectedStatus('استعد... جاري التعرّف على يدك ⏳');
      return;
    }

    const hand = handsData[0];
    if (hand) {
      this.lastHandedness = hand.handedness;
    }
    const angles = hand ? hand.jointAngles : ({ handDistanceCm: 40, tremorIndex: 0.1, indexFlexion: 0.8, middleFlexion: 0.8, ringFlexion: 0.8, pinkyFlexion: 0.8, thumbTipDist: 0.5, wristPitch: 0, wristYaw: 0, palmFacing: 'camera' } as any);
    const minElbowAngle = this.latestArms.length > 0 ? Math.min(...this.latestArms.map(a => a.elbowAngleDeg)) : 90;

    let isPoseAchieved = false;

    // Logic based on task type
    switch (currentTask.id) {
      // ==========================================
      // أولاً: الوضعية الأساسية وثبات الذراع
      // ==========================================
      case 'motor_posture_1': // Sitting & distance (30-50 cm)
        {
          const inDist = hasHands && angles.handDistanceCm >= 28 && angles.handDistanceCm <= 52;
          if (inDist) {
            this.updateChecklistItem('dist', true);
            this.updateDetectedStatus(`المسافة مثالية (~${angles.handDistanceCm} سم) - اثبت ثانية ونصف ✨`, true);
            isPoseAchieved = true;
          } else if (hasHands) {
            this.updateDetectedStatus(angles.handDistanceCm < 28 ? 'ابتعد قليلاً عن الكاميرا (المطلوب 30-50 سم)' : 'اقترب قليلاً من الكاميرا (المطلوب 30-50 سم)');
          }
        }
        break;

      case 'motor_posture_2': // Extended arm: palm up then down
        {
          // Orientation is read relative to the first stable pose (handedness-independent):
          // phase 1 = hold the starting palm orientation, phase 2 = flip it and hold.
          const openAvg = (angles.indexFlexion + angles.middleFlexion + angles.ringFlexion + angles.pinkyFlexion) / 4;
          const orient: 'A' | 'B' | null = angles.palmFacing === 'away' ? 'B' : angles.palmFacing === 'camera' ? 'A' : null;

          if (openAvg < 0.5 || !orient) {
            this.dwellTimers['p_up'] = 0;
            this.dwellTimers['p_down'] = 0;
            this.updateDetectedStatus('افرد أصابعك وأظهر الكف بوضوح أمام الكاميرا ✋');
          } else if (!this.palmDirections.up) {
            if (this.dwell('p_up', true, dt, 1500)) {
              this.palmBase = orient;
              this.palmDirections.up = true;
              this.updateChecklistItem('up', true);
              this.updateDetectedStatus('الكف لأعلى ✔️ - الآن اقلب الكف لأسفل 🤚', true);
            } else {
              this.updateDetectedStatus('اثبت الكف لأعلى لثانية ونصف...');
            }
          } else if (!this.palmDirections.down) {
            if (this.dwell('p_down', orient !== this.palmBase, dt, 1500)) {
              this.palmDirections.down = true;
              this.updateChecklistItem('down', true);
              this.updateDetectedStatus('الكف لأسفل ✔️ أحسنت!', true);
            } else {
              this.updateDetectedStatus('اقلب الكف لأسفل واثبت 🤚');
            }
          }

          if (this.palmDirections.up && this.palmDirections.down) {
            this.updateChecklistItem('up', true);
            this.updateChecklistItem('down', true);
            this.completeCurrentTask(false);
            return;
          }
        }
        break;

      case 'motor_posture_3': // Arm flexion & steady hand
        {
          // Check if arm is bent: either from arm tracking (elbow angle <= 145 deg)
          // OR from hand landmark: hand distance or wrist being elevated in camera
          // Prefer real pose-tracked elbow angle; fall back to hand size (hand brought closer) only if no real arm is visible
          const realArms = this.latestArms.filter((a) => a.fullyVisible);
          const realMin = realArms.length ? Math.min(...realArms.map((a) => a.elbowAngleDeg)) : null;
          const isBent = realMin !== null ? realMin <= 130 : angles.handDistanceCm <= 38 && minElbowAngle > 0;
          const isSteady = angles.tremorIndex < 0.5;

          if (isBent) this.updateChecklistItem('flex', true);
          if (isSteady) this.updateChecklistItem('steady', true);

          if (isBent && isSteady) {
            this.updateDetectedStatus('وضعية ممتازة! اثبت ثانية ونصف... ✨', true);
            isPoseAchieved = true;
          } else if (!isBent) {
            this.updateDetectedStatus('اثنِ ذراعك عند المرفق لرفع اليد 💪');
          } else {
            this.updateDetectedStatus('حافظ على ثبات يدك دون اهتزاز ⏱️');
          }
        }
        break;

      // ==========================================
      // ثانياً: تقييم حركة المعصم والرسغ (4 اتجاهات)
      // ==========================================
      case 'motor_wrist_1':
      case 'motor_wrist_2':
      case 'motor_wrist_3':
      case 'motor_wrist_4':
        if (hasHands) {
          const lm9 = hand.landmarks[9];
          const avgExtW = (angles.indexFlexion + angles.middleFlexion + angles.ringFlexion + angles.pinkyFlexion) / 4;
          const needFist = currentTask.slot === 5;

          if (needFist && avgExtW > 0.55) {
            this.wristBase = null;
            this.dwellTimers['w_base'] = 0;
            this.updateDetectedStatus('أغلق الأصابع قبضة أولاً ✊');
            break;
          }
          if (!needFist && avgExtW < 0.45) {
            this.wristBase = null;
            this.dwellTimers['w_base'] = 0;
            this.updateDetectedStatus('افرد أصابعك أولاً ✋');
            break;
          }

          // Capture a neutral baseline only after the hand is held still for 1.2s
          if (!this.wristBase) {
            if (this.dwell('w_base', angles.tremorIndex < 0.6, dt, 1200)) {
              this.wristBase = { x: lm9.x, y: lm9.y };
              this.updateDetectedStatus('تم تثبيت الوضع ✔️ - ابدأ تحريك المعصم', true);
            } else {
              this.updateDetectedStatus('ثبّت يدك في الوسط أولاً...');
            }
            break;
          }

          // Displacement relative to baseline (user's right/up are positive; camera is mirrored)
          const mx = this.wristBase.x - lm9.x;
          const my = this.wristBase.y - lm9.y;
          this.maxDeviation = Math.max(this.maxDeviation, Math.hypot(mx, my));
          const thr = 0.07;
          if (!this.wristDirections.up && this.dwell('w_up', my > thr, dt, 300)) {
            this.wristDirections.up = true;
            this.updateChecklistItem('up', true);
          }
          if (!this.wristDirections.down && this.dwell('w_down', my < -thr, dt, 300)) {
            this.wristDirections.down = true;
            this.updateChecklistItem('down', true);
          }
          if (!this.wristDirections.left && this.dwell('w_left', mx < -thr, dt, 300)) {
            this.wristDirections.left = true;
            this.updateChecklistItem('left', true);
          }
          if (!this.wristDirections.right && this.dwell('w_right', mx > thr, dt, 300)) {
            this.wristDirections.right = true;
            this.updateChecklistItem('right', true);
          }

          const doneCount = Object.values(this.wristDirections).filter(Boolean).length;
          const remaining: string[] = [];
          if (!this.wristDirections.up) remaining.push('⬆️ للأعلى');
          if (!this.wristDirections.down) remaining.push('⬇️ للأسفل');
          if (!this.wristDirections.left) remaining.push('⬅️ لليسار');
          if (!this.wristDirections.right) remaining.push('➡️ لليمين');

          if (doneCount < 4) {
            this.updateDetectedStatus(`حرك المعصم: متبقي ${remaining.join('، ')}`, doneCount > 0);
          } else {
            this.updateDetectedStatus('اكتملت جميع حركات المعصم الأربعة! ✔️', true);
            this.completeCurrentTask(false);
            return;
          }
        }
        break;

      // ==========================================
      // ثالثاً: حركة الأصابع والمهارات الدقيقة
      // ==========================================
      case 'motor_finger_1': // Finger extension
        if (hasHands) {
          const avgExt = (angles.indexFlexion + angles.middleFlexion + angles.ringFlexion + angles.pinkyFlexion) / 4;
          if (avgExt >= 0.6) {
            this.updateChecklistItem('ext', true);
            this.updateDetectedStatus(`أصابع مفرودة بالكامل (${Math.round(avgExt * 100)}%) ✋ - اثبت!`, true);
            isPoseAchieved = true;
          } else {
            this.updateDetectedStatus(`افتح جميع أصابعك ومُدها بالكامل (${Math.round(avgExt * 100)}%)`);
          }
        }
        break;

      case 'motor_finger_2': // Finger flexion (Full Fist)
        if (hasHands) {
          const avgExt = (angles.indexFlexion + angles.middleFlexion + angles.ringFlexion + angles.pinkyFlexion) / 4;
          if (avgExt <= 0.4) {
            this.updateChecklistItem('fist', true);
            this.updateDetectedStatus(`قبضة كاملة محكمة ✊ - اثبت!`, true);
            isPoseAchieved = true;
          } else {
            this.updateDetectedStatus('اغلق جميع أصابعك لتشكيل قبضة كاملة ✊');
          }
        }
        break;

      case 'motor_finger_3': // Finger isolation (Sequential: Index isolation then Middle isolation)
        if (hasHands) {
          if (this.fingerIsolationStage === 'index') {
            const isIndexExt = angles.indexFlexion >= 0.6;
            const isRestCurled = angles.middleFlexion <= 0.45 && angles.ringFlexion <= 0.5 && angles.pinkyFlexion <= 0.45;

            if (isIndexExt && isRestCurled) {
              if (this.dwell('iso_index', true, dt, 1000)) {
                this.updateChecklistItem('iso_index', true);
                MotorSoundService.playTargetHit();
                this.fingerIsolationStage = 'middle';
                MotorSoundService.speakArabic('رائع! الآن ارفع الإصبع الأوسط واغلق باقي الأصابع.');
                this.updateDetectedStatus('عزل السبابة متقن ✔️ - الآن ارفع الإصبع الأوسط بمفرده 🖐️', true);
              } else {
                this.updateDetectedStatus('السبابة معزولة بنجاح ☝️ - اثبت ثانية واحدة', true);
              }
            } else if (!isIndexExt) {
              this.updateDetectedStatus('ارفع إصبع السبابة للأعلى ☝️');
            } else {
              this.updateDetectedStatus('اغلق باقي الأصابع مع إبقاء السبابة مرفوعة ☝️');
            }
          } else {
            // Stage 2: Middle finger isolation
            const isMiddleExt = angles.middleFlexion >= 0.58;
            const isRestCurled = angles.indexFlexion <= 0.48 && angles.ringFlexion <= 0.52 && angles.pinkyFlexion <= 0.48;

            if (isMiddleExt && isRestCurled) {
              if (this.dwell('iso_middle', true, dt, 1000)) {
                this.updateChecklistItem('iso_middle', true);
                this.updateDetectedStatus('اكتمل عزل الأصابع بنجاح تام! ✔️', true);
                this.completeCurrentTask(false);
                return;
              } else {
                this.updateDetectedStatus('الإصبع الأوسط معزول بنجاح 🖐️ - اثبت ثانية', true);
              }
            } else if (!isMiddleExt) {
              this.updateDetectedStatus('ارفع الإصبع الأوسط للأعلى 🖐️');
            } else {
              this.updateDetectedStatus('اغلق باقي الأصابع مع إبقاء الإصبع الأوسط مرفوعًا');
            }
          }
        }
        break;

      case 'motor_finger_4': // Thumb opposition
        if (hasHands) {
          // The thumb must touch the *specific* expected fingertip, in order, held briefly
          const oppKeys = ['index', 'middle', 'ring', 'pinky'] as const;
          const oppIds = ['i', 'm', 'r', 'p'];
          const oppTips = [8, 12, 16, 20];
          const oppNames = ['السبابة', 'الوسطى', 'البنصر', 'الخنصر'];
          const oppDone = oppKeys.filter((k) => this.thumbOppositions[k]).length;
          if (oppDone < 4) {
            const lmO = hand.landmarks;
            const palmO = Math.hypot(lmO[9].x - lmO[0].x, lmO[9].y - lmO[0].y) || 0.15;
            const dO = Math.hypot(lmO[4].x - lmO[oppTips[oppDone]].x, lmO[4].y - lmO[oppTips[oppDone]].y) / palmO;
            if (this.dwell('opp', dO < 0.35, dt, 350)) {
              this.thumbOppositions[oppKeys[oppDone]] = true;
              this.dwellTimers['opp'] = 0;
              this.updateChecklistItem(oppIds[oppDone], true);
              if (oppDone + 1 >= 4) {
                this.updateDetectedStatus('اكتمل لمس جميع الأصابع بالتتابع! ✔️', true);
                this.completeCurrentTask(false);
                return;
              }
              this.updateDetectedStatus(`لمس ${oppNames[oppDone]} ✔️ - الآن ${oppNames[oppDone + 1]}`, true);
            } else {
              this.updateDetectedStatus(`المس ${oppNames[oppDone]} بالإبهام ثم ثبّت لحظة`);
            }
          }
        }
        break;

      case 'motor_finger_5': // Pinch grip (3 cycles)
        if (hasHands) {
          if (this.cyclePhase !== 'pinched' && angles.thumbTipDist < 0.32) {
            this.cyclePhase = 'pinched';
            this.updateDetectedStatus('قرصة محكمة 🤏 - الآن باعد بينهما', true);
          } else if (this.cyclePhase === 'pinched' && angles.thumbTipDist > 0.40) {
            this.cyclePhase = 'neutral';
            this.cycleCount++;
            this.updateChecklistItem(`c${this.cycleCount}`, true);
            this.updateDetectedStatus(`قرصة ممتازة (${this.cycleCount} من 3) 🤏`, true);
            if (this.cycleCount >= 3) {
              this.completeCurrentTask(false);
              return;
            }
          }
        }
        break;

      case 'motor_finger_6': // Coordination & speed (open/close 3 times)
        if (hasHands) {
          const cycAvg = (angles.indexFlexion + angles.middleFlexion + angles.ringFlexion + angles.pinkyFlexion) / 4;
          if (this.cyclePhase !== 'closed' && cycAvg < 0.4) {
            this.cyclePhase = 'closed';
            this.updateDetectedStatus('قبضة مغلقة ✊ - الآن افتح يدك بالكامل ✋', true);
          } else if (this.cyclePhase === 'closed' && cycAvg > 0.62) {
            this.cyclePhase = 'open';
            this.cycleCount++;
            this.updateChecklistItem(`c${this.cycleCount}`, true);
            this.updateDetectedStatus(`دورة ممتازة (${this.cycleCount} من 3) ⚡`, true);
            if (this.cycleCount >= 3) {
              this.completeCurrentTask(false);
              return;
            }
          }
        }
        break;

      case 'motor_finger_7': // Tripod grip (thumb + index + middle finger tip convergence, ring/pinky flexed)
        if (hasHands) {
          const thumbTip = hand.landmarks[4];
          const indexTip = hand.landmarks[8];
          const middleTip = hand.landmarks[12];
          const wrist = hand.landmarks[0];
          const middleMcp = hand.landmarks[9];
          const palmLen = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y) || 0.15;
          const thumbIndexDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y) / palmLen;
          const thumbMiddleDist = Math.hypot(thumbTip.x - middleTip.x, thumbTip.y - middleTip.y) / palmLen;
          const ringPinkyTucked = angles.ringFlexion < 0.55 && angles.pinkyFlexion < 0.55;

          if (thumbIndexDist < 0.38 && thumbMiddleDist < 0.45 && ringPinkyTucked) {
            this.updateChecklistItem('tripod', true);
            this.updateDetectedStatus('وضعية مسك القلم صحيحة ✍️ - اثبت!', true);
            isPoseAchieved = true;
          } else {
            this.updateDetectedStatus('قرّب الإبهام والسبابة والوسطى معًا (مسكة القلم) واثنِ باقي الأصابع ✍️');
          }
        }
        break;

      case 'motor_finger_8': // Interlocking circles (both hands form rings, then interlock/touch)
        if (handsData.length >= 2) {
          this.updateChecklistItem('hands', true);
          const hA = handsData[0].landmarks;
          const hB = handsData[1].landmarks;
          const palmA = Math.hypot(hA[9].x - hA[0].x, hA[9].y - hA[0].y) || 0.15;
          const palmB = Math.hypot(hB[9].x - hB[0].x, hB[9].y - hB[0].y) || 0.15;

          const ringA = Math.hypot(hA[4].x - hA[8].x, hA[4].y - hA[8].y) / palmA < 0.38;
          const ringB = Math.hypot(hB[4].x - hB[8].x, hB[4].y - hB[8].y) / palmB < 0.38;

          if (!ringA || !ringB) {
            this.updateDetectedStatus('اصنع حلقة (👌) بكل يد أولاً بإلصاق الإبهام بالسبابة');
          } else {
            const centerA = { x: (hA[4].x + hA[8].x) / 2, y: (hA[4].y + hA[8].y) / 2 };
            const centerB = { x: (hB[4].x + hB[8].x) / 2, y: (hB[4].y + hB[8].y) / 2 };
            const ringDist = Math.hypot(centerA.x - centerB.x, centerA.y - centerB.y);

            if (ringDist < 0.18) {
              this.updateChecklistItem('inter', true);
              this.updateDetectedStatus('حلقتان متداخلتان بنجاح! 🔗 - اثبت لحظة', true);
              isPoseAchieved = true;
            } else {
              this.updateDetectedStatus('حلقات ممتازة! الآن اشبكهما أو قربهما من بعضهما 🔗');
            }
          }
        } else {
          this.updateDetectedStatus('اجعل كلتا اليدين ظاهرتين أمام الكاميرا 👐');
        }
        break;

      // ==========================================
      // رابعاً: التنسيق البصري الحركي
      // ==========================================
      case 'motor_coord_1':
      case 'motor_coord_4':
      case 'motor_coord_9': // Point to target
        if (hasHands) {
          const indexTip = hand.landmarks[8];
          const distToTarget = Math.hypot((1 - indexTip.x) - this.targetPos.x, indexTip.y - this.targetPos.y);
          if (this.dwell('tgt', distToTarget < 0.15, dt, 700)) {
            this.updateChecklistItem('target', true);
            MotorSoundService.playTargetHit();
            this.completeCurrentTask(false);
            return;
          } else {
            this.updateDetectedStatus('وجّه إصبع السبابة نحو الهدف الأخضر المضيء 🎯');
          }
        }
        break;

      case 'motor_coord_2': // Tracking moving target (cumulative progress)
        if (hasHands) {
          const indexTip = hand.landmarks[8];
          const distToTarget = Math.hypot((1 - indexTip.x) - this.targetPos.x, indexTip.y - this.targetPos.y);
          if (distToTarget < 0.22) {
            this.trackingScoreMs += dt;
            const reqMs = 3000;
            const pct = Math.min(100, Math.round((this.trackingScoreMs / reqMs) * 100));
            this.updateChecklistItem('track_prog', pct >= 50);
            this.updateDetectedStatus(`تتبع ممتاز للنجمة (${pct}%) ⭐ - استمر!`, true);
            if (this.trackingScoreMs >= reqMs) {
              this.updateChecklistItem('track_prog', true);
              this.completeCurrentTask(false);
              return;
            }
          } else {
            this.trackingScoreMs = Math.max(0, this.trackingScoreMs - dt * 0.25);
            this.updateDetectedStatus('اتبع النجمة الصفراء المتحركة بإصبعك ⭐');
          }
        }
        break;

      case 'motor_coord_3': // Sequential targets 1-4
        if (hasHands) {
          const indexTip = hand.landmarks[8];
          const curTarget = this.sequentialTargets[this.currentSequenceIndex];
          if (curTarget) {
            const dist = Math.hypot((1 - indexTip.x) - curTarget.x, indexTip.y - curTarget.y);
            this.updateDetectedStatus(`المس الهدف رقم (${curTarget.id}) 🎯`);
            if (!curTarget.hit && this.dwell('seq' + curTarget.id, dist < 0.15, dt, 400)) {
              curTarget.hit = true;
              MotorSoundService.playTargetHit();
              this.currentSequenceIndex++;
              if (this.currentSequenceIndex >= this.sequentialTargets.length) {
                this.updateChecklistItem('target', true);
                this.completeCurrentTask(false);
                return;
              }
            }
          }
        }
        break;

      case 'motor_coord_5':
      case 'motor_coord_6': // Mouse simulation & click
        if (hasHands) {
          const indexTip = hand.landmarks[8];
          const dist = Math.hypot((1 - indexTip.x) - this.targetPos.x, indexTip.y - this.targetPos.y);
          if (dist < 0.17) {
            // Must first show an extended index over the button, then bend it to "click"
            if (angles.indexFlexion > 0.6) this.dwellTimers['armed'] = 1;
            this.updateDetectedStatus(this.dwellTimers['armed'] ? 'الآن اثنِ السبابة نقرة (Click)! 🖱️' : 'افرد السبابة فوق الزر أولاً ☝️');
            if (this.dwellTimers['armed'] && angles.indexFlexion < 0.4) {
              this.updateChecklistItem('target', true);
              MotorSoundService.playTargetHit();
              this.completeCurrentTask(false);
              return;
            }
          } else {
            this.updateDetectedStatus('حرك المؤشر فوق زر الفأرة 🖱️');
          }
        }
        break;

      case 'motor_coord_7':
      case 'motor_coord_8': // Keyboard typing A-S-D-F
        if (hasHands) {
          const indexTip = hand.landmarks[8];
          const curKey = this.keyboardKeys[this.activeKeyIndex];
          if (curKey) {
            this.updateDetectedStatus(`المس الحرف المضيء: [ ${curKey.key} ] ⌨️`);
            const ix = 1 - indexTip.x;
            const iy = indexTip.y;
            const onKey = ix >= curKey.x - 0.02 && ix <= curKey.x + curKey.w + 0.02 && iy >= curKey.y - 0.02 && iy <= curKey.y + curKey.h + 0.02;
            if (this.dwell('key' + this.activeKeyIndex, onKey, dt, 350)) {
              MotorSoundService.playTargetHit();
              curKey.active = false;
              this.activeKeyIndex++;
              if (this.activeKeyIndex < this.keyboardKeys.length) {
                this.keyboardKeys[this.activeKeyIndex].active = true;
              } else {
                this.updateChecklistItem('target', true);
                this.completeCurrentTask(false);
                return;
              }
            }
          }
        }
        break;

      case 'motor_coord_10': // Visual-motor memory sequence (Simon style)
        if (this.memoryPhase === 'demo') {
          this.memoryDemoTimer += dt;
          const stepPeriod = 1300;
          const currentStep = Math.floor(this.memoryDemoTimer / stepPeriod);

          if (currentStep < this.memorySequence.length) {
            const stepTime = this.memoryDemoTimer % stepPeriod;
            const padId = this.memorySequence[currentStep];
            this.memoryPads.forEach((p) => (p.active = false));

            if (stepTime < 900) {
              if (this.memoryDemoStep !== currentStep) {
                this.memoryDemoStep = currentStep;
                MotorSoundService.playTargetHit();
              }
              const activePad = this.memoryPads.find((p) => p.id === padId);
              if (activePad) activePad.active = true;
              this.updateDetectedStatus(`انتبه: اللون المضيء هو [ ${activePad?.label} ] 👀`);
            }
          } else {
            this.memoryPads.forEach((p) => (p.active = false));
            this.memoryPhase = 'user';
            this.memoryStepIndex = 0;
            MotorSoundService.speakArabic('الآن دورك! المس الألوان بنفس الترتيب.');
            this.updateDetectedStatus('الآن دورك! المس الألوان بنفس الترتيب 👆', true);
          }
        } else if (this.memoryPhase === 'user' && hasHands) {
          const indexTip = hand.landmarks[8];
          const ix = 1 - indexTip.x;
          const iy = indexTip.y;
          const targetPadId = this.memorySequence[this.memoryStepIndex];

          let touchedPad: (typeof this.memoryPads)[0] | null = null;
          for (const pad of this.memoryPads) {
            const dist = Math.hypot(ix - pad.x, iy - pad.y);
            if (dist < 0.12) {
              touchedPad = pad;
              break;
            }
          }

          if (touchedPad) {
            touchedPad.active = true;
            if (touchedPad.id === targetPadId) {
              if (this.dwell('mem_touch_' + this.memoryStepIndex, true, dt, 350)) {
                MotorSoundService.playTargetHit();
                this.updateChecklistItem(`mem_${this.memoryStepIndex + 1}`, true);
                this.memoryStepIndex++;

                if (this.memoryStepIndex >= this.memorySequence.length) {
                  this.updateDetectedStatus('تطابق رائع للتسلسل البصري الحركي! 🌟', true);
                  this.completeCurrentTask(false);
                  return;
                } else {
                  this.updateDetectedStatus(`أحسنت! الآن المس اللون التالي (${this.memoryStepIndex + 1} من 3) 🎯`, true);
                }
              }
            } else {
              this.updateDetectedStatus('حاول مرة أخرى: تذكر الترتيب الصحيح 🔄');
            }
          } else {
            this.memoryPads.forEach((p) => (p.active = false));
            this.updateDetectedStatus(`المس اللون رقم (${this.memoryStepIndex + 1} من 3) 👆`);
          }
        }
        break;

      default:
        isPoseAchieved = angles.indexFlexion > 0.50;
        break;
    }

    // Accumulate hold progress if the task requires holding a pose
    if (isPoseAchieved) {
      this.holdProgressMs += dt;
      const requiredHold = Math.max(2000, (currentTask.minHoldDurationSec || 2.0) * 1000);
      this.updateChecklistItem('hold', this.holdProgressMs >= requiredHold * 0.6);

      if (this.holdProgressMs >= requiredHold) {
        this.holdProgressMs = 0;
        this.updateChecklistItem('hold', true);
        this.completeCurrentTask(false);
        return;
      }
    } else {
      // Gentle decay so momentary webcam sensor glitches don't reset all progress
      this.holdProgressMs = Math.max(0, this.holdProgressMs - dt * 0.6);
    }

    // Telemetry for honest scoring
    this.tremorSum += angles.tremorIndex;
    this.tremorN++;

    // Task Timeout & Retry Management (Phase 2)
    const elapsedSec = (performance.now() - this.taskStartTime) / 1000;
    const maxAllowedTime = Math.max(25, (currentTask.targetDurationSec || 6) * 3);
    if (elapsedSec > maxAllowedTime && !this.isProcessing) {
      if (this.attemptsCount < 3) {
        this.attemptsCount++;
        this.taskStartTime = performance.now();
        this.setupInteractiveGame(currentTask);
        MotorSoundService.speakArabic('دعنا نحاول مرة أخرى بهدوء، خذ وقتك.');
        this.updateDetectedStatus(`محاولة ${this.attemptsCount} من 3: خذ وقتك وحاول ثانية 🔄`);
      } else {
        // Timed out after 3 full attempts
        MotorSoundService.speakArabic('أحسنت المحاولة! سننتقل للمهمة التالية.');
        this.completeCurrentTask(false, 1.5);
      }
    }
  }

  /**
   * Complete Current Task, register telemetry, and transition
   */
  private completeCurrentTask(parentVerified: boolean = false, overrideScore?: number) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const currentTask = MOTOR_ASSESSMENT_TASKS[this.currentTaskIndex];
    const durationMs = performance.now() - this.taskStartTime;
    const avgTremor = this.tremorN > 0 ? this.tremorSum / this.tremorN : 0.4;
    const steadiness = parentVerified ? 0.5 : Math.max(0.2, Math.min(1.0, 1.0 - avgTremor));
    
    // Speed rating: 1.0 if within target duration, down to 0.4 if much slower
    const speedRating = Math.max(0.4, Math.min(1.0, (currentTask.targetDurationSec * 1000 * 1.5) / Math.max(durationMs, 500)));
    
    // Accuracy based on verification mode and attempts
    const accuracy = parentVerified ? 0.6 : Math.max(0.5, 1.0 - (this.attemptsCount - 1) * 0.15);
    
    // Attempt factor: rewarding first-attempt success
    const attemptFactor = this.attemptsCount === 1 ? 1.0 : this.attemptsCount === 2 ? 0.85 : 0.70;

    // Measured score on 1.0 - 5.0 scale
    const rawMeasured = ((accuracy * 2.5) + (steadiness * 1.5) + (speedRating * 1.0)) * attemptFactor;
    const measured = Math.max(1.0, Math.min(5.0, Math.round(rawMeasured * 10) / 10));

    let finalScore: number;
    let notes: string[];
    if (overrideScore !== undefined) {
      finalScore = overrideScore;
      notes = finalScore <= 2.0 
        ? ['انتهى الوقت المخصص للمهمة بعد محاولات متعددة، تم احتساب نتيجة تشجيعية.']
        : ['تم تسجيل درجة مخصصة للأداء.'];
    } else if (parentVerified) {
      finalScore = 2.5;
      notes = ['تم الاعتماد عبر التأكيد اليدوي للمشرف/ولي الأمر.'];
    } else {
      finalScore = measured;
      notes = ['تم التحقق آليًا بدقة عبر الذكاء الاصطناعي.'];
    }

    const result: MotorTaskResult = {
      task: currentTask,
      score: finalScore,
      accuracy,
      speedRating,
      steadinessRating: steadiness,
      rangeOfMotionDeg: Math.round(this.maxDeviation * 150),
      completedAt: Date.now(),
      durationMs,
      attemptsCount: this.attemptsCount,
      parentVerifiedFallback: parentVerified,
      notesAr: notes,
      handTested: currentTask.id === 'motor_finger_8' ? 'كلتا اليدين' : this.lastHandedness === 'Left' ? 'اليسار' : 'اليمين',
    };

    this.taskResults.push(result);

    // Audio & Visual positive feedback
    MotorSoundService.playSuccessChime();
    const successBadge = document.getElementById('motor-success-badge');
    if (successBadge) {
      successBadge.style.display = 'flex';
    }

    setTimeout(() => {
      if (successBadge) successBadge.style.display = 'none';
      this.isProcessing = false;
      this.loadTask(this.currentTaskIndex + 1);
    }, 1200);
  }

  /**
   * Finalize assessment and render report
   */
  private finishAssessment() {
    this.stopSession();
    const reportData = MotorScoringEngine.computeReport(this.studentName, this.taskResults);
    
    // Save report via API service (with automatic local fallback)
    apiService.saveMotorReport(reportData);

    MotorReportDashboard.render(this.container, reportData, () => {
      this.exit();
    });
  }

  public stopSession() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.tracker.stopCamera();
    MotorSoundService.stopSpeech();
  }

  public exit() {
    this.stopSession();
    // Return to main platform
    const childTestPage = document.getElementById('childTestPage');
    if (childTestPage) {
      childTestPage.classList.add('hidden');
      childTestPage.classList.remove('exam-active');
    }
    document.body.classList.remove('exam-mode');
    window.location.reload();
  }
}
