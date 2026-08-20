import crypto from "node:crypto";

/**
 * PhonePe PG helpers.
 *
 * Reads credentials from environment variables (never hardcoded):
 *   PHONEPE_MERCHANT_ID  — merchant id issued by PhonePe
 *   PHONEPE_SALT_KEY     — salt key for checksum generation
 *   PHONEPE_SALT_INDEX   — usually "1"
 *   PHONEPE_ENV          — "UAT" (sandbox) or "PROD" (default)
 *
 * When credentials are absent the app runs in DEMO mode so the full
 * checkout flow can be tested end-to-end; drop the env vars in and it
 * goes live with zero code changes.
 */
export const PHONEPE_CONFIG = {
  merchantId: process.env.PHONEPE_MERCHANT_ID ?? "",
  saltKey: process.env.PHONEPE_SALT_KEY ?? "",
  saltIndex: process.env.PHONEPE_SALT_INDEX ?? "1",
  env: (process.env.PHONEPE_ENV ?? "PROD").toUpperCase(),
};

export function phonepeConfigured(): boolean {
  return Boolean(PHONEPE_CONFIG.merchantId && PHONEPE_CONFIG.saltKey);
}

export function phonepeBaseUrl(): string {
  return PHONEPE_CONFIG.env === "UAT"
    ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
    : "https://api.phonepe.com/apis/hermes";
}

export function sha256hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/** Resolve the public origin for redirect/callback URLs. */
export function appBaseUrl(req: Request): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  try {
    return new URL(req.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/** Build the standard X-VERIFY checksum PhonePe expects. */
export function xVerify(payloadPath: string): string {
  return (
    sha256hex(payloadPath + PHONEPE_CONFIG.saltKey) +
    "###" +
    PHONEPE_CONFIG.saltIndex
  );
}
