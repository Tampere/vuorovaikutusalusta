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
import helmet from 'helmet';
import { readFile } from 'fs/promises';
import { createServer } from 'vite';
import { getSurveyTitle } from './application/survey';

const isDev = process.env.NODE_ENV === 'development';

async function start() {
  const app = express();

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return helmet({
        contentSecurityPolicy: {
          useDefaults: false,
          directives: {
            'default-src': "'none'",
            'frame-ancestors': "'none'",
          },
        },
      })(req, res, next);
    } else {
      return helmet({
        contentSecurityPolicy: {
          directives: {
            'connect-src': ["'self'"],
            'script-src': [
              "'self'",
              isDev
                ? "'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk='" // Hash for server built vite, only needed on local
                : '',
            ],
            'frame-src': 'https://kartat.tampere.fi',
          },
        },
      })(req, res, next);
    }
  });

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
    '/admin/*splat',
    ensureAuthenticated({
      redirectToLogin: true,
    }),
    (_req, res) => {
      res.sendFile(path.join(__dirname, '../static/admin/index.html'));
    },
  );

  let vite;
  if (isDev) {
    vite = await createServer({
      server: { middlewareMode: true },
      appType: 'custom',
      root: '',
      optimizeDeps: { include: [] },
    });

    app.use(vite.middlewares);
  }

  // Serve frontend files from remaining URLs
  app.get('/:surveyname', async (req, res, next) => {
    const baseTemplate = await readFile(
      !isDev
        ? path.resolve(__dirname, '../static/index.html')
        : path.resolve(__dirname, '../index.html'),
      'utf-8',
    );

    //Janky local proxy rewrite
    const name = req.params.surveyname.split('_').pop();

    const title = await getSurveyTitle({ name });

    try {
      const template = !isDev
        ? baseTemplate
        : await vite.transformIndexHtml(req.url, baseTemplate);

      const renderedHtml = template
        .replaceAll(`<!--app-title -->`, title)
        .replace('@clientSrc', 'src');

      res.status(200).set({ 'Content-Type': 'text/html' }).end(renderedHtml);
    } catch (e: any) {
      isDev && vite.ssrFixStacktrace(e);
      logger.error(e.stack);
      next(e);
    }
  });

  // Default error handler
  app.use((error: HttpResponseError, _req, res, _next) => {
    logger.error(`Request error: ${error.message}`);
    console.error(error);
    res.status(error.status || 500);
    res.json({
      message: error.message,
      ...(error.info && { info: error.info }),
    });
  });

  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    logger.info(`Server listening to port ${port}`);
  });
}

start();
