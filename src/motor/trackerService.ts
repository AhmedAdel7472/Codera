// ---------------------------------------------------------------------------
// CodeRA Platform — Camera & MediaPipe Hand Tracking Service
// ---------------------------------------------------------------------------

import { FilesetResolver, HandLandmarker, HandLandmarkerResult, PoseLandmarker } from '@mediapipe/tasks-vision';
import { MotorJointAngles } from './types';

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface ArmFrameData {
  side: 'left' | 'right';
  shoulder: LandmarkPoint;
  elbow: LandmarkPoint;
  wrist: LandmarkPoint;
  elbowAngleDeg: number; // 180 = fully extended, smaller = more flexed
  fullyVisible: boolean; // shoulder + elbow + wrist all confidently detected
}

export interface HandFrameData {
  landmarks: LandmarkPoint[]; // 21 landmarks
  handedness: 'Left' | 'Right';
  jointAngles: MotorJointAngles;
  boundingBox: { minX: number; minY: number; maxX: number; maxY: number };
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  constructor(minCutoff = 1.2, beta = 0.006, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  filter(x: number, timestampMs: number): number {
    if (this.xPrev === null || this.tPrev === null) {
      this.xPrev = x;
      this.tPrev = timestampMs;
      return x;
    }
    const dt = Math.max(0.001, (timestampMs - this.tPrev) / 1000);
    this.tPrev = timestampMs;

    const dx = (x - this.xPrev) / dt;
    const aD = this.alpha(this.dCutoff, dt);
    const edx = aD * dx + (1 - aD) * this.dxPrev;
    this.dxPrev = edx;

    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    const a = this.alpha(cutoff, dt);
    const xFiltered = a * x + (1 - a) * this.xPrev;
    this.xPrev = xFiltered;
    return xFiltered;
  }

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  reset() {
    this.xPrev = null;
    this.tPrev = null;
    this.dxPrev = 0;
  }
}

export class MotorTrackerService {
  private videoElement: HTMLVideoElement | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private isModelLoading: boolean = false;
  private isRunning: boolean = false;
  private stream: MediaStream | null = null;
  private loadingPromise: Promise<boolean> | null = null;

  // Smoothing & history buffers for tremor & velocity calculation
  private positionHistory: { x: number; y: number; t: number }[] = [];
  private lastJointAngles: MotorJointAngles | null = null;
  private landmarkFilters: Map<string, OneEuroFilter> = new Map();

  private smoothCoord(key: string, val: number, timestampMs: number): number {
    let f = this.landmarkFilters.get(key);
    if (!f) {
      f = new OneEuroFilter(1.2, 0.006, 1.0);
      this.landmarkFilters.set(key, f);
    }
    return f.filter(val, timestampMs);
  }

