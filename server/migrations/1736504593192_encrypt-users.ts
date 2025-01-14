import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';
import { encryptionKey } from './../src/database';

export const shorthands: ColumnDefinitions | undefined = undefined;


export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);
  pgm.sql(
    `ALTER TABLE application.user
      ALTER COLUMN full_name TYPE bytea USING pgp_sym_encrypt(full_name, '${encryptionKey}')::bytea,
      ALTER COLUMN email type bytea USING pgp_sym_encrypt(email, '${encryptionKey}')::bytea,
      ADD CONSTRAINT user_full_name_key UNIQUE (full_name),
      ADD CONSTRAINT user_email_key UNIQUE (email);
    `
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    DROP EXTENSION IF EXISTS pgcrypto;
  `);
  pgm.sql(
    `ALTER TABLE application.user
      DROP CONSTRAINT IF EXISTS user_full_name_key,
      DROP CONSTRAINT IF EXISTS user_email_key,
      ALTER COLUMN full_name TYPE text USING pgp_sym_decrypt(full_name, '${encryptionKey}')::text,
      ALTER COLUMN email TYPE text USING pgp_sym_decrypt(email, '${encryptionKey}')::text;
    `
  );
}