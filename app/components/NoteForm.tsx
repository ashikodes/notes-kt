import { Form } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AppContextType, AppStateContext } from "~/app.context";
import tag from "~/assets/svg/tags.svg";
import clock from "~/assets/svg/clock.svg";
import { Prisma } from "@prisma/client";

export default function NoteForm() {
  const [markdown, setMarkdown] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const [details, setDetails] = useState<AppContextType["appState"]["note"]>();
  const { appState } = useContext(AppStateContext);

  useEffect(() => {
    setDetails(appState.note);
    setMarkdown(appState.note.content ?? "");
  }, [appState.note]);
  return (
    <div className="note-form-container">
      <Form method="post" className="note-form">
        <input type="hidden" value={appState.user_id} name="user_id" />
        <input
          type="text"
          className="note-title"
          name="title"
          defaultValue={details?.title ?? ""}
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
              defaultValue={details?.Tags?.map((tag) => tag.name).join(", ")}
              placeholder="Add tags separated by commas (e.g. Work, Planning)"
            />
          </div>
          <div className="note-prop">
            <div className="tag-label-icon">
              <img className="tag-icon" src={clock} alt="Tag" />
              <span className="tag-label">Last edited</span>
            </div>
            <span className="prop-value">
              {details?.updated_at
                ? new Intl.DateTimeFormat("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  }).format(new Date(`${details.updated_at}`))
                : "Not yet saved"}
            </span>
          </div>
        </div>
        <div className="divider" />
        {preview && (
          <div className="note-content">
            <ReactMarkdown>{markdown}</ReactMarkdown>
          </div>
        )}
        <textarea
          className={`note-content ${preview ? "hidden" : ""}`}
          name="content"
          placeholder="Write your markdown here..."
          defaultValue={details?.content ?? ""}
          onChange={(e) => setMarkdown(e.target.value)}
          required
        />

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
  );
}
