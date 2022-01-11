import { MapLayer } from '@interfaces/survey';
import { ensureAuthenticated } from '@src/auth';
import { NotFoundError } from '@src/error';
import { validateRequest } from '@src/utils';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { query } from 'express-validator';
import fetch, { Response } from 'node-fetch';

const router = Router();

router.get(
  '/available-layers',
  ensureAuthenticated(),
  validateRequest([query('url').isString()]),
  asyncHandler(async (req, res) => {
    const mapUrl = decodeURIComponent(req.query.url.toString());
    // Separate query parameters and possible trailing slash
    const [baseUrl, queryParams] = mapUrl.split(/\/?\?/);
    try {
      const response: Response = await fetch(
        `${baseUrl}/action?action_route=GetAppSetup&${queryParams}`
      );
      const responseJson = (await response.json()) as {
        configuration: {
          mapfull: {
            conf: { layers: MapLayer[] };
          };
        };
      };
      const layers = responseJson.configuration?.mapfull?.conf?.layers?.map(
        ({ id, name }) => ({
          id,
          name,
        })
      );
      // For non-existent UUIDs the full layer path won't exist in the response object
      if (!layers) {
        throw new NotFoundError('Map not found');
      }
      res.json(layers);
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        throw new NotFoundError('Map not found');
      }
      throw error;
    }
  })
);

export default router;
