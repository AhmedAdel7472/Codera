import { Router, Request, Response } from 'express';
import { storageService } from '../services/storageService.js';

export const studentRouter = Router();

// Register or update student / parent profile
studentRouter.post('/', (req: Request, res: Response) => {
  try {
    const student = req.body;
    if (!student || (!student.studentFullName && !student.childName)) {
      return res.status(400).json({ error: 'studentFullName or childName is required' });
    }

    const saved = storageService.saveStudent(student);
    res.status(200).json({ success: true, data: saved });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save student profile', details: err.message });
  }
});

// Get all registered students
studentRouter.get('/', (_req: Request, res: Response) => {
  try {
    const students = storageService.getAllStudents();
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve students' });
  }
});
