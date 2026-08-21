/**
 * Appends a row to a Google Sheet via the Sheets REST API.
 *
 * Required env vars:
 *   GOOGLE_SHEETS_ID          = spreadsheet ID from the URL
 *   GOOGLE_SERVICE_ACCOUNT_JSON = full JSON of the service account key
 */

async function getAccessToken(): Promise<string> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? "";
  if (!raw) return "";
  const sa = JSON.parse(raw);

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const sig = sign.sign(sa.private_key, "base64url");

  const jwt = `${header}.${payload}.${sig}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });
  const data = await res.json();
  return data.access_token ?? "";
}

export async function appendToSheet(sheetTab: string, values: (string | number)[]): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEETS_ID ?? "";
  if (!sheetId) { console.log("[sheets] GOOGLE_SHEETS_ID not set — skipping"); return; }

  const token = await getAccessToken();
  if (!token) { console.log("[sheets] No access token — skipping"); return; }

  const range = encodeURIComponent(`${sheetTab}!A1`);
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    }
  );
}

export async function logOrder(order: {
  id: string; customerName: string; phone: string; email: string | null;
  addressLine1: string; city: string; state: string; pincode: string;
  items: { name: string; size: string; qty: number; price: number }[];
  total: number; status: string; createdAt: Date;
}): Promise<void> {
  const itemsSummary = order.items.map((i) => `${i.name}(${i.size})×${i.qty}`).join(", ");
  await appendToSheet("Orders", [
    order.id.slice(0, 8).toUpperCase(),
    order.createdAt.toISOString().slice(0, 19).replace("T", " "),
    order.customerName,
    order.phone,
    order.email ?? "",
    `${order.addressLine1}, ${order.city}, ${order.state} - ${order.pincode}`,
    itemsSummary,
    order.total,
    order.status,
  ]);
}

export async function logComplaint(c: {
  id: string; customerName: string; email: string; phone: string;
  productName: string; rating: number; comment: string; location: string; createdAt: Date;
}): Promise<void> {
  await appendToSheet("Complaints", [
    c.id.slice(0, 8).toUpperCase(),
    c.createdAt.toISOString().slice(0, 19).replace("T", " "),
    c.customerName,
    c.phone,
    c.email,
    c.productName,
    c.rating,
    c.comment,
    c.location,
  ]);
}
