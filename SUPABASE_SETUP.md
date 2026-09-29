# Supabase Backend Setup Guide
## Placement Preparation and Tracking System (PTS)

This guide walks you through connecting this application to **Supabase** — a scalable, open-source Firebase alternative powered by PostgreSQL, providing live database persistence, multi-user real-time synchronization, Row Level Security (RLS), and cloud storage for resume uploads.

---

## 🏗️ Architecture Overview

The system supports **two flexible backend architectures**:
1. **Direct Client SDK Mode (Recommended)**: The frontend connects directly to Supabase via `@supabase/supabase-js` over HTTPS and WebSockets. Provides instant real-time live updates when applications are updated or campus drives are posted.
2. **Dedicated Node.js Express REST Server (`backend/`)**: A standalone REST API backend proxy built with Express and `@supabase/supabase-js` for environments requiring server-side API endpoints (`/api/students`, `/api/drives`, `/api/applications`).
3. **Graceful Local Fallback**: When Supabase is not connected, the app seamlessly runs in Local Mode using browser storage with zero broken features.

---

## 🚀 Quick Setup in 5 Steps

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in (or sign up with GitHub/Google).
2. Click **New Project**.
3. Choose an organization, enter a name (e.g. `placement-tracking-system`), and generate a database password.
4. Select your preferred region (e.g., `Singapore` or `Mumbai` for India) and click **Create new project**.

---

### Step 2: Run the Database Schema & Seed Data
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this repository, copy its entire contents, paste it into the SQL Editor, and click **Run**.
   - This creates all 9 tables: `profiles`, `companies`, `applications`, `questions`, `test_results`, `interview_questions`, `notifications`, `audit_logs`, `active_sessions`, plus indexes, triggers, and Row Level Security policies.
4. *(Optional but recommended)*: Open [`supabase/seed.sql`](supabase/seed.sql), copy its contents, paste into a new SQL query, and click **Run**.
   - This pre-populates all accounts (Student Sashti, Arun, Placement Officer, Recruiter, Admin), 6 campus drives (Google, Microsoft, Zoho, TCS, Infosys, Amazon), active applications, and question banks.

---

### Step 3: Copy Your API Credentials
1. In your Supabase Dashboard, click the **Project Settings** (gear icon) in the bottom-left sidebar.
2. Navigate to **API** under Configuration.
3. Locate:
   - **Project URL**: (e.g., `https://abcdefghijklmno.supabase.co`)
   - **Project API keys -> `anon` `public`**: (a long string starting with `eyJhbGci...`)

---

### Step 4: Connect the Frontend (Zero Code Required!)
You can connect directly from the running web application UI:
1. Open [`index.html`](index.html) in your browser (via Live Server or direct browser open).
2. Click the **Supabase: Offline (Local)** badge in the top-right header (or click **Connect Supabase** on the login screen).
3. The **Supabase Cloud Backend** configuration modal will appear.
4. Paste your **Project URL** and **Anon Public Key**.
5. Click **⚡ Test Connection** to verify connectivity and ping latency.
6. Click **💾 Save & Connect**.
7. *(Optional)* Click **🚀 Seed Local State to Supabase** if you want to push current browser state directly into your database in one click!

> 🟢 **Instant Indicator**: The status pill will turn green: `Supabase: Live (32ms)`. All changes made in the app will now sync live to your Supabase PostgreSQL cloud database!

---

### Step 5: Enable Supabase Storage for Resumes
1. In your Supabase Dashboard, click **Storage** in the left sidebar.
2. Check if a bucket named `resumes` is created. If not, click **New bucket**:
   - Bucket Name: `resumes`
   - Public Bucket: **ON** (Enabled)
   - Click **Save bucket**.
3. Students can now upload PDF/DOCX resumes in the AI Resume Analyzer or Profile view, and they will be stored securely in your Supabase Cloud Storage with public download URLs!

---

## ⚡ Real-Time Multi-User Synchronization

