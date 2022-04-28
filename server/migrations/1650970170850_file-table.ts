import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
      ALTER TABLE data.images RENAME TO files;
      ALTER TABLE data.files ADD COLUMN details JSON;
      ALTER TABLE data.files RENAME COLUMN image TO file;
      ALTER TABLE data.files RENAME COLUMN image_name TO file_name;
      ALTER TABLE data.files ADD COLUMN mime_type VARCHAR(255);
      ALTER TABLE data.files ADD COLUMN survey_id INT;
      ALTER TABLE data.files ADD COLUMN section_id INT;
      ALTER TABLE data.files ADD COLUMN file_path text[] DEFAULT array[]::text[]  NOT NULL;
      ALTER TABLE data.files DROP CONSTRAINT images_pkey;
      ALTER TABLE data.files ADD CONSTRAINT pk_files PRIMARY KEY (file_path, file_name);
      ALTER TABLE data.files ADD CONSTRAINT fk_file_survey FOREIGN KEY (survey_id) REFERENCES data.survey(id) ON DELETE CASCADE;
      ALTER TABLE data.files ADD CONSTRAINT fk_file_section FOREIGN KEY (section_id) REFERENCES data.page_section(id) ON DELETE CASCADE;
    `
  );
}

// TODO: survey_id ja section_id foreign key viittaukset

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
      ALTER TABLE data.files DROP CONSTRAINT fk_file_section;
      ALTER TABLE data.files DROP CONSTRAINT fk_file_survey;
      ALTER TABLE data.files DROP CONSTRAINT pk_files;
      ALTER TABLE data.files ADD CONSTRAINT images_pkey PRIMARY KEY (id);
      ALTER TABLE data.files DROP COLUMN file_path;
      ALTER TABLE data.files DROP COLUMN section_id;
      ALTER TABLE data.files DROP COLUMN survey_id;
      ALTER TABLE data.files DROP COLUMN mime_type;
      ALTER TABLE data.files RENAME COLUMN file_name TO image_name;
      ALTER TABLE data.files RENAME COLUMN file TO image;
      ALTER TABLE data.files DROP COLUMN details;
      ALTER TABLE data.files RENAME TO images;
  `
  );
}
