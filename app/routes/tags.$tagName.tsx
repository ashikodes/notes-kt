import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useActionData,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import React, { useContext, useEffect } from "react";
import { AppStateContext } from "~/app.context";
import { authRoute } from "~/auth.server";
import { db } from "~/db.server";

export const loader = async (args: LoaderFunctionArgs) => {
  await authRoute(args);
  const { params } = args;
  const tagName = params.tagName;
  const allNotes = await db.notes.findMany({
    where: {
      Tags: {
        some: {
          name: tagName,
        },
      },
    },
    include: {
      Tags: true,
    },
  });

  if (!allNotes.length) {
    // check if the tag exists
    const tagExists = await db.tag.findFirst({
      where: {
        name: tagName,
      },
    });
    if (tagExists) {
      return json({ allNotes: [] });
    } else {
      return redirect("/tags");
    }
  }

  return json({ allNotes });
};

export const action = async (args: ActionFunctionArgs) => {
  const { request, params } = args;
  await authRoute(args);
  if (request.method === "DELETE") {
    const tagName = params.tagName;
    try {
      await db.tag.delete({
        where: {
          name: tagName,
        },
      });
      return json({ deleted: true });
    } catch (error) {
      return json({ deleted: false });
    }
  }
};

export default function TagDetails() {
  const params = useParams();
  const noteId = params.noteId;
  const { setAppState } = useContext(AppStateContext);
  const { allNotes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const tagName = params.tagName;

  useEffect(() => {
    if (actionData?.deleted) {
      setAppState((prev) => ({
        ...prev,
        toast: "tag_deleted",
      }));
    }

    if (actionData?.deleted) {
      setTimeout(() => {
        setAppState((prev) => ({
          ...prev,
          toast: "",
        }));
      }, 3000);
    }
  }, [actionData]);

  return (
    <>
      <div className={`content-sidebar ${noteId ? "hidden lg:flex" : "flex"}`}>
        <Link to="/notes/new" className="create-note-btn">
          + Create New Note
        </Link>
        <span className="tag-search-label">
          All notes with the "{tagName}" tag are shown here.
        </span>
        <div className="note-list-container">
          {!allNotes.length && (
            <Form method="delete" className="empty-search">
              We couldn't find any notes with the "{tagName}" tag. You can{" "}
              <button type="submit" className="text-link">
                delete
              </button>{" "}
              the tag
            </Form>
          )}
          {allNotes.map((note, idx) => (
            <React.Fragment key={note.id}>
              {idx != 0 && <div className="divider" />}
              <NavLink to={`/tags/${tagName}/${note.id}`} className="note-list">
                <div className="list-title">{note.title}</div>
                <div className="tag-list">
                  {note.Tags.map((tag) => (
                    <span key={tag.id} className="tag">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="list-date">
                  {new Date(note.updated_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </NavLink>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}
