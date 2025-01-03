import { json, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { randomUUID } from "node:crypto";
import { useContext, useEffect } from "react";
import { AppContextType, AppStateContext } from "~/app.context";
import NoteForm from "~/components/NoteForm";
import { db } from "~/db.server";
import noteformscss from "~/styles/note-form.scss?url";
import archive from "~/assets/svg/archived.svg";
import thrash from "~/assets/svg/thrash.svg";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: noteformscss },
];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const noteId = params.noteId;
  const note = await db.notes.findUnique({
    where: { id: noteId },
    include: { Tags: true },
  });
  return json({ note });
};

export const action = async ({ request, params }: LoaderFunctionArgs) => {
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
    return json({ note: updatedNote });
  } catch (error) {
    return json({ error: error }, { status: 500 });
  }
};

export default function Note() {
  const { note } = useLoaderData<typeof loader>();
  const { setAppState } = useContext(AppStateContext);
  useEffect(() => {
    setAppState((prevState) => ({
      ...prevState,
      note: note as AppContextType["appState"]["note"],
    }));
  }, [note]);
  return (
    <>
      <NoteForm />
      <div className="note-sidebar">
        <button className="note-sidebar-btn">
          <img src={archive} alt="Archive" />
          Archive Note
        </button>
        <button className="note-sidebar-btn">
          <img src={thrash} alt="Delete" />  
          Delete Note
        </button>
      </div>
    </>
  );
}
