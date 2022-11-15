import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey_page 
      ALTER COLUMN sidebar_image_alt_text TYPE JSON 
      USING CASE 
        WHEN sidebar_image_alt_text IS NULL THEN NULL 
        WHEN sidebar_image_alt_text IS NOT NULL THEN json_build_object('fi', sidebar_image_alt_text)
      END
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey_page ALTER COLUMN sidebar_image_alt_text TYPE text 
    USING CASE
      WHEN sidebar_image_alt_text IS NULL THEN NULL 
      WHEN sidebar_image_alt_text IS NOT NULL THEN sidebar_image_alt_text::json->>'fi'
    END
  `);
}
