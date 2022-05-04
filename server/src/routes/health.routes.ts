import { getDb } from '@src/database';
import logger from '@src/logger';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

// Health check endpoint
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    // Test database connection
    try {
      await getDb().connect();
    } catch (error) {
      logger.error(`Could not connect to database: ${error}`);
      return res.status(500).json({
        status: 'error',
      });
    }

    // Everything fine
    res.status(200).json({
      status: 'OK',
    });
  })
);

export default router;
