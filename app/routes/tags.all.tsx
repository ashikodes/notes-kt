import { json, LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { authRoute } from "~/auth.server";
import { db } from "~/db.server";

export const loader = async (args: LoaderFunctionArgs) => {
  const userSession = await authRoute(args);
  // get tags only from notes created by user
  const tags = await db.tag.findMany({
    where: {
      Notes: {
        some: {
          user_id: userSession.user_id,
        },
      },
    },
  });
  return json(tags);
};
