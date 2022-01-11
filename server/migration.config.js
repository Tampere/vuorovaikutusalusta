module.exports = {
  verbose: false,
  url: process.env.DATABASE_URL,
  tsconfig: './tsconfig.json',
  migrationsSchema: 'application',
  migrationsTable: 'pgmigrations',
  createMigrationsSchema: true,
};
