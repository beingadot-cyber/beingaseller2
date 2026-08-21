# Beingaseller v3 — Environment Variables Setup

Add these to Vercel → Project → Settings → Environment Variables

## 🔐 Required (Already set)
```
DATABASE_URL=          # Neon PostgreSQL connection string
ADMIN_PASSWORD=        # Your admin panel password
BLOB_READ_WRITE_TOKEN= # Vercel Blob (auto-added when you connect Blob store)
```

## 📧 Email OTP (Gmail)
```
GMAIL_USER=beingadot@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx   # 16-char Google App Password
```
How to get GMAIL_PASS:
1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
2. Then go to: myaccount.google.com/apppasswords
3. Create app password for "Mail"
4. Copy the 16-character password → paste as GMAIL_PASS

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

## 🛒 Meesho Auto-Order (future automation)
The meeshoUrl is now saved with each product in the database.
When a customer places an order, the meeshoUrl is part of the product data
and can be used by a Puppeteer bot to place the order automatically on Meesho.
