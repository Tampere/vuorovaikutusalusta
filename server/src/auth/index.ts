import { userCanEditSurvey } from '@src/application/survey';
import { ForbiddenError } from '@src/error';
import logger from '@src/logger';
import { getUser, isAdmin, isInternalUser, upsertUser } from '@src/user';
import ConnectPgSimple from 'connect-pg-simple';
import { Express, NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import expressSession from 'express-session';
import passport from 'passport';
import { encrypt } from '../crypto';
import { getDb } from '../database';
import { configureAzureAuth } from './azure';
import { configureGoogleOAuth } from './google-oauth';

/** Can see all surveys and edit them */
export const ADMIN_ROLE = 'TRE_FIILIS_ADMINS';
/**  Can see all surveys, and edit if user is author or admin of the survey */
export const INTERNAL_USER_GROUP_ROLES = ['TRE_FIILIS_USERS'] as const;
/** Can see only external surveys, and edit if user is author or admin of the survey */
export const EXTERNAL_USER_GROUP_ROLES = ['TRE_FIILIS_CONSULTANTS'] as const;

/**
 * Configures authentication for given Express application.
 * @param app Express application
 */
export function configureAuth(app: Express) {
  // User serialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  // User deserialization
  passport.deserializeUser(async (id, done) => {
    const user = await getUser(String(id));
    // If user doesn't exist, set user as null - will be redirected to /login
    done(null, user ?? null);
  });

  app.set('trust proxy', 1); // Needed for secure cookie to work if the app is behind a proxy (e.g. Azure App Service)

  // Initialize Express session middleware
  app.use(
    expressSession({
      secret: process.env.SESSION_SECRET,
      cookie: {
        // 30 days
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: 'none',
      },
      resave: false,
      saveUninitialized: false,
      store: new (ConnectPgSimple(expressSession))({
        pgPromise: getDb(),
        schemaName: 'application',
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  // Logout route
  app.get('/logout', (req, res) => {
    res.clearCookie('connect.sid');
    req.logout((err) => {
      if (err) {
        return req.next(err);
      }
      req.session.destroy(() => {
        res.redirect(process.env.AUTH_LOGOUT_URL);
      });
    });
  });

  logger.info(
    `Configuring authentication with method "${process.env.AUTH_METHOD}"...`,
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
          : `Unsupported auth method "${process.env.AUTH_METHOD}"`,
      );
  }
}

/**
 * Injects mock user to request when actual auth is not enabled
 */
export function configureMockAuth(app: Express) {
  // Create a mock user & persist it in the database
  const mockUser: Express.User = {
    id: '12345-67890-abcde-fghij1',
    fullName: 'Teemu Konsultti',
    email: 'teemu.testaaja@testi.com',
    roles: ['TRE_FIILIS_ADMINS'],
  };
  upsertUser(mockUser);

  // Inject the mock user to each request
  app.use((req, _res, next) => {
    req.user = mockUser;
    return next();
  });
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

    if (req.session) {
      res.clearCookie('connect.sid');
      req.logout((err) => {
        if (err) {
          return req.next(err);
        }
        req.session.destroy(() => {
          fail();
        });
      });
    } else {
      fail();
    }
  };
}

export function ensureSurveyGroupAccess(surveyIdIdentifier: string = 'id') {
  return asyncHandler(
    // Note! Super important to wrap this in asyncHandler to catch errors as express doesn't catch async errors by default
    async (req: Request, _res: Response, next: NextFunction) => {
      // Admin and internal users have access to all surveys
      if (isAdmin(req.user) || isInternalUser(req.user)) {
        return next();
      }

      if (userCanEditSurvey(req.user, Number(req.params[surveyIdIdentifier]))) {
        return next();
      }

      throw new ForbiddenError(
        `User ${req.user.id} does not have access to survey with ID ${req.params[surveyIdIdentifier]}`,
      );
    },
  );
}

export function ensureAdminAccess() {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
      // Admin and internal users have access to all surveys
      if (isAdmin(req.user)) {
        return next();
      }

      throw new ForbiddenError(
        `User ${req.user.id} does not have admin access rights`,
      );
    },
  );
}
