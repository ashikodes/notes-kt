import archive from "~/assets/svg/archived.svg";

export default function Modal() {
  return (
    <>
      <div className="note-modal archive" />
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="content-top">
            <div className="content-icon">
              <img src={archive} alt="Archive" />
            </div>
            <div className="content-title-sub">
              <h3 className="content-title">Archive Note</h3>
              <p className="content-sub">
                Are you sure you want to archive this note? You can find it in
                the Archived Notes section and restore it anytime.
              </p>
            </div>
          </div>
          <div className="divider" />
          <div className="content-bottom">
            <button className="modal-btn secondary">Cancel</button>
            <button className="modal-btn primary">Archive Note</button>
          </div>
        </div>
      </div>
    </>
  );
}
