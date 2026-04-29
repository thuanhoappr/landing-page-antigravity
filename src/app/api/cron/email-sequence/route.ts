import { NextResponse } from "next/server";
import {
  getDueEmailAutomationJobs,
  markEmailAutomationJobSent,
} from "@/lib/brainDb";
import { sendEmail } from "@/lib/resend";

export const runtime = "nodejs";
/** Tránh cache tĩnh — cron phải chạy động mỗi lần Vercel gọi. */
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  const bearer = request.headers.get("authorization") ?? "";
  return bearer === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await getDueEmailAutomationJobs(50);
  let sent = 0;
  for (const job of jobs) {
    try {
      await sendEmail({ to: job.email, subject: job.subject, text: job.body });
      await markEmailAutomationJobSent(job.id);
      sent += 1;
    } catch (e) {
      console.error("[cron/email-sequence] send failed", e);
    }
  }

  return NextResponse.json({ ok: true, processed: jobs.length, sent });
}
