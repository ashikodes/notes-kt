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
  useNavigation,
} from "@remix-run/react";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { db } from "~/db.server";
import loginscss from "~/styles/login.scss?url";
import feather from "~/assets/svg/feather.svg";
import eye from "~/assets/svg/eye.svg";
import hideEye from "~/assets/svg/hide-eye.svg";
import google from "~/assets/svg/google.svg";
import { useState } from "react";
import { commitSession, getSession } from "~/session.server";
import { sendResetEmail } from "~/email.server";
import { encryptObject } from "~/utils/crypt";

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
  const email = formData.get("email") as string;

  try {
    // check if the user exists
    const user = await db.users.findFirst({ where: { email } });
    if (!user) {
      return json({ error: "User not found", success: false, status: 400 });
    }
    if (
      user.otp_code &&
      user.otp_expires &&
      new Date(user.otp_expires).toISOString() > new Date().toISOString()
    ) {
      return json({
        error: "An email has already been sent to you",
        success: false,
        status: 400,
      });
    }
    // generate an OTP 6 alphanumeric characters
    const otp = randomBytes(3).toString("hex").toUpperCase();
    // store the OTP in the database in the user
    const token = encryptObject({ email, otp });
    const expiry = Date.now() + 3600 * 1000; // 1 hour
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
    const emailSent = await sendResetEmail({ to: email, resetLink });
    await db.users.update({
      where: { email },
      data: { otp_code: otp, otp_expires: new Date(expiry).toISOString() },
    });
    return emailSent;
  } catch (error) {
    return json({
      error: "unable to send reset link",
      success: false,
      status: 500,
    });
  }
};

export default function ForgotPassword() {
  const { success, error } = useActionData<typeof action>() || {};
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  return (
    <div className="login-container">
      <div className="notes-logo">
        <img src={feather} alt="Feather" />
        <span>Notes</span>
      </div>
      <div className="login-header">
        <h2 className="header-title">Forgotten your password?</h2>
        {!success && (
          <p className="header-subtitle">
            Enter your email below, and we'll send you a link to reset it.
          </p>
        )}
      </div>
      {!success ? (
        <Form method="post" className="login-form">
          <div className="form-input">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" required />
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="login-button"
          >
            Send Reset Link
          </button>
          {error && (
            <div className="text-xs self-start mt-[-12px] text-red-400">
              {error}
            </div>
          )}
        </Form>
      ) : (
        <div className="sent-state">
          Email Sent. Click the link in the email to reset your password.
        </div>
      )}
    </div>
  );
}
