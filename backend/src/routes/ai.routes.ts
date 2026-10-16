import { Router, Request, Response } from 'express';
import { azureOpenAIService } from '../services/azureOpenAIService.js';

export const aiRouter = Router();

// Generate qualitative summary for assessment report
aiRouter.post('/qualitative-analysis', async (req: Request, res: Response) => {
  try {
    const { session, placement } = req.body;
    if (!session) {
      return res.status(400).json({ error: 'Session data is required' });
    }

    const summary = await azureOpenAIService.generateQualitativeSummary(session, placement);
    res.status(200).json({ success: true, summary });
  } catch (err: any) {
    console.error('[AiRoute] Error generating qualitative summary:', err);
    res.status(500).json({ error: 'Failed to generate qualitative analysis', details: err.message });
  }
});

// Generic text completion endpoint
aiRouter.post('/completion', async (req: Request, res: Response) => {
  try {
    const { prompt, systemPrompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const completion = await azureOpenAIService.generateCompletion(prompt, systemPrompt);
    res.status(200).json({ success: true, completion });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate completion', details: err.message });
  }
});
