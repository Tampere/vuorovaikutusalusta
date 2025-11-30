import {
  addGeneralNotification,
  deleteGeneralNotification,
  getGeneralNotification,
  getGeneralNotifications,
  getPublishedNotifications,
  getRecentGeneralNotificationCount,
  updateGeneralNotification,
} from '@src/application/generalNotification';
import { ensureAdminAccess, ensureAuthenticated } from '@src/auth';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { param } from 'express-validator';

const router = Router();

router.get(
  '/',
  ensureAuthenticated(),
  asyncHandler(async (_req, res) => {
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
  asyncHandler(async (_req, res) => {
    const response = await getRecentGeneralNotificationCount();
    if (!response) {
      res.status(404).send('Not found');
    } else {
      res.json(response);
    }
  }),
);

router.get(
  '/published-internal',
  ensureAuthenticated(),
  asyncHandler(async (_req, res) => {
    const response = await getPublishedNotifications('internal');
    if (!response) {
      res.status(404).send('Not found');
    } else {
      res.json(response);
    }
  }),
);

router.get(
  '/published-external',
  asyncHandler(async (_req, res) => {
    const response = await getPublishedNotifications('external');
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
  ensureAdminAccess(),
  asyncHandler(async (req, res) => {
    try {
      await addGeneralNotification({
        ...req.body,
        publisher: req.user.id,
      });
      res.status(201).send('Created');
    } catch (e) {
      res.status(400).send(`Bad request: ${e}`);
    }
  }),
);

router.put(
  '/:id',
  ensureAuthenticated(),
  ensureAdminAccess(),
  validateRequest([param('id').isString().withMessage('Id must be a string')]),
  asyncHandler(async (req, res) => {
    try {
      await updateGeneralNotification(req.params.id, {
        ...req.body,
        publisher: req.user.id,
      });

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
  ensureAdminAccess(),
  validateRequest([param('id').isString().withMessage('Id must be a string')]),
  asyncHandler(async (req, res) => {
    try {
      const deletedId = await deleteGeneralNotification(req.params.id);
      if (!deletedId) {
        res.status(404).send('Not found');
      }

      res
        .status(200)
        .send(`General notification with id ${req.params.id} deleted`);
    } catch (e) {
      res.status(400).send(`Bad request: ${e}`);
    }
  }),
);

export default router;
