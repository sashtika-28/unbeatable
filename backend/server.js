/**
 * Placement Preparation and Tracking System
 * Dedicated Node.js Express REST API Backend connected to Supabase
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

// Load environment variables (supports running from root or backend directory)
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from project root (index.html, css, js)
app.use(express.static(path.join(__dirname, '..')));

// Multer memory storage for resume uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Supabase Client Initialization
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('[Supabase Server] Client initialized with URL:', SUPABASE_URL);
} else {
  console.warn('[Supabase Server] Warning: SUPABASE_URL or SUPABASE_KEY not set in .env. Server running in standby mode.');
}

// Middleware to ensure Supabase client is configured
const requireSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      success: false,
      error: 'Supabase credentials not configured on server. Please set SUPABASE_URL and SUPABASE_ANON_KEY in backend/.env'
    });
  }
  next();
};

// ====================================================================
// 1. Health & Status
// ====================================================================
app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  let latency = null;

  if (supabase) {
    try {
      const start = Date.now();
      const { data, error } = await supabase.from('companies').select('id').limit(1);
      latency = Date.now() - start;
      dbStatus = error ? `error: ${error.message}` : 'connected';
    } catch (e) {
      dbStatus = `unreachable: ${e.message}`;
    }
  }

  res.json({
    status: 'ok',
    service: 'Placement Preparation & Tracking System Backend',
    timestamp: new Date().toISOString(),
    database: {
      provider: 'Supabase (PostgreSQL)',
      status: dbStatus,
      latency: latency ? `${latency}ms` : null
    }
  });
});

// ====================================================================
// 2. Student Profiles
// ====================================================================
app.get('/api/students', requireSupabase, async (req, res) => {
  try {
    const { department, min_cgpa, search } = req.query;
    let query = supabase.from('profiles').select('*').eq('role', 'student');

    if (department && department !== 'All') {
      query = query.eq('department', department);
    }
    if (min_cgpa) {
      query = query.gte('cgpa', parseFloat(min_cgpa));
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,roll_no.ilike.%${search}%`);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/students/:id', requireSupabase, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: 'Student not found: ' + err.message });
  }
});

app.put('/api/students/:id', requireSupabase, async (req, res) => {
  try {
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    delete updates.id; // Prevent updating primary key

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Profile updated successfully', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================================
// 3. Companies & Placement Drives
// ====================================================================
app.get('/api/drives', requireSupabase, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('companies').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/drives', requireSupabase, async (req, res) => {
  try {
    const newDrive = {
      id: req.body.id || 'COMP-' + Date.now(),
      name: req.body.name,
      logo: req.body.logo || '',
      category: req.body.category || 'Product',
      role: req.body.role,
      ctc: req.body.ctc,
      ctc_num: parseFloat(req.body.ctc_num || req.body.ctcNum) || 0,
      location: req.body.location || 'Bangalore',
      min_cgpa: parseFloat(req.body.min_cgpa || req.body.minCgpa) || 0,
      allowed_depts: req.body.allowed_depts || req.body.allowedDepts || ['All'],
      max_arrears: parseInt(req.body.max_arrears || req.body.maxArrears, 10) || 0,
      drive_date: req.body.drive_date || req.body.driveDate,
      deadline: req.body.deadline,
      status: req.body.status || 'Upcoming',
      description: req.body.description || '',
      rounds: req.body.rounds || ['Aptitude Assessment', 'Technical Interview', 'HR Round']
    };

    const { data, error } = await supabase
      .from('companies')
      .insert(newDrive)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Drive scheduled successfully', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================================
// 4. Applications Pipeline
// ====================================================================
app.get('/api/applications', requireSupabase, async (req, res) => {
  try {
    const { student_id, company_id, status } = req.query;
    let query = supabase.from('applications').select('*');

    if (student_id) query = query.eq('student_id', student_id);
    if (company_id) query = query.eq('company_id', company_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query.order('applied_date', { ascending: false });
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/applications', requireSupabase, async (req, res) => {
  try {
    const { student_id, company_id, student_name, company_name, role, student_dept, student_cgpa } = req.body;

    const newApp = {
      id: 'APP-' + Math.floor(1000 + Math.random() * 9000),
      student_id,
      company_id,
      student_name,
      company_name,
      role,
      student_dept: student_dept || 'CSE',
      student_cgpa: parseFloat(student_cgpa) || 0,
      applied_date: new Date().toISOString().split('T')[0],
      status: 'Applied',
      current_round: 'Application Review',
      step_index: 1,
      notes: 'Application registered via API.'
    };

    const { data, error } = await supabase
      .from('applications')
      .insert(newApp)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Application registered successfully', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/applications/:id', requireSupabase, async (req, res) => {
  try {
    const { status, current_round, step_index, notes } = req.body;
    const updates = { updated_at: new Date().toISOString() };

    if (status) updates.status = status;
    if (current_round) updates.current_round = current_round;
    if (step_index !== undefined) updates.step_index = step_index;
    if (notes) updates.notes = notes;

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Application updated', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================================
// 5. Questions & Assessments
// ====================================================================
app.get('/api/questions', requireSupabase, async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabase.from('questions').select('*');
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/test-results', requireSupabase, async (req, res) => {
  try {
    const { student_id, category, score, total_questions, answers } = req.body;
    const pct = Math.round((score / total_questions) * 100);

    const { data, error } = await supabase
      .from('test_results')
      .insert({
        student_id,
        category,
        score,
        total_questions,
        percentage: pct,
        answers: answers || {}
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Test result recorded', data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====================================================================
// 6. Resume Upload via Multer to Supabase Storage
// ====================================================================
app.post('/api/resumes/upload', requireSupabase, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file uploaded.' });
    }

    const studentId = req.body.student_id || 'STU-101';
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${studentId}/${Date.now()}_${safeName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    const resumeUrl = publicUrlData ? publicUrlData.publicUrl : '';

    // Update profile
    await supabase
      .from('profiles')
      .update({
        resume_uploaded: true,
        resume_name: req.file.originalname,
        resume_url: resumeUrl
      })
      .eq('id', studentId);

    res.json({
      success: true,
      message: 'Resume uploaded to Supabase Storage successfully',
      name: req.file.originalname,
      url: resumeUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`
==============================================================
🚀 Placement System Supabase REST API Backend
==============================================================
Server running on  : http://localhost:${PORT}
Health check endpoint: http://localhost:${PORT}/api/health
Supabase Project   : ${SUPABASE_URL || 'Not Configured (Standby Mode)'}
==============================================================
  `);
});
