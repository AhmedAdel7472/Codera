import { Router, Request, Response } from 'express';
import { storageService } from '../services/storageService.js';
import { MotorAssessmentReportData } from '../types/motorTypes.js';

export const motorRouter = Router();

// Save motor assessment report
motorRouter.post('/reports', (req: Request, res: Response) => {
  try {
    const reportData: MotorAssessmentReportData = req.body;
    if (!reportData || !reportData.studentName) {
      return res.status(400).json({ error: 'Invalid report data: studentName is required' });
    }

    const saved = storageService.saveMotorReport(reportData);
    res.status(200).json({ success: true, data: saved });
  } catch (err: any) {
    console.error('[MotorRoute] Error saving report:', err);
    res.status(500).json({ error: 'Failed to save motor assessment report', details: err.message });
  }
});

// Get latest motor report
motorRouter.get('/reports/latest', (req: Request, res: Response) => {
  try {
    const latest = storageService.getLatestMotorReport();
    if (!latest) {
      return res.status(404).json({ error: 'No motor reports available' });
    }
    res.status(200).json({ success: true, data: latest });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve latest motor report' });
  }
});

// Get all motor reports
motorRouter.get('/reports', (req: Request, res: Response) => {
  try {
    const reports = storageService.getAllMotorReports();
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve motor reports' });
  }
});
