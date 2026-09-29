/**
 * Placement Preparation and Tracking System
 * Administrator Central Governance Module Controller
 */

window.AdminModule = {
  activeTab: 'officers',

  init() {
    this.renderExecutiveStats();
    this.renderOfficersSection();
    this.renderRecruitersSection();
    this.renderStudentsSection();
    this.renderUsersTable();
    this.renderAuditLogs();
    this.attachEvents();
  },

  switchTab(tabId) {
    this.activeTab = tabId;

    // Update active tab buttons
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(content => {
      content.style.display = 'none';
    });

    // Show target tab content
    const targetContent = document.getElementById(`adminTab_${tabId}`);
    if (targetContent) {
      targetContent.style.display = 'block';
    }

    // Refresh data for the newly active tab
    if (tabId === 'officers') this.renderOfficersSection();
    if (tabId === 'recruiters') this.renderRecruitersSection();
    if (tabId === 'students') this.renderStudentsSection();
    if (tabId === 'audit') {
      this.renderUsersTable();
      this.renderAuditLogs();
    }
  },

  attachEvents() {
    const backupBtn = document.getElementById('adminExportBackupBtn');
    const restoreInput = document.getElementById('adminRestoreInput');
    const resetBtn = document.getElementById('adminResetDemoBtn');

    if (backupBtn) {
      backupBtn.addEventListener('click', () => this.exportBackup());
    }

    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => this.handleRestore(e));
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all data to initial defaults? All custom additions will be restored.')) {
          window.ptsState.resetToDefault();
          window.App.showToast('System state reset to original demo state!', 'info');
          setTimeout(() => location.reload(), 500);
        }
      });
    }
  },

  renderExecutiveStats() {
    if (!window.ptsState) return;

    const officerData = window.ptsState.getOfficerOversightData();
    const recruiterData = window.ptsState.getRecruiterOversightData();
    const studentData = window.ptsState.getStudentPlacementOversightData();

    // 1. Officer KPI
    const activeOfficersEl = document.getElementById('admStat_activeOfficers');
    const lastQuestionLabelEl = document.getElementById('admStat_lastQuestionLabel');
    if (activeOfficersEl) {
      activeOfficersEl.textContent = `${officerData.checkingOfficersCount} / ${officerData.totalOfficers} Checking`;
    }
    if (lastQuestionLabelEl) {
      lastQuestionLabelEl.innerHTML = `<i class="fas fa-calendar-check"></i> Last Question: ${officerData.lastQuestionRelative}`;
    }

    // 2. Recruiter KPI
    const totalRecruitersEl = document.getElementById('admStat_totalRecruiters');
    const targetHiresLabelEl = document.getElementById('admStat_targetHiresLabel');
    if (totalRecruitersEl) {
      totalRecruitersEl.textContent = `${recruiterData.totalRecruiters} Recruiters`;
    }
    if (targetHiresLabelEl) {
      targetHiresLabelEl.innerHTML = `<i class="fas fa-users"></i> ${recruiterData.totalHiringCapacity} Student Openings`;
    }

    // 3. Student Placement KPI
    const placedStudentsEl = document.getElementById('admStat_placedStudents');
    if (placedStudentsEl) {
      placedStudentsEl.textContent = `${studentData.placedCount} Placed (${studentData.placementRate}%)`;
    }

    // 4. Total Applications KPI
    const totalAppsEl = document.getElementById('admStat_totalApplications');
    if (totalAppsEl) {
      totalAppsEl.textContent = `${studentData.totalAppliedAll} Applications`;
    }
  },

  // ========================================================
  // 1. OFFICER GOVERNANCE & QUESTION AUDIT SECTION
  // ========================================================
  renderOfficersSection() {
    if (!window.ptsState) return;
    const data = window.ptsState.getOfficerOversightData();

    // Highlights Card
    const lastDateEl = document.getElementById('admOfficerLastDateText');
    const lastDescEl = document.getElementById('admOfficerLatestQuestionDesc');
    const checkingTextEl = document.getElementById('admOfficerCheckingCountText');
    const liveBadgeEl = document.getElementById('admOfficerLiveBadge');

    if (lastDateEl) {
      lastDateEl.textContent = `${data.lastQuestionDate} (${data.lastQuestionRelative})`;
    }
    if (lastDescEl && data.latestQuestion) {
      const q = data.latestQuestion;
      const isLeet = q.type === 'leetcode';
      const completions = Array.isArray(q.completedBy) ? q.completedBy.length : 0;
      lastDescEl.innerHTML = `Latest Practice Problem: <strong>${q.title || 'Practice Question'}</strong> • <span style="color:${isLeet ? '#818cf8' : '#34d399'};">${isLeet ? 'LeetCode / Coding' : (q.category || 'Aptitude')}</span> (${q.difficulty || 'Medium'}) • Completed by <strong>${completions}</strong> student${completions === 1 ? '' : 's'}.`;
    }
    if (checkingTextEl) {
      checkingTextEl.textContent = `${data.checkingOfficersCount} / ${data.totalOfficers} Active Now`;
    }
    if (liveBadgeEl) {
      liveBadgeEl.innerHTML = data.checkingOfficersCount > 0 
        ? `<i class="fas fa-check-circle"></i> ${data.checkingOfficersCount} Officers Online`
        : `<i class="fas fa-clock"></i> Idle`;
    }

    // Officers Directory Table
    const tableBody = document.getElementById('admOfficersTableBody');
    if (tableBody) {
      const searchTerm = (document.getElementById('admOfficerSearch')?.value || '').toLowerCase();
      const filtered = data.officers.filter(o => 
        o.name.toLowerCase().includes(searchTerm) || 
        (o.department || '').toLowerCase().includes(searchTerm) ||
        (o.title || '').toLowerCase().includes(searchTerm)
      );

      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No officers match the search query.</td></tr>`;
      } else {
        tableBody.innerHTML = filtered.map(o => `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:36px; height:36px; border-radius:50%; background:rgba(99,102,241,0.15); color:var(--primary-light); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem;">
                  ${o.avatar || o.name.charAt(0)}
                </div>
                <div>
                  <div style="font-weight:700; color:var(--text-main);">${o.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${o.title || 'Placement Officer'} • <a href="mailto:${o.email}" style="color:var(--text-dim); text-decoration:none;">${o.email}</a></div>
                </div>
              </div>
            </td>
            <td><span class="badge" style="background:rgba(99,102,241,0.08); color:var(--text-main); font-size:0.74rem;">${o.department || 'Placement Cell'}</span></td>
            <td>
              ${o.isCheckingNow 
                ? `<span class="badge badge-success" style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.74rem;"><span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#10b981; box-shadow:0 0 8px #10b981;"></span> Checking Portal Now</span>`
                : `<span class="badge badge-warning" style="font-size:0.74rem;"><i class="fas fa-clock"></i> ${o.status || 'Active Earlier'}</span>`}
            </td>
            <td><span style="font-size:0.82rem; color:var(--text-muted);"><i class="far fa-clock"></i> ${o.lastActive || 'Today'}</span></td>
            <td><strong style="color:var(--primary-light); font-size:0.95rem;">${o.questionsPostedCount || 0}</strong> <span style="font-size:0.75rem; color:var(--text-dim);">Questions</span></td>
            <td>
              <div style="font-size:0.82rem; font-weight:600; color:var(--text-main);">
                <i class="far fa-calendar-alt" style="color:#60a5fa;"></i> ${o.lastQuestionPostedDate || 'Recent'}
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${o.lastQuestionTitle || 'LeetCode / Aptitude'}</div>
            </td>
            <td style="text-align:right;">
              <button class="btn btn-outline btn-sm" style="font-size:0.72rem; padding:3px 8px;" onclick="AdminModule.sendOfficerReminder('${o.name}')">
                <i class="fas fa-bell"></i> Send Alert
              </button>
            </td>
          </tr>
        `).join('');
      }
    }

    // Questions Dispatch Stream
    const dispatchList = document.getElementById('admQuestionsDispatchList');
    if (dispatchList) {
      dispatchList.innerHTML = (data.recentQuestionsLog || []).slice(0, 10).map(q => {
        const isLeet = q.type === 'leetcode';
        const completions = Array.isArray(q.completedBy) ? q.completedBy.length : 0;
        const diffBadgeClass = q.difficulty === 'Easy' ? 'badge-success' : (q.difficulty === 'Hard' ? 'badge-danger' : 'badge-warning');

        return `
          <div style="padding:0.85rem 1rem; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <div style="width:34px; height:34px; border-radius:var(--radius-sm); background:${isLeet ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)'}; color:${isLeet ? 'var(--primary-light)' : '#10b981'}; display:flex; align-items:center; justify-content:center;">
                <i class="fas ${isLeet ? 'fa-code' : 'fa-calculator'}"></i>
              </div>
              <div>
                <div style="font-weight:700; font-size:0.88rem; color:var(--text-main);">${q.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); display:flex; gap:0.5rem; align-items:center; margin-top:0.15rem;">
                  <span>${isLeet ? 'LeetCode Problem' : (q.category || 'Aptitude')}</span>
                  <span>•</span>
                  <span>Posted Date: <strong>${q.createdAt || '2026-09-26'}</strong></span>
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span class="badge ${diffBadgeClass}" style="font-size:0.7rem;">${q.difficulty || 'Medium'}</span>
              <span class="badge badge-primary" style="font-size:0.72rem;">
                <i class="fas fa-user-check"></i> ${completions} Students Completed
              </span>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  filterOfficers() {
    this.renderOfficersSection();
  },

  sendOfficerReminder(officerName) {
    window.ptsState.addNotification(
      `📢 Admin Advisory to Placement Officers`,
      `Administrator issued a dispatch notice: Please review and upload fresh LeetCode DSA and Aptitude mock test sets for upcoming tier-1 campus drives.`,
      'info'
    );
    window.ptsState.addAuditLog(`Administrator sent question upload reminder to officer: ${officerName}`);
    window.App.showToast(`Notification alert sent to ${officerName} & students!`, 'success');
  },

  // ========================================================
  // 2. RECRUITERS & COMPANY HIRING TARGETS SECTION
  // ========================================================
  renderRecruitersSection() {
    if (!window.ptsState) return;
    const data = window.ptsState.getRecruiterOversightData();

    // Summary KPIs
    const totalCountEl = document.getElementById('admRecruiterTotalCount');
    const compCountEl = document.getElementById('admRecruiterCompanyCount');
    const capacityCountEl = document.getElementById('admRecruiterCapacityCount');
    const avgCtcEl = document.getElementById('admRecruiterAvgCtc');

    if (totalCountEl) totalCountEl.textContent = `${data.totalRecruiters} Recruiters`;
    if (compCountEl) compCountEl.textContent = `${data.partnerCompaniesCount} Companies`;
    if (capacityCountEl) capacityCountEl.textContent = `${data.totalHiringCapacity} Openings`;
    if (avgCtcEl) avgCtcEl.textContent = `15.1 LPA`;

    // Recruiters Table
    const tableBody = document.getElementById('admRecruitersTableBody');
    if (tableBody) {
      const searchTerm = (document.getElementById('admRecruiterSearch')?.value || '').toLowerCase();
      const catFilter = document.getElementById('admRecruiterCatFilter')?.value || 'All';

      const filtered = data.recruiters.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm) || 
                              r.company.toLowerCase().includes(searchTerm) ||
                              (r.openRoles || '').toLowerCase().includes(searchTerm);
        const matchesCat = catFilter === 'All' || (r.category || '').toLowerCase().includes(catFilter.toLowerCase());
        return matchesSearch && matchesCat;
      });

      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No corporate recruiters found for the filter.</td></tr>`;
      } else {
        tableBody.innerHTML = filtered.map(r => `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:36px; height:36px; border-radius:50%; background:rgba(139,92,246,0.15); color:#a78bfa; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem;">
                  ${r.avatar || r.name.charAt(0)}
                </div>
                <div>
                  <div style="font-weight:700; color:var(--text-main);">${r.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${r.role || 'Talent Acquisition'}</div>
                  <div style="font-size:0.72rem; color:var(--text-dim);">${r.email} • ${r.phone}</div>
                </div>
              </div>
            </td>
            <td>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <img src="${r.companyLogo}" alt="${r.company}" style="width:26px; height:26px; object-fit:contain; border-radius:4px; background:#fff; padding:2px;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3061/3061341.png'">
                <strong style="color:var(--text-main); font-size:0.92rem;">${r.company}</strong>
              </div>
            </td>
            <td>
              <span class="badge badge-primary" style="font-size:0.72rem;">${r.category || 'Product'}</span>
            </td>
            <td>
              <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); border-radius:var(--radius-sm); padding:4px 10px;">
                <i class="fas fa-user-plus" style="color:#10b981;"></i>
                <span style="font-weight:800; font-size:1.05rem; color:#10b981;">${r.targetHires || 20}</span>
                <span style="font-size:0.72rem; color:var(--text-muted);">Students Ready to Hire</span>
              </div>
            </td>
            <td>
              <div style="font-size:0.82rem; color:var(--text-main); font-weight:600;">${r.openRoles || 'Software Engineer'}</div>
            </td>
            <td>
              <span class="badge badge-success" style="font-size:0.8rem; font-weight:700;">${r.ctcOffered || '12.0 LPA'}</span>
            </td>
            <td>
              <span class="badge badge-warning" style="font-size:0.72rem;"><i class="fas fa-spinner fa-spin"></i> ${r.status || 'Active'}</span>
            </td>
            <td style="text-align:right;">
              <button class="btn btn-outline btn-sm" style="font-size:0.74rem; padding:3px 8px;" onclick="AdminModule.openAdjustQuotaModal('${r.id}')">
                <i class="fas fa-sliders-h"></i> Adjust Quota
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  },

  filterRecruiters() {
    this.renderRecruitersSection();
  },

  openAdjustQuotaModal(recruiterId) {
    const recruiters = window.ptsState.data.recruiters || [];
    const rec = recruiters.find(r => r.id === recruiterId);
    if (!rec) return;

    document.getElementById('adjustQuotaRecruiterId').value = rec.id;
    document.getElementById('adjustQuotaCompanyName').textContent = rec.company;
    document.getElementById('adjustQuotaRecruiterName').textContent = `${rec.name} (${rec.role})`;
    document.getElementById('adjustQuotaInput').value = rec.targetHires || 20;

    const modal = document.getElementById('adminAdjustQuotaModal');
    if (modal) modal.classList.add('active');
  },

  saveAdjustedQuota() {
    const recruiterId = document.getElementById('adjustQuotaRecruiterId')?.value;
    const newQuota = parseInt(document.getElementById('adjustQuotaInput')?.value, 10);

    if (isNaN(newQuota) || newQuota < 1) {
      window.App.showToast('Please enter a valid positive hiring target.', 'warning');
      return;
    }

    const updated = window.ptsState.updateRecruiterHiringQuota(recruiterId, newQuota);
    if (updated) {
      window.App.showToast(`Updated hiring target for ${updated.company} to ${newQuota} students!`, 'success');
      document.getElementById('adminAdjustQuotaModal')?.classList.remove('active');
      this.renderExecutiveStats();
      this.renderRecruitersSection();
      this.renderStudentsSection();
    }
  },

  // ========================================================
  // 3. STUDENT PLACEMENT & COMPANY APPLICATIONS SECTION
  // ========================================================
  renderStudentsSection() {
    if (!window.ptsState) return;
    const data = window.ptsState.getStudentPlacementOversightData();

    // Summary KPIs
    const placedCountEl = document.getElementById('admPlacedCountText');
    const highestCtcEl = document.getElementById('admHighestCtcText');
    const avgPlacedCtcEl = document.getElementById('admAvgPlacedCtcText');
    const totalAppsCohortEl = document.getElementById('admTotalAppsCohortText');

    if (placedCountEl) placedCountEl.textContent = `${data.placedCount} Placed (${data.placementRate}%)`;
    if (highestCtcEl) highestCtcEl.textContent = data.highestCtc;
    if (avgPlacedCtcEl) avgPlacedCtcEl.textContent = `19.4 LPA`;
    if (totalAppsCohortEl) totalAppsCohortEl.textContent = `${data.totalAppliedAll} Applications`;

    // 1. Company Applications Breakdown Table (How Many Students Applied for Each Company)
    const compAppsBody = document.getElementById('admCompanyApplicationsTableBody');
    if (compAppsBody) {
      compAppsBody.innerHTML = data.companyStats.map(c => `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.65rem;">
              <img src="${c.logo}" alt="${c.name}" style="width:26px; height:26px; object-fit:contain; border-radius:4px; background:#fff; padding:2px;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3061/3061341.png'">
              <div>
                <strong style="color:var(--text-main); font-size:0.92rem;">${c.name}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">${c.role}</div>
              </div>
            </div>
          </td>
          <td><span class="badge badge-primary" style="font-size:0.72rem;">${c.category}</span></td>
          <td><strong style="color:#10b981; font-size:0.92rem;">${c.ctc}</strong></td>
          <td>
            <div style="display:inline-flex; align-items:center; gap:0.4rem; background:rgba(99,102,241,0.09); border:1px solid rgba(99,102,241,0.2); padding:3px 8px; border-radius:var(--radius-sm);">
              <i class="fas fa-paper-plane" style="color:var(--primary-light);"></i>
              <strong style="color:var(--text-main); font-size:0.95rem;">${c.appliedCount}</strong>
              <span style="font-size:0.72rem; color:var(--text-muted);">Applied</span>
            </div>
          </td>
          <td>
            <span class="badge badge-success" style="font-size:0.8rem; font-weight:800;">
              <i class="fas fa-user-check"></i> ${c.placedCount} Placed
            </span>
          </td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <div class="progress-track" style="width:60px; height:6px;">
                <div class="progress-fill" style="width:${Math.min(c.conversionRate * 5, 100)}%; background:${c.conversionRate > 0 ? '#10b981' : '#94a3b8'};"></div>
              </div>
              <span style="font-size:0.78rem; font-weight:700; color:${c.conversionRate > 0 ? '#10b981' : 'var(--text-dim)'};">${c.conversionRate}%</span>
            </div>
          </td>
          <td>
            <span style="font-size:0.85rem; font-weight:700; color:#8b5cf6;">${c.targetHires} Openings</span>
          </td>
          <td>
            <span class="badge ${c.status === 'Active' ? 'badge-success' : 'badge-warning'}" style="font-size:0.72rem;">
              ${c.status}
            </span>
          </td>
        </tr>
      `).join('');
    }

    // 2. Placed Students Honor Roll Table (Who Placed, In What Company, In What LPA)
    const placedStudentsBody = document.getElementById('admPlacedStudentsTableBody');
    if (placedStudentsBody) {
      if (data.placedStudents.length === 0) {
        placedStudentsBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--text-muted);">No placed students recorded yet.</td></tr>`;
      } else {
        placedStudentsBody.innerHTML = data.placedStudents.map(p => `
          <tr>
            <td>
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #10b981, #059669); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem; box-shadow:0 0 10px rgba(16,185,129,0.3);">
                  ${p.name.charAt(0)}
                </div>
                <div>
                  <div style="font-weight:700; color:var(--text-main); font-size:0.92rem;">${p.name}</div>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${p.rollNo}</div>
                </div>
              </div>
            </td>
            <td><span class="badge" style="background:rgba(99,102,241,0.08); font-size:0.75rem;">${p.department}</span></td>
            <td><strong style="color:var(--text-main); font-size:0.88rem;">${p.cgpa.toFixed(2)}</strong></td>
            <td>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <i class="fas fa-building" style="color:var(--primary-light);"></i>
                <strong style="color:var(--text-main); font-size:0.95rem;">${p.placedCompany}</strong>
              </div>
            </td>
            <td>
              <span class="badge badge-success" style="font-size:0.88rem; font-weight:800; padding:4px 10px; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.35);">
                <i class="fas fa-money-bill-wave"></i> ${p.placedCtc}
              </span>
            </td>
            <td>
              <div style="font-size:0.82rem; font-weight:600; color:var(--text-main);">${p.placedRole}</div>
            </td>
            <td>
              <span style="font-size:0.8rem; color:var(--text-muted);"><i class="far fa-calendar-check"></i> ${p.placedDate}</span>
            </td>
            <td>
              <span class="badge badge-success" style="font-size:0.72rem; display:inline-flex; align-items:center; gap:0.35rem;">
                <i class="fas fa-check-double"></i> Verified Offer
              </span>
            </td>
          </tr>
        `).join('');
      }
    }
  },

  // ========================================================
  // 4. USERS & AUDIT TRAIL SECTION
  // ========================================================
  renderUsersTable() {
    const tableBody = document.getElementById('adminUsersTableBody');
    if (!tableBody) return;

    const students = window.ptsState.data.students || [];
    const sampleUsers = [
      { id: 'USR-PO-1', name: 'Dr. R. Ramanathan', email: 'officer@college.edu', role: 'Placement Officer', status: 'Active' },
      { id: 'USR-REC-1', name: 'Ananya Sen (Zoho)', email: 'recruiter@zoho.com', role: 'Recruiter', status: 'Active' },
      { id: 'USR-REC-2', name: 'Vikram Joshi (Google)', email: 'v.joshi@google.com', role: 'Recruiter', status: 'Active' },
      { id: 'USR-ADM-1', name: 'Administrator', email: 'admin@college.edu', role: 'Administrator', status: 'Active' },
      ...students.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        role: 'Student',
        status: s.status === 'Placed' ? 'Placed' : 'Active'
      }))
    ];

    tableBody.innerHTML = sampleUsers.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td><span class="badge ${u.role === 'Student' ? 'badge-primary' : (u.role === 'Placement Officer' ? 'badge-warning' : 'badge-info')}">${u.role}</span></td>
        <td><span class="badge badge-success">${u.status}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="App.showToast('Permissions confirmed for ${u.name}', 'info')">
            <i class="fas fa-key"></i> Permissions
          </button>
        </td>
      </tr>
    `).join('');
  },

  renderAuditLogs() {
    const container = document.getElementById('adminAuditLogsList');
    if (!container) return;

    const logs = window.ptsState.data.auditLogs || [];

    container.innerHTML = logs.map(l => `
      <div style="padding:0.75rem 1rem; border-bottom:1px solid var(--border-subtle); display:flex; justify-content:space-between; align-items:center; font-size:0.85rem;">
        <div>
          <span style="font-weight:700; color:var(--primary-light); margin-right:0.5rem;">[${l.user}]</span>
          <span style="color:var(--text-main);">${l.action}</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-dim); white-space:nowrap; margin-left:1rem;">
          ${l.time}
        </div>
      </div>
    `).join('');
  },

  exportBackup() {
    const data = JSON.stringify(window.ptsState.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Placement_System_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.App.showToast('System state backup JSON downloaded!', 'success');
  },

  handleRestore(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.currentUser && parsed.companies) {
          window.ptsState.data = parsed;
          window.ptsState.saveState();
          window.App.showToast('System state restored successfully from backup!', 'success');
          setTimeout(() => location.reload(), 600);
        } else {
          window.App.showToast('Invalid backup JSON format.', 'danger');
        }
      } catch (err) {
        window.App.showToast('Failed to parse backup file.', 'danger');
      }
    };
    reader.readAsText(file);
  },

  // ========================================================
  // 5. EXCLUSIVE ADMIN INCLUSION OF NEW COMPANIES & RECRUITERS
  // ========================================================
  openAddCompanyModal() {
    const modal = document.getElementById('adminAddCompanyModal');
    if (!modal) return;

    // Set default dates: Drive in 14 days, deadline in 7 days
    const today = new Date();
    const driveDate = new Date(today.getTime() + 14 * 86400000).toISOString().split('T')[0];
    const deadline = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0];

    const driveDateInput = document.getElementById('admCompDriveDate');
    const deadlineInput = document.getElementById('admCompDeadline');
    if (driveDateInput && !driveDateInput.value) driveDateInput.value = driveDate;
    if (deadlineInput && !deadlineInput.value) deadlineInput.value = deadline;

    // Reset preset selector
    const presetSelect = document.getElementById('admCompPresetSelect');
    if (presetSelect) presetSelect.value = '';

    modal.classList.add('active');
  },

  closeAddCompanyModal() {
    const modal = document.getElementById('adminAddCompanyModal');
    if (modal) modal.classList.remove('active');
  },

  applyCompanyPreset(presetKey) {
    if (!presetKey) return;

    const presets = {
      NVIDIA: {
        name: 'NVIDIA Corporation',
        category: 'Dream / Tier 1',
        role: 'AI & GPU Systems Software Engineer',
        ctc: '30.0 LPA',
        quota: 25,
        minCgpa: 8.5,
        maxArrears: 0,
        depts: 'CSE, IT, ECE, AI & DS',
        location: 'Bangalore / Pune',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nvidia/nvidia-original.svg',
        desc: 'NVIDIA accelerates modern computing across AI, deep learning, GPU hardware architecture, and CUDA accelerated high performance computing.',
        reqs: `Strong mastery in C++, Python, Computer Architecture, and CUDA\nDeep knowledge of Data Structures, Algorithms, and System Performance\nPassion for Artificial Intelligence, Machine Learning, and Parallel Computing\nMinimum 8.5 CGPA with zero active backlogs`,
        rounds: 'Online Coding Assessment -> Technical Round 1 (DSA & Architecture) -> Technical Round 2 (Systems) -> HR & Executive Round',
        recName: 'Rajesh Sharma',
        recEmail: 'rajesh@nvidia.com',
        recPassword: 'password123',
        recTitle: 'Director of University Talent Acquisition',
        recPhone: '+91 98765 11223'
      },
      Amazon: {
        name: 'Amazon',
        category: 'Dream / Tier 1',
        role: 'Software Development Engineer (SDE-1)',
        ctc: '28.0 LPA',
        quota: 30,
        minCgpa: 8.0,
        maxArrears: 0,
        depts: 'CSE, IT, ECE',
        location: 'Bangalore / Hyderabad / Chennai',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
        desc: 'Engineering scalable AWS cloud microservices, distributed storage engines, and high-throughput ecommerce fulfillment systems.',
        reqs: `Exceptional competence in Data Structures, Algorithms (Trees, Graphs, DP)\nObject-Oriented Design & Clean Architecture in Java, C++, or Python\nUnderstanding of Distributed Systems and Database Transactions\nDemonstrated adherence to Amazon 16 Leadership Principles`,
        rounds: 'Online Assessment (DSA + Debugging) -> Technical Interview 1 -> Technical Interview 2 -> Bar Raiser Round',
        recName: 'David Miller',
        recEmail: 'd.miller@amazon.com',
        recPassword: 'password123',
        recTitle: 'Lead University Recruiting Partner',
        recPhone: '+91 98450 22334'
      },
      Apple: {
        name: 'Apple',
        category: 'Dream / Tier 1',
        role: 'Embedded Systems & Core OS Engineer',
        ctc: '34.0 LPA',
        quota: 15,
        minCgpa: 8.5,
        maxArrears: 0,
        depts: 'CSE, ECE, IT',
        location: 'Hyderabad / Bangalore',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg',
        desc: 'Developing state-of-the-art silicon software integrations, iOS kernel subsystems, and privacy-preserving intelligent systems.',
        reqs: `Strong C, C++, and Swift programming capabilities\nIn-depth understanding of Operating Systems, Memory Management, and Concurrency\nFamiliarity with Embedded Systems and low-level debugging\nMinimum 8.5 CGPA with impeccable problem-solving track record`,
        rounds: 'Coding Screening -> Deep Systems Interview -> Architectural Design Round -> Leadership & Values Interview',
        recName: 'Sarah Jenkins',
        recEmail: 's.jenkins@apple.com',
        recPassword: 'password123',
        recTitle: 'Head of Campus Talent Acquisition',
        recPhone: '+91 99123 44556'
      },
      Adobe: {
        name: 'Adobe Systems',
        category: 'Product',
        role: 'Computer Scientist - Creative Cloud & AI',
        ctc: '26.0 LPA',
        quota: 20,
        minCgpa: 8.0,
        maxArrears: 0,
        depts: 'CSE, IT, AI & DS',
        location: 'Noida / Bangalore',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Adobe_Creative_Cloud_logo_%282020%29.svg',
        desc: 'Building modern web canvas rendering engines, generative AI plugins for Photoshop and Premiere, and cloud collaboration suites.',
        reqs: `Expertise in Algorithms, Geometry, and Computational Complexity\nFluency in Modern C++, TypeScript, or Python\nUnderstanding of WebAssembly, WebGL, or Cloud Microservices\nHigh creative and analytical enthusiasm`,
        rounds: 'Online Assessment -> Technical Interview 1 -> Technical Interview 2 -> Managerial & HR Round',
        recName: 'Meera Nair',
        recEmail: 'm.nair@adobe.com',
        recPassword: 'password123',
        recTitle: 'Campus Talent Partner',
        recPhone: '+91 98234 55678'
      },
      Qualcomm: {
        name: 'Qualcomm Technologies',
        category: 'Core',
        role: 'Modem Software & Embedded Systems Engineer',
        ctc: '19.0 LPA',
        quota: 22,
        minCgpa: 7.5,
        maxArrears: 0,
        depts: 'CSE, ECE, EEE',
        location: 'Chennai / Bangalore / Hyderabad',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Qualcomm-Logo.svg',
        desc: 'Engineering 5G/6G modem protocol stacks, RF processing algorithms, and Snapdragon embedded Linux firmware.',
        reqs: `Strong knowledge of C/C++, Data Structures, and Computer Architecture\nUnderstanding of Computer Networks (TCP/IP, Wireless Protocols, Sockets)\nEmbedded Linux and Real-Time Operating Systems (RTOS) concepts\nMin 7.5 CGPA with zero backlogs`,
        rounds: 'Online Technical Exam -> Technical Round 1 (DSA + Networks) -> Technical Round 2 (Embedded) -> HR Interview',
        recName: 'Suresh Babu',
        recEmail: 'suresh.b@qualcomm.com',
        recPassword: 'password123',
        recTitle: 'University Relations Lead',
        recPhone: '+91 97890 12345'
      },
      Oracle: {
        name: 'Oracle Corporation',
        category: 'Product',
        role: 'Cloud Infrastructure Systems Engineer',
        ctc: '18.0 LPA',
        quota: 25,
        minCgpa: 7.5,
        maxArrears: 0,
        depts: 'CSE, IT, ECE',
        location: 'Bangalore / Hyderabad',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg',
        desc: 'Developing Oracle Cloud Infrastructure (OCI) hypervisor orchestrations, autonomous relational databases, and enterprise security layers.',
        reqs: `Proficiency in Java, Python, or Go\nSolid grasp of Database Internals (B-Trees, WAL, SQL indexing, Concurrency)\nFamiliarity with Linux System Administration and Networking\nMinimum 7.5 CGPA`,
        rounds: 'Online Coding Test -> Technical Round 1 -> Technical Round 2 -> HR Round',
        recName: 'Kavita Menon',
        recEmail: 'k.menon@oracle.com',
        recPassword: 'password123',
        recTitle: 'Senior University Recruiter',
        recPhone: '+91 98401 23456'
      }
    };

    const p = presets[presetKey];
    if (!p) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('admCompName', p.name);
    setVal('admCompCategory', p.category);
    setVal('admCompRole', p.role);
    setVal('admCompCtc', p.ctc);
    setVal('admCompHiringQuota', p.quota);
    setVal('admCompMinCgpa', p.minCgpa);
    setVal('admCompMaxArrears', p.maxArrears);
    setVal('admCompDepts', p.depts);
    setVal('admCompLocation', p.location);
    setVal('admCompLogo', p.logo);
    setVal('admCompDesc', p.desc);
    setVal('admCompRequirements', p.reqs);
    setVal('admCompRounds', p.rounds);

    // Recruiter fields
    setVal('admRecruiterName', p.recName);
    setVal('admRecruiterEmail', p.recEmail);
    setVal('admRecruiterPassword', p.recPassword);
    setVal('admRecruiterTitle', p.recTitle);
    setVal('admRecruiterPhone', p.recPhone);
  },

  handleIncludeCompanySubmit() {
    const compName = document.getElementById('admCompName')?.value.trim();
    const category = document.getElementById('admCompCategory')?.value || 'Dream / Tier 1';
    const role = document.getElementById('admCompRole')?.value.trim();
    const ctc = document.getElementById('admCompCtc')?.value.trim();
    const hiringQuota = parseInt(document.getElementById('admCompHiringQuota')?.value, 10) || 20;
    const minCgpa = parseFloat(document.getElementById('admCompMinCgpa')?.value) || 7.5;
    const maxArrears = parseInt(document.getElementById('admCompMaxArrears')?.value, 10) || 0;
    const driveDate = document.getElementById('admCompDriveDate')?.value;
    const deadline = document.getElementById('admCompDeadline')?.value;
    const depts = (document.getElementById('admCompDepts')?.value || 'CSE, IT, ECE').split(',').map(d => d.trim()).filter(Boolean);
    const location = document.getElementById('admCompLocation')?.value.trim() || 'Bangalore / Hyderabad';
    const logo = document.getElementById('admCompLogo')?.value.trim() || 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png';
    const desc = document.getElementById('admCompDesc')?.value.trim();
    const reqs = document.getElementById('admCompRequirements')?.value.trim();
    const rounds = document.getElementById('admCompRounds')?.value.trim();

    // Recruiter info
    const recName = document.getElementById('admRecruiterName')?.value.trim();
    const recEmail = document.getElementById('admRecruiterEmail')?.value.trim().toLowerCase();
    const recPassword = document.getElementById('admRecruiterPassword')?.value.trim() || 'password123';
    const recTitle = document.getElementById('admRecruiterTitle')?.value.trim() || 'Lead Campus Recruiter';
    const recPhone = document.getElementById('admRecruiterPhone')?.value.trim() || '+91 98000 00000';

    if (!compName || !role || !ctc || !driveDate || !deadline) {
      window.App.showToast('Please fill all mandatory company drive fields.', 'warning');
      return;
    }

    if (!recName || !recEmail || !recPassword) {
      window.App.showToast('Please provide recruiter credentials so the recruiter can log in.', 'warning');
      return;
    }

    const companyData = {
      name: compName,
      category,
      role,
      ctc,
      targetHires: hiringQuota,
      minCgpa,
      maxArrears,
      driveDate,
      deadline,
      allowedDepts: depts,
      location,
      logo,
      description: desc,
      requirements: reqs,
      rounds
    };

    const recruiterData = {
      name: recName,
      email: recEmail,
      password: recPassword,
      title: recTitle,
      phone: recPhone
    };

    const res = window.ptsState.includeCompanyByAdmin(companyData, recruiterData);
    if (!res.success) {
      window.App.showToast(res.message || 'Failed to include company.', 'danger');
      return;
    }

    window.App.showToast(`🎉 Officially included "${compName}"! Recruiter account for "${recEmail}" is now authorized to log in.`, 'success');
    this.closeAddCompanyModal();

    // Re-render Admin views
    this.renderExecutiveStats();
    this.renderRecruitersSection();
    this.renderUsersTable();

    // Sync other modules
    if (window.OfficerModule) {
      window.OfficerModule.renderDrivesManagement();
      window.OfficerModule.renderDashboardStats();
    }
    if (window.StudentModule) {
      window.StudentModule.renderEligibilityChecker();
      window.StudentModule.renderDrivesList();
    }
  }
};
