import { ensureAuthenticated } from '@src/auth';
import { Router } from 'express';
import jsYaml from 'js-yaml';
import fs from 'fs';
import logger from '@src/logger';

const router = Router();

/** Endpoint for OpenAPI description */
router.get('/', ensureAuthenticated(), (req, res) => {
  const pathName = __dirname + '/../openapi/openapi.yaml';
  fs.readFile(pathName, { encoding: 'utf-8' }, (err, data) => {
    if (err) {
      logger.info(`Error reading OpenAPI file at path ${pathName}`);
      logger.info(JSON.stringify(err));
      return res
        .status(500)
        .json({ message: `Error reading OpenAPI file at path ${pathName}` });
    }

    res.status(200).json(jsYaml.load(data));
  });
});

export default router;
