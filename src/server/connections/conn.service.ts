import { AppError } from "../units/app.errors";
import { friendsSchema, type SendFriendRequestSchema, type ProcessFriendRequestSchema, type FriendsSchema, type SearchSchema } from "./conn.schema";
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


export const sendFriendRequest = async (body: SendFriendRequestSchema) => {
  const result = await repo.sendRequest(body);
  if (!result) {
    throw new AppError("Request failed");
  }
  return result;
}

export const processFriendRequest = async (body: ProcessFriendRequestSchema) => {
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
  if (result && body.status === RequestStatus.accepted) {
    const createFriend = repo.createFriends(body);
    console.log(`Friend is created with id ${createFriend}`);
  }
  return result;
}

export const unfollowFriend = async (body: FriendsSchema) => {
  const isFriendsExits = await repo.findFriends(body);
  if (!isFriendsExits) {
    throw new AppError("Record not found");
  }
  const result = await repo.deleteFriends(body);

  if (!result) {
    throw new AppError("Request failed");
  }
  return result;

}