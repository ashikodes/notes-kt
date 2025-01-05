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
import google from "~/assets/svg/google.svg";
import { useState } from "react";
import { commitSession, getSession } from "~/session.server";

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
    const password = formData.get("password") as string;
    const errors: Record<string, string> = { form: "" };

    try {
        if (!email || !password) {
            errors.form = "Email and password are required";
            return json({ errors }, { status: 400 });
        }

        // Find the user in the database
        const user = await db.users.findFirst({ where: { email } });
        if (!user) {
            errors.form = "Invalid email or password";
            return json({ errors }, { status: 400 });
        }

        // Check if the password is correct
        if (!user.password_hash) {
            errors.form = "Invalid email or password";
            return json({ errors }, { status: 400 });
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            errors.form = "Invalid email or password";
            return json({ errors }, { status: 400 });
        }

        // Create a session
        const sessionToken = randomBytes(64).toString("hex");
        const sessionExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
        const sessionData = await db.session.create({
            data: {
                token: sessionToken,
                user_id: user.id,
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
        errors.form = "Internal server error";
        return json({ errors }, { status: 500 });
    }
};

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const actionData = useActionData<typeof action>();
    return (
        <div className="login-container">
            <div className="notes-logo">
                <img src={feather} alt="Feather" />
                <span>Notes</span>
            </div>
            <div className="login-header">
                <h2 className="header-title">Welcome to Note</h2>
                <p className="header-subtitle">Please log in to continue</p>
            </div>
            <Form method="post" className="login-form">
                <div className="form-input">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div className="form-input">
                    <label htmlFor="password">
                        Password
                        <span className="label-link">Forgot?</span>
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        required
                    />
                    {showPassword ? (
                        <img
                            onClick={() => setShowPassword(!showPassword)}
                            src={hideEye}
                            alt="Eye"
                            className="password-eye"
                        />
                    ) : (
                        <img
                            onClick={() => setShowPassword(!showPassword)}
                            src={eye}
                            alt="Eye"
                            className="password-eye"
                        />
                    )}
                </div>

                <button type="submit" className="login-button">
                    Login
                </button>
                {actionData?.errors.form && (
                    <div className="text-xs self-start mt-[-12px] text-red-400">
                        {actionData?.errors.form}
                    </div>
                )}
            </Form>
            <div className="divider" />
            <p className="login-alt">Or log in with:</p>
            <Link to="/auth/google" className="login-alt-button">
                <img src={google} alt="Feather" />
                Google
            </Link>
            <div className="divider" />
            <Link to="/register" className="no-account-link">
                No account yet? <span className="label-link">Sign Up</span>
            </Link>
        </div>
    );
}
