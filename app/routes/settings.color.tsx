import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useContext, useEffect, useMemo, useState } from "react";
import sun from "~/assets/svg/sun.svg";
import dark from "~/assets/svg/dark.svg";
import lightDark from "~/assets/svg/light-dark.svg";
import { userPrefs } from "~/cookies.server";
import { AppStateContext } from "~/app.context";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const userColor = cookie.userColor || "light";
  return json({ userColor });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const formData = await request.formData();
  const userColor = formData.get("color") || "light";
  cookie.userColor = userColor;
  return redirect("/settings/color", {
    headers: {
      "Set-Cookie": await userPrefs.serialize(cookie),
    },
  });
};

export default function ColorSettings() {
  const { appState, setAppState } = useContext(AppStateContext);
  const { userColor } = useLoaderData<typeof loader>();
  const [color, setColor] = useState(userColor);
  const initialColor = useMemo(() => userColor, []);
  const changeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };
  useEffect(() => {
    if (userColor !== initialColor) {
      setAppState((prevState) => ({
        ...prevState,
        toast: "settings",
        userColor,
      }));

      setTimeout(() => {
        setAppState((prevState) => ({
          ...prevState,
          toast: "",
        }));
      }, 3000);
    }
  }, [userColor]);
  return (
    <Form method="post" className="settings-content">
      <div className="top-content">
        <span className="header-title">Color Theme</span>
        <span className="header-subtitle">Choose your color theme:</span>
      </div>
      <div className="content-options">
        <label
          className={`option-radio ${color === "light" ? "selected" : ""}`}
        >
          <div className="option-icon">
            <img src={sun} alt="sun" />
          </div>
          <div className="option-content">
            <span className="option-title">Light Mode</span>
            <span className="option-subtitle">
              Pick a clean and classic light theme
            </span>
          </div>
          <input
            type="radio"
            name="color"
            value="light"
            onChange={changeColor}
            checked={color === "light"}
          />
        </label>
        <label className={`option-radio ${color === "dark" ? "selected" : ""}`}>
          <div className="option-icon">
            <img src={dark} alt="Dark" />
          </div>
          <div className="option-content">
            <span className="option-title">Dark Mode</span>
            <span className="option-subtitle">
              Select a sleek and modern dark theme
            </span>
          </div>
          <input
            type="radio"
            name="color"
            value="dark"
            onChange={changeColor}
            checked={color === "dark"}
          />
        </label>
        <label
          className={`option-radio ${color === "system" ? "selected" : ""}`}
        >
          <div className="option-icon">
            <img src={lightDark} alt="System" />
          </div>
          <div className="option-content">
            <span className="option-title">System</span>
            <span className="option-subtitle">
              Adapts to your device's theme
            </span>
          </div>
          <input
            type="radio"
            name="color"
            value="system"
            onChange={changeColor}
            checked={color === "system"}
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
