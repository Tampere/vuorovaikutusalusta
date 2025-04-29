import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.survey_page ADD COLUMN sidebar_image_attributions TEXT`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.survey_page DROP COLUMN sidebar_image_attributions TEXT`,
  );
}
