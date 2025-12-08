import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.general_notification
    ALTER COLUMN created_at TYPE TIMESTAMPTZ,
    ALTER COLUMN start_date TYPE TIMESTAMPTZ,
    ALTER COLUMN end_date TYPE TIMESTAMPTZ;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.general_notification
    ALTER COLUMN created_at TYPE TIMESTAMP,
    ALTER COLUMN start_date TYPE TIMESTAMP,
    ALTER COLUMN end_date TYPE TIMESTAMP;
  `);
}
