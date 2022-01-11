import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey ADD COLUMN map_url varchar(255)`);
  pgm.sql(`ALTER TABLE data.survey_page ADD COLUMN map_layers JSON`);
  pgm.sql(
    `ALTER TABLE data.answer_entry ADD COLUMN value_geometry public.geometry`
  );
  pgm.sql(`ALTER TABLE data.page_section ADD COLUMN parent_section INT`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey DROP COLUMN map_url`);
  pgm.sql(`ALTER TABLE data.survey_page DROP COLUMN map_layers`);
  pgm.sql(`ALTER TABLE data.answer_entry DROP COLUMN value_geometry`);
  pgm.sql(`ALTER TABLE data.page_section DROP COLUMN parent_section`);
}
