// app/utils/email.server.js
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendResetEmail({ to, resetLink }: Record<string, string>) {
  const msg = {
    to,
    from: "no-reply@kodes.dev",
    subject: "Password Reset Request",
    text: `Click the link below to reset your password: ${resetLink}`,
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
  };

  console.log("Sending email:", msg);

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error.response?.body || error);
    return { success: false, error: error.message };
  }
}
