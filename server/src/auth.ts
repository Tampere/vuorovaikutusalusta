import { Express, NextFunction, Request, Response } from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import ConnectPgSimple from 'connect-pg-simple';
import { getDb } from './database';
import { decrypt, encrypt } from './crypto';

// Object containing logged in users' information.
const users: { [oid: string]: unknown } = {};

/**
 * Configures authentication for given Express application.
 * Initializes express-session and passport middleware to use Azure AD for
 * authentication & authorization to all routes.
 * @param app Express application
 */
export function configureAuth(app: Express) {
  // User serialization
  passport.serializeUser((user: Express.User & { oid: string }, done) => {
    done(null, user.oid);
  });

  // User deserialization
  passport.deserializeUser((oid, done) => {
    // If user doesn't exist (e.g. due to server boot), set user as null - will be redirected to /login
    done(null, users[String(oid)] ?? null);
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

  // Use OpenID Connect strategy for Azure AD authentication
  passport.use(
    new OIDCStrategy(
      {
        identityMetadata: process.env.AUTH_IDENTITY_METADATA,
        responseMode: 'form_post',
        responseType: 'code id_token',
        clientID: process.env.AUTH_CLIENT_ID,
        clientSecret: process.env.AUTH_CLIENT_SECRET,
        redirectUrl: process.env.AUTH_REDIRECT_URL,
        allowHttpForRedirectUrl:
          process.env.AUTH_REDIRECT_URL_INSECURE === 'true',
        passReqToCallback: false,
      },
      (profile, done) => {
        if (!profile.oid) {
          return done(new Error('No oid found'), null);
        }
        process.nextTick(function () {
          // Add user to map if not already added
          if (!users[profile.oid]) {
            users[profile.oid] = profile;
          }
          return done(null, users[profile.oid]);
        });
      }
    )
  );

  // Login route
  app.get('/login', (req, res, next) => {
    return passport.authenticate('azuread-openidconnect', {
      successRedirect: '/',
      failureRedirect: '/',
      customState: req.query.redirect,
    } as any)(req, res, next);
  });

  // Callback route for authentication
  app.post(
    '/.auth/login/aad/callback',
    passport.authenticate('azuread-openidconnect', {
      // TODO: If authentication fails, redirect somewhere else to log the errors and tell the user about it
      failureRedirect: '/',
    }),
    (req, res) => {
      // Redirect to original request URL
      const redirectUrl = decrypt(req.body.state) ?? '/admin';
      res.redirect(redirectUrl);
    }
  );

  // Logout route
  app.get('/logout', (req, res) => {
    req.session.destroy((error) => {
      req.logOut();
      res.redirect(process.env.AUTH_LOGOUT_URL);
    });
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
    req.session?.destroy(() => {
      req.logOut();
      fail();
    }) ?? fail();
  };
}
