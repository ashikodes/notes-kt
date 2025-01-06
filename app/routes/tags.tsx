import { Outlet, useLocation, useParams } from "@remix-run/react";
import PageHeader from "~/components/PageHeader";
import Sidebar from "~/components/Sidebar";
import pageheaderscss from "~/styles/page-header.scss?url";
import sidebarscss from "~/styles/sidebar.scss?url";
import notescss from "~/styles/notes.scss?url";
import appscss from "~/styles/app.scss?url";
import bottomnavscss from "~/styles/bottom-nav.scss?url";
import toastscss from "~/styles/toast.scss?url";
import tagsscss from "~/styles/tags.scss?url";
import { LinksFunction } from "@remix-run/node";
import BottomNav from "~/components/BottomNav";
import { AppStateContext, initialState } from "~/app.context";
import { useState } from "react";
import Toast from "~/components/Modal/Toast";
import Modal from "~/components/Modal/Modal";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appscss },
  { rel: "stylesheet", href: pageheaderscss },
  { rel: "stylesheet", href: sidebarscss },
  { rel: "stylesheet", href: notescss },
  { rel: "stylesheet", href: bottomnavscss },
  { rel: "stylesheet", href: tagsscss },
  { rel: "stylesheet", href: toastscss },
];

export default function Tags() {
  const [appState, setAppState] = useState(initialState);
  const params = useParams();
  const location = useLocation();
  const tagName = params.tagName;
  const url = location.pathname;
  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      <div className={`notes-container`}>
        <Sidebar />
        <div className="notes-container-content">
          <PageHeader title="Tags" search="" url={url} />
          <div className="content-body">
            <Outlet />
          </div>
        </div>
        <BottomNav />
        <Toast />
        <Modal />
      </div>
    </AppStateContext.Provider>
  );
}
