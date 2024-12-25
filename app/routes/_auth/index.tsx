import { LinksFunction, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

import authscss from "~/styles/auth.scss?url";
import appscss from "~/styles/app.scss?url";


export const meta: MetaFunction = () => {
    return [
        { title: "Notes KT" },
        { name: "description", content: "Welcome to Notes taking!" },
    ];
};
export const links: LinksFunction = () => [
    { rel: "stylesheet", href: appscss },
    { rel: "stylesheet", href: authscss },
];

export default function Auth() {
    return (
        <div className="auth-container"><Outlet /></div>
    );
}