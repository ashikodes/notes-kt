import home from "~/assets/svg/home.svg";
import homeActive from "~/assets/svg/home-active.svg";
import search from "~/assets/svg/search.svg";
import searchActive from "~/assets/svg/search-active.svg";
import archived from "~/assets/svg/archived.svg";
import archivedActive from "~/assets/svg/archived-active.svg";
import plus from "~/assets/svg/plus.svg";
import tagIcon from "~/assets/svg/tag.svg";
import tagIconActive from "~/assets/svg/tag-active.svg";
import settings from "~/assets/svg/settings.svg";
import settingsActive from "~/assets/svg/settings-active.svg";
import { NavLink, useLocation, useParams, useSearchParams } from "@remix-run/react";

export default function BottomNav() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();
  const isSettings = location.pathname.includes("settings");
  const hasSearch = searchParams.has("search");
  const hideCreate = params.noteId || isSettings;
  return (
    <div className="bottom-nav-container">
      <div className="bottom-nav">
        <NavLink to="/notes" end className="menu-item">
          <img src={home} className="menu-icon" alt="Home" />
          <img src={homeActive} className="menu-icon-active" alt="Home" />
          <span className="nav-text">Home</span>
        </NavLink>
        <div className="divider" />
        <div
          onClick={() => {
            if (!hasSearch) setSearchParams({ search: "" });
          }}
          className={`menu-item ${hasSearch ? "active" : ""}`}
        >
          <img src={search} className="menu-icon" alt="Search" />
          <img src={searchActive} className="menu-icon-active" alt="Search" />
          <span className="nav-text">Search</span>
        </div>
        <div className="divider" />
        <NavLink to="/notes/archived" className="menu-item">
          <img src={archived} className="menu-icon" alt="Archived" />
          <img
            src={archivedActive}
            className="menu-icon-active"
            alt="Archived"
          />
          <span className="nav-text">Archived</span>
        </NavLink>
        <div className="divider" />
        <NavLink to="/tags" className="menu-item">
          <img src={tagIcon} className="menu-icon" alt="Tags" />
          <img src={tagIconActive} className="menu-icon-active" alt="Tags" />
          <span className="nav-text">Tags</span>
        </NavLink>
        <div className="divider" />
        <NavLink to="/settings" className="menu-item">
          <img src={settings} className="menu-icon" alt="Settings" />
          <img src={settingsActive} className="menu-icon-active" alt="Settings" />
          <span className="nav-text">Settings</span>
        </NavLink>
      </div>
      {!hideCreate && (
        <NavLink to="/notes/new" className="floating-create">
          <button className="floating-btn">
            <img src={plus} alt="Plus" />
          </button>
        </NavLink>
      )}
    </div>
  );
}
