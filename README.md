# NVNM Form D Oracle

The first external oracle built on NVNM Chain.

Every private capital raise filed with the SEC (Form D) is automatically 
fetched from EDGAR, hashed, and anchored on NVNM Chain using the native 
Anchoring precompile. Every transaction is verifiable on the NVNM explorer.

## What it does

- Fetches new Form D filings from SEC EDGAR every 6 hours
- Computes a SHA-256 hash of each filing document  
- Anchors the hash + document URI on NVNM Chain
- Exposes a live dashboard with explorer links for every anchor

## Stack

- **Agent:** Node.js + ethers.js → Railway
- **Dashboard:** Next.js 14 → Vercel  
- **Database:** Supabase

## Setup

### 1. Database (Supabase)

Run this SQL in the Supabase SQL editor:

```sql
-- Anchored documents
create table anchors (
  id                bigserial primary key,
  company_name      text not null,
  cik               text not null,
  accession_number  text not null unique,
  edgar_url         text not null,
  document_hash     text,
  tx_hash           text,
  block_number      bigint,
  anchored_at       timestamptz default now(),
  status            text default 'pending',
  error_message     text
);

-- Running stats
create table oracle_stats (
  id              bigserial primary key,
  total_anchored  bigint default 0,
  anchored_today  bigint default 0,
  last_run_at     timestamptz,
  updated_at      timestamptz default now()
);

-- Seed stats row
insert into oracle_stats (total_anchored, anchored_today) values (0, 0);
```

### 2. Environment Variables

Copy `.env` and fill in your values:

```
NVNM_RPC_URL=https://evm.testnet.nvnmchain.io
PRIVATE_KEY=<your testnet wallet private key>
ANCHORING_PRECOMPILE_ADDRESS=0x0000000000000000000000000000000000000A00
NEXT_PUBLIC_SUPABASE_URL=<your supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your supabase anon key>
SUPABASE_SERVICE_KEY=<your supabase service key>
EDGAR_USER_AGENT=FirstName LastName email@domain.com
NEXT_PUBLIC_NVNM_EXPLORER_URL=https://explorer.evm.testnet.nvnmchain.io
AGENT_TRIGGER_SECRET=<generate a random secret>
AGENT_TRIGGER_URL=<railway agent URL>/trigger
PORT=3001
```

### 3. Running locally

```bash
# Agent
npm install
node agent/index.js

# Dashboard (separate terminal)
cd dashboard
npm install
npm run dev
```

### 4. Deploy

**Agent → Railway:**
- Connect repo to Railway
- Set root directory to `/` (root)
- Add all env vars to Railway Variables tab
- Railway uses `railway.json` for config

**Dashboard → Vercel:**
- Connect repo to Vercel
- Set root directory to `dashboard`
- Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_NVNM_EXPLORER_URL`, `SUPABASE_SERVICE_KEY`, `AGENT_TRIGGER_URL`, `AGENT_TRIGGER_SECRET`

## Architecture

```
SEC EDGAR → Agent (Railway)
                ↓
         SHA-256 hash
                ↓
    NVNM Chain (Anchoring precompile @ 0x...0A00)
                ↓
         Supabase DB
                ↓
    Dashboard (Vercel) ← auto-polls every 15s
```

## Switching to Mainnet

Change one env var:
```
NVNM_RPC_URL=https://evm.nvnmchain.io
NEXT_PUBLIC_NVNM_EXPLORER_URL=https://evm.explorer.nvnmchain.io
```

---

Built as a demonstration that the NVNM primitive is ready for external developers.
