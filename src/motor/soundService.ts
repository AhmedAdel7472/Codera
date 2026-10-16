// ---------------------------------------------------------------------------
// CodeRA Platform — Audio & Arabic Speech Synthesis for Motor Assessment
// ---------------------------------------------------------------------------

export class MotorSoundService {
  private static audioCtx: AudioContext | null = null;
  private static isMuted: boolean = false;

  private static getAudioContext(): AudioContext | null {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    return this.isMuted;
  }

  public static getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play a clean, joyful success chime (positive feedback for child)
   */
  public static playSuccessChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Chord progression: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  /**
   * Play countdown or step tick
   */
  public static playTick(isLastTick: boolean = false) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isLastTick ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isLastTick ? 880 : 440, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  /**
   * Play click feedback when user touches/taps a virtual target
   */
  public static playTargetHit() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  private static cachedVoices: SpeechSynthesisVoice[] = [];

  static {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        MotorSoundService.cachedVoices = window.speechSynthesis.getVoices();
      };
      updateVoices();
      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    }
  }

  /**
   * Speak instruction in clear, encouraging Arabic using Web Speech API
   */
  public static speakArabic(text: string) {
    if (this.isMuted) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // cancel previous utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 0.95; // slightly slower for clear comprehension
      utterance.pitch = 1.05;

      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => 
        v.lang.startsWith('ar') || 
        v.name.toLowerCase().includes('arabic') || 
        v.name.toLowerCase().includes('maged') || 
        v.name.toLowerCase().includes('tarik') || 
        v.name.toLowerCase().includes('salma') || 
        v.name.toLowerCase().includes('laila') ||
        v.name.toLowerCase().includes('shakir') ||
        v.name.toLowerCase().includes('naayf')
      );
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public static stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
