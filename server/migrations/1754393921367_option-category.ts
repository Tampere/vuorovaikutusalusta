import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
    CREATE TABLE DATA.option_category_group (
      id UUID DEFAULT public.gen_random_uuid() PRIMARY KEY,
      idx INT,
      name JSONB NOT NULL,
      section_id INT REFERENCES data.page_section(id) ON DELETE CASCADE
    );
    
    CREATE TABLE data.option_category (
      id UUID DEFAULT public.gen_random_uuid() PRIMARY KEY,
      name JSONB NOT NULL,
      category_group_id UUID REFERENCES data.option_category_group(id) ON DELETE CASCADE,
      CONSTRAINT unique_category_name UNIQUE (name, category_group_id)
    );

    CREATE TABLE data.option_category_assignment (
      option_id INT NOT NULL REFERENCES data.option(id) ON DELETE CASCADE,
      category_id UUID NOT NULL REFERENCES data.option_category(id) ON DELETE CASCADE,
      PRIMARY KEY (option_id, category_id)
    );
  `,
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
    DROP TABLE IF EXISTS data.option_category_assignment;
    DROP TABLE IF EXISTS data.option_category;
    DROP TABLE IF EXISTS data.option_category_group;
    `,
  );
}
