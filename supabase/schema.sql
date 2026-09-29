-- ====================================================================
-- Placement Preparation and Tracking System (PTS)
-- Comprehensive Supabase Database Schema
-- Compatible with PostgreSQL 15+ & Supabase Database
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. Clean Existing Tables (Optional / Re-runnable)
-- ====================================================================
DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS interview_questions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ====================================================================
-- 3. Profiles Table (Students, Officers, Recruiters, Admins)
-- ====================================================================
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,                       -- e.g. 'STU-101', 'OFF-201', 'REC-301', 'ADM-001'
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT DEFAULT 'password123',       -- For demo/fallback auth when not using Supabase Auth
  role TEXT NOT NULL CHECK (role IN ('student', 'officer', 'recruiter', 'admin')),
  name TEXT NOT NULL,
  college TEXT DEFAULT 'Sri Krishna College of Engineering and Technology',
  roll_no TEXT,
  department TEXT DEFAULT 'CSE',
  education_status TEXT DEFAULT 'studying' CHECK (education_status IN ('studying', 'graduated')),
  pursuing_year TEXT DEFAULT '4th Year / Final Year',
  degree TEXT DEFAULT 'B.E.',
  completed_degree TEXT DEFAULT '',
  graduation_year TEXT DEFAULT '2026',
  cgpa NUMERIC(4,2) DEFAULT 0.00 CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
  arrears INTEGER DEFAULT 0 CHECK (arrears >= 0),
  phone TEXT,
  avatar TEXT,
  title TEXT,
  office TEXT,
  company TEXT,                              -- For recruiters (e.g. 'Zoho Corporation')
  well_versed_languages JSONB DEFAULT '["Python", "Java", "C++", "C"]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  has_internship BOOLEAN DEFAULT false,
  internship JSONB DEFAULT '{"hasDone": false, "company": "", "topic": "", "duration": "", "description": ""}'::jsonb,
  has_hackathons BOOLEAN DEFAULT false,
  hackathons JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  resume_uploaded BOOLEAN DEFAULT false,
  resume_name TEXT,
  resume_url TEXT,
  resume_content TEXT,
  readiness JSONB DEFAULT '{"overall": 75, "aptitude": 80, "coding": 80, "communication": 70}'::jsonb,
  tests_completed INTEGER DEFAULT 0,
  avg_score NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Placed', 'Seeking')),
  placed_company TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. Companies & Campus Recruitment Drives Table
-- ====================================================================
CREATE TABLE companies (
  id TEXT PRIMARY KEY,                       -- e.g. 'COMP-1'
  name TEXT NOT NULL,
  logo TEXT,
  category TEXT DEFAULT 'Product',           -- 'Dream / Tier 1', 'Product', 'Mass / Service', 'Core / IT'
  role TEXT NOT NULL,
  ctc TEXT NOT NULL,                         -- e.g. '32.0 LPA'
  ctc_num NUMERIC(6,2) NOT NULL,             -- e.g. 32.0
  location TEXT DEFAULT 'Bangalore / Hyderabad',
  min_cgpa NUMERIC(4,2) DEFAULT 0.00,
  allowed_depts JSONB DEFAULT '["All"]'::jsonb,
  max_arrears INTEGER DEFAULT 0,
  drive_date DATE,
  deadline DATE,
  status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Active', 'Upcoming', 'Completed', 'Closed')),
  description TEXT,
  rounds JSONB DEFAULT '["Aptitude Assessment", "Technical Interview", "HR Round"]'::jsonb,
  created_by TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 5. Applications Table (Student Drive Registrations)
-- ====================================================================
CREATE TABLE applications (
  id TEXT PRIMARY KEY,                       -- e.g. 'APP-1001'
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_dept TEXT DEFAULT 'CSE',
  student_cgpa NUMERIC(4,2),
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  applied_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Aptitude Cleared', 'Shortlisted', 'Technical Round', 'HR Round', 'Selected', 'Rejected')),
  current_round TEXT DEFAULT 'Application Review',
  step_index INTEGER DEFAULT 1,
  notes TEXT,
  resume_pdf_name TEXT DEFAULT 'Candidate_Resume.pdf',
  resume_pdf_size TEXT DEFAULT '184 KB',
  resume_pdf_content TEXT,
  resume_pdf_url TEXT,
  resume_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, company_id)            -- Prevent duplicate applications to the same drive
);

-- ====================================================================
-- 6. Aptitude & Technical Questions Table
-- ====================================================================
CREATE TABLE questions (
  id TEXT PRIMARY KEY,                       -- e.g. 'Q1'
  category TEXT NOT NULL,                    -- 'Quantitative', 'Logical Reasoning', 'Verbal Ability', 'Coding & Technical'
  question TEXT NOT NULL,
  options JSONB NOT NULL,                    -- Array of 4 string options
  correct INTEGER NOT NULL,                  -- 0-indexed correct option index
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. Test Results Table
-- ====================================================================
CREATE TABLE test_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  answers JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. AI Mock Interview Questions Table
-- ====================================================================
CREATE TABLE interview_questions (
  id TEXT PRIMARY KEY,                       -- e.g. 'INT-1'
  type TEXT NOT NULL CHECK (type IN ('Technical', 'HR')),
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  key_points JSONB DEFAULT '[]'::jsonb,
  ideal_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 9. System Notifications Table
-- ====================================================================
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,                       -- e.g. 'NOTIF-1'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD'),
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'danger')),
  read BOOLEAN DEFAULT false,
  target_role TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 10. Audit Logs Table (Admin Security & Activity Stream)
