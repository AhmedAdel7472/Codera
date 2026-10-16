import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { assessmentRouter } from './routes/assessment.routes.js';
import { motorRouter } from './routes/motor.routes.js';
import { studentRouter } from './routes/student.routes.js';
import { aiRouter } from './routes/ai.routes.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '15mb' }));

// Health Check Endpoint (used by frontend apiService for offline-first detection)
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'codera-backend',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/assessment', assessmentRouter);
app.use('/api/motor', motorRouter);
app.use('/api/students', studentRouter);
app.use('/api/ai', aiRouter);

// Start Server
app.listen(config.port, () => {
  console.log(`
======================================================
  🚀 CodeRA Secure Assessment Backend
  📡 Server listening at: http://localhost:${config.port}
  🩺 Health check:         http://localhost:${config.port}/api/health
  🤖 Azure OpenAI Model:   ${config.azure.model}
======================================================
  `);
});
