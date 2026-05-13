import { Database } from 'bun:sqlite';
import { readdirSync, readFileSync } from 'fs';
import path, { join } from 'path';
import { createHash } from 'crypto';
import { logger } from '../server/units/logger';
import { appEnv } from '../server/config/env';

export const database = new Database(appEnv.DATABASE_URL);
export type DB = typeof database;

const dir = path.resolve(process.cwd(), 'migrations');

export function runMigration() {
  database.run(`
  CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    run_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

  function checksum(content: string) {
    return createHash('sha256').update(content).digest('hex');
  }

  const applied = new Map(
    database
      .query('SELECT id, checksum FROM migrations')
      .all()
      .map((value) => {
        const r = value as { id: string; checksum: string };
        return [r.id, r.checksum];
      }),
  );

  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const id = file.replace('.sql', '');
    const sql = readFileSync(join(dir, file), 'utf-8');
    const hash = checksum(sql);

    if (!applied.has(id)) {
      database.run('BEGIN');
      try {
        database.run(sql);
        database.run('INSERT INTO migrations (id, checksum) VALUES (?, ?)', [id, hash]);
        database.run('COMMIT');
        logger.info('Applied:', id);
      } catch (e) {
        logger.info(e);
        database.run('ROLLBACK');
        throw e;
      }
    } else {
      logger.info(`Migration is already done for file:: ${id}`);
      const oldHash = applied.get(id);
      if (oldHash !== hash) {
        throw new Error(`Migration modified: ${id}`);
      }
    }
  }
}
