import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE data.page_section (
      id SERIAL NOT NULL PRIMARY KEY,
      survey_page_id INT,
      idx INTEGER,
      title JSON,
      type VARCHAR(20),
      body JSON,
      details JSON,
      UNIQUE(survey_page_id, idx),
      CONSTRAINT fk_survey_page
      FOREIGN KEY (survey_page_id)
        REFERENCES data.survey_page(id)
        ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE data.page_section;
  `);
}
