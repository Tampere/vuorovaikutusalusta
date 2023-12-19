import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`BEGIN;
  ALTER TABLE data.section_conditions DROP CONSTRAINT section_conditions_survey_page_id_fkey;
  ALTER TABLE data.section_conditions
  ADD CONSTRAINT fk_survey_page_id
  FOREIGN KEY (survey_page_id)
  REFERENCES data.survey_page(id)
  ON DELETE CASCADE;
  COMMIT;`);
}
