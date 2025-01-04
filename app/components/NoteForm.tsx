import { Form, Link, useLocation } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AppContextType, AppStateContext } from "~/app.context";
import tag from "~/assets/svg/tags.svg";
import clock from "~/assets/svg/clock.svg";
import archiveIcon from "~/assets/svg/archived.svg";
import deleteIcon from "~/assets/svg/thrash.svg";
import chevronLeft from "~/assets/svg/chevron-left.svg";
import refreshLeft from "~/assets/svg/refresh-left.svg";

export default function NoteForm() {
  const location = useLocation();
  const [markdown, setMarkdown] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const [details, setDetails] = useState<AppContextType["appState"]["note"]>();
  const { appState, setAppState } = useContext(AppStateContext);
  const isArchived = location.pathname.includes("/notes/archived");
  useEffect(() => {
    setDetails(appState.note);
    setMarkdown(appState.note.content ?? "");
  }, [appState.note]);

  const showModal = (modal: "archive" | "delete") => {
    setAppState((prevState) => ({
      ...prevState,
      modal,
    }));
  };
  return (
    <div className="note-form-container">
      <div className="form-header">
        <Link
          to={isArchived ? "/notes/archived" : "/notes"}
          className="back-btn"
        >
          <img src={chevronLeft} alt="Back" />
          Back
        </Link>
        <div className="right-control">
          <img
            onClick={() => showModal("delete")}
            src={deleteIcon}
            alt="Delete"
          />
          {isArchived ? (
            <Form method="patch" className="restore-btn-form">
              <button type="submit" className="restore-btn">
                <img src={refreshLeft} alt="Restore" />
              </button>
            </Form>
          ) : (
            <img
              onClick={() => showModal("archive")}
              src={archiveIcon}
              alt="Archive"
            />
          )}
          <Link
            to={isArchived ? "/notes/archived" : "/notes"}
            className="form-header-btn cancel"
          >
            Cancel
          </Link>
          <button type="submit" className="form-header-btn save">
            Save Note
          </button>
        </div>
      </div>
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
        <button
          onClick={() => setPreview(!preview)}
          type="button"
          className="form-header-btn preview"
        >
          {markdown && !preview ? "Preview" : ""}
          {preview && markdown ? "Edit" : ""}
        </button>
        <div className="divider preview" />
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
        <div className="form-footer">
          <div className="divider" />
          <div className="form-action-footer">
            <button type="submit" className="form-btn primary">
              Save Note
            </button>
            <Link
              to={isArchived ? "/notes/archived" : "/notes"}
              className="form-btn secondary"
            >
              Cancel
            </Link>
            <button
              onClick={() => setPreview(!preview)}
              type="button"
              className="form-btn alternate"
            >
              {markdown && !preview ? "Preview" : ""}
              {preview && markdown ? "Edit" : ""}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
