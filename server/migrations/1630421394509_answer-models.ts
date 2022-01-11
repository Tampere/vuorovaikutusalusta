import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE data.submission (
      id SERIAL NOT NULL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      survey_id INT NOT NULL,
      CONSTRAINT fk_survey
        FOREIGN KEY (survey_id)
          REFERENCES data.survey(id)
          ON DELETE CASCADE
    );
  `);

  pgm.sql(`
    CREATE TABLE data.answer_entry (
      id SERIAL NOT NULL PRIMARY KEY,
      submission_id INT NOT NULL,
      section_id INT NOT NULL,
      value_text TEXT,
      value_option_id INT,
      CONSTRAINT fk_submission
        FOREIGN KEY (submission_id)
          REFERENCES data.submission(id)
          ON DELETE CASCADE,
      CONSTRAINT fk_section
        FOREIGN KEY (section_id)
          REFERENCES data.page_section(id)
          ON DELETE CASCADE,
      CONSTRAINT fk_option
        FOREIGN KEY (value_option_id)
          REFERENCES data.option(id)
          ON DELETE CASCADE
    );
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE data.submission;
  `);

  pgm.sql(`
    DROP TABLE data.answer_entry;
  `);
}
