import { ActionFunctionArgs, LinksFunction, redirect } from "@remix-run/node";
import { db } from "~/db.server";
import { randomUUID } from "node:crypto";
import NoteForm from "~/components/NoteForm";
import noteformscss from "~/styles/note-form.scss?url";
import { useContext, useEffect } from "react";
import { AppContextType, AppStateContext } from "~/app.context";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  const user_id = body.get("user_id");
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
    const newNote = await db.$transaction(async (tx) => {
      const newNote = await tx.notes.create({
        data: {
          id: randomUUID(),
          title: title as string,
          content: content as string,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          Users: {
            connect: { id: user_id as string },
          },
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
        where: { id: newNote.id },
        data: {
          Tags: {
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
        },
      });

      return newNote;
    });

    return redirect(`/notes/${newNote.id}?toast=saved`);
  } catch (error) {
    console.error("Error creating note:", error);
    return { error: "Failed to create note. Please try again." };
  }
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: noteformscss },
]

export default function NewNote() {
  const { setAppState } = useContext(AppStateContext);
  useEffect(() => {
    setAppState((prevState) => ({
      ...prevState,
      note: {} as AppContextType['appState']['note'],
    }));
  }, []);
  return (
    <>
      <NoteForm />
      <div className="note-sidebar" />
    </>
  );
}
