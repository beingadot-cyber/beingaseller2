/**
 * Sends email via Gmail SMTP using fetch to a simple relay,
 * or via Nodemailer if available. We use a lightweight fetch-based
 * approach compatible with Vercel Edge / Node runtime.
 *
 * Required env vars:
 *   GMAIL_USER   = beingadot@gmail.com
 *   GMAIL_PASS   = <16-char Google App Password>
 */

export async function sendOtpEmail(to: string, otp: string): Promise<void> {
  const user = process.env.GMAIL_USER ?? "beingadot@gmail.com";
  const pass = process.env.GMAIL_PASS ?? "";

  if (!pass) {
    // Dev mode — just log the OTP
    console.log(`[OTP] ${to} → ${otp}`);
    return;
  }

  // Use Nodemailer dynamically
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"Beingaseller" <${user}>`,
    to,
    subject: "Your Beingaseller Login OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#08080f;color:#f1f1f1;border-radius:16px;padding:32px">
        <div style="font-size:24px;font-weight:800;margin-bottom:8px">BEINGA<span style="color:#c8ff00">SELLER</span></div>
        <div style="font-size:14px;color:#888;margin-bottom:24px">Your one-time login code</div>
        <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#c8ff00;text-align:center;padding:24px;background:#13131f;border-radius:12px;margin-bottom:24px">${otp}</div>
        <div style="font-size:13px;color:#666">This code expires in <strong style="color:#f1f1f1">10 minutes</strong>. Do not share it with anyone.</div>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  customerName: string,
  orderId: string,
  items: { name: string; size: string; qty: number; price: number }[],
  total: number
): Promise<void> {
  const user = process.env.GMAIL_USER ?? "beingadot@gmail.com";
  const pass = process.env.GMAIL_PASS ?? "";
  if (!pass) return;

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const itemRows = items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #222">${i.name} (${i.size})</td><td style="padding:8px 0;border-bottom:1px solid #222;text-align:right">×${i.qty} — ₹${i.price * i.qty}</td></tr>`)
    .join("");

  await transporter.sendMail({
    from: `"Beingaseller" <${user}>`,
    to,
    subject: `Order Confirmed — #${orderId.slice(0, 8).toUpperCase()}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#08080f;color:#f1f1f1;border-radius:16px;padding:32px">
        <div style="font-size:24px;font-weight:800;margin-bottom:4px">BEINGA<span style="color:#c8ff00">SELLER</span></div>
        <div style="font-size:13px;color:#888;margin-bottom:24px">Order Confirmation</div>
        <div style="font-size:18px;font-weight:700;margin-bottom:4px">Hey ${customerName}! 🎉</div>
        <div style="font-size:14px;color:#aaa;margin-bottom:24px">Your order is confirmed and being prepared.</div>
        <div style="background:#13131f;border-radius:12px;padding:20px;margin-bottom:20px">
          <div style="font-size:11px;color:#666;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Order #${orderId.slice(0, 8).toUpperCase()}</div>
          <table style="width:100%;border-collapse:collapse">${itemRows}</table>
          <div style="display:flex;justify-content:space-between;font-weight:800;font-size:16px;margin-top:12px;padding-top:12px;border-top:1px solid #333"><span>Total</span><span style="color:#c8ff00">₹${total}</span></div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/my-orders" style="display:block;background:#c8ff00;color:#08080f;text-align:center;padding:14px;border-radius:10px;font-weight:800;text-decoration:none;font-size:15px">Track Your Order →</a>
      </div>
    `,
  });
}
