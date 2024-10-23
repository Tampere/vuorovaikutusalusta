/* eslint-disable no-useless-escape */
import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
    UPDATE application.user appuser
      SET organizations = ARRAY(
          SELECT REGEXP_REPLACE(unnest(appuser.organizations), '\[|\]|\"', '', 'g')
      )
      WHERE appuser.id is not null;
    `
  )
}