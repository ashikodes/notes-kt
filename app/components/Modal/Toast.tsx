import { Link } from "@remix-run/react";
import { useContext } from "react";
import { AppStateContext } from "~/app.context";
import checkCircle from "~/assets/svg/check-circle.svg";
import closeIcon from "~/assets/svg/close.svg";

const toastConfig = {
    archived: {
        text: "Note archived.",
        link: "archived",
    },
    saved: {
        text: "Note saved.",
        link: "",
    },
    deleted: {
        text: "Note deleted.",
        link: "",
    },
    updated: {
        text: "Note updated.",
        link: "",
    },
    restored: {
        text: "Note restored to active notes.",
        link: "restored",
    },
}

export default function Toast() {
    const { appState, setAppState } = useContext(AppStateContext);
    const { toast } = appState;
    if (!toast) return null;
    const { text, link } = toastConfig[toast];
    const closeToast = () => setAppState((state) => ({ ...state, toast: "" }));
    return (
        <div className="note-toast">
            <img src={checkCircle} alt="Check Circle" />
            <span className="toast-text">{text}</span>
            {link === "archived" && <Link to="/notes/archived" className="toast-link">Archived Notes</Link>}
            {link === "restored" && <Link to="/notes" className="toast-link">All Notes</Link>}
            <img onClick={closeToast} src={closeIcon} alt="Close" /> 
        </div>
    );
}