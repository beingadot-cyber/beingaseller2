# Beingaseller v3 — Environment Variables Setup

Add these to Vercel → Project → Settings → Environment Variables

## 🔐 Required (Already set)
```
DATABASE_URL=          # Neon PostgreSQL connection string
ADMIN_PASSWORD=        # Your admin panel password
BLOB_READ_WRITE_TOKEN= # Vercel Blob (auto-added when you connect Blob store)
```

## 👤 Customer Login (name + mobile number, no OTP)
Customer login no longer uses email/OTP — a customer just enters their
name and 10-digit mobile number and is logged straight in (or back into
their existing account if that number has ordered before). No env vars
needed for this; it's just the Postgres `customers` table.

## 📧 Order confirmation email (Gmail)
Still used to email the customer a receipt once an order is PAID.
```
GMAIL_USER=beingadot@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx   # 16-char Google App Password
```
How to get GMAIL_PASS:
1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
2. Then go to: myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Copy the 16-character password → paste as GMAIL_PASS

If this isn't set, the app just skips sending the email — everything
else still works.

## 📊 Google Sheets (Order + Complaint logging)
```
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":...}
```
How to set up:
1. Go to console.cloud.google.com → Create project
2. Enable "Google Sheets API"
3. Create Service Account → download JSON key
4. Paste the ENTIRE JSON as GOOGLE_SERVICE_ACCOUNT_JSON
5. Open your Google Sheet → Share → paste service account email → Editor
6. Your Sheet needs 2 tabs: "Orders" and "Complaints"
   - Orders headers: Order ID | Date | Name | Phone | Email | Address | Products | Total | Status
   - Complaints headers: ID | Date | Name | Phone | Email | Product | Rating | Comment | Location

## 💳 PhonePe Payments (when ready)
```
PHONEPE_MERCHANT_ID=
PHONEPE_SALT_KEY=
PHONEPE_SALT_INDEX=1
NEXT_PUBLIC_BASE_URL=https://yourdomain.vercel.app
```
Without these set, checkout runs in DEMO mode (simulated payment).

## 🎟️ Coupon codes
Hardcoded in `src/lib/coupons.ts` for now — edit that file to add, change,
or remove codes before you launch for real. Currently live:
```
ILOVEYOU  →  100% off (subtotal + shipping) — makes the order free
```
When a coupon brings the total to ₹0, checkout skips PhonePe entirely,
marks the order PAID immediately, and still logs it to the "Orders"
Google Sheet tab and sends the confirmation email (if GMAIL_PASS is set).
**Remove or change ILOVEYOU before real customers can see the checkout
page**, or anyone can order for free.

## 🛒 Meesho Auto-Order (future automation)
The meeshoUrl is now saved with each product in the database, and the
admin panel can auto-fill a new product's listing straight from a pasted
Meesho product link. Actually placing the matching order on Meesho when a
customer buys from you is NOT automated yet — that step is still manual.
