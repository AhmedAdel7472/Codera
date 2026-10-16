import { StudentSessionTelemetry } from '../engine/telemetrySchema';
import { MotorAssessmentReportData } from '../motor/types';

/**
 * CodeRA API Service
 * 
 * Bridges Frontend with Backend with an Offline-First Resilience Layer:
 * - If the Backend API is reachable (http://localhost:5000/api by default), operations hit the backend.
 * - If the Backend is offline or network fails, it gracefully falls back to localStorage, ensuring zero downtime during local development or network disruptions.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  private isBackendAvailable: boolean | null = null;
  private lastHealthCheckTime: number = 0;
  private readonly HEALTH_CHECK_INTERVAL_MS = 15000; // 15 seconds cache

  /**
   * Health check to detect if the backend server is reachable.
   */
  public async checkBackendHealth(): Promise<boolean> {
    const now = Date.now();
    if (this.isBackendAvailable !== null && (now - this.lastHealthCheckTime < this.HEALTH_CHECK_INTERVAL_MS)) {
      return this.isBackendAvailable;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      this.isBackendAvailable = res.ok;
    } catch {
      this.isBackendAvailable = false;
    }

    this.lastHealthCheckTime = now;
    return this.isBackendAvailable;
  }

  // ---------------------------------------------------------------------------
  // 1. Assessment Sessions (Cognitive, Functional, General)
  // ---------------------------------------------------------------------------

  /**
   * Save completed assessment session
   */
  public async saveAssessmentSession(
    session: StudentSessionTelemetry
  ): Promise<{ success: boolean; mode: 'backend' | 'local'; data: StudentSessionTelemetry }> {
    const backendOnline = await this.checkBackendHealth();

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/assessment/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session),
        });

        if (response.ok) {
          const result = await response.json();
          // Keep localStorage as local backup
          this.saveSessionToLocalStorage(session);
          return { success: true, mode: 'backend', data: result.data || session };
        }
      } catch (err) {
        console.warn('[ApiService] Backend save failed, falling back to localStorage:', err);
      }
    }

    // Local fallback
    this.saveSessionToLocalStorage(session);
    return { success: true, mode: 'local', data: session };
  }

  /**
   * Retrieve all assessment sessions
   */
  public async getAllAssessmentSessions(): Promise<StudentSessionTelemetry[]> {
    const backendOnline = await this.checkBackendHealth();

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/assessment/sessions`);
        if (response.ok) {
          const res = await response.json();
          if (Array.isArray(res.data) && res.data.length > 0) {
            return res.data;
          }
        }
      } catch (err) {
        console.warn('[ApiService] Failed to fetch sessions from backend, loading local fallback:', err);
      }
    }

    return this.getSessionsFromLocalStorage();
  }

  // ---------------------------------------------------------------------------
  // 2. Motor Assessment Reports
  // ---------------------------------------------------------------------------

  /**
   * Save motor assessment report
   */
  public async saveMotorReport(
    reportData: MotorAssessmentReportData
  ): Promise<{ success: boolean; mode: 'backend' | 'local'; data: MotorAssessmentReportData }> {
    const backendOnline = await this.checkBackendHealth();

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/motor/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reportData),
        });

        if (response.ok) {
          const result = await response.json();
          this.saveMotorReportToLocalStorage(reportData);
          return { success: true, mode: 'backend', data: result.data || reportData };
        }
      } catch (err) {
        console.warn('[ApiService] Backend motor report save failed, saving locally:', err);
      }
    }

    this.saveMotorReportToLocalStorage(reportData);
    return { success: true, mode: 'local', data: reportData };
  }

  /**
   * Retrieve latest motor assessment report
   */
  public async getLatestMotorReport(): Promise<MotorAssessmentReportData | null> {
    const backendOnline = await this.checkBackendHealth();

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/motor/reports/latest`);
        if (response.ok) {
          const res = await response.json();
          if (res.data) return res.data;
        }
      } catch (err) {
        console.warn('[ApiService] Failed to fetch latest motor report from backend:', err);
      }
    }

    try {
      const raw = localStorage.getItem('codera_last_motor_report');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Student & Parent Registration
  // ---------------------------------------------------------------------------

  /**
   * Register or update student / parent profile
   */
  public async saveStudentProfile(profile: any): Promise<{ success: boolean; mode: 'backend' | 'local' }> {
    const backendOnline = await this.checkBackendHealth();

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
        if (response.ok) {
          this.saveStudentProfileToLocalStorage(profile);
          return { success: true, mode: 'backend' };
        }
      } catch (err) {
        console.warn('[ApiService] Failed to save profile to backend:', err);
      }
    }

    this.saveStudentProfileToLocalStorage(profile);
    return { success: true, mode: 'local' };
  }

  /**
   * Get student registry
   */
  public async getStudentRegistry(): Promise<any[]> {
    const backendOnline = await this.checkBackendHealth();

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/students`);
        if (response.ok) {
          const res = await response.json();
          if (Array.isArray(res.data) && res.data.length > 0) return res.data;
        }
      } catch (err) {
        console.warn('[ApiService] Failed to fetch student registry from backend:', err);
      }
    }

    try {
      const raw = localStorage.getItem('codera_student_registry');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // ---------------------------------------------------------------------------
  // 4. Secure AI Analysis Endpoint (replaces client-side Azure OpenAI)
  // ---------------------------------------------------------------------------

  /**
   * Request qualitative report summary via secure backend proxy
   */
  public async requestAIQualitativeSummary(
    session: StudentSessionTelemetry,
    placement: any
  ): Promise<string> {
    const backendOnline = await this.checkBackendHealth();

    if (backendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/ai/qualitative-analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session, placement }),
        });

        if (response.ok) {
          const res = await response.json();
          if (res.summary) return res.summary;
        }
      } catch (err) {
        console.warn('[ApiService] Backend AI request failed, falling back to local heuristic summary:', err);
      }
    }

    // Heuristic fallback if backend is offline
    return this.generateFallbackSummary(session, placement);
  }

  // ---------------------------------------------------------------------------
  // LocalStorage Helper Implementations
  // ---------------------------------------------------------------------------

  private saveSessionToLocalStorage(session: StudentSessionTelemetry): void {
    try {
      const raw = localStorage.getItem('codera_all_sessions') || localStorage.getItem('cognix_all_sessions') || '[]';
      const sessions: StudentSessionTelemetry[] = JSON.parse(raw);
      const filtered = sessions.filter(s => s.session_id !== session.session_id);
      filtered.unshift(session);
      localStorage.setItem('codera_all_sessions', JSON.stringify(filtered));
    } catch (e) {
      console.error('[ApiService] Error saving to localStorage:', e);
    }
  }

  private getSessionsFromLocalStorage(): StudentSessionTelemetry[] {
    try {
      const raw = localStorage.getItem('codera_all_sessions') || localStorage.getItem('cognix_all_sessions') || '[]';
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }

  private saveMotorReportToLocalStorage(reportData: MotorAssessmentReportData): void {
    try {
      localStorage.setItem('codera_last_motor_report', JSON.stringify(reportData));
    } catch (e) {
      console.error('[ApiService] Error saving motor report to localStorage:', e);
    }
  }

  private saveStudentProfileToLocalStorage(profile: any): void {
    try {
      localStorage.setItem('codera_parent_profile', JSON.stringify(profile));
      localStorage.setItem('codera_student_profile', JSON.stringify(profile));
      const raw = localStorage.getItem('codera_student_registry');
      const registry = raw ? JSON.parse(raw) : [];
      const studentName = profile.childName || profile.studentFullName || 'Alex Rivers';
      const index = registry.findIndex((item: any) => (item.childName || item.studentFullName) === studentName);
      if (index >= 0) {
        registry[index] = profile;
      } else {
        registry.push(profile);
      }
      localStorage.setItem('codera_student_registry', JSON.stringify(registry));
    } catch (e) {
      console.error('[ApiService] Error saving profile to localStorage:', e);
    }
  }

  private generateFallbackSummary(session: StudentSessionTelemetry, placement: any): string {
    const track = placement?.primaryTrack || session.placed_track || 'Builder';
    const score = session.total_score || 0;
    return `أظهر الطالب مستوى متوازن بنتيجة إجمالية ${score}/100، وتأهل لمسار (${track}). يوصى بالتركيز على التفكير الخوارزمي والمشاريع العملية التدريجية لتعزيز الأداء العام.`;
  }
}

export const apiService = new ApiService();
