import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    ALTER TABLE data.submission ADD COLUMN unfinished_token UUID;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.submission DROP COLUMN unfinished_token;
    DROP EXTENSION pgcrypto;
  `);
}
