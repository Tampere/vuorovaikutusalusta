import PgPromise from 'pg-promise';

// Mock database object with methods that return promises
const mockDb = {
  one: jest.fn().mockResolvedValue({}),
  none: jest.fn().mockResolvedValue(undefined),
  manyOrNone: jest.fn().mockResolvedValue([]),
  oneOrNone: jest.fn().mockResolvedValue(null),
  any: jest.fn().mockResolvedValue([]),
  tx: jest.fn((callback) => callback(mockDb)),
};

export const getDb = jest.fn(() => mockDb);
export const mockDb_ = mockDb;

export const getColumnSet = jest.fn(
  (tableName: string, columns: any[]) =>
    new (PgPromise().helpers.ColumnSet)(columns, {
      table: { table: tableName, schema: 'data' },
    }),
);

export const getGeoJSONColumn = jest.fn((name: string) => ({
  name,
  mod: ':raw',
  init: () => 'NULL',
}));

export const getMultiInsertQuery = jest.fn(() => '');
export const getMultiUpdateQuery = jest.fn(() => '');
export const encryptionKey = 'test-encryption-key';
