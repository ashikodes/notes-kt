import { json, LinksFunction } from "@remix-run/node";
import tagsscss from "~/styles/tags.scss?url";
import tagIcon from "~/assets/svg/tag.svg";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/db.server";
import React from "react";
import { NavLink } from "react-router-dom";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tagsscss },
];

export const loader = async () => {
  const tags = await db.tag.findMany();
  return json({ tags });
};

export default function Tags() {
  const { tags } = useLoaderData<typeof loader>();
  return (
    <div className="tags-container">
      <span className="content-title">Tags</span>
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
