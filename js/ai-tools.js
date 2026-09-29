/**
 * Placement Preparation and Tracking System
 * AI Resume Analyzer & AI Mock Interview Simulator
 */

window.AiToolsModule = {
  // Voice Synthesis State
  speechEnabled: true,
  currentUtterance: null,

  // Interview Simulator State
  interviewState: {
    active: false,
    mode: 'Technical', // 'Technical' or 'HR'
    currentQuestionIndex: 0,
    questions: [],
    transcript: [], // [ { sender: 'bot'|'user', text, score, feedback } ]
    totalScore: 0
  },

  init() {
    this.initResumeAnalyzer();
    this.initInterviewBot();
  },

  // ==========================================
  // 1. AI Resume Analyzer & ATS Calculator
  // ==========================================
  initResumeAnalyzer() {
    const analyzeBtn = document.getElementById('analyzeResumeBtn');
    const loadSampleBtn = document.getElementById('loadSampleResumeBtn');
    const resumeTextInput = document.getElementById('resumeContentInput');
    const resumeFileInput = document.getElementById('resumeFileUpload');

    if (loadSampleBtn) {
      loadSampleBtn.addEventListener('click', () => {
        const student = window.ptsState.data.currentUser;
        const internText = (student && student.hasInternship && student.internship?.company) 
          ? `Internship Experience:\nSoftware Engineering Intern at ${student.internship.company} (${student.internship.duration || '3 Months'})\nDomain / Topic: ${student.internship.topic}\nContributions: ${student.internship.description || 'Engineered high-throughput backend services.'}`
          : 'Internship Experience: General academic projects and laboratory coursework.';
        const hackText = (student && student.hasHackathons && student.hackathons?.length && student.hackathons[0].name)
          ? `Hackathons & Competitions:\n- ${student.hackathons[0].name} (${student.hackathons[0].achievement || 'Finalist'}) - Topic: ${student.hackathons[0].topic || 'AI System'}`
          : 'Hackathons: Active participant in campus algorithmic hackathons.';
        const eduHeader = (student && student.educationStatus === 'graduated')
          ? `Graduate (${student.completedDegree || student.degree || 'B.E. Computer Science'}, ${student.graduationYear || '2025'})`
          : `Currently Pursuing: ${student?.pursuingYear || '4th Year / Final Year'} (${student?.degree || 'B.E.'} in ${student?.department || 'CSE'})`;
        const sampleText = `${student?.name || 'Sashti'} - ${eduHeader}, ${student?.college || 'Sri Krishna College of Engineering and Technology'}. CGPA: ${student?.cgpa || 8.45}/10.
Languages (Well-Versed): ${(student?.wellVersedLanguages || ['Python', 'Java', 'C++', 'C']).join(', ')}.
Technical Skills: ${(student?.skills || ['Data Structures', 'React', 'SQL', 'Docker', 'AWS']).join(', ')}.

${internText}

${hackText}

Academic Projects:
1. Placement Preparation and Tracking System: Full-stack portal with AI ATS scoring and mock interview bot.
2. Smart Healthcare Predictive System using Scikit-Learn and Flask.`;
        if (resumeTextInput) resumeTextInput.value = sampleText;
        window.App.showToast('Loaded student profile resume text.', 'info');
      });
    }

    if (resumeFileInput) {
      resumeFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (resumeTextInput) resumeTextInput.value = event.target.result;
            window.App.showToast(`Loaded ${file.name}!`, 'success');
          };
          reader.readAsText(file);

          // Upload to Supabase Storage if connected
          if (window.ptsSupabaseService && window.ptsSupabaseService.isAvailable()) {
            const student = window.ptsState.data.currentUser;
            window.App.showToast(`Uploading ${file.name} to Supabase Storage...`, 'info');
            const uploadRes = await window.ptsSupabaseService.uploadResumeFile(file, student.id);
            if (uploadRes.success) {
              window.App.showToast(`Resume uploaded to Supabase Storage cloud!`, 'success');
              student.resumeUploaded = true;
              student.resumeName = uploadRes.name;
              student.resumeUrl = uploadRes.url;
              window.ptsState.saveState();
            } else {
              console.warn('Storage upload error:', uploadRes.error);
            }
          }
        }
      });
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.analyzeResume());
    }
  },

  analyzeResume() {
    const textEl = document.getElementById('resumeContentInput');
    const roleEl = document.getElementById('targetRoleSelect');
    const text = textEl ? textEl.value.trim() : '';
    const targetRole = roleEl ? roleEl.value : 'Software Engineer';

    if (!text || text.length < 50) {
      window.App.showToast('Please paste a comprehensive resume or upload a text file (at least 50 characters).', 'warning');
      return;
    }

    // Role specific required keywords
    const roleKeywordDictionary = {
      'Software Engineer': {
        primary: ['python', 'java', 'c++', 'data structures', 'algorithms', 'sql', 'git', 'oop', 'rest', 'api', 'linux'],
        secondary: ['docker', 'cloud', 'aws', 'testing', 'ci/cd', 'database', 'problem solving', 'microservices'],
        verbs: ['developed', 'designed', 'built', 'optimized', 'implemented', 'reduced', 'increased', 'led']
      },
      'Full Stack Developer': {
        primary: ['javascript', 'typescript', 'react', 'node', 'express', 'html', 'css', 'sql', 'mongodb', 'rest api', 'git'],
        secondary: ['redux', 'graphql', 'next.js', 'docker', 'tailwind', 'responsive design', 'authentication'],
        verbs: ['created', 'deployed', 'architected', 'integrated', 'refactored', 'collaborated']
      },
      'Data Scientist / AI Engineer': {
        primary: ['python', 'machine learning', 'deep learning', 'pandas', 'numpy', 'scikit-learn', 'sql', 'tensorflow', 'pytorch'],
        secondary: ['statistics', 'nlp', 'computer vision', 'data visualization', 'tableau', 'big data'],
        verbs: ['analyzed', 'trained', 'evaluated', 'modeled', 'extracted', 'visualized']
      }
    };

    const dict = roleKeywordDictionary[targetRole] || roleKeywordDictionary['Software Engineer'];
    const lowerText = text.toLowerCase();

    // 1. Keyword Matching
    const matchedPrimary = dict.primary.filter(kw => lowerText.includes(kw));
    const missingPrimary = dict.primary.filter(kw => !lowerText.includes(kw));
    const matchedSecondary = dict.secondary.filter(kw => lowerText.includes(kw));
    const matchedVerbs = dict.verbs.filter(v => lowerText.includes(v));

    // 2. Metrics check (numbers, percentages)
    const hasMetrics = /\d+[\%|\+|\s*ms|\s*sec|\s*users|\s*k]/.test(text);

    // 3. Section checks
    const hasEducation = /education|b\.e|b\.tech|cgpa|gpa|university|college/i.test(text);
    const hasProjects = /projects|project\s*1|developed|application/i.test(text);
    const hasExperience = /experience|intern|internship|work/i.test(text);
    const hasSkills = /skills|technical\s*skills|competencies/i.test(text);

    // Score Calculation
    let score = 0;
    // Primary keywords (up to 45 pts)
    score += Math.round((matchedPrimary.length / dict.primary.length) * 45);
    // Secondary keywords (up to 15 pts)
    score += Math.round((matchedSecondary.length / dict.secondary.length) * 15);
    // Sections presence (up to 20 pts)
    if (hasEducation) score += 5;
    if (hasProjects) score += 5;
    if (hasExperience) score += 5;
    if (hasSkills) score += 5;
    // Action verbs & metrics (up to 20 pts)
    score += Math.min(10, matchedVerbs.length * 2);
    if (hasMetrics) score += 10;

    score = Math.min(98, Math.max(35, score));

    // Display Results
    const resultsContainer = document.getElementById('atsResultsContainer');
    if (resultsContainer) resultsContainer.style.display = 'block';

    const scoreNumberEl = document.getElementById('atsScoreNumber');
    const scoreRatingEl = document.getElementById('atsScoreRating');
    if (scoreNumberEl) scoreNumberEl.textContent = `${score}%`;

    if (scoreRatingEl) {
      if (score >= 80) {
        scoreRatingEl.innerHTML = '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Highly ATS Optimized</span>';
      } else if (score >= 65) {
        scoreRatingEl.innerHTML = '<span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Moderate Match</span>';
      } else {
        scoreRatingEl.innerHTML = '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Needs Major Keywords</span>';
      }
    }

    // Keyword Clouds
    const matchedKwEl = document.getElementById('atsMatchedKeywords');
    const missingKwEl = document.getElementById('atsMissingKeywords');

    if (matchedKwEl) {
      const allMatched = [...matchedPrimary, ...matchedSecondary];
      matchedKwEl.innerHTML = allMatched.map(k => `<span class="badge badge-success" style="margin:2px;">✓ ${k}</span>`).join(' ') || '<span style="color:var(--text-dim);">No core keywords detected</span>';
    }

    if (missingKwEl) {
      missingKwEl.innerHTML = missingPrimary.map(k => `<span class="badge badge-danger" style="margin:2px;">+ ${k}</span>`).join(' ') || '<span style="color:var(--success);">Great job! All core role keywords present.</span>';
    }

    // Actionable Suggestions
    const suggestionsList = document.getElementById('atsSuggestionsList');
    if (suggestionsList) {
      const suggestions = [];
      if (missingPrimary.length > 0) {
        suggestions.push(`Integrate missing critical skills for ${targetRole}: <strong>${missingPrimary.slice(0, 4).join(', ')}</strong>.`);
      }
      if (!hasMetrics) {
        suggestions.push('Add measurable outcome metrics to your projects (e.g. "Reduced query response latency by 35%").');
      }
      if (matchedVerbs.length < 3) {
        suggestions.push('Begin project bullet points with strong action verbs like "Architected", "Engineered", "Implemented".');
      }
      if (!hasExperience) {
        suggestions.push('Consider adding an Internship or Open Source contributions section to boost recruiter visibility.');
      }
      if (suggestions.length === 0) {
        suggestions.push('Your resume meets top tier ATS standards! Ensure clean formatting and export as a text-parsable PDF.');
      }

      suggestionsList.innerHTML = suggestions.map(s => `<li style="margin-bottom:0.4rem; font-size:0.85rem;">${s}</li>`).join('');
    }

    window.App.showToast(`Resume analysis complete. ATS Match: ${score}%`, 'success');
  },

  // ==========================================
  // 2. AI Voice-Only Mock Interview Simulator
  // ==========================================
  // Speech Recognition & Non-Repeating State
  recognition: null,
  isListening: false,
  speechBuffer: '',
  activeQuestionUtterance: null,

  initInterviewBot() {
    const startInterviewBtn = document.getElementById('startInterviewBtn');
    const sendBtn = document.getElementById('interviewSendBtn');
    const inputEl = document.getElementById('interviewAnswerInput');
    const speechToggleBtn = document.getElementById('interviewSpeechToggle');
    const micToggleBtn = document.getElementById('interviewMicToggleBtn');
    const clearSpeechBtn = document.getElementById('interviewClearSpeechBtn');

    // Initialize Web Speech Recognition
    this.initSpeechRecognition();

    if (speechToggleBtn) {
      speechToggleBtn.addEventListener('click', () => {
        this.speechEnabled = !this.speechEnabled;
        speechToggleBtn.innerHTML = this.speechEnabled 
          ? '<i class="fas fa-volume-up"></i> Bot Voice: ON' 
          : '<i class="fas fa-volume-mute"></i> Bot Voice: OFF';
        window.App.showToast(`Bot speech is now ${this.speechEnabled ? 'enabled' : 'muted'}.`, 'info');
      });
    }

    if (startInterviewBtn) {
      startInterviewBtn.addEventListener('click', () => {
        const mode = document.getElementById('interviewModeSelect').value;
        this.startInterview(mode);
      });
    }

    // Microphone Manual Toggle Button
    if (micToggleBtn) {
      micToggleBtn.addEventListener('click', () => {
        if (this.isListening) {
          this.stopVoiceListening();
        } else {
          this.startVoiceListening();
        }
      });
    }

    // Clear Spoken Words
    if (clearSpeechBtn) {
      clearSpeechBtn.addEventListener('click', () => {
        this.speechBuffer = '';
        if (inputEl) inputEl.value = '';
        this.updateSpeechPreview('');
        window.App.showToast('Voice transcription cleared. Speak again into your microphone.', 'info');
      });
    }

    // Send Voice Answer Button
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleUserAnswer());
    }

    // Prevent direct keyboard typing in voice-only mode
    if (inputEl) {
      inputEl.setAttribute('readonly', 'true');
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleUserAnswer();
        } else {
          window.App.showToast('🎙️ Voice-Only Session: Please speak your response using the microphone.', 'warning');
        }
      });
      inputEl.addEventListener('click', () => {
        if (!this.isListening && this.interviewState.active) {
          this.startVoiceListening();
        }
      });
    }
  },

  // Setup Web Speech Recognition Engine
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[AI Interview] Web Speech Recognition is not supported natively in this browser.');
      this.updateMicStatus('unsupported');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateMicStatus('listening');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece + ' ';
          } else {
            interimTranscript += piece;
          }
        }

        if (finalTranscript) {
          this.speechBuffer = (this.speechBuffer + ' ' + finalTranscript).trim();
        }

        const combinedText = (this.speechBuffer + (interimTranscript ? ' ' + interimTranscript : '')).trim();
        const inputEl = document.getElementById('interviewAnswerInput');
        if (inputEl) {
          inputEl.value = combinedText;
        }
        this.updateSpeechPreview(combinedText);

        // Check for vocal submission trigger command: "send answer" or "submit answer"
        const lower = combinedText.toLowerCase();
        if (lower.endsWith('submit answer') || lower.endsWith('send answer')) {
          this.speechBuffer = combinedText.replace(/submit answer|send answer/gi, '').trim();
          if (inputEl) inputEl.value = this.speechBuffer;
          this.handleUserAnswer();
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('[AI Interview] Speech recognition event:', event.error);
        if (event.error === 'not-allowed') {
          this.updateMicStatus('denied');
          window.App.showToast('Microphone access was denied. Please allow microphone permission in your browser address bar.', 'danger');
        } else if (event.error !== 'no-speech') {
          this.updateMicStatus('idle');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // If interview is still active and waiting for an answer, keep microphone active
        if (this.interviewState.active && this.interviewState.waitingForAnswer && !this.interviewState.evaluating) {
          try {
            this.recognition.start();
          } catch (e) {
            this.updateMicStatus('idle');
          }
        } else {
          this.updateMicStatus('idle');
        }
      };
    } catch (err) {
      console.warn('[AI Interview] Speech recognition init error:', err);
    }
  },

  startVoiceListening() {
    if (!this.interviewState.active) {
      window.App.showToast('Please click "Start Session" first to begin your mock interview.', 'warning');
      return;
    }

    if (!this.recognition) {
      this.promptManualVoiceFallback();
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      this.updateMicStatus('listening');
    } catch (e) {
      // If already started or aborting, reset state
      this.isListening = true;
      this.updateMicStatus('listening');
    }
  },

  stopVoiceListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    this.updateMicStatus('idle');
  },

  updateMicStatus(status) {
    const statusPill = document.getElementById('interviewMicStatusPill');
    const micBtn = document.getElementById('interviewMicToggleBtn');
    const waveEl = document.getElementById('interviewAudioWave');

    if (!statusPill) return;

    if (status === 'listening') {
      statusPill.className = 'badge badge-danger voice-pulse-badge';
      statusPill.innerHTML = '<i class="fas fa-circle" style="animation: pulse 1s infinite;"></i> 🔴 Recording Voice... (Speak Now)';
      if (micBtn) {
        micBtn.className = 'btn btn-danger btn-sm';
        micBtn.innerHTML = '<i class="fas fa-stop"></i> Pause Mic';
      }
      if (waveEl) waveEl.style.display = 'flex';
    } else if (status === 'unsupported' || status === 'denied') {
      statusPill.className = 'badge badge-warning';
      statusPill.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Mic Blocked / Browser Speech Fallback Active';
      if (micBtn) {
        micBtn.className = 'btn btn-outline btn-sm';
        micBtn.innerHTML = '<i class="fas fa-microphone-slash"></i> Mic Inactive';
      }
      if (waveEl) waveEl.style.display = 'none';
    } else {
      statusPill.className = 'badge badge-secondary';
      statusPill.innerHTML = '<i class="fas fa-microphone"></i> 🎙️ Mic Standby';
      if (micBtn) {
        micBtn.className = 'btn btn-primary btn-sm';
        micBtn.innerHTML = '<i class="fas fa-microphone"></i> Resume Mic';
      }
      if (waveEl) waveEl.style.display = 'none';
    }
  },

  updateSpeechPreview(text) {
    const previewEl = document.getElementById('interviewLiveSpeechPreview');
    if (previewEl) {
      if (text) {
        previewEl.innerHTML = `<strong><i class="fas fa-waveform-lines"></i> Transcribed Speech:</strong> <em>"${text}"</em>`;
        previewEl.style.display = 'block';
      } else {
        previewEl.innerHTML = '';
        previewEl.style.display = 'none';
      }
    }
  },

  promptManualVoiceFallback() {
    const simulated = prompt("Microphone API unavailable in this browser environment. Enter spoken response to simulate voice recognition:");
    if (simulated) {
      const inputEl = document.getElementById('interviewAnswerInput');
      if (inputEl) inputEl.value = simulated.trim();
      this.speechBuffer = simulated.trim();
      this.updateSpeechPreview(simulated.trim());
    }
  },

  // ==========================================
  // Smart Non-Repeating Question Selector
  // ==========================================
  getNonRepeatingQuestions(mode = 'Technical', count = 4) {
    const student = window.ptsState.data.currentUser || { id: 'STU-101' };
    const storageKey = `pts_asked_q_${student.id}_${mode}`;
    
    // Retrieve previously asked question IDs
    let askedIds = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) askedIds = JSON.parse(stored);
    } catch (e) {
      askedIds = [];
    }

    const allQuestions = window.ptsState.data.interviewQuestions.filter(q => q.type === mode);
    
    // Filter questions that have NOT been asked to this student yet
    let availablePool = allQuestions.filter(q => !askedIds.includes(q.id));

    // If remaining pool has fewer than required questions, cycle and reset asked list
    if (availablePool.length < count) {
      askedIds = [];
      availablePool = [...allQuestions];
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }

    // Fisher-Yates Random Shuffle to guarantee randomized selection
    for (let i = availablePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
    }

    // Pick top questions
    const selectedQuestions = availablePool.slice(0, count);

    // Save picked question IDs to prevent repetition in subsequent attempts
    const newAskedIds = [...askedIds, ...selectedQuestions.map(q => q.id)];
    try {
      localStorage.setItem(storageKey, JSON.stringify(newAskedIds));
    } catch (e) {}

    return selectedQuestions;
  },

  // ==========================================
  // Session Lifecycle
  // ==========================================
  startInterview(mode = 'Technical') {
    const selectedQuestions = this.getNonRepeatingQuestions(mode, 4);

    this.speechBuffer = '';
    this.interviewState = {
      active: true,
      mode,
      currentQuestionIndex: 0,
      questions: selectedQuestions,
      transcript: [],
      totalScore: 0,
      waitingForAnswer: false,
      evaluating: false
    };

    const container = document.getElementById('interviewChatBox');
    if (container) container.innerHTML = '';

    const inputEl = document.getElementById('interviewAnswerInput');
    if (inputEl) {
      inputEl.value = '';
      inputEl.setAttribute('readonly', 'true');
      inputEl.placeholder = '🎙️ Voice-Only Session: Microphone will listen automatically after each question...';
    }
    this.updateSpeechPreview('');

    // Session Opening Greeting
    const greetingText = `Hello Sashti! Welcome to your **AI Voice-Only Mock Interview** for **${mode} Round**.
In this session, **all responses must be spoken through your microphone**. Your speech will be converted to words in real-time.
I have curated **4 unique, non-repeating questions** from our placement bank. Let's begin!`;

    this.addBotMessage(greetingText);

    setTimeout(() => {
      this.askNextQuestion();
    }, 1500);
  },

  askNextQuestion() {
    const state = this.interviewState;
    if (state.currentQuestionIndex >= state.questions.length) {
      this.concludeInterview();
      return;
    }

    // Reset voice speech buffer for new question
    this.speechBuffer = '';
    const inputEl = document.getElementById('interviewAnswerInput');
    if (inputEl) {
      inputEl.value = '';
      inputEl.placeholder = '🎙️ Listening to your voice... Speak your response now!';
    }
    this.updateSpeechPreview('');

    const qObj = state.questions[state.currentQuestionIndex];
    const qText = `**Question ${state.currentQuestionIndex + 1} of ${state.questions.length} (${qObj.topic}):**\n\n${qObj.question}`;
    this.addBotMessage(qText);

    state.waitingForAnswer = true;
    state.evaluating = false;

    // Speak using Web Speech API Synthesis
    if (this.speechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(qObj.question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Automatically activate microphone and hear the voice after question is spoken!
      utterance.onend = () => {
        if (state.active && state.waitingForAnswer) {
          this.startVoiceListening();
        }
      };

      utterance.onerror = () => {
        if (state.active && state.waitingForAnswer) {
          this.startVoiceListening();
        }
      };

      this.activeQuestionUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // If voice is muted or synthesis not supported, immediately activate microphone!
      setTimeout(() => {
        if (state.active && state.waitingForAnswer) {
          this.startVoiceListening();
        }
      }, 600);
    }
  },

  handleUserAnswer() {
    const input = document.getElementById('interviewAnswerInput');
    if (!input) return;
    const answer = (input.value || this.speechBuffer).trim();
    if (!answer) {
      window.App.showToast('Please speak your answer into the microphone before sending.', 'warning');
      return;
    }

    // Stop listening while evaluating
    this.interviewState.waitingForAnswer = false;
    this.interviewState.evaluating = true;
    this.stopVoiceListening();

    input.value = '';
    this.speechBuffer = '';
    this.updateSpeechPreview('');
    this.addUserMessage(`🎙️ [Voice Response Transcribed]:\n"${answer}"`);

    const currentQ = this.interviewState.questions[this.interviewState.currentQuestionIndex];
    if (!currentQ) return;

    // Evaluate answer against key points
    const lowerAns = answer.toLowerCase();
    const matchedPoints = currentQ.keyPoints.filter(kp => lowerAns.includes(kp.toLowerCase()));
    
    // Evaluation heuristic: keyword match ratio + completeness depth
    let evalScore = Math.round((matchedPoints.length / currentQ.keyPoints.length) * 70);
    if (answer.length > 70) evalScore += 15;
    if (answer.length > 140) evalScore += 15;
    evalScore = Math.min(96, Math.max(35, evalScore));

    this.interviewState.totalScore += evalScore;

    // Structured AI Feedback
    let feedback = '';
    if (evalScore >= 80) {
      feedback = `🎯 **Excellent Response!** You articulated key points accurately: *${matchedPoints.join(', ') || 'comprehensive explanation'}*.`;
    } else if (evalScore >= 55) {
      feedback = `👍 **Good Attempt.** You correctly covered *${matchedPoints.join(', ') || 'the basics'}*, but in an interview make sure to also mention *${currentQ.keyPoints.filter(kp => !matchedPoints.includes(kp)).slice(0, 2).join(' & ')}*.`;
    } else {
      feedback = `💡 **Needs Improvement.** In technical interviews, emphasize: *${currentQ.keyPoints.slice(0, 3).join(', ')}*.\n**Model Answer Perspective:** "${currentQ.idealAnswer}"`;
    }

    setTimeout(() => {
      this.addBotMessage(`**AI Evaluation (Score: ${evalScore}/100):**\n${feedback}`);

      this.interviewState.currentQuestionIndex++;
      setTimeout(() => {
        this.askNextQuestion();
      }, 1600);
    }, 800);
  },

  concludeInterview() {
    this.interviewState.active = false;
    this.interviewState.waitingForAnswer = false;
    this.stopVoiceListening();

    const state = this.interviewState;
    const avgScore = Math.round(state.totalScore / (state.questions.length || 1));

    // Update student readiness communication & coding
    const student = window.ptsState.data.currentUser;
    if (student && student.readiness) {
      if (state.mode === 'HR') {
        student.readiness.communication = Math.round(student.readiness.communication * 0.7 + avgScore * 0.3);
      } else {
        student.readiness.coding = Math.round(student.readiness.coding * 0.7 + avgScore * 0.3);
      }
      student.readiness.overall = Math.round((student.readiness.aptitude + student.readiness.coding + student.readiness.communication) / 3);
      window.ptsState.saveState();
    }

    window.ptsState.addAuditLog(`Student completed Voice-Only AI Mock Interview (${state.mode}). Score: ${avgScore}%.`);

    this.addBotMessage(`🎉 **Voice Mock Interview Completed!**\n\n- **Questions Answered:** 4 Non-Repeating Questions\n- **Average Score:** **${avgScore}%**\n- **Voice Articulation:** Clear & Transcribed\n\nYour readiness scores have been refreshed. You can practice another round or **book a 1-on-1 session with a Placement Officer** below!`);

    const inputEl = document.getElementById('interviewAnswerInput');
    if (inputEl) {
      inputEl.placeholder = 'Session finished. Click "Start Session" to practice with fresh questions.';
    }

    if (window.StudentModule) {
      window.StudentModule.renderStudentDashboard();
    }
  },

  addBotMessage(text) {
    const container = document.getElementById('interviewChatBox');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot';
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
    bubble.innerHTML = `<strong><i class="fas fa-robot" style="color:var(--primary-light); margin-right:0.35rem;"></i> AI Interviewer:</strong><br>${formatted}`;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  },

  addUserMessage(text) {
    const container = document.getElementById('interviewChatBox');
    if (!container) return;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble user';
    bubble.innerHTML = `<strong>You:</strong><br>${text.replace(/\n/g, '<br>')}`;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
  }
};
