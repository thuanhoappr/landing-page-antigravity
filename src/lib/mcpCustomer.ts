import {
  enqueueEmailAutomationJob,
  findCustomerByPhoneOrEmail,
  findCustomerByZalo,
  insertCustomer,
} from "./brainDb";
import { loadEmailSequence } from "./emailSequence";
import { sendEmail } from "./resend";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type CreateCustomerFromTelegramResult =
  | {
      ok: true;
      customer_id: number;
      created: boolean;
      deduped: boolean;
      email_jobs_scheduled?: number;
      message?: string;
    }
  | { ok: false; error: string; message: string };

/**
 * Ghi khách từ kênh ngoài (MCP/Telegram), cùng schema với waitlist.
 * Cần ít nhất phone hoặc zalo (ràng buộc CHECK trong DB).
 */
export async function createCustomerFromTelegram(params: {
  name: string;
  phone: string | null;
  zalo: string | null;
  email: string | null;
  enqueueWelcomeSequence: boolean;
}): Promise<CreateCustomerFromTelegramResult> {
  const name = params.name.trim();
  if (name.length < 2) {
    return { ok: false, error: "VALIDATION", message: "Tên phải có ít nhất 2 ký tự." };
  }
  const phone = params.phone?.trim() || null;
  const zalo = params.zalo?.trim() || null;
  const emailRaw = params.email?.trim() || null;
  const email = emailRaw || null;

  if (!phone && !zalo) {
    return {
      ok: false,
      error: "VALIDATION",
      message: "Cần ít nhất số điện thoại hoặc Zalo (đồng bộ với CRM / SQLite CHECK).",
    };
  }
  if (email && !isValidEmail(email)) {
    return { ok: false, error: "VALIDATION", message: "Email không hợp lệ." };
  }

  const registrationDate = new Date().toISOString();
  let customerId: number;
  let created = true;

  try {
    const customer = await insertCustomer(name, email, phone, zalo, registrationDate);
    customerId = customer.id;
  } catch {
    const existing =
      (await findCustomerByPhoneOrEmail({ phone, email })) ??
      (zalo ? await findCustomerByZalo(zalo) : null);
    if (!existing) {
      return {
        ok: false,
        error: "CUSTOMER_CONFLICT",
        message: "Không thể tạo khách (trùng ràng buộc hoặc lỗi DB).",
      };
    }
    customerId = existing.id;
    created = false;
  }

  let emailJobsScheduled: number | undefined;
  if (email && params.enqueueWelcomeSequence) {
    try {
      const isTestMode = /\+test[^@]*@/i.test(email);
      const normalizedTestEmail = isTestMode ? email.replace(/\+test[^@]*(?=@)/i, "") : email;
      const seq = loadEmailSequence();
      const now = Date.now();
      const steps = seq.map((s) => ({
        ...s,
        body: s.body.replace(/Chao ban/gi, `Chao ${name || "ban"}`),
      }));

      if (isTestMode) {
        for (const step of steps) {
          await sendEmail({ to: normalizedTestEmail, subject: step.subject, text: step.body });
        }
        emailJobsScheduled = steps.length;
      } else {
        const first = await sendEmail({ to: email, subject: steps[0].subject, text: steps[0].body });
        if (!first.sent) {
          console.error("[mcpCustomer] first email send failed", { to: email, reason: first.reason });
        }
        const futureOffsets = [2 * 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000];
        let scheduled = 0;
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
          scheduled += 1;
        }
        emailJobsScheduled = scheduled;
      }
    } catch (e) {
      console.error("[mcpCustomer] sequence/email error", e);
    }
  }

  return {
    ok: true,
    customer_id: customerId,
    created,
    deduped: !created,
    ...(emailJobsScheduled != null ? { email_jobs_scheduled: emailJobsScheduled } : {}),
    message: created ? "Đã tạo khách mới." : "Khách đã tồn tại (ghép theo SĐT/email); không tạo bản ghi trùng.",
  };
}
