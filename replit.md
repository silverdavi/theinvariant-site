## Replit Agent Build Instructions — The Invariant (build-from-spec, you keep full source control)

You are building **The Invariant**: a 24/7 simulated newsroom + living magazine website.

This repo is **owned by the human**. You must implement features as real code in this repo (no hidden magic). The human wants full control of the source.

### Non‑negotiables
- **NO mock endpoints** and **NO fake placeholder success**.
- If an external API call fails, **do not replace it with a stub**. Fix the integration.
- **Do not silently switch models** because a call failed. Fix parameters / SDK usage.
- Keep everything deterministic and debuggable: logging, structured errors, DB rows.
- **Do not edit this `replit.md`** unless explicitly asked.

---

## 0) What to build (high level)

### The product
- A public site: old-magazine typography + vibrant accents.
- The homepage is a **living feed** of published stories.
- Stories have **freshness** (0–100) that drives UI decay (opacity fades when <20).
- A backend runs a **simulated newsroom**:
  - editorial meetings
  - story hunting
  - drafting/critique/finalize
  - image generation
  - FIFO queue publishing

### Models
- Text:
  - `gpt-5-nano`: trivial validation checks
  - `gpt-5-mini`: iteration (hunt, draft, critique, meeting)
  - `gpt-5.2`: finalization only
- Images:
  - `gemini-3-pro-image-preview`

### AWS deployment (later)
- Designed to deploy to EC2 behind Caddy, but the Replit build must run locally in Replit first.

---

## 1) Repository structure (you must create/maintain)

This repo already has a Next.js frontend in the root. You must **add a real backend** without destroying the existing frontend.

Target structure:

- `/app`, `/components`, `/public`, etc. (existing Next.js App Router frontend)
- `/backend/` (NEW)
  - `/src/server.ts` (Express/Fastify server)
  - `/src/db/` (schema + migrations)
  - `/src/services/` (gptService, taskRunner, scheduler, imageGenerator, freshness, newsResearch, storyQueue)
  - `/src/routes/` (api routes)
  - `/src/scripts/` (seed, run-once tools)

Root `package.json` should gain scripts to run:
- frontend dev
- backend dev
- both together (single Replit run command)

---

## 2) Local dev in Replit (must work)

### One-command run
- Use `concurrently` to run:
  - Next dev server on **port 3000**
  - Backend API on **port 3001**

### Frontend → backend proxy
- Configure `next.config.js` rewrites so:
  - `/api/*` (frontend) proxies to `http://localhost:3001/api/*`

This matches production design where Caddy proxies `/api/*` to the backend.

---

## 3) Environment variables (real calls)

Do not hardcode secrets.

Required env vars:
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`
- `DATABASE_URL` (Postgres)

Optional:
- `PORT` (backend, default 3001)
- `NEXT_PUBLIC_SITE_NAME=The Invariant`

Create `.env.example` (no secrets) and document setup.

---

## 4) Database (Postgres) — tables you must implement

Use Postgres. Provide SQL migrations and a simple migration runner.

### Required tables
Implement at minimum:

#### `editor_profiles`
- id (uuid pk)
- name (text)
- beat (text)
- personality_config (jsonb)
- tone_rules (jsonb)
- is_active (bool)
- created_at, updated_at

#### `writer_profiles`
- id (uuid pk)
- name (text)
- beat (text)
- assigned_editor_id (uuid fk)
- personality_config (jsonb)
- tone_rules (jsonb)
- is_active (bool)
- created_at, updated_at

#### `intake_items`
- id (uuid pk)
- status (text: pending/accepted/rejected)
- priority (int 1–5)
- beat (text)
- summary (text)
- relevance (text)
- sources (jsonb array: [{title,url,type}]) — MUST be real URLs
- angle (text)
- submitted_by (text)
- assigned_editor_id (uuid fk)
- created_at, updated_at

#### `stories`
- id (uuid pk)
- status (draft/review/approved/queued/published/decaying/archived)
- title (text)
- section (text)
- summary (text)
- blocks (jsonb)
- authors (jsonb)
- intake_item_id (uuid fk)
- assigned_writer_id (uuid fk)
- assigned_editor_id (uuid fk)
- published_at (timestamp)
- lifespan_days (int)
- freshness (numeric)
- decay_rate (numeric)
- freshness_updated_at (timestamp)
- queue_position (int)
- image_url (text)
- image_style (jsonb)
- archived_at (timestamp)

#### `agent_timers`
- id (uuid pk)
- agent_type (text)
- agent_id (text)
- timer_name (text)
- cron_expression (text)
- task_type (text)
- task_payload (jsonb)
- is_active (bool)
- next_run_at (timestamp)

#### `agent_tasks`
- id (uuid pk)
- agent_type (text)
- agent_id (text)
- task_type (text)
- status (pending/running/completed/failed)
- priority (int)
- payload (jsonb)
- result (jsonb)
- error (text)
- created_at, started_at, completed_at

#### Transparency tables ("souls")
Implement:
- `agent_state`
- `agent_memory`
- `agent_reasoning`
- `agent_work_history`

#### `api_usage`
Track per-model usage:
- model
- tokens_in, tokens_out, tokens_total
- cost_estimate
- duration_ms
- agent_type, agent_id, task_id
- created_at

#### `editorial_meetings`
- id (uuid pk)
- meeting_time (timestamp)
- participants (jsonb)
- agenda (jsonb)
- decisions (jsonb)
- stories_considered (jsonb)
- story_selected (uuid fk to `stories.id`, nullable)

Critical: `story_selected` must never store an intake id.

---

## 5) Backend API (must exist and be real)

Implement an Express/Fastify backend at `http://localhost:3001/api`.

