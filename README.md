# Dialoft AI — Real Estate Lead Qualification

AI voice agent that calls homeowners, qualifies them as sellers, and logs everything to a dashboard.

Built with **Retell AI** (voice agent), **Twilio** (telephony), **Express** (backend), **Supabase** (database), and **React** (dashboard).

---

## Architecture

```
Browser (Dashboard)
       │
       ▼
React + Vite  ──── /api proxy ───▶  Express Backend (port 3001)
                                          │
                       ┌──────────────────┼──────────────────┐
                       ▼                  ▼                  ▼
                  Retell AI API      Supabase DB       Twilio (via Retell)
                  (trigger call)    (store data)       (SIP/PSTN)
                       │
                       │ mid-call tool call
                       ▼
               POST /tools/get_property_estimate
                       │
                       │ post-call webhook
                       ▼
               POST /webhooks/retell
```

---

## Prerequisites

| Service     | What you need                           | Free tier? |
|-------------|------------------------------------------|------------|
| Retell AI   | Account + Agent configured (see below)  | Yes        |
| Twilio      | Free trial account + verified number    | Yes        |
| Supabase    | Project created                         | Yes        |
| Node.js     | v18+                                    | —          |
| ngrok       | For local webhook exposure              | Yes        |

---

## 1. Clone & install

```bash
git clone https://github.com/YOUR_ORG/dialoft-ai.git
cd dialoft-ai

# Backend
cd backend && npm install

# Dashboard
cd ../dashboard && npm install
```

---

## 2. Supabase setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and paste the contents of `supabase/schema.sql`
3. Run it — this creates the `calls`, `transcripts`, and `tool_calls` tables
4. Copy your **Project URL** and **service_role key** from Settings → API

---

## 3. Twilio setup

1. Sign up at https://twilio.com (free trial)
2. Get a phone number: Console → Phone Numbers → Manage → Buy a number
3. **Verify your personal number**: Console → Phone Numbers → Verified Caller IDs
   (Free trial only allows calling verified numbers)
4. Copy your Account SID and Auth Token from the Console dashboard

---

## 4. Retell AI setup

### 4a. Create an agent

1. Go to https://beta.retellai.com → Agents → Create Agent
2. Set LLM to `claude-3-5-sonnet`
3. Choose a natural voice (e.g. `11labs-Adrian`)
4. Paste the **System Prompt** from `RETELL_CONFIG.md`
5. Set interruption sensitivity to **Medium**
6. Enable **Backchannel**

### 4b. Add dynamic variables

In agent settings → Dynamic Variables, add:
- `owner_name`
- `property_address`  
- `lead_source`
- `agent_name`

### 4c. Add custom tool

In agent settings → Tools → Add Tool:
- **Name**: `get_property_estimate`
- **URL**: `https://YOUR_NGROK_URL/tools/get_property_estimate`
- **Method**: POST
- **Description**: (copy from `RETELL_CONFIG.md`)
- **Parameters**: `property_address` (string, required)

### 4d. Add post-call analysis fields

In agent settings → Post Call Analysis, add the 6 fields from `RETELL_CONFIG.md`.

### 4e. Connect Twilio

1. In Retell dashboard → Phone Numbers → Add Number
2. Select "Import from Twilio"
3. Enter your Twilio Account SID, Auth Token, and phone number

### 4f. Configure webhook

In Retell dashboard → Settings → Webhooks:
- URL: `https://YOUR_NGROK_URL/webhooks/retell`
- Events: `call_started`, `call_ended`, `call_analyzed`
- Copy the **Webhook Secret** for your `.env`

---

## 5. Environment variables

```bash
# Backend
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

```env
RETELL_API_KEY=           # Retell dashboard → Settings → API Keys
RETELL_AGENT_ID=          # Retell dashboard → Agents → your agent → copy ID
RETELL_WEBHOOK_SECRET=    # Retell dashboard → Settings → Webhooks → secret

TWILIO_ACCOUNT_SID=       # Twilio console
TWILIO_AUTH_TOKEN=        # Twilio console
TWILIO_PHONE_NUMBER=      # E.164 format: +1XXXXXXXXXX

SUPABASE_URL=             # Supabase project settings
SUPABASE_SERVICE_ROLE_KEY= # Supabase project settings → service_role

PORT=3001
DASHBOARD_URL=http://localhost:3000
AGENT_NAME=Alex
```

---

## 6. Expose local backend (for webhooks)

Retell needs to reach your backend. Use ngrok:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3001
```

