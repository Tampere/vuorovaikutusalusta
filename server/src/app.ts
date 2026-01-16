import compression from 'compression';
import express from 'express';
import { readFile } from 'fs/promises';
import helmet from 'helmet';
import morgan from 'morgan';
import * as path from 'path';
import { createServer } from 'vite';
import { initializePuppeteerCluster } from './application/screenshot';
import { getSurveyTitle } from './application/survey';
import { configureAuth, configureMockAuth, ensureAuthenticated } from './auth';
import { getDb, initializeDatabase, migrateUp } from './database';
import { startUpdatingRefreshToken } from './email/refresh-token';
import { HttpResponseError } from './error';
import logger from './logger';
import rootRouter from './routes';

function setNoCacheForIndex(res: express.Response, filePath: string) {
  if (filePath.endsWith('index.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store');
  }
}

const noCacheConfig = {
  'Cache-Control': 'no-cache, no-store',
};

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
            'frame-src': process.env.ALLOWED_IFRAME_DOMAINS,
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

  if (process.env.ENABLE_EMAIL_REFRESH_TOKEN_AUTO_UPDATER === 'true') {
    startUpdatingRefreshToken({
      accessUrl: process.env.EMAIL_OAUTH_ACCESS_URL,
      clientId: process.env.EMAIL_OAUTH_CLIENT_ID,
      clientSecret: process.env.EMAIL_OAUTH_CLIENT_SECRET,
      scope: process.env.EMAIL_OAUTH_SCOPE,
      initialRefreshToken: process.env.EMAIL_OAUTH_REFRESH_TOKEN,
      updateIntervalMs:
        Number(process.env.EMAIL_OAUTH_REFRESH_TOKEN_UPDATE_INTERVAL_SECONDS) *
        1000,
      async loadToken() {
        const result = await getDb().oneOrNone<{ token: string }>(
          `SELECT token FROM email_refresh_token ORDER BY created_at DESC LIMIT 1`,
        );
        return result?.token;
      },
      async persistToken(token: string) {
        await getDb().tx(async (tx) => {
          // Only one token should be stored at a time, so truncate the table first
          await tx.none(`TRUNCATE email_refresh_token`);
          await tx.none(`INSERT INTO email_refresh_token (token) VALUES ($1)`, [
            token,
          ]);
        });
      },
    });
  }

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
    express.static('static/admin', { setHeaders: setNoCacheForIndex }),
  );
  app.use('/', express.static('static', { setHeaders: setNoCacheForIndex }));

  // Root router for the API
  app.use('/api', rootRouter);

  // Serve admin frontend from remaining admin URLs
  app.get(
    '/admin/*splat',
    ensureAuthenticated({
      redirectToLogin: true,
    }),
    (_req, res) => {
      res
        .set(noCacheConfig)
        .sendFile(path.join(__dirname, '../static/admin/index.html'));
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
  app.get(['/:surveyname', '/:surveyname/*splat'], async (req, res, next) => {
    const baseTemplate = await readFile(
      !isDev
        ? path.resolve(__dirname, '../static/index.html')
        : path.resolve(__dirname, '../index.html'),
      'utf-8',
    );

    //Janky local proxy rewrite
    const name = isDev
      ? req.params.surveyname.split('frontproxy_').pop()
      : req.params.surveyname;

    const title = await getSurveyTitle({ name });

    try {
      const template = !isDev
        ? baseTemplate
        : await vite.transformIndexHtml('/', baseTemplate);

      const renderedHtml = template
        .replaceAll(`<!--app-title -->`, title)
        .replace('@clientSrc', 'src');

      res
        .status(200)
        .set({ 'Content-Type': 'text/html', ...noCacheConfig })
        .end(renderedHtml);
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