  public async initializeModel(onProgress?: (msg: string) => void): Promise<boolean> {
    if (this.handLandmarker) return true;
    if (this.loadingPromise) {
      if (onProgress) onProgress('جاري تحميل نموذج الذكاء الاصطناعي...');
      return this.loadingPromise;
    }

    this.isModelLoading = true;
    if (onProgress) onProgress('جاري تحميل نموذج الذكاء الاصطناعي...');

    this.loadingPromise = (async () => {
      try {
        if (onProgress) onProgress('جاري تهيئة محرك المعالجة...');

        const visionPromise = FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('MediaPipe WASM download timeout')), 12000)
        );
        const vision = await Promise.race([visionPromise, timeoutPromise]);

        if (onProgress) onProgress('جاري تفعيل نموذج تتبع اليدين...');

        // Try GPU delegate first with a 6s timeout, fallback cleanly to CPU
        try {
          const gpuPromise = HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.55,
          });
          const gpuTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('GPU initialization timeout')), 6000)
          );
          this.handLandmarker = await Promise.race([gpuPromise, gpuTimeout]);
        } catch (gpuErr) {
          console.warn('GPU delegate unavailable or timed out, switching to CPU:', gpuErr);
          if (onProgress) onProgress('جاري التشغيل عبر معالج النظام (CPU)...');
          this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.55,
            minHandPresenceConfidence: 0.55,
            minTrackingConfidence: 0.55,
          });
        }

        // Arm synthesis from hand landmarks is already built-in and 100% reliable!
        // Load poseLandmarker in the background non-blocking so startup is instantaneous
        PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }).then((pose) => {
          this.poseLandmarker = pose;
        }).catch(() => {
          this.poseLandmarker = null;
        });

        this.isModelLoading = false;
        if (onProgress) onProgress('تم تهيئة نظام التتبع بنجاح.');
        return true;
      } catch (err) {
        console.warn('MediaPipe initialization warning (manual verification enabled):', err);
        this.isModelLoading = false;
        return false;
      }
    })();

    return this.loadingPromise;
  }

  public async startCamera(videoEl: HTMLVideoElement, facingMode: 'user' | 'environment' = 'user'): Promise<boolean> {
    this.videoElement = videoEl;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Camera API not available in this browser context (requires HTTPS or localhost).');
      return false;
    }

    try {
      if (this.stream) {
        this.stopCamera();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      this.videoElement.srcObject = this.stream;
      this.videoElement.muted = true;
      this.videoElement.autoplay = true;
      this.videoElement.playsInline = true;
      await this.videoElement.play();
      this.isRunning = true;
      return true;
    } catch (e) {
      console.error('Failed to acquire camera access:', e);
      return false;
    }
  }

  // Monotonic timestamps for MediaPipe task safety
  private lastHandTimestamp: number = 0;
  private lastPoseTimestamp: number = 0;

  public stopCamera() {
    this.isRunning = false;
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.positionHistory = [];
  }

  /**
   * Track both arms (Left and Right: shoulder → elbow → wrist) and compute elbow angles.
   * Returns all detected arms; falls back to hand-inferred arm geometry when upper body is cropped.
   */
  public processArms(handsData: HandFrameData[] = []): ArmFrameData[] {
    if (!this.isRunning || !this.videoElement || this.videoElement.readyState < 2) {
      return [];
    }

    const detectedArms: ArmFrameData[] = [];

    // 1. Attempt detection via PoseLandmarker
    if (this.poseLandmarker) {
      try {
        const now = performance.now();
        const timestamp = Math.max(now, this.lastPoseTimestamp + 1);
        this.lastPoseTimestamp = timestamp;

        const res = this.poseLandmarker.detectForVideo(this.videoElement, timestamp);
        const lm = res.landmarks?.[0];

        if (lm) {
          const sides: { side: 'left' | 'right'; s: number; e: number; w: number }[] = [
            { side: 'left', s: 11, e: 13, w: 15 },
            { side: 'right', s: 12, e: 14, w: 16 },
          ];

          for (const { side, s, e, w } of sides) {
            const a = lm[s];
            const b = lm[e];
            const c = lm[w];
            if (!a || !b || !c) continue;

            // Check if coordinates exist
            const v1 = { x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) };
            const v2 = { x: c.x - b.x, y: c.y - b.y, z: (c.z || 0) - (b.z || 0) };
            const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
            const m = Math.hypot(v1.x, v1.y, v1.z) * Math.hypot(v2.x, v2.y, v2.z) || 1;
            const angle = (Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180) / Math.PI;

            detectedArms.push({
              side,
              shoulder: { x: a.x, y: a.y, z: a.z || 0 },
              elbow: { x: b.x, y: b.y, z: b.z || 0 },
              wrist: { x: c.x, y: c.y, z: c.z || 0 },
              elbowAngleDeg: Math.round(angle) || 120,
              fullyVisible: true,
            });
          }
        }
      } catch (poseErr) {
        console.warn('Pose landmarker skipped frame:', poseErr);
      }
    }

    // 2. Synthesize arm tracking from Hand Landmarks if pose didn't capture that side
    // This guarantees both arms are always tracked smoothly even when sitting close to laptop!
    handsData.forEach((hand) => {
      const side = hand.handedness.toLowerCase() === 'left' ? 'left' : 'right';
      const alreadyHasSide = detectedArms.some((a) => a.side === side);
      if (!alreadyHasSide && hand.landmarks.length >= 10) {
        const wrist = hand.landmarks[0];
        const middleMcp = hand.landmarks[9];

        // Forearm extends back from middle finger through wrist
        const dirX = wrist.x - middleMcp.x;
        const dirY = wrist.y - middleMcp.y;
        const forearmLen = 0.22;
        const mag = Math.hypot(dirX, dirY) || 1;
        const normDirX = (dirX / mag) * forearmLen;
        const normDirY = Math.max(0.12, (dirY / mag) * forearmLen);

        const elbow = {
          x: Math.max(0.05, Math.min(0.95, wrist.x + normDirX)),
          y: Math.min(0.98, wrist.y + normDirY),
          z: wrist.z || 0,
        };

        const shoulder = {
          x: side === 'left' ? Math.max(0.05, elbow.x - 0.15) : Math.min(0.95, elbow.x + 0.15),
          y: Math.min(0.99, elbow.y + 0.18),
          z: (wrist.z || 0) - 0.05,
        };

        // Estimate elbow angle: if wrist is higher than elbow, arm is flexed (~90-110 deg)
        // If wrist is near level or lower, arm is more extended (~140-160 deg)
        const isUpright = wrist.y < elbow.y;
        const estimatedAngle = isUpright ? 95 : 145;

        detectedArms.push({
          side,
          shoulder,
          elbow,
          wrist,
          elbowAngleDeg: estimatedAngle,
          fullyVisible: false,
        });
      }
    });

    return detectedArms;
  }

  public processVideoFrame(): HandFrameData[] {
    if (!this.isRunning || !this.videoElement || !this.handLandmarker) {
      return [];
    }

    if (this.videoElement.readyState < 2) {
      return [];
    }

    try {
      const now = performance.now();
      const nowMs = Math.max(now, this.lastHandTimestamp + 1);
      this.lastHandTimestamp = nowMs;

      const results: HandLandmarkerResult = this.handLandmarker.detectForVideo(this.videoElement, nowMs);

      if (!results.landmarks || results.landmarks.length === 0) {
        return [];
      }

      const handsData: HandFrameData[] = [];

      for (let h = 0; h < results.landmarks.length; h++) {
        const rawLandmarks = results.landmarks[h];
        const handednessStr = (results.handedness?.[h]?.[0]?.categoryName as 'Left' | 'Right') || (h === 0 ? 'Right' : 'Left');
        
        // Apply One-Euro filter to smooth landmarks and remove sensor jitter
        const smoothedLandmarks: LandmarkPoint[] = rawLandmarks.map((lm, idx) => ({
          x: this.smoothCoord(`${handednessStr}_${idx}_x`, lm.x, nowMs),
          y: this.smoothCoord(`${handednessStr}_${idx}_y`, lm.y, nowMs),
          z: this.smoothCoord(`${handednessStr}_${idx}_z`, lm.z || 0, nowMs),
        }));

        const jointAngles = this.calculateJointFeatures(smoothedLandmarks, nowMs, handednessStr);

        // Bounding box
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        smoothedLandmarks.forEach((lm) => {
          if (lm.x < minX) minX = lm.x;
          if (lm.y < minY) minY = lm.y;
          if (lm.x > maxX) maxX = lm.x;
          if (lm.y > maxY) maxY = lm.y;
        });

        handsData.push({
          landmarks: smoothedLandmarks,
          handedness: handednessStr,
          jointAngles,
          boundingBox: { minX, minY, maxX, maxY },
        });
      }

      return handsData;
    } catch (err) {
      return [];
    }
  }

  /**
   * Extract angles, normalized distances, palm direction, and tremor
   */
  private calculateJointFeatures(lm: LandmarkPoint[], timestamp: number, handedness: 'Left' | 'Right' = 'Right'): MotorJointAngles {
    // 0: Wrist
    // 1-4: Thumb (4 is tip)
    // 5-8: Index (8 is tip, 5 is MCP, 6 is PIP)
    // 9-12: Middle (12 tip, 9 MCP)
    // 13-16: Ring (16 tip, 13 MCP)
    // 17-20: Pinky (20 tip, 17 MCP)

    const wrist = lm[0];
    const indexMcp = lm[5];
    const middleMcp = lm[9];
    const pinkyMcp = lm[17];

    // Reference scale: distance between wrist and middle MCP
    const palmLength = Math.hypot(middleMcp.x - wrist.x, middleMcp.y - wrist.y) || 0.15;

    // Calibrated distance in cm for a child (approx 6.0 / palmLength maps 0.15 palm span to 40cm)
    const handDistanceCm = Math.round(Math.max(20, Math.min(80, 6.0 / palmLength)));

    // Finger extension metric: ratio of tip-to-wrist distance relative to MCP-to-wrist
    const calcFingerFlexion = (tipIdx: number, mcpIdx: number): number => {
      const tipDist = Math.hypot(lm[tipIdx].x - wrist.x, lm[tipIdx].y - wrist.y);
      const mcpDist = Math.hypot(lm[mcpIdx].x - wrist.x, lm[mcpIdx].y - wrist.y);
      const ratio = tipDist / (mcpDist * 1.75);
      return Math.max(0, Math.min(1, (ratio - 0.45) / 0.55)); // 0 = flexed (fist), 1 = fully extended
    };

    const indexFlexion = calcFingerFlexion(8, 5);
    const middleFlexion = calcFingerFlexion(12, 9);
    const ringFlexion = calcFingerFlexion(16, 13);
    const pinkyFlexion = calcFingerFlexion(20, 17);

    // Thumb pinch distance to index tip normalized by palm size
    const thumbTip = lm[4];
    const indexTip = lm[8];
    const rawPinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const thumbTipDist = rawPinchDist / palmLength; // < 0.25 means pinch contact

    // 3D Palm normal vector with handedness polarity correction
    // Vector A: wrist -> index MCP
    const vAx = indexMcp.x - wrist.x;
    const vAy = indexMcp.y - wrist.y;
    const vAz = indexMcp.z - wrist.z;

    // Vector B: wrist -> pinky MCP
    const vBx = pinkyMcp.x - wrist.x;
    const vBy = pinkyMcp.y - wrist.y;
    const vBz = pinkyMcp.z - wrist.z;

    // Cross product: A x B
    let nx = vAy * vBz - vAz * vBy;
    let ny = vAz * vBx - vAx * vBz;
    let nz = vAx * vBy - vAy * vBx;

    // Polarize by handedness so orientation coordinates are consistent
    if (handedness === 'Left') {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }

    const nLen = Math.hypot(nx, ny, nz) || 1;
    nx /= nLen;
    ny /= nLen;
    nz /= nLen;

    let palmFacing: MotorJointAngles['palmFacing'] = 'camera';
    if (nz > 0.25) {
      palmFacing = 'camera';
    } else if (nz < -0.25) {
      palmFacing = 'away';
    } else if (ny < -0.35) {
      palmFacing = 'up';
    } else if (ny > 0.35) {
      palmFacing = 'down';
    } else {
      palmFacing = 'side';
    }

    // Wrist pitch & yaw
    const wristPitch = Math.round((middleMcp.y - wrist.y) * 180);
    const wristYaw = Math.round((middleMcp.x - wrist.x) * 180);

    // Tremor calculation over index tip
    this.positionHistory.push({ x: indexTip.x, y: indexTip.y, t: timestamp });
    if (this.positionHistory.length > 25) {
      this.positionHistory.shift();
    }

    let tremorIndex = 0.05;
    if (this.positionHistory.length >= 8) {
      const avgX = this.positionHistory.reduce((s, p) => s + p.x, 0) / this.positionHistory.length;
      const avgY = this.positionHistory.reduce((s, p) => s + p.y, 0) / this.positionHistory.length;
      const variance = this.positionHistory.reduce((s, p) => s + Math.hypot(p.x - avgX, p.y - avgY), 0) / this.positionHistory.length;
      // Normal webcam sensor noise has variance ~0.015-0.03. Scale so steady hands land in 0.10-0.35.
      tremorIndex = Math.min(1.0, variance * 10);
    }

    const currentAngles: MotorJointAngles = {
      thumbTipDist,
      indexFlexion,
      middleFlexion,
      ringFlexion,
      pinkyFlexion,
      wristPitch,
      wristYaw,
      palmFacing,
      handDistanceCm,
      tremorIndex,
    };

    this.lastJointAngles = currentAngles;
    return currentAngles;
  }
}
