import { Authenticator } from "remix-auth";
import { v4 } from "uuid";
import { db } from "./db.server";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { destroySession, getSession } from "./session.server";

async function getUserInfo(accessToken: string) {
  const response = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.statusText}`);
  }

  const userInfo = await response.json();
  return userInfo;
}

export const authenticator = new Authenticator();

authenticator.use(
  new OAuth2Strategy(
    {
      cookie: "oauth2", // Optional, can also be an object with more options

      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,

      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenEndpoint: "https://oauth2.googleapis.com/token",
      redirectURI: process.env.GOOGLE_REDIRECT_URI!,

      scopes: ["openid", "email", "profile"],
    },
    async (verifyOptions) => {
      const { tokens, request } = verifyOptions;
      const token = (tokens.data as { access_token: string }).access_token;
      const userInfo = await getUserInfo(token);
      // Find or create the user in the database
        let user = await db.users.findFirst({
            where: { email: userInfo.email },
        });
        if (!user) {
            user = await db.users.create({
                data: {
                    id: v4(),
                    email: userInfo.email,
                    username: userInfo.name,
                    auth_type: "google",
                },
            });
        }
        return user;
    }
  ),
  "google"
);

export const authRoute = async ({ request }: LoaderFunctionArgs | ActionFunctionArgs) => {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const sessionId = session.get(`${process.env.SESSION_COOKIE_NAME}`);
  if (!sessionId) {
    throw redirect("/login");
  }

  // Fetch user data
  const userSession = await db.session.findFirst({
    where: { token: sessionId },
    include: { Users: true },
  });
  if (!userSession) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }

  return userSession;
};
