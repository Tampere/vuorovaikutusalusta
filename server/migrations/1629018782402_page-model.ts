import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE data.survey_page (
      id SERIAL NOT NULL PRIMARY KEY,
      survey_id INT,
      idx INTEGER,
      title JSON,
      UNIQUE(survey_id, idx),
      CONSTRAINT fk_survey
        FOREIGN KEY (survey_id)
          REFERENCES data.survey(id)
          ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE data.survey_page
  `);
}
