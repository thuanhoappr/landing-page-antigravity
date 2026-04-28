import { NextResponse } from "next/server";
import { insertCustomer } from "@/lib/brainDb";
import { sendWelcomeLeadEmail } from "@/lib/resend";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;
  const emailRaw = String(body.email ?? "").trim();
  const email = emailRaw || null;
  const registrationDate = new Date().toISOString();

  if (!name || !phone) {
    return NextResponse.json({ error: "Thiếu tên hoặc số điện thoại." }, { status: 400 });
  }
  if (email && !isValidEmail(email)) {
    return NextResponse.json({ error: "Email không hợp lệ." }, { status: 400 });
  }

  try {
    const customer = await insertCustomer(name, email, phone, null, registrationDate);
    if (email) {
      try {
        await sendWelcomeLeadEmail({ to: email, name });
      } catch (e) {
        console.error("[waitlist] send welcome email failed", e);
      }
    }
    return NextResponse.json({ success: true, customer_id: customer.id }, { status: 201 });
  } catch {
    // Dữ liệu có thể đã tồn tại (phone/email), vẫn cho flow tiếp tục.
    if (email) {
      try {
        await sendWelcomeLeadEmail({ to: email, name });
      } catch (e) {
        console.error("[waitlist] send welcome email failed on duplicate", e);
      }
    }
    return NextResponse.json({ success: true, duplicate: true }, { status: 200 });
  }
}
