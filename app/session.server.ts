import { createCookieSessionStorage } from "@remix-run/node";

// Configure your session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: process.env.SESSION_COOKIE_NAME, // Cookie name
    httpOnly: true, // Prevent JavaScript access
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Helps prevent CSRF
    path: "/", // Cookie is valid for all routes
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secrets: [`${process.env.SESSION_SECRET}`],
  },
});

// Export helper functions
export const { getSession, commitSession, destroySession } = sessionStorage;
