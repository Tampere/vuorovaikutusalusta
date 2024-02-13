import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE data.participant_info (
      id SERIAL PRIMARY KEY,
      submission_id INT NOT NULL,
      name bytea,
      email bytea,
      phone bytea,
      CONSTRAINT fk_submission_id FOREIGN KEY (submission_id) REFERENCES data.submission(id)
    )
  `);

  pgm.sql(`
    ALTER TABLE data.survey ADD COLUMN info_page_enabled BOOLEAN;
    ALTER TABLE data.survey ADD COLUMN info_page_title JSON;
    ALTER TABLE data.survey ADD COLUMN info_page_text JSON;
    ALTER TABLE data.survey ADD COLUMN inquire_name BOOLEAN;
    ALTER TABLE data.survey ADD COLUMN inquire_email BOOLEAN;
    ALTER TABLE data.survey ADD COLUMN inquire_phone_number BOOLEAN;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE participant_info;
  `);

  pgm.sql(`
    ALTER TABLE data.survey DROP COLUMN info_page_enabled;
    ALTER TABLE data.survey DROP COLUMN info_page_title;
    ALTER TABLE data.survey DROP COLUMN info_page_text;
    ALTER TABLE data.survey DROP COLUMN inquire_name;
    ALTER TABLE data.survey DROP COLUMN inquire_email;
    ALTER TABLE data.survey DROP COLUMN inquire_phone_number;
  `);
}
