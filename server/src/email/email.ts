import logger from '@src/logger';
import Email, { EmailOptions } from 'email-templates';
import { createTransport } from 'nodemailer';
import { resolve } from 'path';

// OAuth parameters
const oauth = {
  clientId: process.env.EMAIL_OAUTH_CLIENT_ID,
  clientSecret: process.env.EMAIL_OAUTH_CLIENT_SECRET,
  refreshToken: process.env.EMAIL_OAUTH_REFRESH_TOKEN,
  accessUrl: process.env.EMAIL_OAUTH_ACCESS_URL,
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
const transport = process.env.LOCAL_TEST_EMAIL_ENABLED
  ? createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      tls: { rejectUnauthorized: false },
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : createTransport({
      service: process.env.EMAIL_SERVICE ?? 'gmail',
      auth: {
        type: 'OAuth2',
        user: sender.address,
        clientId: oauth.clientId,
        clientSecret: oauth.clientSecret,
        refreshToken: oauth.refreshToken,
        accessUrl: oauth.accessUrl,
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
        emailOptions,
      )}`,
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
