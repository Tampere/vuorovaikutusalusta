import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import * as path from 'path';
import { initializePuppeteerCluster } from './application/screenshot';
import { configureAuth, configureMockAuth, ensureAuthenticated } from './auth';
import { initializeDatabase, migrateUp } from './database';
import { HttpResponseError } from './error';
import logger from './logger';
import rootRouter from './routes';

async function start() {
  const app = express();

  const port = Number(process.env.PORT ?? 3000);
  // Database initialization and connection test
  try {
    await initializeDatabase();
  } catch (error) {
    logger.error('Error initializing database:', error);
    process.exit(1);
  }

  // Execute migrations
  await migrateUp();

  // Start up Puppeteer cluster for taking screenshots
  await initializePuppeteerCluster();

  // Add compression
  app.use(compression());

  // For body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Use logging middleware for HTTP requests
  app.use(
    morgan('dev', {
      stream: {
        write: (message: string) => {
          // Skip health check logging
          if (message.includes('/api/health')) {
            return;
          }
          // Message ends with an unnecessary newline - remove it from logs.
          logger.info(message.split('\n')[0]);
        },
      },
    }),
  );

  if (process.env.AUTH_ENABLED === 'true') {
    configureAuth(app);
    logger.info('Authentication configured');
  } else {
    configureMockAuth(app);
    logger.info('Authentication not enabled, using a mock user');
  }

  // Serve static frontend files in production
  app.use(
    '/admin',
    ensureAuthenticated({
      redirectToLogin: true,
    }),
    express.static('static/admin'),
  );
  app.use('/', express.static('static'));

  // Root router for the API
  app.use('/api', rootRouter);

  // Serve admin frontend from remaining admin URLs
  app.get(
    '/admin/*',
    ensureAuthenticated({
      redirectToLogin: true,
    }),
    (req, res) => {
      res.sendFile(path.join(__dirname, '../static/admin/index.html'));
    },
  );

  // Serve frontend files from remaining URLs
  app.get('/*', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../static/index.html'));
  });

  // Default error handler
  app.use((error: HttpResponseError, req, res, next) => {
    logger.error(`Request error: ${error.message}`);
    console.error(error);
    res.status(error.status || 500);
    res.json({
      message: error.message,
      ...(error.info && { info: error.info }),
    });
  });

  app.listen(port, () => {
    logger.info(`Server listening to port ${port}`);
  });
}

start();
