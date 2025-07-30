import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import "./tailwind.css";
import { useEffect, useState } from "react";
import { AppStateContext, initialState } from "./app.context";
import { userPrefs } from "./cookies.server";

const fontThemes = {
  inter: "font-inter",
  sans: "font-serif",
  monospace: "font-mono",
};

const colorThemes = {
  light: "app-light",
  dark: "app-dark",
};

type LoaderType = {
  userFont: 'inter' | 'sans' | 'monospace';
  userColor: 'light' | 'dark' | 'system';
};

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Pacifico&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Monospace&display=swap",
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  return { userFont: cookie.userFont, userColor: cookie.userColor };
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [appColor, setAppColor] = useState('light');
  const loaderData = useLoaderData<typeof loader>() as LoaderType;
  let { userFont = 'inter', userColor = 'light' } = loaderData || {};
  useEffect(() => {
    if (userColor === 'system') {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      userColor = systemDark ? 'dark' : 'light';
    }
  }, [userColor]);
  return (
    <html lang="en" className={`${fontThemes[userFont]} ${appColor}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [appState, setAppState] = useState(initialState);
  return (
    <AppStateContext.Provider value={{ appState, setAppState }}>
      <Outlet />
    </AppStateContext.Provider>
  );
}
