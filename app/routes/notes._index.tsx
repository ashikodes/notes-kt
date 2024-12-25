import { LinksFunction } from "@remix-run/node";
import PageHeader from "~/components/PageHeader";
import pageheaderscss from "~/styles/page-header.scss?url";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: pageheaderscss },
];

export default function AllNotes() {
    return (
        <div className="notes-container-content">
            <PageHeader title="All Notes" />
            <div className="content-body">
                <div className="content-sidebar">
                    <button className="create-note-btn">+ Create New Note</button>
                
                    {/* If no notes */}
                    <div className="empty-state">
                        You don't have any notes yet. Start a new note to capture 
                        your thoughts and ideas.
                    </div>
                </div>
                <div className="main-content">

                </div>
            </div>
        </div>
    );
}