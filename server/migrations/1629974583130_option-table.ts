import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE data.option (
      id SERIAL NOT NULL PRIMARY KEY,
      text JSON,
      section_id INT,
      UNIQUE(id, section_id),
      CONSTRAINT fk_section
        FOREIGN KEY (section_id)
          REFERENCES data.page_section(id)
          ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE data.option;
  `);
}
