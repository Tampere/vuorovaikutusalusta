import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
  UPDATE application.theme SET "data"='{"palette": {"primary": {"main": "#008577"}, "secondary": {"main": "#17607F"}}}'::jsonb WHERE id=1 AND idx=0;
  UPDATE application.theme SET "data"='{"palette": {"primary": {"main": "#008577"}, "secondary": {"main": "#515B68"}}}'::jsonb WHERE id=2 AND idx=1;
  `);
}
