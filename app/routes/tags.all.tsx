import { json, LoaderFunction } from "@remix-run/node";
import { db } from "~/db.server";

export const loader: LoaderFunction = async () => {
  const tags = await db.tag.findMany();
  return json(tags);
};
