import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
}

export async function sendWelcomeLeadEmail(params: {
  to: string;
  name: string;
}) {
  const client = getResendClient();
  if (!client) return { sent: false as const, reason: "missing_api_key" as const };

  const { to, name } = params;
  const subject = "Chao mung ban den voi Pickleball 30 Phut";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Chao ${name || "ban"},</h2>
      <p>Cam on ban da dang ky nhan tai lieu Pickleball 30 Phut.</p>
      <p>Trong vai ngay toi, minh se gui tiep cac email gia tri de giup ban vao san tu tin hon.</p>
      <p>Neu can ho tro nhanh, ban co the truy cap website: <a href="https://pickleball30phut.com">pickleball30phut.com</a></p>
      <p>Hep gap ban tren san,<br/>Coach Thuan Hoa</p>
    </div>
  `;
  const text = [
    `Chao ${name || "ban"},`,
    "Cam on ban da dang ky nhan tai lieu Pickleball 30 Phut.",
    "Trong vai ngay toi, minh se gui tiep cac email gia tri de giup ban vao san tu tin hon.",
    "Website: https://pickleball30phut.com",
    "Coach Thuan Hoa",
  ].join("\n");

  await client.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
    text,
  });

  return { sent: true as const };
}
