import { LinksFunction, LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";
import type { Session, Users } from "@prisma/client";
import appscss from "~/styles/app.scss?url";
import notesscss from "~/styles/notes.scss?url";
import sidebarscss from "~/styles/sidebar.scss?url";
import pageheaderscss from "~/styles/page-header.scss?url";
import bottomnavscss from "~/styles/bottom-nav.scss?url";
import { db } from "~/db.server";
import { useLoaderData, json, Outlet } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import PageHeader from "~/components/PageHeader";
import BottomNav from "~/components/BottomNav";
import plus from "~/assets/svg/plus.svg";


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
  { rel: "stylesheet", href: appscss },
  { rel: "stylesheet", href: notesscss },
  { rel: "stylesheet", href: sidebarscss },
  { rel: "stylesheet", href: pageheaderscss },
  { rel: "stylesheet", href: bottomnavscss },
];

export default function Index() {
  const { userSession } = useLoaderData<LoaderData>();
  return (
    <div className="notes-container">
      <Sidebar />
      <Outlet />
      <BottomNav />
      <div className="floating-create">
        <button className="floating-btn"><img src={plus} alt="Plus" /></button>
      </div>
    </div>
  );
}
