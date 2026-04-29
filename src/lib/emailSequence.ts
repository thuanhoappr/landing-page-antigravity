import fs from "node:fs";
import path from "node:path";

export type EmailStep = {
  step: 1 | 2 | 3;
  title: string;
  subject: string;
  body: string;
};

function getFallbackEmailSequence(): EmailStep[] {
  return [
    {
      step: 1,
      title: "Email 1",
      subject: "Chào mừng bạn đến với Pickleball 30 Phút",
      body:
        "Chào bạn,\n\nCảm ơn bạn đã để lại thông tin tại Pickleball 30 Phút.\nTrong vài ngày tới, mình sẽ gửi tiếp các email giá trị để giúp bạn vào sân tự tin hơn.\n\nCTA: https://pickleball30phut.com/thanh-toan",
    },
    {
      step: 2,
      title: "Email 2",
      subject: "Sai lầm lớn nhất của người mới chơi Pickleball",
      body:
        "Chào bạn,\n\nInsight quan trọng nhất: đừng cố đánh hay quá sớm. Hãy ưu tiên tư thế sẵn sàng, điểm chạm ổn định và giữ nhịp đơn giản.\n\nCTA: https://pickleball30phut.com/thanh-toan",
    },
    {
      step: 3,
      title: "Email 3",
      subject: "Sẵn sàng vào sân tự tin? Đây là lộ trình dành cho bạn",
      body:
        "Chào bạn,\n\nNếu bạn muốn rút ngắn thời gian tự mò, lộ trình nhập môn này sẽ giúp bạn biết tập gì trước - sau và vào sân tự tin hơn.\n\nCTA: https://pickleball30phut.com/thanh-toan",
    },
  ];
}

function parseStepBlock(step: 1 | 2 | 3, raw: string): EmailStep {
  const subjectMatch = raw.match(/\*\*Subject:\*\*\s*(.+)/i);
  const subject = (subjectMatch?.[1] || "").trim();
  const ctaMatch = raw.match(/\*\*CTA:\*\*[\s\S]*?(https?:\/\/[^\s]+)/i);
  const cta = ctaMatch?.[1]?.trim() || "https://pickleball30phut.com/thanh-toan";
  const body = raw
    .replace(/\*\*Subject:\*\*.+/i, "")
    .replace(/\*\*CTA:\*\*[\s\S]*$/i, "")
    .trim();

  const merged = `${body}\n\nCTA: ${cta}`.trim();
  return {
    step,
    title: `Email ${step}`,
    subject: subject || `Email ${step} - Pickleball 30 Phut`,
    body: merged,
  };
}

export function loadEmailSequence(): EmailStep[] {
  const filePath = path.join(process.cwd(), "my-brain", "email_sequence.md");
  let content = "";
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    console.error("[emailSequence] cannot read email_sequence.md, use fallback", e);
    return getFallbackEmailSequence();
  }
  // Doc dung 3 block bat dau bang "# Email X ...", bo qua dong mo dau khong thuoc block.
  const matches = [
    ...content.matchAll(
      /^#\s*Email\s+([123])[^\n]*\n([\s\S]*?)(?=^#\s*Email\s+[123][^\n]*\n|$)/gim,
    ),
  ];
  const byStep = new Map<number, string>();
  for (const m of matches) {
    const step = Number(m[1]);
    const body = (m[2] || "").trim();
    if (step >= 1 && step <= 3 && body) byStep.set(step, body);
  }
  if (byStep.size < 3) {
    console.error("[emailSequence] email_sequence.md invalid format, use fallback");
    return getFallbackEmailSequence();
  }
  return [
    parseStepBlock(1, byStep.get(1)!),
    parseStepBlock(2, byStep.get(2)!),
    parseStepBlock(3, byStep.get(3)!),
  ];
}
