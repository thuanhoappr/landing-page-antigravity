import crypto from "node:crypto";

type CheckoutFields = {
  order_amount: string;
  merchant: string;
  currency: "VND";
  operation: "PURCHASE";
  order_description: string;
  order_invoice_number: string;
  customer_id?: string;
  payment_method?: "BANK_TRANSFER";
  success_url: string;
  error_url: string;
  cancel_url: string;
};

const SIGNED_FIELDS: Array<keyof CheckoutFields> = [
  "order_amount",
  "merchant",
  "currency",
  "operation",
  "order_description",
  "order_invoice_number",
  "customer_id",
  "payment_method",
  "success_url",
  "error_url",
  "cancel_url",
];

export function signSepayFields(fields: CheckoutFields, secretKey: string) {
  const signedString = SIGNED_FIELDS.filter((k) => fields[k])
    .map((k) => `${k}=${fields[k]}`)
    .join(",");

  return crypto.createHmac("sha256", secretKey).update(signedString).digest("base64");
}

export function getBaseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://pickleball30phut.com";
}

export function getCheckoutEndpoint() {
  // Production checkout endpoint theo Quick Start SePay.
  return "https://pay.sepay.vn/v1/checkout/init";
}
