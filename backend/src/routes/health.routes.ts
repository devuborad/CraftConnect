import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/db.js';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();

  res.json({
    success: true,
    message: 'CraftConnect AI Backend is active and running',
    environment: process.env.NODE_ENV || 'development',
    databaseConnected: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

export default router;
