import feather from "~/assets/svg/feather.svg";
import home from "~/assets/svg/home.svg";
import chevronRight from "~/assets/svg/chevron-right.svg";
import archived from "~/assets/svg/archived.svg";

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
                    <div className="sidebar__top-item">
                        <img src={home} alt="Home" />
                        <span className="sidebar__top-item-text">All Notes</span>
                        <img src={chevronRight} alt="Chevron Right" />
                    </div>
                    <div className="sidebar__top-item">
                        <img src={archived} alt="Archived" />
                        <span className="sidebar__top-item-text">Archived Notes</span>
                        <img src={chevronRight} alt="Chevron Right" />
                    </div>
                </div>
            </div>
        </div>
    );
}