When Supabase is connected, the app activates **Postgres Realtime WebSockets**:
- **Application Status Changes**: When a recruiter shortlists a student or advances them to the Technical Round, the student's dashboard and tracking tab update **instantly without page reload**.
- **New Placement Drives**: When a Placement Officer posts a new campus recruitment drive, all connected student portals display the new company immediately with a live toast notification.
- **Single-User Concurrency Lock**: If someone logs into an account from another computer or browser tab, the active session lock in Supabase updates and automatically alerts/terminates the previous session.

To ensure Realtime is enabled in Supabase:
1. Go to **Database** &rarr; **Replication** in the Supabase Dashboard.
2. Verify that `applications`, `companies`, `notifications`, `profiles`, and `active_sessions` are toggled **ON** under the `supabase_realtime` publication (our `schema.sql` handles this automatically).

---

## 💻 Optional: Running the Node.js Express REST Backend

If your deployment environment requires a dedicated Node.js / Express backend server:

1. Open your terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
4. Fill in your Supabase credentials in `backend/.env`:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```
5. Start the server:
   ```bash
   npm start
   ```
6. The REST API server will run at `http://localhost:5000`:
   - `GET /api/health` — Health check & database ping
   - `GET /api/students` — Student directory with filter queries (`?department=CSE&min_cgpa=8.0`)
   - `GET /api/drives` — Active & upcoming placement drives
   - `GET /api/applications` — Drive applications pipeline
   - `POST /api/applications` — Submit new application
   - `PATCH /api/applications/:id` — Update interview round & status
   - `GET /api/questions` — Aptitude question bank
   - `POST /api/resumes/upload` — Multipart resume upload to Supabase Storage

---

## 🗄️ Database Tables Reference

| Table | Purpose | Primary Key | Key Relationships / Fields |
|---|---|---|---|
| `profiles` | User accounts & student portfolio | `id` (e.g. `STU-101`) | `role`, `cgpa`, `skills`, `internship`, `hackathons`, `readiness` |
| `companies` | Campus recruitment drives | `id` (e.g. `COMP-1`) | `name`, `ctc_num`, `min_cgpa`, `allowed_depts`, `rounds`, `status` |
| `applications` | Job applications & round tracker | `id` (e.g. `APP-1001`) | `student_id` &rarr; `profiles`, `company_id` &rarr; `companies`, `step_index` |
| `questions` | Aptitude & technical question bank | `id` (e.g. `Q1`) | `category`, `question`, `options` (jsonb), `correct` |
| `test_results` | Student assessment scores | `id` (uuid) | `student_id` &rarr; `profiles`, `score`, `percentage` |
| `interview_questions` | AI mock interview question bank | `id` (e.g. `INT-1`) | `type`, `topic`, `question`, `ideal_answer` |
| `notifications` | System announcements & drive notices | `id` (e.g. `NOTIF-1`) | `title`, `message`, `type`, `read` |
| `audit_logs` | Admin security & activity stream | `id` (e.g. `LOG-1`) | `time`, `user_name`, `action` |
| `active_sessions` | Single-user session concurrency lock | `session_id` | `user_id`, `user_name`, `login_time`, `last_heartbeat` |

---

## 🛡️ Security & Row Level Security (RLS)

- All tables have **Row Level Security (RLS)** enabled.
- The default development policies allow read and write access using the standard `anon` public key so demo logins and student portfolios operate without requiring email verification.
- In production, policies can be restricted to authenticated users by binding `auth.uid()` to `profiles.auth_user_id`.

---

## ❓ Frequently Asked Questions (FAQ)

### What if I don't configure Supabase?
The app runs completely fine in **Local Mode**. It uses `localStorage` with all demo accounts, companies, and features active. No features are blocked.

### Can I reset the data back to demo state?
Yes! Click **Reset Demo** in the top-right header, or open the Supabase modal and click **🚀 Seed Local State to Supabase** to overwrite and refresh the database.

### How do I disconnect from Supabase?
Click the Supabase status badge in the topbar and click **Disconnect (Use Local)**. The app will immediately revert to browser storage.
