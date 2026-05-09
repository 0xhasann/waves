import { database } from "./utils";

export const withTransaction = async <T>(
    callback: () => Promise<T>,
  ): Promise<T> => {
    try {
      database.prepare("BEGIN").run();
  
      const result = await callback();
  
      database.prepare("COMMIT").run();
  
      return result;
    } catch (err) {
      database.prepare("ROLLBACK").run();
      throw err;
    }
  };