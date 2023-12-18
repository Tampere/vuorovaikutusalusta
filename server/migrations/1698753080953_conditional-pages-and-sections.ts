import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`BEGIN;
  ALTER TABLE DATA.page_section ADD COLUMN predecessor_section int;
  CREATE TABLE data.section_conditions (
    id SERIAL PRIMARY KEY,
      section_id int REFERENCES data.page_section(id) ON DELETE CASCADE,
      survey_page_id int REFERENCES DATA.survey_page(id) ON DELETE CASCADE,
      "equals" int,
      less_than int,
      greater_than int
  );
  COMMIT;`);
}
