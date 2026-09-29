# Unbeatable — Placement Preparation and Tracking System (PTS) 🚀

An enterprise-grade campus placement preparation, tracking, and governance portal designed to streamline recruitment cycles between students, career placement officers, corporate recruiters, and institutional administrators.

---

## 🌟 Key Features

### 1. 🎓 Student Placement Portal
* **Dynamic Eligibility Checker**: Evaluates student eligibility based on CGPA cutoffs, standing arrears, departments, and specific skill prerequisites.
* **AI Resume ATS Analyzer & Parser**: PDF resume parser with keyword extraction, relevance matching against job descriptions, and actionable ATS improvement recommendations.
* **Interactive AI Mock Interview Simulator**: Real-time mock technical interviews with speech-to-text recognition, question evaluation, and rubrics.
* **1-on-1 Officer Mock Interview Scheduling**: Real-time booking with Google Meet links, session status tracking, and student feedback reporting.
* **Practice Question Arena**: LeetCode-style coding challenges and quantitative/logical aptitude MCQs with automated test evaluations.

### 2. 🏛️ Placement Officer Executive Console
* **Campus Recruitment Drives**: Announce drives, publish detailed technical requirements, set application deadlines, and monitor student applicants.
* **Candidate Selection Pipeline**: Advance applicants through stages (Applied → Aptitude Cleared → Shortlisted → Technical Round → HR Round → Placed).
* **Question Bank Upload & Student Completion Roster**: Dispatch LeetCode DSA problems and Aptitude MCQs, tracking completion status across all candidates.
* **Interview Feedback Hub**: Schedule mock interviews, record constructive candidate feedback, and review student feedback on interview conduct.

### 3. 🏢 Corporate Recruiter Portal
* **Job Openings Publisher**: Publish and manage on-campus drive listings.
* **Talent Pool Discovery**: Search verified student talent filtered by department, CGPA, and technical proficiencies (Python, Java, DSA, React, SQL, etc.).
* **ATS Candidate Screening**: Inspect candidate PDF resumes and review system ATS compatibility scores.
* **Applicant Review & Decision Management**: Accept candidates for interviews, schedule Google Meet / on-campus rounds, and issue selection notices.

### 4. 🛡️ Administrator Central Governance Console
* **Institutional Company Governance**: Administrator has the **exclusive right to officially include new visiting companies** and provision their corporate recruiter accounts.
* **Corporate Recruiter Login Gating**: Recruiters can only access and log in if their company has been officially included and approved by the Administrator.
* **Placement Officer Activity Audit**: Real-time presence monitoring and question dispatch log auditing.
* **Executive Placement Analytics**: Cohort placement percentages, top package offers, and hiring capacity quotas.
* **Security & Single-Session Lock**: Concurrent session conflict prevention with device session takeover verification.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Vanilla CSS3 (Custom design system with dark/light themes), JavaScript (ES6+ modular architecture).
* **Backend Services**: Node.js & Express / Java Spring Boot backend options.
* **Database & Cloud Storage**: Supabase (PostgreSQL database with Row Level Security and S3-compatible Resume Storage).
* **PDF & AI Tools**: PDF.js client-side text extractor, Web Speech Recognition API, and rule-based heuristic ATS engines.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sashtika-28/unbeatable.git
   cd unbeatable
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Start the local server**:
   ```bash
   node server.js
   ```
   *Alternatively, double click `run.bat` in the root directory.*

4. **Access the portal**:
   Open [http://localhost:5000](http://localhost:5000) in your web browser.

---

## 👥 Default Demo Accounts

| Role | Email | Password | Role Focus |
|---|---|---|---|
| **Student** | `student@college.edu` | `password123` | Placement preparation, ATS resume test, drive applications |
| **Placement Officer** | `officer@college.edu` | `password123` | Drives management, question dispatch, mock interview scheduling |
| **Recruiter** | `recruiter@zoho.com` | `password123` | Candidate discovery, ATS resume checks, interview decisions |
| **Administrator** | `admin@college.edu` | `password123` | Company inclusion, recruiter onboarding, portal audit & governance |

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
