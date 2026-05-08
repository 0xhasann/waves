import axios from "axios";
import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { database } from "../../db/utils";
import type { JwtUser, User } from "../../shared/types";
import { now } from "../units/timeUtils";

const db = database;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignup = async (req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
  });


  const url =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: "http://localhost:3000/auth/google/callback",
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state,
    });

  res.redirect(url.toString());
};

export const callbackRoute = async (req: Request, res: Response) => {
  if (!req.cookies?.oauth_state || req.query.state !== req.cookies.oauth_state) {
    return res.status(403).send("Invalid state");
  }
  res.clearCookie("oauth_state");

  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Missing code");
    }

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: "http://localhost:3000/auth/google/callback",
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const { id_token } = tokenRes.data;

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).send("Invalid token");
    }

    const { sub, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).send("Email not verified");
    }

    const [first_name, ...rest] = (name || "").split(" ");
    const last_name = rest.join(" ");

    const username = email?.split("@")[0] + "_" + Date.now() || `google_${sub}`;

    let user = (await db
      .prepare(`SELECT * FROM users WHERE google_id = ? OR email_id = ?;`)
      .get(sub, email ?? null)) as User | undefined;

    if (!user) {
      await db
        .prepare(
          `INSERT INTO users 
    (username, email_id, google_id, provider, avatar_url, first_name, last_name, user_pass)
    VALUES (?, ?, ?, 'google', ?, ?, ?, ?);`,
        )
        .run(
          username,
          email ?? null,
          sub,
          picture ?? null,
          first_name ?? null,
          last_name ?? null,
          null,
        );

      user = (await db
        .prepare(`SELECT * FROM users WHERE google_id = ?;`)
        .get(sub)) as User | undefined;
    } else if (!user.google_id) {
      await db
        .prepare(
          `UPDATE users SET google_id = ?, provider = 'google', updated_at WHERE id = ?;`,
        )
        .run(sub, user.id, now());

      user = (await db
        .prepare(`SELECT * FROM users WHERE id = ?;`)
        .get(user.id)) as User;
    }

    if (!user) {
      return res.status(500).send("User creation failed");
    }

    tokenCookie(user.id, req, res);
    res.redirect("http://localhost:3000/conversation_timeline.html");

  } catch (err) {
    console.error(err);
    res.status(500).send("Auth failed");
  }
};
export const tokenCookie = async (id: number, req: Request, res: Response) => {
  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const getTokenFromCookie = async (req: Request, res: Response) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).send("Unauthorized");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUser;
    const user = await db
      .prepare(`SELECT id, username, first_name FROM users WHERE id = ?`)
      .get(decoded.userId);
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch {
    res.status(401).send("Invalid token");
  }
};

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth_token;
  console.log("req.cookies", req.cookies);
  console.log("req.cookies.auth_token", req.cookies.auth_token);

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("auth_token");
    if (err instanceof jwt.TokenExpiredError)
      return res.status(401).json({ message: "Session expired, please sign in again" });
    if (err instanceof jwt.JsonWebTokenError)
      return res.status(401).json({ message: "Invalid token" });
    return res.status(500).json({ message: "Authentication failed" });
  }
};