## Deployment compatibility fix

This revision pins React and React DOM to matching 19.1.1 versions, adds npm peer-dependency compatibility for Vercel installs, and lets the server read the existing `NEXT_PUBLIC_SUPABASE_URL` environment variable. The build has **not** been verified against Vercel in this environment; if another error appears, inspect the final lines of the deployment log.

# Salon Booking System — independent concept demo

**This replaces the previous OpenAI chatbot entirely.** No OpenAI API key, AI inference, or per-message AI charges.

Features: responsive Next.js site, real server-side availability, atomic conflict-safe appointments in Supabase, Twilio booking texts and next-day reminders, and staff-readable private Google Sheets append integration. No staff dashboard is included; the Sheet is staff-facing and should be shared only with authorized salon employees.

**Important:** This is a starter implementation, not a production-certified booking platform. It needs real salon approval, proper staffing and service data, messaging consent/compliance review, operational monitoring, and security testing before real customer use. It is not affiliated with Amici Salon & Spa.

## 1. Upload to GitHub (your existing `salon-ai-demo` repo)

Unzip the download on Windows. Upload **all contents** of the extracted folder to the GitHub repository root, so `app/`, `lib/`, `supabase/`, `package.json`, and `vercel.json` appear alongside each other. Delete the old `components/Chat.tsx`, old `lib/salon.ts`, and any old `app/api/chat/` folder from GitHub; remove other obsolete files if they conflict. Do **not** upload the ZIP itself. `app/page.tsx` and `app/globals.css` must be overwritten with these new versions. If using Git locally, delete old files before committing.

## 2. Supabase database

Create a project at https://supabase.com. In **SQL Editor**, run `supabase/schema.sql` once. In **Project Settings > API**, copy the project URL to `NEXT_PUBLIC_SUPABASE_URL` and the **service_role** key to `SUPABASE_SERVICE_ROLE_KEY` in Vercel. These are server-only secrets: never use `NEXT_PUBLIC_` with the service key, never commit it to GitHub. The SQL enables row-level security and creates an exclusion constraint that prevents overlapping confirmed appointments for the same stylist, even during simultaneous requests.

## 3. Turnstile anti-bot protection (required for public bookings)

Create a Cloudflare Turnstile widget for your Vercel domain. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel. Add any production and preview domains you use. The booking endpoint **rejects all submissions in production if Turnstile is not configured**, intentionally, to prevent abuse. Use the appropriate Cloudflare test keys only for local testing.

## 4. Twilio texts

Create a Twilio account and Messaging Service. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID` in Vercel. Configure an SMS-capable number/sender and complete any applicable US A2P 10DLC registration. Twilio trial accounts may only message verified numbers. Customers enter E.164 numbers like `+12035550123`. Confirmation SMS is sent after database insertion; if SMS fails, the appointment is **still confirmed**, and the API reports delivery as pending. Use Twilio Messaging Service opt-out handling for STOP. The checkbox is for transactional appointment texts only; don't send promotional campaigns without separate permission. Customize salon identity and message wording before launch.

## 5. Google Sheets staff access

Create a private Google Sheet with a tab named **Appointments**. Put these headers in row 1: `ID | Customer | Phone | Service | Stylist | Local date/time | Status`. Create a Google Cloud service account, enable Google Sheets API, and share the spreadsheet **only** with the service account email (Editor) and authorized employees (Viewer). Set `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (entire PEM private key, with escaped `\\n` if pasted on one line), and `GOOGLE_SHEET_ID` (from the sheet URL) in Vercel. **Never share the Sheet publicly**; it contains personal information. The sheet is a read-only staff *view* and is append-only; changes in Sheets do **not** update database availability. A sheet write failure does not cancel the booking. For production, implement a retry queue/reconciliation and cancellation synchronization; staff should use Supabase to verify any booking if the sheet is delayed.

## 6. Vercel deployment

Import or use the existing GitHub repo in Vercel. Set Root Directory to `./` and Framework Preset to Next.js. Add the environment variables from `.env.example` under **Settings > Environment Variables** (Production; optionally Preview). Remove obsolete `OPENAI_API_KEY` and `OPENAI_MODEL` variables: they are no longer needed. Add a long random `CRON_SECRET` to protect the reminder route. Deploy the newest GitHub commit. Test the website and booking flow.

Vercel cron is configured in `vercel.json` to run once a day at **13:00 UTC**. It sends reminders for appointments on the **next calendar day in America/New_York**, not exactly 24 hours ahead. During daylight saving time this is 9 AM Eastern; in winter it is 8 AM Eastern. Daily scheduling works with Vercel Hobby restrictions, but commercial operation requires checking Vercel plan eligibility and quotas. Cron runs only on production. If the cron sends fail, they are retried on the next scheduled run (which may be too late for an appointment), so monitor failures.

## 7. Customize for a real salon

Edit `lib/config.ts`: service names, durations, stylist names, and opening hours. The demo assumes all stylists share salon hours and are always working, which is **not suitable for live deployment** without adding stylist-specific shifts, breaks, vacation and closures. Do not accept real bookings until real schedules are represented. Replace all concept branding and copy with permission from the business.

## 8. Test checklist

- [ ] `npm install` and `npm run build` locally or check Vercel build logs
- [ ] Select service/stylist/date and see open slots
- [ ] Book a test appointment with a consented phone and Turnstile token
- [ ] Confirm Supabase has exactly one row
- [ ] Confirm a second attempt for the same stylist/time is blocked
- [ ] Confirm Google Sheet row appears and only authorized staff can see it
- [ ] Confirm Twilio SMS is delivered and STOP opt-out works
- [ ] Confirm cron job works and duplicate sends are prevented
- [ ] Test mobile layout, invalid inputs, and error states
- [ ] Configure rate limiting, alerting, retention/deletion, backups, and reconciliation before public launch

## Operational limitations

- No customer cancellation/reschedule or staff editing UI. Cancellations can be handled by authorized staff in Supabase for now; the Google Sheet will **not** automatically reflect edits.
- No staff-specific availability, breaks, vacations, holiday closures, payment processing, or deposits.
- No durable delivery queue. Twilio and Sheets failures are logged but may require manual reconciliation.
- SMS opt-out is delegated to Twilio Messaging Service; privacy/terms pages and business-specific consent review are still needed.
- Basic Turnstile bot protection is included; add server-side rate limiting and monitoring before marketing to real customers.
- Appointment details are stored in Supabase and a restricted Google Sheet. Treat them as private customer data.

## Local development

`npm install`, copy `.env.example` to `.env.local`, fill your private keys, then `npm run dev`. Do not commit `.env.local`.
