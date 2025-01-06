import {
  json,
  LinksFunction,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { randomUUID } from "node:crypto";
import { act, useContext, useEffect, useState } from "react";
import { AppContextType, AppStateContext } from "~/app.context";
import NoteForm from "~/components/NoteForm";
import { db } from "~/db.server";
import noteformscss from "~/styles/note-form.scss?url";
import modalscss from "~/styles/modal.scss?url";
import toastscss from "~/styles/toast.scss?url";
import thrash from "~/assets/svg/thrash.svg";
import refreshLeft from "~/assets/svg/refresh-left.svg";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: noteformscss },
  { rel: "stylesheet", href: modalscss },
  { rel: "stylesheet", href: toastscss },
];

export const loader = async ({
  params,
}: LoaderFunctionArgs): Promise<Response> => {
  const noteId = params.noteId;
  try {
    const note = await db.notes.findUnique({
      where: { id: noteId, archived: true },
      include: { Tags: true },
    });
    if (!note) {
      return redirect("/notes/archived");
    }
    return json({ note });
  } catch (error) {
    return json({ error: error, status: 500 });
  }
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
  if (request.method === "DELETE") {
    // delete the note
    const noteId = params.noteId;
    try {
      const note = await db.notes.delete({
        where: { id: noteId as string },
      });
      return json({ note, actionDone: "deleted" });
    } catch (error) {
      return json({ error: error, status: 500 });
    }
  }
  if (request.method === "PATCH") {
    // restore the note
    const noteId = params.noteId;
    try {
      const note = await db.notes.update({
        where: { id: noteId as string },
        data: {
          archived: null,
        },
      });
      return json({ note, actionDone: "restored" });
    } catch (error) {
      return json({ error: error, status: 500 });
    }
  }
  const body = await request.formData();
  const noteId = params.noteId;
  const title = body.get("title");
  const content = body.get("content");
  const tags = body.get("tags") || "";
  if (!title || !content) {
    return { error: "Title, content, and tags are required." };
  }

  const tagNames = tags
    .toString()
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag);

  try {
    // Start a transaction to handle note and tags creation
    const updatedNote = await db.$transaction(async (tx) => {
      const updatedNote = await tx.notes.update({
        where: { id: noteId as string },
        data: {
          title: title as string,
          content: content as string,
          updated_at: new Date().toISOString(),
        },
      });

      // Step 2: Find or create tags and associate them with the note
      const tagRecords = await Promise.all(
        tagNames.map(async (tagName) => {
          return await tx.tag.upsert({
            where: { name: tagName },
            update: {},
            create: {
              id: randomUUID(),
              name: tagName,
            },
          });
        })
      );

      // Step 3: Connect tags to the note
      await tx.notes.update({
        where: { id: updatedNote.id },
        data: {
          Tags: {
            set: tagRecords.map((tag) => ({ id: tag.id })),
          },
        },
      });

      return updatedNote;
    });
    return json({ note: updatedNote, actionDone: "updated" });
  } catch (error) {
    return json({ error: error, status: 500 });
  }
};

export default function Note() {
  const [searchParams, setSearchParams] = useSearchParams();
  const loaderToast = searchParams.get(
    "toast"
  ) as AppContextType["appState"]["toast"];

  const { note } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const actionDone = (
    actionData && "actionDone" in actionData ? actionData.actionDone : ""
  ) as AppContextType["appState"]["toast"];
  const { setAppState } = useContext(AppStateContext);
  useEffect(() => {
    setAppState((prevState) => ({
      ...prevState,
      note: note as AppContextType["appState"]["note"],
    }));
  }, [note]);

  useEffect(() => {
    const toastAction = actionDone || loaderToast;
    setAppState((prevState) => ({
      ...prevState,
      modal: "",
      toast: toastAction ? toastAction : "",
    }));
    if (toastAction) {
      setTimeout(() => {
        setAppState((prevState) => ({
          ...prevState,
          toast: "",
        }));
        if (loaderToast) {
          setSearchParams({});
        }
      }, 3000);
    }
  }, [actionData, loaderToast]);

  const showModal = (modal: "archive" | "delete") => {
    setAppState((prevState) => ({
      ...prevState,
      modal,
    }));
  };

  return (
    <>
      <NoteForm />
      <div className="note-sidebar">
        <Form method="patch" className="w-full">
          <button className="note-sidebar-btn">
            <img src={refreshLeft} alt="Restore" />
            Restore Note
          </button>
        </Form>
        <button
          onClick={() => showModal("delete")}
          className="note-sidebar-btn"
        >
          <img src={thrash} alt="Delete" />
          Delete Note
        </button>
      </div>
    </>
  );
}
