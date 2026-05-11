import { database } from './utils';

export const withTransaction = <T>(callback: () => T): T => {
  try {
    database.prepare('BEGIN').run();

    const result = callback();

    database.prepare('COMMIT').run();

    return result;
  } catch (err) {
    database.prepare('ROLLBACK').run();
    throw err;
  }
};
