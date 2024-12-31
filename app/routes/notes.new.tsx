import { Form } from "@remix-run/react";
import ReactMarkdown from "react-markdown";
import tag from "~/assets/svg/tags.svg";
import clock from "~/assets/svg/clock.svg";
import { useContext, useState } from "react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { db } from "~/db.server";
import { randomUUID } from "node:crypto";
import { AppStateContext } from "~/app.context";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  const user_id = body.get("user_id");
  const title = body.get("title");
  const content = body.get("content");
  const tags = body.get("tags");
  if (!title || !content || !tags) {
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
          user_id: user_id as string,
          title: title as string,
          content: content as string,
          created_at: new Date().toISOString(),
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
        where: { id: newNote.id },
        data: {
          Tags: {
            connect: tagRecords.map((tag) => ({ id: tag.id })),
          },
        },
      });

      return newNote;
    });

    return redirect(`/notes/${newNote.id}`);
  } catch (error) {
    console.error("Error creating note:", error);
    return { error: "Failed to create note. Please try again." };
  }
};

export default function NewNote() {
  const [markdown, setMarkdown] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const { appState } = useContext(AppStateContext);
  return (
    <>
      <div className="note-form-container">
        <Form method="post" className="note-form">
          <input type="hidden" value={appState.user_id} name="user_id" />
          <input
            type="text"
            className="note-title"
            name="title"
            placeholder="Enter a title..."
            required
          />
          <div className="note-properties">
            <div className="note-prop">
              <div className="tag-label-icon">
                <img className="tag-icon" src={tag} alt="Tag" />
                <span className="tag-label">Tags</span>
              </div>
              <input
                className="tag-input"
                name="tags"
                placeholder="Add tags separated by commas (e.g. Work, Planning)"
                required
              />
            </div>
            <div className="note-prop">
              <div className="tag-label-icon">
                <img className="tag-icon" src={clock} alt="Tag" />
                <span className="tag-label">Last edited</span>
              </div>
              <span className="prop-value">Not yet saved</span>
            </div>
          </div>
          <div className="divider" />
          {preview ? (
            <div className="note-content">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="note-content"
              name="content"
              placeholder="Write your markdown here..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              required
            />
          )}
          <div className="divider" />
          <div className="form-footer">
            <button type="submit" className="form-btn primary">
              Save Note
            </button>
            <button type="button" className="form-btn secondary">
              Cancel
            </button>
            <button
              onClick={() => setPreview(!preview)}
              type="button"
              className="form-btn alternate"
            >
              {markdown && !preview ? "Preview" : ""}
              {preview && markdown ? "Edit" : ""}
            </button>
          </div>
        </Form>
      </div>
      <div className="note-sidebar"></div>
    </>
  );
}
