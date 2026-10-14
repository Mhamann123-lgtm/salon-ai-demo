# Salon AI Receptionist — Independent Concept Demo

A responsive Next.js website and server-side OpenAI-powered salon chatbot. This is an **independent portfolio demonstration**, **not an official Amici Salon & Spa website** and **not affiliated with the business**. No appointment booking or live calendar access is included.

## Requirements
- Node.js 20.9+ (Node 22 recommended)
- npm
- OpenAI API account and API key with available billing/credits
- GitHub and Vercel accounts for deployment

## Run locally
1. Open a terminal in this folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Edit `.env.local` and set `OPENAI_API_KEY` to your own API key. Do **not** put this key in client-side code or commit it.
5. Run `npm run dev`.
6. Visit `http://localhost:3000` and test the chat.

## Deploy to Vercel
1. Create a new GitHub repository (for example `salon-ai-demo`).
2. Upload the **contents** of this folder to the repository, including `package.json`. Never upload `.env.local`.
3. Log in at https://vercel.com and choose **Add New → Project**.
4. Import your GitHub repository. Vercel should automatically detect Next.js.
5. Under **Environment Variables**, add `OPENAI_API_KEY` with your real secret. Optionally add `OPENAI_MODEL` (defaults to `gpt-4.1-mini`).
6. Click **Deploy**. Vercel provides a `*.vercel.app` URL.
7. Open the deployed site, test the chat, test on mobile, and confirm there are no errors in the Vercel Function logs.
8. If you add or change environment variables later, redeploy so the deployment picks them up.

## Where to customize
- `lib/salon.ts`: salon details, example services, chatbot system prompt.
- `app/page.tsx`: homepage sections and links.
- `app/globals.css`: colors, typography, imagery, responsive layout.
- `components/Chat.tsx`: chat UI.
- `app/api/chat/route.ts`: server-side AI endpoint.

## Before using with real customers
- Get written permission to use a business's branding, name, photography, and verified business information.
- Replace generic stock/Unsplash images with properly licensed assets or business-provided photos.
- Verify services, pricing, hours, policies, and booking URLs with the business.
- Obtain authorization for any booking system integration. Do not claim real-time availability until connected.
- Add a privacy notice, data retention/deletion policy, and appropriate consent flows before collecting customer information.
- Add durable per-IP/user rate limiting, abuse monitoring, spend caps, and bot protection **before public promotion**. The demo currently limits request size and conversation length but does not implement rate limiting.
- Review SMS/email consent requirements before sending reminders or marketing.
- Check the AI model's current API pricing and Vercel hosting limits. API calls can incur charges.
- Avoid sending sensitive customer information to the AI model.

## Security notes
The API key is used only in the server route and loaded from `OPENAI_API_KEY`. Browser clients cannot read it. Chat messages are sent to your server and then the model API; this demo does not store them in a database. Public endpoints can still be abused without rate limiting, so keep your API budget capped and avoid large-scale public launch until protections are in place.
