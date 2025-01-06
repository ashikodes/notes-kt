import { Form, useLocation, useParams } from "@remix-run/react";
import { useContext } from "react";
import { AppStateContext } from "~/app.context";
import archive from "~/assets/svg/archived.svg";
import deleteIcon from "~/assets/svg/thrash.svg";

const modalConfig = {
  archive: {
    title: "Archive Note",
    sub: "Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime.",
    primary: "Archive Note",
    imgSrc: archive,
    method: "patch" as "patch" | "delete",
  },
  delete: {
    title: "Delete Note",
    sub: "Are you sure you want to permanently delete this note? This action cannot be undone.",
    primary: "Delete Note",
    imgSrc: deleteIcon,
    method: "delete" as "patch" | "delete",
  },
};

export default function Modal() {
  const params = useParams();
  const location = useLocation();
  const { appState, setAppState } = useContext(AppStateContext);
  const { modal } = appState;
  if (!modal) return null;
  const url = location.pathname;
  const isArchivedUrl = url.includes("/notes/archived");

  const noteId = params.noteId;
  const tagName = params.tagName;
  let actionUrl = `/notes/${noteId}`;
  if (tagName) actionUrl = `/tags/${tagName}/${noteId}`;
  const { title, sub, primary, imgSrc, method } = modalConfig[modal];
  const closeModal = () => setAppState((state) => ({ ...state, modal: "" }));
  return (
    <>
      <div className="note-modal archive" />
      <div className="modal-overlay" onClick={(e) => {
        // Close modal if clicked outside the modal
        if (e.target === e.currentTarget) closeModal();
      }}>
        <div className="modal-content">
          <div className="content-top">
            <div className="content-icon">
              <img src={imgSrc} alt="ModalIcon" />
            </div>
            <div className="content-title-sub">
              <h3 className="content-title">{title}</h3>
              <p className="content-sub">{sub}</p>
            </div>
          </div>
          <div className="divider" />
          <div className="content-bottom">
            <button onClick={closeModal} className="modal-btn secondary">Cancel</button>
            <Form action={actionUrl} method={method}>
              <button className={`modal-btn primary ${method}`}>{primary}</button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