Copy the HTTPS URL (e.g. `https://abc123.ngrok.io`) and:
- Update the tool URL in Retell to `https://abc123.ngrok.io/tools/get_property_estimate`
- Update the webhook URL to `https://abc123.ngrok.io/webhooks/retell`

---

## 7. Run

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Dashboard:**
```bash
cd dashboard
npm run dev
```

**Terminal 3 — ngrok:**
```bash
ngrok http 3001
```

Dashboard: http://localhost:3000  
Backend API: http://localhost:3001  
Health check: http://localhost:3001/health

---

## 8. Trigger a test call

### Via dashboard
1. Go to http://localhost:3000/new-call
2. Fill in homeowner name, address, and your verified phone number
3. Click "Start Call" — your phone will ring within a few seconds

### Via API
```bash
curl -X POST http://localhost:3001/calls/outbound \
  -H "Content-Type: application/json" \
  -d '{
    "owner_name": "Sarah",
    "property_address": "142 Maple Street, Austin TX 78701",
    "lead_source": "our website enquiry form",
    "to_number": "+1XXXXXXXXXX"
  }'
```

---

## API Reference

| Method | Endpoint                          | Description                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/calls/outbound`                 | Trigger an outbound call             |
| GET    | `/calls`                          | List all calls (paginated)           |
| GET    | `/calls/:call_id`                 | Get call + transcript                |
| GET    | `/analytics/summary`              | Aggregate stats                      |
| POST   | `/tools/get_property_estimate`    | Mid-call property estimate tool      |
| POST   | `/webhooks/retell`                | Retell post-call webhook             |

---

## Database schema

```
calls          — one row per call, all analysis fields
transcripts    — utterances, foreign key → calls.call_id
tool_calls     — log of every get_property_estimate invocation
```

See `supabase/schema.sql` for the full definition.

---

## How it works end-to-end

1. Dashboard POSTs to `/calls/outbound` with homeowner details
2. Backend calls Retell API (`/v2/create-phone-call`) with dynamic variables
3. Retell dials the homeowner via Twilio
4. During the call, the LLM calls `get_property_estimate` — backend returns mock data
5. Agent uses the estimate naturally in conversation
6. After the call ends, Retell sends `call_ended` webhook — transcript stored
7. After analysis, Retell sends `call_analyzed` webhook — 6 analysis fields stored
8. Dashboard shows qualified rate, sentiment, timeline, full transcripts

---

## Project structure

```
dialoft-ai/
├── backend/
│   ├── server.js              # Express app entry
│   ├── routes/
│   │   ├── calls.js           # Outbound trigger + list/get
│   │   ├── webhooks.js        # Retell webhook handler
│   │   ├── tools.js           # get_property_estimate
│   │   └── analytics.js       # Aggregate stats
│   ├── middleware/
│   │   └── retellAuth.js      # HMAC webhook signature verification
│   ├── lib/
│   │   └── supabase.js        # Supabase client
│   └── .env.example
├── dashboard/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # Analytics overview
│   │   │   ├── CallsList.jsx  # Paginated call table
│   │   │   ├── CallDetail.jsx # Transcript + analysis
│   │   │   └── NewCall.jsx    # Outbound trigger form
│   │   ├── components/
│   │   │   ├── Layout.jsx     # Sidebar nav
│   │   │   └── Badges.jsx     # Status/sentiment/qualified badges
│   │   └── lib/api.js         # Axios API client
│   └── .env.example
├── supabase/
│   └── schema.sql             # Run this first
├── RETELL_CONFIG.md           # Full agent config + prompt
└── README.md
```

---

## Retell AI — key concepts (for review call)

**Prompt engineering**: The agent uses filler words (`you know`, `honestly`, `actually`), varied sentence lengths, and listens fully before responding. Interruption sensitivity is Medium — allows natural interjections. Backchannel enabled for `mm-hmm`, `yeah` acknowledgements.

**Dynamic variables**: Injected per-call via `retell_llm_dynamic_variables` in the API payload. Referenced in the prompt as `{{variable_name}}`. If a variable is missing, Retell leaves the placeholder blank — always provide all variables.

**Custom tools**: The LLM decides when to call `get_property_estimate` based on the tool description and conversation context. Retell sends a POST to our backend with `call_id` and `args`. We respond with JSON the LLM reads naturally.

**Post-call analysis**: Defined as structured fields with types (enum/string/boolean). After the call, Retell's LLM reads the full transcript and fills each field. Delivered in the `call_analyzed` webhook under `call.call_analysis.custom_analysis_data`.

**Outbound API**: `POST /v2/create-phone-call` with `from_number`, `to_number`, `agent_id`, and `retell_llm_dynamic_variables`. Returns a `call_id` immediately; status updates come via webhook.