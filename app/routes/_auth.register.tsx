import type { ActionFunctionArgs, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, Link, redirect, useActionData } from "@remix-run/react";
import { v4 } from "uuid";
import { db } from "~/db.server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getSession, commitSession } from "~/session.server";
import registerscss from "~/styles/register.scss?url";
import feather from "~/assets/svg/feather.svg";
import eye from "~/assets/svg/eye.svg";
import google from "~/assets/svg/google.svg";
import hint from "~/assets/svg/hint.svg";
import { useState } from "react";

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: registerscss },
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
    const password = formData.get("password") as string;
    const errors: Record<string, string> = { form: "", password: "", email: "" };

    try {
        // Find the user in the database
        const user = await db.users.findFirst({ where: { email } });

        if (user) {
            errors.form = "Email already registered";
            return json({ errors }, { status: 400 });
        }

        if (email.length < 5) {
            errors.email = "Email appears too short";
            return json({ errors }, { status: 400 });
        }

        if (password.length < 8) {
            errors.password = "Password must be at least 8 characters long";
            return json({ errors }, { status: 400 });
        }
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
        const password_hash = await bcrypt.hash(password, saltRounds);


        // Create the user
        const newUser = await db.users.create({
            data: {
                id: v4(),
                email,
                password_hash,
            },
        });

        const sessionToken = randomBytes(64).toString("hex");
        const sessionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
        const sessionData = await db.session.create({
            data: {
                token: sessionToken,
                user_id: newUser.id,
                expires_at: sessionExpiry,
            },
        });

        if (!sessionData) {
            errors.form = "Internal server error";
            return json({ errors }, { status: 500 });
        }

        // Create a session
        const session = await getSession();

        session.set(`${process.env.SESSION_COOKIE_NAME}`, sessionData.token);

        // Commit the session to a cookie
        const cookie = await commitSession(session);

        // Redirect to a protected page
        return redirect("/", {
            headers: {
                "Set-Cookie": cookie, // Send the session cookie
            },
        });

    } catch (error) {
        errors.form = "Unable to create account";
        return json({ errors }, { status: 500 });
    }
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const actionData = useActionData<typeof action>();
    return (
        <div className="login-container">
            <div className="notes-logo">
                <img src={feather} alt="Feather" />
                <span>Notes</span>
            </div>
            <div className="login-header">
                <h2 className="header-title">Create Your Account</h2>
                <p className="header-subtitle">Sign up to start organizing your notes and boost your productivity.</p>
            </div>
            <Form method="post" className="login-form">
                <div className="form-input">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" required />
                    {actionData?.errors.email && (
                        <div className="text-xs self-start mt-[-12px] text-red-400">{actionData?.errors.email}</div>
                    )}
                </div>
                <div className="form-input">
                    <label htmlFor="password">
                        Password
                    </label>
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" required />
                    <img onClick={() => setShowPassword(!showPassword)} src={eye} alt="Eye" className="password-eye" />
                    {actionData?.errors.password ? (
                        <div className="text-xs self-start mt-[-12px] text-red-400">{actionData?.errors.password}</div>
                    ) : (
                        <div className="input-feedback">
                            <img src={hint} alt="hint" />
                            <p>Password must be at least 8 characters long</p>
                        </div>
                    )}
                </div>

                <button type="submit" className="login-button">Sign up</button>
                {actionData?.errors.form && <div className="text-xs self-start mt-[-12px] text-red-400">{actionData?.errors.form}</div>}
            </Form>
            <div className="divider" />
            <p className="login-alt">Or log in with:</p>
            <Link to="/auth/google" className="login-alt-button">
                <img src={google} alt="Feather" />
                Google
            </Link>
            <div className="divider" />
            <Link to="/login" className="no-account-link">Already have an account? <span className="label-link">Login</span></Link>
        </div>
    );
}