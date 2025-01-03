import {
  LinksFunction,
  LoaderFunctionArgs,
  redirect,
  type MetaFunction,
} from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";
import appscss from "~/styles/app.scss?url";
import notesscss from "~/styles/notes.scss?url";
import sidebarscss from "~/styles/sidebar.scss?url";
import pageheaderscss from "~/styles/page-header.scss?url";
import bottomnavscss from "~/styles/bottom-nav.scss?url";
import { db } from "~/db.server";
import {
  useLoaderData,
  json,
  Outlet,
  Link,
  useSearchParams,
  NavLink,
} from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import PageHeader from "~/components/PageHeader";
import BottomNav from "~/components/BottomNav";
import React, { useEffect, useState } from "react";
import { AppStateContext, initialState } from "~/app.context";
import ArchiveModal from "~/components/Modal/ArchiveModal";

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

  // fetch all notes
  const url = new URL(request.url);
  const isArchived = url.pathname === "/notes/archived" ? true : null;
  const search = url.searchParams.get("search") || "";
  const notes = await db.notes.findMany({
    where: {
      title: {
        contains: search,
      },
      archived: isArchived,
    },
    include: {
      Tags: true,
    },
    orderBy: {
      updated_at: "desc",
    },
  });
  return json({
    notes,
    search,
    url: url.pathname,
    user_id: userSession.user_id,
  });
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appscss },
  { rel: "stylesheet", href: notesscss },
  { rel: "stylesheet", href: sidebarscss },
  { rel: "stylesheet", href: pageheaderscss },
  { rel: "stylesheet", href: bottomnavscss },
];

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { notes, search, url, user_id } = useLoaderData<typeof loader>();
  const [appState, setAppState] = useState(initialState);

  const isHome = url === "/notes";
  const isNewNote = url === "/notes/new";
  const isArchived = url === "/notes/archived";
  const isSearch = searchParams.has("search");

  useEffect(() => {
    setAppState((prevState) => ({
      ...prevState,
      user_id,
    }));
  }, [user_id]);

  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      <div className="notes-container">
        <Sidebar />
        <div className="notes-container-content">
          <PageHeader title="All Notes" search={search} url={url} />
          <div className="content-body">
            <div className="content-sidebar">
              <Link to="/notes/new" className="create-note-btn">
                + Create New Note
              </Link>

              {isArchived && !isSearch && (
                <div className="archived-label mb-4">
                  All your archived notes are stored here. You can restore or
                  delete them anytime.
                </div>
              )}

              {/* If no notes */}
              {search ? (
                <div className="flex flex-col">
                  <span className="block lg:hidden search-note mb-4">
                    {isArchived ? "Archived" : "All"} notes matching "{search}"
                    are displayed below.
                  </span>
                  {!notes.length && (isHome || isArchived) && (
                    <div className="empty-state">
                      No notes match your search. Try a different keyword or
                      create a new note.
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {!notes.length && isHome && (
                    <div className="empty-state">
                      You don't have any notes yet. Start a new note to capture
                      your thoughts and ideas.
                    </div>
                  )}
                  {!notes.length && isArchived && (
                    <div className="empty-state">
                      No notes have been archived yet. Move notes here for
                      safekeeping, or create a new note.
                    </div>
                  )}
                </>
              )}
              <div
                className={`note-list-container ${isHome ? "home" : "other"}`}
              >
                {isNewNote && (
                  <div className="untitled-note">Untitled Note</div>
                )}
                {notes.map((note, idx) => (
                  <React.Fragment key={note.id}>
                    {idx != 0 && <div className="divider" />}
                    <NavLink
                      to={`/notes/${note.id}${
                        isSearch ? "?search=" + search : ""
                      }`}
                      className="note-list"
                    >
                      <div className="list-title">{note.title}</div>
                      <div className="tag-list">
                        {note.Tags.map((tag) => (
                          <span key={tag.id} className="tag">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="list-date">
                        {new Intl.DateTimeFormat("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          timeZone: "UTC",
                        }).format(new Date(`${note.updated_at}`))}
                      </div>
                    </NavLink>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="main-content">
              <Outlet />
            </div>
          </div>
        </div>
        <BottomNav />
        {appState.modal === "archive" && <ArchiveModal />}
      </div>
    </AppStateContext.Provider>
  );
}
