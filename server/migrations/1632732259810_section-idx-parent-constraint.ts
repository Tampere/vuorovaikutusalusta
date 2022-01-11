import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.page_section DROP CONSTRAINT page_section_survey_page_id_idx_key`
  );
  pgm.sql(
    `ALTER TABLE data.page_section ADD CONSTRAINT page_section_idx UNIQUE (survey_page_id, parent_section, idx)`
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.page_section DROP CONSTRAINT page_section_idx`);
  pgm.sql(
    `ALTER TABLE data.page_section ADD CONSTRAINT page_section_survey_page_id_idx_key UNIQUE (survey_page_id, idx)`
  );
}
