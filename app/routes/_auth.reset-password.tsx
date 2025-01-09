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
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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
import { decryptToObject } from "~/utils/crypt";

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
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const formData = await request.formData();
  const errors = { form: "", new: "", mismatch: "" };
  if (!token) {
    errors.form = "Invalid reset token";
    return { success: false, errors, status: 400 };
  }

  try {
    const { email, otp } = decryptToObject(token as string);
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    if (newPassword.length < 8) {
      errors.new = "Password must be at least 8 characters long";
      return { errors, status: 400 };
    }

    if (newPassword !== confirmPassword) {
      errors.mismatch = "Passwords do not match";
      return { errors, status: 400 };
    }

    // Check if the user otp code is valid
    const user = await db.users.findFirst({
      where: { email, otp_code: otp },
    });
    if (!user) {
      errors.form = "Token is invalid";
      return { success: false, errors, status: 400 };
    }
    // check if token is expired
    if (user.otp_expires && new Date(user.otp_expires).toISOString() < new Date().toISOString()) {
      errors.form = "Token expired";
      return { success: false, errors, status: 400 };
    }

    // Update the user's password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
    const password_hash = await bcrypt.hash(newPassword, saltRounds);
    await db.users.update({
      where: { email: user.email },
      data: { password_hash, otp_code: "", otp_expires: null },
    });

    return { success: true, errors: { form: "", new: "", mismatch: "" } };
  } catch (error) {
    errors.form = "Unable to reset password";
    return { success: false, errors, status: 400 };
  }
};

type showPasswordType = {
  old: boolean;
  new: boolean;
  confirm: boolean;
};

export default function ResetPassword() {
  const { setAppState } = useContext(AppStateContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState<showPasswordType>(
    {} as showPasswordType
  );
  const { success, errors } = useActionData<typeof action>() || {};
  useEffect(() => {
    if (success) {
      setAppState((prev) => ({ ...prev, toast: "password" }));
        navigate({ pathname: "/login" });
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
        {errors?.form && (
          <div className="input-feedback error">{errors?.form}</div>
        )}
      </Form>
    </div>
  );
}
