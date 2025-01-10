import { Form, Link, useLocation, useParams } from "@remix-run/react";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AppContextType, AppStateContext } from "~/app.context";
import tagIcon from "~/assets/svg/tag.svg";
import clock from "~/assets/svg/clock.svg";
import archiveIcon from "~/assets/svg/archived.svg";
import deleteIcon from "~/assets/svg/thrash.svg";
import chevronLeft from "~/assets/svg/chevron-left.svg";
import refreshLeft from "~/assets/svg/refresh-left.svg";
import loading from "~/assets/svg/loading.svg";

export default function NoteForm() {
  const location = useLocation();
  const params = useParams();
  const [markdown, setMarkdown] = useState<string>("");
  const [preview, setPreview] = useState<boolean>(false);
  const [details, setDetails] = useState<AppContextType["appState"]["note"]>();
  const { appState, setAppState } = useContext(AppStateContext);
  const isArchived = location.pathname.includes("/notes/archived");
  const tagName = params.tagName;
  let cancelUrl = isArchived ? "/notes/archived" : "/notes";
  if (tagName) cancelUrl = `/tags/${tagName}`;
  
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
          to={cancelUrl}
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
          {details?.archived ? (
            <Form method={tagName ? "put" : "patch"} className="restore-btn-form">
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
            to={cancelUrl}
            className="form-header-btn cancel"
          >
            Cancel
          </Link>
          <button
            onClick={() => {
              // programmatically submit the form with id note-form
              document.getElementById("form-submit")?.click();
            }}
            type="button"
            className="form-header-btn save"
          >
            Save Note
          </button>
        </div>
      </div>
      <Form method="post" id="note-form" className="note-form">
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
              <img className="tag-icon" src={tagIcon} alt="Tag" />
              <span className="tag-label">Tags</span>
            </div>
            <input
              className="tag-input"
              name="tags"
              defaultValue={details?.Tags?.map((tag) => tag.name).join(", ")}
              placeholder="Add tags separated by commas (e.g. Work, Planning)"
            />
          </div>
          {details?.archived && (
            <div className="note-prop">
              <div className="tag-label-icon">
                <img className="tag-icon" src={loading} alt="status" />
                <span className="tag-label">Status</span>
              </div>
              <span className="prop-value">Archived</span>
            </div>
          )}
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
          placeholder="Start typing your note here…"
          defaultValue={details?.content ?? ""}
          onChange={(e) => setMarkdown(e.target.value)}
          required
        />
        <div className="form-footer">
          <div className="divider" />
          <div className="form-action-footer">
            <button id="form-submit" type="submit" className="form-btn primary">
              Save Note
            </button>
            <Link
              to={cancelUrl}
              className="form-btn secondary"
            >
              Cancel
            </Link>
          </div>
        </div>
      </Form>
    </div>
  );
}
