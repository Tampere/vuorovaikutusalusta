import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`CREATE TABLE application.theme (
    id SERIAL NOT NULL PRIMARY KEY,
    idx INTEGER,
    name VARCHAR(255),
    data JSONB
  )`);
  pgm.sql(`ALTER TABLE data.survey
    ADD COLUMN theme_id INTEGER,
    ADD CONSTRAINT fk_theme
      FOREIGN KEY (theme_id) REFERENCES application.theme(id)
      ON DELETE SET NULL
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey
    DROP CONSTRAINT fk_theme,
    DROP COLUMN theme_id
  `);
  pgm.sql(`DROP TABLE application.theme`);
}
