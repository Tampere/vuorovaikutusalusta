import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE data.option_group (
    id SERIAL PRIMARY KEY,
    idx INTEGER,
    name JSON,
    section_id INT,
    CONSTRAINT fk_section
      FOREIGN KEY (section_id)
        REFERENCES data.page_section(id)
        ON DELETE CASCADE
  )`);
  pgm.sql(`ALTER TABLE data.option
    ADD COLUMN group_id INT,
    ADD CONSTRAINT fk_option_group
      FOREIGN KEY (group_id)
        REFERENCES data.option_group(id)
        ON DELETE CASCADE
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.option
    DROP CONSTRAINT fk_option_group,
    DROP COLUMN group_id`);
  pgm.sql(`DROP TABLE data.option_group`);
}
