import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useContext, useEffect, useMemo, useState } from "react";
import bcrypt from "bcryptjs";
import eye from "~/assets/svg/eye.svg";
import hideEye from "~/assets/svg/hide-eye.svg";
import hint from "~/assets/svg/hint.svg";
import { userPrefs } from "~/cookies.server";
import { AppStateContext } from "~/app.context";
import { authRoute } from "~/auth.server";
import { db } from "~/db.server";
import { destroySession, getSession } from "~/session.server";

export const loader = async (args: LoaderFunctionArgs) => {
  const userSession = await authRoute(args);
  const user = await db.users.findFirst({
    where: { id: userSession.user_id },
  });
  return json({ user });
};

export const action = async (args: ActionFunctionArgs) => {
  const { request } = args;
  const userSession = await authRoute(args);
  const formData = await request.formData();
  const oldPassword = formData.get("old-password") as string;
  const newPassword = formData.get("new-password") as string;
  const confirmPassword = formData.get("confirm-password") as string;
  const errors = { old: "", new: "", mismatch: "" };

  try {
    if (newPassword.length < 8) {
      errors.new = "Password must be at least 8 characters long";
      return { errors, status: 400 };
    }

    if (newPassword !== confirmPassword) {
      errors.mismatch = "Passwords do not match";
      return { errors, status: 400 };
    }

    // Check if the user's old password is correct
    const user = await db.users.findFirst({
      where: { id: userSession.user_id },
    });
    if (!user) {
      const cookie = request.headers.get("Cookie");
      const session = await getSession(cookie);
      return redirect("/login", {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash!);
    if (user.password_hash && !isMatch) {
      errors.old = "Old password is incorrect";
      return { errors, status: 400 };
    } else if (!user.password_hash) {
      // user registered with google
      errors.old = "Registered with auth provider, Set new password";
    }

    // Update the user's password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    await db.users.update({
      where: { id: userSession.user_id },
      data: { password_hash },
    });

    return { success: true, errors: { old: "", new: "", mismatch: "" } };
  } catch (error) {
    return { errors, status: 400 };
  }
};

type showPasswordType = {
  old: boolean;
  new: boolean;
  confirm: boolean;
};

export default function PasswordSettings() {
  const [showPassword, setShowPassword] = useState<showPasswordType>(
    {} as showPasswordType
  );
  const { appState, setAppState } = useContext(AppStateContext);
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    if (actionData?.success) {
      setAppState((prevState) => ({
        ...prevState,
        toast: "password",
      }));

      setTimeout(() => {
        setAppState((prevState) => ({
          ...prevState,
          toast: "",
        }));
      }, 3000);
    }
  }, [actionData?.success]);
  return (
    <Form method="post" className="settings-content">
      <div className="top-content">
        <span className="header-title">Change Password</span>
      </div>
      <div className="content-options">
        <div className="form-input">
          <label htmlFor="old-password">Old Password</label>
          <input
            type={showPassword.old ? "text" : "password"}
            id="old-password"
            name="old-password"
            required
          />
          {showPassword.old ? (
            <img
              onClick={() =>
                setShowPassword({ ...showPassword, old: !showPassword.old })
              }
              src={hideEye}
              alt="Eye"
              className="password-eye"
            />
          ) : (
            <img
              onClick={() =>
                setShowPassword({ ...showPassword, old: !showPassword.old })
              }
              src={eye}
              alt="Eye"
              className="password-eye"
            />
          )}
          {actionData?.errors?.old && (
            <div className="input-feedback error">
              {actionData?.errors?.old}
            </div>
          )}
        </div>
        <div className="form-input">
          <label htmlFor="new-password">New Password</label>
          <input
            type={showPassword.new ? "text" : "password"}
            id="new-password"
            name="new-password"
            required
          />
          {showPassword.new ? (
            <img
              onClick={() =>
                setShowPassword({ ...showPassword, new: !showPassword.new })
              }
              src={hideEye}
              alt="Eye"
              className="password-eye"
            />
          ) : (
            <img
              onClick={() =>
                setShowPassword({ ...showPassword, new: !showPassword.new })
              }
              src={eye}
              alt="Eye"
              className="password-eye"
            />
          )}
          {actionData?.errors?.new ? (
            <div className="input-feedback error">
              {actionData?.errors?.new}
            </div>
          ) : (
            <div className="input-feedback hint">
              <img src={hint} alt="hint" />
              <p>Password must be at least 8 characters long</p>
            </div>
          )}
        </div>
        <div className="form-input">
          <label htmlFor="confirm-password">Confirm New Password</label>
          <input
            type={showPassword.confirm ? "text" : "password"}
            id="confirm-password"
            name="confirm-password"
            required
          />
          {showPassword.confirm ? (
            <img
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  confirm: !showPassword.confirm,
                })
              }
              src={hideEye}
              alt="Eye"
              className="password-eye"
            />
          ) : (
            <img
              onClick={() =>
                setShowPassword({
                  ...showPassword,
                  confirm: !showPassword.confirm,
                })
              }
              src={eye}
              alt="Eye"
              className="password-eye"
            />
          )}
          {actionData?.errors?.mismatch && (
            <div className="input-feedback error">
              {actionData?.errors?.mismatch}
            </div>
          )}
        </div>
      </div>
      <div className="button-wrap">
        <button type="submit" className="button-primary">
          Apply Changes
        </button>
      </div>
    </Form>
  );
}
