import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE DATA.answer_entry 
    ALTER COLUMN map_layers TYPE jsonb USING COALESCE(CASE WHEN map_layers IS NULL THEN NULL ELSE to_jsonb(map_layers) END, null)`,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `ALTER TABLE DATA.answer_entry 
        ALTER COLUMN map_layers TYPE int4[] USING map_layers::int4[]`,
  );
}
