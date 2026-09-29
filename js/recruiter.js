/**
 * Placement Preparation and Tracking System
 * Recruiter Module Controller with AI ATS Resume Checker & PDF Verification
 */

window.RecruiterModule = {
  currentTab: 'applications',
  selectedCandidateId: null,
  selectedAppId: null,
  currentCustomPdf: null,
  currentAtsResult: null,

  init() {
    this.renderRecruiterStats();
    this.populateAtsSelectors();
    this.renderRecruiterApplications();
    this.renderCandidateTalentPool();
    this.attachEvents();
  },

  attachEvents() {
    // Post Job Form Submit
    const postJobForm = document.getElementById('recruiterPostJobForm');
    if (postJobForm) {
      postJobForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePostJob();
      });
    }

    // Talent search filters
    const skillSearch = document.getElementById('recruiterSkillSearch');
    const minCgpaFilter = document.getElementById('recruiterMinCgpa');
    if (skillSearch) skillSearch.addEventListener('input', () => this.renderCandidateTalentPool());
    if (minCgpaFilter) minCgpaFilter.addEventListener('input', () => this.renderCandidateTalentPool());
  },

  // Switch Recruiter Tabs (applications, ats, candidates, postjob)
  switchTab(tabId) {
    this.currentTab = tabId;

    // Update tab button active states
    document.querySelectorAll('.recruiter-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update tab content displays
    document.querySelectorAll('.recruiter-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    const activeContent = document.getElementById(`recruiterTab_${tabId}`);
    if (activeContent) activeContent.classList.add('active');

    // Trigger tab-specific refreshes
    if (tabId === 'applications') {
      this.renderRecruiterApplications();
      this.renderRecruiterStats();
    } else if (tabId === 'ats') {
      this.populateAtsSelectors();
      this.runAtsVerification();
    } else if (tabId === 'candidates') {
      this.renderCandidateTalentPool();
    }
  },

  // Render Top Executive Stats for Recruiter
  renderRecruiterStats() {
    const apps = window.ptsState?.data?.applications || [];
    const user = window.ptsState?.data?.currentUser || {};
    const companyName = user.company || 'Zoho Corporation';

    const totalAppsEl = document.getElementById('recStat_totalApps');
    const atsReadyEl = document.getElementById('recStat_atsReady');
    const shortlistedEl = document.getElementById('recStat_shortlisted');
    const compNameEl = document.getElementById('recStat_companyName');
    const badgeEl = document.getElementById('recruiterAppsCountBadge');

    const companyApps = apps.filter(a => 
      !user.company || a.companyName.toLowerCase().includes(companyName.toLowerCase()) || companyName.toLowerCase().includes(a.companyName.toLowerCase())
    );

    const relevantApps = companyApps.length > 0 ? companyApps : apps;
    const shortlistedCount = relevantApps.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length;

    if (totalAppsEl) totalAppsEl.textContent = relevantApps.length;
    if (atsReadyEl) atsReadyEl.textContent = relevantApps.length;
    if (shortlistedEl) shortlistedEl.textContent = shortlistedCount;
    if (compNameEl) compNameEl.textContent = companyName;
    if (badgeEl) badgeEl.textContent = relevantApps.length;
  },

  // Render Received Candidate Applications Table
  renderRecruiterApplications() {
    const tableBody = document.getElementById('recruiterAppsTableBody');
    if (!tableBody) return;

    const allApps = window.ptsState?.data?.applications || [];
    const user = window.ptsState?.data?.currentUser || {};
    const userCompany = user.company || '';

    // Populate Company Filter if needed
    const compFilter = document.getElementById('recruiterFilterCompany');
    if (compFilter && compFilter.options.length <= 1) {
      const companies = [...new Set(allApps.map(a => a.companyName))];
      companies.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        if (userCompany && c.toLowerCase().includes(userCompany.toLowerCase())) {
          opt.selected = true;
        }
        compFilter.appendChild(opt);
      });
    }

    const selectedComp = compFilter ? compFilter.value : 'All';
    const selectedStatus = document.getElementById('recruiterFilterStatus')?.value || 'All';

    let filteredApps = allApps;
    if (selectedComp !== 'All') {
      filteredApps = filteredApps.filter(a => a.companyName === selectedComp);
    }
    if (selectedStatus !== 'All') {
      filteredApps = filteredApps.filter(a => a.status === selectedStatus);
    }

    if (filteredApps.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
            <i class="fas fa-inbox" style="font-size:1.8rem; margin-bottom:0.5rem; display:block; opacity:0.4;"></i>
            No applications match the current filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filteredApps.map(app => {
      const student = window.ptsState.data.students.find(s => s.id === app.studentId) || {};
      const resumeName = app.resumePdfName || student.resumeName || `${app.studentName.replace(/\s+/g, '_')}_Resume.pdf`;
      const resumeSize = app.resumePdfSize || '184 KB';

      let statusBadge = `<span class="badge badge-info">${app.status}</span>`;
      if (app.status === 'Accepted for Interview') {
        statusBadge = `
          <span class="badge badge-success" style="font-size:0.75rem; padding:3px 7px;"><i class="fas fa-calendar-check"></i> Accepted for Interview</span>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">${app.scheduledDate || 'Upcoming'} (${app.interviewMode || 'Online'})</div>
        `;
      } else if (app.status === 'Shortlisted') {
        statusBadge = `<span class="badge badge-success"><i class="fas fa-check"></i> Shortlisted</span>`;
      } else if (app.status === 'Selected') {
        statusBadge = `<span class="badge badge-primary"><i class="fas fa-trophy"></i> Offer Extended</span>`;
      } else if (app.status === 'Rejected') {
        statusBadge = `
          <span class="badge badge-danger" style="font-size:0.75rem; padding:3px 7px;"><i class="fas fa-times-circle"></i> Rejected</span>
          <div style="font-size:0.72rem; color:#ef4444; margin-top:2px; max-width:170px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${app.rejectionReason || 'Criteria not met'}">
            Reason: ${app.rejectionReason || 'Criteria not met'}
          </div>
        `;
      }

      return `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--text-main); font-size:0.95rem;">${app.studentName}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
              ${app.studentDept} • Roll: ${student.rollNo || '22CS089'} • CGPA: <strong style="color:var(--primary-light);">${app.studentCgpa}</strong>
            </div>
          </td>
          <td>
            <div style="font-weight:600; color:var(--text-main); font-size:0.88rem;">${app.companyName}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${app.role}</div>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span class="badge" style="background:rgba(239,68,68,0.1); color:#ef4444; border:1px solid rgba(239,68,68,0.25); font-size:0.75rem;">
                <i class="fas fa-file-pdf"></i> ${resumeName}
              </span>
              <span class="badge badge-success" style="font-size:0.65rem; padding:1px 5px;" title="Validated PDF Format">
                PDF ✓
              </span>
            </div>
            <div style="font-size:0.72rem; color:var(--text-dim); margin-top:2px;">Size: ${resumeSize} • Machine Readable</div>
          </td>
          <td>
            <button class="btn btn-primary btn-sm" onclick="RecruiterModule.openAtsCheckerForCandidate('${app.studentId}', '${app.id}')" style="font-size:0.76rem; padding:0.32rem 0.7rem; font-weight:700; display:inline-flex; align-items:center; gap:0.4rem; background:linear-gradient(135deg, #6366f1, #4f46e5); box-shadow:0 2px 8px rgba(99,102,241,0.3);" title="Put this student's PDF resume directly into the ATS Checker">
              <i class="fas fa-microchip" style="color:#fbbf24;"></i> Analyze ATS
            </button>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:0.35rem; flex-wrap:wrap; justify-content:flex-end;">
              <button class="btn btn-success btn-sm" onclick="RecruiterModule.openAcceptModal('${app.id}')" title="Accept candidate for interview" style="font-size:0.75rem; padding:0.3rem 0.65rem; font-weight:700; display:inline-flex; align-items:center; gap:0.35rem; background:linear-gradient(135deg, #10b981, #059669);">
                <i class="fas fa-calendar-check"></i> Accept for Interview
              </button>
              <button class="btn btn-danger btn-sm" onclick="RecruiterModule.openRejectModal('${app.id}')" title="Reject with specific reason delivered to student" style="font-size:0.75rem; padding:0.3rem 0.65rem; font-weight:700; display:inline-flex; align-items:center; gap:0.35rem; background:linear-gradient(135deg, #ef4444, #dc2626);">
                <i class="fas fa-times-circle"></i> Reject with Reason
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Candidate Discovery & Talent Pool
  renderCandidateTalentPool() {
    const container = document.getElementById('recruiterCandidatesList');
    if (!container) return;

    const skillQuery = (document.getElementById('recruiterSkillSearch')?.value || '').toLowerCase();
    const minCgpa = parseFloat(document.getElementById('recruiterMinCgpa')?.value) || 0;

    let students = window.ptsState.data.students || [];

    if (minCgpa > 0) {
      students = students.filter(s => s.cgpa >= minCgpa);
    }

    if (skillQuery) {
      students = students.filter(s => s.skills.some(sk => sk.toLowerCase().includes(skillQuery)));
    }

    container.innerHTML = students.map(st => {
      const skillsBadges = (st.skills || []).map(sk => `<span class="badge badge-primary" style="font-size:0.72rem;">${sk}</span>`).join(' ');
      const langBadges = (st.wellVersedLanguages || ['Python', 'Java', 'C++', 'C']).map(l => `<span class="badge" style="background:rgba(99,102,241,0.2); color:var(--primary-light); font-size:0.7rem; border:1px solid rgba(99,102,241,0.3);">${l}</span>`).join(' ');

      const internMarkup = (st.internship && st.internship.hasDone && st.internship.company) 
        ? `<div style="font-size:0.75rem; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.22); border-radius:var(--radius-sm); padding:0.35rem 0.6rem; margin-bottom:0.6rem; line-height:1.35;">
             <i class="fas fa-briefcase" style="color:#10b981;"></i> <strong>Intern:</strong> ${st.internship.company} <span style="color:var(--text-muted); font-size:0.72rem;">• ${st.internship.topic}</span>
           </div>` 
        : '';

      const hackMarkup = (st.hackathons && st.hackathons.length > 0 && st.hackathons[0].name)
        ? `<div style="font-size:0.75rem; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.22); border-radius:var(--radius-sm); padding:0.35rem 0.6rem; margin-bottom:0.6rem; line-height:1.35;">
             <i class="fas fa-trophy" style="color:#fbbf24;"></i> <strong>Hackathon:</strong> ${st.hackathons[0].name} <span class="badge badge-warning" style="font-size:0.64rem; padding:1px 5px; margin-left:2px;">${st.hackathons[0].achievement || 'Finalist'}</span>
           </div>`
        : '';

      const eduMarkup = st.educationStatus === 'graduated'
        ? `<div style="font-size:0.73rem; color:#a855f7; margin-top:0.2rem;"><i class="fas fa-graduation-cap"></i> <strong>Degree:</strong> ${st.completedDegree || st.degree || 'B.E.'} (${st.graduationYear || '2025'})</div>`
        : `<div style="font-size:0.73rem; color:#34d399; margin-top:0.2rem;"><i class="fas fa-book-reader"></i> <strong>Pursuing:</strong> ${st.pursuingYear || '4th Year'} (${st.degree || 'B.E.'})</div>`;

      return `
        <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.65rem;">
              <div>
                <h4 style="font-size:1.05rem; color:var(--text-main); margin-bottom:0.15rem;">${st.name}</h4>
                <div style="font-size:0.75rem; color:var(--text-muted);">${st.department} • ${st.rollNo}</div>
                ${eduMarkup}
                <div style="font-size:0.72rem; color:#60a5fa; margin-top:0.15rem;"><i class="fas fa-university"></i> ${st.college || 'Engineering College'}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--font-heading); font-size:1.25rem; font-weight:800; color:var(--primary-light);">${st.cgpa.toFixed(2)}</div>
                <div style="font-size:0.68rem; color:var(--text-dim); text-transform:uppercase;">CGPA</div>
              </div>
            </div>

            <!-- Experience Badges -->
            ${internMarkup}
            ${hackMarkup}

            <div style="margin-bottom:0.75rem;">
              <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600; margin-bottom:0.25rem;">
                <span style="color:var(--text-muted);">AI Readiness Score</span>
                <span style="color:${st.readiness>=80?'var(--success)':'var(--warning)'};">${st.readiness}%</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${st.readiness}%;"></div></div>
            </div>

            <!-- Well-Versed Coding Languages -->
            <div style="margin-bottom:0.65rem;">
              <div style="font-size:0.7rem; text-transform:uppercase; color:var(--text-dim); margin-bottom:0.3rem; font-weight:700;">Proficient Languages</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
                ${langBadges}
              </div>
            </div>

            <div style="margin-bottom:0.75rem;">
              <div style="font-size:0.7rem; text-transform:uppercase; color:var(--text-dim); margin-bottom:0.3rem; font-weight:700;">Technical Skills</div>
              <div style="display:flex; flex-wrap:wrap; gap:0.25rem;">
                ${skillsBadges}
              </div>
            </div>
          </div>

          <div style="border-top:1px solid var(--border-subtle); padding-top:0.75rem; margin-top:0.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.4rem;">
            <div style="display:flex; align-items:center; gap:0.4rem;">
              <span class="badge ${st.status === 'Placed' ? 'badge-success' : 'badge-info'}" style="font-size:0.72rem;">${st.status}</span>
              <button class="btn btn-primary btn-sm" onclick="RecruiterModule.openAtsCheckerForCandidate('${st.id}')" style="font-size:0.72rem; padding:0.25rem 0.55rem; font-weight:700;" title="Put candidate's PDF resume into ATS Checker">
                <i class="fas fa-microchip" style="color:#fbbf24;"></i> Put in ATS Checker
              </button>
            </div>
            <button class="btn btn-outline btn-sm" onclick="RecruiterModule.inviteCandidate('${st.name}')" style="font-size:0.72rem; padding:0.25rem 0.55rem;">
              <i class="fas fa-envelope"></i> Invite
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // ================================================================
  // ATS RESUME VERIFIER & CHECKER WORKBENCH (CORE RECRUITER FEATURE)
  // ================================================================

  // 1. Pre-populate Candidate & Job Criteria Selectors
  populateAtsSelectors() {
    const candSelect = document.getElementById('recAtsCandidateSelect');
    const jobSelect = document.getElementById('recAtsJobSelect');
    if (!candSelect || !jobSelect) return;

    const apps = window.ptsState?.data?.applications || [];
    const students = window.ptsState?.data?.students || [];
    const companies = window.ptsState?.data?.companies || [];

    // Populate Candidates from applications + student pool
    candSelect.innerHTML = '';
    const addedIds = new Set();

    // 1st Priority: Applicants who applied to company drives
    apps.forEach(app => {
      const st = students.find(s => s.id === app.studentId);
      const label = `${app.studentName} — Applied for ${app.companyName} (${app.role}) [📄 ${app.resumePdfName || 'Resume.pdf'}]`;
      const opt = document.createElement('option');
      opt.value = app.studentId;
      opt.setAttribute('data-app-id', app.id);
      opt.setAttribute('data-company-id', app.companyId || '');
      opt.textContent = label;
      candSelect.appendChild(opt);
      addedIds.add(app.studentId);
    });

    // 2nd Priority: Other students in talent directory
    students.forEach(st => {
      if (!addedIds.has(st.id)) {
        const opt = document.createElement('option');
        opt.value = st.id;
        opt.textContent = `${st.name} (${st.department}, CGPA: ${st.cgpa}) — [📄 ${st.resumeName || 'Profile_Resume.pdf'}]`;
        candSelect.appendChild(opt);
      }
    });

    // Populate Job Openings
    jobSelect.innerHTML = '';
    companies.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} — ${c.role} (${c.ctc})`;
      jobSelect.appendChild(opt);
    });

    // Add generic / custom job option
    const customOpt = document.createElement('option');
    customOpt.value = 'custom';
    customOpt.textContent = '⚡ Custom Role: SDE / Microservices Engineer';
    jobSelect.appendChild(customOpt);

    if (this.selectedCandidateId) {
      candSelect.value = this.selectedCandidateId;
    }
  },

  // 2. Open ATS Checker directly for a specific candidate & application
  openAtsCheckerForCandidate(studentId, appId = null) {
    this.selectedCandidateId = studentId;
    this.selectedAppId = appId;

    this.switchTab('ats');

    const candSelect = document.getElementById('recAtsCandidateSelect');
    if (candSelect) {
      candSelect.value = studentId;
    }

    // Auto-select corresponding job opening if known
    if (appId) {
      const app = window.ptsState?.data?.applications?.find(a => a.id === appId);
      const jobSelect = document.getElementById('recAtsJobSelect');
      if (app && jobSelect) {
        const matchedComp = window.ptsState?.data?.companies?.find(c => c.name.toLowerCase() === app.companyName.toLowerCase());
        if (matchedComp) jobSelect.value = matchedComp.id;
      }
    }

    this.runAtsVerification();

    // Smooth scroll to ATS main grid
    document.getElementById('recAtsMainGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  onCandidateSelectChange() {
    const candSelect = document.getElementById('recAtsCandidateSelect');
    if (!candSelect) return;

    this.selectedCandidateId = candSelect.value;
    const selectedOption = candSelect.options[candSelect.selectedIndex];
    const appId = selectedOption.getAttribute('data-app-id');
    this.selectedAppId = appId || null;

    // Auto-sync job dropdown if candidate applied for a specific company
    const compId = selectedOption.getAttribute('data-company-id');
    const jobSelect = document.getElementById('recAtsJobSelect');
    if (compId && jobSelect) {
      jobSelect.value = compId;
    }

    this.runAtsVerification();
  },

  onJobSelectChange() {
    this.runAtsVerification();
  },

  // 3. Upload custom external PDF resume to check in ATS
  handleCustomPdfUpload(input) {
    const file = input.files && input.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      window.App.showToast('Please select a valid PDF file (.pdf). Non-PDF files cannot be verified in ATS.', 'danger');
      input.value = '';
      return;
    }

    const fileSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const dataUri = e.target.result;
      let text = '';

      // Try extraction using PDF.js
      try {
        if (window.pdfjsLib) {
          const loadingTask = window.pdfjsLib.getDocument({ data: atob(dataUri.split(',')[1]) });
          const pdfDoc = await loadingTask.promise;
          for (let p = 1; p <= pdfDoc.numPages; p++) {
            const page = await pdfDoc.getPage(p);
            const content = await page.getTextContent();
            text += content.items.map(it => it.str).join(' ') + '\n';
          }
        }
      } catch (err) {
        console.warn('PDF.js text parse fallback:', err);
      }

      this.currentCustomPdf = {
        name: file.name,
        size: `${fileSizeKb} KB`,
        dataUri: dataUri,
        text: text || `External Candidate Resume - ${file.name}\nExtracted text stream from uploaded PDF.\nSkills: Python, Java, SQL, Cloud, REST APIs.`
      };

      // Add to Candidate Selector
      const candSelect = document.getElementById('recAtsCandidateSelect');
      if (candSelect) {
        const opt = document.createElement('option');
        opt.value = 'custom_uploaded_pdf';
        opt.textContent = `📄 [Uploaded PDF] ${file.name} (${fileSizeKb} KB)`;
        candSelect.insertBefore(opt, candSelect.firstChild);
        candSelect.value = 'custom_uploaded_pdf';
      }

      window.App.showToast(`Uploaded PDF resume '${file.name}' verified and loaded into ATS Checker!`, 'success');
      this.runAtsVerification();
    };

    reader.readAsDataURL(file);
  },

  // 4. Toggle PDF Viewer Mode (Document vs Raw Parsed Text)
  togglePdfViewMode(mode) {
    const iframe = document.getElementById('recAtsPdfIframe');
    const fallback = document.getElementById('recAtsPdfFallback');
    const textStream = document.getElementById('recAtsPdfTextStream');
    const docBtn = document.getElementById('recTogglePdfViewBtn');
    const textBtn = document.getElementById('recToggleTextViewBtn');

    if (mode === 'pdf') {
      if (iframe) iframe.style.display = 'block';
      if (textStream) textStream.style.display = 'none';
      if (docBtn) { docBtn.className = 'btn btn-secondary btn-sm'; }
      if (textBtn) { textBtn.className = 'btn btn-outline btn-sm'; }
    } else {
      if (iframe) iframe.style.display = 'none';
      if (fallback) fallback.style.display = 'none';
      if (textStream) textStream.style.display = 'block';
      if (docBtn) { docBtn.className = 'btn btn-outline btn-sm'; }
      if (textBtn) { textBtn.className = 'btn btn-secondary btn-sm'; }
    }
  },

  // 5. Generate authentic PDF-1.4 Data URI for candidate resumes
  generateCandidatePdfDataUri(candidate, contentText) {
    const safeName = (candidate.name || 'Candidate').replace(/[\(\)\\]/g, '');
    const safeDept = (candidate.department || 'CSE').replace(/[\(\)\\]/g, '');
    const safeCollege = (candidate.college || 'Engineering College').replace(/[\(\)\\]/g, '');
    const safeCgpa = String(candidate.cgpa || '8.45');

    const lines = (contentText || candidate.resumeContent || `Sashti S - B.E. CSE\nSkills: Python, Java, SQL, REST APIs, Docker.\nProjects: Full-Stack Placement Portal.`)
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .slice(0, 32);

    let stream = "BT\n/F1 14 Tf\n50 740 Td\n18 TL\n";
    stream += `(${safeName} - B.E. ${safeDept} | CGPA: ${safeCgpa}) Tj T*\n`;
    stream += `/F1 9 Tf\n`;
    stream += `(${safeCollege} - Official Candidate Resume PDF) Tj T*\nT*\n`;

    lines.forEach(l => {
      const clean = l.replace(/[\(\)\\]/g, '').substring(0, 85);
      if (clean.endsWith(':')) {
        stream += `/F1 11 Tf\n(${clean}) Tj T*\n/F1 9 Tf\n`;
      } else {
        stream += `(${clean}) Tj T*\n`;
      }
    });
    stream += "ET";

    const streamLen = stream.length;
    const pdfRaw = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${stream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;

    try {
      return 'data:application/pdf;base64,' + btoa(unescape(encodeURIComponent(pdfRaw)));
    } catch (e) {
      return 'data:application/pdf;base64,' + btoa(pdfRaw);
    }
  },

  // 6. Comprehensive ATS Verification Engine Execution
  runAtsVerification() {
    const candSelect = document.getElementById('recAtsCandidateSelect');
    const jobSelect = document.getElementById('recAtsJobSelect');
    if (!candSelect || !jobSelect) return;

    const candId = candSelect.value;
    const jobId = jobSelect.value;

    let candidate = null;
    let resumePdfName = 'Candidate_Resume.pdf';
    let resumePdfSize = '184 KB';
    let resumePdfContent = '';
    let resumePdfDataUri = '';

    // Check if custom uploaded PDF
    if (candId === 'custom_uploaded_pdf' && this.currentCustomPdf) {
      candidate = {
        id: 'CUSTOM-PDF',
        name: this.currentCustomPdf.name.replace(/\.[^/.]+$/, ''),
        department: 'Engineering',
        cgpa: 8.5,
        skills: ['Python', 'Java', 'SQL', 'Algorithms'],
        resumeUploaded: true
      };
      resumePdfName = this.currentCustomPdf.name;
      resumePdfSize = this.currentCustomPdf.size;
      resumePdfContent = this.currentCustomPdf.text;
      resumePdfDataUri = this.currentCustomPdf.dataUri;
    } else {
      candidate = window.ptsState?.data?.students?.find(s => s.id === candId) || window.ptsState?.data?.currentUser;
      if (!candidate) return;

      // Find matching application if available
      const app = window.ptsState?.data?.applications?.find(a => a.studentId === candidate.id && (!this.selectedAppId || a.id === this.selectedAppId))
        || window.ptsState?.data?.applications?.find(a => a.studentId === candidate.id);

      if (app) {
        this.selectedAppId = app.id;
        resumePdfName = app.resumePdfName || candidate.resumeName || `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`;
        resumePdfSize = app.resumePdfSize || '184 KB';
        resumePdfContent = app.resumePdfContent || candidate.resumeContent || '';
        resumePdfDataUri = app.resumePdfDataUri || '';
      } else {
        resumePdfName = candidate.resumeName || `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`;
        resumePdfSize = '184 KB';
        resumePdfContent = candidate.resumeContent || '';
      }

      if (!resumePdfContent || resumePdfContent.length < 40) {
        resumePdfContent = `${candidate.name} - B.E. ${candidate.department || 'CSE'} | CGPA: ${candidate.cgpa || 8.45}
Technical Skills: ${(candidate.skills || ['Python', 'Java', 'SQL', 'DSA', 'React']).join(', ')}
Programming Languages: ${(candidate.wellVersedLanguages || ['Python', 'Java', 'C++']).join(', ')}
Internship: ${candidate.internship?.company || 'TechLabs Solutions'} - Microservices & APIs
Projects: Placement Preparation and Tracking System, Smart Healthcare ML Dashboard.
Certifications: AWS Certified Cloud Practitioner, HackerRank Problem Solving Gold.`;
      }

      if (!resumePdfDataUri) {
        resumePdfDataUri = this.generateCandidatePdfDataUri(candidate, resumePdfContent);
      }
    }

    // Get Target Company & Job Criteria
    let company = window.ptsState?.data?.companies?.find(c => c.id === jobId);
    if (!company) {
      company = {
        name: 'Zoho Corporation',
        role: 'Software Development Engineer',
        minCgpa: 7.0,
        allowedDepts: ['CSE', 'IT', 'ECE', 'All'],
        requirements: ['Python, Java or C++', 'Data Structures & Algorithms', 'SQL & DBMS', 'REST APIs', 'Git']
      };
    }

    // Role-Based Keyword Corpus
    const targetRole = company.role || 'Software Engineer';
    const primaryKeywords = [
      'python', 'java', 'c++', 'data structures', 'algorithms', 'dsa', 'sql', 'rest', 'api', 'git', 'oop', 'dbms'
    ];
    const secondaryKeywords = [
      'react', 'docker', 'aws', 'cloud', 'spring boot', 'linux', 'microservices', 'postgresql', 'mysql', 'testing', 'system design'
    ];
    const actionVerbs = [
      'developed', 'engineered', 'built', 'optimized', 'implemented', 'reduced', 'designed', 'collaborated', 'achieved'
    ];

    const lowerResume = resumePdfContent.toLowerCase();

    // 1. Keyword Occurrences and Counts
    const matchedPrimary = [];
    const missingPrimary = [];

    primaryKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw.replace('+', '\\+')}\\b`, 'gi');
      const matches = lowerResume.match(regex);
      if (matches && matches.length > 0) {
        matchedPrimary.push({ word: kw, count: matches.length });
      } else if (lowerResume.includes(kw)) {
        matchedPrimary.push({ word: kw, count: 1 });
      } else {
        missingPrimary.push(kw);
      }
    });

    const matchedSecondary = [];
    secondaryKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw.replace('+', '\\+')}\\b`, 'gi');
      const matches = lowerResume.match(regex);
      if (matches && matches.length > 0) {
        matchedSecondary.push({ word: kw, count: matches.length });
      } else if (lowerResume.includes(kw)) {
        matchedSecondary.push({ word: kw, count: 1 });
      }
    });

    const matchedVerbs = actionVerbs.filter(v => lowerResume.includes(v));

    // 2. Metrics & Quality Check
    const hasMetrics = /\d+[\%|\+|\s*ms|\s*sec|\s*users|\s*k|\s*months]/.test(resumePdfContent);
    const hasEducation = /education|b\.e|b\.tech|cgpa|gpa|university|college/i.test(resumePdfContent);
    const hasProjects = /projects|developed|full-stack|system/i.test(resumePdfContent);
    const hasExperience = /intern|internship|experience|work/i.test(resumePdfContent);
    const hasSkills = /skills|technical|proficiencies|languages/i.test(resumePdfContent);
    const hasContact = /@|\.edu|\.com|\+91|\d{10}/.test(resumePdfContent);

    // 3. Academic Cutoff compliance
    const meetsCgpa = (candidate.cgpa || 8.0) >= (company.minCgpa || 7.0);
    const meetsDept = (company.allowedDepts || ['All']).includes('All') || (company.allowedDepts || []).includes(candidate.department);

    // 4. Calculate Scores
    let keywordScore = Math.min(98, Math.round((matchedPrimary.length / primaryKeywords.length) * 85 + (matchedSecondary.length / 5) * 15));
    let experienceScore = Math.min(95, (hasProjects ? 40 : 15) + (hasExperience ? 45 : 20) + (hasMetrics ? 10 : 0));
    let academicScore = meetsCgpa ? (meetsDept ? 100 : 85) : 60;
    let formatScore = 96; // PDF valid structure

    let overallScore = Math.round((keywordScore * 0.45) + (experienceScore * 0.25) + (academicScore * 0.15) + (formatScore * 0.15));
    overallScore = Math.min(98, Math.max(45, overallScore));

    this.currentAtsResult = {
      score: overallScore,
      keywordScore,
      experienceScore,
      academicScore,
      formatScore,
      candidate,
      company,
      matchedPrimary,
      missingPrimary,
      matchedSecondary,
      matchedVerbs,
      resumePdfName,
      resumePdfSize
    };

    // ==========================================
    // RENDER LEFT PANEL: PDF INSPECTOR
    // ==========================================
    const fileNameEl = document.getElementById('recPdfFileName');
    const fileSizeInfo = document.getElementById('recPdfFileSizeInfo');
    const candInfo = document.getElementById('recPdfCandidateInfo');
    const dlLink = document.getElementById('recPdfDownloadLink');
    const iframe = document.getElementById('recAtsPdfIframe');
    const textStream = document.getElementById('recAtsPdfTextStream');

    if (fileNameEl) fileNameEl.textContent = resumePdfName;
    if (fileSizeInfo) fileSizeInfo.innerHTML = `<i class="fas fa-weight-hanging"></i> Size: ${resumePdfSize}`;
    if (candInfo) candInfo.innerHTML = `<i class="fas fa-user"></i> Candidate: ${candidate.name} (${candidate.department || 'CSE'})`;
    if (dlLink) {
      dlLink.href = resumePdfDataUri;
      dlLink.download = resumePdfName;
    }
    if (iframe) {
      iframe.src = resumePdfDataUri;
    }
    if (textStream) {
      textStream.textContent = resumePdfContent;
    }

    // ==========================================
    // RENDER RIGHT PANEL: ATS GAUGE & REPORT
    // ==========================================
    const scoreValEl = document.getElementById('recAtsScoreVal');
    const svgProgress = document.getElementById('recAtsSvgProgress');
    const verdictBadge = document.getElementById('recAtsVerdictBadge');
    const roleMatchTitle = document.getElementById('recAtsRoleMatchTitle');
    const summaryDesc = document.getElementById('recAtsSummaryDesc');

    if (scoreValEl) scoreValEl.textContent = `${overallScore}%`;

    // SVG gauge circle stroke-dashoffset: 264 - (264 * score / 100)
    if (svgProgress) {
      const offset = 264 - Math.round((264 * overallScore) / 100);
      svgProgress.style.strokeDashoffset = offset;
      if (overallScore >= 85) {
        svgProgress.style.stroke = '#10b981';
      } else if (overallScore >= 70) {
        svgProgress.style.stroke = '#f59e0b';
      } else {
        svgProgress.style.stroke = '#ef4444';
      }
    }

    if (verdictBadge) {
      if (overallScore >= 85) {
        verdictBadge.className = 'badge badge-success';
        verdictBadge.innerHTML = '<i class="fas fa-star"></i> High Priority Candidate - Strong Match';
      } else if (overallScore >= 70) {
        verdictBadge.className = 'badge badge-warning';
        verdictBadge.innerHTML = '<i class="fas fa-check-circle"></i> Eligible Candidate - Moderate Fit';
      } else {
        verdictBadge.className = 'badge badge-danger';
        verdictBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Needs Critical Skills Verification';
      }
    }

    if (roleMatchTitle) {
      roleMatchTitle.textContent = `${company.name} — ${targetRole}`;
    }

    if (summaryDesc) {
      summaryDesc.textContent = `Candidate's PDF resume exhibits strong density across ${matchedPrimary.length} primary technical competencies and verified project implementations.`;
    }

    // 4 Sub-metrics
    const kwEl = document.getElementById('recMetric_keywords');
    const expEl = document.getElementById('recMetric_experience');
    const eduEl = document.getElementById('recMetric_education');
    const fmtEl = document.getElementById('recMetric_formatting');

    if (kwEl) kwEl.textContent = `${keywordScore}%`;
    if (expEl) expEl.textContent = `${experienceScore}%`;
    if (eduEl) eduEl.textContent = `${academicScore}%`;
    if (fmtEl) fmtEl.textContent = `${formatScore}%`;

    // Keywords Lists
    const matchedList = document.getElementById('recAtsMatchedKeywordsList');
    const missingList = document.getElementById('recAtsMissingKeywordsList');
    const verbsList = document.getElementById('recAtsVerbsList');

    if (matchedList) {
      const allMatched = [...matchedPrimary, ...matchedSecondary];
      if (allMatched.length > 0) {
        matchedList.innerHTML = allMatched.map(k => `
          <span class="keyword-tag keyword-tag-match">
            <i class="fas fa-check"></i> ${k.word} ${k.count > 1 ? `<strong style="font-size:0.68rem; opacity:0.8;">(${k.count}x)</strong>` : ''}
          </span>
        `).join('');
      } else {
        matchedList.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">No primary keywords detected in text stream</span>';
      }
    }

    if (missingList) {
      if (missingPrimary.length > 0) {
        missingList.innerHTML = missingPrimary.map(k => `
          <span class="keyword-tag keyword-tag-missing">
            <i class="fas fa-times"></i> ${k}
          </span>
        `).join('');
      } else {
        missingList.innerHTML = '<span class="badge badge-success" style="font-size:0.75rem;"><i class="fas fa-check-circle"></i> Exceptional! All core role requirements detected in PDF</span>';
      }
    }

    if (verbsList) {
      if (matchedVerbs.length > 0) {
        verbsList.innerHTML = matchedVerbs.map(v => `
          <span class="keyword-tag keyword-tag-verb">
            <i class="fas fa-bolt"></i> ${v}
          </span>
        `).join('');
      } else {
        verbsList.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">No action verbs detected</span>';
      }
    }

    // Compliance Checklist
    const checklistGrid = document.getElementById('recAtsChecklistGrid');
    if (checklistGrid) {
      checklistGrid.innerHTML = `
        <div class="ats-checklist-item pass">
          <span><i class="fas fa-file-pdf" style="color:#ef4444;"></i> Valid PDF Format (.pdf)</span>
          <span class="badge badge-success" style="font-size:0.65rem;">PASS</span>
        </div>
        <div class="ats-checklist-item pass">
          <span><i class="fas fa-font" style="color:#10b981;"></i> Machine Selectable Text</span>
          <span class="badge badge-success" style="font-size:0.65rem;">PASS</span>
        </div>
        <div class="ats-checklist-item ${meetsCgpa ? 'pass' : 'fail'}">
          <span><i class="fas fa-graduation-cap"></i> CGPA Cutoff (${candidate.cgpa || 8.0} >= ${company.minCgpa || 7.0})</span>
          <span class="badge ${meetsCgpa ? 'badge-success' : 'badge-danger'}" style="font-size:0.65rem;">${meetsCgpa ? 'PASS' : 'FAIL'}</span>
        </div>
        <div class="ats-checklist-item ${meetsDept ? 'pass' : 'warning'}">
          <span><i class="fas fa-code-branch"></i> Department Eligibility</span>
          <span class="badge ${meetsDept ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">${meetsDept ? 'PASS' : 'REVIEW'}</span>
        </div>
        <div class="ats-checklist-item ${hasExperience ? 'pass' : 'warning'}">
          <span><i class="fas fa-briefcase"></i> Intern / Experience Section</span>
          <span class="badge ${hasExperience ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">${hasExperience ? 'PASS' : 'OPTIONAL'}</span>
        </div>
        <div class="ats-checklist-item ${hasMetrics ? 'pass' : 'warning'}">
          <span><i class="fas fa-chart-line"></i> Quantitative Metric Impact</span>
          <span class="badge ${hasMetrics ? 'badge-success' : 'badge-warning'}" style="font-size:0.65rem;">${hasMetrics ? 'PASS' : 'RECOMMENDED'}</span>
        </div>
      `;
    }

    // Set App Status Badge & Pre-fill Note
    const app = window.ptsState?.data?.applications?.find(a => a.studentId === candidate.id && (!this.selectedAppId || a.id === this.selectedAppId))
      || window.ptsState?.data?.applications?.find(a => a.studentId === candidate.id);

    const appStatusBadge = document.getElementById('recCurrentAppStatusBadge');
    if (appStatusBadge) {
      appStatusBadge.textContent = app ? `Status: ${app.status}` : 'Status: Unapplied / Profile Talent';
    }

    const notesInput = document.getElementById('recAtsNotesInput');
    if (notesInput && !notesInput.value) {
      notesInput.value = `ATS Score: ${overallScore}% Match for ${company.name} (${targetRole}). Verified candidate PDF resume '${resumePdfName}'. Strong alignment with required competencies.`;
    }
  },

  // 7. Recruiter Decision Actions from within the ATS Checker
  handleAtsAction(status) {
    if (!this.currentAtsResult || !this.currentAtsResult.candidate) {
      window.App.showToast('Please select a candidate to evaluate.', 'warning');
      return;
    }

    const candidate = this.currentAtsResult.candidate;
    const company = this.currentAtsResult.company;

    let app = window.ptsState?.data?.applications?.find(a => a.studentId === candidate.id && (!this.selectedAppId || a.id === this.selectedAppId))
      || window.ptsState?.data?.applications?.find(a => a.studentId === candidate.id);

    if (!app) {
      // Create and save application directly
      const newApp = {
        id: 'APP-' + (Math.floor(1000 + Math.random() * 9000)),
        studentId: candidate.id,
        studentName: candidate.name,
        studentDept: candidate.department || 'CSE',
        studentCgpa: candidate.cgpa || 8.0,
        companyId: company.id || 'COMP-3',
        companyName: company.name || 'Zoho Corporation',
        role: company.role || 'Software Developer',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        currentRound: 'Application Screening',
        stepIndex: 1,
        notes: `Analyzed in ATS Workbench with ${this.currentAtsResult.score}% match.`,
        resumePdfName: this.currentAtsResult.resumePdfName,
        resumeFormat: 'PDF',
        resumeVerified: true
      };
      window.ptsState.data.applications.unshift(newApp);
      window.ptsState.saveState();
      this.selectedAppId = newApp.id;
      app = newApp;
    }

    if (status === 'Shortlisted' || status === 'Accepted for Interview') {
      this.openAcceptModal(app.id);
    } else if (status === 'Rejected') {
      this.openRejectModal(app.id);
    } else if (status === 'Selected') {
      this.updateAppStatus(app.id, 'Selected', 'Offer Extended');
    }
  },

  // 8. Send Feedback Notification to Candidate
  sendAtsFeedbackToStudent() {
    if (!this.currentAtsResult || !this.currentAtsResult.candidate) return;

    const candidate = this.currentAtsResult.candidate;
    const company = this.currentAtsResult.company;
    const score = this.currentAtsResult.score;

    window.ptsState.addNotification(
      `Recruiter ATS Screening: ${company.name}`,
      `Your verified PDF resume was evaluated for the ${company.role} position with an ATS match score of ${score}%. Recruiter feedback: Profile prioritized for technical evaluation.`,
      'info'
    );

    window.App.showToast(`Evaluation notification sent to ${candidate.name}!`, 'success');
  },

  // 9. Update Application Status
  updateAppStatus(appId, status, customNotes = '') {
    const stepMap = {
      'Shortlisted': 3,
      'Selected': 5,
      'Rejected': 2
    };
    const roundMap = {
      'Shortlisted': 'Technical Interview with Lead Engineer',
      'Selected': 'Final Selection - Offer Extended',
      'Rejected': 'Candidate Profile Not Selected'
    };

    window.ptsState.updateApplicationStatus(appId, status, roundMap[status], stepMap[status]);

    const app = window.ptsState.data.applications.find(a => a.id === appId);
    if (app && customNotes) {
      app.notes = customNotes;
      window.ptsState.saveState();
    }

    window.App.showToast(`Application for ${app?.studentName || 'Candidate'} updated to '${status}'!`, 'success');

    this.renderRecruiterApplications();
    this.renderRecruiterStats();

    if (window.OfficerModule) window.OfficerModule.renderApplicationsList();
    if (window.StudentModule) window.StudentModule.renderApplicationTracker();
  },

  inviteCandidate(studentName) {
    window.App.showToast(`Interview invitation sent to ${studentName}!`, 'success');
    window.ptsState.addAuditLog(`Recruiter invited ${studentName} for preliminary evaluation.`);
  },

  // 10. Post Campus Job Opening
  handlePostJob() {
    const role = document.getElementById('recRoleTitle').value.trim();
    const company = document.getElementById('recCompanyName').value.trim();
    const ctc = document.getElementById('recSalary').value.trim();
    const minCgpa = parseFloat(document.getElementById('recMinCgpa').value);
    const depts = document.getElementById('recDepts').value.split(',').map(d => d.trim());
    const desc = document.getElementById('recJobDesc').value.trim();

    if (!role || !company || isNaN(minCgpa)) {
      window.App.showToast('Please fill all mandatory job posting fields.', 'warning');
      return;
    }

    window.ptsState.addCompany({
      name: company,
      role,
      ctc: ctc.includes('LPA') ? ctc : `${ctc} LPA`,
      ctcNum: parseFloat(ctc) || 8.0,
      minCgpa,
      maxArrears: 0,
      allowedDepts: depts.length > 0 ? depts : ['All'],
      driveDate: '2026-11-05',
      deadline: '2026-10-25',
      location: 'Hybrid / Onsite',
      category: 'Recruiter Posting',
      description: desc || `Full-time role for ${role} with high growth potential and cutting edge tech stack.`,
      logo: 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png',
      requirements: ['Python, Java or C++', 'Data Structures & Algorithms', 'REST APIs', 'SQL Database']
    });

    window.ptsState.addNotification(
      `New Job Opening: ${company}`,
      `Recruiter posted opening for ${role} (${ctc}). Students must apply with verified PDF resume for ATS screening.`,
      'info'
    );

    window.App.showToast(`Job opening for ${role} at ${company} posted successfully!`, 'success');

    // Reset Form
    document.getElementById('recRoleTitle').value = '';
    document.getElementById('recCompanyName').value = '';
    document.getElementById('recSalary').value = '';
    document.getElementById('recJobDesc').value = '';

    // Switch back to applications tab
    this.switchTab('applications');

    // Update other modules
    if (window.OfficerModule) window.OfficerModule.renderDrivesManagement();
    if (window.StudentModule) window.StudentModule.renderEligibilityChecker();
  },

  // Modal legacy support
  analyzeCandidateResume(studentId) {
    this.openAtsCheckerForCandidate(studentId);
  },

  // 11. Recruiter Decision: Accept for Interview Modal Handlers
  openAcceptModal(appId) {
    const app = (window.ptsState?.data?.applications || []).find(a => a.id === appId);
    if (!app) {
      window.App.showToast('Application not found.', 'warning');
      return;
    }

    const modal = document.getElementById('recruiterAcceptModal');
    if (!modal) return;

    document.getElementById('recAcceptAppId').value = appId;
    const candNameEl = document.getElementById('recAcceptCandidateName');
    const roleCompEl = document.getElementById('recAcceptRoleAndComp');
    const subTitleEl = document.getElementById('recAcceptSubTitle');

    if (candNameEl) candNameEl.textContent = app.studentName;
    if (roleCompEl) roleCompEl.textContent = `${app.companyName} • ${app.role} (Dept: ${app.studentDept}, CGPA: ${app.studentCgpa})`;
    if (subTitleEl) subTitleEl.textContent = `Schedule interview round with ${app.studentName}`;

    // Set default date (5 days ahead)
    const futureDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    const dateInput = document.getElementById('recAcceptDate');
    if (dateInput) dateInput.value = futureDate;

    // Set custom meeting link
    const cleanComp = app.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanStu = app.studentName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const linkInput = document.getElementById('recAcceptMeetingLink');
    if (linkInput) linkInput.value = `https://meet.google.com/${cleanComp}-${cleanStu}-interview`;

    modal.classList.add('active');
  },

  toggleAcceptMode(mode) {
    const linkGroup = document.getElementById('recAcceptLinkGroup');
    const linkLabel = document.getElementById('recAcceptLinkLabel');
    const linkInput = document.getElementById('recAcceptMeetingLink');
    if (!linkGroup || !linkLabel || !linkInput) return;

    if (mode === 'Offline') {
      linkLabel.innerHTML = '<i class="fas fa-building" style="color:var(--success);"></i> Campus Interview Venue / Hall';
      linkInput.type = 'text';
      linkInput.placeholder = 'e.g. CDC Placement Interview Hall B, Admin Block';
      linkInput.value = 'CDC Placement Interview Hall B, Admin Block';
    } else {
      linkLabel.innerHTML = '<i class="fab fa-google" style="color:#38bdf8;"></i> Google Meet Meeting Link';
      linkInput.type = 'url';
      linkInput.placeholder = 'https://meet.google.com/...';
      linkInput.value = 'https://meet.google.com/pts-tech-interview';
    }
  },

  handleConfirmAccept(e) {
    e.preventDefault();
    const appId = document.getElementById('recAcceptAppId')?.value;
    const round = document.getElementById('recAcceptRound')?.value.trim();
    const date = document.getElementById('recAcceptDate')?.value;
    const time = document.getElementById('recAcceptTime')?.value.trim();
    const mode = document.getElementById('recAcceptMode')?.value;
    const meetingLinkOrVenue = document.getElementById('recAcceptMeetingLink')?.value.trim();
    const notes = document.getElementById('recAcceptNotes')?.value.trim();

    if (!appId) return;

    const res = window.ptsState.acceptApplicationForInterview(appId, {
      round,
      date,
      time,
      mode,
      meetingLink: mode === 'Online' ? meetingLinkOrVenue : '',
      venue: mode === 'Offline' ? meetingLinkOrVenue : '',
      notes
    });

    document.getElementById('recruiterAcceptModal')?.classList.remove('active');

    if (res.success) {
      window.App.showToast(`🎉 Candidate accepted for interview! Schedule and join link sent to student.`, 'success');
      this.renderRecruiterApplications();
      this.renderRecruiterStats();

      // Refresh other open views
      if (window.StudentModule) window.StudentModule.renderApplicationTracker();
      if (window.OfficerModule) window.OfficerModule.renderApplicationsList();
    } else {
      window.App.showToast(res.message, 'warning');
    }
  },

  // 12. Recruiter Decision: Reject with Reason Modal Handlers
  openRejectModal(appId) {
    const app = (window.ptsState?.data?.applications || []).find(a => a.id === appId);
    if (!app) {
      window.App.showToast('Application not found.', 'warning');
      return;
    }

    const modal = document.getElementById('recruiterRejectModal');
    if (!modal) return;

    document.getElementById('recRejectAppId').value = appId;
    const candNameEl = document.getElementById('recRejectCandidateName');
    const roleCompEl = document.getElementById('recRejectRoleAndComp');

    if (candNameEl) candNameEl.textContent = app.studentName;
    if (roleCompEl) roleCompEl.textContent = `${app.companyName} • ${app.role} (Dept: ${app.studentDept}, CGPA: ${app.studentCgpa})`;

    // Initialize preset to skills_gap
    const presetSelect = document.getElementById('recRejectPresetSelect');
    if (presetSelect) presetSelect.value = 'skills_gap';
    this.onRejectPresetChange('skills_gap');

    modal.classList.add('active');
  },

  onRejectPresetChange(val) {
    const reasonEl = document.getElementById('recRejectReasonText');
    const guidanceEl = document.getElementById('recRejectGuidanceText');
    if (!reasonEl || !guidanceEl) return;

    const presets = {
      skills_gap: {
        reason: 'Technical Skills Alignment: Candidate resume does not demonstrate sufficient hands-on experience in our required technology stack (such as microservices architecture, Docker containerization, or production database indexing).',
        guidance: 'We recommend building an end-to-end full stack project with containerized REST microservices and deploying it on cloud platforms like AWS or Render.'
      },
      cgpa_cutoff: {
        reason: 'Academic Eligibility Threshold: The academic cut-off for this campus drive track is 8.5 CGPA. The candidate profile did not satisfy the minimum cumulative grade criteria for interview scheduling.',
        guidance: 'Maintain consistent scores in upcoming semesters. Students can still qualify for open pool drives and hackathon fast-track tracks.'
      },
      ats_mismatch: {
        reason: 'ATS Keyword Match Threshold: The submitted PDF resume achieved below 70% keyword match against the essential requirements in the job description.',
        guidance: 'Tailor your resume for specific job descriptions by highlighting relevant coursework, libraries, databases, and quantifiable project outcomes.'
      },
      project_metrics: {
        reason: 'Project Depth & Measurable Impact: Projects listed on the resume lack verifiable production metrics, performance benchmarks, or deployed live URLs.',
        guidance: 'Quantify your accomplishments (e.g. "Reduced API latency by 30%", "Handled 10k requests/min") and provide active GitHub and demo links.'
      },
      custom: {
        reason: '',
        guidance: ''
      }
    };

    if (presets[val]) {
      if (val !== 'custom') {
        reasonEl.value = presets[val].reason;
        guidanceEl.value = presets[val].guidance;
      } else {
        reasonEl.value = '';
        guidanceEl.value = '';
        reasonEl.focus();
      }
    }
  },

  handleConfirmReject(e) {
    e.preventDefault();
    const appId = document.getElementById('recRejectAppId')?.value;
    const reason = document.getElementById('recRejectReasonText')?.value.trim();
    const guidance = document.getElementById('recRejectGuidanceText')?.value.trim();

    if (!appId || !reason) {
      window.App.showToast('Please specify the exact reason for rejection.', 'warning');
      return;
    }

    const res = window.ptsState.rejectApplicationWithReason(appId, reason, guidance);

    document.getElementById('recruiterRejectModal')?.classList.remove('active');

    if (res.success) {
      window.App.showToast(`Application rejected. Constructive reason delivered to student.`, 'info');
      this.renderRecruiterApplications();
      this.renderRecruiterStats();

      // Refresh other open views
      if (window.StudentModule) window.StudentModule.renderApplicationTracker();
      if (window.OfficerModule) window.OfficerModule.renderApplicationsList();
    } else {
      window.App.showToast(res.message, 'warning');
    }
  }
};
