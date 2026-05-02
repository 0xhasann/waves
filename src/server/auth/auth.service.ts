import { database } from "../../db/utils";
import * as repo from "./auth.repository";
import type { SigninInput, SignupInput } from "./auth.schema";
import { AppError } from "../units/app.errors";
import { verifyPassword } from "../units/validate";



export const signup = async (body: SignupInput) => {

  const user = repo.findByUsername(body.username);
  if (user) {
    throw new AppError("User Already Exists", 403);
  }

  const userId = repo.createUser(database, body);

  return {
    id: userId,
    username: body.username,
  };
};

export const signin = async (body: SigninInput) => {

  const user = repo.findByUsername(body.username); 
  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }

  const isValid = verifyPassword(body.password, user.user_pass);
  if (!isValid) {
    throw new AppError("Invalid Credentials", 401);
  }

  return {id: user.id, username: user.username};

}