import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);
  pgm.sql(`
    CREATE TABLE data.publications (
      id SERIAL NOT NULL PRIMARY KEY,
      survey_id INT NOT NULL UNIQUE, 
      username TEXT NOT NULL,
      password TEXT NOT NULL UNIQUE,
      alphanumeric_included BOOLEAN DEFAULT TRUE,
      map_included BOOLEAN DEFAULT TRUE,
      attachments_included BOOLEAN DEFAULT TRUE,
      personal_included BOOLEAN DEFAULT TRUE,
      CONSTRAINT fk_survey
        FOREIGN KEY (survey_id)
        REFERENCES data.survey(id)
        ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE data.publications
  `);
  pgm.sql(`
    DROP EXTENSION IF EXISTS pgcrypto;
  `);
}
