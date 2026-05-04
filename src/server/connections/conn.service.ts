import { AppError } from "../units/app.errors";
import type { FriendRequestSchema, SearchSchema } from "./conn.schema";
import * as repo from "./conn.repository"

export const search = async (body: SearchSchema) => {
  const reqQuery = body.query.trim();


  const result = await repo.searchUser(reqQuery); 
  console.log(result)
  if (!result) {
    throw new AppError("User not found", 404);
  }
  return result;
}


export const sendFriendRequest = async (body: FriendRequestSchema) => {
  const result = await repo.sendFriendRequest(body);
  if (!result) {
    throw new AppError("Request failed");
  }
  return result;
}

export const acceptFriendRequest = async (body: FriendRequestSchema) => {
  const result = await repo.acceptFriendRequest(body);
  if (!result) {
    throw new AppError("Request failed");
  }
  return result;
}