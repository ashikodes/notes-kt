import { json, LinksFunction, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import PageHeader from "~/components/PageHeader";
import { db } from "~/db.server";
import pageheaderscss from "~/styles/page-header.scss?url";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: pageheaderscss },
];

export const loader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const notes = await db.notes.findMany({
        where: {
            title: {
                contains: search,
            },
        },
    });
    return json({ notes, search });
}

export default function AllNotes() {
    const { notes, search } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const searching =
        navigation.location &&
        new URLSearchParams(navigation.location.search).has(
            "search"
        );
    return (
        <div className="notes-container-content">
            <PageHeader title="All Notes" search={search} searching={searching} />
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
            <div
                aria-hidden
                hidden={!searching}
                id="search-spinner"
            />
        </div>
    );
}