import { AppError } from "../units/app.errors";
import type { FriendRequestSchema, SearchSchema } from "./conn.schema";
import * as repo from "./conn.repository"
import { RequestStatus } from "../../shared/types";

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
  const result = await repo.sendRequest(body);
  if (!result) {
    throw new AppError("Request failed");
  }
  return result;
}

export const processFriendRequest = async (body: FriendRequestSchema) => {
  const isRequestExist = await repo.findPendingRequest(body);
  if (!isRequestExist) {
    throw new AppError("Record not found");
  }
  if (isRequestExist.status !== RequestStatus.pending) {
    throw new AppError("Request already processed");
  }
  const result = await repo.processRequest(body);
  if (!result) {
    throw new AppError("Request failed");
  }
  return result;
}