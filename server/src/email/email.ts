import logger from '@src/logger';
import Email, { EmailOptions } from 'email-templates';
import { createTransport } from 'nodemailer';
import { resolve } from 'path';

// OAuth parameters
const oauth = {
  clientId: process.env.EMAIL_OAUTH_CLIENT_ID,
  clientSecret: process.env.EMAIL_OAUTH_CLIENT_SECRET,
  refreshToken: process.env.EMAIL_OAUTH_REFRESH_TOKEN,
};

// Email sender
const sender = {
  address: process.env.EMAIL_SENDER_ADDRESS,
  name: process.env.EMAIL_SENDER_NAME,
};

// Email configs
const config = {
  enabled: process.env.EMAIL_ENABLED === 'true',
};

// Nodemailer transport object
const transport = createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: sender.address,
    clientId: oauth.clientId,
    clientSecret: oauth.clientSecret,
    refreshToken: oauth.refreshToken,
  },
});

/**
 * Send an email with given options
 * @param emailOptions Email options
 */
export async function sendMail(emailOptions: EmailOptions) {
  if (!config.enabled) {
    logger.debug(
      `Email send disabled: tried to send email with options: ${JSON.stringify(
        emailOptions
      )}`
    );
    return;
  }
  const email = new Email({
    views: {
      root: resolve(__dirname, '../..', 'email-templates'),
    },
    message: {
      from: `${sender.name ?? sender.address} <${sender.address}>`,
    },
    transport,
    // Configure Juice to inline CSS styles using the relative path
    juice: true,
    juiceResources: {
      preserveImportant: true,
      webResources: {
        relativeTo: resolve(__dirname, '../..', 'email-templates'),
      },
    },
    send: process.env.EMAIL_ENABLED === 'true',
  });
  await email.send(emailOptions);
}
