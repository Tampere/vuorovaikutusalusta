import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE application.email_refresh_token (
      id SERIAL PRIMARY KEY,
      token TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT current_timestamp
    );`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE application.email_refresh_token;
  `);
}
