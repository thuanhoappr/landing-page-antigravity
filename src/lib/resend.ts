import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
}) {
  const client = getResendClient();
  if (!client) return { sent: false as const, reason: "missing_api_key" as const };

  const { to, subject, text } = params;
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;white-space:pre-line">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>`;

  await client.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
    text,
  });

  return { sent: true as const };
}
