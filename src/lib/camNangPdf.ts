import { readFile } from "node:fs/promises";
import path from "node:path";

export const CAM_NANG_PDF_FILENAME = "Cam-nang-Pickleball-Newbie.pdf";

/** Các path có thể có PDF (Vercel standalone vs dev). */
export function getCamNangPdfCandidates(): string[] {
  const cwd = process.cwd();
  return [
    path.join(cwd, "public", "downloads", CAM_NANG_PDF_FILENAME),
    path.join(cwd, "..", "public", "downloads", CAM_NANG_PDF_FILENAME),
    path.join(cwd, ".next", "standalone", "public", "downloads", CAM_NANG_PDF_FILENAME),
  ];
}

export async function readCamNangPdfBuffer(): Promise<Buffer> {
  let lastErr: unknown;
  for (const filePath of getCamNangPdfCandidates()) {
    try {
      return await readFile(filePath);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("PDF_NOT_FOUND");
}
