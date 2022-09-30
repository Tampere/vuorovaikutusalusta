import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey ADD COLUMN localisation_enabled BOOLEAN;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey DROP COLUMN localisation_enabled;
  `);
}
