import { redirect, type MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Notes KT" },
    { name: "description", content: "Welcome to Notes taking!" },
  ];
};

export async function loader() {
  return redirect("/notes");
}

export default function Index() {
  return (
    <Outlet />
  );
}