-- ====================================================================
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,                       -- e.g. 'LOG-1'
  time TEXT DEFAULT to_char(NOW(), 'YYYY-MM-DD HH24:MI'),
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 11. Distributed Single-User Active Session Concurrency Lock
-- ====================================================================
CREATE TABLE active_sessions (
  session_id TEXT PRIMARY KEY,               -- e.g. 'SESS_1727100000_abc'
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  login_time TEXT NOT NULL,
  last_heartbeat BIGINT NOT NULL,            -- Epoch timestamp in milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 12. 1-on-1 Officer Mock Interview Requests Table
-- ====================================================================
CREATE TABLE interview_requests (
  id TEXT PRIMARY KEY,                       -- e.g. 'REQ-INT-101'
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_dept TEXT DEFAULT 'CSE',
  student_roll TEXT,
  student_cgpa NUMERIC(4,2),
  domain TEXT NOT NULL,                      -- 'Technical DSA & System Design', 'HR & Behavioral', etc.
  target_company TEXT,
  preferred_date DATE,
  preferred_time_slot TEXT,
  notes TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Scheduled', 'Completed', 'Declined')),
  assigned_officer_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_officer_name TEXT,
  scheduled_date DATE,
  scheduled_time TEXT,
  mode TEXT CHECK (mode IN ('Online', 'Offline')),
  meeting_link TEXT,                         -- Private Google Meet URL
  venue TEXT,                                -- On-campus room / venue
  officer_notes TEXT,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 13. Student Study Alarms & Reminders Table (Student Portal Alone)
-- ====================================================================
CREATE TABLE student_reminders (
  id TEXT PRIMARY KEY,                       -- e.g. 'REM-1'
  student_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'LeetCode' CHECK (category IN ('LeetCode', 'Mock Interview', 'Officer Interview', 'Aptitude', 'Company Deadline', 'Custom')),
  remind_at TIMESTAMPTZ NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('High', 'Normal', 'Low')),
  repeat TEXT DEFAULT 'Once' CHECK (repeat IN ('Once', 'Daily', 'Weekly')),
  notes TEXT,
  url TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Triggered', 'Completed', 'Snoozed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ====================================================================
-- 12. Indexes for High Performance Queries
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_dept ON profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_cgpa ON profiles(cgpa);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_test_results_student ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);

-- ====================================================================
-- 13. Trigger Functions
-- ====================================================================

-- A. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_companies_timestamp
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_applications_timestamp
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- B. Automatically mark student as Placed when application status is Selected
CREATE OR REPLACE FUNCTION sync_student_placed_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Selected' AND (OLD.status IS NULL OR OLD.status != 'Selected') THEN
    UPDATE profiles
    SET status = 'Placed',
        placed_company = NEW.company_name
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_placed_status
  AFTER INSERT OR UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION sync_student_placed_status();

-- C. Cleanup stale session locks (older than 15 minutes)
CREATE OR REPLACE FUNCTION cleanup_stale_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM active_sessions
  WHERE last_heartbeat < (EXTRACT(EPOCH FROM NOW()) * 1000 - (15 * 60 * 1000));
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 14. Row Level Security (RLS) Configuration
-- ====================================================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_reminders ENABLE ROW LEVEL SECURITY;

-- Permissive Development & Client SDK Policies (Allows anon and authenticated keys)
-- You can tighten these in production using auth.uid()
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);
CREATE POLICY "Public delete profiles" ON profiles FOR DELETE USING (true);

CREATE POLICY "Public read companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Public insert companies" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update companies" ON companies FOR UPDATE USING (true);
CREATE POLICY "Public delete companies" ON companies FOR DELETE USING (true);

CREATE POLICY "Public read applications" ON applications FOR SELECT USING (true);
CREATE POLICY "Public insert applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update applications" ON applications FOR UPDATE USING (true);
CREATE POLICY "Public delete applications" ON applications FOR DELETE USING (true);

CREATE POLICY "Public read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public modify questions" ON questions FOR ALL USING (true);

CREATE POLICY "Public read test_results" ON test_results FOR SELECT USING (true);
CREATE POLICY "Public insert test_results" ON test_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read interview_questions" ON interview_questions FOR SELECT USING (true);
CREATE POLICY "Public modify interview_questions" ON interview_questions FOR ALL USING (true);

CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Public modify notifications" ON notifications FOR ALL USING (true);

CREATE POLICY "Public read audit_logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Public insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read active_sessions" ON active_sessions FOR SELECT USING (true);
CREATE POLICY "Public modify active_sessions" ON active_sessions FOR ALL USING (true);

CREATE POLICY "Public read interview_requests" ON interview_requests FOR SELECT USING (true);
CREATE POLICY "Public modify interview_requests" ON interview_requests FOR ALL USING (true);

CREATE POLICY "Public read student_reminders" ON student_reminders FOR SELECT USING (true);
CREATE POLICY "Public modify student_reminders" ON student_reminders FOR ALL USING (true);

-- ====================================================================
-- 15. Enable Supabase Realtime Publication
-- ====================================================================
DO $$
BEGIN
  -- Check if publication exists before altering
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE applications;
    ALTER PUBLICATION supabase_realtime ADD TABLE companies;
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE active_sessions;
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE interview_requests;
    ALTER PUBLICATION supabase_realtime ADD TABLE student_reminders;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Realtime tables already added or publication pending.';
END $$;

-- ====================================================================
-- 16. Supabase Storage Bucket Setup (Run if storage schema exists)
-- ====================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policy for public resume access, uploads, updates, and deletes
DROP POLICY IF EXISTS "Public Access Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Resumes" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Resumes" ON storage.objects;

CREATE POLICY "Public Access Resumes"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');

CREATE POLICY "Public Upload Resumes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Public Update Resumes"
ON storage.objects FOR UPDATE
USING (bucket_id = 'resumes');

CREATE POLICY "Public Delete Resumes"
ON storage.objects FOR DELETE
USING (bucket_id = 'resumes');

