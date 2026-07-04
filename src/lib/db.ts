import path from 'path';
import { createRequire } from 'module';
import { Pool, PoolClient } from 'pg';
import { initializeSchema } from './db-schema';

const DB_PATH = path.join(process.cwd(), 'gigboard.db');
const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING;
const usePostgres = Boolean(PG_URL);

function normalizeQuery(query: string) {
  let sql = query;
  const insertIgnore = /INSERT\s+OR\s+IGNORE\s+INTO/i.test(sql);

  if (usePostgres) {
    sql = sql.replace(/INSERT\s+OR\s+IGNORE\s+INTO/gi, 'INSERT INTO');
    sql = sql.replace(/datetime\('now'\)/gi, 'CURRENT_TIMESTAMP');
  }

  return { sql, insertIgnore };
}

function buildQuery(query: string, params: unknown[]) {
  const { sql, insertIgnore } = normalizeQuery(query);

  if (!usePostgres) {
    return { text: sql, values: params, insertIgnore };
  }

  let idx = 0;
  const text = sql.replace(/\?/g, () => '$' + (++idx));
  return { text, values: params, insertIgnore };
}

interface RunResult {
  lastInsertRowid?: number | bigint;
  rows?: unknown[];
  rowCount?: number | null;
}

type SqliteDatabaseInstance = {
  prepare(query: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): unknown;
  };
  exec(sql: string): unknown;
};

interface PreparedStatement {
  get(...params: unknown[]): Promise<unknown> | unknown;
  all(...params: unknown[]): Promise<unknown[]> | unknown[];
  run(...params: unknown[]): Promise<RunResult> | RunResult;
}

interface DatabaseAdapter {
  prepare(query: string): PreparedStatement;
  exec(sql: string): Promise<unknown> | unknown;
  transaction(fn: (db: DatabaseAdapter) => Promise<void> | void): Promise<void> | void;
}

class SqliteDatabase implements DatabaseAdapter {
  db: SqliteDatabaseInstance;

  constructor(db: SqliteDatabaseInstance) {
    this.db = db;
  }

  prepare(query: string): PreparedStatement {
    const stmt = this.db.prepare(query);
    return {
      get: (...params: unknown[]) => stmt.get(...params),
      all: (...params: unknown[]) => stmt.all(...params),
      run: (...params: unknown[]) => {
        const result = stmt.run(...params);
        if (result && typeof result === 'object' && 'changes' in result) {
          return {
            lastInsertRowid: (result as { lastInsertRowid?: number | bigint }).lastInsertRowid,
            rowCount: (result as { changes?: number }).changes,
            rows: [],
          };
        }
        return result as RunResult;
      },
    };
  }

  exec(sql: string) {
    return this.db.exec(sql);
  }

  async transaction(fn: (db: DatabaseAdapter) => Promise<void> | void) {
    this.db.exec('BEGIN');
    try {
      const result = await fn(this);
      if (result !== undefined) {
        void result;
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}

class PgPreparedStatement implements PreparedStatement {
  query: string;
  client: Pool | PoolClient;
  insertIgnore: boolean;

  constructor(query: string, client: Pool | PoolClient) {
    const normalized = normalizeQuery(query);
    this.query = normalized.sql;
    this.insertIgnore = normalized.insertIgnore;
    this.client = client;
  }

  async get(...params: unknown[]) {
    const { text, values } = buildQuery(this.query, params);
    const result = await this.client.query(text, values);
    return result.rows[0];
  }

  async all(...params: unknown[]) {
    const { text, values } = buildQuery(this.query, params);
    const result = await this.client.query(text, values);
    return result.rows;
  }

  async run(...params: unknown[]) {
    const { text, values, insertIgnore } = buildQuery(this.query, params);
    let statement = text;

    if (/^\s*INSERT/i.test(statement)) {
      if (insertIgnore && !/\bON\s+CONFLICT\b/i.test(statement)) {
        statement += ' ON CONFLICT DO NOTHING';
      }
      if (!/\bRETURNING\b/i.test(statement)) {
        statement += ' RETURNING *';
      }
    }

    const result = await this.client.query(statement, values);
    return { lastInsertRowid: result.rows?.[0]?.id, rows: result.rows, rowCount: result.rowCount };
  }
}

class PgDatabase implements DatabaseAdapter {
  pool: Pool;
  client?: PoolClient;

  constructor(pool: Pool, client?: PoolClient) {
    this.pool = pool;
    this.client = client;
  }

  prepare(query: string): PreparedStatement {
    return new PgPreparedStatement(query, this.client ?? this.pool);
  }

  exec(sql: string) {
    return (this.client ?? this.pool).query(sql);
  }

  async transaction(fn: (db: DatabaseAdapter) => Promise<void> | void) {
    if (this.client) {
      return fn(this);
    }

    const client = await this.pool.connect();
    const txDb = new PgDatabase(this.pool, client);
    try {
      await client.query('BEGIN');
      await fn(txDb);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

function createSqliteDatabase(): DatabaseAdapter {
  if (process.env.VERCEL || process.env.NOW_REGION) {
    throw new Error(
      'SQLite cannot be used on Vercel (no persistent/writable filesystem). ' +
      'Set DATABASE_URL (or POSTGRES_URL) to a Postgres connection string.'
    );
  }

  const require = createRequire(import.meta.url);
  const moduleName = 'better-sqlite3';
  const Sqlite3 = require(moduleName);
  const rawDb = new Sqlite3(DB_PATH);
  return new SqliteDatabase(rawDb);
}

function createPostgresDatabase(): DatabaseAdapter {
  const pool = new Pool({ connectionString: PG_URL, ssl: process.env.PGSSLMODE ? { rejectUnauthorized: false } : undefined });
  return new PgDatabase(pool);
}

const globalForDb = globalThis as unknown as { db: DatabaseAdapter | undefined };
export const db = globalForDb.db ?? (usePostgres ? createPostgresDatabase() : createSqliteDatabase());

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

void initializeSchema(db, usePostgres).catch((error) => {
  console.error('Database initialization failed:', error);
});

export default db;