### Public endpoints
- `GET /api/health` → { ok: true }
- `GET /api/map` → array of published/decaying stories (include freshness, is_fresh, image_url)
- `GET /api/piece/:id` → full story by id
- `GET /api/stats` → counts, queue depth, agent activity summary

### Admin endpoints (simple auth is OK initially)
Implement minimal auth (token in header), then:
- `POST /api/admin/seed` (dev only) — seeds personas + timers
- `GET /api/admin/agent-tasks`
- `GET /api/admin/agent-timers`
- `GET /api/admin/agent-activity`
- `GET /api/admin/api-usage`

---

## 6) Scheduler + task runner (the newsroom engine)

### Cadence (cron)
Implement cron-based timers that enqueue tasks:

- Hourly editorial meeting: `0 * * * *`
- Small story hunts: `0 */6 * * *` per writer (stagger by offset hour)
- Major research: `0 9 */2 * *` per writer (optionally stagger)
- Publish next: `*/10 * * * *`

### Orchestration (automatic chaining)
You must implement this chaining rule:

- meeting decides to add story → create/assign work → enqueue `write_draft`
- `write_draft` completed → enqueue `critique`
- `critique` approves → enqueue `finalize`
- `finalize` completed → enqueue `generate_story_image`
- `generate_story_image` completed → put story in queue + publish pipeline

No manual step should be required for the core chain.

---

## 7) Model service (NO MOCKS)

Implement `backend/src/services/gptService.ts`:

### Requirements
- wrappers:
  - `callNano()` → `gpt-5-nano`
  - `callMini()` → `gpt-5-mini`
  - `callGPT52()` → `gpt-5.2`
- consistent JSON extraction helper
- retry only for safe transient errors
- write to `api_usage`
- log reasoning to transparency tables when relevant

### Task → model
- `editorial_meeting`, `hunt_small_story`, `write_draft`, `critique` → `gpt-5-mini`
- `finalize` → `gpt-5.2`
- validations (URLs, schema, decay category) → `gpt-5-nano`

Never downgrade/switch models because a call failed.

---

## 8) News research (must produce real news)

Implement `backend/src/services/newsResearch.ts`.

Requirements:
- It must return **real** sources with working URLs.
- Do not insert placeholder URLs.
- Store the pitch in `intake_items`.

---

## 9) Freshness system

Implement freshness:
- On publish: set `freshness=100`, `freshness_updated_at=now`, `decay_rate` default 10.
- Compute `is_fresh` = freshness >= 20.
- Expose `freshness` + `is_fresh` on `/api/map`.

UI rule:
- if freshness < 20: opacity scales down but never below 0.3.

---

## 10) Image generation (Gemini)

Implement `backend/src/services/imageGenerator.ts` using the official Google GenAI SDK.

Requirements:
- Model: `gemini-3-pro-image-preview`
- Use `GOOGLE_API_KEY`
- Generate 2K 1:1 images
- Save images locally under a served path (for Replit dev, use `backend/public/images/stories/` and serve static)
- Update `stories.image_url`

No mocks.

---

## 11) Frontend expectations

The frontend already exists. Do not rewrite it from scratch.

Ensure it can:
- call `/api/map`
- render story cards with images
- show freshness indicator

If you change API response shape, update the frontend accordingly.

---

## 12) Coding standards

- TypeScript everywhere (backend + frontend changes).
- Prefer small pure functions.
- Prefer explicit types over `any`.
- Use `zod` for validating inbound request payloads.
- Use parameterized SQL only.

---

## 13) Deliverables checklist

When done, the repo must contain:

- `backend/` with runnable server
- Postgres migrations + seed script
- Working `/api/map`, `/api/piece/:id`, `/api/stats`
- Working scheduler + task runner + chaining
- Working OpenAI calls with correct models
- Working Gemini image generation
- A root `README.md` (brief), plus `.env.example`

---

## 14) Canonical spec references

Use these local files as the product source-of-truth:

- `shared/theinvariant/THE_INVARIANT_MASTER_SPEC.md`
- `shared/theinvariant/CREW.md`
- `shared/theinvariant/NEWSROOM_WORKFLOW.md`
- `shared/theinvariant/LIVING_WEBSITE_WORKFLOW.md`
- `shared/theinvariant/TONE_RULES.md`
- `shared/theinvariant/GPT_MODELS_SETUP.md`
- `shared/theinvariant/FRESHNESS_SYSTEM.md`
- `shared/theinvariant/DYNAMIC_PUBLISHING.md`
- `shared/theinvariant/infrastructure/DEPLOYMENT.md`
