import {
  addMapPublication,
  deleteMapPublication,
  getMapPublications,
} from '@src/application/mapPublications';
import { ensureAdminAccess, ensureAuthenticated } from '@src/auth';
import { NotFoundError } from '@src/error';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { body, param } from 'express-validator';

const router = Router();

router.get(
  '/',
  ensureAuthenticated(),
  asyncHandler(async (_req, res) => {
    const response = await getMapPublications();
    res.json(response);
  }),
);

router.post(
  '/',
  ensureAuthenticated(),
  ensureAdminAccess(),
  validateRequest([
    body('name').isString().withMessage('Name must be a string'),
    body('url').isString().withMessage('URL must be a string'),
  ]),
  asyncHandler(async (req, res) => {
    const result = await addMapPublication({
      name: req.body.name,
      url: req.body.url,
    });
    res.status(201).json(result);
  }),
);

router.delete(
  '/:id',
  ensureAuthenticated(),
  ensureAdminAccess(),
  validateRequest([param('id').isString().withMessage('Id must be a string')]),
  asyncHandler(async (req, res) => {
    const deletedId = await deleteMapPublication(req.params.id);
    if (!deletedId) {
      throw new NotFoundError('Map publication not found');
    }
    res.status(200).send(`Map publication with id ${req.params.id} deleted`);
  }),
);

export default router;
