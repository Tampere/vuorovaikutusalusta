import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
      ALTER TABLE APPLICATION.user RENAME groups TO organizations;
      ALTER TABLE DATA.files DROP CONSTRAINT pk_files CASCADE;
      ALTER TABLE DATA.files
        DROP COLUMN file_name,
        DROP COLUMN file_path,
        DROP COLUMN groups;
      ALTER TABLE DATA.files ADD url TEXT;
      ALTER TABLE DATA.files ADD CONSTRAINT pk_files PRIMARY KEY (url);
      ALTER TABLE DATA.survey ALTER COLUMN groups TYPE TEXT;
      ALTER TABLE DATA.survey RENAME groups TO organization;
      ALTER TABLE DATA.survey
        DROP COLUMN background_image_name,
        DROP COLUMN background_image_path,
        DROP COLUMN thanks_page_image_name,
        DROP COLUMN thanks_page_image_path,
        DROP COLUMN top_margin_image_name,
        DROP COLUMN top_margin_image_path,
        DROP COLUMN bottom_margin_image_name,
        DROP COLUMN bottom_margin_image_path;
      ALTER TABLE DATA.survey
        ADD background_image_url TEXT,
        ADD thanks_page_image_url TEXT,
        ADD top_margin_image_url TEXT,
        ADD bottom_margin_image_url TEXT;
      ALTER TABLE DATA.survey
        ADD CONSTRAINT fk_background_image FOREIGN KEY (background_image_url) REFERENCES DATA.files (url) ON DELETE SET NULL,
        ADD CONSTRAINT fk_thanks_page_image FOREIGN KEY (thanks_page_image_url) REFERENCES DATA.files(url) ON DELETE SET NULL,
        ADD CONSTRAINT fk_top_margin_image FOREIGN KEY (top_margin_image_url) REFERENCES DATA.files(url) ON DELETE SET NULL,
        ADD CONSTRAINT fk_bottom_margin_image FOREIGN KEY (bottom_margin_image_url) REFERENCES DATA.files(url) ON DELETE SET NULL;
      ALTER TABLE DATA.survey_page
        DROP COLUMN sidebar_image_name,
        DROP COLUMN sidebar_image_path;
      ALTER TABLE DATA.survey_page ADD sidebar_image_url TEXT;
      ALTER TABLE DATA.survey_page ADD CONSTRAINT fk_page_image FOREIGN KEY (sidebar_image_url) REFERENCES data.files (url) ON DELETE SET NULL;
      ALTER TABLE DATA.page_section
        DROP COLUMN file_name,
        DROP COLUMN file_path;
      ALTER TABLE DATA.page_section ADD file_url TEXT;
      ALTER TABLE DATA.page_section ADD CONSTRAINT fk_section_file FOREIGN KEY (file_url) REFERENCES data.files (url) ON DELETE SET NULL;
    `,
  );
}
