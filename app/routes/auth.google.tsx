import { LoaderFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticator.authenticate("google", request);
};