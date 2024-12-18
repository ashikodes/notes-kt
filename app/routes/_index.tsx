import { LinksFunction, LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";
import type { Session, Users } from "@prisma/client";
import styles from "~/styles/app.scss?url";
import { db } from "~/db.server";
import { useLoaderData, json } from "@remix-run/react";


type LoaderData = {
  userSession: Session & { Users: Users };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Notes KT" },
    { name: "description", content: "Welcome to Notes taking!" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);

  // Check if the user is logged in
  const sessionId = session.get(`${process.env.SESSION_COOKIE_NAME}`);
  if (!sessionId) {
    return redirect("/login");
  }

  // Fetch user data
  const userSession = await db.session.findFirst({
    where: { token: sessionId },
    include: { Users: true },
  });

  if (!userSession) {
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  
  }
  return json({ userSession });
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export default function Index() {
  const { userSession } = useLoaderData<LoaderData>();
  return (
    <div>
      <h1>Welcome to Notes</h1>
      <p>{userSession.Users.email}</p>
    </div>
  );
}
