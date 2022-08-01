import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.answer_entry ADD COLUMN value_file text;
    ALTER TABLE data.answer_entry ADD COLUMN value_file_name text;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.answer_entry DROP COLUMN value_file;
    ALTER TABLE data.answer_entry DROP COLUMN value_file_name;
  `);
}
