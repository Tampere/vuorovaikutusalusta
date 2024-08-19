import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
      ALTER TABLE APPLICATION.user RENAME groups TO organizations;
      ALTER TABLE DATA.files RENAME groups TO organization;
      ALTER TABLE DATA.files ALTER COLUMN organization TYPE TEXT USING organization[1];
      ALTER TABLE DATA.files DROP CONSTRAINT pk_files CASCADE;
      ALTER TABLE DATA.files ADD url TEXT;
      UPDATE DATA.files SET url = CONCAT(organization, '/', array_to_string(file_path, '/'), '/', file_name);
      ALTER TABLE DATA.files ALTER COLUMN url SET NOT NULL;
      ALTER TABLE DATA.files ADD CONSTRAINT pk_files PRIMARY KEY (url);
      ALTER TABLE DATA.files
        DROP COLUMN file_name,
        DROP COLUMN file_path;
      ALTER TABLE DATA.survey RENAME groups TO organization;
      ALTER TABLE DATA.survey ALTER COLUMN organization TYPE TEXT USING organization[1];
      ALTER TABLE DATA.survey
        ADD background_image_url TEXT,
        ADD thanks_page_image_url TEXT,
        ADD top_margin_image_url TEXT,
        ADD bottom_margin_image_url TEXT;
      UPDATE DATA.survey SET background_image_url = CONCAT(organization, '/', array_to_string(background_image_path, '/'), '/', background_image_name);
      UPDATE DATA.survey SET thanks_page_image_url = CONCAT(organization, '/', array_to_string(thanks_page_image_path, '/'), '/', thanks_page_image_name);
      UPDATE DATA.survey SET top_margin_image_url = CONCAT(organization, '/', array_to_string(top_margin_image_path, '/'), '/', top_margin_image_name);
      UPDATE DATA.survey SET bottom_margin_image_url = CONCAT(organization, '/', array_to_string(bottom_margin_image_path, '/'), '/', bottom_margin_image_name);
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
        ADD CONSTRAINT fk_background_image FOREIGN KEY (background_image_url) REFERENCES DATA.files (url) ON DELETE SET NULL,
        ADD CONSTRAINT fk_thanks_page_image FOREIGN KEY (thanks_page_image_url) REFERENCES DATA.files(url) ON DELETE SET NULL,
        ADD CONSTRAINT fk_top_margin_image FOREIGN KEY (top_margin_image_url) REFERENCES DATA.files(url) ON DELETE SET NULL,
        ADD CONSTRAINT fk_bottom_margin_image FOREIGN KEY (bottom_margin_image_url) REFERENCES DATA.files(url) ON DELETE SET NULL;
      ALTER TABLE DATA.survey_page ADD sidebar_image_url TEXT;
      UPDATE DATA.survey_page SET sidebar_image_url = CONCAT(s.organization, '/', array_to_string(sidebar_image_path, '/'), '/', sidebar_image_name) FROM DATA.survey s WHERE s.id = DATA.survey_page.survey_id;
      ALTER TABLE DATA.survey_page
        DROP COLUMN sidebar_image_name,
        DROP COLUMN sidebar_image_path;
      ALTER TABLE DATA.survey_page ADD CONSTRAINT fk_page_image FOREIGN KEY (sidebar_image_url) REFERENCES data.files (url) ON DELETE SET NULL;
      ALTER TABLE DATA.page_section ADD file_url TEXT;
      UPDATE DATA.page_section SET file_url = CONCAT(s.organization, '/', array_to_string(file_path, '/'), '/', file_name) FROM DATA.survey s INNER JOIN DATA.survey_page sp ON s.id = sp.survey_id WHERE sp.id = DATA.page_section.survey_page_id;
      ALTER TABLE DATA.page_section
        DROP COLUMN file_name,
        DROP COLUMN file_path;
      ALTER TABLE DATA.page_section ADD CONSTRAINT fk_section_file FOREIGN KEY (file_url) REFERENCES data.files (url) ON DELETE SET NULL;
    `,
  );
}
