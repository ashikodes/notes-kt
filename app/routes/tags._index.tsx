import { LinksFunction } from "@remix-run/node";
import tagsscss from "~/styles/tags.scss?url";
import tagIcon from "~/assets/svg/tag.svg";
import React, { useEffect, useState } from "react";
import { Prisma } from "@prisma/client";
import { NavLink } from "@remix-run/react";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tagsscss },
];

export default function Tags() {
  const [tags, setTags] = useState<Prisma.TagCreateWithoutNotesInput[]>([]);
  useEffect(() => {
    async function fetchTags() {
      const request = await fetch("/tags/all");
      const tags =
        (await request.json()) as Prisma.TagCreateWithoutNotesInput[];
      setTags(tags);
    }
    fetchTags();
  }, []);
  return (
    <div className="tags-container">
      <div className="tags-list">
        {tags.map((tag, idx) => (
          <React.Fragment key={tag.id}>
            {idx != 0 && <div className="divider" />}
            <NavLink to={`/tags/${tag.name}`} className="tag-item" key={tag.id}>
              <img src={tagIcon} alt="tag" />
              <span className="tag-name">{tag.name}</span>
            </NavLink>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
