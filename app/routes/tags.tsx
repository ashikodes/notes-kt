import { Link, Outlet, useLocation, useParams } from "@remix-run/react";
import PageHeader from "~/components/PageHeader";
import Sidebar from "~/components/Sidebar";
import chevronLeft from "~/assets/svg/chevron-left.svg";
import pageheaderscss from "~/styles/page-header.scss?url";
import sidebarscss from "~/styles/sidebar.scss?url";
import notescss from "~/styles/notes.scss?url";
import appscss from "~/styles/app.scss?url";
import bottomnavscss from "~/styles/bottom-nav.scss?url";
import toastscss from "~/styles/toast.scss?url";
import tagsscss from "~/styles/tags.scss?url";
import { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import BottomNav from "~/components/BottomNav";
import Toast from "~/components/Modal/Toast";
import Modal from "~/components/Modal/Modal";
import { authRoute } from "~/auth.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appscss },
  { rel: "stylesheet", href: pageheaderscss },
  { rel: "stylesheet", href: sidebarscss },
  { rel: "stylesheet", href: notescss },
  { rel: "stylesheet", href: bottomnavscss },
  { rel: "stylesheet", href: tagsscss },
  { rel: "stylesheet", href: toastscss },
];

export const loader = async (args: LoaderFunctionArgs) => {
  return await authRoute(args);
}

export default function Tags() {
  const params = useParams();
  const location = useLocation();
  const tagName = params.tagName;
  const noteId = params.noteId;
  const url = location.pathname;
  const tagDetails = tagName && !noteId;
  return (
      <div className={`notes-container`}>
        <Sidebar />
        <div className="notes-container-content">
        <Link
          to="/tags"
          className={`nav-back-btn ${tagDetails ? "flex lg:hidden" : "hidden"}`}
        >
          <img src={chevronLeft} alt="Back" />
          Back
        </Link>
          <PageHeader title="Tags" search="" url={url} />
          <div className="content-body">
            <Outlet />
          </div>
        </div>
        <BottomNav />
        <Toast />
        <Modal />
      </div>
  );
}
