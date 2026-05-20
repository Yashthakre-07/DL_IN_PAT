# DOCUMENT 05 — Backend Schema

**Database Tables & Types**

`users`
- `id` (uuid, PK)
- `email` (varchar, unique)
- `full_name` (varchar)
- `dob` (date)
- `time_of_birth` (time)
- `birth_city` (varchar)
- `latitude` (float)
- `longitude` (float)
- `timezone` (varchar)
- `created_at` (timestamptz)

`birth_charts`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `sun_sign` (varchar)
- `moon_sign` (varchar)
- `rising_sign` (varchar)
- `raw_data` (jsonb — stores full arrays of planets, houses, and aspects)
- `created_at` (timestamptz)

`horoscopes`
- `id` (uuid, PK)
- `sign` (varchar)
- `date` (date)
- `type` (varchar — 'mood', 'love', 'career')
- `content` (text)
- `created_at` (timestamptz)

`compatibility_reports`
- `id` (uuid, PK)
- `user_id_1` (uuid, FK)
- `partner_name` (varchar)
- `partner_dob` (date)
- `partner_time` (time)
- `partner_lat` (float)
- `partner_lng` (float)
- `total_score` (int)
- `report_data` (jsonb — detailed text breakdown and specific synastry aspects)
- `created_at` (timestamptz)

`chat_sessions`
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `created_at` (timestamptz)

`chat_messages`
- `id` (uuid, PK)
- `session_id` (uuid, FK)
- `role` (varchar — 'user' or 'assistant')
- `content` (text)
- `created_at` (timestamptz)

**Foreign key relationships**
- `birth_charts.user_id` -> `users.id` (ON DELETE CASCADE)
- `compatibility_reports.user_id_1` -> `users.id` (ON DELETE CASCADE)
- `chat_sessions.user_id` -> `users.id` (ON DELETE CASCADE)
- `chat_messages.session_id` -> `chat_sessions.id` (ON DELETE CASCADE)

**Indexes**
- `CREATE INDEX idx_horoscopes_sign_date ON horoscopes(sign, date);` (Crucial for fast daily fetches).
- `CREATE INDEX idx_chat_msgs_session ON chat_messages(session_id, created_at);`

**Row Level Security (RLS) rules**
- `users`: `SELECT`, `UPDATE` where `id = auth.uid()`
- `birth_charts`: `ALL` where `user_id = auth.uid()`
- `horoscopes`: `SELECT` to `authenticated` users (read-only for clients).
- `compatibility_reports`, `chat_sessions`, `chat_messages`: `ALL` where `user_id = auth.uid()` (using JOINs where necessary).

**User roles and permissions**
Standard `authenticated` user role for mobile clients. `service_role` used strictly by Edge Functions to bypass RLS when auto-generating daily horoscopes via CRON.

**API endpoint list (Supabase Edge Functions)**
- `POST /functions/v1/generate-chart` — Takes user lat/long/time, calculates chart via SwissEph, inserts into `birth_charts`.
- `POST /functions/v1/analyze-compatibility` — Takes partner details, compares against user's `raw_data`, generates score, returns JSON.
- `POST /functions/v1/chat-astrologer` — Injects user's chart into system prompt, streams OpenAI response, logs to `chat_messages`.

**Sensitive fields and handling**
Passwords are never stored in the `public` schema (handled natively by Supabase Auth). Precise `latitude`, `longitude`, and `time_of_birth` are PII; protected by strict RLS and never exposed to other users.
