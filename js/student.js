/**
 * Placement Preparation and Tracking System
 * Student Module Controller
 */

window.StudentModule = {
  alarmIntervalId: null,

  init() {
    this.renderStudentDashboard();
    this.renderReminders();
    this.renderStudentInterviewBookings();
    this.initReminderAlarmEngine();
    this.attachEvents();
  },

  attachEvents() {
    // Profile save event
    const profileForm = document.getElementById('studentProfileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Academic Status Radio Toggles (Currently Studying vs Graduated)
    const eduStudying = document.getElementById('eduStatusStudying');
    const eduGraduated = document.getElementById('eduStatusGraduated');
    const studyingWrapper = document.getElementById('studyingDetailsWrapper');
    const graduatedWrapper = document.getElementById('graduatedDetailsWrapper');
    const labelEduStudying = document.getElementById('labelEduStudying');
    const labelEduGraduated = document.getElementById('labelEduGraduated');

    if (eduStudying && eduGraduated) {
      eduStudying.addEventListener('change', () => {
        if (studyingWrapper) studyingWrapper.style.display = 'block';
        if (graduatedWrapper) graduatedWrapper.style.display = 'none';
        labelEduStudying?.classList.add('active');
        labelEduGraduated?.classList.remove('active');
        this.updatePortfolioPreview();
      });
      eduGraduated.addEventListener('change', () => {
        if (studyingWrapper) studyingWrapper.style.display = 'none';
        if (graduatedWrapper) graduatedWrapper.style.display = 'block';
        labelEduGraduated?.classList.add('active');
        labelEduStudying?.classList.remove('active');
        this.updatePortfolioPreview();
      });
    }

    const pursuingYearSelect = document.getElementById('stuPursuingYear');
    const pursuingDegreeSelect = document.getElementById('stuPursuingDegree');
    const completedDegreeInput = document.getElementById('stuCompletedDegree');
    const gradYearSelect = document.getElementById('stuGradYear');

    if (pursuingYearSelect) pursuingYearSelect.addEventListener('change', () => this.updatePortfolioPreview());
    if (pursuingDegreeSelect) pursuingDegreeSelect.addEventListener('change', () => this.updatePortfolioPreview());
    if (completedDegreeInput) completedDegreeInput.addEventListener('input', () => this.updatePortfolioPreview());
    if (gradYearSelect) gradYearSelect.addEventListener('change', () => this.updatePortfolioPreview());

    // Internship Radio Toggles
    const internYes = document.getElementById('internshipYes');
    const internNo = document.getElementById('internshipNo');
    const internWrapper = document.getElementById('internshipDetailsWrapper');
    const labelInternYes = document.getElementById('labelInternYes');
    const labelInternNo = document.getElementById('labelInternNo');

    if (internYes && internNo && internWrapper) {
      internYes.addEventListener('change', () => {
        internWrapper.style.display = 'block';
        labelInternYes?.classList.add('active');
        labelInternNo?.classList.remove('active');
      });
      internNo.addEventListener('change', () => {
        internWrapper.style.display = 'none';
        labelInternNo?.classList.add('active');
        labelInternYes?.classList.remove('active');
      });
    }

    // Hackathon Radio Toggles
    const hackYes = document.getElementById('hackathonYes');
    const hackNo = document.getElementById('hackathonNo');
    const hackWrapper = document.getElementById('hackathonDetailsWrapper');
    const labelHackYes = document.getElementById('labelHackYes');
    const labelHackNo = document.getElementById('labelHackNo');

    if (hackYes && hackNo && hackWrapper) {
      hackYes.addEventListener('change', () => {
        hackWrapper.style.display = 'block';
        labelHackYes?.classList.add('active');
        labelHackNo?.classList.remove('active');
      });
      hackNo.addEventListener('change', () => {
        hackWrapper.style.display = 'none';
        labelHackNo?.classList.add('active');
        labelHackYes?.classList.remove('active');
      });
    }

    // Well-Versed Language Pill Buttons
    const langBtns = document.querySelectorAll('.lang-pill-btn');
    const langInput = document.getElementById('stuLanguages');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const activeLangs = Array.from(document.querySelectorAll('.lang-pill-btn.active')).map(b => b.getAttribute('data-lang'));
        if (langInput) {
          langInput.value = activeLangs.join(', ');
        }
        this.updatePortfolioPreview();
      });
    });

    if (langInput) {
      langInput.addEventListener('input', () => {
        const entered = langInput.value.split(',').map(s => s.trim().toLowerCase());
        langBtns.forEach(btn => {
          const l = (btn.getAttribute('data-lang') || '').toLowerCase();
          if (entered.includes(l)) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
        this.updatePortfolioPreview();
      });
    }

    // Direct Supabase Storage Resume Upload
    const uploadBtn = document.getElementById('uploadResumeStorageBtn');
    const resumeFileInput = document.getElementById('directResumeStorageInput');
    if (uploadBtn && resumeFileInput) {
      uploadBtn.addEventListener('click', () => resumeFileInput.click());
      resumeFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await this.handleResumeStorageUpload(file);
      });
    }

    // Tab buttons within student view
    const studentTabs = document.querySelectorAll('.student-tab-btn');
    studentTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        studentTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        this.switchTab(target);
      });
    });
  },

  switchTab(tabId) {
    document.querySelectorAll('.student-tab-content').forEach(el => el.style.display = 'none');
    const activeSection = document.getElementById(`studentTab_${tabId}`);
    if (activeSection) {
      activeSection.style.display = 'block';
    }

    if (tabId === 'eligibility') {
      this.renderEligibilityChecker();
    } else if (tabId === 'applications') {
      this.renderApplicationTracker();
    } else if (tabId === 'drives') {
      this.renderDrivesList();
    } else if (tabId === 'reminders') {
      this.renderReminders();
    } else if (tabId === 'officer_interviews') {
      this.renderStudentInterviewBookings();
    } else if (tabId === 'interview_feedback') {
      this.renderInterviewFeedbackHub();
    }
  },

  renderStudentDashboard() {
    const student = window.ptsState.data.currentUser;
    if (!student) return;
    if (!student.readiness) {
      student.readiness = { overall: 75, aptitude: 75, coding: 80, communication: 70 };
    }
    const nameInput = document.getElementById('stuName');
    const collegeInput = document.getElementById('stuCollege');
    const emailInput = document.getElementById('stuEmail');
    const deptSelect = document.getElementById('stuDept');
    const cgpaInput = document.getElementById('stuCgpa');
    const arrearsInput = document.getElementById('stuArrears');
    const skillsInput = document.getElementById('stuSkills');
    const langInput = document.getElementById('stuLanguages');

    const welcomeGreeting = document.getElementById('studentWelcomeGreeting');
    if (welcomeGreeting) welcomeGreeting.textContent = `Welcome back, ${student.name || 'Student'}! 🚀`;

    if (nameInput) nameInput.value = student.name || '';
    if (collegeInput) collegeInput.value = student.college || 'Sri Krishna College of Engineering and Technology';
    if (emailInput) emailInput.value = student.email || '';
    if (deptSelect) deptSelect.value = student.department || 'CSE';
    if (cgpaInput) cgpaInput.value = student.cgpa !== undefined ? student.cgpa : 8.45;
    if (arrearsInput) arrearsInput.value = student.arrears !== undefined ? student.arrears : 0;
    if (skillsInput) skillsInput.value = (student.skills || []).join(', ');

    // Populate Academic Status & Year / Degree
    const isStudying = (student.educationStatus || 'studying') === 'studying';
    const eduStudying = document.getElementById('eduStatusStudying');
    const eduGraduated = document.getElementById('eduStatusGraduated');
    const studyingWrapper = document.getElementById('studyingDetailsWrapper');
    const graduatedWrapper = document.getElementById('graduatedDetailsWrapper');
    const labelEduStudying = document.getElementById('labelEduStudying');
    const labelEduGraduated = document.getElementById('labelEduGraduated');

    if (eduStudying && eduGraduated) {
      eduStudying.checked = isStudying;
      eduGraduated.checked = !isStudying;
      if (isStudying) {
        labelEduStudying?.classList.add('active');
        labelEduGraduated?.classList.remove('active');
      } else {
        labelEduGraduated?.classList.add('active');
        labelEduStudying?.classList.remove('active');
      }
    }
    if (studyingWrapper) studyingWrapper.style.display = isStudying ? 'block' : 'none';
    if (graduatedWrapper) graduatedWrapper.style.display = isStudying ? 'none' : 'block';

    const pursuingYearSelect = document.getElementById('stuPursuingYear');
    const pursuingDegreeSelect = document.getElementById('stuPursuingDegree');
    const completedDegreeInput = document.getElementById('stuCompletedDegree');
    const gradYearSelect = document.getElementById('stuGradYear');

    if (pursuingYearSelect) pursuingYearSelect.value = student.pursuingYear || '4th Year / Final Year';
    if (pursuingDegreeSelect) pursuingDegreeSelect.value = student.degree || 'B.E.';
    if (completedDegreeInput) completedDegreeInput.value = student.completedDegree || (isStudying ? '' : student.degree || 'B.E. Computer Science');
    if (gradYearSelect) gradYearSelect.value = student.graduationYear || '2025';

    // Populate Well-Versed Languages
    const wellVersed = student.wellVersedLanguages || ['Python', 'Java', 'C++', 'C'];
    if (langInput) langInput.value = wellVersed.join(', ');
    
    document.querySelectorAll('.lang-pill-btn').forEach(btn => {
      const l = btn.getAttribute('data-lang');
      if (wellVersed.some(wv => wv.toLowerCase() === l.toLowerCase())) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Populate Internship
    const hasIntern = Boolean(student.hasInternship);
    const internYes = document.getElementById('internshipYes');
    const internNo = document.getElementById('internshipNo');
    const internWrapper = document.getElementById('internshipDetailsWrapper');
    const labelInternYes = document.getElementById('labelInternYes');
    const labelInternNo = document.getElementById('labelInternNo');

    if (internYes && internNo) {
      internYes.checked = hasIntern;
      internNo.checked = !hasIntern;
      if (hasIntern) {
        labelInternYes?.classList.add('active');
        labelInternNo?.classList.remove('active');
      } else {
        labelInternNo?.classList.add('active');
        labelInternYes?.classList.remove('active');
      }
    }
    if (internWrapper) {
      internWrapper.style.display = hasIntern ? 'block' : 'none';
    }

    const internCompany = document.getElementById('stuInternCompany');
    const internTopic = document.getElementById('stuInternTopic');
    const internDuration = document.getElementById('stuInternDuration');
    const internDesc = document.getElementById('stuInternDesc');

    if (internCompany) internCompany.value = student.internship?.company || '';
    if (internTopic) internTopic.value = student.internship?.topic || '';
    if (internDuration) internDuration.value = student.internship?.duration || '';
    if (internDesc) internDesc.value = student.internship?.description || '';

    // Populate Hackathons
    const hasHack = Boolean(student.hasHackathons);
    const hackYes = document.getElementById('hackathonYes');
    const hackNo = document.getElementById('hackathonNo');
    const hackWrapper = document.getElementById('hackathonDetailsWrapper');
    const labelHackYes = document.getElementById('labelHackYes');
    const labelHackNo = document.getElementById('labelHackNo');

    if (hackYes && hackNo) {
      hackYes.checked = hasHack;
      hackNo.checked = !hasHack;
      if (hasHack) {
        labelHackYes?.classList.add('active');
        labelHackNo?.classList.remove('active');
      } else {
        labelHackNo?.classList.add('active');
        labelHackYes?.classList.remove('active');
      }
    }
    if (hackWrapper) {
      hackWrapper.style.display = hasHack ? 'block' : 'none';
    }

    const hackName = document.getElementById('stuHackathonName');
    const hackTopic = document.getElementById('stuHackathonTopic');
    const hackPrize = document.getElementById('stuHackathonPrize');

    const firstHack = (student.hackathons && student.hackathons.length > 0) ? student.hackathons[0] : null;
    if (hackName) hackName.value = firstHack?.name || '';
    if (hackTopic) hackTopic.value = firstHack?.topic || '';
    if (hackPrize && firstHack?.achievement) hackPrize.value = firstHack.achievement;

    // Update Live Credentials Preview Card
    this.updatePortfolioPreview();

    // Render Cloud Resume Vault Info
    this.renderResumeStorageInfo();

    // Update readiness gauge
    this.updateReadinessGauge();

    // Render stats
    this.renderSummaryStats();

    // Render Sub-sections
    this.renderEligibilityChecker();
    this.renderApplicationTracker();
    this.renderDrivesList();
  },

  updatePortfolioPreview() {
    const student = window.ptsState.data.currentUser;
    const collegeEl = document.getElementById('previewCollege');
    const internEl = document.getElementById('previewInternship');
    const hackEl = document.getElementById('previewHackathons');
    const langEl = document.getElementById('previewLanguages');

    if (collegeEl) {
      collegeEl.textContent = student.college || 'Sri Krishna College of Engg & Tech';
    }

    const yearDegreeEl = document.getElementById('previewYearDegree');
    if (yearDegreeEl) {
      const isStudying = document.getElementById('eduStatusStudying')?.checked ?? ((student.educationStatus || 'studying') === 'studying');
      if (isStudying) {
        const year = document.getElementById('stuPursuingYear')?.value || student.pursuingYear || '4th Year / Final Year';
        const degree = document.getElementById('stuPursuingDegree')?.value || student.degree || 'B.E.';
        yearDegreeEl.innerHTML = `<span class="badge badge-success" style="font-size:0.68rem; margin-right:4px;"><i class="fas fa-book-reader"></i> ${year}</span> ${degree} • ${student.department || 'CSE'}`;
      } else {
        const compDegree = document.getElementById('stuCompletedDegree')?.value || student.completedDegree || student.degree || 'B.E. Computer Science';
        const gradYear = document.getElementById('stuGradYear')?.value || student.graduationYear || '2025';
        yearDegreeEl.innerHTML = `<span class="badge badge-info" style="font-size:0.68rem; margin-right:4px;"><i class="fas fa-graduation-cap"></i> Graduated (${gradYear})</span> ${compDegree}`;
      }
    }

    if (internEl) {
      if (student.hasInternship && student.internship?.company) {
        internEl.innerHTML = `<strong>${student.internship.company}</strong> <span style="color:var(--text-muted); font-size:0.75rem;">• ${student.internship.topic || 'Industry Intern'}</span>`;
      } else {
        internEl.innerHTML = `<span style="color:var(--text-dim); font-style:italic;">No internship added</span>`;
      }
    }

    if (hackEl) {
      if (student.hasHackathons && student.hackathons?.length && student.hackathons[0].name) {
        const h = student.hackathons[0];
        hackEl.innerHTML = `<strong>${h.name}</strong> <span class="badge badge-warning" style="font-size:0.68rem; margin-left:0.25rem;">${h.achievement || 'Finalist'}</span>`;
      } else {
        hackEl.innerHTML = `<span style="color:var(--text-dim); font-style:italic;">No hackathons added</span>`;
      }
    }

    if (langEl) {
      const langs = student.wellVersedLanguages && student.wellVersedLanguages.length ? student.wellVersedLanguages : ['Python', 'Java', 'C++', 'C'];
      langEl.innerHTML = langs.map(l => `<span class="badge badge-primary" style="font-size:0.72rem;">${l}</span>`).join(' ');
    }
  },

  // ==========================================
  // Supabase Cloud Storage Resume Manager
  // ==========================================
  async handleResumeStorageUpload(file) {
    const student = window.ptsState.data.currentUser;
    const progressEl = document.getElementById('resumeStorageProgress');
    const statusText = document.getElementById('resumeStorageStatusText');
    const uploadBtn = document.getElementById('uploadResumeStorageBtn');

    if (progressEl) progressEl.style.display = 'block';
    if (statusText) statusText.textContent = `Uploading ${file.name} to Supabase Storage...`;
    if (uploadBtn) uploadBtn.disabled = true;

    try {
      let uploadSuccess = false;
      let resumeUrl = '';

      // 1. Try Supabase Client SDK first
      if (window.ptsSupabaseService && window.ptsSupabaseService.isAvailable()) {
        const res = await window.ptsSupabaseService.uploadResumeFile(file, student.id);
        if (res.success) {
          uploadSuccess = true;
          resumeUrl = res.url;
        } else {
          console.warn('[Storage] Client SDK upload failed, trying Java backend proxy:', res.error);
        }
      }

      // 2. Try Java Backend Storage REST API if needed
      if (!uploadSuccess) {
        try {
          const resp = await fetch(`/api/storage/upload?fileName=${encodeURIComponent(file.name)}&studentId=${encodeURIComponent(student.id)}`, {
            method: 'POST',
            body: file,
            headers: { 'Content-Type': file.type || 'application/pdf' }
          });
          const data = await resp.json();
          if (data.success && data.url) {
            uploadSuccess = true;
            resumeUrl = data.url;
          }
        } catch (backendErr) {
          console.warn('[Storage] Java backend storage proxy failed:', backendErr);
        }
      }

      if (uploadSuccess) {
        student.resumeUploaded = true;
        student.resumeName = file.name;
        student.resumeUrl = resumeUrl;

        window.ptsState.saveState();
        window.ptsState.syncProfile(student);
        window.ptsState.addAuditLog(`Student uploaded verified PDF resume '${file.name}' to Supabase Storage`);

        window.App.showToast(`Resume '${file.name}' stored in Supabase Cloud Storage!`, 'success');
        this.renderResumeStorageInfo();
      } else {
        // Fallback local update
        student.resumeUploaded = true;
        student.resumeName = file.name;
        window.ptsState.saveState();
        window.App.showToast(`Selected '${file.name}'. Ensure bucket 'resumes' is created in Supabase.`, 'warning');
        this.renderResumeStorageInfo();
      }
    } catch (err) {
      window.App.showToast(`Upload error: ${err.message}`, 'danger');
    } finally {
      if (progressEl) progressEl.style.display = 'none';
      if (uploadBtn) uploadBtn.disabled = false;
    }
  },

  renderResumeStorageInfo() {
    const student = window.ptsState.data.currentUser;
    const nameEl = document.getElementById('cloudResumeFileName');
    const statusEl = document.getElementById('cloudResumeStatus');
    const downloadBtn = document.getElementById('cloudResumeDownloadBtn');

    if (nameEl) nameEl.textContent = student.resumeName || 'Sashti_Resume_2026.pdf';
    
    let url = student.resumeUrl;
    if (!url && window.ptsSupabase) {
      const cfg = window.ptsSupabase.getConfig();
      if (cfg.url) {
        url = `${cfg.url}/storage/v1/object/public/resumes/${student.id}/${student.resumeName || 'Sashti_Resume_2026.pdf'}`;
      }
    }

    if (downloadBtn) {
      if (url) {
        downloadBtn.href = url;
        downloadBtn.style.display = 'inline-flex';
      } else {
        downloadBtn.href = '#';
      }
    }

    if (statusEl) {
      if (student.resumeUploaded) {
        statusEl.innerHTML = `<span style="color:#10b981;"><i class="fas fa-check-circle"></i> Supabase Storage: /resumes/${student.id}/</span>`;
      } else {
        statusEl.textContent = 'Not uploaded to Supabase Storage yet';
      }
    }
  },

  renderSummaryStats() {
    const student = window.ptsState.data.currentUser;
    if (!student) return;
    const apps = (window.ptsState.data.applications || []).filter(a => a.studentId === student.id);
    const eligibleCount = (window.ptsState.data.companies || []).filter(c => window.ptsState.checkEligibility(student, c).isEligible).length;

    const totalAppsEl = document.getElementById('stuStat_totalApps');
    const eligibleCountEl = document.getElementById('stuStat_eligible');
    const testsCountEl = document.getElementById('stuStat_tests');
    const readinessEl = document.getElementById('stuStat_readiness');

    const readiness = student.readiness || { overall: 75, aptitude: 75, coding: 80, communication: 70 };
    if (totalAppsEl) totalAppsEl.textContent = apps.length;
    if (eligibleCountEl) eligibleCountEl.textContent = eligibleCount;
    if (testsCountEl) testsCountEl.textContent = student.testsCompleted || 0;
    if (readinessEl) readinessEl.textContent = `${readiness.overall || 75}%`;
  },

  updateReadinessGauge() {
    const student = window.ptsState.data.currentUser;
    if (!student) return;
    const readiness = student.readiness || { overall: 75, aptitude: 75, coding: 80, communication: 70 };
    const score = readiness.overall || 75;
    
    const numberEl = document.getElementById('readinessScoreVal');
    const circle = document.querySelector('.circle-progress');
    if (numberEl) numberEl.textContent = `${score}%`;
    if (circle) {
      const offset = 440 - (440 * score) / 100;
      circle.style.strokeDashoffset = offset;
    }

    // Sub bars
    const aptBar = document.getElementById('barAptitude');
    const codBar = document.getElementById('barCoding');
    const comBar = document.getElementById('barComm');
    
    if (aptBar) aptBar.style.width = `${readiness.aptitude || 75}%`;
    if (codBar) codBar.style.width = `${readiness.coding || 80}%`;
    if (comBar) comBar.style.width = `${readiness.communication || 70}%`;

    const aptVal = document.getElementById('valAptitude');
    const codVal = document.getElementById('valCoding');
    const comVal = document.getElementById('valComm');
    if (aptVal) aptVal.textContent = `${readiness.aptitude || 75}%`;
    if (codVal) codVal.textContent = `${readiness.coding || 80}%`;
    if (comVal) comVal.textContent = `${readiness.communication || 70}%`;
  },

  saveProfile() {
    const student = window.ptsState.data.currentUser;
    const name = document.getElementById('stuName').value.trim();
    const college = document.getElementById('stuCollege').value.trim();
    const email = document.getElementById('stuEmail').value.trim();
    const cgpa = parseFloat(document.getElementById('stuCgpa').value);
    const arrears = parseInt(document.getElementById('stuArrears').value, 10);
    const dept = document.getElementById('stuDept').value;
    const skills = document.getElementById('stuSkills').value.split(',').map(s => s.trim()).filter(s => s.length > 0);

    // Languages well-versed
    const activeLangBtns = Array.from(document.querySelectorAll('.lang-pill-btn.active')).map(b => b.getAttribute('data-lang'));
    const typedLangs = (document.getElementById('stuLanguages')?.value || '').split(',').map(s => s.trim()).filter(s => s.length > 0);
    const mergedLangs = Array.from(new Set([...activeLangBtns, ...typedLangs]));

    // Internship
    const hasInternship = document.getElementById('internshipYes')?.checked || false;
    const internCompany = document.getElementById('stuInternCompany')?.value.trim() || '';
    const internTopic = document.getElementById('stuInternTopic')?.value.trim() || '';
    const internDuration = document.getElementById('stuInternDuration')?.value.trim() || '';
    const internDesc = document.getElementById('stuInternDesc')?.value.trim() || '';

    // Hackathons
    const hasHackathons = document.getElementById('hackathonYes')?.checked || false;
    const hackName = document.getElementById('stuHackathonName')?.value.trim() || '';
    const hackTopic = document.getElementById('stuHackathonTopic')?.value.trim() || '';
    const hackPrize = document.getElementById('stuHackathonPrize')?.value || 'Active Participant';

    if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
      window.App.showToast('Please enter a valid CGPA between 0.0 and 10.0', 'danger');
      return;
    }

    // Academic Status & Pursuing Year / Degree
    const isStudying = document.getElementById('eduStatusStudying')?.checked ?? true;
    const educationStatus = isStudying ? 'studying' : 'graduated';
    const pursuingYear = document.getElementById('stuPursuingYear')?.value || '4th Year / Final Year';
    const pursuingDegree = document.getElementById('stuPursuingDegree')?.value || 'B.E.';
    const completedDegree = document.getElementById('stuCompletedDegree')?.value.trim() || 'B.E. Computer Science';
    const gradYear = document.getElementById('stuGradYear')?.value || '2025';

    student.name = name || student.name;
    student.college = college || student.college;
    student.email = email || student.email;
    student.cgpa = cgpa;
    student.arrears = isNaN(arrears) ? 0 : arrears;
    student.department = dept;
    student.skills = skills;
    student.wellVersedLanguages = mergedLangs.length ? mergedLangs : ['Python', 'Java', 'C++', 'C'];
    
    student.educationStatus = educationStatus;
    student.pursuingYear = isStudying ? pursuingYear : '';
    student.degree = isStudying ? pursuingDegree : completedDegree;
    student.completedDegree = isStudying ? '' : completedDegree;
    student.graduationYear = isStudying ? '2026' : gradYear;
    student.title = isStudying ? `${pursuingYear} ${pursuingDegree} Student` : `Graduated (${completedDegree})`;

    // Update sidebar footer text dynamically
    const sideRole = document.getElementById('sidebarUserRole');
    if (sideRole) {
      sideRole.textContent = `${student.title} • ${student.cgpa} CGPA`;
    }

    student.hasInternship = hasInternship;
    student.internship = {
      hasDone: hasInternship,
      company: internCompany,
      topic: internTopic,
      duration: internDuration,
      description: internDesc
    };

    student.hasHackathons = hasHackathons;
    student.hackathons = hasHackathons && hackName ? [
      {
        name: hackName,
        topic: hackTopic,
        achievement: hackPrize
      }
    ] : [];

    // Sync with accounts.student and students directory list
    if (window.ptsState.data.accounts && window.ptsState.data.accounts.student) {
      Object.assign(window.ptsState.data.accounts.student, {
        name: student.name,
        college: student.college,
        email: student.email,
        department: student.department,
        cgpa: student.cgpa,
        arrears: student.arrears,
        skills: student.skills,
        wellVersedLanguages: student.wellVersedLanguages,
        educationStatus: student.educationStatus,
        pursuingYear: student.pursuingYear,
        degree: student.degree,
        completedDegree: student.completedDegree,
        graduationYear: student.graduationYear,
        title: student.title,
        hasInternship: student.hasInternship,
        internship: student.internship,
        hasHackathons: student.hasHackathons,
        hackathons: student.hackathons
      });
    }

    const stInList = (window.ptsState.data.students || []).find(s => s.id === student.id);
    if (stInList) {
      stInList.name = student.name;
      stInList.college = student.college;
      stInList.email = student.email;
      stInList.department = student.department;
      stInList.cgpa = student.cgpa;
      stInList.arrears = student.arrears;
      stInList.skills = student.skills;
      stInList.wellVersedLanguages = student.wellVersedLanguages;
      stInList.educationStatus = student.educationStatus;
      stInList.pursuingYear = student.pursuingYear;
      stInList.degree = student.degree;
      stInList.completedDegree = student.completedDegree;
      stInList.graduationYear = student.graduationYear;
      stInList.hasInternship = student.hasInternship;
      stInList.internship = student.internship;
      stInList.hasHackathons = student.hasHackathons;
      stInList.hackathons = student.hackathons;
    }

    // Dynamically recalculate aptitude / readiness rating
    const baseAptitude = Math.min(95, Math.round(student.cgpa * 10));
    student.readiness.aptitude = baseAptitude;
    student.readiness.overall = Math.round((student.readiness.aptitude + student.readiness.coding + student.readiness.communication) / 3);

    // Save and log
    window.ptsState.saveState();
    window.ptsState.syncProfile(student);
    window.ptsState.addAuditLog(`Student profile updated: ${student.name} (${student.college}) • CGPA ${student.cgpa} • Languages: ${student.wellVersedLanguages.join(', ')}`);
    
    this.updatePortfolioPreview();
    this.updateReadinessGauge();
    this.renderSummaryStats();
    this.renderEligibilityChecker();
    this.renderDrivesList();

    window.App.showToast('Academic & Placement profile updated successfully! Eligibility recalculated.', 'success');
  },

  // Company Eligibility Evaluator
  renderEligibilityChecker() {
    const container = document.getElementById('eligibilityTableBody');
    if (!container) return;

    const student = window.ptsState.data.currentUser;
    const companies = window.ptsState.data.companies;
    const applications = window.ptsState.data.applications.filter(a => a.studentId === student.id);

    container.innerHTML = companies.map(comp => {
      const eligibility = window.ptsState.checkEligibility(student, comp);
      const hasApplied = applications.some(a => a.companyId === comp.id);

      let actionBtn = '';
      if (hasApplied) {
        actionBtn = `<span class="badge badge-info"><i class="fas fa-check-circle"></i> Applied</span>`;
      } else if (eligibility.isEligible) {
        actionBtn = `<button class="btn btn-primary btn-sm" onclick="StudentModule.apply('${comp.id}')"><i class="fas fa-paper-plane"></i> Apply Now</button>`;
      } else {
        actionBtn = `<button class="btn btn-secondary btn-sm" disabled style="opacity:0.5; cursor:not-allowed;">Not Eligible</button>`;
      }

      const statusBadge = eligibility.isEligible 
        ? `<span class="badge badge-success badge-dot">Eligible</span>`
        : `<span class="badge badge-danger badge-dot">Not Eligible</span>`;

      const reasonsText = eligibility.isEligible
        ? `<span style="color:var(--success); font-size:0.8rem;"><i class="fas fa-check"></i> Meets CGPA (>= ${comp.minCgpa}), Dept & Arrears criteria</span>`
        : `<span style="color:var(--danger); font-size:0.8rem;"><i class="fas fa-times-circle"></i> ${eligibility.reasons.join('<br><i class="fas fa-times-circle"></i> ')}</span>`;

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:36px; height:36px; border-radius:var(--radius-sm); background:#fff; padding:3px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${comp.logo}" alt="${comp.name}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3061/3061341.png'">
              </div>
              <div>
                <strong style="color:var(--text-main); font-size:0.92rem;">${comp.name}</strong>
                <div style="font-size:0.78rem; color:var(--text-muted);">${comp.role}</div>
              </div>
            </div>
          </td>
          <td><strong style="color:#a78bfa;">${comp.ctc}</strong></td>
          <td>
            <div style="font-size:0.82rem;">Min CGPA: <strong>${comp.minCgpa.toFixed(1)}</strong></div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Max Arrears: ${comp.maxArrears} | Depts: ${comp.allowedDepts.join(', ')}</div>
          </td>
          <td>${statusBadge}</td>
          <td>${reasonsText}</td>
          <td style="text-align:right;">${actionBtn}</td>
        </tr>
      `;
    }).join('');
  },

  apply(companyId) {
    this.openApplyModal(companyId);
  },

  openApplyModal(companyId) {
    const student = window.ptsState.data.currentUser;
    const company = window.ptsState.data.companies.find(c => c.id === companyId);
    if (!company) {
      window.App.showToast('Company drive not found.', 'danger');
      return;
    }

    const eligibility = window.ptsState.checkEligibility(student, company);
    if (!eligibility.isEligible) {
      window.App.showToast('You do not meet the drive eligibility criteria: ' + eligibility.reasons.join(', '), 'warning');
      return;
    }

    const modal = document.getElementById('applyDriveModal');
    if (!modal) return;

    // Set hidden company ID and display info
    document.getElementById('applyModalCompanyId').value = companyId;
    document.getElementById('applyModalCompanyName').textContent = company.name;
    document.getElementById('applyModalRoleTitle').textContent = `${company.role} • ${company.category}`;
    document.getElementById('applyModalCtc').textContent = company.ctc;
    document.getElementById('applyModalCutoff').textContent = `Min CGPA: ${company.minCgpa.toFixed(1)} | Arrears: max ${company.maxArrears}`;

    const logoImg = document.getElementById('applyModalLogo');
    if (logoImg) logoImg.src = company.logo || 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png';

    // Reset form fields
    const coverNote = document.getElementById('applyModalCoverNote');
    if (coverNote) coverNote.value = '';

    const uploadBox = document.getElementById('applyResumeUploadBox');
    const profileOpt = document.getElementById('applyResumeProfileOption');
    const statusAlert = document.getElementById('applyPdfStatusAlert');
    const fileInput = document.getElementById('applyPdfFileInput');
    if (fileInput) fileInput.value = '';
    this.currentCustomPdfData = null;

    // Check if student has a verified PDF in profile
    const hasProfilePdf = Boolean(student.resumeUploaded && (student.resumeName || '').toLowerCase().endsWith('.pdf'));

    if (hasProfilePdf) {
      profileOpt.style.display = 'block';
      document.getElementById('applyModalProfileResumeName').textContent = student.resumeName || 'Sashti_Resume_2026.pdf';
      document.getElementById('applyResumeSourceProfile').checked = true;
      if (uploadBox) uploadBox.style.display = 'none';
      if (statusAlert) {
        statusAlert.style.display = 'block';
        statusAlert.style.background = 'rgba(16, 185, 129, 0.1)';
        statusAlert.style.color = '#10b981';
        statusAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        statusAlert.innerHTML = `<i class="fas fa-check-circle"></i> Using profile verified PDF resume: <strong>${student.resumeName || 'Sashti_Resume_2026.pdf'}</strong>`;
      }
    } else {
      profileOpt.style.display = 'none';
      document.getElementById('applyResumeSourceUpload').checked = true;
      if (uploadBox) uploadBox.style.display = 'block';
      if (statusAlert) {
        statusAlert.style.display = 'block';
        statusAlert.style.background = 'rgba(245, 158, 11, 0.1)';
        statusAlert.style.color = '#f59e0b';
        statusAlert.style.border = '1px solid rgba(245, 158, 11, 0.3)';
        statusAlert.innerHTML = `<i class="fas fa-info-circle"></i> Please upload your resume in <strong>PDF format (.pdf)</strong> for recruiter ATS verification.`;
      }
    }

    modal.classList.add('active');
  },

  toggleApplyResumeSource() {
    const isUpload = document.getElementById('applyResumeSourceUpload')?.checked;
    const uploadBox = document.getElementById('applyResumeUploadBox');
    const statusAlert = document.getElementById('applyPdfStatusAlert');
    const student = window.ptsState.data.currentUser;

    if (isUpload) {
      if (uploadBox) uploadBox.style.display = 'block';
      if (statusAlert) {
        if (this.currentCustomPdfData) {
          statusAlert.style.display = 'block';
          statusAlert.style.background = 'rgba(16, 185, 129, 0.1)';
          statusAlert.style.color = '#10b981';
          statusAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          statusAlert.innerHTML = `<i class="fas fa-check-circle"></i> Selected PDF: <strong>${this.currentCustomPdfData.name}</strong> (${this.currentCustomPdfData.size})`;
        } else {
          statusAlert.style.display = 'block';
          statusAlert.style.background = 'rgba(245, 158, 11, 0.1)';
          statusAlert.style.color = '#f59e0b';
          statusAlert.style.border = '1px solid rgba(245, 158, 11, 0.3)';
          statusAlert.innerHTML = `<i class="fas fa-file-upload"></i> Click the box above to select your PDF resume file.`;
        }
      }
    } else {
      if (uploadBox) uploadBox.style.display = 'none';
      if (statusAlert) {
        statusAlert.style.display = 'block';
        statusAlert.style.background = 'rgba(16, 185, 129, 0.1)';
        statusAlert.style.color = '#10b981';
        statusAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        statusAlert.innerHTML = `<i class="fas fa-check-circle"></i> Using profile verified PDF resume: <strong>${student.resumeName || 'Sashti_Resume_2026.pdf'}</strong>`;
      }
    }
  },

  handleApplyPdfSelected(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    // Strict PDF format validation
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      window.App.showToast('Invalid file format! Only PDF documents (.pdf) are accepted for ATS verification.', 'danger');
      input.value = '';
      return;
    }

    const fileSizeKb = Math.round(file.size / 1024);
    const fileNameEl = document.getElementById('applyUploadFileName');
    if (fileNameEl) {
      fileNameEl.innerHTML = `<span style="color:#10b981;"><i class="fas fa-file-pdf"></i> ${file.name} (${fileSizeKb} KB)</span>`;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUri = e.target.result;
      let extractedText = '';

      // Try extraction using pdf.js if available
      try {
        if (window.pdfjsLib) {
          const loadingTask = window.pdfjsLib.getDocument({ data: atob(dataUri.split(',')[1]) });
          const pdfDoc = await loadingTask.promise;
          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const content = await page.getTextContent();
            extractedText += content.items.map(it => it.str).join(' ') + '\n';
          }
        }
      } catch (err) {
        console.warn('PDF.js text parse fallback:', err);
      }

      this.currentCustomPdfData = {
        name: file.name,
        size: `${fileSizeKb} KB`,
        dataUri: dataUri,
        text: extractedText
      };

      const statusAlert = document.getElementById('applyPdfStatusAlert');
      if (statusAlert) {
        statusAlert.style.display = 'block';
        statusAlert.style.background = 'rgba(16, 185, 129, 0.1)';
        statusAlert.style.color = '#10b981';
        statusAlert.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        statusAlert.innerHTML = `<i class="fas fa-check-circle"></i> Validated PDF document: <strong>${file.name}</strong> (${fileSizeKb} KB) ready for ATS parser.`;
      }
    };
    reader.readAsDataURL(file);
  },

  handleConfirmApplyWithPdf() {
    const companyId = document.getElementById('applyModalCompanyId')?.value;
    if (!companyId) return;

    const student = window.ptsState.data.currentUser;
    const isProfileSource = document.getElementById('applyResumeSourceProfile')?.checked;
    const coverNote = document.getElementById('applyModalCoverNote')?.value.trim();

    let resumePdfName = '';
    let resumePdfSize = '184 KB';
    let resumePdfDataUri = '';
    let resumePdfContent = '';

    if (isProfileSource) {
      resumePdfName = student.resumeName || `${student.name.replace(/\s+/g, '_')}_Resume.pdf`;
      resumePdfContent = student.resumeContent || '';
      resumePdfDataUri = student.resumePdfDataUri || '';
    } else {
      if (!this.currentCustomPdfData) {
        window.App.showToast('Please select or upload a valid PDF resume file before submitting.', 'warning');
        return;
      }
      resumePdfName = this.currentCustomPdfData.name;
      resumePdfSize = this.currentCustomPdfData.size;
      resumePdfDataUri = this.currentCustomPdfData.dataUri;
      resumePdfContent = this.currentCustomPdfData.text || student.resumeContent || '';
    }

    const res = window.ptsState.applyForDrive(companyId, {
      resumePdfName,
      resumePdfSize,
      resumePdfDataUri,
      resumePdfContent,
      coverNote
    });

    if (res.success) {
      window.App.showToast(res.message, 'success');
      document.getElementById('applyDriveModal')?.classList.remove('active');
      this.renderEligibilityChecker();
      this.renderSummaryStats();
      this.renderApplicationTracker();
      this.renderDrivesList();
    } else {
      window.App.showToast(res.message, 'danger');
    }
  },

  // Placement Drives List
  renderDrivesList() {
    const container = document.getElementById('drivesCardsContainer');
    if (!container) return;

    const student = window.ptsState.data.currentUser;
    const companies = window.ptsState.data.companies;
    const applications = window.ptsState.data.applications.filter(a => a.studentId === student.id);

    container.innerHTML = companies.map(comp => {
      const eligibility = window.ptsState.checkEligibility(student, comp);
      const hasApplied = applications.some(a => a.companyId === comp.id);

      return `
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
              <div style="display:flex; gap:0.85rem; align-items:center;">
                <div style="width:46px; height:46px; border-radius:var(--radius-md); background:#fff; padding:6px; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">
                  <img src="${comp.logo}" alt="${comp.name}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3061/3061341.png'">
                </div>
                <div>
                  <h3 style="font-size:1.1rem; margin-bottom:0.15rem;">${comp.name}</h3>
                  <span class="badge badge-primary">${comp.category}</span>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:#34d399;">${comp.ctc}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${comp.location}</div>
              </div>
            </div>

            <p style="font-size:0.85rem; margin-bottom:0.75rem; line-height:1.4;">${comp.description}</p>

            ${(comp.requirements && comp.requirements.length > 0) ? `
              <div style="margin-bottom:0.85rem; background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle); padding:0.6rem 0.8rem; border-radius:var(--radius-sm);">
                <div style="font-size:0.72rem; text-transform:uppercase; font-weight:700; color:var(--text-dim); margin-bottom:0.35rem;">
                  <i class="fas fa-check-circle" style="color:#10b981;"></i> Requirements & Expected Skills:
                </div>
                <div style="display:flex; flex-direction:column; gap:0.25rem;">
                  ${comp.requirements.map(r => `<div style="font-size:0.78rem; color:var(--text-main); display:flex; gap:0.35rem;"><span style="color:#10b981;">•</span> <span>${r}</span></div>`).join('')}
                </div>
              </div>
            ` : ''}

            <div class="student-job-info-box" style="background:var(--bg-card-hover); border:1px solid var(--border-subtle); padding:0.75rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; font-size:0.8rem; color:var(--text-main);">
              <div style="margin-bottom:0.25rem;"><strong>Selection Rounds:</strong> ${(comp.rounds || ['Assessment', 'Interview', 'HR']).join(' → ')}</div>
              <div style="display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.75rem; margin-top:0.4rem;">
                <span><i class="far fa-calendar-alt"></i> Drive: ${comp.driveDate}</span>
                <span style="color:var(--warning);"><i class="far fa-clock"></i> Deadline: ${comp.deadline}</span>
              </div>
            </div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border-subtle); padding-top:1rem;">
            <div>
              ${eligibility.isEligible 
                ? '<span class="badge badge-success badge-dot">Eligible Profile</span>' 
                : `<span class="badge badge-danger badge-dot" title="${eligibility.reasons.join('; ')}">Criteria Not Met</span>`
              }
            </div>
            <div>
              ${hasApplied 
                ? '<span class="badge badge-info"><i class="fas fa-check"></i> Applied</span>'
                : `<button class="btn btn-primary btn-sm" ${!eligibility.isEligible ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="StudentModule.apply('${comp.id}')">
                    <i class="fas fa-paper-plane"></i> Apply Now
                   </button>`
              }
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Application Pipeline Tracker
  renderApplicationTracker() {
    const container = document.getElementById('applicationsListContainer');
    if (!container) return;

    const student = window.ptsState.data.currentUser;
    const apps = window.ptsState.data.applications.filter(a => a.studentId === student.id);

    if (apps.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align:center; padding:3rem 1rem;">
          <i class="fas fa-folder-open" style="font-size:3rem; color:var(--text-dim); margin-bottom:1rem;"></i>
          <h3>No Applications Submitted Yet</h3>
          <p style="margin-top:0.5rem; margin-bottom:1.5rem;">Check your eligibility and apply to upcoming placement drives.</p>
          <button class="btn btn-primary" onclick="StudentModule.switchTab('eligibility')"><i class="fas fa-check-double"></i> Check Eligibility</button>
        </div>
      `;
      return;
    }

    const stages = [
      { name: 'Applied', icon: 'fa-paper-plane' },
      { name: 'Shortlisted', icon: 'fa-user-check' },
      { name: 'Technical Round', icon: 'fa-laptop-code' },
      { name: 'HR Interview', icon: 'fa-comments' },
      { name: 'Selected', icon: 'fa-award' }
    ];

    container.innerHTML = apps.map(app => {
      const stepperHtml = stages.map((st, i) => {
        const stepNum = i + 1;
        let stepClass = '';
        if (app.status === 'Selected') {
          stepClass = 'completed';
        } else if (app.status === 'Rejected' && stepNum === app.stepIndex) {
          stepClass = 'rejected';
        } else if (stepNum < app.stepIndex) {
          stepClass = 'completed';
        } else if (stepNum === app.stepIndex) {
          stepClass = 'current';
        }

        return `
          <div class="step-item ${stepClass}">
            <div class="step-node"><i class="fas ${st.icon}"></i></div>
            <span class="step-title">${st.name}</span>
          </div>
        `;
      }).join('');

      let statusBadge = `<span class="badge badge-primary">${app.status}</span>`;
      if (app.status === 'Accepted for Interview') statusBadge = `<span class="badge badge-success" style="font-size:0.85rem; padding:0.35rem 0.75rem;"><i class="fas fa-calendar-check"></i> Accepted for Interview 🎉</span>`;
      else if (app.status === 'Selected') statusBadge = `<span class="badge badge-success"><i class="fas fa-trophy"></i> Offer Extended</span>`;
      else if (app.status === 'Rejected') statusBadge = `<span class="badge badge-danger" style="font-size:0.85rem; padding:0.35rem 0.75rem;"><i class="fas fa-times-circle"></i> Application Rejected</span>`;

      return `
        <div class="card" style="margin-bottom:1.5rem; ${app.status === 'Accepted for Interview' ? 'border-left:5px solid var(--success);' : app.status === 'Rejected' ? 'border-left:5px solid var(--danger);' : ''}">
          <div class="card-header" style="margin-bottom:0.75rem;">
            <div>
              <h3 style="font-size:1.2rem; display:flex; align-items:center; gap:0.5rem;">
                <i class="fas fa-building" style="color:var(--primary-light);"></i> ${app.companyName}
              </h3>
              <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.2rem;">
                Position: <strong>${app.role}</strong> | Applied on: ${app.appliedDate}
                <span style="margin-left:0.75rem; color:var(--primary-light); font-size:0.8rem; background:rgba(99,102,241,0.08); padding:2px 8px; border-radius:var(--radius-sm); border:1px solid rgba(99,102,241,0.2);">
                  <i class="fas fa-file-pdf" style="color:#ef4444;"></i> <strong>${app.resumePdfName || 'Candidate_Resume.pdf'}</strong> (PDF Verified ✓)
                </span>
              </div>
            </div>
            <div>${statusBadge}</div>
          </div>

          <!-- Stepper Graphic -->
          <div class="pipeline-stepper">
            ${stepperHtml}
          </div>

          <!-- ACCEPTED FOR INTERVIEW CARD -->
          ${app.status === 'Accepted for Interview' ? `
            <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-md); padding:1rem 1.25rem; margin-top:0.75rem; margin-bottom:0.75rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
                <div style="font-weight:700; color:var(--success); font-size:0.95rem; display:flex; align-items:center; gap:0.4rem;">
                  <i class="fas fa-check-circle"></i> Congratulations! The recruiter has reviewed your resume and accepted you for an interview!
                </div>
                <span class="badge badge-success"><i class="fas fa-user-check"></i> Interview Scheduled</span>
              </div>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; margin-top:0.5rem; background:rgba(0,0,0,0.12); border-radius:var(--radius-sm); padding:0.75rem;">
                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Interview Round:</span>
                  <div style="font-weight:700; color:var(--text-main); font-size:0.9rem; margin-top:2px;">${app.interviewRound || app.currentRound}</div>
                </div>
                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Scheduled Date & Time:</span>
                  <div style="font-weight:700; color:var(--success); font-size:0.9rem; margin-top:2px;">
                    <i class="fas fa-clock"></i> ${app.scheduledDate || 'Upcoming'} at ${app.scheduledTime || '10:30 AM'}
                  </div>
                </div>
                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Interview Mode:</span>
                  <div style="font-weight:700; font-size:0.9rem; margin-top:2px;">
                    ${app.interviewMode === 'Online' 
                      ? '<span style="color:#38bdf8;"><i class="fas fa-video"></i> Online Video Meeting</span>' 
                      : `<span style="color:var(--success);"><i class="fas fa-building"></i> ${app.venue || 'Placement Block'}</span>`}
                  </div>
                </div>
              </div>

              ${app.interviewMode === 'Online' && app.meetingLink ? `
                <div style="margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.25); border-radius:var(--radius-sm); padding:0.6rem 0.9rem;">
                  <div style="font-size:0.83rem;">
                    <strong style="color:#38bdf8;"><i class="fab fa-google"></i> Google Meet Interview Room:</strong>
                    <span style="font-family:monospace; color:var(--text-muted); margin-left:0.35rem;">${app.meetingLink}</span>
                  </div>
                  <a href="${app.meetingLink}" target="_blank" class="btn btn-primary btn-xs" style="background:#2563eb; font-weight:700;">
                    <i class="fas fa-video"></i> Join Interview Call
                  </a>
                </div>
              ` : ''}

              ${app.recruiterFeedback ? `
                <div style="margin-top:0.65rem; font-size:0.85rem; color:var(--text-main); background:rgba(255,255,255,0.03); border-radius:var(--radius-sm); padding:0.6rem 0.85rem; border-left:3px solid var(--success);">
                  <strong><i class="fas fa-comment-alt" style="color:var(--success);"></i> Recruiter Notes & Preparation Guidance:</strong>
                  <div style="margin-top:0.25rem; font-style:italic;">"${app.recruiterFeedback}"</div>
                </div>
              ` : ''}

              <div style="margin-top:0.75rem; display:flex; justify-content:flex-end;">
                <button class="btn btn-outline btn-xs" onclick="StudentModule.handleSetReminderForInterview('${app.id}')">
                  <i class="fas fa-bell"></i> Set Alarm Reminder for Interview
                </button>
              </div>
            </div>
          ` : ''}

          <!-- REJECTED WITH REASON CARD -->
          ${app.status === 'Rejected' ? `
            <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.25); border-radius:var(--radius-md); padding:1rem 1.25rem; margin-top:0.75rem; margin-bottom:0.75rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
                <div style="font-weight:700; color:#ef4444; font-size:0.95rem; display:flex; align-items:center; gap:0.4rem;">
                  <i class="fas fa-times-circle"></i> Application Not Shortlisted for Interview
                </div>
                <span class="badge badge-danger">Not Selected</span>
              </div>

              <!-- Clear Rejection Reason Box -->
              <div style="background:rgba(239,68,68,0.08); border-left:4px solid #ef4444; border-radius:var(--radius-sm); padding:0.75rem 1rem; margin-top:0.5rem;">
                <strong style="color:#ef4444; font-size:0.85rem; display:flex; align-items:center; gap:0.35rem;">
                  <i class="fas fa-exclamation-triangle"></i> Exact Reason Received from Recruiter:
                </strong>
                <p style="margin:0.35rem 0 0 0; font-size:0.88rem; color:var(--text-main); font-weight:500; line-height:1.45;">
                  "${app.rejectionReason || app.notes || 'Candidate profile did not meet the drive benchmark criteria.'}"
                </p>
              </div>

              ${app.recruiterFeedback ? `
                <div style="background:rgba(245,158,11,0.08); border-left:4px solid #f59e0b; border-radius:var(--radius-sm); padding:0.75rem 1rem; margin-top:0.6rem;">
                  <strong style="color:#f59e0b; font-size:0.85rem; display:flex; align-items:center; gap:0.35rem;">
                    <i class="fas fa-lightbulb"></i> Recruiter Guidance & Improvement Advice:
                  </strong>
                  <p style="margin:0.35rem 0 0 0; font-size:0.85rem; color:var(--text-muted); line-height:1.45;">
                    ${app.recruiterFeedback}
                  </p>
                </div>
              ` : ''}

              <div style="display:flex; gap:0.5rem; justify-content:flex-end; flex-wrap:wrap; margin-top:0.85rem; padding-top:0.65rem; border-top:1px dashed rgba(239,68,68,0.2);">
                <button class="btn btn-outline btn-xs" onclick="window.App.switchView('view-tests')">
                  <i class="fas fa-code"></i> Practice LeetCode Problems
                </button>
                <button class="btn btn-primary btn-xs" onclick="StudentModule.switchTab('interview_feedback')">
                  <i class="fas fa-user-tie"></i> View Mock Interview Guidance
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Standard Stage Bar (when not accepted/rejected or for general status) -->
          ${app.status !== 'Accepted for Interview' && app.status !== 'Rejected' ? `
            <div style="background:var(--bg-card-hover); padding:0.9rem 1.15rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
              <div>
                <span style="font-size:0.75rem; text-transform:uppercase; color:var(--text-dim); font-weight:700;">Current Stage</span>
                <div style="font-size:0.9rem; font-weight:600; color:var(--text-main);"><i class="fas fa-circle-notch fa-spin" style="color:var(--warning); font-size:0.75rem; margin-right:0.35rem;"></i> ${app.currentRound}</div>
              </div>
              <div style="font-size:0.85rem; color:var(--text-muted); max-width:550px;">
                <i class="fas fa-info-circle"></i> <em>${app.notes || 'Application under continuous evaluation.'}</em>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  // ==========================================
  // Student Study Reminders & Alarms (Student Alone)
  // ==========================================
  renderReminders() {
    const student = window.ptsState.data.currentUser || { id: 'STU-101' };
    const allReminders = window.ptsState.data.reminders || [];
    const myReminders = allReminders.filter(r => !r.studentId || r.studentId === student.id);

    const activeList = myReminders.filter(r => r.status === 'Active' || r.status === 'Snoozed');
    const completedList = myReminders.filter(r => r.status === 'Completed');

    // Update reminder stats counters
    const activeCountEl = document.getElementById('stuReminderActiveCount');
    const completedCountEl = document.getElementById('stuReminderCompletedCount');
    if (activeCountEl) activeCountEl.textContent = activeList.length;
    if (completedCountEl) completedCountEl.textContent = completedList.length;

    // Render Active Reminders List
    const container = document.getElementById('studentRemindersList');
    if (container) {
      if (myReminders.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <i class="fas fa-bell-slash" style="font-size:2.5rem; color:var(--primary-light); margin-bottom:0.75rem; opacity:0.8;"></i>
            <div style="font-weight:600; font-size:1rem; color:var(--text-main);">No Reminders Set Yet</div>
            <p style="font-size:0.85rem; margin-top:0.25rem;">Use the quick presets below or create a custom alarm to stay disciplined with LeetCode & interview prep!</p>
          </div>
        `;
      } else {
        const now = Date.now();
        container.innerHTML = myReminders.map(rem => {
          const remTime = new Date(rem.remindAt).getTime();
          const diffMs = remTime - now;
          const isOverdue = diffMs <= 0 && rem.status !== 'Completed';

          // Human friendly time badge
          let timeBadge = '';
          if (rem.status === 'Completed') {
            timeBadge = '<span class="badge badge-success"><i class="fas fa-check"></i> Completed</span>';
          } else if (isOverdue) {
            timeBadge = '<span class="badge badge-danger voice-pulse-badge"><i class="fas fa-exclamation-circle"></i> DUE NOW!</span>';
          } else {
            const diffMins = Math.floor(diffMs / (60 * 1000));
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            let relativeStr = '';
            if (diffDays > 0) relativeStr = `In ${diffDays}d ${diffHours % 24}h`;
            else if (diffHours > 0) relativeStr = `In ${diffHours}h ${diffMins % 60}m`;
            else relativeStr = `In ${diffMins} mins`;

            timeBadge = `<span class="badge badge-warning"><i class="fas fa-hourglass-half"></i> ${relativeStr}</span>`;
          }

          // Category icon & badge
          let catIcon = 'fa-bell';
          let catClass = 'badge-primary';
          if (rem.category === 'LeetCode') { catIcon = 'fa-code'; catClass = 'badge-purple'; }
          else if (rem.category === 'Mock Interview') { catIcon = 'fa-microphone'; catClass = 'badge-info'; }
          else if (rem.category === 'Officer Interview') { catIcon = 'fa-user-tie'; catClass = 'badge-success'; }
          else if (rem.category === 'Aptitude') { catIcon = 'fa-tasks'; catClass = 'badge-amber'; }

          // Format Date Time
          const dateObj = new Date(rem.remindAt);
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

          return `
            <div class="card" style="margin-bottom:1rem; border-left:4px solid ${rem.status === 'Completed' ? 'var(--success)' : isOverdue ? 'var(--danger)' : 'var(--primary)'}; background:var(--bg-surface);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                  <span class="badge ${catClass}"><i class="fas ${catIcon}"></i> ${rem.category}</span>
                  <h4 style="margin:0; font-size:1.05rem; font-weight:700; color:var(--text-main);">${rem.title}</h4>
                </div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  ${timeBadge}
                </div>
              </div>

              <div style="font-size:0.83rem; color:var(--text-muted); margin-bottom:0.6rem;">
                <i class="fas fa-calendar-alt"></i> ${dateStr} at ${timeStr} 
                ${rem.repeat && rem.repeat !== 'Once' ? `&nbsp;•&nbsp; <i class="fas fa-redo"></i> Repeats: ${rem.repeat}` : ''}
                ${rem.priority === 'High' ? `&nbsp;•&nbsp; <span style="color:var(--danger); font-weight:600;"><i class="fas fa-flag"></i> High Priority</span>` : ''}
              </div>

              ${rem.notes ? `
                <div style="font-size:0.85rem; color:var(--text-main); background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.6rem 0.8rem; margin-bottom:0.75rem;">
                  "${rem.notes}"
                </div>
              ` : ''}

              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <div>
                  ${rem.url ? `
                    <button class="btn btn-outline btn-xs" onclick="StudentModule.handleGoToReminderTask('${rem.category}', '${encodeURIComponent(rem.url)}')">
                      <i class="fas fa-external-link-alt"></i> Go to Task / Link
                    </button>
                  ` : ''}
                </div>
                <div style="display:flex; gap:0.4rem;">
                  ${rem.status !== 'Completed' ? `
                    <button class="btn btn-secondary btn-xs" onclick="StudentModule.handleSnoozeReminder('${rem.id}', 15)" title="Snooze 15 minutes">
                      <i class="fas fa-clock"></i> Snooze 15m
                    </button>
                    <button class="btn btn-success btn-xs" onclick="StudentModule.handleCompleteReminder('${rem.id}')">
                      <i class="fas fa-check"></i> Mark Done
                    </button>
                  ` : `
                    <button class="btn btn-outline btn-xs" onclick="StudentModule.handleReactivateReminder('${rem.id}')">
                      <i class="fas fa-redo"></i> Re-enable
                    </button>
                  `}
                  <button class="btn btn-danger btn-xs" onclick="StudentModule.handleDeleteReminder('${rem.id}')" title="Delete Reminder">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  },

  handleCreateReminder(e) {
    if (e) e.preventDefault();
    const title = document.getElementById('remTitle').value.trim();
    const category = document.getElementById('remCategory').value;
    const datetime = document.getElementById('remDateTime').value;
    const priority = document.getElementById('remPriority').value;
    const repeat = document.getElementById('remRepeat').value;
    const notes = document.getElementById('remNotes').value.trim();
    let url = document.getElementById('remUrl').value.trim();

    if (!title || !datetime) {
      window.App.showToast('Please provide both reminder title and scheduled date/time.', 'warning');
      return;
    }

    if (!url) {
      if (category === 'LeetCode') url = 'https://leetcode.com/problemset/all/';
      else if (category === 'Mock Interview') url = '#ai-tools';
    }

    const student = window.ptsState.data.currentUser || { id: 'STU-101' };

    window.ptsState.addReminder({
      studentId: student.id,
      title,
      category,
      remindAt: new Date(datetime).toISOString(),
      priority,
      repeat,
      notes,
      url
    });

    window.App.showToast(`⏰ Reminder set for ${title}! Alarm will alert you with sound and notification.`, 'success');

    // Reset Form
    document.getElementById('studentReminderForm').reset();
    this.renderReminders();
  },

  handleQuickPresetReminder(type) {
    const student = window.ptsState.data.currentUser || { id: 'STU-101' };
    const now = new Date();

    if (type === 'leetcode') {
      // Set for today 8:00 PM (or 1 hour from now if past 8:00 PM)
      const target = new Date();
      target.setHours(20, 0, 0, 0);
      if (target <= now) target.setHours(now.getHours() + 1);

      window.ptsState.addReminder({
        studentId: student.id,
        title: 'Daily LeetCode Problem Solving (Arrays & DP)',
        category: 'LeetCode',
        remindAt: target.toISOString(),
        priority: 'High',
        repeat: 'Daily',
        notes: 'Solve today\'s daily challenge on LeetCode to build consistency.',
        url: 'https://leetcode.com/problemset/all/'
      });
      window.App.showToast('⏰ LeetCode Daily Reminder set for 8:00 PM!', 'success');
    } else if (type === 'mock_interview') {
      // Set for tomorrow 10:00 AM
      const target = new Date();
      target.setDate(target.getDate() + 1);
      target.setHours(10, 0, 0, 0);

      window.ptsState.addReminder({
        studentId: student.id,
        title: 'AI Voice Mock Interview Practice (Technical Round)',
        category: 'Mock Interview',
        remindAt: target.toISOString(),
        priority: 'High',
        repeat: 'Once',
        notes: 'Practice answering technical DSA & OOP questions with voice microphone.',
        url: '#ai-tools'
      });
      window.App.showToast('⏰ AI Mock Interview Reminder set for Tomorrow at 10:00 AM!', 'success');
    } else if (type === 'aptitude') {
      // Set for today 6:00 PM
      const target = new Date();
      target.setHours(18, 0, 0, 0);
      if (target <= now) target.setHours(now.getHours() + 2);

      window.ptsState.addReminder({
        studentId: student.id,
        title: 'Quantitative & Logical Aptitude Mock Test',
        category: 'Aptitude',
        remindAt: target.toISOString(),
        priority: 'Normal',
        repeat: 'Once',
        notes: 'Complete 30-minute practice test on Speed Math & Syllogisms.',
        url: '#tests'
      });
      window.App.showToast('⏰ Aptitude Test Reminder set for 6:00 PM!', 'success');
    }

    this.renderReminders();
  },

  handleSnoozeReminder(id, minutes = 15) {
    const rem = (window.ptsState.data.reminders || []).find(r => r.id === id);
    if (!rem) return;

    const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    window.ptsState.updateReminder(id, {
      remindAt: newTime,
      status: 'Active'
    });

    window.App.showToast(`💤 Snoozed "${rem.title}" for ${minutes} minutes.`, 'info');
    this.renderReminders();
  },

  handleCompleteReminder(id) {
    window.ptsState.updateReminder(id, {
      status: 'Completed',
      completedAt: new Date().toISOString()
    });
    window.App.showToast('🎉 Awesome! Reminder marked as completed.', 'success');
    this.renderReminders();
  },

  handleReactivateReminder(id) {
    const newTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    window.ptsState.updateReminder(id, {
      status: 'Active',
      remindAt: newTime
    });
    window.App.showToast('Reminder reactivated for 1 hour from now.', 'info');
    this.renderReminders();
  },

  handleDeleteReminder(id) {
    window.ptsState.deleteReminder(id);
    window.App.showToast('Reminder deleted.', 'info');
    this.renderReminders();
  },

  handleGoToReminderTask(category, encodedUrl) {
    const url = decodeURIComponent(encodedUrl);
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else if (url === '#ai-tools') {
      window.App.navigateTo('ai-tools');
    } else if (url === '#tests') {
      window.App.navigateTo('tests');
    } else {
      window.App.navigateTo('student');
    }
  },

  // ==========================================
  // Background Reminder Alarm & Audio Engine
  // ==========================================
  initReminderAlarmEngine() {
    if (this.alarmIntervalId) clearInterval(this.alarmIntervalId);

    // Check reminders every 15 seconds
    this.alarmIntervalId = setInterval(() => {
      this.checkAndTriggerAlarms();
    }, 15000);

    // Initial check
    setTimeout(() => this.checkAndTriggerAlarms(), 2000);
  },

  checkAndTriggerAlarms() {
    const student = window.ptsState.data.currentUser;
    if (!student || student.role !== 'student') return;

    const reminders = window.ptsState.data.reminders || [];
    const now = Date.now();

    reminders.forEach(rem => {
      if ((!rem.studentId || rem.studentId === student.id) && rem.status === 'Active') {
        const remTime = new Date(rem.remindAt).getTime();
        // If due within current minute or overdue by less than 24 hours
        if (remTime <= now && (now - remTime) < 24 * 60 * 60 * 1000) {
          this.triggerAlarm(rem);
        }
      }
    });
  },

  triggerAlarm(reminder) {
    // Play gentle synthesized chime tone
    this.playAlarmChime();

    // Show native browser desktop notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ Placement Study Reminder: ${reminder.title}`, {
          body: reminder.notes || `Time for your scheduled ${reminder.category} session!`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png'
        });
      } catch (e) {}
    }

    // Mark as Triggered
    window.ptsState.updateReminder(reminder.id, { status: 'Triggered' });

    // Show in-app interactive alarm modal
    this.showReminderAlarmModal(reminder);

    // Add to notification bell
    window.ptsState.addNotification(
      `Alarm Due: ${reminder.title}`,
      `Your scheduled reminder for ${reminder.category} is due right now. Stay consistent with your preparation!`,
      'warning'
    );

    this.renderReminders();
  },

  showReminderAlarmModal(reminder) {
    const modal = document.getElementById('reminderAlarmModal');
    if (!modal) return;

    document.getElementById('alarmModal_title').textContent = reminder.title;
    document.getElementById('alarmModal_category').textContent = reminder.category;
    document.getElementById('alarmModal_notes').textContent = reminder.notes ? `"${reminder.notes}"` : 'Time to tackle your placement goals!';

    const taskBtn = document.getElementById('alarmModal_taskBtn');
    if (taskBtn) {
      if (reminder.url) {
        taskBtn.style.display = 'inline-flex';
        taskBtn.onclick = () => {
          modal.classList.remove('active');
          this.handleGoToReminderTask(reminder.category, encodeURIComponent(reminder.url));
        };
      } else {
        taskBtn.style.display = 'none';
      }
    }

    const snoozeBtn = document.getElementById('alarmModal_snoozeBtn');
    if (snoozeBtn) {
      snoozeBtn.onclick = () => {
        modal.classList.remove('active');
        this.handleSnoozeReminder(reminder.id, 10);
      };
    }

    const doneBtn = document.getElementById('alarmModal_doneBtn');
    if (doneBtn) {
      doneBtn.onclick = () => {
        modal.classList.remove('active');
        this.handleCompleteReminder(reminder.id);
      };
    }

    modal.classList.add('active');
  },

  playAlarmChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // Play double chime (C5 -> E5 -> G5)
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.65);
      });
    } catch (e) {
      console.warn('Audio chime note error:', e);
    }
  },

  requestNotificationPermission() {
    if (!('Notification' in window)) {
      window.App.showToast('Desktop notifications are not supported in this browser.', 'warning');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        window.App.showToast('✨ Desktop notifications enabled! You will receive system alerts when study alarms are due.', 'success');
        try {
          new Notification('Study Alarms Enabled 🚀', {
            body: 'You will now receive alarms for LeetCode practice and mock interviews even when browsing other tabs.',
            icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png'
          });
        } catch (e) {}
      } else {
        window.App.showToast('Notifications permission was not granted.', 'info');
      }
    });
  },

  // ==========================================
  // Student 1-on-1 Officer Mock Interview Bookings
  // ==========================================
  renderStudentInterviewBookings() {
    const student = window.ptsState.data.currentUser || { id: 'STU-101' };
    const allRequests = window.ptsState.data.interviewRequests || [];
    const myRequests = allRequests.filter(r => r.studentId === student.id || r.studentEmail === student.email);

    const container = document.getElementById('studentOfficerInterviewsList');
    if (!container) return;

    if (myRequests.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
          <i class="fas fa-calendar-plus" style="font-size:2.2rem; color:var(--primary-light); margin-bottom:0.75rem; opacity:0.8;"></i>
          <div style="font-weight:600; font-size:1rem; color:var(--text-main);">No Officer Interview Bookings Yet</div>
          <p style="font-size:0.85rem; margin-top:0.25rem;">Need personalized guidance from the Placement Head? Request a 1-on-1 mock interview session below!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = myRequests.map(req => {
      let statusBadge = '';
      if (req.status === 'Scheduled') {
        statusBadge = '<span class="badge badge-success" style="font-size:0.82rem;"><i class="fas fa-calendar-check"></i> Scheduled</span>';
      } else if (req.status === 'Completed') {
        statusBadge = '<span class="badge badge-purple" style="font-size:0.82rem;"><i class="fas fa-award"></i> Completed</span>';
      } else if (req.status === 'Declined') {
        statusBadge = '<span class="badge badge-danger" style="font-size:0.82rem;"><i class="fas fa-times-circle"></i> Declined</span>';
      } else {
        statusBadge = '<span class="badge badge-warning" style="font-size:0.82rem;"><i class="fas fa-clock"></i> Pending Officer Review</span>';
      }

      return `
        <div class="card" style="margin-bottom:1rem; border-left:4px solid ${req.status === 'Scheduled' ? 'var(--success)' : req.status === 'Completed' ? 'var(--purple)' : 'var(--warning)'}; background:var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h4 style="margin:0; font-size:1.05rem; font-weight:700;">${req.domain}</h4>
                ${req.targetCompany ? `<span class="badge badge-primary">Target: ${req.targetCompany}</span>` : ''}
              </div>
              <div style="font-size:0.83rem; color:var(--text-muted); margin-top:0.25rem;">
                Requested on: ${new Date(req.createdAt).toLocaleDateString()} • Preferred: ${req.preferredDate || 'Flexible'} (${req.preferredTimeSlot || 'Anytime'})
              </div>
            </div>
            ${statusBadge}
          </div>

          ${req.status === 'Scheduled' ? `
            <div style="background:rgba(56, 189, 248, 0.08); border:1px solid rgba(56, 189, 248, 0.3); border-radius:var(--radius-sm); padding:0.9rem; margin-top:0.75rem; margin-bottom:0.75rem;">
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem;">
                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Interviewer:</span>
                  <div style="font-size:0.95rem; font-weight:700; color:var(--text-main); margin-top:0.15rem;">
                    <i class="fas fa-user-tie" style="color:var(--primary-light);"></i> ${req.assignedOfficerName || 'Placement Officer'}
                  </div>
                </div>

                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Date & Time:</span>
                  <div style="font-size:0.95rem; font-weight:700; color:var(--success); margin-top:0.15rem;">
                    <i class="fas fa-clock"></i> ${req.scheduledDate} at ${req.scheduledTime}
                  </div>
                </div>

                <div>
                  <span style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Interview Mode:</span>
                  <div style="font-size:0.95rem; font-weight:700; margin-top:0.15rem;">
                    ${req.mode === 'Online'
                      ? '<span style="color:#38bdf8;"><i class="fas fa-video"></i> Online (Google Meet)</span>'
                      : `<span style="color:var(--success);"><i class="fas fa-building"></i> Offline (${req.venue || 'Placement Cell'})</span>`}
                  </div>
                </div>
              </div>

              ${req.mode === 'Online' && req.meetingLink ? `
                <div style="margin-top:0.85rem; padding-top:0.75rem; border-top:1px dashed rgba(56, 189, 248, 0.25); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.6rem;">
                  <div>
                    <span style="font-size:0.8rem; font-weight:700; color:#38bdf8;"><i class="fab fa-google"></i> Private Google Meet Link (Sent to you):</span>
                    <div style="font-size:0.82rem; font-family:monospace; color:var(--text-muted);">${req.meetingLink}</div>
                  </div>
                  <a href="${req.meetingLink}" target="_blank" class="btn btn-primary btn-sm" style="background:#2563eb; font-weight:700;">
                    <i class="fas fa-video"></i> Join Google Meet Now
                  </a>
                </div>
              ` : ''}

              ${req.officerNotes ? `
                <div style="margin-top:0.65rem; font-size:0.85rem; color:var(--text-main);">
                  <strong>Officer Instructions:</strong> <em>"${req.officerNotes}"</em>
                </div>
              ` : ''}
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.5rem; flex-wrap:wrap;">
              <button class="btn btn-outline btn-xs" onclick="StudentModule.handleSetReminderForInterview('${req.id}')">
                <i class="fas fa-bell"></i> Set Alarm Reminder
              </button>
              <button class="btn btn-success btn-xs" onclick="StudentModule.markMockInterviewCompleted('${req.id}')" style="font-weight:700;">
                <i class="fas fa-check-double"></i> Completed Interview? Rate Officer
              </button>
            </div>
          ` : ''}

          ${req.status === 'Completed' ? (() => {
            const allReviews = window.ptsState?.data?.studentOfficerFeedbacks || [];
            const existingReview = allReviews.find(r => r.requestId === req.id || (r.sessionDomain === req.domain && r.officerName === req.assignedOfficerName));
            return `
              <div style="background:linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(245, 158, 11, 0.06)); border:1.5px solid rgba(99, 102, 241, 0.35); border-radius:var(--radius-sm); padding:0.9rem 1rem; margin-top:0.75rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
                  <div>
                    <div style="font-weight:700; color:var(--text-main); font-size:0.95rem; display:flex; align-items:center; gap:0.4rem;">
                      <i class="fas fa-check-circle" style="color:var(--success);"></i> Mock Interview Completed
                      ${!existingReview 
                        ? '<span class="badge badge-warning" style="font-size:0.72rem; margin-left:0.35rem;"><i class="fas fa-clock"></i> Rating Pending</span>' 
                        : '<span class="badge badge-success" style="font-size:0.72rem; margin-left:0.35rem;"><i class="fas fa-check"></i> Reviewed</span>'}
                    </div>
                    <div style="font-size:0.83rem; color:var(--text-muted); margin-top:0.25rem;">
                      ${existingReview 
                        ? `Your review on how the officer took the interview has been recorded (${'⭐'.repeat(existingReview.ratings?.overallExperience || 5)}).` 
                        : `How was the interview taken by ${req.assignedOfficerName || 'the officer'}? Did it identify weaknesses? Share your feedback now.`}
                    </div>
                  </div>
                  <button class="btn ${existingReview ? 'btn-outline' : 'btn-primary'} btn-sm" onclick="StudentModule.openOfficerFeedbackForSession('${req.id}', '${req.assignedOfficerName || 'Placement Officer'}', '${req.domain}')" style="font-weight:700; white-space:nowrap;">
                    <i class="fas fa-star" style="color:#fbbf24;"></i> ${existingReview ? 'View / Edit Rating' : 'Rate How Officer Took Interview'}
                  </button>
                </div>

                ${req.feedback ? `
                  <div style="margin-top:0.75rem; padding-top:0.65rem; border-top:1px dashed rgba(99, 102, 241, 0.25); font-size:0.84rem;">
                    <strong style="color:var(--purple);"><i class="fas fa-comments"></i> Officer Feedback & Evaluation:</strong>
                    <p style="margin:0.2rem 0 0 0; color:var(--text-main);">"${req.feedback}"</p>
                  </div>
                ` : ''}
              </div>
            `;
          })() : ''}
        </div>
      `;
    }).join('');
  },

  openRequestInterviewModal() {
    const modal = document.getElementById('requestInterviewModal');
    if (!modal) return;

    // Default preferred date to next week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 3);
    const dateInput = document.getElementById('reqInterviewDate');
    if (dateInput) dateInput.value = nextWeek.toISOString().split('T')[0];

    modal.classList.add('active');
  },

  handleRequestInterviewSubmit(e) {
    if (e) e.preventDefault();
    const domain = document.getElementById('reqInterviewDomain').value;
    const targetCompany = document.getElementById('reqInterviewCompany').value.trim();
    const preferredDate = document.getElementById('reqInterviewDate').value;
    const preferredTimeSlot = document.getElementById('reqInterviewTimeSlot').value;
    const notes = document.getElementById('reqInterviewNotes').value.trim();

    const student = window.ptsState.data.currentUser || { name: 'Sashti', id: 'STU-101', email: 'sashti.s@college.edu' };

    window.ptsState.addInterviewRequest({
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentDept: student.department || 'CSE',
      studentRoll: student.rollNo || '22CS089',
      studentCgpa: student.cgpa || 8.45,
      domain,
      targetCompany,
      preferredDate,
      preferredTimeSlot,
      notes
    });

    window.App.showToast('✨ 1-on-1 Mock Interview request sent to Placement Officers! You will receive a notification and GMeet link once an officer picks your request.', 'success');

    // Close modal & reset form
    document.getElementById('requestInterviewModal').classList.remove('active');
    document.getElementById('requestInterviewForm').reset();

    this.renderStudentInterviewBookings();
  },

  handleSetReminderForInterview(requestId) {
    const req = (window.ptsState.data.interviewRequests || []).find(r => r.id === requestId);
    if (!req || !req.scheduledDate) return;

    const student = window.ptsState.data.currentUser || { id: 'STU-101' };

    // Set reminder for 15 minutes before the interview
    const scheduledDateTime = new Date(`${req.scheduledDate}T${req.scheduledTime || '10:00'}:00`);
    const reminderTime = new Date(scheduledDateTime.getTime() - 15 * 60 * 1000);

    window.ptsState.addReminder({
      studentId: student.id,
      title: `Upcoming Mock Interview: ${req.domain} with ${req.assignedOfficerName || 'Officer'}`,
      category: 'Officer Interview',
      remindAt: reminderTime.toISOString(),
      priority: 'High',
      repeat: 'Once',
      notes: req.mode === 'Online'
        ? `Online interview starting in 15 mins. Join link: ${req.meetingLink}`
        : `Offline interview starting in 15 mins at: ${req.venue}`,
      url: req.mode === 'Online' ? req.meetingLink : '#student'
    });

    window.App.showToast(`⏰ Alarm reminder scheduled for 15 mins before your interview with ${req.assignedOfficerName || 'the officer'}!`, 'success');
    this.renderReminders();
  },

  // ==========================================
  // Completed Mock Interviews Unified Directory
  // ==========================================
  getCompletedMockInterviews() {
    const student = window.ptsState?.data?.currentUser || { id: 'STU-101' };
    const requests = window.ptsState?.data?.interviewRequests || [];
    const feedbacks = window.ptsState?.data?.interviewFeedbacks || [];
    const studentReviews = window.ptsState?.data?.studentOfficerFeedbacks || [];

    const completedList = [];
    const seenKeys = new Set();

    // 1. Completed interview requests for this student
    requests.forEach(req => {
      if ((req.studentId === student.id || req.studentEmail === student.email) && req.status === 'Completed') {
        const key = req.id;
        seenKeys.add(key);
        const matchingEval = feedbacks.find(f => f.requestId === req.id);
        const matchingReview = studentReviews.find(r => r.requestId === req.id || (matchingEval && r.feedbackId === matchingEval.id));
        completedList.push({
          id: req.id,
          requestId: req.id,
          feedbackId: matchingEval?.id || null,
          domain: req.domain,
          officerName: req.assignedOfficerName || matchingEval?.officerName || 'Placement Officer',
          officerId: req.assignedOfficerId || matchingEval?.officerId || 'OFF-201',
          sessionDate: req.scheduledDate || matchingEval?.sessionDate || new Date(req.createdAt).toISOString().split('T')[0],
          evaluation: matchingEval || null,
          hasStudentFeedback: !!matchingReview,
          studentFeedback: matchingReview || null
        });
      }
    });

    // 2. Any officer evaluations delivered to this student (if request was not already in completed list)
    feedbacks.forEach(fb => {
      if (fb.studentId === student.id || fb.studentEmail === student.email) {
        if (fb.requestId && seenKeys.has(fb.requestId)) return;
        const key = fb.id;
        if (seenKeys.has(key)) return;
        seenKeys.add(key);
        const matchingReview = studentReviews.find(r => r.feedbackId === fb.id || (r.sessionDomain === fb.domain && r.officerName === fb.officerName));
        completedList.push({
          id: fb.id,
          requestId: fb.requestId || null,
          feedbackId: fb.id,
          domain: fb.domain,
          officerName: fb.officerName || 'Placement Officer',
          officerId: fb.officerId || 'OFF-201',
          sessionDate: fb.sessionDate || 'Recent',
          evaluation: fb,
          hasStudentFeedback: !!matchingReview,
          studentFeedback: matchingReview || null
        });
      }
    });

    return completedList;
  },

  markMockInterviewCompleted(requestId) {
    const req = (window.ptsState.data.interviewRequests || []).find(r => r.id === requestId);
    if (!req) return;

    if (!confirm(`Mark mock interview for "${req.domain}" with ${req.assignedOfficerName || 'the officer'} as completed and proceed to rating?`)) {
      return;
    }

    req.status = 'Completed';
    if (!req.feedback) {
      req.feedback = 'Mock interview session conducted. Student evaluation pending/submitted.';
    }

    window.ptsState.addNotification(
      'Mock Interview Completed',
      `You marked your mock interview for ${req.domain} as completed. Please share your rating on how the officer conducted the interview.`,
      'success'
    );
    window.ptsState.saveState();

    this.renderStudentInterviewBookings();
    this.renderInterviewFeedbackHub();
    if (window.OfficerModule) {
      window.OfficerModule.renderMockInterviewRequests();
    }

    window.App.showToast(`🎉 Mock interview marked as completed! Opening officer rating form...`, 'success');
    this.openOfficerFeedbackForSession(req.id, req.assignedOfficerName, req.domain);
  },

  // ==========================================
  // Student Interview Feedback Hub (Officer Evaluations & Student's Feedback on Officer)
  // ==========================================
  renderInterviewFeedbackHub() {
    const student = window.ptsState.data.currentUser || { id: 'STU-101' };
    const allFeedbacks = window.ptsState.data.interviewFeedbacks || [];
    const myFeedbacks = allFeedbacks.filter(f => f.studentId === student.id || f.studentEmail === student.email);

    const allSubmitted = window.ptsState.data.studentOfficerFeedbacks || [];
    const mySubmitted = allSubmitted.filter(s => s.studentId === student.id);
    const completedSessions = this.getCompletedMockInterviews();

    // Update Top Overview Stats
    const recCountEl = document.getElementById('stuFbStat_receivedCount');
    const avgScoreEl = document.getElementById('stuFbStat_avgScore');
    const verdictEl = document.getElementById('stuFbStat_verdict');
    const subCountEl = document.getElementById('stuFbStat_submittedCount');

    if (recCountEl) recCountEl.textContent = myFeedbacks.length;
    if (subCountEl) subCountEl.textContent = mySubmitted.length;

    if (myFeedbacks.length > 0) {
      const avgScore = Math.round(myFeedbacks.reduce((acc, f) => acc + (f.ratings?.overallScore || 80), 0) / myFeedbacks.length);
      if (avgScoreEl) avgScoreEl.textContent = `${avgScore}%`;
      if (verdictEl) verdictEl.textContent = myFeedbacks[0].verdict ? myFeedbacks[0].verdict.split('(')[0].replace(/[🌟⭐🔹⚠️]/g, '').trim() : 'Tier-1 Ready';
    } else {
      if (avgScoreEl) avgScoreEl.textContent = 'N/A';
      if (verdictEl) verdictEl.textContent = 'Pending Mock';
    }

    // Render Officer Evaluations Received
    const evalContainer = document.getElementById('studentOfficerEvaluationsList');
    if (evalContainer) {
      if (myFeedbacks.length === 0) {
        evalContainer.innerHTML = `
          <div style="text-align:center; padding:2.5rem 1.5rem; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
            <i class="fas fa-clipboard-list" style="font-size:2.5rem; color:var(--primary-light); margin-bottom:0.75rem; opacity:0.8;"></i>
            <div style="font-weight:700; font-size:1.05rem; color:var(--text-main);">No Officer Interview Evaluations Yet</div>
            <p style="font-size:0.85rem; margin-top:0.35rem; max-width:450px; margin-left:auto; margin-right:auto;">
              When you complete a 1-on-1 mock interview with the Placement Officer, their comprehensive evaluation breakdown, readiness score, and coaching guidance will appear here!
            </p>
            <button class="btn btn-primary btn-sm" onclick="StudentModule.switchTab('officer_interviews')">
              <i class="fas fa-calendar-plus"></i> Request Mock Interview Session
            </button>
          </div>
        `;
      } else {
        evalContainer.innerHTML = myFeedbacks.map(fb => {
          const r = fb.ratings || { technical: 8, problemSolving: 8, communication: 7.5, professionalism: 8.5, overallScore: 80 };
          return `
            <div class="card" style="margin-bottom:1.25rem; border-left:4px solid var(--success); background:var(--bg-surface);">
              <!-- Card Header -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                <div>
                  <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                    <h4 style="margin:0; font-size:1.1rem; font-weight:700; color:var(--text-main);">${fb.domain}</h4>
                    <span class="badge badge-success"><i class="fas fa-check-double"></i> Evaluation Delivered</span>
                  </div>
                  <div style="font-size:0.83rem; color:var(--text-muted); margin-top:0.25rem;">
                    Evaluator: <strong style="color:var(--primary-light);">${fb.officerName}</strong> (${fb.officerTitle || 'Placement Officer'}) &nbsp;•&nbsp; 
                    <i class="fas fa-calendar-alt"></i> ${fb.sessionDate}
                  </div>
                </div>
                <div style="text-align:right;">
                  <span class="badge badge-primary" style="font-size:0.9rem; padding:0.35rem 0.75rem; font-weight:700;">
                    Overall: ${r.overallScore}%
                  </span>
                </div>
              </div>

              <!-- Placement Verdict Banner -->
              <div style="background:rgba(99,102,241,0.08); border:1px solid rgba(99,102,241,0.25); border-radius:var(--radius-sm); padding:0.6rem 0.85rem; margin-bottom:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
                <div style="font-size:0.85rem;">
                  <strong style="color:var(--primary-light);"><i class="fas fa-award"></i> Placement Recommendation:</strong>
                  <span style="font-weight:700; color:var(--text-main); margin-left:0.35rem;">${fb.verdict}</span>
                </div>
                ${fb.targetCompany ? `<span class="badge badge-info" style="font-size:0.75rem;">Target: ${fb.targetCompany}</span>` : ''}
              </div>

              <!-- 4 Competency Score Gauges -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.65rem; margin-bottom:0.85rem;">
                <div style="background:var(--bg-card-hover); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.55rem 0.75rem;">
                  <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Technical Depth</div>
                  <div style="font-weight:700; color:var(--primary-light); font-size:1rem; margin-top:2px;">${r.technical} <span style="font-size:0.75rem; color:var(--text-dim);">/ 10</span></div>
                </div>

                <div style="background:var(--bg-card-hover); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.55rem 0.75rem;">
                  <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Problem Solving</div>
                  <div style="font-weight:700; color:var(--success); font-size:1rem; margin-top:2px;">${r.problemSolving} <span style="font-size:0.75rem; color:var(--text-dim);">/ 10</span></div>
                </div>

                <div style="background:var(--bg-card-hover); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.55rem 0.75rem;">
                  <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Communication</div>
                  <div style="font-weight:700; color:#38bdf8; font-size:1rem; margin-top:2px;">${r.communication} <span style="font-size:0.75rem; color:var(--text-dim);">/ 10</span></div>
                </div>

                <div style="background:var(--bg-card-hover); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.55rem 0.75rem;">
                  <div style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">Professionalism</div>
                  <div style="font-weight:700; color:var(--warning); font-size:1rem; margin-top:2px;">${r.professionalism} <span style="font-size:0.75rem; color:var(--text-dim);">/ 10</span></div>
                </div>
              </div>

              <!-- Strengths & Improvements -->
              <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:0.85rem;">
                <div style="background:rgba(16,185,129,0.06); border-left:3px solid var(--success); border-radius:var(--radius-sm); padding:0.55rem 0.85rem; font-size:0.85rem;">
                  <strong style="color:var(--success);"><i class="fas fa-thumbs-up"></i> Candidate Strengths:</strong>
                  <div style="margin-top:0.2rem; color:var(--text-main);">${fb.strengths}</div>
                </div>

                <div style="background:rgba(245,158,11,0.06); border-left:3px solid var(--warning); border-radius:var(--radius-sm); padding:0.55rem 0.85rem; font-size:0.85rem;">
                  <strong style="color:var(--warning);"><i class="fas fa-exclamation-circle"></i> Areas Needing Polish:</strong>
                  <div style="margin-top:0.2rem; color:var(--text-main);">${fb.improvements}</div>
                </div>

                <div style="background:rgba(168,85,247,0.06); border-left:3px solid var(--purple); border-radius:var(--radius-sm); padding:0.55rem 0.85rem; font-size:0.85rem;">
                  <strong style="color:var(--purple);"><i class="fas fa-lightbulb"></i> Officer's Actionable Advice:</strong>
                  <div style="margin-top:0.2rem; color:var(--text-main);">${fb.actionableAdvice}</div>
                </div>
              </div>

              <!-- Action to Rate Officer -->
              <div style="display:flex; justify-content:flex-end;">
                <button class="btn btn-outline btn-xs" onclick="StudentModule.openOfficerFeedbackForSession('${fb.id}', '${fb.officerName}', '${fb.domain}')" style="font-size:0.78rem;">
                  <i class="fas fa-star" style="color:#fbbf24;"></i> Rate How Officer Took This Interview
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Toggle Locked vs Unlocked state for Give Feedback Card
    const lockedNotice = document.getElementById('studentOfficerFeedbackLockedNotice');
    const feedbackForm = document.getElementById('studentSubmitOfficerFeedbackForm');

    if (completedSessions.length === 0) {
      if (lockedNotice) lockedNotice.style.display = 'block';
      if (feedbackForm) feedbackForm.style.display = 'none';
    } else {
      if (lockedNotice) lockedNotice.style.display = 'none';
      if (feedbackForm) feedbackForm.style.display = 'block';

      // Populate Session Selector in Right Form with ONLY real completed mock interviews
      const sessionSelect = document.getElementById('stuFbSessionSelect');
      if (sessionSelect) {
        sessionSelect.innerHTML = completedSessions.map(s => `
          <option value="${s.id}">
            ${s.domain} with ${s.officerName} (${s.sessionDate}) ${s.hasStudentFeedback ? '✅ (Reviewed)' : '⭐ (Rating Pending)'}
          </option>
        `).join('');

        this.onSessionSelectChange(sessionSelect.value);
      }
    }

    // Render Student's Submitted Feedback History
    const submittedContainer = document.getElementById('studentSubmittedFeedbackList');
    if (submittedContainer) {
      if (mySubmitted.length === 0) {
        submittedContainer.innerHTML = `
          <div style="text-align:center; padding:1.25rem; font-size:0.83rem; color:var(--text-muted); background:var(--bg-card-hover); border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            You haven't submitted any feedback on officer interview conduct yet. Fill out the form above!
          </div>
        `;
      } else {
        submittedContainer.innerHTML = mySubmitted.map(sub => `
          <div style="background:var(--bg-card-hover); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.75rem 0.85rem; margin-bottom:0.6rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.35rem;">
              <strong style="font-size:0.85rem; color:var(--text-main);">${sub.officerName}</strong>
              <span style="color:#fbbf24; font-size:0.8rem;">
                ${'⭐'.repeat(sub.ratings?.overallExperience || 5)}
              </span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.35rem;">
              Domain: <strong>${sub.sessionDomain}</strong> • Reviewed: ${new Date(sub.createdAt).toLocaleDateString()}
            </div>
            <div style="font-size:0.82rem; color:var(--text-main); line-height:1.4; font-style:italic;">
              "${sub.comments}"
            </div>
          </div>
        `).join('');
      }
    }
  },

  onSessionSelectChange(sessionId) {
    const completed = this.getCompletedMockInterviews();
    const matched = completed.find(s => s.id === sessionId);
    const noticeEl = document.getElementById('stuFbExistingReviewNotice');
    const commentsEl = document.getElementById('stuFbComments');
    const qualityEl = document.getElementById('stuFbRateQuality');
    const guidanceEl = document.getElementById('stuFbRateGuidance');
    const expEl = document.getElementById('stuFbRateExperience');
    const weakEl = document.getElementById('stuFbWeaknesses');
    const recEl = document.getElementById('stuFbRecommend');

    if (matched && matched.hasStudentFeedback && matched.studentFeedback) {
      const rev = matched.studentFeedback;
      if (noticeEl) {
        noticeEl.style.display = 'block';
        noticeEl.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success);"></i> You reviewed this session on ${new Date(rev.createdAt).toLocaleDateString()}. Modifying fields will update your review.`;
      }
      if (qualityEl) qualityEl.value = rev.ratings?.clarity || rev.ratings?.industryRelevance || 5;
      if (guidanceEl) guidanceEl.value = rev.ratings?.helpfulness || 5;
      if (expEl) expEl.value = rev.ratings?.overallExperience || 5;
      if (weakEl) weakEl.value = rev.identifiedWeaknesses || 'Yes';
      if (recEl) recEl.value = rev.wouldRecommend || 'Highly Recommend';
      if (commentsEl) commentsEl.value = rev.comments || '';
    } else {
      if (noticeEl) noticeEl.style.display = 'none';
      if (qualityEl) qualityEl.value = 5;
      if (guidanceEl) guidanceEl.value = 5;
      if (expEl) expEl.value = 5;
      if (weakEl) weakEl.value = 'Yes';
      if (recEl) recEl.value = 'Highly Recommend';
      if (commentsEl) commentsEl.value = '';
    }
  },

  openOfficerFeedbackForSession(sessionId = null, officerName = null, domain = null) {
    const completed = this.getCompletedMockInterviews();
    if (completed.length === 0) {
      window.App.showToast('Please complete a 1-on-1 mock interview session first to unlock officer feedback.', 'info');
      this.switchTab('officer_interviews');
      return;
    }

    const modal = document.getElementById('studentOfficerFeedbackModal');
    if (!modal) {
      // Fallback: switch to tab and scroll to form
      this.switchTab('interview_feedback');
      if (sessionId) {
        this.selectSessionForFeedback(sessionId, officerName, domain);
      } else {
        this.scrollToOfficerFeedbackForm();
      }
      return;
    }

    const modalSelect = document.getElementById('modalStuFbSessionSelect');
    if (modalSelect) {
      modalSelect.innerHTML = completed.map(s => `
        <option value="${s.id}">
          ${s.domain} with ${s.officerName} (${s.sessionDate}) ${s.hasStudentFeedback ? '✅ (Reviewed)' : '⭐ (Rating Pending)'}
        </option>
      `).join('');

      if (sessionId) {
        for (let i = 0; i < modalSelect.options.length; i++) {
          if (modalSelect.options[i].value === sessionId) {
            modalSelect.selectedIndex = i;
            break;
          }
        }
      } else {
        // Pick first unreviewed session if available
        const unreviewedIndex = completed.findIndex(s => !s.hasStudentFeedback);
        if (unreviewedIndex >= 0) {
          modalSelect.selectedIndex = unreviewedIndex;
        }
      }

      this.onModalSessionSelectChange(modalSelect.value);
    }

    modal.classList.add('active');
  },

  closeOfficerFeedbackModal() {
    document.getElementById('studentOfficerFeedbackModal')?.classList.remove('active');
  },

  onModalSessionSelectChange(sessionId) {
    const completed = this.getCompletedMockInterviews();
    const matched = completed.find(s => s.id === sessionId);
    const noticeEl = document.getElementById('modalStuFbExistingNotice');
    const commentsEl = document.getElementById('modalStuFbComments');
    const qualityEl = document.getElementById('modalStuFbRateQuality');
    const guidanceEl = document.getElementById('modalStuFbRateGuidance');
    const expEl = document.getElementById('modalStuFbRateExperience');
    const weakEl = document.getElementById('modalStuFbWeaknesses');
    const recEl = document.getElementById('modalStuFbRecommend');

    if (matched && matched.hasStudentFeedback && matched.studentFeedback) {
      const rev = matched.studentFeedback;
      if (noticeEl) {
        noticeEl.style.display = 'block';
        noticeEl.innerHTML = `<i class="fas fa-check-circle" style="color:var(--success);"></i> You reviewed this session on ${new Date(rev.createdAt).toLocaleDateString()}. Modifying fields below will update your rating.`;
      }
      if (qualityEl) qualityEl.value = rev.ratings?.clarity || rev.ratings?.industryRelevance || 5;
      if (guidanceEl) guidanceEl.value = rev.ratings?.helpfulness || 5;
      if (expEl) expEl.value = rev.ratings?.overallExperience || 5;
      if (weakEl) weakEl.value = rev.identifiedWeaknesses || 'Yes';
      if (recEl) recEl.value = rev.wouldRecommend || 'Highly Recommend';
      if (commentsEl) commentsEl.value = rev.comments || '';
    } else {
      if (noticeEl) noticeEl.style.display = 'none';
      if (qualityEl) qualityEl.value = 5;
      if (guidanceEl) guidanceEl.value = 5;
      if (expEl) expEl.value = 5;
      if (weakEl) weakEl.value = 'Yes';
      if (recEl) recEl.value = 'Highly Recommend';
      if (commentsEl) commentsEl.value = '';
    }
  },

  handleModalOfficerFeedbackSubmit(e) {
    if (e) e.preventDefault();
    const student = window.ptsState.data.currentUser || { id: 'STU-101', name: 'Sashti' };
    const sessionId = document.getElementById('modalStuFbSessionSelect')?.value;
    const clarity = parseInt(document.getElementById('modalStuFbRateQuality')?.value) || 5;
    const helpfulness = parseInt(document.getElementById('modalStuFbRateGuidance')?.value) || 5;
    const overallExperience = parseInt(document.getElementById('modalStuFbRateExperience')?.value) || 5;
    const weaknesses = document.getElementById('modalStuFbWeaknesses')?.value || 'Yes';
    const recommend = document.getElementById('modalStuFbRecommend')?.value || 'Highly Recommend';
    const comments = document.getElementById('modalStuFbComments')?.value.trim();

    if (!comments) {
      window.App.showToast('Please enter your comments on how the officer took the interview.', 'warning');
      return;
    }

    const completed = this.getCompletedMockInterviews();
    const matched = completed.find(s => s.id === sessionId);

    window.ptsState.addStudentOfficerFeedback({
      feedbackId: matched?.feedbackId || sessionId,
      requestId: matched?.requestId || sessionId,
      studentId: student.id,
      studentName: student.name,
      officerId: matched?.officerId || 'OFF-201',
      officerName: matched?.officerName || 'Dr. R. Ramanathan',
      sessionDomain: matched?.domain || 'Mock Technical Interview',
      clarity,
      helpfulness,
      industryRelevance: clarity,
      overallExperience,
      identifiedWeaknesses: weaknesses,
      wouldRecommend: recommend,
      comments
    });

    this.closeOfficerFeedbackModal();
    window.App.showToast('✨ Thank you! Your feedback on how the officer took the interview has been recorded.', 'success');
    this.renderInterviewFeedbackHub();
    this.renderStudentInterviewBookings();

    if (window.OfficerModule) {
      window.OfficerModule.renderMockInterviewRequests();
    }
  },

  selectSessionForFeedback(feedbackId, officerName, domain) {
    this.openOfficerFeedbackForSession(feedbackId, officerName, domain);
  },

  scrollToOfficerFeedbackForm() {
    const card = document.getElementById('studentGiveOfficerFeedbackCard');
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.borderColor = 'var(--primary)';
      card.style.boxShadow = '0 0 15px rgba(99,102,241,0.3)';
      setTimeout(() => {
        card.style.borderColor = 'var(--border-subtle)';
        card.style.boxShadow = 'none';
      }, 2000);
    }
  },

  handleStudentOfficerFeedbackSubmit(e) {
    e.preventDefault();
    const student = window.ptsState.data.currentUser || { id: 'STU-101', name: 'Sashti' };
    const sessionId = document.getElementById('stuFbSessionSelect')?.value;
    const clarity = parseInt(document.getElementById('stuFbRateQuality')?.value) || 5;
    const helpfulness = parseInt(document.getElementById('stuFbRateGuidance')?.value) || 5;
    const overallExperience = parseInt(document.getElementById('stuFbRateExperience')?.value) || 5;
    const weaknesses = document.getElementById('stuFbWeaknesses')?.value || 'Yes';
    const recommend = document.getElementById('stuFbRecommend')?.value || 'Highly Recommend';
    const comments = document.getElementById('stuFbComments')?.value.trim();

    if (!comments) {
      window.App.showToast('Please enter your comments on how the officer took the interview.', 'warning');
      return;
    }

    const completed = this.getCompletedMockInterviews();
    const matched = completed.find(s => s.id === sessionId);

    window.ptsState.addStudentOfficerFeedback({
      feedbackId: matched?.feedbackId || sessionId,
      requestId: matched?.requestId || sessionId,
      studentId: student.id,
      studentName: student.name,
      officerId: matched?.officerId || 'OFF-201',
      officerName: matched?.officerName || 'Dr. R. Ramanathan',
      sessionDomain: matched?.domain || 'Mock Technical Interview',
      clarity,
      helpfulness,
      industryRelevance: clarity,
      overallExperience,
      identifiedWeaknesses: weaknesses,
      wouldRecommend: recommend,
      comments
    });

    window.App.showToast('✨ Thank you! Your feedback on how the officer took the interview has been recorded.', 'success');
    document.getElementById('stuFbComments').value = '';
    this.renderInterviewFeedbackHub();
    this.renderStudentInterviewBookings();

    if (window.OfficerModule) {
      window.OfficerModule.renderMockInterviewRequests();
    }
  }
};
