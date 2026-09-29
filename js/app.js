window.App = {
  currentView: 'student',
  init() {
    this.initTheme();
    this.initRouter();
    this.initAuth();
    this.initNotificationBell();
    this.initResetButton();
    this.initMobileMenu();
    this.initSupabaseUI();
    try {
      if (window.StudentModule) window.StudentModule.init();
      if (window.TestsModule) window.TestsModule.init();
      if (window.AiToolsModule) window.AiToolsModule.init();
      if (window.OfficerModule) window.OfficerModule.init();
      if (window.RecruiterModule) window.RecruiterModule.init();
      if (window.AdminModule) window.AdminModule.init();
    } catch (err) {
      console.warn('Dashboard submodule init caught:', err);
    }
    if (window.ptsState.isLoggedIn()) {
      this.onLoginSuccess(window.ptsState.getCurrentUser(), false);
    } else {
      this.showLoginScreen();
    }
    if (window.ptsState && typeof window.ptsState.initSupabaseSync === 'function') {
      window.ptsState.initSupabaseSync().catch(err => console.warn('Supabase sync warning:', err));
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('PTS_THEME') || 'light';
    this.setTheme(savedTheme);

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
        this.showToast(`Switched to ${next === 'dark' ? 'Dark' : 'White (Normal)'} mode`, 'info');
      });
    }

    const loginThemeBtn = document.getElementById('loginThemeToggleBtn');
    if (loginThemeBtn) {
      loginThemeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
        this.showToast(`Switched to ${next === 'dark' ? 'Dark' : 'White (Normal)'} mode`, 'info');
      });
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('PTS_THEME', theme);

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      themeBtn.setAttribute('title', theme === 'dark' ? 'Switch to White (Normal) Mode' : 'Switch to Dark Mode');
    }

    const loginThemeBtn = document.getElementById('loginThemeToggleBtn');
    if (loginThemeBtn) {
      loginThemeBtn.innerHTML = theme === 'dark'
        ? '<i class="fas fa-sun"></i> <span>Normal (White) Mode</span>'
        : '<i class="fas fa-moon"></i> <span>Dark Mode</span>';
    }
  },

  initRouter() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = item.getAttribute('data-view');
        if (targetView) {
          this.navigateTo(targetView);
          // Close mobile menu if open
          document.querySelector('.sidebar')?.classList.remove('open');
        }
      });
    });
  },

  navigateTo(viewName) {
    const user = window.ptsState.data.currentUser;
    const role = user?.role || 'student';

    // Strict role view permissions
    // Officer: can only track placement details (officer portal)
    // Student: can only do assessments, mock practice, attend tests, student portal
    // Recruiter: can only analyze resumes and candidate hiring pipeline
    // Admin: strictly institutional administration & central governance
    const permissions = {
      student: ['student', 'tests', 'ai-tools'],
      officer: ['officer'],
      recruiter: ['recruiter'],
      admin: ['admin']
    };

    const allowed = permissions[role] || ['student'];
    if (!allowed.includes(viewName)) {
      this.showToast(`Access Restricted: ${role.toUpperCase()} accounts cannot access the ${viewName.toUpperCase()} section.`, 'warning');
      return;
    }

    this.currentView = viewName;

    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    // Toggle view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
      activeView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Module-specific refreshes
    if (viewName === 'student' && window.StudentModule) {
      window.StudentModule.renderStudentDashboard();
    } else if (viewName === 'officer' && window.OfficerModule) {
      window.OfficerModule.renderDashboardStats();
    } else if (viewName === 'recruiter' && window.RecruiterModule) {
      window.RecruiterModule.renderRecruiterStats();
      window.RecruiterModule.renderRecruiterApplications();
      window.RecruiterModule.renderCandidateTalentPool();
    } else if (viewName === 'admin' && window.AdminModule) {
      window.AdminModule.renderSystemHealth();
      window.AdminModule.renderUsersTable();
      window.AdminModule.renderAuditLogs();
    }
  },

  refreshCurrentView() {
    this.navigateTo(this.currentView);
  },

  // ==========================================
  // Authentication & Role Permissions
  // ==========================================
  // ==========================================
  // Single-User Session Guard & Authentication
  // ==========================================
  currentLoginRole: 'student',
  currentAuthMode: 'login',
  isAdminLoginMode: false,
  currentSessionId: null,
  pendingLogin: null,
  sessionChannel: null,
  heartbeatInterval: null,
  initAuth() {
    this.currentSessionId = sessionStorage.getItem('PTS_TAB_SESSION_ID') || null;
    try {
      if ('BroadcastChannel' in window) {
        this.sessionChannel = new BroadcastChannel('pts_session_channel');
        this.sessionChannel.onmessage = (e) => this.handleSessionBroadcast(e.data);
      }
    } catch (err) {
      console.warn('BroadcastChannel not supported, using storage event fallback', err);
    }
    window.addEventListener('storage', (e) => {
      if (e.key === 'PTS_APP_STATE_V3' || e.key === 'PTS_APP_STATE_V1') {
        const active = window.ptsState.getActiveSession();
        if (this.currentSessionId && (!active || active.sessionId !== this.currentSessionId)) {
          this.onSessionTerminatedByOther(active ? active.userName : 'Another session');
        }
        this.updateSessionGuardBanner();
      }
    });
    const roleTabs = document.querySelectorAll('.login-role-tab-btn');
    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const role = tab.getAttribute('data-login-role');
        this.switchLoginTab(role);
      });
    });
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('role') === 'admin' || window.location.hash === '#admin') {
        this.enterAdminLoginMode();
      }
    } catch (e) { }
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#admin') {
        this.enterAdminLoginMode();
      } else if (window.location.hash === '#login' || window.location.hash === '') {
        if (this.isAdminLoginMode) this.exitAdminLoginMode();
      }
    });
    const signInTabBtn = document.getElementById('authModeSignInBtn');
    const registerTabBtn = document.getElementById('authModeRegisterBtn');
    const switchToRegisterLink = document.getElementById('switchToRegisterLink');
    const switchToLoginLink = document.getElementById('switchToLoginLink');
    if (signInTabBtn) {
      signInTabBtn.addEventListener('click', () => this.switchAuthMode('login'));
    }
    if (registerTabBtn) {
      registerTabBtn.addEventListener('click', () => this.switchAuthMode('register'));
    }
    if (switchToRegisterLink) {
      switchToRegisterLink.addEventListener('click', () => this.switchAuthMode('register'));
    }
    if (switchToLoginLink) {
      switchToLoginLink.addEventListener('click', () => this.switchAuthMode('login'));
    }
    const toggleLoginPasswordBtn = document.getElementById('toggleLoginPasswordBtn');
    if (toggleLoginPasswordBtn) {
      toggleLoginPasswordBtn.addEventListener('click', () => {
        const pwdInput = document.getElementById('loginPasswordInput');
        const icon = document.getElementById('toggleLoginPasswordIcon');
        const text = document.getElementById('toggleLoginPasswordText');
        if (!pwdInput) return;
        if (pwdInput.type === 'password') {
          pwdInput.type = 'text';
          if (icon) icon.className = 'fas fa-eye-slash';
          if (text) text.textContent = 'Hide';
        } else {
          pwdInput.type = 'password';
          if (icon) icon.className = 'fas fa-eye';
          if (text) text.textContent = 'Show';
        }
      });
    }
    const loginForm = document.getElementById('portalLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmailInput').value.trim();
        const password = document.getElementById('loginPasswordInput').value;
        this.attemptLogin(this.currentLoginRole, email, password, false);
      });
    }
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    if (loginSubmitBtn) {
      loginSubmitBtn.addEventListener('click', (e) => {
        const email = document.getElementById('loginEmailInput')?.value.trim() || '';
        const password = document.getElementById('loginPasswordInput')?.value || '';
        if (email) {
          e.preventDefault();
          this.attemptLogin(this.currentLoginRole, email, password, false);
        }
      });
    }
    const registerForm = document.getElementById('portalRegisterForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regNameInput').value.trim();
        const email = document.getElementById('regEmailInput').value.trim();
        const password = document.getElementById('regPasswordInput').value;
        const confirmPassword = document.getElementById('regConfirmPasswordInput').value;
        if (password !== confirmPassword) {
          this.showToast('Passwords do not match. Please re-enter your password.', 'danger');
          document.getElementById('regConfirmPasswordInput').focus();
          return;
        }
        if (password.length < 4) {
          this.showToast('Password must be at least 4 characters long.', 'danger');
          document.getElementById('regPasswordInput').focus();
          return;
        }
        const formData = { name, email, password };

        if (this.currentLoginRole === 'student') {
          formData.department = document.getElementById('regDeptInput')?.value || 'CSE';
          formData.cgpa = parseFloat(document.getElementById('regCgpaInput')?.value) || 8.0;
        } else if (this.currentLoginRole === 'recruiter') {
          const compSel = document.getElementById('regCompanySelect');
          const compVal = compSel?.value ? compSel.value.trim() : (document.getElementById('regCompanyInput')?.value.trim() || '');
          formData.company = compVal;
          if (!formData.company) {
            this.showToast('Please select your officially approved Company from the list.', 'danger');
            if (compSel) compSel.focus();
            return;
          }
        } else if (this.currentLoginRole === 'officer') {
          formData.title = document.getElementById('regOfficerTitleInput')?.value.trim() || 'Placement Officer';
        }

        this.attemptRegister(this.currentLoginRole, formData);
      });
    }

    // Terminate & Take Over Button in Session Conflict Modal
    const confirmOverrideBtn = document.getElementById('confirmTerminateAndLoginBtn');
    if (confirmOverrideBtn) {
      confirmOverrideBtn.addEventListener('click', () => {
        if (this.pendingLogin) {
          const { role, email, password } = this.pendingLogin;
          document.getElementById('sessionConflictModal')?.classList.remove('active');
          this.attemptLogin(role, email, password, true); // Force override
        }
      });
    }

    // Logout Button in Topbar
    const logoutBtn = document.getElementById('topbarLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // Start 10-second heartbeat to maintain active session lock
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => {
      if (this.currentSessionId && window.ptsState.isLoggedIn()) {
        window.ptsState.updateHeartbeat(this.currentSessionId);
      }
    }, 10000);

    this.updateSessionGuardBanner();
  },

  switchAuthMode(mode) {
    this.currentAuthMode = mode;
    const isRegister = (mode === 'register');

    const signInTabBtn = document.getElementById('authModeSignInBtn');
    const registerTabBtn = document.getElementById('authModeRegisterBtn');
    const loginForm = document.getElementById('portalLoginForm');
    const registerForm = document.getElementById('portalRegisterForm');

    if (signInTabBtn) signInTabBtn.classList.toggle('active', !isRegister);
    if (registerTabBtn) registerTabBtn.classList.toggle('active', isRegister);

    if (loginForm) loginForm.style.display = isRegister ? 'none' : 'block';
    if (registerForm) registerForm.style.display = isRegister ? 'block' : 'none';

    if (isRegister) {
      this.updateRegisterFormRoleUI(this.currentLoginRole);
      const nameInput = document.getElementById('regNameInput');
      if (nameInput) nameInput.focus();
    } else {
      const emailInput = document.getElementById('loginEmailInput');
      if (emailInput) emailInput.focus();
    }
  },

  updateRegisterFormRoleUI(role) {
    const cleanRole = role || this.currentLoginRole || 'student';
    const badgeText = document.getElementById('registerRoleBadgeText');
    const emailLabel = document.getElementById('regEmailLabel');
    const studentExtra = document.getElementById('regStudentExtraFields');
    const recruiterExtra = document.getElementById('regRecruiterExtraFields');
    const officerExtra = document.getElementById('regOfficerExtraFields');

    const roleTitles = {
      student: 'Register as Student',
      officer: 'Register as Placement Officer',
      recruiter: 'Register as Recruiter',
      admin: 'Register as System Administrator'
    };

    if (badgeText) badgeText.textContent = roleTitles[cleanRole] || 'Register New Account';
    if (emailLabel) {
      if (cleanRole === 'student') emailLabel.innerHTML = '<i class="far fa-envelope"></i> Student College Email *';
      else if (cleanRole === 'recruiter') emailLabel.innerHTML = '<i class="far fa-envelope"></i> Recruiter Corporate Email *';
      else if (cleanRole === 'officer') emailLabel.innerHTML = '<i class="far fa-envelope"></i> Officer Institutional Email *';
      else emailLabel.innerHTML = '<i class="far fa-envelope"></i> Administrator Email *';
    }

    if (studentExtra) studentExtra.style.display = (cleanRole === 'student') ? 'block' : 'none';
    if (recruiterExtra) {
      recruiterExtra.style.display = (cleanRole === 'recruiter') ? 'block' : 'none';
      if (cleanRole === 'recruiter') {
        const compSelect = document.getElementById('regCompanySelect');
        if (compSelect) {
          const approvedCompanies = window.ptsState?.data?.companies || [];
          compSelect.innerHTML = `<option value="">-- Choose Admin-Approved Company --</option>` +
            approvedCompanies.map(c => `<option value="${c.name}">${c.name} (${c.ctc || ''} • ${c.role || ''})</option>`).join('');
        }
      }
    }
    if (officerExtra) officerExtra.style.display = (cleanRole === 'officer') ? 'block' : 'none';
  },

  attemptRegister(role, formData) {
    const cleanRole = role || this.currentLoginRole || 'student';
    const res = window.ptsState.registerUser({
      role: cleanRole,
      ...formData
    }, false, this.currentSessionId);

    if (res.code === 'COMPANY_NOT_APPROVED') {
      this.showToast(res.message, 'danger');
      return;
    }

    if (res.code === 'EMAIL_EXISTS') {
      this.showToast(res.message, 'warning');
      const loginEmailInput = document.getElementById('loginEmailInput');
      if (loginEmailInput && formData.email) loginEmailInput.value = formData.email;
      this.switchAuthMode('login');
      return;
    }

    if (res.code === 'SESSION_LOCKED') {
      this.pendingLogin = { role: cleanRole, email: formData.email, password: formData.password };
      const conflictModal = document.getElementById('sessionConflictModal');
      const activeUserEl = document.getElementById('conflictActiveUserName');
      const activeDetailsEl = document.getElementById('conflictActiveDetails');

      if (activeUserEl) activeUserEl.textContent = `${res.activeSession.userName} (${res.activeSession.role.toUpperCase()})`;
      if (activeDetailsEl) activeDetailsEl.textContent = `User: ${res.activeSession.email} • Session started: ${res.activeSession.loginTime}`;
      if (conflictModal) conflictModal.classList.add('active');
      return;
    }

    if (res.success) {
      this.currentSessionId = res.sessionId;
      sessionStorage.setItem('PTS_TAB_SESSION_ID', res.sessionId);

      if (this.sessionChannel) {
        this.sessionChannel.postMessage({
          type: 'SESSION_ACQUIRED',
          sessionId: res.sessionId,
          user: res.user.name,
          role: res.user.role
        });
      }

      this.onLoginSuccess(res.user, false);
      this.showToast(`✨ Account created successfully! Welcome, ${res.user.name}. You can sign in anytime using this password.`, 'success');
      this.updateSessionGuardBanner();
    } else {
      this.showToast(res.message || 'Registration failed. Please check your inputs.', 'danger');
    }
  },

  attemptLogin(role, email, password, forceOverride = false) {
    const cleanRole = role || this.currentLoginRole || 'student';
    const res = window.ptsState.login(cleanRole, email, password, forceOverride, this.currentSessionId);

    if (res.code === 'COMPANY_NOT_INCLUDED') {
      this.showToast(res.message, 'danger');
      return;
    }

    if (res.code === 'USER_NOT_FOUND') {
      this.showToast(res.message, 'warning');
      return;
    }

    if (res.code === 'ROLE_MISMATCH') {
      this.showToast(res.message, 'danger');
      return;
    }

    if (res.code === 'INVALID_PASSWORD') {
      this.showToast(res.message, 'danger');
      return;
    }

    if (res.code === 'SESSION_LOCKED') {
      // Prompt single-user lock conflict modal
      this.pendingLogin = { role: cleanRole, email, password };
      const conflictModal = document.getElementById('sessionConflictModal');
      const activeUserEl = document.getElementById('conflictActiveUserName');
      const activeDetailsEl = document.getElementById('conflictActiveDetails');

      if (activeUserEl) activeUserEl.textContent = `${res.activeSession.userName} (${res.activeSession.role.toUpperCase()})`;
      if (activeDetailsEl) activeDetailsEl.textContent = `User: ${res.activeSession.email} • Session started: ${res.activeSession.loginTime}`;
      if (conflictModal) conflictModal.classList.add('active');
      return;
    }

    if (res.success) {
      this.currentSessionId = res.sessionId;
      sessionStorage.setItem('PTS_TAB_SESSION_ID', res.sessionId);

      // Notify any other tabs to terminate their session
      if (this.sessionChannel) {
        this.sessionChannel.postMessage({
          type: 'SESSION_ACQUIRED',
          sessionId: res.sessionId,
          user: res.user.name,
          role: res.user.role
        });
      }

      this.onLoginSuccess(res.user, false);
      if (res.isNewRegistration) {
        this.showToast(`✨ Account created! Registered as ${res.user.role.toUpperCase()} with your password.`, 'success');
      } else {
        this.showToast(`Welcome back, ${res.user.name}! Signed in as ${res.user.role.toUpperCase()}.`, 'success');
      }
      this.updateSessionGuardBanner();
    } else {
      this.showToast(res.message || 'Login failed. Please check your credentials.', 'danger');
    }
  },

  handleSessionBroadcast(msg) {
    if (!msg) return;
    if (msg.type === 'SESSION_ACQUIRED' && this.currentSessionId && this.currentSessionId !== msg.sessionId) {
      // Another window or login acquired the single session lock!
      this.onSessionTerminatedByOther(msg.user);
    } else if (msg.type === 'SESSION_LOGOUT') {
      this.updateSessionGuardBanner();
    }
  },

  onSessionTerminatedByOther(otherUser) {
    this.currentSessionId = null;
    sessionStorage.removeItem('PTS_TAB_SESSION_ID');

    // Show Terminated Alert Modal
    const termModal = document.getElementById('sessionTerminatedModal');
    if (termModal) termModal.classList.add('active');

    this.showLoginScreen();
    this.updateSessionGuardBanner();
  },

  updateSessionGuardBanner() {
    const banner = document.getElementById('sessionGuardBanner');
    const titleEl = document.getElementById('sessionGuardTitle');
    const textEl = document.getElementById('sessionGuardText');
    const iconEl = document.getElementById('sessionGuardIcon');

    const active = window.ptsState.getActiveSession();
    if (active && window.ptsState.isLoggedIn()) {
      if (banner) banner.classList.add('in-use');
      if (iconEl) { iconEl.className = 'fas fa-user-lock'; iconEl.style.color = '#fbbf24'; }
      if (titleEl) titleEl.textContent = `Active User Session: ${active.userName} (${active.role.toUpperCase()})`;
      if (textEl) textEl.textContent = `Logged in at ${active.loginTime}. Only 1 person can use a login at a time (Exclusive Lock).`;
    } else {
      if (banner) banner.classList.remove('in-use');
      if (iconEl) { iconEl.className = 'fas fa-shield-alt'; iconEl.style.color = 'var(--success)'; }
      if (titleEl) titleEl.textContent = 'Single-User Concurrency Guard: Standby';
      if (textEl) textEl.textContent = 'Only one person can use a user login at a time. Active sessions acquire exclusive lock.';
    }
  },

  switchLoginTab(role) {
    this.currentLoginRole = role;

    // Update active tab button style
    document.querySelectorAll('.login-role-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-login-role') === role);
    });

    const emailInput = document.getElementById('loginEmailInput');
    const roleBanner = document.getElementById('loginRoleDescription');
    const emailLabel = document.getElementById('loginEmailLabel');

    const roleConfigs = {
      student: {
        label: '<i class="far fa-envelope"></i> Student College Email / ID',
        email: 'student@college.edu',
        name: 'Student',
        desc: '<strong>Student Portal:</strong> Practice aptitude assessments, analyze ATS resume scores, check dynamic company eligibility, and track placement drive applications.'
      },
      officer: {
        label: '<i class="far fa-envelope"></i> Placement Officer Email / Employee ID',
        email: 'officer@college.edu',
        name: 'Placement Officer',
        desc: '<strong>Placement Officer Portal:</strong> Schedule campus recruitment drives, review student directory, advance selection rounds, and view executive analytics.'
      },
      recruiter: {
        label: '<i class="far fa-envelope"></i> Company Recruiter Work Email',
        email: 'recruiter@zoho.com',
        name: 'Recruiter',
        desc: '<strong>Recruiter Portal:</strong> Search verified student talent pool by skills/CGPA, post job openings, and manage the candidate hiring pipeline.'
      },
      admin: {
        label: '<i class="far fa-envelope"></i> Administrator Email / System ID',
        email: 'admin@college.edu',
        name: 'Administrator',
        desc: '<strong>Administrator Console:</strong> Full system diagnostics, user account management, security audit stream, and database JSON state backup/restore.'
      }
    };

    const cfg = roleConfigs[role] || roleConfigs.student;
    if (emailLabel) emailLabel.innerHTML = cfg.label;
    if (emailInput) {
      const defaultEmails = ['student@college.edu', 'officer@college.edu', 'recruiter@zoho.com', 'admin@college.edu', ''];
      if (defaultEmails.includes(emailInput.value.trim().toLowerCase())) {
        emailInput.value = cfg.email;
      }
    }
    if (roleBanner) roleBanner.innerHTML = cfg.desc;
    const quickRoleName = document.getElementById('quickRoleName');
    if (quickRoleName) quickRoleName.textContent = cfg.name;

    const submitBtn = document.getElementById('loginSubmitBtn');
    const authTabs = document.getElementById('authModeTabs');
    const authSwitchFooter = document.getElementById('authSwitchFooter');
    const brandIcon = document.getElementById('loginBrandIcon');
    const brandTitle = document.getElementById('loginBrandTitle');
    const brandSubtitle = document.getElementById('loginBrandSubtitle');

    if (role === 'admin') {
      if (brandIcon) {
        brandIcon.className = 'fas fa-shield-alt';
        if (brandIcon.parentElement) {
          brandIcon.parentElement.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2))';
          brandIcon.parentElement.style.color = '#f59e0b';
        }
      }
      if (brandTitle) brandTitle.textContent = 'Administrator Console Login';
      if (brandSubtitle) brandSubtitle.textContent = 'Placement Preparation & Tracking System • Institutional Admin Console';
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Sign In as Administrator';
        submitBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      }
      if (authTabs) authTabs.style.display = 'none';
      if (authSwitchFooter) authSwitchFooter.style.display = 'none';
      this.switchAuthMode('login');
    } else {
      if (brandIcon) {
        brandIcon.className = 'fas fa-graduation-cap';
        if (brandIcon.parentElement) {
          brandIcon.parentElement.style.background = '';
          brandIcon.parentElement.style.color = '';
        }
      }
      if (brandTitle) brandTitle.textContent = 'PlacementTrack Portal';
      if (brandSubtitle) brandSubtitle.textContent = 'Placement Preparation & Tracking System • Role-Based Authentication';
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In to Portal';
        submitBtn.style.background = '';
      }
      if (authTabs) authTabs.style.display = 'grid';
      if (authSwitchFooter) authSwitchFooter.style.display = 'block';
    }

    this.updateRegisterFormRoleUI(role);
  },

  onLoginSuccess(user, notify = true) {
    // Hide login screen
    const loginScreen = document.getElementById('loginPortalScreen');
    const appEl = document.getElementById('app');
    if (loginScreen) loginScreen.classList.add('hidden');
    if (appEl) appEl.style.display = 'flex';

    // Update Topbar User Chip
    const topbarAvatar = document.getElementById('topbarUserAvatar');
    const topbarName = document.getElementById('topbarUserName');
    const topbarRole = document.getElementById('topbarUserRole');

    if (topbarAvatar) topbarAvatar.textContent = user.avatar || user.name.charAt(0);
    if (topbarName) topbarName.textContent = user.name;
    if (topbarRole) topbarRole.textContent = user.role.toUpperCase();

    // Update Sidebar Footer Card
    const sideAvatar = document.getElementById('sidebarUserAvatar');
    const sideName = document.getElementById('sidebarUserName');
    const sideRole = document.getElementById('sidebarUserRole');

    if (sideAvatar) sideAvatar.textContent = user.avatar || user.name.charAt(0);
    if (sideName) sideName.textContent = `${user.name} (${user.role.toUpperCase()})`;
    if (sideRole) sideRole.textContent = user.title || `${user.department || ''}`;

    // Apply strict role permissions to sidebar navigation
    this.applyRolePermissions(user.role);

    // Route to user's home portal
    if (user.role === 'student') {
      this.navigateTo('student');
    } else if (user.role === 'officer') {
      this.navigateTo('officer');
    } else if (user.role === 'recruiter') {
      this.navigateTo('recruiter');
    } else if (user.role === 'admin') {
      this.navigateTo('admin');
    }

    if (notify) {
      this.showToast(`Welcome, ${user.name}! Logged in as ${user.role.toUpperCase()}`, 'success');
    }
  },

  showLoginScreen() {
    const loginScreen = document.getElementById('loginPortalScreen');
    const appEl = document.getElementById('app');
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appEl) appEl.style.display = 'none';
    this.switchAuthMode('login');
    this.switchLoginTab(this.currentLoginRole || 'student');
    this.updateSessionGuardBanner();
  },

  enterAdminLoginMode() {
    this.switchLoginTab('admin');
  },

  exitAdminLoginMode() {
    this.switchLoginTab('student');
  },

  logout() {
    window.ptsState.logout();
    this.currentSessionId = null;
    sessionStorage.removeItem('PTS_TAB_SESSION_ID');

    if (this.sessionChannel) {
      this.sessionChannel.postMessage({ type: 'SESSION_LOGOUT' });
    }

    this.showLoginScreen();
    this.showToast('You have been logged out successfully. Session lock released.', 'info');
  },

  applyRolePermissions(role) {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      const allowedRoles = item.getAttribute('data-roles');
      if (!allowedRoles) {
        item.style.display = 'flex';
        return;
      }

      const roleList = allowedRoles.split(',').map(r => r.trim());
      if (roleList.includes(role)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });

    // Core Portals Section Header title for Admin vs Student/Officer/Recruiter
    const coreTitle = document.getElementById('sidebarCorePortalsTitle');
    if (coreTitle) {
      coreTitle.textContent = (role === 'admin') ? 'Administrator Console' : 'Core Portals';
    }

    // Manage AI section header visibility (Student practice only)
    const aiSectionTitle = document.getElementById('sidebarNavAiSection');
    if (aiSectionTitle) {
      if (role === 'student') {
        aiSectionTitle.style.display = 'block';
      } else {
        aiSectionTitle.style.display = 'none';
      }
    }
  },

  initNotificationBell() {
    const bellBtn = document.getElementById('notifBellBtn');
    const modal = document.getElementById('notificationsModal');
    const closeBtn = document.getElementById('closeNotifModalBtn');

    if (bellBtn && modal) {
      bellBtn.addEventListener('click', () => {
        this.renderNotificationsList();
        modal.classList.add('active');
        // Hide notification dot
        const dot = document.querySelector('.notification-dot');
        if (dot) dot.style.display = 'none';
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  },

  renderNotificationsList() {
    const container = document.getElementById('notificationsModalBody');
    if (!container) return;

    const notifs = window.ptsState.data.notifications;
    container.innerHTML = notifs.map(n => `
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1rem; margin-bottom:0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
          <strong style="color:var(--text-main); font-size:0.95rem;">${n.title}</strong>
          <span style="font-size:0.75rem; color:var(--text-dim);">${n.date}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.4;">${n.message}</p>
      </div>
    `).join('');
  },

  initResetButton() {
    const resetBtn = document.getElementById('topResetDemoBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset demo state to initial dataset? This will restore mock companies, applications, and tests.')) {
          window.ptsState.resetToDefault();
          this.showToast('Demo data reset to initial academic state!', 'info');
          setTimeout(() => location.reload(), 400);
        }
      });
    }
  },

  initMobileMenu() {
    const toggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.querySelector('.sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }
  },

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'danger') icon = 'fa-times-circle';

    toast.innerHTML = `
      <i class="fas ${icon}" style="font-size:1.1rem;"></i>
      <span style="flex:1;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ==========================================
  // Supabase Cloud Backend UI Controller
  // ==========================================
  initSupabaseUI() {
    const statusBtn = document.getElementById('supabaseStatusBtn');
    const loginOpenBtn = document.getElementById('loginOpenSupabaseModalBtn');
    const modal = document.getElementById('supabaseConfigModal');
    const closeBtn = document.getElementById('closeSupabaseModalBtn');
    const settingsForm = document.getElementById('supabaseSettingsForm');
    const testBtn = document.getElementById('testSbConnBtn');
    const disconnectBtn = document.getElementById('disconnectSbBtn');
    const toggleKeyBtn = document.getElementById('toggleAnonKeyBtn');
    const seedBtn = document.getElementById('startSeedMigrationBtn');
    const copyPathBtn = document.getElementById('copySchemaPathBtn');

    const urlInput = document.getElementById('sbUrlInput');
    const keyInput = document.getElementById('sbAnonKeyInput');

    // Populate existing config in inputs
    if (window.ptsSupabase) {
      const cfg = window.ptsSupabase.getConfig();
      if (urlInput && cfg.url) urlInput.value = cfg.url;
      if (keyInput && cfg.anonKey) keyInput.value = cfg.anonKey;
    }

    // Modal open / close handlers
    const openModal = () => {
      if (modal) {
        modal.classList.add('active');
        this.updateSupabaseStatsUI();
      }
    };

    if (statusBtn) statusBtn.addEventListener('click', openModal);
    if (loginOpenBtn) loginOpenBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', () => modal?.classList.remove('active'));

    // Toggle password visibility
    if (toggleKeyBtn && keyInput) {
      toggleKeyBtn.addEventListener('click', () => {
        const isPass = keyInput.type === 'password';
        keyInput.type = isPass ? 'text' : 'password';
        toggleKeyBtn.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i> Hide Key' : '<i class="fas fa-eye"></i> Show Key';
      });
    }

    // Test live connection button
    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        const url = urlInput?.value.trim();
        const key = keyInput?.value.trim();
        if (!url || !key) {
          this.showToast('Please enter both Project URL and Anon Public Key', 'warning');
          return;
        }

        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';

        const res = await window.ptsSupabase.testConnection(url, key);
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fas fa-bolt"></i> Test Connection';

        if (res.success) {
          this.showToast(res.message, 'success');
        } else {
          this.showToast(`Connection failed: ${res.error}`, 'danger');
        }
      });
    }

    // Save and Connect
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = urlInput?.value.trim();
        const key = keyInput?.value.trim();

        const saveBtn = document.getElementById('saveSbConnBtn');
        if (saveBtn) {
          saveBtn.disabled = true;
          saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        }

        const success = window.ptsSupabase.saveConfig(url, key, true);
        if (success) {
          await window.ptsState.initSupabaseSync();
          this.showToast('Supabase connected! State synced from cloud.', 'success');
          this.updateSupabaseStatsUI();
        } else {
          this.showToast('Could not initialize Supabase client. Check credentials.', 'danger');
        }

        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerHTML = '<i class="fas fa-save"></i> Save & Connect';
        }
      });
    }

    // Disconnect
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        if (confirm('Disconnect from Supabase? The application will fall back to local demo storage.')) {
          window.ptsSupabase.clearConfig();
          if (urlInput) urlInput.value = '';
          if (keyInput) keyInput.value = '';
          this.showToast('Disconnected from Supabase. Running in local mode.', 'info');
        }
      });
    }

    // 1-Click Cloud Data Migration
    if (seedBtn) {
      seedBtn.addEventListener('click', async () => {
        if (!window.ptsSupabase.isReady()) {
          this.showToast('Please connect to Supabase first before migrating data.', 'warning');
          return;
        }

        if (!confirm('Upload current state (all students, drives, applications, question banks, and audit logs) to your Supabase PostgreSQL database?')) {
          return;
        }

        const progressContainer = document.getElementById('migrationProgressContainer');
        const progressBar = document.getElementById('migrationProgressBar');
        const progressPercent = document.getElementById('migrationProgressPercent');
        const statusLabel = document.getElementById('migrationStatusLabel');

        if (progressContainer) progressContainer.style.display = 'block';
        seedBtn.disabled = true;

        const res = await window.ptsSupabaseService.seedLocalDataToSupabase(window.ptsState.data, (msg, pct) => {
          if (statusLabel) statusLabel.textContent = msg;
          if (progressBar) progressBar.style.width = `${pct}%`;
          if (progressPercent) progressPercent.textContent = `${pct}%`;
        });

        seedBtn.disabled = false;

        if (res.success) {
          this.showToast('Cloud database seeded successfully! All tables live in Supabase.', 'success');
          this.updateSupabaseStatsUI();
        } else {
          this.showToast(`Migration error: ${res.error}. Make sure schema.sql has been run!`, 'danger');
        }
      });
    }

    // Copy Schema Path
    if (copyPathBtn) {
      copyPathBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText('supabase/schema.sql');
        this.showToast('Copied "supabase/schema.sql" to clipboard!', 'info');
      });
    }

    // Watch status changes to update UI badges
    if (window.ptsSupabase) {
      window.ptsSupabase.onStatusChange((status, isConnected, latency) => {
        this.renderSupabaseStatusBadges(status, isConnected, latency);
      });
    }
  },

  renderSupabaseStatusBadges(status, isConnected, latency) {
    const topDot = document.getElementById('supabaseStatusDot');
    const topLabel = document.getElementById('supabaseStatusLabel');
    const loginDot = document.getElementById('loginSupabaseDot');
    const loginTitle = document.getElementById('loginSupabaseTitle');
    const modalDot = document.getElementById('modalStatusDot');
    const modalTitle = document.getElementById('modalStatusTitle');
    const modalBadge = document.getElementById('modalLatencyBadge');
    const modalDesc = document.getElementById('modalStatusDesc');

    if (status === 'connected') {
      if (topDot) topDot.className = 'status-indicator-dot connected';
      if (topLabel) topLabel.textContent = `Supabase: Live (${latency || 30}ms)`;
      if (loginDot) loginDot.className = 'status-indicator-dot connected';
      if (loginTitle) loginTitle.innerHTML = `<span style="color:#10b981;">🟢 Supabase Cloud: Live PostgreSQL Connected</span> (${latency || 30}ms)`;

      if (modalDot) modalDot.className = 'status-indicator-dot connected';
      if (modalTitle) modalTitle.innerHTML = '<span style="color:#10b981;">Current Status: Connected (Live PostgreSQL)</span>';
      if (modalBadge) {
        modalBadge.textContent = `Ping: ${latency || 30} ms`;
        modalBadge.className = 'badge badge-success';
      }
      if (modalDesc) {
        modalDesc.textContent = 'All changes to student profiles, campus drives, applications, and session presence sync directly to your Supabase PostgreSQL database in real-time.';
      }
    } else if (status === 'needs_schema') {
      if (topDot) topDot.className = 'status-indicator-dot connecting';
      if (topLabel) topLabel.textContent = 'Supabase: Needs Schema';
      if (loginDot) loginDot.className = 'status-indicator-dot connecting';
      if (loginTitle) loginTitle.innerHTML = '<span style="color:#f59e0b;">🟡 Supabase Reachable! Run schema.sql in SQL Editor</span>';

      if (modalDot) modalDot.className = 'status-indicator-dot connecting';
      if (modalTitle) modalTitle.innerHTML = '<span style="color:#f59e0b;">Current Status: Project Connected (Tables Pending)</span>';
      if (modalBadge) {
        modalBadge.textContent = `Ping: ${latency || 30} ms`;
        modalBadge.className = 'badge badge-warning';
      }
      if (modalDesc) {
        modalDesc.innerHTML = '<strong>Almost ready!</strong> Your Supabase project is connected and reachable. Please run <code>supabase/schema.sql</code> in your <a href="https://supabase.com/dashboard/project/qtsothmldarlqybjyfwb/sql/new" target="_blank" style="color:var(--primary-light);">Supabase SQL Editor</a> to create the database tables.';
      }
    } else if (status === 'connecting') {
      if (topDot) topDot.className = 'status-indicator-dot connecting';
      if (topLabel) topLabel.textContent = 'Supabase: Connecting...';
      if (loginDot) loginDot.className = 'status-indicator-dot connecting';
      if (loginTitle) loginTitle.textContent = 'Backend: Connecting to Supabase...';
      if (modalDot) modalDot.className = 'status-indicator-dot connecting';
      if (modalTitle) modalTitle.textContent = 'Current Status: Connecting...';
    } else {
      if (topDot) topDot.className = 'status-indicator-dot';
      if (topLabel) topLabel.textContent = 'Supabase: Offline (Local)';
      if (loginDot) loginDot.className = 'status-indicator-dot';
      if (loginTitle) loginTitle.textContent = 'Backend: Local Fallback Mode';

      if (modalDot) modalDot.className = 'status-indicator-dot';
      if (modalTitle) modalTitle.textContent = 'Current Status: Offline (Local Mode)';
      if (modalBadge) {
        modalBadge.textContent = 'Ping: -- ms';
        modalBadge.className = 'badge';
      }
      if (modalDesc) {
        modalDesc.textContent = 'The application is currently operating in local mode using browser storage. Connect your free Supabase project to enable live PostgreSQL persistence, multi-user real-time syncing, and cloud resume uploads.';
      }
    }
  },

  async updateSupabaseStatsUI() {
    if (!window.ptsSupabase || !window.ptsSupabase.isReady()) {
      const countsGrid = document.getElementById('modalTableCountsGrid');
      if (countsGrid) countsGrid.style.display = 'none';
      return;
    }

    const countsGrid = document.getElementById('modalTableCountsGrid');
    const stats = await window.ptsSupabase.getTableStats();
    if (stats && countsGrid) {
      countsGrid.style.display = 'grid';
      const pEl = document.getElementById('cntProfiles');
      const cEl = document.getElementById('cntCompanies');
      const aEl = document.getElementById('cntApps');
      const qEl = document.getElementById('cntQuestions');

      if (pEl) pEl.textContent = stats.profiles;
      if (cEl) cEl.textContent = stats.companies;
      if (aEl) aEl.textContent = stats.applications;
      if (qEl) qEl.textContent = stats.questions;
    }
  },

  // Horizontal Scroll Control Methods
  scrollPageLeft(amount = 350) {
    const mainWrapper = document.querySelector('.main-wrapper');
    const contentArea = document.querySelector('.content-area');

    window.scrollBy({ left: -amount, behavior: 'smooth' });
    document.documentElement.scrollBy({ left: -amount, behavior: 'smooth' });
    document.body.scrollBy({ left: -amount, behavior: 'smooth' });

    if (mainWrapper) mainWrapper.scrollBy({ left: -amount, behavior: 'smooth' });
    if (contentArea) contentArea.scrollBy({ left: -amount, behavior: 'smooth' });
  },

  scrollPageRight(amount = 350) {
    const mainWrapper = document.querySelector('.main-wrapper');
    const contentArea = document.querySelector('.content-area');

    window.scrollBy({ left: amount, behavior: 'smooth' });
    document.documentElement.scrollBy({ left: amount, behavior: 'smooth' });
    document.body.scrollBy({ left: amount, behavior: 'smooth' });

    if (mainWrapper) mainWrapper.scrollBy({ left: amount, behavior: 'smooth' });
    if (contentArea) contentArea.scrollBy({ left: amount, behavior: 'smooth' });
  },

  scrollTabsLeft(containerId) {
    const container = document.getElementById(containerId) || document.querySelector('.tab-navigation');
    if (container) {
      container.scrollBy({ left: -220, behavior: 'smooth' });
    }
  },

  scrollTabsRight(containerId) {
    const container = document.getElementById(containerId) || document.querySelector('.tab-navigation');
    if (container) {
      container.scrollBy({ left: 220, behavior: 'smooth' });
    }
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Mermaid with dark theme
  if (window.mermaid) {
    window.mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        primaryColor: '#6366f1',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#818cf8',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: 'Inter, sans-serif'
      }
    });
  }

  window.App.init();
});
