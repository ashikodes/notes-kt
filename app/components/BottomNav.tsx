import home from "~/assets/svg/home.svg";
import homeActive from "~/assets/svg/home-active.svg";
import search from "~/assets/svg/search.svg";
import searchActive from "~/assets/svg/search-active.svg";
import archived from "~/assets/svg/archived.svg";
import tags from "~/assets/svg/tags.svg";
import settings from "~/assets/svg/settings.svg";
import { NavLink, useSearchParams } from "@remix-run/react";

export default function BottomNav() {
  const [searchParams] = useSearchParams();

  const hasSearch = searchParams.has("search");
  console.log(hasSearch);
  return (
    <div className="bottom-nav-container">
      <div className="bottom-nav">
        <NavLink to="/notes" className="menu-item">
          <img src={home} className="menu-icon" alt="Home" />
          <img src={homeActive} className="menu-icon-active" alt="Home" />
          <span className="nav-text">Home</span>
        </NavLink>
        <div className="divider" />
        <div className={`menu-item ${hasSearch ? "active" : ""}`}>
          <img src={search} className="menu-icon" alt="Search" />
          <img src={searchActive} className="menu-icon-active" alt="Search" />
          <span className="nav-text">Search</span>
        </div>
        <div className="divider" />
        <div className="menu-item">
          <img src={archived} alt="Archived" />
          <span className="nav-text">Archived</span>
        </div>
        <div className="divider" />
        <div className="menu-item">
          <img src={tags} alt="Tags" />
          <span className="nav-text">Tags</span>
        </div>
        <div className="divider" />
        <div className="menu-item">
          <img src={settings} alt="Settings" />
          <span className="nav-text">Settings</span>
        </div>
      </div>
    </div>
  );
}
