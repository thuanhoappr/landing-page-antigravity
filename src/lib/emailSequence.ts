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
  const chunks = content.split(/^#\s*Email\s+\d+[^\n]*$/gim).map((s) => s.trim()).filter(Boolean);
  if (chunks.length < 3) {
    throw new Error("email_sequence.md chua du 3 email.");
  }
  return [
    parseStepBlock(1, chunks[0]),
    parseStepBlock(2, chunks[1]),
    parseStepBlock(3, chunks[2]),
  ];
}
