import feather from "~/assets/svg/feather.svg";
import home from "~/assets/svg/home.svg";
import homeActive from "~/assets/svg/home-active.svg";
import chevronRight from "~/assets/svg/chevron-right.svg";
import archived from "~/assets/svg/archived.svg";
import archivedActive from "~/assets/svg/archived-active.svg";
import { NavLink } from "@remix-run/react";

export default function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="notes-logo">
                    <img src={feather} alt="Feather" />
                    <span>Notes</span>
                </div>
            </div>
            <div className="sidebar__content">
                <div className="sidebar__top-items">
                    <NavLink to="/notes" end className="sidebar__top-item">
                        <img src={home} className="nav-icon" alt="Home" />
                        <img src={homeActive} className="nav-icon-active" alt="Home" />
                        <span className="sidebar__top-item-text">All Notes</span>
                        <img src={chevronRight} className="chevron" alt="Chevron Right" />
                    </NavLink>
                    <NavLink to="/notes/archived" className="sidebar__top-item">
                        <img src={archived} className="nav-icon" alt="Archived" />
                        <img src={archivedActive} className="nav-icon-active" alt="Archived" />
                        <span className="sidebar__top-item-text">Archived Notes</span>
                        <img src={chevronRight} className="chevron" alt="Chevron Right" />
                    </NavLink>
                </div>
            </div>
        </div>
    );
}