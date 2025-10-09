import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE data.survey_email_registration (
      survey_id INT REFERENCES data.survey(id) ON DELETE CASCADE,
      email BYTEA NOT NULL,
      id UUID PRIMARY KEY DEFAULT public.gen_random_uuid(),
      CONSTRAINT survey_email_registration_unique UNIQUE (survey_id, email)
    );
    ALTER TABLE data.survey
      ADD COLUMN email_registration_required BOOLEAN DEFAULT FALSE;
    ALTER TABLE data.submission
      ADD COLUMN registration_id UUID REFERENCES data.survey_email_registration(id) ON DELETE CASCADE;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey DROP COLUMN email_identification_required;
    ALTER TABLE data.submission DROP COLUMN registration_id;
    ALTER TABLE data.survey DROP COLUMN email_registration_required;`);
}
