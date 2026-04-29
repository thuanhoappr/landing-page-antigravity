import fs from "node:fs";
import path from "node:path";

export type EmailStep = {
  step: 1 | 2 | 3;
  title: string;
  subject: string;
  body: string;
};

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
  const content = fs.readFileSync(filePath, "utf8");
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
    throw new Error("email_sequence.md chua du 3 email.");
  }
  return [
    parseStepBlock(1, byStep.get(1)!),
    parseStepBlock(2, byStep.get(2)!),
    parseStepBlock(3, byStep.get(3)!),
  ];
}
