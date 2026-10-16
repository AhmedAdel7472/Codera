import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { StudentSessionTelemetry } from '../types/telemetrySchema.js';
import { MotorAssessmentReportData } from '../types/motorTypes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export class StorageService {
  private sessions: Map<string, StudentSessionTelemetry> = new Map();
  private motorReports: MotorAssessmentReportData[] = [];
  private students: Map<string, any> = new Map();

  constructor() {
    this.ensureDataDir();
    this.loadFromDisk();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadFromDisk() {
    try {
      const sessFile = path.join(DATA_DIR, 'sessions.json');
      if (fs.existsSync(sessFile)) {
        const raw = fs.readFileSync(sessFile, 'utf-8');
        const list: StudentSessionTelemetry[] = JSON.parse(raw);
        list.forEach(s => this.sessions.set(s.session_id, s));
      }

      const motorFile = path.join(DATA_DIR, 'motor_reports.json');
      if (fs.existsSync(motorFile)) {
        const raw = fs.readFileSync(motorFile, 'utf-8');
        this.motorReports = JSON.parse(raw);
      }

      const studentsFile = path.join(DATA_DIR, 'students.json');
      if (fs.existsSync(studentsFile)) {
        const raw = fs.readFileSync(studentsFile, 'utf-8');
        const list: any[] = JSON.parse(raw);
        list.forEach(std => this.students.set(std.id || std.studentFullName, std));
      }
    } catch (err) {
      console.warn('[StorageService] Error loading existing JSON data from disk:', err);
    }
  }

  private persistSessions() {
    try {
      fs.writeFileSync(
        path.join(DATA_DIR, 'sessions.json'),
        JSON.stringify(Array.from(this.sessions.values()), null, 2),
        'utf-8'
      );
    } catch (e) {
      console.error('[StorageService] Failed to persist sessions:', e);
    }
  }

  private persistMotorReports() {
    try {
      fs.writeFileSync(
        path.join(DATA_DIR, 'motor_reports.json'),
        JSON.stringify(this.motorReports, null, 2),
        'utf-8'
      );
    } catch (e) {
      console.error('[StorageService] Failed to persist motor reports:', e);
    }
  }

  private persistStudents() {
    try {
      fs.writeFileSync(
        path.join(DATA_DIR, 'students.json'),
        JSON.stringify(Array.from(this.students.values()), null, 2),
        'utf-8'
      );
    } catch (e) {
      console.error('[StorageService] Failed to persist students:', e);
    }
  }

  // --- Assessment Sessions ---
  public saveSession(session: StudentSessionTelemetry): StudentSessionTelemetry {
    this.sessions.set(session.session_id, session);
    this.persistSessions();
    return session;
  }

  public getSession(sessionId: string): StudentSessionTelemetry | undefined {
    return this.sessions.get(sessionId);
  }

  public getAllSessions(): StudentSessionTelemetry[] {
    return Array.from(this.sessions.values()).reverse();
  }

  // --- Motor Reports ---
  public saveMotorReport(report: MotorAssessmentReportData): MotorAssessmentReportData {
    this.motorReports.unshift(report);
    this.persistMotorReports();
    return report;
  }

  public getAllMotorReports(): MotorAssessmentReportData[] {
    return this.motorReports;
  }

  public getLatestMotorReport(): MotorAssessmentReportData | null {
    return this.motorReports.length > 0 ? this.motorReports[0] : null;
  }

  // --- Students ---
  public saveStudent(student: any): any {
    const id = student.id || student.studentFullName || `std_${Date.now()}`;
    const studentWithId = { ...student, id };
    this.students.set(id, studentWithId);
    this.persistStudents();
    return studentWithId;
  }

  public getAllStudents(): any[] {
    return Array.from(this.students.values());
  }
}

export const storageService = new StorageService();
