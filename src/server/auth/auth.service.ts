import { scryptSync, randomBytes } from "crypto";
import { database } from "../../db/utils";
import * as repo from "./auth.repository";
import type { SigninInput, SignupInput } from "./auth.schema";
import { AppError } from "../units/app.errors";
import { verifyPassword } from "../middlewares/validate";



export const signup = async (body: SignupInput) => {

  if (!body.email || !body.password || !body.username) {
    return Response.json(
      { error: "email, password and username are required" },
      { status: 400 }
    )
  }

  const user = repo.createUser(database, {
    email: body.email,
    password: body.password,
    username: body.username,
    first_name: body.firstName ?? null,
    last_name: body.lastName ?? null,
    avatar_url: body.avatarURL ?? null,
    mobile_no: body.mobileNo ?? null,
  });

  return {
    id: user,
    username: body.username,
  };
};

export const signin = async (body: SigninInput) => {

  if (!body.username || !body.password) {
    return Response.json(
      { error: "username and password are required" },
      { status: 400 }
    )
  }


  const user = repo.findByUsername(body.username); 
  if (!user) {
    throw new AppError("Invalid username", 401);
  }

  const isValid = verifyPassword(body.password, user.user_pass);
  if (!isValid) {
    throw new AppError("Invalid password", 401);
  }

  return {id: user.id, username: user.username};

}