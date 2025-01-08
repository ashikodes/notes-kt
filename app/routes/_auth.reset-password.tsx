import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node"; // or cloudflare/deno
import {
  Form,
  json,
  Link,
  redirect,
  useActionData,
  useLoaderData,
} from "@remix-run/react";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "~/db.server";
import loginscss from "~/styles/login.scss?url";
import feather from "~/assets/svg/feather.svg";
import eye from "~/assets/svg/eye.svg";
import hideEye from "~/assets/svg/hide-eye.svg";
import hint from "~/assets/svg/hint.svg";
import google from "~/assets/svg/google.svg";
import { useContext, useEffect, useState } from "react";
import { commitSession, destroySession, getSession } from "~/session.server";
import { sendResetEmail } from "~/email.server";
import { AppStateContext } from "~/app.context";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: loginscss },
];

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);

  // Check if the user is logged in
  const sessionId = session.get(`${process.env.SESSION_COOKIE_NAME}`);
  if (sessionId) {
    return redirect("/notes");
  }
  return {};
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // get email from url query params
  const email = formData.get("email") as string;
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
      where: { email },
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
      where: { email: user.email },
      data: { password_hash, otp_code: "" },
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

export default function ResetPassword() {
  const { setAppState } = useContext(AppStateContext);
  const [showPassword, setShowPassword] = useState<showPasswordType>(
    {} as showPasswordType
  );
  const { success, errors } = useActionData<typeof action>() || {};
  useEffect(() => {
    if (success) {
      setAppState((prev) => ({ ...prev, toast: "password" }));

      setTimeout(() => {
        setAppState((prev) => ({ ...prev, toast: "" }));
      }, 3000);
    }
  }, [success]);
  return (
    <div className="login-container">
      <div className="notes-logo">
        <img src={feather} alt="Feather" />
        <span>Notes</span>
      </div>
      <div className="login-header">
        <h2 className="header-title">Reset your password?</h2>
        <p className="header-subtitle">
          Choose a new password to secure your account.
        </p>
      </div>
      <Form method="post" className="login-form">
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
          {errors?.new ? (
            <div className="input-feedback error">{errors?.new}</div>
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
          {errors?.mismatch && (
            <div className="input-feedback error">{errors?.mismatch}</div>
          )}
        </div>

        <button type="submit" className="login-button">
          Reset Link
        </button>
      </Form>
    </div>
  );
}
