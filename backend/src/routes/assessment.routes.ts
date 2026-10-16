import { Router, Request, Response } from 'express';
import { storageService } from '../services/storageService.js';
import { scoringService } from '../services/scoringService.js';
import { placementService } from '../services/placementService.js';
import { StudentSessionTelemetry } from '../types/telemetrySchema.js';

export const assessmentRouter = Router();

// Save or submit assessment session
assessmentRouter.post('/sessions', (req: Request, res: Response) => {
  try {
    const rawSession: StudentSessionTelemetry = req.body;

    if (!rawSession || !rawSession.session_id) {
      return res.status(400).json({ error: 'Invalid session payload: session_id is required' });
    }

    // Server-side scoring verification (prevents client score tampering)
    const verifiedSession = scoringService.verifySessionScores(rawSession);
    
    // Server-side placement calculation
    const placement = placementService.determinePlacement(verifiedSession);
    verifiedSession.placed_track = placement.primaryTrack;
    verifiedSession.recommended_track = placement.recommendedTrack;
    verifiedSession.flags = Array.from(new Set([...(verifiedSession.flags || []), ...placement.flags]));

    // Persist session
    const saved = storageService.saveSession(verifiedSession);

    res.status(200).json({
      success: true,
      data: saved,
      placement: placement
    });
  } catch (err: any) {
    console.error('[AssessmentRoute] Error saving session:', err);
    res.status(500).json({ error: 'Internal server error saving session', details: err.message });
  }
});

// Get all assessment sessions
assessmentRouter.get('/sessions', (req: Request, res: Response) => {
  try {
    const sessions = storageService.getAllSessions();
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

// Get single assessment session by ID
assessmentRouter.get('/sessions/:id', (req: Request, res: Response) => {
  try {
    const session = storageService.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});
