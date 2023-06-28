import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey ADD COLUMN thanks_page_image_name TEXT;
  ALTER TABLE data.survey ADD COLUMN thanks_page_image_path TEXT[] DEFAULT ARRAY[]::TEXT[];`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey DROP COLUMN thanks_page_image_name;
  ALTER TABLE data.survey DROP COLUMN thanks_page_image_path;`);
}
