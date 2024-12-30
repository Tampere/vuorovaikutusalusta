import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE data.survey ADD COLUMN viewers VARCHAR(255)[] DEFAULT array[]::VARCHAR(255)[];`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`ALTER TABLE data.survey DROP COLUMN viewers;`);
}
