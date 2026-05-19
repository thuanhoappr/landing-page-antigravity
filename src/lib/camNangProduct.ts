/** Day 19 — Cẩm nang NewBie (sản phẩm số PDF). */
export const CAM_NANG_PRICE_VND = 68_000;
export const CAM_NANG_SLUG = "cam-nang-newbie";
export const CAM_NANG_DOWNLOAD_PATH = "/downloads/Cam-nang-Pickleball-Newbie.pdf";

export function getCamNangProductId(): number | null {
  const raw = process.env.CAM_NANG_PRODUCT_ID?.trim() || process.env.SEPAY_PRODUCT_ID?.trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isCamNangOrder(productId: number, productName: string): boolean {
  const envId = getCamNangProductId();
  if (envId != null && productId === envId) return true;
  return /cẩm nang|cam nang|newbie/i.test(productName);
}
