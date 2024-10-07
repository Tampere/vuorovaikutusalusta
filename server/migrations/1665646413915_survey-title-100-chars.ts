import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey ALTER COLUMN name TYPE varchar(100)`);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.survey ALTER COLUMN name TYPE varchar(40) USING name::varchar(40)`,
  );
}
