import { ensureAuthenticated } from '@src/auth';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { query } from 'express-validator';
import { getAvailableMapLayers } from '../application/map';

const router = Router();

router.get(
  '/available-layers',
  ensureAuthenticated(),
  validateRequest([query('url').isString()]),
  asyncHandler(async (req, res) => {
    const mapUrl = decodeURIComponent(req.query.url.toString());
    const layers = await getAvailableMapLayers(mapUrl);
    res.json(layers);
  }),
);

export default router;
