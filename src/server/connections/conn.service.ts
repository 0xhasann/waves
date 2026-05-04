import { AppError } from "../units/app.errors";
import type { SearchSchema } from "./conn.schema";
import * as repo from "./conn.repository"

export const search = async (body: SearchSchema) => {
  const query = body.query.trim();


  const result = await repo.searchUser(query); 
  console.log(result)
  if (!result) {
    throw new AppError("User not found", 404);
  }
  return result;
}