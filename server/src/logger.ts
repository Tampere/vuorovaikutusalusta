import { createLogger, format, transports } from 'winston';

/**
 * Creates a Winston logger for logging application output.
 */
export default createLogger({
  level: process.env.LOG_LEVEL ?? 'debug',
  format: format.json(),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});
