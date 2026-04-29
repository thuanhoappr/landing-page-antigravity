import { NextResponse } from "next/server";
import {
  enqueueEmailAutomationJob,
  findCustomerByPhoneOrEmail,
  insertCustomer,
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
    let testEmailDebug: Array<{ step: number; sent: boolean; reason?: string }> = [];
    try {
      const customer = await insertCustomer(name, email, phone, null, registrationDate);
      customerId = customer.id;
    } catch {
      const existing = await findCustomerByPhoneOrEmail({ phone, email });
      if (!existing) throw new Error("CUSTOMER_NOT_FOUND");
      customerId = existing.id;
    }

    if (email) {
      const isTestMode = /\+test[^@]*@/i.test(email);
      const normalizedTestEmail = isTestMode ? email.replace(/\+test[^@]*(?=@)/i, "") : email;
      try {
        const seq = loadEmailSequence();
        const now = Date.now();
        const steps = seq.map((s) => ({
          ...s,
          body: s.body.replace(/Chao ban/gi, `Chao ${name || "ban"}`),
        }));

        if (isTestMode) {
          // Test mode: gui ca 3 email ngay lap tuc de kiem tra nhanh.
          for (const step of steps) {
            const result = await sendEmail({ to: normalizedTestEmail, subject: step.subject, text: step.body });
            testEmailDebug.push({
              step: step.step,
              sent: result.sent,
              reason: result.sent ? undefined : result.reason,
            });
            if (!result.sent) {
              console.error("[waitlist] test send failed", {
                to: normalizedTestEmail,
                original: email,
                step: step.step,
                reason: result.reason,
              });
            }
          }
        } else {
          // Production: gui email 1 ngay, email 2/3 dua vao hang doi cron.
          const first = await sendEmail({ to: email, subject: steps[0].subject, text: steps[0].body });
          if (!first.sent) {
            console.error("[waitlist] first email send failed", { to: email, reason: first.reason });
          }
          const futureOffsets = [2 * 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000];
          for (let i = 1; i < steps.length; i += 1) {
            const step = steps[i];
            await enqueueEmailAutomationJob({
              customer_id: customerId,
              email,
              step: step.step,
              subject: step.subject,
              body: step.body,
              send_at: new Date(now + futureOffsets[i - 1]).toISOString(),
            });
          }
        }
      } catch (e) {
        // Khong chan luu CRM neu sequence/email gap loi.
        console.error("[waitlist] sequence/email error", e);
      }
    }

    const isTestMode = email ? /\+test[^@]*@/i.test(email) : false;
    return NextResponse.json(
      {
        success: true,
        customer_id: customerId,
        ...(isTestMode ? { test_email_debug: testEmailDebug } : {}),
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[waitlist] error", e);
    return NextResponse.json({ error: "Khong xu ly duoc waitlist." }, { status: 500 });
  }
}
