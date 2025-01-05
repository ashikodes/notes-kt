import feather from "~/assets/svg/feather.svg";
import home from "~/assets/svg/home.svg";
import homeActive from "~/assets/svg/home-active.svg";
import chevronRight from "~/assets/svg/chevron-right.svg";
import archived from "~/assets/svg/archived.svg";
import archivedActive from "~/assets/svg/archived-active.svg";
import tagIcon from "~/assets/svg/tag.svg";
import tagIconActive from "~/assets/svg/tag-active.svg";
import { NavLink } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Prisma } from "@prisma/client";

export default function Sidebar() {
  const [tags, setTags] = useState<Prisma.TagCreateWithoutNotesInput[]>([]);
  useEffect(() => {
    async function fetchTags() {
      const request = await fetch("/tags/all");
      const tags = await request.json() as Prisma.TagCreateWithoutNotesInput[];
      setTags(tags);
    };
    fetchTags();
  }, []);
  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="notes-logo">
          <img src={feather} alt="Feather" />
          <span>Notes</span>
        </div>
      </div>
      <div className="sidebar__content">
        <div className="sidebar__item-list">
          <NavLink to="/notes" end className="sidebar__item">
            <img src={home} className="nav-icon" alt="Home" />
            <img src={homeActive} className="nav-icon-active" alt="Home" />
            <span className="sidebar__item-text">All Notes</span>
            <img src={chevronRight} className="chevron" alt="Chevron Right" />
          </NavLink>
          <NavLink to="/notes/archived" className="sidebar__item">
            <img src={archived} className="nav-icon" alt="Archived" />
            <img
              src={archivedActive}
              className="nav-icon-active"
              alt="Archived"
            />
            <span className="sidebar__item-text">Archived Notes</span>
            <img src={chevronRight} className="chevron" alt="Chevron Right" />
          </NavLink>
          <div className="divider" />
          <span className="section-text">Tags</span>
          {tags?.map((tag) => (
            <NavLink
              key={tag.id}
              to={`/tags/${tag.name}`}
              className="sidebar__item"
            >
              <img src={tagIcon} className="nav-icon" alt="Tag" />
              <img src={tagIconActive} className="nav-icon-active" alt="Tag" />
              <span className="sidebar__item-text">{tag.name}</span>
              <img src={chevronRight} className="chevron" alt="Chevron Right" />
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
