import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey
      ADD COLUMN email_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN email_auto_send_to TEXT[] DEFAULT ARRAY[]::TEXT[],
      ADD COLUMN email_subject TEXT,
      ADD COLUMN email_body TEXT
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey
      DROP COLUMN email_enabled,
      DROP COLUMN email_auto_send_to,
      DROP COLUMN email_subject,
      DROP COLUMN email_body
  `);
}
