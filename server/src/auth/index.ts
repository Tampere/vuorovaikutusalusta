import logger from '@src/logger';
import ConnectPgSimple from 'connect-pg-simple';
import { Express, NextFunction, Request, Response } from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import { encrypt } from '../crypto';
import { getDb } from '../database';
import { configureAzureAuth } from './azure';
import { configureGoogleOAuth } from './google-oauth';

// Object containing logged in users' information.
const users: { [id: string]: unknown } = {};

/**
 * If user with given ID exists, returns it. Otherwise creates a new user.
 * @param id ID
 * @param user User
 * @returns User
 */
export function getOrCreateUser(id: string, user: unknown) {
  if (!users[id]) {
    users[id] = user;
  }
  return users[id];
}

/**
 * Configures authentication for given Express application.
 * @param app Express application
 */
export function configureAuth(app: Express) {
  // User deserialization (common for all auth methods)
  passport.deserializeUser((id, done) => {
    // If user doesn't exist (e.g. due to server boot), set user as null - will be redirected to /login
    done(null, users[String(id)] ?? null);
  });

  // Initialize Express session middleware
  app.use(
    expressSession({
      secret: process.env.SESSION_SECRET,
      cookie: {
        // 30 days
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
      resave: false,
      saveUninitialized: false,
      store: new (ConnectPgSimple(expressSession))({
        pgPromise: getDb(),
        schemaName: 'application',
      }),
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Logout route
  app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
      req.logOut();
      res.redirect(process.env.AUTH_LOGOUT_URL);
    });
  });

  logger.info(
    `Configuring authentication with method "${process.env.AUTH_METHOD}"...`
  );

  // Configure auth method specific authentications
  switch (process.env.AUTH_METHOD) {
    case 'azure':
      configureAzureAuth(app);
      break;
    case 'google-oauth':
      configureGoogleOAuth(app);
      break;
    default:
      throw new Error(
        !process.env.AUTH_METHOD
          ? `Environment variable AUTH_METHOD required`
          : `Unsupported auth method "${process.env.AUTH_METHOD}"`
      );
  }
}

/**
 * Middleware function to protect routes that require authentication
 * @param redirectToLogin Should the response redirect the user to login when not authenticated? If false, 401 is returned.
 * @returns Request middleware
 */
export function ensureAuthenticated(options?: { redirectToLogin?: boolean }) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      process.env['AUTH_ENABLED'] !== 'true' ||
      req.path === '/login' ||
      req.isAuthenticated()
    ) {
      return next();
    }
    const fail = () => {
      if (options?.redirectToLogin) {
        // Provide original request URL for redirection after authentication.
        // Encryption required to avoid "open redirector" security threat:
        // https://datatracker.ietf.org/doc/html/rfc6819#section-4.2.4
        res.redirect(`/login?redirect=${encrypt(req.originalUrl)}`);
      } else {
        res.status(401).send('Unauthorized');
      }
    };
    req.session?.destroy(() => {
      req.logOut();
      fail();
    }) ?? fail();
  };
}
