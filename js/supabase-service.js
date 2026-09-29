/**
 * Placement Preparation and Tracking System
 * Supabase Data Access Service & Realtime Synchronization Layer
 */

(function () {
  class SupabaseService {
    constructor() {
      this.realtimeChannels = {};
      this.isHydrated = false;
    }

    get client() {
      return window.ptsSupabase ? window.ptsSupabase.getClient() : null;
    }

    isAvailable() {
      return window.ptsSupabase && window.ptsSupabase.isReady();
    }

    // =========================================================================
    // 1. Data Hydration & Transformation (Snake_case DB <-> CamelCase Frontend)
    // =========================================================================

    transformProfileFromDb(row) {
      if (!row) return null;
      return {
        id: row.id,
        name: row.name,
        college: row.college || 'Sri Krishna College of Engineering and Technology',
        rollNo: row.roll_no || '',
        email: row.email,
        password: row.password || 'password123',
        role: row.role,
        department: row.department || 'CSE',
        educationStatus: row.education_status || 'studying',
        pursuingYear: row.pursuing_year || '4th Year / Final Year',
        degree: row.degree || 'B.E.',
        completedDegree: row.completed_degree || '',
        graduationYear: row.graduation_year || '2026',
        cgpa: parseFloat(row.cgpa) || 8.45,
        arrears: parseInt(row.arrears, 10) || 0,
        phone: row.phone || '',
        avatar: row.avatar || row.name.charAt(0),
        title: row.title || '',
        office: row.office || '',
        company: row.company || '',
        wellVersedLanguages: row.well_versed_languages || ['Python', 'Java', 'C++', 'C'],
        skills: row.skills || [],
        hasInternship: Boolean(row.has_internship),
        internship: row.internship || { hasDone: false, company: '', topic: '' },
        hasHackathons: Boolean(row.has_hackathons),
        hackathons: row.hackathons || [],
        certifications: row.certifications || [],
        resumeUploaded: Boolean(row.resume_uploaded),
        resumeName: row.resume_name || '',
        resumeUrl: row.resume_url || '',
        resumeContent: row.resume_content || '',
        readiness: row.readiness || { overall: 75, aptitude: 80, coding: 80, communication: 70 },
        testsCompleted: row.tests_completed || 0,
        avgScore: parseFloat(row.avg_score) || 0,
        status: row.status || 'In Progress',
        placedCompany: row.placed_company || null
      };
    }

    transformProfileToDb(p) {
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        college: p.college,
        roll_no: p.rollNo || null,
        department: p.department,
        education_status: p.educationStatus,
        pursuing_year: p.pursuingYear,
        degree: p.degree,
        completed_degree: p.completedDegree,
        graduation_year: p.graduationYear,
        cgpa: p.cgpa,
        arrears: p.arrears,
        phone: p.phone,
        avatar: p.avatar,
        title: p.title,
        office: p.office,
        company: p.company,
        well_versed_languages: p.wellVersedLanguages,
        skills: p.skills,
        has_internship: p.hasInternship,
        internship: p.internship,
        has_hackathons: p.hasHackathons,
        hackathons: p.hackathons,
        certifications: p.certifications,
        resume_uploaded: p.resumeUploaded,
        resume_name: p.resumeName,
        resume_url: p.resumeUrl,
        resume_content: p.resumeContent,
        readiness: p.readiness,
        tests_completed: p.testsCompleted,
        avg_score: p.avgScore,
        status: p.status,
        placed_company: p.placedCompany
      };
    }

    transformCompanyFromDb(row) {
      return {
        id: row.id,
        name: row.name,
        logo: row.logo,
        category: row.category,
        role: row.role,
        ctc: row.ctc,
        ctcNum: parseFloat(row.ctc_num) || 0,
        location: row.location,
        minCgpa: parseFloat(row.min_cgpa) || 0,
        allowedDepts: row.allowed_depts || ['All'],
        maxArrears: parseInt(row.max_arrears, 10) || 0,
        driveDate: row.drive_date,
        deadline: row.deadline,
        status: row.status,
        description: row.description,
        rounds: row.rounds || []
      };
    }

    transformCompanyToDb(c) {
      return {
        id: c.id,
        name: c.name,
        logo: c.logo,
        category: c.category,
        role: c.role,
        ctc: c.ctc,
        ctc_num: c.ctcNum,
        location: c.location,
        min_cgpa: c.minCgpa,
        allowed_depts: c.allowedDepts,
        max_arrears: c.maxArrears,
        drive_date: c.driveDate,
        deadline: c.deadline,
        status: c.status,
        description: c.description,
        rounds: c.rounds
      };
    }

    transformApplicationFromDb(row) {
      return {
        id: row.id,
        studentId: row.student_id,
        studentName: row.student_name,
        studentDept: row.student_dept,
        studentCgpa: parseFloat(row.student_cgpa) || 0,
        companyId: row.company_id,
        companyName: row.company_name,
        role: row.role,
        appliedDate: row.applied_date,
        status: row.status,
        currentRound: row.current_round,
        stepIndex: parseInt(row.step_index, 10) || 1,
        notes: row.notes || '',
        resumePdfName: row.resume_pdf_name || `${(row.student_name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`,
        resumePdfSize: row.resume_pdf_size || '184 KB',
        resumePdfContent: row.resume_pdf_content || '',
        resumePdfUrl: row.resume_pdf_url || '',
        resumeFormat: 'PDF',
        resumeVerified: true
      };
    }

    transformApplicationToDb(a) {
      return {
        id: a.id,
        student_id: a.studentId,
        student_name: a.studentName,
        student_dept: a.studentDept,
        student_cgpa: a.studentCgpa,
        company_id: a.companyId,
        company_name: a.companyName,
        role: a.role,
        applied_date: a.appliedDate,
        status: a.status,
        current_round: a.currentRound,
        step_index: a.stepIndex,
        notes: a.notes,
        resume_pdf_name: a.resumePdfName || 'Candidate_Resume.pdf',
        resume_pdf_size: a.resumePdfSize || '184 KB',
        resume_pdf_content: a.resumePdfContent || '',
        resume_pdf_url: a.resumePdfUrl || '',
        resume_verified: true
      };
    }

    // =========================================================================
    // 2. Hydrate Complete State From Supabase
    // =========================================================================
    async hydrateState() {
      if (!this.client) return null;

      try {
        const [
          profilesRes,
          companiesRes,
          appsRes,
          questionsRes,
          interviewRes,
          notifsRes,
          logsRes
        ] = await Promise.all([
          this.client.from('profiles').select('*').order('created_at', { ascending: true }),
          this.client.from('companies').select('*').order('created_at', { ascending: false }),
          this.client.from('applications').select('*').order('applied_date', { ascending: false }),
          this.client.from('questions').select('*').order('id', { ascending: true }),
          this.client.from('interview_questions').select('*').order('id', { ascending: true }),
          this.client.from('notifications').select('*').order('created_at', { ascending: false }),
          this.client.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50)
        ]);

        if (profilesRes.error) throw profilesRes.error;

        const profiles = (profilesRes.data || []).map(r => this.transformProfileFromDb(r));
        const companies = (companiesRes.data || []).map(r => this.transformCompanyFromDb(r));
        const applications = (appsRes.data || []).map(r => this.transformApplicationFromDb(r));

        const questions = (questionsRes.data || []).map(q => ({
          id: q.id,
          category: q.category,
          question: q.question,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation
        }));

        const interviewQuestions = (interviewRes.data || []).map(i => ({
          id: i.id,
          type: i.type,
          topic: i.topic,
          question: i.question,
          keyPoints: i.key_points || [],
          idealAnswer: i.ideal_answer
        }));

        const notifications = (notifsRes.data || []).map(n => ({
          id: n.id,
          title: n.title,
          message: n.message,
          date: n.date,
          type: n.type,
          read: n.read
        }));

        const auditLogs = (logsRes.data || []).map(l => ({
          id: l.id,
          time: l.time,
          user: l.user_name,
          action: l.action
        }));

        // Map accounts dictionary
        const accounts = {};
        const students = [];

        profiles.forEach(p => {
          if (p.role === 'student') {
            students.push(p);
            if (!accounts.student || p.id === 'STU-101') accounts.student = p;
          } else if (p.role === 'officer') {
            accounts.officer = p;
          } else if (p.role === 'recruiter') {
            accounts.recruiter = p;
          } else if (p.role === 'admin') {
            accounts.admin = p;
          }
        });

        this.isHydrated = true;

        return {
          accounts,
          students,
          companies,
          applications,
          questions: questions.length ? questions : undefined,
          interviewQuestions: interviewQuestions.length ? interviewQuestions : undefined,
          notifications: notifications.length ? notifications : undefined,
          auditLogs: auditLogs.length ? auditLogs : undefined
        };
      } catch (err) {
        console.error('[Supabase] Failed to hydrate state from Supabase:', err);
        return null;
      }
    }

    // =========================================================================
    // 3. Profiles & Students Operations
    // =========================================================================
    async saveProfile(profile) {
      if (!this.client) return false;
      try {
        const payload = this.transformProfileToDb(profile);
        const { error } = await this.client
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('[Supabase] Error saving profile:', err);
        return false;
      }
    }

    // =========================================================================
    // 4. Companies / Drives Operations
    // =========================================================================
    async addCompany(company) {
      if (!this.client) return false;
      try {
        const payload = this.transformCompanyToDb(company);
        const { error } = await this.client
          .from('companies')
          .insert(payload);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('[Supabase] Error adding company:', err);
        return false;
      }
    }

    // =========================================================================
    // 5. Applications Pipeline Operations
    // =========================================================================
    async submitApplication(application) {
      if (!this.client) return false;
      try {
        const payload = this.transformApplicationToDb(application);
        const { error } = await this.client
          .from('applications')
          .insert(payload);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('[Supabase] Error submitting application:', err);
        return false;
      }
    }

    async updateApplicationStatus(appId, newStatus, currentRound, stepIndex) {
      if (!this.client) return false;
      try {
        const updates = {
          status: newStatus,
          current_round: currentRound,
          step_index: stepIndex,
          updated_at: new Date().toISOString()
        };
        const { error } = await this.client
          .from('applications')
          .update(updates)
          .eq('id', appId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('[Supabase] Error updating application status:', err);
        return false;
      }
    }

    // =========================================================================
    // 6. Test Results Operations
    // =========================================================================
    async recordTestResult(studentId, category, score, totalQuestions, answers) {
      if (!this.client) return false;
      try {
        const pct = Math.round((score / totalQuestions) * 100);
        const { error } = await this.client
          .from('test_results')
          .insert({
            student_id: studentId,
            category,
            score,
            total_questions: totalQuestions,
            percentage: pct,
            answers: answers || {}
          });

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('[Supabase] Error recording test result:', err);
        return false;
      }
    }

    // =========================================================================
    // 7. Notifications & Audit Logs
    // =========================================================================
    async addNotification(notif) {
      if (!this.client) return false;
      try {
        const { error } = await this.client
          .from('notifications')
          .insert({
            id: notif.id,
            title: notif.title,
            message: notif.message,
            date: notif.date,
            type: notif.type,
            read: notif.read || false
          });

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('[Supabase] Error adding notification:', err);
        return false;
      }
    }

    async addAuditLog(action, userName = 'User') {
      if (!this.client) return false;
      try {
        const now = new Date();
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const logId = 'LOG-' + Date.now();

        const { error } = await this.client
          .from('audit_logs')
          .insert({
            id: logId,
            time: timeStr,
            user_name: userName,
            action
          });

        if (error) throw error;
        return true;
      } catch (err) {
        console.error('[Supabase] Error inserting audit log:', err);
        return false;
      }
    }

    // =========================================================================
    // 8. Distributed Single-User Session Concurrency Guard
    // =========================================================================
    async acquireSessionLock(session) {
      if (!this.client) return null;
      try {
        // Check if there is an active session for this user within the last 15 minutes
        const cutoff = Date.now() - 15 * 60 * 1000;
        const { data: existing, error: fetchErr } = await this.client
          .from('active_sessions')
          .select('*')
          .eq('user_id', session.userId)
          .gt('last_heartbeat', cutoff)
          .neq('session_id', session.sessionId)
          .limit(1);

        if (!fetchErr && existing && existing.length > 0) {
          return {
            locked: true,
            existingSession: {
              sessionId: existing[0].session_id,
              userId: existing[0].user_id,
              userName: existing[0].user_name,
              role: existing[0].role,
              email: existing[0].email,
              loginTime: existing[0].login_time,
              lastHeartbeat: existing[0].last_heartbeat
            }
          };
        }

        // Upsert current session lock
        const { error } = await this.client
          .from('active_sessions')
          .upsert({
            session_id: session.sessionId,
            user_id: session.userId,
            user_name: session.userName,
            role: session.role,
            email: session.email,
            login_time: session.loginTime,
            last_heartbeat: session.lastHeartbeat || Date.now()
          });

        if (error) throw error;
        return { locked: false };
      } catch (err) {
        console.warn('[Supabase] Session lock acquisition warning:', err);
        return { locked: false }; // Allow local fallback
      }
    }

    async heartbeatSession(sessionId) {
      if (!this.client || !sessionId) return;
      try {
        await this.client
          .from('active_sessions')
          .update({ last_heartbeat: Date.now() })
          .eq('session_id', sessionId);
      } catch (err) {}
    }

    async releaseSessionLock(sessionId) {
      if (!this.client || !sessionId) return;
      try {
        await this.client
          .from('active_sessions')
          .delete()
          .eq('session_id', sessionId);
      } catch (err) {}
    }

    // =========================================================================
    // 9. Supabase Storage: Resume PDF Upload
    // =========================================================================
    async uploadResumeFile(file, studentId) {
      if (!this.client) {
        return { success: false, error: 'Supabase client not connected.' };
      }

      try {
        const fileExt = file.name.split('.').pop();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filePath = `${studentId}/${Date.now()}_${safeName}`;

        const { data, error } = await this.client.storage
          .from('resumes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (error) throw error;

        // Get public download / preview URL
        const { data: publicUrlData } = this.client.storage
          .from('resumes')
          .getPublicUrl(filePath);

        const resumeUrl = publicUrlData ? publicUrlData.publicUrl : '';

        // Update profile in DB
        await this.client
          .from('profiles')
          .update({
            resume_uploaded: true,
            resume_name: file.name,
            resume_url: resumeUrl
          })
          .eq('id', studentId);

        return {
          success: true,
          url: resumeUrl,
          name: file.name
        };
      } catch (err) {
        console.error('[Supabase] Resume upload error:', err);
        return {
          success: false,
          error: err.message || 'Failed to upload resume to Supabase Storage.'
        };
      }
    }

    // =========================================================================
    // 10. Realtime Subscriptions
    // =========================================================================
    initRealtime(callbacks = {}) {
      if (!this.client) return;

      try {
        // Channel for Placement Drive Applications
        const appChannel = this.client.channel('realtime_applications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, (payload) => {
            console.log('[Supabase Realtime] Application event:', payload);
            if (callbacks.onApplication) callbacks.onApplication(payload);
          })
          .subscribe();

        // Channel for Companies & Campus Drives
        const compChannel = this.client.channel('realtime_companies')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, (payload) => {
            console.log('[Supabase Realtime] Company drive event:', payload);
            if (callbacks.onCompany) callbacks.onCompany(payload);
          })
          .subscribe();

        // Channel for Notifications Broadcasts
        const notifChannel = this.client.channel('realtime_notifications')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
            console.log('[Supabase Realtime] New notification:', payload);
            if (callbacks.onNotification) callbacks.onNotification(payload);
          })
          .subscribe();

        // Channel for Active Session Concurrency Lock
        const sessionChannel = this.client.channel('realtime_sessions')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions' }, (payload) => {
            if (callbacks.onSessionLock) callbacks.onSessionLock(payload);
          })
          .subscribe();

        this.realtimeChannels = { appChannel, compChannel, notifChannel, sessionChannel };
      } catch (err) {
        console.warn('[Supabase Realtime] Failed to initialize subscriptions:', err);
      }
    }

    // =========================================================================
    // 11. One-Click Local Data Migration to Supabase
    // =========================================================================
    async seedLocalDataToSupabase(localData, onProgress = () => {}) {
      if (!this.client) {
        return { success: false, error: 'Supabase client is not connected.' };
      }

      try {
        onProgress('Seeding user profiles and student directory...', 15);
        const profilesList = [];
        if (localData.accounts) {
          Object.values(localData.accounts).forEach(acc => profilesList.push(this.transformProfileToDb(acc)));
        }
        if (localData.students) {
          localData.students.forEach(st => {
            if (!profilesList.some(p => p.id === st.id)) {
              profilesList.push(this.transformProfileToDb(st));
            }
          });
        }

        if (profilesList.length) {
          const { error: pErr } = await this.client.from('profiles').upsert(profilesList, { onConflict: 'id' });
          if (pErr) throw pErr;
        }

        onProgress('Seeding campus placement drives & companies...', 35);
        if (localData.companies && localData.companies.length) {
          const compList = localData.companies.map(c => this.transformCompanyToDb(c));
          const { error: cErr } = await this.client.from('companies').upsert(compList, { onConflict: 'id' });
          if (cErr) throw cErr;
        }

        onProgress('Seeding placement applications pipeline...', 55);
        if (localData.applications && localData.applications.length) {
          const appList = localData.applications.map(a => this.transformApplicationToDb(a));
          const { error: aErr } = await this.client.from('applications').upsert(appList, { onConflict: 'id' });
          if (aErr) throw aErr;
        }

        onProgress('Seeding aptitude and interview question bank...', 75);
        if (localData.questions && localData.questions.length) {
          const qList = localData.questions.map(q => ({
            id: q.id,
            category: q.category,
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation
          }));
          await this.client.from('questions').upsert(qList, { onConflict: 'id' });
        }

        if (localData.interviewQuestions && localData.interviewQuestions.length) {
          const iList = localData.interviewQuestions.map(i => ({
            id: i.id,
            type: i.type,
            topic: i.topic,
            question: i.question,
            key_points: i.keyPoints || [],
            ideal_answer: i.idealAnswer
          }));
          await this.client.from('interview_questions').upsert(iList, { onConflict: 'id' });
        }

        onProgress('Seeding notifications and audit logs...', 90);
        if (localData.notifications && localData.notifications.length) {
          const nList = localData.notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            date: n.date,
            type: n.type,
            read: n.read || false
          }));
          await this.client.from('notifications').upsert(nList, { onConflict: 'id' });
        }

        if (localData.auditLogs && localData.auditLogs.length) {
          const lList = localData.auditLogs.map(l => ({
            id: l.id,
            time: l.time,
            user_name: l.user,
            action: l.action
          }));
          await this.client.from('audit_logs').upsert(lList, { onConflict: 'id' });
        }

        if (localData.interviewRequests && localData.interviewRequests.length) {
          const irList = localData.interviewRequests.map(r => ({
            id: r.id,
            student_id: r.studentId,
            student_name: r.studentName,
            student_email: r.studentEmail,
            student_dept: r.studentDept,
            student_roll: r.studentRoll,
            student_cgpa: r.studentCgpa,
            domain: r.domain,
            target_company: r.targetCompany,
            preferred_date: r.preferredDate,
            preferred_time_slot: r.preferredTimeSlot,
            notes: r.notes,
            status: r.status,
            assigned_officer_id: r.assignedOfficerId,
            assigned_officer_name: r.assignedOfficerName,
            scheduled_date: r.scheduledDate,
            scheduled_time: r.scheduledTime,
            mode: r.mode,
            meeting_link: r.meetingLink,
            venue: r.venue,
            officer_notes: r.officerNotes,
            feedback: r.feedback
          }));
          await this.client.from('interview_requests').upsert(irList, { onConflict: 'id' });
        }

        if (localData.reminders && localData.reminders.length) {
          const remList = localData.reminders.map(rem => ({
            id: rem.id,
            student_id: rem.studentId,
            title: rem.title,
            category: rem.category,
            remind_at: rem.remindAt,
            priority: rem.priority,
            repeat: rem.repeat,
            notes: rem.notes,
            url: rem.url,
            status: rem.status
          }));
          await this.client.from('student_reminders').upsert(remList, { onConflict: 'id' });
        }

        onProgress('Supabase database sync complete! All tables populated.', 100);
        return { success: true };
      } catch (err) {
        console.error('[Supabase Sync Error]', err);
        return { success: false, error: err.message };
      }
    }
  }

  window.ptsSupabaseService = new SupabaseService();
})();
