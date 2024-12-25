import home from "~/assets/svg/home.svg";
import search from "~/assets/svg/search.svg";
import archived from "~/assets/svg/archived.svg";
import tags from "~/assets/svg/tags.svg";
import settings from "~/assets/svg/settings.svg";

export default function BottomNav() {
    return (
        <div className="bottom-nav-container">
            <div className="bottom-nav">
                <div className="menu-item active">
                    <img src={home} alt="Home" />
                    <span className="nav-text">Home</span>
                </div>
                <div className="divider" />
                <div className="menu-item">
                    <img src={search} alt="Search" />
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
};