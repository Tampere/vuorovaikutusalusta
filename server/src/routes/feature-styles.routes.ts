import { MapMarkerIcon, MapStrokeColor } from '@interfaces/survey';
import { ensureAuthenticated } from '@src/auth';
import { getDb } from '@src/database';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';

const router = Router();

router.get(
  '/marker-icons',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const icons = await getDb().manyOrNone<MapMarkerIcon>(
      `SELECT id, name, svg FROM application.map_marker_icon ORDER BY idx ASC`
    );
    res.json(icons);
  })
);

router.get(
  '/stroke-colors',
  ensureAuthenticated(),
  asyncHandler(async (req, res) => {
    const colors = await getDb().manyOrNone<MapStrokeColor>(
      `SELECT name, value FROM application.map_stroke_color ORDER BY idx ASC`
    );
    res.json(colors);
  })
);

export default router;
