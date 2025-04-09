import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.personal_info 
        ADD COLUMN address bytea,
        ADD COLUMN custom bytea
    `,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.personal_info 
        DROP COLUMN address,
        DROP COLUMN custom
    `,
  );
}
