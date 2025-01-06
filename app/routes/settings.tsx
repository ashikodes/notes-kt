import { LinksFunction, type MetaFunction } from "@remix-run/node";
import appscss from "~/styles/app.scss?url";
import notesscss from "~/styles/notes.scss?url";
import sidebarscss from "~/styles/sidebar.scss?url";
import pageheaderscss from "~/styles/page-header.scss?url";
import bottomnavscss from "~/styles/bottom-nav.scss?url";
import settingsscss from "~/styles/settings.scss?url";
import toastscss from "~/styles/toast.scss?url";
import { Outlet, useNavigation, useLocation, Form } from "@remix-run/react";
import Sidebar from "~/components/Sidebar";
import PageHeader from "~/components/PageHeader";
import BottomNav from "~/components/BottomNav";
import React, { useState } from "react";
import { AppStateContext, initialState } from "~/app.context";
import Modal from "~/components/Modal/Modal";
import Toast from "~/components/Modal/Toast";
import sun from "~/assets/svg/sun.svg";
import chevronRight from "~/assets/svg/chevron-right.svg";
import fontType from "~/assets/svg/font-type.svg";
import lock from "~/assets/svg/lock.svg";
import logout from "~/assets/svg/logout.svg";

export const meta: MetaFunction = () => {
  return [
    { title: "Notes KT" },
    { name: "description", content: "Welcome to Notes taking!" },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appscss },
  { rel: "stylesheet", href: notesscss },
  { rel: "stylesheet", href: sidebarscss },
  { rel: "stylesheet", href: pageheaderscss },
  { rel: "stylesheet", href: bottomnavscss },
  { rel: "stylesheet", href: toastscss },
  { rel: "stylesheet", href: settingsscss },
];

export default function Index() {
  const navigation = useNavigation();
  const location = useLocation();
  const [appState, setAppState] = useState(initialState);

  const url = location.pathname;
  const isLoading = navigation.state === "loading" ? "loading" : "";

  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      <div className={`notes-container settings-container ${isLoading}`}>
        <Sidebar />
        <div className="notes-container-content">
          <PageHeader title="Settings" search="" url={url} />
          <div className="content-body">
            <div className="content-sidebar flex">
              <div className="menu-item">
                <img src={sun} alt="sun" />
                <span className="menu-text">Color Theme</span>
                <img
                  src={chevronRight}
                  className="chevron"
                  alt="Chevron Right"
                />
              </div>
              <div className="menu-item">
                <img src={fontType} alt="sun" />
                <span className="menu-text">Font Theme</span>
                <img
                  src={chevronRight}
                  className="chevron"
                  alt="Chevron Right"
                />
              </div>
              <div className="menu-item">
                <img src={lock} alt="sun" />
                <span className="menu-text">Change Password</span>
                <img
                  src={chevronRight}
                  className="chevron"
                  alt="Chevron Right"
                />
              </div>
              <div className="divider" />
              <Form action="/logout">
                <button type="submit" className="menu-item">
                  <img src={logout} alt="sun" />
                  <span className="menu-text">Logout</span>
                  <img
                    src={chevronRight}
                    className="chevron"
                    alt="Chevron Right"
                  />
                </button>
              </Form>
            </div>
            <div className="main-content">
              <Outlet />
            </div>
          </div>
        </div>
        <BottomNav />
        <Modal />
        <Toast />
      </div>
    </AppStateContext.Provider>
  );
}
