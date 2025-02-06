import {
  addGeneralNotification,
  deleteGeneralNotification,
  GENERAL_NOTIFICATION_TIMEOUT_DAYS,
  getGeneralNotification,
  getGeneralNotifications,
  getRecentGeneralNotificationCount,
  updateGeneralNotification,
} from '@src/application/generalNotification';
import { ensureAuthenticated, ensureSuperUserAccess } from '@src/auth';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { param } from 'express-validator';
import EventEmitter from 'events';
import logger from '@src/logger';

const router = Router();
const eventEmitter = new EventEmitter({ captureRejections: true });

router.get(
  '/events',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    eventEmitter.on('error', (err) => {
      logger.info(`Event emitter error: ${err}`);
      res.write('Server error in the general notification stream');
      res.end();
    });

    eventEmitter.on('deletedGeneralNotification', async () => {
      res.write(
        `data: ${JSON.stringify({ deletedGeneralNotification: true })}\n\n`,
      );
      // Without flush compress waits the response to end
      res.flush();
    });

    eventEmitter.on('newGeneralNotification', async () => {
      res.write(
        `data: ${JSON.stringify({ newGeneralNotifications: true })}\n\n`,
      );
      // Without flush compress waits the response to end
      res.flush();
      setTimeout(
        () => {
          res.write(
            `data: ${JSON.stringify({ newGeneralNotifications: false })}\n\n`,
          );
          res.flush();
        },
        GENERAL_NOTIFICATION_TIMEOUT_DAYS * 24 * 60 * 60 * 1000,
      );
    });

    req.on('close', () => {
      res.end();
    });
  }),
);

router.get(
  '/',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const response = await getGeneralNotifications();
    if (!response) {
      res.status(404).send('Not found');
    } else {
      res.json(response);
    }
  }),
);

router.get(
  '/recent-count',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const response = await getRecentGeneralNotificationCount();
    if (!response) {
      res.status(404).send('Not found');
    } else {
      res.json(response);
    }
  }),
);

router.get(
  '/:id',
  ensureAuthenticated(),
  validateRequest([param('id').isString().withMessage('Id must be a string')]),
  asyncHandler(async (req, res) => {
    const response = await getGeneralNotification(req.params.id);
    if (!response) {
      res.status(404).send('Not found');
    }
    res.json(response);
  }),
);

router.post(
  '/',
  ensureAuthenticated(),
  ensureSuperUserAccess(),
  asyncHandler(async (req, res) => {
    try {
      await addGeneralNotification({
        ...req.body,
        publisher: req.user.id,
      });
      eventEmitter.emit('newGeneralNotification');
      res.status(201).send('Created');
    } catch (e) {
      res.status(400).send(`Bad request: ${e}`);
    }
  }),
);

router.put(
  '/:id',
  ensureAuthenticated(),
  ensureSuperUserAccess(),
  validateRequest([param('id').isString().withMessage('Id must be a string')]),
  asyncHandler(async (req, res) => {
    try {
      await updateGeneralNotification(req.params.id, {
        ...req.body,
        publisher: req.user.id,
      });
      eventEmitter.emit('newGeneralNotification');
      res
        .status(200)
        .send(`General notification with id ${req.params.id} updated`);
    } catch (e) {
      res.status(400).send(`Bad request: ${e}`);
    }
  }),
);

router.delete(
  '/:id',
  ensureAuthenticated(),
  ensureSuperUserAccess(),
  validateRequest([param('id').isString().withMessage('Id must be a string')]),
  asyncHandler(async (req, res) => {
    try {
      const deletedId = await deleteGeneralNotification(req.params.id);
      if (!deletedId) {
        res.status(404).send('Not found');
      }
      eventEmitter.emit('deletedGeneralNotification');
      res
        .status(200)
        .send(`General notification with id ${req.params.id} deleted`);
    } catch (e) {
      res.status(400).send(`Bad request: ${e}`);
    }
  }),
);

export default router;
