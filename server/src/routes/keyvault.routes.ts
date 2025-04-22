import { Router } from 'express';
import { initSecrets } from '../keyVaultSecrets';
import logger from '@src/logger';
import { ensureSuperUserAccess } from '@src/auth';
import asyncHandler from 'express-async-handler';
import { InternalServerError } from '@src/error';

const router = Router();

// Route to trigger initiSecrets
router.post(
  '/init',
  ensureSuperUserAccess(),
  asyncHandler(async (_req, res) => {
    try {
      await initSecrets();
      res.status(200).send({ message: 'Secrets initialized successfully' });
    } catch (error) {
      logger.error(`Error initializing secrets: ${error.message}`);
      throw new InternalServerError('Error initializing secrets');
    }
  }),
);

export default router;
