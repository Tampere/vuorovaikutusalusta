import { Express } from 'express';
import passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import { getOrCreateUser } from '.';
import { decrypt } from '../crypto';

/**
 * Configures authentication for given Express application.
 * Initializes express-session and passport middleware to use Azure AD for
 * authentication & authorization to all routes.
 * @param app Express application
 */
export function configureAzureAuth(app: Express) {
  // User serialization
  passport.serializeUser((user: Express.User & { oid: string }, done) => {
    done(null, user.oid);
  });

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
          const user = getOrCreateUser(profile.oid, profile);
          console.log('jyyseri', user, profile.oid);
          return done(null, user);
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
}
