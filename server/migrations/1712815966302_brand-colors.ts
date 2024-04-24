import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
  UPDATE application.theme SET "name"='Teema 1', "data"='{"palette": {"primary": {"main": "#00a393"}, "secondary": {"main": "#219acd"}}}'::jsonb WHERE id=1 AND idx=0;
  UPDATE application.theme SET "name"='Teema 2', "data"='{"palette": {"primary": {"main": "#1a776d"}, "secondary": {"main": "#17607f"}}}'::jsonb WHERE id=2 AND idx=1;
  UPDATE application.theme SET "name"='Teema 3', "data"='{"palette": {"primary": {"main": "#1a776d"}, "secondary": {"main": "#00a393"}}}'::jsonb WHERE id=3 AND idx=2;

  INSERT INTO application.theme (idx, name, DATA) VALUES (3, 'Teema 4', '{"palette": {"primary": {"main": "#17607f"}, "secondary": {"main": "#219acd"}}}'::jsonb);
  INSERT INTO application.theme (idx, name, DATA) VALUES (4, 'Teema 5', '{"palette": {"primary": {"main": "#0065BD"}, "secondary": {"main": "#64d2A7"}}}'::jsonb);
  INSERT INTO application.theme (idx, name, DATA) VALUES (5, 'Teema 6', '{"palette": {"primary": {"main": "#6E0610"}, "secondary": {"main": "#EAA316"}}}'::jsonb);`);
}
