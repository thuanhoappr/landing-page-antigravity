import { NextResponse } from "next/server";
import {
  enqueueEmailAutomationJob,
  findCustomerByPhoneOrEmail,
  getDueEmailAutomationJobs,
  insertCustomer,
  markEmailAutomationJobSent,
} from "@/lib/brainDb";
import { loadEmailSequence } from "@/lib/emailSequence";
import { sendEmail } from "@/lib/resend";

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
    let customerId: number;
    try {
      const customer = await insertCustomer(name, email, phone, null, registrationDate);
      customerId = customer.id;
    } catch {
      const existing = await findCustomerByPhoneOrEmail({ phone, email });
      if (!existing) throw new Error("CUSTOMER_NOT_FOUND");
      customerId = existing.id;
    }

    if (email) {
      const seq = loadEmailSequence();
      const isTestMode = /\+test@/i.test(email);
      const now = Date.now();
      const offsets = isTestMode ? [0, 0, 0] : [0, 2 * 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000];

      for (let i = 0; i < seq.length; i += 1) {
        const step = seq[i];
        await enqueueEmailAutomationJob({
          customer_id: customerId,
          email,
          step: step.step,
          subject: step.subject,
          body: step.body.replace(/Chao ban/gi, `Chao ${name || "ban"}`),
          send_at: new Date(now + offsets[i]).toISOString(),
        });
      }

      // gửi ngay các job đến hạn (đặc biệt cho +test sẽ gửi đủ 3 email tức thì)
      const due = await getDueEmailAutomationJobs(20);
      for (const job of due) {
        try {
          await sendEmail({ to: job.email, subject: job.subject, text: job.body });
          await markEmailAutomationJobSent(job.id);
        } catch (e) {
          console.error("[waitlist] send automation email failed", e);
        }
      }
    }

    return NextResponse.json({ success: true, customer_id: customerId }, { status: 201 });
  } catch (e) {
    console.error("[waitlist] error", e);
    return NextResponse.json({ error: "Khong xu ly duoc waitlist." }, { status: 500 });
  }
}
