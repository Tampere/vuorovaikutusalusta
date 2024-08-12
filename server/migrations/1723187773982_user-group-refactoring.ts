import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
      ALTER TABLE DATA.survey ALTER COLUMN groups TYPE TEXT;
      ALTER TABLE DATA.survey RENAME groups TO organization;
      ALTER TABLE APPLICATION.user RENAME groups TO organizations;
      ALTER TABLE DATA.files ALTER COLUMN groups TYPE TEXT;
      ALTER TABLE DATA.files RENAME groups TO organization;
      ALTER TABLE DATA.files DROP CONSTRAINT pk_files CASCADE;
      ALTER TABLE DATA.files ADD CONSTRAINT pk_files PRIMARY KEY (file_path, file_name, organization);
      ALTER TABLE DATA.survey_page ADD sidebar_image_organization TEXT;
      ALTER TABLE DATA.survey_page ADD CONSTRAINT fk_page_image FOREIGN KEY (sidebar_image_path, sidebar_image_name, sidebar_image_organization) REFERENCES data.files (file_path, file_name, organization) ON DELETE SET NULL;
      ALTER TABLE DATA.page_section ADD file_organization TEXT;
      ALTER TABLE DATA.page_section ADD CONSTRAINT fk_section_file FOREIGN KEY (file_path, file_name, file_organization) REFERENCES data.files (file_path, file_name, organization) ON DELETE SET NULL;
      ALTER TABLE DATA.survey ADD background_image_organization TEXT;
      ALTER TABLE DATA.survey ADD thanks_page_image_organization TEXT;
      ALTER TABLE DATA.survey ADD top_margin_image_organization TEXT;
      ALTER TABLE DATA.survey ADD bottom_margin_image_organization TEXT;
      ALTER TABLE DATA.survey
        ADD CONSTRAINT fk_background_image FOREIGN KEY (background_image_path, background_image_name, background_image_organization) REFERENCES data.files (file_path, file_name, organization) ON DELETE SET NULL,
        ADD CONSTRAINT fk_thanks_page_image FOREIGN KEY (thanks_page_image_path, thanks_page_image_name, thanks_page_image_organization) REFERENCES DATA.files(file_path, file_name, organization) ON DELETE SET NULL,
        ADD CONSTRAINT fk_top_margin_image FOREIGN KEY (top_margin_image_path, top_margin_image_name, top_margin_image_organization) REFERENCES DATA.files(file_path, file_name, organization) ON DELETE SET NULL,
        ADD CONSTRAINT fk_bottom_margin_image FOREIGN KEY (bottom_margin_image_path, bottom_margin_image_name, bottom_margin_image_organization) REFERENCES DATA.files(file_path, file_name, organization) ON DELETE SET NULL;
    `,
  );
}
