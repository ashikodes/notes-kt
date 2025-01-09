import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { authenticator } from "~/auth.server";
import { randomBytes } from "crypto";
import { db } from "~/db.server";
import { Prisma } from "@prisma/client";
import { commitSession, getSession } from "~/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  let user = (await authenticator.authenticate(
    "google",
    request
  )) as Prisma.UsersCreateInput;
  if (!user) {
    return redirect("/login?error=google");
  }
  // Create a session
  const sessionToken = randomBytes(64).toString("hex");
  const sessionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
  const sessionData = await db.session.create({
    data: {
      token: sessionToken,
      user_id: user.id,
      expires_at: sessionExpiry,
    },
  });

  if (!sessionData) {
    return redirect("/login?error=internal");
  }

  // Create session state
  const session = await getSession();

  session.set(`${process.env.SESSION_COOKIE_NAME}`, sessionData.token);

  // Commit the session to a cookie
  const cookie = await commitSession(session);

  // Redirect to a protected page
  return redirect("/", {
    headers: {
      "Set-Cookie": cookie, // Send the session cookie
    },
  });
}
