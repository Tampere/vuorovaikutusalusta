import PgPromise from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { Client } from 'pg';
import migrate from 'node-pg-migrate';
import logger from './logger';
import retry from 'async-retry';

// Default schemas for all queries
const schema = ['application', 'public', 'data'];

// Default SRID for geometries - inserted data will be transformed to this
const defaultSrid = 3857;

// How many times to retry connection, if it fails on initialization?
const connectRetries = Number(process.env.DATABASE_CONNECT_RETRIES) || 10;
// How long to wait between connection retries (in milliseconds)?
const connectRetryTimeout =
  Number(process.env.DATABASE_CONNECT_RETRY_TIMEOUT) || 2000;

const pgp: PgPromise.IMain<{}, IClient> = PgPromise({
  schema,
});
let db: PgPromise.IDatabase<{}, IClient> = null;
let migrationConnection: PgPromise.IConnected<{}, IClient> = null;

/**
 * Initializes the database.
 */
export async function initializeDatabase() {
  if (!db) {
    db = pgp(process.env.DATABASE_URL);
    // Retry connection if it fails during initialization
    let retryCount = 0;
    await retry(
      async () => {
        try {
          // Test connection and store it for the migration
          migrationConnection = await db.connect();
        } catch (error) {
          logger.warn(`Error connecting to database: ${error}`);
          if (retryCount < connectRetries) {
            logger.info(
              `Retrying database connection (${++retryCount}/${connectRetries})`,
            );
          }
          throw error;
        }
      },
      {
        retries: connectRetries,
        minTimeout: connectRetryTimeout,
        // Exponential factor for increasing retry timeout per each retry (1 = timeout always fixed)
        factor: 1,
      },
    );
    logger.info('Database connection initialized');
  } else {
    logger.warn('Database connection already initialized');
  }
}

/**
 * Gets the initialized database object.
 * If not yet initialized, throws an error.
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

/**
 * Gets a column set for making batch queries easier.
 * @param columns Column names
 * @param tableName Table name
 */
export function getColumnSet<Row>(
  tableName: string,
  columns: (keyof Row | Partial<PgPromise.Column>)[],
) {
  return new pgp.helpers.ColumnSet(columns, {
    table: { table: tableName, schema: 'data' },
  });
}

/**
 * PgPromise custom column definition for inserting GeoJSON data.
 * Wraps the geometry into functions for parsing the GeoJSON and transforming it to the default SRID.
 *
 * If the root-level properties contains 'bufferRadius', it will be used for calculating a buffer geometry with ST_Buffer.
 *
 * @param name Column name
 */
export function getGeoJSONColumn(
  name: string,
  inputSRID: number = 3857,
): Partial<PgPromise.Column> {
  return {
    name,
    mod: ':raw',
    init: ({ value }) => {
      return !value
        ? 'NULL'
        : value.properties?.bufferRadius != null
        ? // If geometry provided with buffer radius, add ST_Buffer
          pgp.as.format(
            'public.ST_Buffer(public.ST_Transform(public.ST_SetSRID(public.ST_GeomFromGeoJSON($1), $2), $3), $4)',
            [value, inputSRID, defaultSrid, value.properties.bufferRadius],
          )
        : pgp.as.format(
            // Transform provided geometry to default SRID
            'public.ST_Transform(public.ST_SetSRID(public.ST_GeomFromGeoJSON($1), $2), $3)',
            [value, inputSRID, defaultSrid],
          );
    },
  };
}

/**
 * Generates a multi-insert query for given rows and column set.
 * @param rows Rows to be inserted
 * @param columnSet Column set object
 */
export function getMultiInsertQuery<Row>(
  rows: Row[],
  columnSet: PgPromise.ColumnSet,
) {
  return pgp.helpers.insert(rows, columnSet);
}

/**
 * Generates a multi-update query for given rows and column set.
 * @param rows Rows to be updated
 * @param columnSet
 */
export function getMultiUpdateQuery<Row>(
  rows: Row[],
  columnSet: PgPromise.ColumnSet,
) {
  return pgp.helpers.update(rows, columnSet);
}

/**
 * Execute migrations up
 */
export async function migrateUp() {
  if (!migrationConnection) {
    throw new Error('Database not initialized');
  }
  await migrate({
    migrationsTable: 'pgmigrations',
    dir: 'migrations',
    direction: 'up',
    dbClient: migrationConnection.client as any as Client,
    count: undefined,
    ignorePattern: '\\.template\\.ts',
    schema: 'application',
    createSchema: true,
    noLock: true,
  });
  // Release the connection from the pool
  migrationConnection.done();
}
