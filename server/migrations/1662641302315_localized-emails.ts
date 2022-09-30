import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey 
      ALTER COLUMN email_subject TYPE JSON USING 
        CASE 
          WHEN email_subject IS NULL THEN NULL
          WHEN email_subject IS NOT NULL THEN json_build_object('fi', email_subject)
        END;
    ALTER TABLE data.survey
      ALTER COLUMN email_body TYPE JSON USING 
        CASE 
          WHEN email_body IS NULL THEN NULL 
          WHEN email_body IS NOT NULL THEN json_build_object('fi', email_body)
        END;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    ALTER TABLE data.survey ALTER COLUMN email_subject TYPE TEXT;
    ALTER TABLE data.survey ALTER COLMN email_body TYPE TEXT;
  `);
}
