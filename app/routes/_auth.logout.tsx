import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";

export const loader = async () => {
    const session = await getSession();
    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
};