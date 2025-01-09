// app/utils/email.server.js
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendResetEmail({ to, resetLink }: Record<string, string>) {
  const msg = {
    to,
    from: "admin@kodes.dev",
    subject: "Password Reset Request",
    text: `Click the link below to reset your password`,
    html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">Click here</a>`,
  };
  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email:", error.response?.body || error);
    return { success: false, error: error.message };
  }
}
