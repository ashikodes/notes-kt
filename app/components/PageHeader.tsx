import settings from '../assets/svg/settings.svg';
import search from '../assets/svg/search.svg';

interface PageHeaderProps {
    title: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
    return (
        <div className="page-header">
            <h2 className="page-header__text">{title}</h2>
            <div className="page-header__content">
                <div className="content__search">
                    <img src={search} alt="Search" />
                    <input className="search-input" type="text" placeholder="Search by title, content, or tags…" />
                </div>
                <div className="header-settings">
                    <img src={settings} alt="Settings" />
                </div>
            </div>
        </div>
    );
}