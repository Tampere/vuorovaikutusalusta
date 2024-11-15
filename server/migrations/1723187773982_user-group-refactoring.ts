import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  /* If there are references to files uploaded by other organization in an organization's survey,
  duplicate those files in the files table and replace the organization with the creator of the survey */
  function addMissingFiles(type: string): string {
    let from: string;
    switch (type) {
      case 'background':
        from = `FROM DATA.survey s JOIN DATA.files f ON s.background_image_name = f.file_name
        AND s.background_image_path = f.file_path`;
        break;
      case 'thanksPage':
        from = `FROM DATA.survey s JOIN DATA.files f ON s.thanks_page_image_name = f.file_name
        AND s.thanks_page_image_path = f.file_path`;
        break;
      case 'topMargin':
        from = `FROM DATA.survey s JOIN DATA.files f ON s.top_margin_image_name = f.file_name
        AND s.top_margin_image_path = f.file_path`;
        break;
      case 'bottomMargin':
        from = `FROM DATA.survey s JOIN DATA.files f ON s.bottom_margin_image_name = f.file_name
        AND s.bottom_margin_image_path = f.file_path`;
        break;
      case 'sidebar':
        from = `FROM DATA.survey_page sp JOIN DATA.survey s ON sp.survey_id = s.id JOIN DATA.files f
        ON f.file_name = sp.sidebar_image_name AND f.file_path = sp.sidebar_image_path`;
        break;
      case 'pageSection':
        from = `FROM DATA.page_section ps JOIN DATA.survey_page sp ON ps.survey_page_id = sp.id
        JOIN DATA.survey s ON sp.survey_id = s.id JOIN DATA.files f ON f.file_name = ps.file_name
        AND f.file_path = ps.file_path`;
        break;
      default:
        return '';
    }
    return `INSERT INTO DATA.files(created_at, file, file_name, details, mime_type, survey_id, file_path, organization)
    SELECT f.created_at, f.file, f.file_name, f.details, f.mime_type, f.survey_id, f.file_path, s.organization
    ${from} WHERE f.organization != s.organization ON CONFLICT DO NOTHING;`;
  }

  pgm.sql(
    `
      ALTER TABLE APPLICATION.user RENAME groups TO organizations;
      UPDATE APPLICATION.user SET organizations[1] = 'test-group-id-1' WHERE organizations[1] IS NULL;
      ALTER TABLE DATA.files RENAME groups TO organization;
      ALTER TABLE DATA.files ALTER COLUMN organization TYPE TEXT
        USING CASE
          WHEN organization[1] IS NULL THEN 'test-group-id-1'
          WHEN organization[1] IS NOT NULL THEN organization[1]
        END;
      ALTER TABLE DATA.survey RENAME groups TO organization;
      ALTER TABLE DATA.survey ALTER COLUMN organization TYPE TEXT
        USING CASE
          WHEN organization[1] IS NULL THEN 'test-group-id-1'
          WHEN organization[1] IS NOT NULL THEN organization[1]
        END;
      ALTER TABLE DATA.files DROP CONSTRAINT pk_files CASCADE;
      ALTER TABLE DATA.files ADD CONSTRAINT pk_files PRIMARY KEY (file_name, file_path, organization);
      ${addMissingFiles('background')}
      ${addMissingFiles('thanksPage')}
      ${addMissingFiles('topMargin')}
      ${addMissingFiles('bottomMargin')}
      ${addMissingFiles('sidebar')}
      ${addMissingFiles('pageSection')}
      ALTER TABLE DATA.files DROP CONSTRAINT pk_files CASCADE;
      ALTER TABLE DATA.files ADD url TEXT;
      UPDATE DATA.files SET url = CONCAT(organization, '/', array_to_string(file_path, '/'), '/', file_name);
      ALTER TABLE DATA.files ALTER COLUMN url SET NOT NULL;
      ALTER TABLE DATA.files ADD CONSTRAINT pk_files PRIMARY KEY (url);
      ALTER TABLE DATA.files
        DROP COLUMN file_name,
        DROP COLUMN file_path;
      ALTER TABLE DATA.survey
        ADD background_image_url TEXT,
        ADD thanks_page_image_url TEXT,
        ADD top_margin_image_url TEXT,
        ADD bottom_margin_image_url TEXT;
      UPDATE DATA.survey SET background_image_url = CONCAT(organization, '/', array_to_string(background_image_path, '/'), '/', background_image_name)
        WHERE background_image_path IS NOT NULL AND background_image_name IS NOT NULL;
      UPDATE DATA.survey SET thanks_page_image_url = CONCAT(organization, '/', array_to_string(thanks_page_image_path, '/'), '/', thanks_page_image_name)
        WHERE thanks_page_image_path IS NOT NULL AND thanks_page_image_name IS NOT NULL;
      UPDATE DATA.survey SET top_margin_image_url = CONCAT(organization, '/', array_to_string(top_margin_image_path, '/'), '/', top_margin_image_name)
        WHERE top_margin_image_path IS NOT NULL AND top_margin_image_name IS NOT NULL;
      UPDATE DATA.survey SET bottom_margin_image_url = CONCAT(organization, '/', array_to_string(bottom_margin_image_path, '/'), '/', bottom_margin_image_name)
        WHERE bottom_margin_image_path IS NOT NULL AND bottom_margin_image_name IS NOT NULL;
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
      UPDATE DATA.survey_page SET sidebar_image_url = CONCAT(s.organization, '/', array_to_string(sidebar_image_path, '/'), '/', sidebar_image_name)
        FROM DATA.survey s WHERE s.id = survey_id AND sidebar_image_path IS NOT NULL AND sidebar_image_name IS NOT NULL;
      ALTER TABLE DATA.survey_page
        DROP COLUMN sidebar_image_name,
        DROP COLUMN sidebar_image_path;
      ALTER TABLE DATA.survey_page ADD CONSTRAINT fk_page_image FOREIGN KEY (sidebar_image_url) REFERENCES data.files (url) ON DELETE SET NULL;
      ALTER TABLE DATA.page_section ADD file_url TEXT;
      UPDATE DATA.page_section SET file_url = CONCAT(s.organization, '/', array_to_string(file_path, '/'), '/', file_name)
        FROM DATA.survey s JOIN DATA.survey_page sp ON s.id = sp.survey_id
        WHERE sp.id = survey_page_id AND file_path IS NOT NULL AND file_name IS NOT NULL;
      ALTER TABLE DATA.page_section
        DROP COLUMN file_name,
        DROP COLUMN file_path;
      ALTER TABLE DATA.page_section ADD CONSTRAINT fk_section_file FOREIGN KEY (file_url) REFERENCES data.files (url) ON DELETE SET NULL;
    `,
  );
}
