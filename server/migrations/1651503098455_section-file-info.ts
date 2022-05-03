import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.page_section ADD COLUMN file_name VARCHAR(255);
    ALTER TABLE data.page_section ADD COLUMN file_path text[] DEFAULT array[]::text[];
    ALTER TABLE data.files DROP COLUMN section_id;
    ALTER TABLE data.page_section ADD CONSTRAINT fk_section_file FOREIGN KEY (file_path, file_name) REFERENCES data.files (file_path, file_name) ON DELETE SET NULL;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.page_section DROP CONSTRAINT fk_section_file;
    ALTER TABLE data.files ADD COLUMN section_id INT;
    ALTER TABLE data.page_section DROP COLUMN file_path;
    ALTER TABLE data.page_section DROP COLUMN file_name;
  `);
}
