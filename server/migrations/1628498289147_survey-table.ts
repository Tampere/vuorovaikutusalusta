import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE TABLE data.survey (
      id SERIAL NOT NULL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      name VARCHAR(40) UNIQUE,
      title JSON,
      subtitle JSON,
      author VARCHAR(100),
      author_unit VARCHAR(100),
      thanks_page_title JSON,
      thanks_page_text JSON,
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ 
    );
  `);

  // Trigger function for automatically updating the "updated_at" field of a survey
  pgm.sql(`
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create the actual trigger
  pgm.sql(`
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON data.survey
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP TABLE data.survey;
  `);
}
