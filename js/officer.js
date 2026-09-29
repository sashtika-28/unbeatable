/**
 * Placement Preparation and Tracking System
 * Placement Officer (PO) Module Controller
 */

window.OfficerModule = {
  currentTab: 'overview',
  currentPostQuestionType: 'leetcode',
  activeStatusQuestionId: null,

  init() {
    this.renderDashboardStats();
    this.renderStudentDirectory();
    this.renderDrivesManagement();
    this.renderQuestionsList();
    this.renderApplicationsList();
    this.renderMockInterviewRequests();
    this.attachEvents();
  },

  switchTab(tabId) {
    this.currentTab = tabId;
    const tabBtns = document.querySelectorAll('.officer-tab-btn');
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    const tabContents = document.querySelectorAll('.officer-tab-content');
    tabContents.forEach(content => {
      content.style.display = content.id === `officerTab_${tabId}` ? 'block' : 'none';
    });

    if (tabId === 'questions') {
      this.renderQuestionsList();
    } else if (tabId === 'drives') {
      this.renderDrivesManagement();
    } else if (tabId === 'overview') {
      this.renderStudentDirectory();
      this.renderDashboardStats();
    } else if (tabId === 'applications') {
      this.renderApplicationsList();
    } else if (tabId === 'interviews') {
      this.renderMockInterviewRequests();
    }
  },

  attachEvents() {
    // Post Company Drive Form Submit
    const postCompanyForm = document.getElementById('officerPostCompanyForm');
    if (postCompanyForm) {
      postCompanyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePostCompany();
      });
    }

    // Legacy Add Drive Form if still exists in modal
    const legacyAddDriveForm = document.getElementById('addDriveForm');
    if (legacyAddDriveForm) {
      legacyAddDriveForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleScheduleDrive();
      });
    }

    // LeetCode Problem Form Submit
    const formPostLeetcode = document.getElementById('formPostLeetcode');
    if (formPostLeetcode) {
      formPostLeetcode.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePostLeetcodeQuestion();
      });
    }

    // Aptitude Question Form Submit
    const formPostAptitude = document.getElementById('formPostAptitude');
    if (formPostAptitude) {
      formPostAptitude.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePostAptitudeQuestion();
      });
    }

    // Broadcast Announcement Form
    const broadcastForm = document.getElementById('broadcastNoticeForm');
    if (broadcastForm) {
      broadcastForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleBroadcastNotice();
      });
    }

    // Student filters
    const searchInput = document.getElementById('poStudentSearch');
    const deptFilter = document.getElementById('poDeptFilter');
    if (searchInput) searchInput.addEventListener('input', () => this.renderStudentDirectory());
    if (deptFilter) deptFilter.addEventListener('change', () => this.renderStudentDirectory());

    // Export CSV
    const exportBtn = document.getElementById('exportStudentsCsvBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportStudentsToCsv());
    }

    // Initialize date defaults for company posting
    const driveDateInput = document.getElementById('newDriveDate');
    const deadlineInput = document.getElementById('newDriveDeadline');
    if (driveDateInput && !driveDateInput.value) {
      const d = new Date(Date.now() + 14 * 86400000);
      driveDateInput.value = d.toISOString().split('T')[0];
    }
    if (deadlineInput && !deadlineInput.value) {
      const d = new Date(Date.now() + 7 * 86400000);
      deadlineInput.value = d.toISOString().split('T')[0];
    }
  },

  renderDashboardStats() {
    const students = window.ptsState.data.students || [];
    const companies = window.ptsState.data.companies || [];
    const applications = window.ptsState.data.applications || [];

    const placedCount = students.filter(s => s.status === 'Placed').length;
    const placementRate = students.length > 0 ? Math.round((placedCount / students.length) * 100) : 0;

    const ctcValues = companies.map(c => c.ctcNum || parseFloat(c.ctc) || 0).filter(v => v > 0);
    const maxCtc = ctcValues.length > 0 ? Math.max(...ctcValues) : 32;

    const rateEl = document.getElementById('poStat_rate');
    const totalStudentsEl = document.getElementById('poStat_totalStudents');
    const companiesEl = document.getElementById('poStat_companies');
    const maxCtcEl = document.getElementById('poStat_highestCtc');

    if (rateEl) rateEl.textContent = `${placementRate}%`;
    if (totalStudentsEl) totalStudentsEl.textContent = students.length;
    if (companiesEl) companiesEl.textContent = companies.length;
    if (maxCtcEl) maxCtcEl.textContent = `${maxCtc} LPA`;
  },

  renderStudentDirectory() {
    const tableBody = document.getElementById('poStudentsTableBody');
    if (!tableBody) return;

    const searchTerm = (document.getElementById('poStudentSearch')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('poDeptFilter')?.value || 'All';

    let list = window.ptsState.data.students || [];
    if (deptFilter !== 'All') {
      list = list.filter(s => s.department === deptFilter);
    }
    if (searchTerm) {
      list = list.filter(s => s.name.toLowerCase().includes(searchTerm) || s.rollNo.toLowerCase().includes(searchTerm));
    }

    tableBody.innerHTML = list.map(st => {
      const isPlaced = st.status === 'Placed';
      const internBadge = (st.internship && st.internship.hasDone && st.internship.company)
        ? `<span class="badge" style="background:rgba(16,185,129,0.12); color:#10b981; font-size:0.68rem; padding:1px 6px;"><i class="fas fa-briefcase"></i> ${st.internship.company}</span>`
        : '';
      const hackBadge = (st.hackathons && st.hackathons.length > 0 && st.hackathons[0].name)
        ? `<span class="badge" style="background:rgba(245,158,11,0.12); color:#fbbf24; font-size:0.68rem; padding:1px 6px;"><i class="fas fa-trophy"></i> ${st.hackathons[0].name}</span>`
        : '';

      return `
        <tr>
          <td>
            <strong>${st.name}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${st.rollNo} • <span style="color:#60a5fa;">${st.college || 'Engineering College'}</span></div>
            <div style="margin-top:0.25rem; display:flex; gap:0.25rem; flex-wrap:wrap;">
              ${internBadge}
              ${hackBadge}
            </div>
          </td>
          <td>
            <div>${st.department}</div>
            <div style="font-size:0.72rem; margin-top:0.2rem;">
              ${st.educationStatus === 'graduated' 
                ? `<span style="color:#c084fc;"><i class="fas fa-graduation-cap"></i> ${st.completedDegree || 'Graduated'} (${st.graduationYear || '2025'})</span>`
                : `<span style="color:#34d399;"><i class="fas fa-book-reader"></i> ${st.pursuingYear || '4th Year'} (${st.degree || 'B.E.'})</span>`}
            </div>
          </td>
          <td><strong style="color:${st.cgpa >= 8.0 ? 'var(--success)' : 'var(--text-main)'}">${st.cgpa.toFixed(2)}</strong></td>
          <td>${st.arrears}</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-size:0.8rem; font-weight:700;">${st.readiness}%</span>
              <div class="progress-track" style="width:50px;"><div class="progress-fill" style="width:${st.readiness}%;"></div></div>
            </div>
          </td>
          <td>
            ${isPlaced 
              ? `<span class="badge badge-success"><i class="fas fa-trophy"></i> Placed (${st.placedCompany})</span>` 
              : `<span class="badge badge-warning">In Placement Drives</span>`}
          </td>
        </tr>
      `;
    }).join('');
  },

  // Preset company logo helper
  applyCompanyPreset(companyName) {
    if (!companyName) return;
    const presets = {
      'Google': {
        name: 'Google',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
        role: 'Software Development Engineer (SDE-1)',
        ctc: '32.0 LPA',
        category: 'Dream / Tier 1',
        minCgpa: 8.5,
        maxArrears: 0,
        depts: 'CSE, IT, ECE',
        location: 'Bangalore / Hyderabad',
        requirements: '1. Strong Data Structures & Algorithms (Trees, Graphs, DP)\n2. Understanding of Distributed Systems and Computer Architecture\n3. Proficiency in C++, Java, Go, or Python\n4. Min 8.5 CGPA with zero active backlogs',
        rounds: 'Online Coding Assessment -> Technical Round 1 (DSA) -> Technical Round 2 (System Design) -> Googlyness & HR Round'
      },
      'Microsoft': {
        name: 'Microsoft',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg',
        role: 'Software Engineer',
        ctc: '28.5 LPA',
        category: 'Dream / Tier 1',
        minCgpa: 8.0,
        maxArrears: 0,
        depts: 'CSE, IT, ECE, EEE',
        location: 'Hyderabad / Bangalore',
        requirements: '1. Solid foundation in Algorithms, Data Structures, and Complexity Analysis\n2. Object-Oriented Design & Clean Architecture principles\n3. Hands-on experience with C#, Java, C++, or TypeScript\n4. Strong problem solving and team collaboration',
        rounds: 'Online Assessment -> Technical Interview 1 -> Technical Interview 2 -> AA (As Appropriate) Round'
      },
      'Amazon': {
        name: 'Amazon',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
        role: 'SDE Intern + FTE',
        ctc: '25.0 LPA',
        category: 'Dream / Tier 1',
        minCgpa: 7.8,
        maxArrears: 0,
        depts: 'CSE, IT',
        location: 'Chennai / Bangalore',
        requirements: '1. Deep DSA expertise: Hash Maps, Trees, Heaps, Dynamic Programming\n2. Familiarity with Object-Oriented Analysis & Low-Level Design (LLD)\n3. Basic exposure to Cloud / Distributed systems is advantageous\n4. Demonstrated alignment with Amazon Leadership Principles',
        rounds: 'Online Assessment (Debugging + Coding) -> Technical Interview 1 -> Technical Interview 2 -> Bar Raiser Round'
      },
      'Zoho': {
        name: 'Zoho Corporation',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Zoho_Corporation_logo.svg',
        role: 'Software Developer',
        ctc: '9.5 LPA',
        category: 'Product',
        minCgpa: 7.0,
        maxArrears: 1,
        depts: 'CSE, IT, ECE, EEE, MECH, CIVIL',
        location: 'Chennai / Tenkasi / Salem',
        requirements: '1. Strong programming skill in C, C++, or Java (no built-in libraries in early rounds)\n2. Speed and algorithmic correctness in pattern printing and matrix manipulation\n3. Zero active arrears at joining\n4. High logical reasoning and persistence',
        rounds: 'Round 1: Basic Programming (C/Java/Python) -> Round 2: Advanced Problem Solving -> Round 3: Technical Interview -> Round 4: HR Interview'
      },
      'TCS': {
        name: 'Tata Consultancy Services (TCS)',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
        role: 'Digital & Ninja Specialist',
        ctc: '7.5 LPA',
        category: 'Mass / Service',
        minCgpa: 6.5,
        maxArrears: 1,
        depts: 'All',
        location: 'Pan India',
        requirements: '1. Core Python, Java, or C programming expertise\n2. High percentile in TCS NQT Quantitative & Logical sections\n3. Consistent 60%+ academic record across 10th, 12th, and B.E.\n4. Good verbal articulation and adaptability',
        rounds: 'TCS NQT (Aptitude + Coding) -> Technical Interview -> Managerial & HR Round'
      },
      'Infosys': {
        name: 'Infosys',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
        role: 'Specialist Programmer (SP)',
        ctc: '9.5 LPA',
        category: 'Core / IT',
        minCgpa: 7.0,
        maxArrears: 0,
        depts: 'CSE, IT, ECE, EEE',
        location: 'Mysore / Bangalore / Pune',
        requirements: '1. Strong competitive programming skills (HackWithInfy qualifiers preferred)\n2. Advanced DSA: Graph traversal, Dynamic Programming, Segment Trees\n3. Minimum 7.0 CGPA without standing arrears\n4. Willingness to undergo world-class residential training at Mysore campus',
        rounds: 'HackWithInfy Coding Round -> Technical Interview -> HR Round'
      },
      'Cisco': {
        name: 'Cisco Systems',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cisco/cisco-original.svg',
        role: 'Software Engineer - Cloud & Networking',
        ctc: '18.5 LPA',
        category: 'Product',
        minCgpa: 7.5,
        maxArrears: 0,
        depts: 'CSE, IT, ECE',
        location: 'Bangalore',
        requirements: '1. Fundamentals of Computer Networking (TCP/IP, OSI Model, Routing)\n2. Strong coding skill in C, C++, or Python\n3. Understanding of Linux OS internals, socket programming, or Cloud technologies\n4. Min 7.5 CGPA with zero active backlogs',
        rounds: 'Online Coding Test -> Technical Interview 1 (Networks & DSA) -> Technical Interview 2 -> Managerial / HR Round'
      },
      'Oracle': {
        name: 'Oracle',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg',
        role: 'Member of Technical Staff (MTS)',
        ctc: '20.0 LPA',
        category: 'Dream / Tier 1',
        minCgpa: 8.0,
        maxArrears: 0,
        depts: 'CSE, IT, ECE',
        location: 'Bangalore / Hyderabad',
        requirements: '1. Deep knowledge of Relational Database internals, SQL indexing, and ACID properties\n2. Proficiency in Java, C++, or Go\n3. Data Structures, Concurrency, and Multithreading principles\n4. Solid analytical and algorithmic capability',
        rounds: 'Online Assessment -> Technical Interview 1 -> Technical Interview 2 -> Director / HR Round'
      },
      'Qualcomm': {
        name: 'Qualcomm',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Qualcomm_logo.svg',
        role: 'Associate Engineer - Embedded Software',
        ctc: '22.0 LPA',
        category: 'Dream / Tier 1',
        minCgpa: 7.8,
        maxArrears: 0,
        depts: 'CSE, ECE, EEE',
        location: 'Hyderabad / Chennai / Bangalore',
        requirements: '1. Strong Embedded C and C++ programming\n2. Computer Architecture, Microprocessors, and OS fundamentals\n3. Memory management, pointers, and RTOS concepts\n4. Zero arrears with strong academic background',
        rounds: 'Online Technical Exam -> Technical Interview 1 -> Technical Interview 2 -> HR Round'
      },
      'Accenture': {
        name: 'Accenture',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg',
        role: 'Advanced Associate Software Engineer (AASE)',
        ctc: '6.5 LPA',
        category: 'Mass / Service',
        minCgpa: 6.5,
        maxArrears: 1,
        depts: 'All',
        location: 'Pan India',
        requirements: '1. Cognitive and Technical assessment clearance\n2. Hands-on coding in C, C++, Java, or Python\n3. Critical thinking and abstract reasoning\n4. Good verbal communication and adaptability',
        rounds: 'Cognitive & Technical Assessment -> Coding Round -> Communication Assessment -> Interview'
      }
    };

    const p = presets[companyName];
    if (!p) return;

    const nameInput = document.getElementById('newDriveName');
    const logoInput = document.getElementById('newDriveLogo');
    const roleInput = document.getElementById('newDriveRole');
    const ctcInput = document.getElementById('newDriveCtc');
    const catSelect = document.getElementById('newDriveCategory');
    const minCgpaInput = document.getElementById('newDriveMinCgpa');
    const maxArrearsInput = document.getElementById('newDriveMaxArrears');
    const deptsInput = document.getElementById('newDriveDepts');
    const locationInput = document.getElementById('newDriveLocation');
    const reqsInput = document.getElementById('newDriveRequirements');
    const roundsInput = document.getElementById('newDriveRounds');

    if (nameInput) nameInput.value = p.name;
    if (logoInput) logoInput.value = p.logo;
    if (roleInput) roleInput.value = p.role;
    if (ctcInput) ctcInput.value = p.ctc;
    if (catSelect) catSelect.value = p.category;
    if (minCgpaInput) minCgpaInput.value = p.minCgpa;
    if (maxArrearsInput) maxArrearsInput.value = p.maxArrears;
    if (deptsInput) deptsInput.value = p.depts;
    if (locationInput) locationInput.value = p.location;
    if (reqsInput) reqsInput.value = p.requirements;
    if (roundsInput) roundsInput.value = p.rounds;

    const driveDateInput = document.getElementById('newDriveDate');
    const deadlineInput = document.getElementById('newDriveDeadline');
    if (driveDateInput && !driveDateInput.value) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      driveDateInput.value = d.toISOString().split('T')[0];
    }
    if (deadlineInput && !deadlineInput.value) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      deadlineInput.value = d.toISOString().split('T')[0];
    }
  },

  handlePostCompany() {
    const name = document.getElementById('newDriveName')?.value.trim();
    const role = document.getElementById('newDriveRole')?.value.trim();
    const ctc = document.getElementById('newDriveCtc')?.value.trim();
    const logo = document.getElementById('newDriveLogo')?.value.trim() || 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png';
    const category = document.getElementById('newDriveCategory')?.value || 'Product';
    const location = document.getElementById('newDriveLocation')?.value.trim() || 'Bangalore / Chennai';
    const driveDate = document.getElementById('newDriveDate')?.value;
    const deadline = document.getElementById('newDriveDeadline')?.value;
    const minCgpa = parseFloat(document.getElementById('newDriveMinCgpa')?.value) || 7.0;
    const maxArrears = parseInt(document.getElementById('newDriveMaxArrears')?.value, 10) || 0;
    const depts = (document.getElementById('newDriveDepts')?.value || 'CSE, IT, ECE').split(',').map(d => d.trim()).filter(Boolean);
    const description = document.getElementById('newDriveDesc')?.value.trim() || `Campus hiring drive announced for ${role} with compensation of ${ctc}.`;
    const requirements = document.getElementById('newDriveRequirements')?.value.trim();
    const rounds = document.getElementById('newDriveRounds')?.value.trim();

    if (!name || !role || !ctc || !driveDate || !deadline) {
      window.App.showToast('Please fill all mandatory company drive fields.', 'warning');
      return;
    }

    const created = window.ptsState.addCompany({
      name,
      role,
      ctc,
      logo,
      category,
      location,
      driveDate,
      deadline,
      minCgpa,
      maxArrears,
      allowedDepts: depts,
      description,
      requirements,
      rounds
    });

    window.App.showToast(`🎉 Campus drive for ${name} posted and broadcast to students!`, 'success');

    // Reset form
    document.getElementById('officerPostCompanyForm')?.reset();

    // Re-render views
    this.renderDrivesManagement();
    this.renderDashboardStats();
    if (window.StudentModule) {
      window.StudentModule.renderEligibilityChecker();
      window.StudentModule.renderDrivesList();
    }
  },

  renderDrivesManagement() {
    const container = document.getElementById('poDrivesList');
    const quickContainer = document.getElementById('poDrivesQuickList');
    const companies = window.ptsState.data.companies || [];
    const applications = window.ptsState.data.applications || [];

    // Filter by search if input present
    const searchTerm = (document.getElementById('poDrivesSearch')?.value || '').toLowerCase();
    const filtered = companies.filter(c => {
      if (!searchTerm) return true;
      return c.name.toLowerCase().includes(searchTerm) || c.role.toLowerCase().includes(searchTerm);
    });

    // 1. Populate main Drives tab container with full details and requirements
    if (container) {
      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="card" style="text-align:center; padding:2.5rem;">
            <i class="fas fa-building" style="font-size:2.5rem; color:var(--text-dim); margin-bottom:0.75rem;"></i>
            <h4 style="color:var(--text-main);">No Campus Drives Found</h4>
            <p style="color:var(--text-muted); font-size:0.85rem;">Use the form above to post upcoming visiting companies and their requirements.</p>
          </div>
        `;
      } else {
        container.innerHTML = filtered.map(comp => {
          const appCount = applications.filter(a => a.companyId === comp.id).length;
          const reqs = Array.isArray(comp.requirements) ? comp.requirements : [];
          const rounds = Array.isArray(comp.rounds) ? comp.rounds : ['Aptitude', 'Technical', 'HR'];

          return `
            <div class="card" style="margin-bottom:1.5rem; padding:1.5rem; border-color:rgba(255,255,255,0.08);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
                <div style="display:flex; gap:1rem; align-items:center;">
                  <div style="width:52px; height:52px; border-radius:var(--radius-md); background:#fff; padding:6px; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">
                    <img src="${comp.logo}" alt="${comp.name}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3061/3061341.png'">
                  </div>
                  <div>
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                      <h3 style="font-size:1.25rem; margin:0;">${comp.name}</h3>
                      <span class="badge badge-primary" style="font-size:0.72rem;">${comp.category}</span>
                      <span class="badge badge-success" style="font-size:0.72rem;">${comp.status}</span>
                    </div>
                    <div style="font-size:0.88rem; color:var(--text-muted); margin-top:0.25rem;">
                      ${comp.role} • <span style="color:var(--text-dim);"><i class="fas fa-map-marker-alt"></i> ${comp.location}</span>
                    </div>
                  </div>
                </div>

                <div style="display:flex; gap:1.25rem; align-items:center;">
                  <div style="text-align:right;">
                    <div style="font-family:var(--font-heading); font-size:1.5rem; font-weight:800; color:#10b981;">${comp.ctc}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">Package (CTC)</div>
                  </div>
                  <div style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.25); padding:0.5rem 1rem; border-radius:var(--radius-md); text-align:center;">
                    <div style="font-family:var(--font-heading); font-size:1.25rem; font-weight:800; color:var(--primary-light);">${appCount}</div>
                    <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase;">Applicants</div>
                  </div>
                </div>
              </div>

              <!-- Eligibility Rules & Schedule Bar -->
              <div style="background:var(--bg-card-hover); border:1px solid var(--border-subtle); padding:0.75rem 1rem; border-radius:var(--radius-sm); margin-bottom:1rem; display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; font-size:0.8rem;">
                <div><i class="far fa-calendar-alt" style="color:var(--primary-light);"></i> <strong>Drive Date:</strong> ${comp.driveDate}</div>
                <div><i class="far fa-clock" style="color:var(--warning);"></i> <strong>Deadline:</strong> ${comp.deadline}</div>
                <div><i class="fas fa-chart-line" style="color:var(--success);"></i> <strong>Min CGPA:</strong> ${comp.minCgpa}</div>
                <div><i class="fas fa-exclamation-circle" style="color:var(--danger);"></i> <strong>Max Backlogs:</strong> ${comp.maxArrears}</div>
                <div><i class="fas fa-user-graduate" style="color:#60a5fa;"></i> <strong>Depts:</strong> ${(comp.allowedDepts || []).join(', ')}</div>
              </div>

              <!-- Company Description -->
              <p style="font-size:0.85rem; line-height:1.45; color:var(--text-muted); margin-bottom:1rem;">
                ${comp.description}
              </p>

              <!-- Company Requirements & Skills Needed -->
              <div style="margin-bottom:1rem;">
                <div style="font-size:0.78rem; text-transform:uppercase; font-weight:700; color:var(--text-dim); margin-bottom:0.4rem;">
                  <i class="fas fa-check-circle" style="color:#10b981;"></i> Required Skills & Candidate Criteria:
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  ${reqs.map(r => `
                    <div style="font-size:0.82rem; color:var(--text-main); display:flex; align-items:flex-start; gap:0.4rem;">
                      <span style="color:#10b981; margin-top:2px;">•</span> <span>${r}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Selection Rounds -->
              <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--text-dim); margin-bottom:0.35rem;">
                  <i class="fas fa-stream" style="color:var(--primary-light);"></i> Selection Pipeline:
                </div>
                <div style="font-size:0.8rem; color:var(--text-muted);">
                  ${rounds.join(' <span style="color:var(--primary-light); margin:0 4px;">→</span> ')}
                </div>
              </div>

              <!-- Actions Bar -->
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-subtle); padding-top:0.9rem; flex-wrap:wrap; gap:0.75rem;">
                <div style="display:flex; gap:0.5rem;">
                  <button class="btn btn-outline btn-sm" onclick="OfficerModule.openCompanyApplicantsModal('${comp.id}')">
                    <i class="fas fa-users"></i> View Registered Applicants (${appCount})
                  </button>
                  <button class="btn btn-outline btn-sm" onclick="OfficerModule.broadcastDriveReminder('${comp.id}')">
                    <i class="fas fa-bell"></i> Send Student Reminder
                  </button>
                </div>
                <button class="btn btn-outline btn-sm" style="color:var(--danger); border-color:var(--danger);" onclick="OfficerModule.deleteDrive('${comp.id}')">
                  <i class="fas fa-trash"></i> Remove Drive
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Populate Overview tab quick list
    if (quickContainer) {
      quickContainer.innerHTML = companies.slice(0, 4).map(c => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <img src="${c.logo}" style="width:26px; height:26px; object-fit:contain; border-radius:4px;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3061/3061341.png'">
            <div>
              <strong style="font-size:0.85rem;">${c.name}</strong>
              <div style="font-size:0.72rem; color:var(--text-muted);">${c.role} • ${c.ctc}</div>
            </div>
          </div>
          <span class="badge badge-primary" style="font-size:0.7rem;">${c.driveDate}</span>
        </div>
      `).join('');
    }
  },

  filterDrives() {
    this.renderDrivesManagement();
  },

  openCompanyApplicantsModal(companyId) {
    const comp = (window.ptsState.data.companies || []).find(c => c.id === companyId);
    if (!comp) return;

    const modal = document.getElementById('companyApplicantsModal');
    const titleEl = document.getElementById('compApplicantsModalTitle');
    const metaEl = document.getElementById('compApplicantsModalMeta');
    const tbody = document.getElementById('compApplicantsTableBody');

    if (titleEl) titleEl.textContent = `Registered Applicants: ${comp.name}`;
    if (metaEl) metaEl.textContent = `${comp.role} • CTC: ${comp.ctc} • Drive Date: ${comp.driveDate} • Cutoff: CGPA ≥ ${comp.minCgpa}`;

    const apps = (window.ptsState.data.applications || []).filter(a => a.companyId === companyId);

    if (tbody) {
      if (apps.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
              No student applications registered yet for ${comp.name}. Eligible students will appear here once applied.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = apps.map(app => {
          const student = (window.ptsState.data.students || []).find(s => s.id === app.studentId);
          const resumeUrl = student?.resumeUrl || (student?.resumeUploaded ? `https://qtsothmldarlqybjyfwb.supabase.co/storage/v1/object/public/resumes/${student.id}/${student.resumeName || 'Sashti_Resume_2026.pdf'}` : null);

          return `
            <tr>
              <td>
                <strong>${app.studentName}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${student?.rollNo || app.studentId} • ${student?.college || 'College of Engg'}</div>
              </td>
              <td>${app.studentDept}</td>
              <td><strong>${app.studentCgpa || student?.cgpa || '8.00'}</strong></td>
              <td>
                ${resumeUrl 
                  ? `<a href="${resumeUrl}" target="_blank" class="btn btn-outline btn-sm" style="font-size:0.75rem; padding:2px 8px;"><i class="fas fa-file-pdf" style="color:#ef4444;"></i> Resume</a>`
                  : `<span style="font-size:0.75rem; color:var(--text-dim);">Profile Only</span>`}
              </td>
              <td><span class="badge badge-primary">${app.status}</span></td>
              <td>
                <select class="form-control" style="padding:0.25rem 0.5rem; font-size:0.78rem;" onchange="OfficerModule.updateCandidateStatus('${app.id}', this.value); OfficerModule.openCompanyApplicantsModal('${companyId}');">
                  <option value="Applied" ${app.status==='Applied'?'selected':''}>Applied</option>
                  <option value="Aptitude Cleared" ${app.status==='Aptitude Cleared'?'selected':''}>Aptitude Cleared</option>
                  <option value="Shortlisted" ${app.status==='Shortlisted'?'selected':''}>Shortlisted</option>
                  <option value="Technical Round" ${app.status==='Technical Round'?'selected':''}>Technical Round</option>
                  <option value="HR Round" ${app.status==='HR Round'?'selected':''}>HR Round</option>
                  <option value="Selected" ${app.status==='Selected'?'selected':''}>Selected (Offer)</option>
                  <option value="Rejected" ${app.status==='Rejected'?'selected':''}>Rejected</option>
                </select>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    if (modal) modal.classList.add('active');
  },

  broadcastDriveReminder(companyId) {
    const comp = (window.ptsState.data.companies || []).find(c => c.id === companyId);
    if (!comp) return;

    window.ptsState.addNotification(
      `⏰ Reminder: ${comp.name} Drive Approaching`,
      `Registration deadline for ${comp.name} (${comp.role}, ${comp.ctc}) is ${comp.deadline}. Make sure your profile and resume are up to date!`,
      'info'
    );
    window.App.showToast(`Drive reminder for ${comp.name} published to students!`, 'success');
  },

  deleteDrive(companyId) {
    const comp = (window.ptsState.data.companies || []).find(c => c.id === companyId);
    if (!comp) return;

    if (!confirm(`Are you sure you want to remove the campus recruitment drive for "${comp.name}"?`)) {
      return;
    }

    window.ptsState.data.companies = (window.ptsState.data.companies || []).filter(c => c.id !== companyId);
    window.ptsState.saveState();
    window.App.showToast(`Removed drive for ${comp.name}.`, 'info');

    this.renderDrivesManagement();
    this.renderDashboardStats();
    if (window.StudentModule) {
      window.StudentModule.renderEligibilityChecker();
      window.StudentModule.renderDrivesList();
    }
  },

  // ==========================================
  // PRACTICE QUESTIONS & STUDENT COMPLETION STATUS
  // ==========================================
  renderQuestionsList() {
    const tbody = document.getElementById('poQuestionsTableBody');
    if (!tbody) return;

    const questions = window.ptsState.data.questions || [];
    const students = window.ptsState.data.students || [];

    // Filter controls
    const searchTerm = (document.getElementById('poQuestionSearch')?.value || '').toLowerCase();
    const typeFilter = document.getElementById('poQuestionTypeFilter')?.value || 'All';
    const diffFilter = document.getElementById('poQuestionDiffFilter')?.value || 'All';

    const filtered = questions.filter(q => {
      if (typeFilter !== 'All') {
        if (typeFilter === 'leetcode' && q.type !== 'leetcode') return false;
        if (typeFilter === 'aptitude' && q.type === 'leetcode') return false;
      }
      if (diffFilter !== 'All' && q.difficulty !== diffFilter) return false;
      if (searchTerm) {
        const title = (q.title || '').toLowerCase();
        const content = (q.question || '').toLowerCase();
        const category = (q.category || '').toLowerCase();
        const tags = (q.tags || []).join(' ').toLowerCase();
        return title.includes(searchTerm) || content.includes(searchTerm) || category.includes(searchTerm) || tags.includes(searchTerm);
      }
      return true;
    });

    // Update stat cards
    const leetcodeCount = questions.filter(q => q.type === 'leetcode').length;
    const aptitudeCount = questions.filter(q => q.type !== 'leetcode').length;
    let totalCompletions = 0;
    questions.forEach(q => {
      totalCompletions += Array.isArray(q.completedBy) ? q.completedBy.length : 0;
    });

    const statTotal = document.getElementById('poStat_totalQuestions');
    const statLeet = document.getElementById('poStat_leetcodeCount');
    const statApt = document.getElementById('poStat_aptitudeCount');
    const statComp = document.getElementById('poStat_totalCompletions');

    if (statTotal) statTotal.textContent = questions.length;
    if (statLeet) statLeet.textContent = leetcodeCount;
    if (statApt) statApt.textContent = aptitudeCount;
    if (statComp) statComp.textContent = totalCompletions;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">
            No practice questions found matching your filter criteria. Use "+ Post LeetCode Problem" or "+ Post Aptitude MCQ" to add questions.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(q => {
      const stats = window.ptsState.getQuestionCompletionStats(q.id);
      const isLeetcode = q.type === 'leetcode';
      const diffColor = q.difficulty === 'Easy' ? '#10b981' : (q.difficulty === 'Hard' ? '#ef4444' : '#f59e0b');
      const diffBadgeClass = q.difficulty === 'Easy' ? 'badge-success' : (q.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning');

      return `
        <tr>
          <td>
            <div style="font-weight:700; font-size:0.92rem; color:var(--text-main); margin-bottom:0.2rem;">
              ${q.title || q.id}
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.35; max-width:400px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${q.question}
            </div>
            ${(q.tags && q.tags.length > 0) ? `
              <div style="display:flex; gap:0.25rem; margin-top:0.35rem; flex-wrap:wrap;">
                ${q.tags.map(t => `<span class="badge" style="font-size:0.65rem; background:rgba(99,102,241,0.1); color:#818cf8;">${t}</span>`).join('')}
              </div>
            ` : ''}
          </td>
          <td>
            <span class="badge ${isLeetcode ? 'badge-primary' : 'badge-info'}" style="font-size:0.74rem;">
              ${isLeetcode ? '<i class="fas fa-code"></i> LeetCode' : '<i class="fas fa-calculator"></i> ' + (q.category || 'Aptitude')}
            </span>
          </td>
          <td>
            <span class="badge ${diffBadgeClass}" style="font-size:0.72rem;">${q.difficulty || 'Medium'}</span>
          </td>
          <td>
            <!-- Student Completion Progress Bar & Details Button -->
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
              <div class="progress-track" style="width:70px; height:6px;">
                <div class="progress-fill" style="width:${stats.percentage}%; background:${stats.percentage >= 50 ? '#10b981' : '#f59e0b'};"></div>
              </div>
              <strong style="font-size:0.8rem; color:${stats.percentage >= 50 ? '#10b981' : 'var(--text-main)'};">
                ${stats.completedCount} / ${stats.totalStudents} Done (${stats.percentage}%)
              </strong>
            </div>
            <button class="btn btn-outline btn-sm" style="font-size:0.74rem; padding:2px 8px;" onclick="OfficerModule.openStudentStatusModal('${q.id}')">
              <i class="fas fa-users"></i> View Students (${stats.completedCount}/${stats.totalStudents})
            </button>
          </td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:0.4rem;">
              ${isLeetcode ? `
                <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem;" onclick="TestsModule.openCodingSandbox('${q.id}')" title="Test Sandbox">
                  <i class="fas fa-terminal"></i>
                </button>
              ` : ''}
              <button class="btn btn-outline btn-sm" style="padding:4px 8px; font-size:0.75rem; color:var(--danger); border-color:var(--danger);" onclick="OfficerModule.deleteQuestion('${q.id}')" title="Delete Question">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  filterQuestions() {
    this.renderQuestionsList();
  },

  openPostQuestionModal(type = 'leetcode') {
    const modal = document.getElementById('postQuestionModal');
    if (!modal) return;
    this.switchPostQuestionType(type);
    modal.classList.add('active');
  },

  closePostQuestionModal() {
    const modal = document.getElementById('postQuestionModal');
    if (modal) modal.classList.remove('active');
  },

  switchPostQuestionType(type) {
    this.currentPostQuestionType = type;
    const btnLeet = document.getElementById('togglePostLeetcodeBtn');
    const btnApt = document.getElementById('togglePostAptitudeBtn');
    const formLeet = document.getElementById('formPostLeetcode');
    const formApt = document.getElementById('formPostAptitude');
    const titleEl = document.getElementById('postQuestionModalTitle');

    if (type === 'leetcode') {
      if (btnLeet) { btnLeet.className = 'btn btn-sm btn-primary'; }
      if (btnApt) { btnApt.className = 'btn btn-sm btn-outline'; }
      if (formLeet) formLeet.style.display = 'block';
      if (formApt) formApt.style.display = 'none';
      if (titleEl) titleEl.innerHTML = '<i class="fas fa-code" style="color:var(--primary-light);"></i> Post LeetCode / Coding Practice Problem';
    } else {
      if (btnLeet) { btnLeet.className = 'btn btn-sm btn-outline'; }
      if (btnApt) { btnApt.className = 'btn btn-sm btn-primary'; }
      if (formLeet) formLeet.style.display = 'none';
      if (formApt) formApt.style.display = 'block';
      if (titleEl) titleEl.innerHTML = '<i class="fas fa-calculator" style="color:var(--primary-light);"></i> Post Aptitude / Technical MCQ Practice Question';
    }
  },

  handlePostLeetcodeQuestion() {
    const title = document.getElementById('lcTitle')?.value.trim();
    const difficulty = document.getElementById('lcDifficulty')?.value || 'Medium';
    const tags = (document.getElementById('lcTags')?.value || 'Algorithms').split(',').map(t => t.trim()).filter(Boolean);
    const question = document.getElementById('lcQuestion')?.value.trim();
    const sampleInput = document.getElementById('lcSampleInput')?.value.trim();
    const sampleOutput = document.getElementById('lcSampleOutput')?.value.trim();
    const constraints = document.getElementById('lcConstraints')?.value.trim();
    const starterCode = document.getElementById('lcStarterCode')?.value;

    if (!title || !question || !sampleInput || !sampleOutput) {
      window.App.showToast('Please fill all required problem fields.', 'warning');
      return;
    }

    const created = window.ptsState.addQuestion({
      type: 'leetcode',
      category: 'LeetCode / Coding',
      title,
      difficulty,
      tags,
      question,
      sampleInput,
      sampleOutput,
      inputFormat: sampleInput,
      outputFormat: sampleOutput,
      constraints,
      starterCode: starterCode || `// Solution for ${title}\nfunction solve(input) {\n  \n}`,
      explanation: `Optimal solution for ${title} using ${tags[0] || 'algorithmic'} approach.`
    });

    window.App.showToast(`LeetCode problem "${title}" posted for students!`, 'success');
    document.getElementById('formPostLeetcode')?.reset();
    this.closePostQuestionModal();

    this.renderQuestionsList();
    if (window.TestsModule) {
      window.TestsModule.renderCodingArena();
    }
  },

  handlePostAptitudeQuestion() {
    const category = document.getElementById('aptCategory')?.value || 'Quantitative';
    const difficulty = document.getElementById('aptDifficulty')?.value || 'Medium';
    const title = document.getElementById('aptTitle')?.value.trim() || 'Aptitude Practice';
    const question = document.getElementById('aptQuestion')?.value.trim();
    const optA = document.getElementById('aptOptA')?.value.trim();
    const optB = document.getElementById('aptOptB')?.value.trim();
    const optC = document.getElementById('aptOptC')?.value.trim();
    const optD = document.getElementById('aptOptD')?.value.trim();
    const correct = parseInt(document.getElementById('aptCorrect')?.value, 10) || 0;
    const explanation = document.getElementById('aptExplanation')?.value.trim() || 'Correct answer derived from standard formula.';

    if (!question || !optA || !optB || !optC || !optD) {
      window.App.showToast('Please fill the question and all 4 options.', 'warning');
      return;
    }

    const created = window.ptsState.addQuestion({
      type: 'aptitude',
      category,
      difficulty,
      title,
      question,
      options: [optA, optB, optC, optD],
      correct,
      explanation
    });

    window.App.showToast(`Aptitude question "${title}" posted for students!`, 'success');
    document.getElementById('formPostAptitude')?.reset();
    this.closePostQuestionModal();

    this.renderQuestionsList();
    if (window.TestsModule) {
      window.TestsModule.renderCategoryCards();
    }
  },

  openStudentStatusModal(questionId) {
    this.activeStatusQuestionId = questionId;
    const q = (window.ptsState.data.questions || []).find(item => item.id === questionId);
    if (!q) return;

    const modal = document.getElementById('questionStudentStatusModal');
    const titleEl = document.getElementById('statusModalQuestionTitle');
    const metaEl = document.getElementById('statusModalQuestionMeta');
    const rateTextEl = document.getElementById('statusModalRateText');
    const progressBarEl = document.getElementById('statusModalProgressBar');
    const tbody = document.getElementById('statusModalStudentsTableBody');

    const stats = window.ptsState.getQuestionCompletionStats(questionId);

    if (titleEl) titleEl.textContent = `Student Status: ${q.title || q.id}`;
    if (metaEl) metaEl.textContent = `Type: ${q.type === 'leetcode' ? 'LeetCode / Coding' : 'Aptitude MCQ'} • Category: ${q.category} • Difficulty: ${q.difficulty}`;
    if (rateTextEl) rateTextEl.textContent = `${stats.completedCount} / ${stats.totalStudents} Completed (${stats.percentage}%)`;
    if (progressBarEl) progressBarEl.style.width = `${stats.percentage}%`;

    if (tbody) {
      const allRows = [
        ...stats.completedStudents.map(item => ({
          student: item.student,
          isCompleted: true,
          date: item.record.completedAt || 'Recently',
          score: item.record.score !== undefined ? `${item.record.score}%` : '100%',
          code: item.record.code || ''
        })),
        ...stats.pendingStudents.map(st => ({
          student: st,
          isCompleted: false,
          date: '—',
          score: '—',
          code: ''
        }))
      ];

      tbody.innerHTML = allRows.map(row => {
        const st = row.student;
        return `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem;">
                  ${st.name ? st.name.charAt(0) : 'S'}
                </div>
                <div>
                  <strong>${st.name}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${st.rollNo}</div>
                </div>
              </div>
            </td>
            <td>${st.department || 'CSE'}</td>
            <td><strong>${st.cgpa ? st.cgpa.toFixed(2) : '8.00'}</strong></td>
            <td>
              ${row.isCompleted 
                ? `<span class="badge badge-success" style="font-size:0.75rem;"><i class="fas fa-check-circle"></i> Completed</span>`
                : `<span class="badge badge-warning" style="font-size:0.75rem;"><i class="fas fa-clock"></i> Not Attempted</span>`}
            </td>
            <td><span style="font-size:0.8rem; color:var(--text-muted);">${row.date}</span></td>
            <td>
              ${row.isCompleted 
                ? (row.code 
                    ? `<button class="btn btn-outline btn-sm" style="font-size:0.72rem; padding:2px 8px;" onclick="OfficerModule.viewStudentCode('${st.name}', '${encodeURIComponent(row.code)}')"><i class="fas fa-code"></i> View Code</button>`
                    : `<span class="badge badge-primary" style="font-size:0.72rem;">Score: ${row.score}</span>`)
                : `<span style="font-size:0.75rem; color:var(--text-dim);">Pending</span>`}
            </td>
          </tr>
        `;
      }).join('');
    }

    if (modal) modal.classList.add('active');
  },

  viewStudentCode(studentName, encodedCode) {
    const code = decodeURIComponent(encodedCode || '');
    if (!code) {
      window.App.showToast('No code submission recorded for this student.', 'info');
      return;
    }
    const modal = document.getElementById('codingSandboxModal');
    if (modal) {
      const titleEl = document.getElementById('sandboxProblemTitle');
      const editorEl = document.getElementById('sandboxCodeEditor');
      const outputEl = document.getElementById('sandboxOutputText');
      if (titleEl) titleEl.textContent = `Student Solution: ${studentName}`;
      if (editorEl) editorEl.value = code;
      if (outputEl) outputEl.innerHTML = `<span style="color:#10b981;">Reviewing submitted code by ${studentName}.</span>`;
      modal.classList.add('active');
      return;
    }
    window.App.showToast(`Solution recorded for ${studentName}`, 'success');
  },

  deleteQuestion(questionId) {
    const q = (window.ptsState.data.questions || []).find(item => item.id === questionId);
    if (!q) return;

    if (!confirm(`Are you sure you want to delete the question "${q.title || q.id}"?`)) {
      return;
    }

    window.ptsState.deleteQuestion(questionId);
    window.App.showToast(`Question "${q.title || q.id}" deleted.`, 'info');

    this.renderQuestionsList();
    if (window.TestsModule) {
      window.TestsModule.renderCategoryCards();
      window.TestsModule.renderCodingArena();
    }
  },

  renderApplicationsList() {
    const tableBody = document.getElementById('poApplicationsTableBody');
    if (!tableBody) return;

    const apps = window.ptsState.data.applications || [];

    tableBody.innerHTML = apps.map(app => {
      return `
        <tr>
          <td>
            <strong>${app.studentName}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${app.studentDept} | CGPA: ${app.studentCgpa}</div>
          </td>
          <td>
            <strong>${app.companyName}</strong>
            <div style="font-size:0.75rem; color:var(--text-muted);">${app.role}</div>
          </td>
          <td>${app.appliedDate}</td>
          <td><span class="badge badge-primary">${app.status}</span></td>
          <td>
            <select class="form-control" style="padding:0.3rem 0.5rem; font-size:0.78rem;" onchange="OfficerModule.updateCandidateStatus('${app.id}', this.value)">
              <option value="Applied" ${app.status==='Applied'?'selected':''}>Applied</option>
              <option value="Aptitude Cleared" ${app.status==='Aptitude Cleared'?'selected':''}>Aptitude Cleared</option>
              <option value="Shortlisted" ${app.status==='Shortlisted'?'selected':''}>Shortlisted</option>
              <option value="Technical Round" ${app.status==='Technical Round'?'selected':''}>Technical Round</option>
              <option value="HR Round" ${app.status==='HR Round'?'selected':''}>HR Round</option>
              <option value="Selected" ${app.status==='Selected'?'selected':''}>Selected (Offer)</option>
              <option value="Rejected" ${app.status==='Rejected'?'selected':''}>Rejected</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  },

  updateCandidateStatus(appId, newStatus) {
    const stepMap = {
      'Applied': 1,
      'Aptitude Cleared': 2,
      'Shortlisted': 2,
      'Technical Round': 3,
      'HR Round': 4,
      'Selected': 5,
      'Rejected': 2
    };
    const roundMap = {
      'Applied': 'Online Assessment Pending',
      'Aptitude Cleared': 'Technical Interview Pending',
      'Shortlisted': 'Shortlisted for Next Round',
      'Technical Round': 'Technical Interview',
      'HR Round': 'HR / Managerial Round',
      'Selected': 'Offer Letter Released',
      'Rejected': 'Did not clear current cut-off'
    };

    window.ptsState.updateApplicationStatus(appId, newStatus, roundMap[newStatus], stepMap[newStatus]);
    window.App.showToast(`Candidate status updated to '${newStatus}'!`, 'success');
    this.renderApplicationsList();
    this.renderDashboardStats();
    this.renderStudentDirectory();
    if (window.StudentModule) window.StudentModule.renderApplicationTracker();
  },

  handleScheduleDrive() {
    this.handlePostCompany();
  },

  handleBroadcastNotice() {
    const title = document.getElementById('broadcastTitle').value.trim();
    const msg = document.getElementById('broadcastMsg').value.trim();
    if (!title || !msg) {
      window.App.showToast('Please enter both title and message.', 'warning');
      return;
    }

    window.ptsState.addNotification(title, msg, 'info');
    window.App.showToast('Notification published to all students!', 'success');
    document.getElementById('broadcastTitle').value = '';
    document.getElementById('broadcastMsg').value = '';
  },

  exportStudentsToCsv() {
    const students = window.ptsState.data.students || [];
    let csv = 'Roll No,Name,College,Academic Status,Pursuing Year / Degree,Department,CGPA,Arrears,Proficient Languages,Internship Company,Internship Topic,Hackathon,Readiness Score,Placement Status,Placed Company\n';
    students.forEach(s => {
      const langs = (s.wellVersedLanguages || []).join('; ');
      const internComp = s.internship?.hasDone ? s.internship.company : 'None';
      const internTop = s.internship?.hasDone ? s.internship.topic : 'None';
      const hack = (s.hackathons && s.hackathons.length > 0) ? `${s.hackathons[0].name} (${s.hackathons[0].achievement || 'Finalist'})` : 'None';
      const eduLevel = s.educationStatus === 'graduated' 
        ? `Graduated (${s.completedDegree || 'Degree'} - ${s.graduationYear || '2025'})`
        : `Currently Studying (${s.pursuingYear || '4th Year'} ${s.degree || 'B.E.'})`;

      csv += `"${s.rollNo}","${s.name}","${s.college || 'Engineering College'}","${s.educationStatus || 'studying'}","${eduLevel}","${s.department}",${s.cgpa},${s.arrears},"${langs}","${internComp}","${internTop}","${hack}","${s.readiness}%","${s.status}","${s.placedCompany || 'N/A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Placement_Students_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.App.showToast('Student report downloaded as CSV!', 'success');
  },

  // ==========================================
  // Placement Officer Mock Interview Management
  // ==========================================
  renderMockInterviewRequests() {
    const requests = window.ptsState.data.interviewRequests || [];
    const pendingReqs = requests.filter(r => r.status === 'Pending');
    const scheduledReqs = requests.filter(r => r.status === 'Scheduled');
    const completedReqs = requests.filter(r => r.status === 'Completed');

    // Update pending badge in officer tab
    const badge = document.getElementById('poPendingInterviewsBadge');
    if (badge) {
      badge.textContent = pendingReqs.length;
      badge.style.display = pendingReqs.length > 0 ? 'inline-block' : 'none';
    }

    // Update summary counts
    const countPendingEl = document.getElementById('poInterviewStat_pending');
    const countScheduledEl = document.getElementById('poInterviewStat_scheduled');
    const countCompletedEl = document.getElementById('poInterviewStat_completed');
    if (countPendingEl) countPendingEl.textContent = pendingReqs.length;
    if (countScheduledEl) countScheduledEl.textContent = scheduledReqs.length;
    if (countCompletedEl) countCompletedEl.textContent = completedReqs.length;

    // Render Pending Requests List
    const pendingContainer = document.getElementById('poPendingInterviewList');
    if (pendingContainer) {
      if (pendingReqs.length === 0) {
        pendingContainer.innerHTML = `
          <div style="text-align:center; padding:2.5rem 1rem; color:var(--text-muted);">
            <i class="fas fa-check-circle" style="font-size:2.5rem; color:var(--success); margin-bottom:0.75rem; opacity:0.8;"></i>
            <div style="font-weight:600; font-size:1rem; color:var(--text-main);">All Mock Interview Requests Handled!</div>
            <p style="font-size:0.85rem; margin-top:0.25rem;">No pending 1-on-1 interview requests from students right now.</p>
          </div>
        `;
      } else {
        pendingContainer.innerHTML = pendingReqs.map(req => `
          <div class="card" style="margin-bottom:1rem; border-left:4px solid var(--warning); background:var(--bg-surface);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.75rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                  <h4 style="margin:0; font-size:1.05rem; font-weight:700; color:var(--text-main);">${req.studentName}</h4>
                  <span class="badge badge-info">${req.studentRoll || 'Student'}</span>
                  <span class="badge badge-purple">${req.studentDept || 'CSE'}</span>
                  <span class="badge badge-success">CGPA: ${req.studentCgpa || '8.0'}</span>
                </div>
                <div style="font-size:0.83rem; color:var(--text-muted); margin-top:0.25rem;">
                  <i class="fas fa-envelope"></i> ${req.studentEmail} &nbsp;•&nbsp; 
                  <i class="fas fa-calendar-alt"></i> Requested Date: <strong>${req.preferredDate || 'Flexible'}</strong> (${req.preferredTimeSlot || 'Anytime'})
                </div>
              </div>
              <span class="badge badge-warning" style="font-size:0.8rem; padding:0.35rem 0.65rem;">
                <i class="fas fa-clock"></i> Pending Review
              </span>
            </div>

            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.75rem; margin-bottom:0.85rem;">
              <div style="font-size:0.82rem; font-weight:600; color:var(--primary-light); margin-bottom:0.2rem;">
                <i class="fas fa-bullseye"></i> Focus Domain / Round: <strong>${req.domain}</strong>
                ${req.targetCompany ? `&nbsp;•&nbsp; Target Company: <strong>${req.targetCompany}</strong>` : ''}
              </div>
              <div style="font-size:0.85rem; color:var(--text-main); line-height:1.45;">
                ${req.notes ? `"${req.notes}"` : 'Student requested general technical interview preparation and resume feedback.'}
              </div>
            </div>

            <div style="display:flex; gap:0.5rem; justify-content:flex-end; flex-wrap:wrap;">
              <button class="btn btn-danger btn-sm" onclick="OfficerModule.handleDeclineInterviewRequest('${req.id}')">
                <i class="fas fa-times"></i> Decline
              </button>
              <button class="btn btn-success btn-sm" onclick="OfficerModule.openScheduleInterviewModal('${req.id}')">
                <i class="fas fa-calendar-check"></i> Accept & Schedule Interview
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    // Render Scheduled Sessions List
    const scheduledContainer = document.getElementById('poScheduledInterviewList');
    if (scheduledContainer) {
      if (scheduledReqs.length === 0) {
        scheduledContainer.innerHTML = `
          <div style="text-align:center; padding:2rem 1rem; color:var(--text-muted); font-size:0.9rem;">
            No upcoming scheduled interviews. Accept a student request above to schedule a session.
          </div>
        `;
      } else {
        scheduledContainer.innerHTML = scheduledReqs.map(req => `
          <div class="card" style="margin-bottom:1rem; border-left:4px solid var(--primary); background:var(--bg-surface);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.5rem;">
              <div>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <h4 style="margin:0; font-size:1.05rem; font-weight:700;">${req.studentName}</h4>
                  <span class="badge badge-info">${req.studentRoll}</span>
                  <span class="badge badge-primary">${req.domain}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
                  Scheduled by: <strong>${req.assignedOfficerName || 'Placement Officer'}</strong>
                </div>
              </div>
              <span class="badge badge-success" style="font-size:0.8rem; padding:0.35rem 0.65rem;">
                <i class="fas fa-calendar-alt"></i> ${req.scheduledDate} at ${req.scheduledTime}
              </span>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem; background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.75rem; margin-bottom:0.75rem;">
              <div>
                <span style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Mode:</span>
                <div style="margin-top:0.2rem; font-weight:600;">
                  ${req.mode === 'Online' 
                    ? `<span style="color:#38bdf8;"><i class="fas fa-video"></i> Online (Google Meet)</span>` 
                    : `<span style="color:var(--success);"><i class="fas fa-building"></i> Offline (${req.venue || 'Placement Cell'})</span>`}
                </div>
              </div>

              ${req.mode === 'Online' && req.meetingLink ? `
              <div>
                <span style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Student Google Meet Link:</span>
                <div style="margin-top:0.2rem; display:flex; align-items:center; gap:0.5rem;">
                  <a href="${req.meetingLink}" target="_blank" class="btn btn-outline btn-xs" style="color:#38bdf8; border-color:#38bdf8;">
                    <i class="fas fa-external-link-alt"></i> Join Meet
                  </a>
                  <span style="font-size:0.78rem; color:var(--text-muted); font-family:monospace; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${req.meetingLink}</span>
                </div>
              </div>
              ` : ''}

              <div>
                <span style="font-size:0.78rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Officer Remarks:</span>
                <div style="margin-top:0.2rem; font-size:0.85rem; color:var(--text-main);">
                  ${req.officerNotes || 'Standard interview session guidelines.'}
                </div>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
              <button class="btn btn-success btn-sm" onclick="OfficerModule.openOfficerFeedbackModal('${req.id}')" style="font-weight:700;">
                <i class="fas fa-edit"></i> Evaluate Student & Send Feedback
              </button>
            </div>
          </div>
        `).join('');
      }
    }

    // Render Delivered Evaluations List
    const deliveredContainer = document.getElementById('poDeliveredEvaluationsList');
    if (deliveredContainer) {
      const deliveredFeedbacks = window.ptsState.data.interviewFeedbacks || [];
      if (deliveredFeedbacks.length === 0) {
        deliveredContainer.innerHTML = `
          <div style="text-align:center; padding:1.5rem 1rem; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-subtle); font-size:0.85rem;">
            No interview evaluations sent yet. Use "+ Evaluate Student & Send Feedback" above!
          </div>
        `;
      } else {
        deliveredContainer.innerHTML = deliveredFeedbacks.map(fb => {
          const r = fb.ratings || { technical: 8, problemSolving: 8, communication: 8, professionalism: 8, overallScore: 80 };
          return `
            <div class="card" style="margin-bottom:0.85rem; border-left:4px solid var(--success); background:var(--bg-surface); padding:0.9rem 1rem;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem;">
                <div>
                  <strong style="font-size:0.95rem; color:var(--text-main);">${fb.studentName}</strong>
                  <span class="badge badge-info" style="font-size:0.7rem; margin-left:0.35rem;">${fb.studentDept}</span>
                  <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
                    Round: <strong>${fb.domain}</strong> • ${fb.sessionDate}
                  </div>
                </div>
                <span class="badge badge-primary" style="font-size:0.75rem; font-weight:700;">Score: ${r.overallScore}%</span>
              </div>
              <div style="font-size:0.82rem; background:rgba(99,102,241,0.06); border-radius:var(--radius-sm); padding:0.4rem 0.6rem; margin-bottom:0.4rem;">
                <strong>Verdict:</strong> ${fb.verdict}
              </div>
              <div style="font-size:0.8rem; color:var(--text-main); line-height:1.35;">
                <span style="color:var(--success); font-weight:600;"><i class="fas fa-check"></i> Strengths:</span> ${fb.strengths}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Render Student Reviews on Officer Interviews
    const stuFbContainer = document.getElementById('poStudentFeedbackList');
    if (stuFbContainer) {
      const studentReviews = window.ptsState.data.studentOfficerFeedbacks || [];
      if (studentReviews.length === 0) {
        stuFbContainer.innerHTML = `
          <div style="text-align:center; padding:1.5rem 1rem; color:var(--text-muted); background:var(--bg-surface); border-radius:var(--radius-sm); border:1px solid var(--border-subtle); font-size:0.85rem;">
            No student ratings submitted yet. Students can review mock interviews from their portal!
          </div>
        `;
      } else {
        stuFbContainer.innerHTML = studentReviews.map(rev => `
          <div class="card" style="margin-bottom:0.85rem; border-left:4px solid #fbbf24; background:var(--bg-surface); padding:0.9rem 1rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.35rem;">
              <div>
                <strong style="font-size:0.92rem; color:var(--text-main);">${rev.studentName}</strong>
                <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
                  Session: <strong>${rev.sessionDomain}</strong>
                </div>
              </div>
              <span style="color:#fbbf24; font-size:0.85rem;">
                ${'⭐'.repeat(rev.ratings?.overallExperience || 5)}
              </span>
            </div>
            <div style="font-size:0.82rem; color:var(--text-main); line-height:1.4; font-style:italic; background:rgba(255,255,255,0.02); border-radius:var(--radius-sm); padding:0.4rem 0.6rem;">
              "${rev.comments}"
            </div>
            <div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.35rem;">
              Identified weaknesses: <strong>${rev.identifiedWeaknesses}</strong> • Recommendation: <strong>${rev.wouldRecommend}</strong>
            </div>
          </div>
        `).join('');
      }
    }
  },

  openScheduleInterviewModal(requestId) {
    const req = (window.ptsState.data.interviewRequests || []).find(r => r.id === requestId);
    if (!req) return;

    this.activeSchedulingRequestId = requestId;

    const modal = document.getElementById('scheduleInterviewModal');
    if (!modal) return;

    document.getElementById('schedModal_studentName').textContent = req.studentName;
    document.getElementById('schedModal_details').textContent = `${req.studentRoll} • ${req.studentDept} • CGPA: ${req.studentCgpa} • Target: ${req.domain} (${req.targetCompany || 'General'})`;
    document.getElementById('schedModal_studentNotes').textContent = req.notes ? `"${req.notes}"` : 'No additional student notes.';

    // Default scheduled date to preferred date or tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defDate = req.preferredDate || tomorrow.toISOString().split('T')[0];
    document.getElementById('schedInterviewDate').value = defDate;
    document.getElementById('schedInterviewTime').value = '10:30';

    // Auto-generate Google Meet Link
    this.autoGenerateGMeetLink(req.studentName);

    // Setup mode change toggle
    const modeOnline = document.getElementById('schedModeOnline');
    const modeOffline = document.getElementById('schedModeOffline');
    const onlineWrapper = document.getElementById('schedOnlineWrapper');
    const offlineWrapper = document.getElementById('schedOfflineWrapper');

    if (modeOnline && modeOffline) {
      modeOnline.checked = true;
      if (onlineWrapper) onlineWrapper.style.display = 'block';
      if (offlineWrapper) offlineWrapper.style.display = 'none';

      modeOnline.onchange = () => {
        if (onlineWrapper) onlineWrapper.style.display = 'block';
        if (offlineWrapper) offlineWrapper.style.display = 'none';
      };
      modeOffline.onchange = () => {
        if (onlineWrapper) onlineWrapper.style.display = 'none';
        if (offlineWrapper) offlineWrapper.style.display = 'block';
      };
    }

    modal.classList.add('active');
  },

  autoGenerateGMeetLink(studentName = 'candidate') {
    const sanitized = studentName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
    const randCode = Math.random().toString(36).substring(2, 6);
    const link = `https://meet.google.com/pts-${sanitized}-${randCode}`;
    const meetInput = document.getElementById('schedGMeetLink');
    if (meetInput) meetInput.value = link;
  },

  handleConfirmScheduleInterview() {
    const requestId = this.activeSchedulingRequestId;
    if (!requestId) return;

    const req = (window.ptsState.data.interviewRequests || []).find(r => r.id === requestId);
    if (!req) return;

    const date = document.getElementById('schedInterviewDate').value;
    const time = document.getElementById('schedInterviewTime').value;
    const isOnline = document.getElementById('schedModeOnline').checked;
    const mode = isOnline ? 'Online' : 'Offline';
    const meetLink = isOnline ? (document.getElementById('schedGMeetLink').value.trim() || `https://meet.google.com/pts-${req.studentName.toLowerCase()}`) : '';
    const venue = !isOnline ? (document.getElementById('schedVenue').value.trim() || 'Placement Cell, Room 204') : '';
    const officerNotes = document.getElementById('schedOfficerNotes').value.trim();

    if (!date || !time) {
      window.App.showToast('Please specify both interview date and time.', 'warning');
      return;
    }

    const officer = window.ptsState.data.currentUser || { name: 'Placement Officer', id: 'PO-01' };

    // Update request state
    req.status = 'Scheduled';
    req.assignedOfficerId = officer.id;
    req.assignedOfficerName = officer.name || 'Placement Officer';
    req.scheduledDate = date;
    req.scheduledTime = time;
    req.mode = mode;
    req.meetingLink = meetLink;
    req.venue = venue;
    req.officerNotes = officerNotes;

    // Send direct notification to that specific student
    const notifMsg = mode === 'Online'
      ? `📅 Officer ${officer.name} scheduled your 1-on-1 Mock Interview for ${date} at ${time}. Your private Google Meet link has been dispatched to your portal!`
      : `📅 Officer ${officer.name} scheduled your 1-on-1 Mock Interview for ${date} at ${time} at venue: ${venue}.`;

    window.ptsState.addNotification(
      `Mock Interview Scheduled (${mode})`,
      notifMsg,
      'success'
    );

    // Save and log
    window.ptsState.addAuditLog(`Placement Officer ${officer.name} scheduled 1-on-1 interview with ${req.studentName} for ${date} at ${time} (${mode}).`);
    window.ptsState.saveState();

    // Close modal & refresh
    document.getElementById('scheduleInterviewModal').classList.remove('active');
    this.renderMockInterviewRequests();
    window.App.showToast(`✨ Mock interview scheduled! Notification & ${mode === 'Online' ? 'Google Meet link' : 'venue instructions'} sent to ${req.studentName}.`, 'success');
  },

  handleDeclineInterviewRequest(requestId) {
    const req = (window.ptsState.data.interviewRequests || []).find(r => r.id === requestId);
    if (!req) return;

    const reason = prompt(`Enter reason for declining ${req.studentName}'s interview request (or leave blank for standard reschedule note):`, "Placement drive conflict. Please pick a slot next week.");
    if (reason === null) return; // user cancelled

    req.status = 'Declined';
    req.officerNotes = reason;

    window.ptsState.addNotification(
      'Mock Interview Update',
      `Your mock interview request for ${req.domain} could not be accommodated at this time: "${reason}". Please submit a fresh slot.`,
      'warning'
    );

    window.ptsState.saveState();
    this.renderMockInterviewRequests();
    window.App.showToast(`Interview request from ${req.studentName} declined.`, 'info');
  },

  handleCompleteInterview(requestId) {
    this.openOfficerFeedbackModal(requestId);
  },

  // 1-on-1 Officer Interview Evaluation & Feedback Handlers
  openOfficerFeedbackModal(requestId = null, studentId = null) {
    const modal = document.getElementById('officerFeedbackModal');
    if (!modal) return;

    document.getElementById('poFbRequestId').value = requestId || '';

    // Populate students dropdown
    const studentSelect = document.getElementById('poFbStudentSelect');
    if (studentSelect) {
      const allStudents = window.ptsState?.data?.students || [];
      studentSelect.innerHTML = allStudents.map(s => `
        <option value="${s.id}" data-name="${s.name}" data-dept="${s.department}" data-cgpa="${s.cgpa}">
          ${s.name} (${s.department || 'CSE'}, CGPA: ${s.cgpa || 8.0})
        </option>
      `).join('');
    }

    // Default session date to today
    const dateInput = document.getElementById('poFbSessionDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    // If linked to request
    if (requestId) {
      const req = (window.ptsState?.data?.interviewRequests || []).find(r => r.id === requestId);
      if (req) {
        if (studentSelect) studentSelect.value = req.studentId;
        const domainInput = document.getElementById('poFbDomain');
        const targetCompInput = document.getElementById('poFbTargetCompany');
        if (domainInput) domainInput.value = req.domain || 'Technical DSA & System Design';
        if (targetCompInput) targetCompInput.value = req.targetCompany || 'Tier-1 Product Companies';
      }
    } else if (studentId && studentSelect) {
      studentSelect.value = studentId;
    }

    this.updateScorePreview();
    modal.classList.add('active');
  },

  closeOfficerFeedbackModal() {
    document.getElementById('officerFeedbackModal')?.classList.remove('active');
  },

  onFeedbackStudentChange(studentId) {
    const student = (window.ptsState?.data?.students || []).find(s => s.id === studentId);
    if (!student) return;

    // Check if student applied to any companies
    const app = (window.ptsState?.data?.applications || []).find(a => a.studentId === studentId);
    const targetCompInput = document.getElementById('poFbTargetCompany');
    if (targetCompInput && app) {
      targetCompInput.value = `${app.companyName} (${app.role})`;
    }
  },

  updateScorePreview() {
    const tech = parseFloat(document.getElementById('poFbTechScore')?.value) || 8.5;
    const ps = parseFloat(document.getElementById('poFbPsScore')?.value) || 8.0;
    const comm = parseFloat(document.getElementById('poFbCommScore')?.value) || 7.5;
    const prof = parseFloat(document.getElementById('poFbProfScore')?.value) || 8.5;

    const techVal = document.getElementById('poFbTechScoreVal');
    const psVal = document.getElementById('poFbPsScoreVal');
    const commVal = document.getElementById('poFbCommScoreVal');
    const profVal = document.getElementById('poFbProfScoreVal');
    const badge = document.getElementById('poFbAverageScoreBadge');

    if (techVal) techVal.textContent = `${tech.toFixed(1)} / 10`;
    if (psVal) psVal.textContent = `${ps.toFixed(1)} / 10`;
    if (commVal) commVal.textContent = `${comm.toFixed(1)} / 10`;
    if (profVal) profVal.textContent = `${prof.toFixed(1)} / 10`;

    const avg = ((tech + ps + comm + prof) / 40) * 100;
    if (badge) badge.textContent = `Overall: ${((tech + ps + comm + prof) / 4).toFixed(1)} / 10 (${Math.round(avg)}%)`;
  },

  handleOfficerFeedbackSubmit(e) {
    e.preventDefault();
    const requestId = document.getElementById('poFbRequestId')?.value;
    const studentSelect = document.getElementById('poFbStudentSelect');
    const studentId = studentSelect?.value;
    const selectedOpt = studentSelect?.options[studentSelect.selectedIndex];
    const studentName = selectedOpt?.getAttribute('data-name') || 'Student';
    const studentDept = selectedOpt?.getAttribute('data-dept') || 'CSE';

    const domain = document.getElementById('poFbDomain')?.value.trim();
    const targetCompany = document.getElementById('poFbTargetCompany')?.value.trim();
    const sessionDate = document.getElementById('poFbSessionDate')?.value;

    const technicalScore = document.getElementById('poFbTechScore')?.value;
    const problemSolvingScore = document.getElementById('poFbPsScore')?.value;
    const communicationScore = document.getElementById('poFbCommScore')?.value;
    const professionalismScore = document.getElementById('poFbProfScore')?.value;

    const verdict = document.getElementById('poFbVerdict')?.value;
    const strengths = document.getElementById('poFbStrengths')?.value.trim();
    const improvements = document.getElementById('poFbImprovements')?.value.trim();
    const actionableAdvice = document.getElementById('poFbAdvice')?.value.trim();

    const officer = window.ptsState?.data?.currentUser || { id: 'OFF-201', name: 'Dr. R. Ramanathan', title: 'Head Placement Officer (CDC)' };

    const res = window.ptsState.addOfficerInterviewFeedback({
      requestId,
      studentId,
      studentName,
      studentDept,
      officerId: officer.id,
      officerName: officer.name,
      officerTitle: officer.title || 'Placement Officer',
      domain,
      targetCompany,
      sessionDate,
      technicalScore,
      problemSolvingScore,
      communicationScore,
      professionalismScore,
      verdict,
      strengths,
      improvements,
      actionableAdvice
    });

    document.getElementById('officerFeedbackModal')?.classList.remove('active');

    if (res.success) {
      window.App.showToast(`✨ Comprehensive interview feedback delivered to ${studentName}!`, 'success');
      this.renderMockInterviewRequests();
      this.renderStudentDirectory();

      // Refresh student view if open
      if (window.StudentModule) {
        window.StudentModule.renderInterviewFeedbackHub();
        window.StudentModule.renderStudentInterviewBookings();
      }
    } else {
      window.App.showToast(res.message, 'warning');
    }
  }
};
