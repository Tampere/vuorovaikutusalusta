import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey_page ADD COLUMN sidebar_image_alt_text TEXT;
    ALTER TABLE data.survey_page ADD COLUMN sidebar_image_name VARCHAR(255);
    ALTER TABLE data.survey_page ADD COLUMN sidebar_image_path text[] DEFAULT array[]::text[];
    ALTER TABLE data.survey_page DROP COLUMN sidebar_image_url;
    ALTER TABLE data.survey_page ADD CONSTRAINT fk_page_image FOREIGN KEY (sidebar_image_path, sidebar_image_name) REFERENCES data.files (file_path, file_name) ON DELETE SET NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey_page DROP CONSTRAINT fk_page_image;
    ALTER TABLE data.survey_page ADD COLUMN sidebar_image_url TEXT;
    ALTER TABLE data.survey_page DROP COLUMN sidebar_image_path;
    ALTER TABLE data.survey_page DROP COLUMN sidebar_image_name;
    ALTER TABLE data.survey_page DROP COLUMN sidebar_image_alt_text;
  `);
}
