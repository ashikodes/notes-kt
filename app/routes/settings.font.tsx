import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useContext, useEffect, useMemo, useState } from "react";
import { userPrefs } from "~/cookies.server";
import { AppStateContext } from "~/app.context";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const userFont = cookie.userFont || "inter";
  return json({ userFont });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const formData = await request.formData();
  const userFont = formData.get("font") || "inter";
  cookie.userFont = userFont;
  return redirect("/settings/font", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
};

export default function FontSettings() {
  const { appState, setAppState } = useContext(AppStateContext);
  const { userFont } = useLoaderData<typeof loader>();
  const [font, setFont] = useState(userFont);
  const initialFont = useMemo(() => userFont, []);
  const changeFont = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFont(e.target.value);
  };
  useEffect(() => {
    if (userFont !== initialFont) {
      setAppState((prevState) => ({
        ...prevState,
        toast: "settings",
        userFont,
      }));

      setTimeout(() => {
        setAppState((prevState) => ({
          ...prevState,
          toast: "",
        }));
      }, 3000);
    }
  }, [userFont]);
  return (
    <Form method="post" className="settings-content">
      <div className="top-content">
        <span className="header-title">Font Theme</span>
        <span className="header-subtitle">Choose your font theme:</span>
      </div>
      <div className="content-options">
        <label className={`option-radio ${font === "inter" ? "selected" : ""}`}>
          <div className="option-icon">
            <span>Aa</span>
          </div>
          <div className="option-content">
            <span className="option-title">Inter</span>
            <span className="option-subtitle">
              Clean and modern, easy to read.
            </span>
          </div>
          <input
            type="radio"
            name="font"
            value="inter"
            onChange={changeFont}
            checked={font === "inter"}
          />
        </label>
        <label className={`option-radio ${font === "sans" ? "selected" : ""}`}>
          <div className="option-icon">
            <span>Aa</span>
          </div>
          <div className="option-content">
            <span className="option-title">Sans-serif</span>
            <span className="option-subtitle">
              Classic and elegant for a timeless feel.
            </span>
          </div>
          <input
            type="radio"
            name="font"
            value="sans"
            onChange={changeFont}
            checked={font === "sans"}
          />
        </label>
        <label
          className={`option-radio ${font === "monospace" ? "selected" : ""}`}
        >
          <div className="option-icon">
            <span>Aa</span>
          </div>
          <div className="option-content">
            <span className="option-title">Monospace</span>
            <span className="option-subtitle">
              Code-like, great for a technical vibe.
            </span>
          </div>
          <input
            type="radio"
            name="font"
            value="monospace"
            onChange={changeFont}
            checked={font === "monospace"}
          />
        </label>
      </div>
      <div className="button-wrap">
        <button type="submit" className="button-primary">
          Apply Changes
        </button>
      </div>
    </Form>
  );
}
