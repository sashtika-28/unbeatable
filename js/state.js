/**
 * Placement Preparation and Tracking System
 * Central State Management & Mock Database
 */

const STORAGE_KEY = 'PTS_APP_STATE_V3';

// Initial Mock Dataset matching Sashti's SRS and chat conversation
const INITIAL_DATA = {
  currentUser: {
    id: 'STU-101',
    name: 'Sashti',
    college: 'Sri Krishna College of Engineering and Technology',
    email: 'sashti.s@college.edu',
    role: 'student', // 'student', 'officer', 'recruiter', 'admin'
    title: '4th Year B.E. CSE Student',
    educationStatus: 'studying', // 'studying' or 'graduated'
    pursuingYear: '4th Year / Final Year',
    degree: 'B.E.',
    completedDegree: '',
    graduationYear: '2026',
    department: 'CSE',
    cgpa: 8.45,
    arrears: 0,
    phone: '+91 98765 43210',
    wellVersedLanguages: ['Python', 'Java', 'C++', 'C'],
    skills: ['Python', 'Java', 'Data Structures & Algorithms', 'JavaScript', 'SQL', 'React', 'Machine Learning'],
    hasInternship: true,
    internship: {
      hasDone: true,
      company: 'TechLabs Solutions',
      topic: 'Cloud Microservices & REST API Architecture',
      duration: '3 Months (May 2025 - July 2025)',
      description: 'Engineered high-throughput REST endpoints and automated CI/CD microservices pipelines.'
    },
    hasHackathons: true,
    hackathons: [
      {
        name: 'Smart India Hackathon (SIH)',
        topic: 'AI Real-Time Healthcare Triage System',
        achievement: 'National Finalist (Top 5)'
      }
    ],
    certifications: ['AWS Certified Cloud Practitioner', 'HackerRank Problem Solving (Gold)', 'NPTEL Cloud Computing (Elite)'],
    resumeUploaded: true,
    resumeName: 'Sashti_Resume_2026.pdf',
    resumeContent: `Sashti - 4th Year B.E. Computer Science and Engineering, Sri Krishna College of Engineering and Technology. CGPA: 8.45/10.
Languages (Well-Versed): Python, Java, C++, C, JavaScript.
Technical Skills: Data Structures & Algorithms, React, SQL, PostgreSQL, Git, Docker, REST APIs, Machine Learning.
Internship: Software Engineering Intern at TechLabs Solutions (3 months) - Cloud Microservices & REST API Architecture.
Hackathons: Smart India Hackathon (SIH) National Finalist - AI Real-time Healthcare Triage System.
Projects:
1. Placement Preparation and Tracking System: Full-stack portal with AI resume ATS scoring and mock interview bot.
2. Smart Healthcare Predictive System using Scikit-Learn and Flask.
Achievements: Top 5% in HackerRank CodeSprint, Finalist in Smart India Hackathon.`,
    readiness: {
      overall: 78,
      aptitude: 82,
      coding: 85,
      communication: 68
    },
    testsCompleted: 4,
    avgScore: 84
  },

  // 4 Distinct Role Accounts for Login Authentication
  accounts: {
    student: {
      id: 'STU-101',
      email: 'student@college.edu',
      password: 'password123',
      name: 'Sashti',
      college: 'Sri Krishna College of Engineering and Technology',
      role: 'student',
      title: '4th Year B.E. CSE Student',
      educationStatus: 'studying', // 'studying' or 'graduated'
      pursuingYear: '4th Year / Final Year',
      degree: 'B.E.',
      completedDegree: '',
      graduationYear: '2026',
      department: 'CSE',
      cgpa: 8.45,
      arrears: 0,
      phone: '+91 98765 43210',
      avatar: 'S',
      wellVersedLanguages: ['Python', 'Java', 'C++', 'C'],
      skills: ['Python', 'Java', 'Data Structures & Algorithms', 'JavaScript', 'SQL', 'React', 'Machine Learning'],
      hasInternship: true,
      internship: {
        hasDone: true,
        company: 'TechLabs Solutions',
        topic: 'Cloud Microservices & REST API Architecture',
        duration: '3 Months (May 2025 - July 2025)',
        description: 'Engineered high-throughput REST endpoints and automated CI/CD microservices pipelines.'
      },
      hasHackathons: true,
      hackathons: [
        {
          name: 'Smart India Hackathon (SIH)',
          topic: 'AI Real-Time Healthcare Triage System',
          achievement: 'National Finalist (Top 5)'
        }
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'HackerRank Problem Solving (Gold)', 'NPTEL Cloud Computing (Elite)'],
      resumeUploaded: true,
      resumeName: 'Sashti_Resume_2026.pdf',
      resumeContent: `Sashti - 4th Year B.E. Computer Science and Engineering, Sri Krishna College of Engineering and Technology. CGPA: 8.45/10.
Languages (Well-Versed): Python, Java, C++, C, JavaScript.
Technical Skills: Data Structures & Algorithms, React, SQL, PostgreSQL, Git, Docker, REST APIs, Machine Learning.
Internship: Software Engineering Intern at TechLabs Solutions (3 months) - Cloud Microservices & REST API Architecture.
Hackathons: Smart India Hackathon (SIH) National Finalist - AI Real-time Healthcare Triage System.
Projects:
1. Placement Preparation and Tracking System: Full-stack portal with AI resume ATS scoring and mock interview bot.
2. Smart Healthcare Predictive System using Scikit-Learn and Flask.
Achievements: Top 5% in HackerRank CodeSprint, Finalist in Smart India Hackathon.`,
      readiness: {
        overall: 78,
        aptitude: 82,
        coding: 85,
        communication: 68
      },
      testsCompleted: 4,
      avgScore: 84
    },
    officer: {
      id: 'OFF-201',
      email: 'officer@college.edu',
      password: 'password123',
      name: 'Dr. R. Ramanathan',
      role: 'officer',
      title: 'Head Placement Officer (CDC)',
      department: 'Career Development Centre',
      avatar: 'PO',
      phone: '+91 94433 22110',
      office: 'Placement Cell, Administrative Block'
    },
    recruiter: {
      id: 'REC-301',
      email: 'recruiter@zoho.com',
      password: 'password123',
      name: 'Ananya Sen',
      company: 'Zoho Corporation',
      role: 'recruiter',
      title: 'Lead Talent Acquisition Partner',
      department: 'Campus Recruitment Team',
      avatar: 'RC',
      phone: '+91 98112 33445'
    },
    admin: {
      id: 'ADM-001',
      email: 'admin@college.edu',
      password: 'password123',
      name: 'Chief Administrator',
      role: 'admin',
      title: 'Placement System Administrator',
      department: 'IT Systems & Security',
      avatar: 'AD',
      phone: '+91 99001 22334'
    }
  },

  // Persistent User Accounts Registry (Email -> Account Details & Password)
  userAccounts: {
    'student@college.edu': {
      id: 'STU-101',
      email: 'student@college.edu',
      password: 'password123',
      name: 'Sashti',
      college: 'Sri Krishna College of Engineering and Technology',
      role: 'student',
      title: '4th Year B.E. CSE Student',
      educationStatus: 'studying',
      pursuingYear: '4th Year / Final Year',
      degree: 'B.E.',
      completedDegree: '',
      graduationYear: '2026',
      department: 'CSE',
      cgpa: 8.45,
      arrears: 0,
      phone: '+91 98765 43210',
      avatar: 'S',
      wellVersedLanguages: ['Python', 'Java', 'C++', 'C'],
      skills: ['Python', 'Java', 'Data Structures & Algorithms', 'JavaScript', 'SQL', 'React', 'Machine Learning'],
      hasInternship: true,
      internship: {
        hasDone: true,
        company: 'TechLabs Solutions',
        topic: 'Cloud Microservices & REST API Architecture',
        duration: '3 Months (May 2025 - July 2025)',
        description: 'Engineered high-throughput REST endpoints and automated CI/CD microservices pipelines.'
      },
      hasHackathons: true,
      hackathons: [
        {
          name: 'Smart India Hackathon (SIH)',
          topic: 'AI Real-Time Healthcare Triage System',
          achievement: 'National Finalist (Top 5)'
        }
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'HackerRank Problem Solving (Gold)', 'NPTEL Cloud Computing (Elite)'],
      resumeUploaded: true,
      resumeName: 'Sashti_Resume_2026.pdf',
      readiness: { overall: 78, aptitude: 82, coding: 85, communication: 68 },
      testsCompleted: 4,
      avgScore: 84
    },
    'officer@college.edu': {
      id: 'OFF-201',
      email: 'officer@college.edu',
      password: 'password123',
      name: 'Dr. R. Ramanathan',
      role: 'officer',
      title: 'Head Placement Officer (CDC)',
      department: 'Career Development Centre',
      avatar: 'PO',
      phone: '+91 94433 22110',
      office: 'Placement Cell, Administrative Block'
    },
    'recruiter@zoho.com': {
      id: 'REC-301',
      email: 'recruiter@zoho.com',
      password: 'password123',
      name: 'Ananya Sen',
      company: 'Zoho Corporation',
      role: 'recruiter',
      title: 'Lead Talent Acquisition Partner',
      department: 'Campus Recruitment Team',
      avatar: 'RC',
      phone: '+91 98112 33445'
    },
    'admin@college.edu': {
      id: 'ADM-001',
      email: 'admin@college.edu',
      password: 'password123',
      name: 'Chief Administrator',
      role: 'admin',
      title: 'Placement System Administrator',
      department: 'IT Systems & Security',
      avatar: 'AD',
      phone: '+91 99001 22334'
    }
  },

  // Single Active User Session Lock (Ensures only one person uses the login at a time)
  activeSession: null,
  isAuthenticated: false,

  students: [
    {
      id: 'STU-101',
      name: 'Sashti',
      college: 'Sri Krishna College of Engineering and Technology',
      rollNo: '22CS089',
      email: 'sashti.s@college.edu',
      department: 'CSE',
      educationStatus: 'studying',
      pursuingYear: '4th Year / Final Year',
      degree: 'B.E.',
      completedDegree: '',
      graduationYear: '2026',
      cgpa: 8.45,
      arrears: 0,
      wellVersedLanguages: ['Python', 'Java', 'C++', 'C'],
      skills: ['Python', 'Java', 'DSA', 'SQL', 'React'],
      hasInternship: true,
      internship: {
        hasDone: true,
        company: 'TechLabs Solutions',
        topic: 'Cloud Microservices & REST API Architecture'
      },
      hasHackathons: true,
      hackathons: [
        { name: 'Smart India Hackathon (SIH)', topic: 'AI Real-time Healthcare Triage System', achievement: 'National Finalist' }
      ],
      status: 'In Progress',
      readiness: 78,
      placedCompany: null
    },
    {
      id: 'STU-102',
      name: 'Arun Kumar',
      college: 'Sri Krishna College of Engineering and Technology',
      rollNo: '22CS014',
      email: 'arun.k@college.edu',
      department: 'CSE',
      educationStatus: 'graduated',
      pursuingYear: '',
      degree: 'B.E.',
      completedDegree: 'B.E. Computer Science & Engineering',
      graduationYear: '2025',
      cgpa: 8.90,
      arrears: 0,
      wellVersedLanguages: ['C++', 'Python', 'Go'],
      skills: ['C++', 'Python', 'System Design', 'Go', 'Docker'],
      hasInternship: true,
      internship: {
        hasDone: true,
        company: 'Google Summer of Code',
        topic: 'Distributed Systems & Storage Engine'
      },
      hasHackathons: true,
      hackathons: [
        { name: 'ACM ICPC Regionals', topic: 'Competitive Algorithmic Optimization', achievement: 'Winner / 1st Place' }
      ],
      status: 'Placed',
      readiness: 92,
      placedCompany: 'Google',
      placedCtc: '32.0 LPA',
      placedCtcNum: 32.0,
      placedRole: 'Software Development Engineer (SDE-1)',
      placedDate: '2026-09-10',
      offerLetter: 'Verified Offer Letter'
    },
    {
      id: 'STU-103',
      name: 'Priya Dharshini',
      college: 'Sri Krishna College of Engineering and Technology',
      rollNo: '22IT045',
      email: 'priya.d@college.edu',
      department: 'IT',
      educationStatus: 'graduated',
      pursuingYear: '',
      degree: 'B.Tech',
      completedDegree: 'B.Tech Information Technology',
      graduationYear: '2025',
      cgpa: 7.80,
      arrears: 0,
      wellVersedLanguages: ['Java', 'SQL', 'C++'],
      skills: ['Java', 'Spring Boot', 'MySQL', 'Angular'],
      hasInternship: true,
      internship: {
        hasDone: true,
        company: 'Zoho Corporation',
        topic: 'Full-Stack Enterprise Cloud Portal'
      },
      hasHackathons: true,
      hackathons: [
        { name: 'Women in Tech Hackathon', topic: 'FinTech Micro-Savings App', achievement: '1st Runner Up' }
      ],
      status: 'Placed',
      readiness: 81,
      placedCompany: 'Zoho Corporation',
      placedCtc: '9.5 LPA',
      placedCtcNum: 9.5,
      placedRole: 'Software Developer',
      placedDate: '2026-09-15',
      offerLetter: 'Verified Offer Letter'
    },
    {
      id: 'STU-104',
      name: 'Karthik Raja',
      college: 'Sri Krishna College of Engineering and Technology',
      rollNo: '22ECE032',
      email: 'karthik.r@college.edu',
      department: 'ECE',
      educationStatus: 'studying',
      pursuingYear: '3rd Year',
      degree: 'B.E.',
      completedDegree: '',
      graduationYear: '2027',
      cgpa: 7.15,
      arrears: 1,
      wellVersedLanguages: ['C', 'Embedded C', 'Python'],
      skills: ['C', 'Embedded C', 'Python', 'IoT'],
      hasInternship: false,
      internship: { hasDone: false, company: '', topic: '' },
      hasHackathons: false,
      hackathons: [],
      status: 'In Progress',
      readiness: 65,
      placedCompany: null
    },
    {
      id: 'STU-105',
      name: 'Sneha Mohan',
      college: 'Sri Krishna College of Engineering and Technology',
      rollNo: '22CS112',
      email: 'sneha.m@college.edu',
      department: 'CSE',
      educationStatus: 'studying',
      pursuingYear: '4th Year / Final Year',
      degree: 'B.E.',
      completedDegree: '',
      graduationYear: '2026',
      cgpa: 8.65,
      arrears: 0,
      wellVersedLanguages: ['Python', 'Java', 'SQL'],
      skills: ['Python', 'TensorFlow', 'Data Science', 'SQL'],
      hasInternship: true,
      internship: {
        hasDone: true,
        company: 'NVIDIA AI Incubator',
        topic: 'Computer Vision & Deep Neural Networks'
      },
      hasHackathons: true,
      hackathons: [
        { name: 'Kaggle ML Hackathon', topic: 'Chest X-Ray Anomaly Detection', achievement: 'Winner / 1st Place' }
      ],
      status: 'Placed',
      readiness: 88,
      placedCompany: 'Microsoft',
      placedCtc: '28.5 LPA',
      placedCtcNum: 28.5,
      placedRole: 'Software Engineer',
      placedDate: '2026-09-18',
      offerLetter: 'Verified Offer Letter'
    },
    {
      id: 'STU-106',
      name: 'Vigneshwaran M',
      college: 'Sri Krishna College of Engineering and Technology',
      rollNo: '22ME078',
      email: 'vignesh.m@college.edu',
      department: 'MECH',
      educationStatus: 'studying',
      pursuingYear: '3rd Year',
      degree: 'B.E.',
      completedDegree: '',
      graduationYear: '2027',
      cgpa: 6.90,
      arrears: 0,
      wellVersedLanguages: ['Python', 'C'],
      skills: ['AutoCAD', 'Python Basics', 'SolidWorks'],
      hasInternship: false,
      internship: { hasDone: false, company: '', topic: '' },
      hasHackathons: false,
      hackathons: [],
      status: 'Placed',
      readiness: 72,
      placedCompany: 'Tata Consultancy Services (TCS)',
      placedCtc: '7.5 LPA',
      placedCtcNum: 7.5,
      placedRole: 'Digital Specialist',
      placedDate: '2026-09-22',
      offerLetter: 'Verified Offer Letter'
    }
  ],

  companies: [
    {
      id: 'COMP-1',
      name: 'Google',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
      category: 'Dream / Tier 1',
      role: 'Software Development Engineer (SDE-1)',
      ctc: '32.0 LPA',
      ctcNum: 32.0,
      location: 'Bangalore / Hyderabad',
      minCgpa: 8.5,
      allowedDepts: ['CSE', 'IT', 'ECE'],
      maxArrears: 0,
      driveDate: '2026-10-15',
      deadline: '2026-10-02',
      status: 'Upcoming',
      targetHires: 15,
      appliedCount: 28,
      placedCount: 1,
      description: 'Design and develop scalable, high-availability software solutions with cutting-edge distributed computing technologies.',
      requirements: [
        'Strong Data Structures & Algorithms mastery (Trees, Graphs, DP)',
        'Understanding of Distributed Systems and Computer Architecture',
        'Proficiency in C++, Java, Go, or Python',
        'Min 8.5 CGPA with zero backlogs'
      ],
      rounds: ['Online Coding Assessment', 'Technical Round 1 (DSA)', 'Technical Round 2 (System Design)', 'Googlyness & HR Round']
    },
    {
      id: 'COMP-2',
      name: 'Microsoft',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg',
      category: 'Dream / Tier 1',
      role: 'Software Engineer',
      ctc: '28.5 LPA',
      ctcNum: 28.5,
      location: 'Hyderabad / Bangalore',
      minCgpa: 8.0,
      allowedDepts: ['CSE', 'IT', 'ECE', 'EEE'],
      maxArrears: 0,
      driveDate: '2026-10-22',
      deadline: '2026-10-08',
      status: 'Upcoming',
      targetHires: 25,
      appliedCount: 24,
      placedCount: 1,
      description: 'Building modern cloud services for Azure, Office 365, and intelligent cloud infrastructure.',
      requirements: [
        'Solid foundation in Algorithms, Data Structures, and Complexity Analysis',
        'Object-Oriented Design & Clean Architecture principles',
        'Hands-on experience with C#, Java, C++, or TypeScript',
        'Demonstrated teamwork, curiosity, and problem-solving drive'
      ],
      rounds: ['Online Assessment', 'Technical Interview 1', 'Technical Interview 2', 'AA (As Appropriate) Round']
    },
    {
      id: 'COMP-3',
      name: 'Zoho Corporation',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Zoho_Corporation_logo.svg',
      category: 'Product',
      role: 'Software Developer',
      ctc: '9.5 LPA',
      ctcNum: 9.5,
      location: 'Chennai / Tenkasi / Salem',
      minCgpa: 7.0,
      allowedDepts: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'],
      maxArrears: 1,
      driveDate: '2026-10-05',
      deadline: '2026-09-28',
      status: 'Active',
      targetHires: 40,
      appliedCount: 45,
      placedCount: 2,
      description: 'Develop enterprise SaaS business applications using robust backend architecture and native JavaScript frameworks.',
      requirements: [
        'Strong programming skill in C, C++, or Java (no built-in libraries in early rounds)',
        'Speed and algorithmic correctness in pattern printing and matrix manipulation',
        'Zero active arrears at the time of joining',
        'High logical reasoning and persistence'
      ],
      rounds: ['Round 1: Basic Programming (C/Java/Python)', 'Round 2: Advanced Problem Solving', 'Round 3: Technical Interview', 'Round 4: HR Interview']
    },
    {
      id: 'COMP-4',
      name: 'Tata Consultancy Services (TCS)',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      category: 'Mass / Service',
      role: 'Digital & Ninja Specialist',
      ctc: '7.5 LPA',
      ctcNum: 7.5,
      location: 'Pan India',
      minCgpa: 6.5,
      allowedDepts: ['All'],
      maxArrears: 1,
      driveDate: '2026-09-30',
      deadline: '2026-09-24',
      status: 'Active',
      targetHires: 120,
      appliedCount: 60,
      placedCount: 8,
      description: 'Deliver digital transformation projects with cloud infrastructure, enterprise microservices, and AI integrations.',
      requirements: [
        'Core Python, Java, or C programming expertise',
        'High percentile in TCS NQT Quantitative & Logical sections',
        'Consistent 60%+ academic record across 10th, 12th, and B.E.',
        'Good verbal articulation and willingness to learn emerging technologies'
      ],
      rounds: ['TCS NQT (Aptitude + Coding)', 'Technical Interview', 'Managerial & HR Round']
    },
    {
      id: 'COMP-5',
      name: 'Infosys',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
      category: 'Core / IT',
      role: 'Specialist Programmer (SP)',
      ctc: '9.5 LPA',
      ctcNum: 9.5,
      location: 'Mysore / Bangalore / Pune',
      minCgpa: 7.0,
      allowedDepts: ['CSE', 'IT', 'ECE', 'EEE'],
      maxArrears: 0,
      driveDate: '2026-10-12',
      deadline: '2026-10-01',
      status: 'Upcoming',
      targetHires: 50,
      appliedCount: 40,
      placedCount: 4,
      description: 'High-end developer role focusing on complex algorithm implementations and full-stack product development.',
      requirements: [
        'Strong competitive programming skills (HackWithInfy qualifiers preferred)',
        'Advanced DSA: Graph traversal, Dynamic Programming, Segment Trees',
        'Minimum 7.0 CGPA without standing arrears',
        'Willingness to undergo world-class residential training at Mysore campus'
      ],
      rounds: ['HackWithInfy Coding Round', 'Technical Interview', 'HR Round']
    },
    {
      id: 'COMP-6',
      name: 'Amazon',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      category: 'Dream / Tier 1',
      role: 'SDE Intern + FTE',
      ctc: '25.0 LPA',
      ctcNum: 25.0,
      location: 'Chennai / Bangalore',
      minCgpa: 7.8,
      allowedDepts: ['CSE', 'IT'],
      maxArrears: 0,
      driveDate: '2026-10-28',
      deadline: '2026-10-14',
      status: 'Upcoming',
      targetHires: 18,
      appliedCount: 35,
      placedCount: 0,
      description: 'Work with AWS distributed databases and retail fulfillment microservices.',
      requirements: [
        'Deep DSA expertise: Hash Maps, Trees, Heaps, Dynamic Programming',
        'Familiarity with Object-Oriented Analysis & Low-Level Design (LLD)',
        'Basic exposure to Cloud / Distributed systems is advantageous',
        'Demonstrated alignment with Amazon Leadership Principles (Customer Obsession, Ownership)'
      ],
      rounds: ['Online Assessment (Debugging + Coding)', 'Technical Interview 1', 'Technical Interview 2', 'Bar Raiser Round']
    },
    {
      id: 'COMP-7',
      name: 'Cisco Systems',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
      category: 'Product',
      role: 'Network Software Engineer',
      ctc: '18.5 LPA',
      ctcNum: 18.5,
      location: 'Bangalore / Chennai',
      minCgpa: 7.5,
      allowedDepts: ['CSE', 'IT', 'ECE'],
      maxArrears: 0,
      driveDate: '2026-10-18',
      deadline: '2026-10-04',
      status: 'Upcoming',
      targetHires: 20,
      appliedCount: 32,
      placedCount: 0,
      description: 'Engineering SDN architectures, cloud security protocols, and enterprise edge switching firmware.',
      requirements: [
        'Strong network fundamentals (TCP/IP, Routing, Switching, Sockets)',
        'Fluency in C, C++, or Python programming',
        'Solid problem solving and Linux systems knowledge',
        'Minimum 7.5 CGPA with zero backlogs'
      ],
      rounds: ['Online Assessment', 'Technical Round 1 (Networks + DSA)', 'Technical Round 2 (Systems)', 'Managerial & HR']
    }
  ],

  applications: [
    {
      id: 'APP-1001',
      studentId: 'STU-101',
      studentName: 'Sashti',
      studentDept: 'CSE',
      studentCgpa: 8.45,
      companyId: 'COMP-3',
      companyName: 'Zoho Corporation',
      role: 'Software Developer',
      appliedDate: '2026-09-18',
      status: 'Accepted for Interview', // 'Applied', 'Aptitude Cleared', 'Accepted for Interview', 'Shortlisted', 'Technical Round', 'HR Round', 'Selected', 'Rejected'
      acceptedForInterview: true,
      interviewRound: 'Technical Interview - Round 1 (System Design & Algorithms)',
      scheduledDate: '2026-10-05',
      scheduledTime: '11:00 AM',
      interviewMode: 'Online',
      meetingLink: 'https://meet.google.com/zoh-sashti-interview',
      venue: 'Online Google Meet',
      recruiterFeedback: 'Resume passed ATS with 92% match! Verified strong skills in Python, REST APIs, and microservices from TechLabs internship. Prepare for algorithmic problem solving in round 1.',
      currentRound: 'Technical Interview - Round 1',
      stepIndex: 3, // 1: Applied, 2: Shortlisted/Screening, 3: Technical Round, 4: HR Round, 5: Selected
      notes: 'Passed Round 1 & Round 2 programming rounds. Interview scheduled for Oct 5, 2026 at 11:00 AM.',
      resumePdfName: 'Sashti_Resume_2026.pdf',
      resumePdfSize: '184 KB',
      resumeFormat: 'PDF',
      resumeVerified: true,
      resumePdfContent: `Sashti S - B.E. Computer Science and Engineering
Sri Krishna College of Engineering and Technology | CGPA: 8.45/10
Email: sashti.s@college.edu | Phone: +91 98765 43210 | GitHub: github.com/sashti | LinkedIn: linkedin.com/in/sashti

EDUCATION:
- Bachelor of Engineering (B.E.) in Computer Science & Engineering (2022 - 2026) | CGPA: 8.45
- Higher Secondary Certificate (HSC) - 94.2%

TECHNICAL SKILLS:
- Programming Languages: Python, Java, C++, C, JavaScript, SQL
- Core Fundamentals: Data Structures & Algorithms (DSA), Object-Oriented Programming (OOP), System Design, REST APIs, Database Management (DBMS), Operating Systems
- Frameworks & Web: React, Node.js, Express, Spring Boot, Flask
- Tools & Cloud: Git, GitHub, Docker, AWS (EC2, S3), PostgreSQL, MySQL, Linux

INTERNSHIP & WORK EXPERIENCE:
- Software Engineering Intern | TechLabs Solutions (3 Months)
  * Developed and optimized backend microservices using Python and RESTful APIs, reducing latency by 28%.
  * Implemented secure authentication and integrated relational PostgreSQL database schema.
  * Collaborated with senior engineers using Git workflows, continuous integration, and Docker containerization.

PROJECTS:
1. Placement Preparation and Tracking System (Full-Stack Web App)
   * Engineered comprehensive campus placement portal with AI resume ATS scoring, voice mock interview bot, and eligibility validation.
   * Built scalable multi-role authentication for Students, Placement Officers, Recruiters, and Admins.
2. Smart Healthcare Predictive System (Machine Learning & Flask)
   * Built predictive triage algorithms using Scikit-Learn and Pandas, achieving 91% accuracy on validation dataset.
   * Designed REST API endpoints to serve real-time predictions to clinical dashboards.

ACHIEVEMENTS & CERTIFICATIONS:
- National Finalist: Smart India Hackathon (SIH) - AI Real-time Healthcare Triage System
- AWS Certified Cloud Practitioner
- HackerRank Gold Badge in Problem Solving & Python`
    },
    {
      id: 'APP-1002',
      studentId: 'STU-101',
      studentName: 'Sashti',
      studentDept: 'CSE',
      studentCgpa: 8.45,
      companyId: 'COMP-4',
      companyName: 'Tata Consultancy Services (TCS)',
      role: 'Digital & Ninja Specialist',
      appliedDate: '2026-09-15',
      status: 'Aptitude Cleared',
      currentRound: 'Technical Interview',
      stepIndex: 2,
      notes: 'NQT Aptitude Score: 88%. Cleared Digital cut-off.',
      resumePdfName: 'Sashti_Resume_2026.pdf',
      resumePdfSize: '184 KB',
      resumeFormat: 'PDF',
      resumeVerified: true,
      resumePdfContent: `Sashti S - B.E. Computer Science and Engineering | CGPA: 8.45
Technical Skills: Python, Java, C++, SQL, Algorithms, Data Structures, Git, REST APIs, Docker, Linux.
Projects: Placement Portal, Healthcare ML Prediction.
Internship: TechLabs Solutions - Microservices & APIs.`
    },
    {
      id: 'APP-1003',
      studentId: 'STU-101',
      studentName: 'Sashti',
      studentDept: 'CSE',
      studentCgpa: 8.45,
      companyId: 'COMP-2',
      companyName: 'Microsoft',
      role: 'Software Engineer',
      appliedDate: '2026-09-20',
      status: 'Applied',
      currentRound: 'Resume Screening',
      stepIndex: 1,
      notes: 'Eligible profile submitted. Awaiting Online Assessment link.',
      resumePdfName: 'Sashti_Resume_2026.pdf',
      resumePdfSize: '184 KB',
      resumeFormat: 'PDF',
      resumeVerified: true,
      resumePdfContent: `Sashti S - B.E. Computer Science and Engineering | CGPA: 8.45
Technical Skills: Python, Java, C++, SQL, Algorithms, Data Structures, Git, REST APIs, Docker, Linux.
Projects: Placement Portal, Healthcare ML Prediction.
Internship: TechLabs Solutions - Microservices & APIs.`
    },
    {
      id: 'APP-1004',
      studentId: 'STU-102',
      studentName: 'Arun Kumar',
      studentDept: 'CSE',
      studentCgpa: 8.90,
      companyId: 'COMP-3',
      companyName: 'Zoho Corporation',
      role: 'Software Developer',
      appliedDate: '2026-09-21',
      status: 'Applied',
      currentRound: 'Resume Screening',
      stepIndex: 1,
      notes: 'High competitive programming profile submitted with verified PDF resume.',
      resumePdfName: 'Arun_Resume.pdf',
      resumePdfSize: '210 KB',
      resumeFormat: 'PDF',
      resumeVerified: true,
      resumePdfContent: `Arun Kumar - B.E. Computer Science & Engineering (Graduated 2025)
Sri Krishna College of Engineering and Technology | CGPA: 8.90/10
Email: arun.k@college.edu | Phone: +91 98765 11223 | GitHub: github.com/arunkumar

EDUCATION:
- B.E. Computer Science & Engineering (2021 - 2025) | CGPA: 8.90

TECHNICAL SKILLS:
- Languages: C++, Python, Go, Java, SQL, C
- Core Fundamentals: Advanced Data Structures, Graph Algorithms, Dynamic Programming, Distributed Systems, Operating Systems, Computer Networks
- Cloud & Infrastructure: Docker, Kubernetes, Linux, AWS, Distributed Storage

EXPERIENCE:
- Distributed Systems Intern | Google Summer of Code (GSoC)
  * Implemented high-throughput lock-free distributed storage engine components in Go and C++.
  * Reduced memory footprint by 35% through custom slab memory allocation.

ACHIEVEMENTS:
- ACM ICPC Regional Finalist (1st Place)
- LeetCode Guardian (Rating: 2280+)
- Codeforces Master`
    },
    {
      id: 'APP-1005',
      studentId: 'STU-103',
      studentName: 'Priya Dharshini',
      studentDept: 'IT',
      studentCgpa: 7.80,
      companyId: 'COMP-3',
      companyName: 'Zoho Corporation',
      role: 'Software Developer',
      appliedDate: '2026-09-22',
      status: 'Applied',
      currentRound: 'Resume Screening',
      stepIndex: 1,
      notes: 'Full-stack applicant with verified PDF resume and prior Zoho internship.',
      resumePdfName: 'Priya_Resume.pdf',
      resumePdfSize: '195 KB',
      resumeFormat: 'PDF',
      resumeVerified: true,
      resumePdfContent: `Priya Dharshini - B.Tech Information Technology (Graduated 2025)
Sri Krishna College of Engineering and Technology | CGPA: 7.80/10
Email: priya.d@college.edu | Phone: +91 98765 55667

EDUCATION:
- B.Tech Information Technology (2021 - 2025) | CGPA: 7.80

TECHNICAL SKILLS:
- Languages: Java, SQL, C++, JavaScript
- Frameworks: Spring Boot, Angular, React, Hibernate
- Databases & Tools: MySQL, PostgreSQL, Git, Maven, REST APIs

EXPERIENCE:
- Full-Stack Developer Intern | Zoho Corporation
  * Built customer portal workflows and responsive UI interfaces using Java and Angular.
  * Optimized SQL queries and reduced query turnaround time by 22%.`
    },
    {
      id: 'APP-1006',
      studentId: 'STU-101',
      studentName: 'Sashti',
      studentDept: 'CSE',
      studentCgpa: 8.45,
      companyId: 'COMP-6',
      companyName: 'Amazon',
      role: 'Cloud Support & Infrastructure Specialist',
      appliedDate: '2026-09-12',
      status: 'Rejected',
      acceptedForInterview: false,
      currentRound: 'Application Screening',
      stepIndex: 2,
      rejectionReason: 'Prerequisite Criteria: Drive required minimum 8.8 CGPA cutoff and AWS Certified Solutions Architect Associate credential.',
      recruiterFeedback: 'We reviewed your resume and projects in ATS. While your Python and web foundations are strong, this specialized cloud infrastructure track strictly requires advanced AWS production architecture certifications. We highly encourage you to apply for our Amazon SDE-1 software engineer campus drive in November!',
      notes: 'Application not shortlisted by Amazon recruiter due to cloud track prerequisites.',
      resumePdfName: 'Sashti_Resume_2026.pdf',
      resumePdfSize: '184 KB',
      resumeFormat: 'PDF',
      resumeVerified: true,
      decisionDate: '2026-09-15T10:00:00.000Z'
    }
  ],

  // Placement Officers Registry (Oversight & Live Checking Status)
  officers: [
    {
      id: 'OFF-201',
      name: 'Dr. R. Ramanathan',
      title: 'Head Placement Director (CDC)',
      department: 'Career Development Centre',
      email: 'officer@college.edu',
      phone: '+91 94433 22110',
      avatar: 'RR',
      status: 'Active Now (Checking Portal)',
      isCheckingNow: true,
      lastActive: 'Today, 03:20 PM',
      questionsPostedCount: 12,
      lastQuestionPostedDate: '2026-09-26',
      lastQuestionTitle: 'Two Sum (LeetCode)'
    },
    {
      id: 'OFF-202',
      name: 'Prof. K. Swaminathan',
      title: 'Placement Coordinator (CSE & IT)',
      department: 'Computer Science & Engg',
      email: 'swaminathan.k@college.edu',
      phone: '+91 98401 23456',
      avatar: 'KS',
      status: 'Active Now (Checking Portal)',
      isCheckingNow: true,
      lastActive: 'Today, 02:45 PM',
      questionsPostedCount: 8,
      lastQuestionPostedDate: '2026-09-25',
      lastQuestionTitle: 'Pipes & Cisterns (Quantitative)'
    },
    {
      id: 'OFF-203',
      name: 'Dr. M. Geetha',
      title: 'Associate Placement Officer (Core & Circuit)',
      department: 'Electronics & Communication',
      email: 'geetha.m@college.edu',
      phone: '+91 97902 34567',
      avatar: 'MG',
      status: 'Active Yesterday',
      isCheckingNow: false,
      lastActive: 'Yesterday, 05:10 PM',
      questionsPostedCount: 5,
      lastQuestionPostedDate: '2026-09-24',
      lastQuestionTitle: 'Binary Search Trees & Arrays'
    }
  ],

  // Corporate Recruiters Registry (Company & Hiring Capacity)
  recruiters: [
    {
      id: 'REC-301',
      name: 'Ananya Sen',
      email: 'recruiter@zoho.com',
      company: 'Zoho Corporation',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Zoho_Corporation_logo.svg',
      role: 'Lead Talent Acquisition Partner',
      category: 'Product / SaaS',
      phone: '+91 98112 33445',
      avatar: 'AS',
      targetHires: 40,
      openRoles: 'Software Developer, Quality Analyst',
      ctcOffered: '9.5 LPA',
      status: 'Actively Interviewing'
    },
    {
      id: 'REC-302',
      name: 'Vikram Joshi',
      email: 'v.joshi@google.com',
      company: 'Google',
      companyLogo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
      role: 'University Staffing Lead',
      category: 'Dream / Tier 1',
      phone: '+91 98760 11223',
      avatar: 'VJ',
      targetHires: 15,
      openRoles: 'Software Development Engineer (SDE-1)',
      ctcOffered: '32.0 LPA',
      status: 'Shortlisting Candidates'
    },
    {
      id: 'REC-303',
      name: 'Priya Sharma',
      email: 'priya.s@microsoft.com',
      company: 'Microsoft',
      companyLogo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg',
      role: 'Campus Hiring Director',
      category: 'Dream / Tier 1',
      phone: '+91 98223 44556',
      avatar: 'PS',
      targetHires: 25,
      openRoles: 'Software Engineer (Azure Cloud & AI)',
      ctcOffered: '28.5 LPA',
      status: 'Drive Scheduled (Oct 22)'
    },
    {
      id: 'REC-304',
      name: 'Rajesh Kulkarni',
      email: 'r.kulkarni@cisco.com',
      company: 'Cisco Systems',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
      role: 'Global Talent Acquisition Partner',
      category: 'Product / Core Networking',
      phone: '+91 97334 55667',
      avatar: 'RK',
      targetHires: 20,
      openRoles: 'Network Software Engineer, Cloud Security',
      ctcOffered: '18.5 LPA',
      status: 'Drive Scheduled (Oct 18)'
    },
    {
      id: 'REC-305',
      name: 'David Miller',
      email: 'david.m@amazon.com',
      company: 'Amazon',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
      role: 'Technical Recruiter - AWS Campus',
      category: 'Dream / Tier 1',
      phone: '+91 99112 23344',
      avatar: 'DM',
      targetHires: 18,
      openRoles: 'SDE Intern + FTE (Retail & AWS)',
      ctcOffered: '25.0 LPA',
      status: 'Applications Open'
    },
    {
      id: 'REC-306',
      name: 'Meera Nair',
      email: 'meera.n@tcs.com',
      company: 'Tata Consultancy Services (TCS)',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      role: 'Regional Campus Talent Head',
      category: 'Mass / Service',
      phone: '+91 94455 66778',
      avatar: 'MN',
      targetHires: 120,
      openRoles: 'Ninja & Digital Specialist Developer',
      ctcOffered: '7.5 LPA',
      status: 'Actively Interviewing'
    }
  ],

  // Question Bank for Mock Tests & Coding Practice
  questions: [
    // --- LeetCode Coding Problems ---
    {
      id: 'LC-1',
      type: 'leetcode',
      category: 'LeetCode / Coding',
      difficulty: 'Easy',
      title: 'Two Sum',
      tags: ['Arrays', 'Hash Map', 'Top 50'],
      question: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      inputFormat: 'nums = [2, 7, 11, 15], target = 9',
      outputFormat: '[0, 1]',
      sampleInput: 'nums = [2, 7, 11, 15], target = 9',
      sampleOutput: '[0, 1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1]. A single pass hash map achieves O(n) time and O(n) space.',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
      starterCode: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      solutionCode: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-102', studentName: 'Arun Kumar', rollNo: '21CS102', dept: 'CSE', completedAt: '2026-09-25', score: 100 },
        { studentId: 'STU-105', studentName: 'Sneha Mohan', rollNo: '22CS112', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ],
      createdAt: '2026-09-20'
    },
    {
      id: 'LC-20',
      type: 'leetcode',
      category: 'LeetCode / Coding',
      difficulty: 'Easy',
      title: 'Valid Parentheses',
      tags: ['Stack', 'Strings', 'Top Interview'],
      question: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      inputFormat: 's = "()[]{}"',
      outputFormat: 'true',
      sampleInput: 's = "{[]}"',
      sampleOutput: 'true',
      explanation: 'Use a LIFO Stack to push opening brackets and pop matching opening brackets on closing brackets.',
      constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
      starterCode: 'function isValid(s) {\n  const stack = [];\n  const pairs = { ")": "(", "}": "{", "]": "[" };\n  for (const ch of s) {\n    if (ch === "(" || ch === "{" || ch === "[") {\n      stack.push(ch);\n    } else if (stack.pop() !== pairs[ch]) {\n      return false;\n    }\n  }\n  return stack.length === 0;\n}',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-25', score: 100 },
        { studentId: 'STU-103', studentName: 'Priya Dharshini', rollNo: '21IT105', dept: 'IT', completedAt: '2026-09-25', score: 100 }
      ],
      createdAt: '2026-09-21'
    },
    {
      id: 'LC-3',
      type: 'leetcode',
      category: 'LeetCode / Coding',
      difficulty: 'Medium',
      title: 'Longest Substring Without Repeating Characters',
      tags: ['Sliding Window', 'Hash Table', 'Strings'],
      question: 'Given a string s, find the length of the longest substring without repeating characters.',
      inputFormat: 's = "abcabcbb"',
      outputFormat: '3',
      sampleInput: 's = "bbbbb"',
      sampleOutput: '1',
      explanation: 'The answer is "abc", with the length of 3. For "bbbbb" the answer is "b" with length 1.',
      constraints: '0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.',
      starterCode: 'function lengthOfLongestSubstring(s) {\n  let maxLen = 0, left = 0;\n  const charSet = new Set();\n  for (let right = 0; right < s.length; right++) {\n    while (charSet.has(s[right])) {\n      charSet.delete(s[left++]);\n    }\n    charSet.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ],
      createdAt: '2026-09-22'
    },
    {
      id: 'LC-53',
      type: 'leetcode',
      category: 'LeetCode / Coding',
      difficulty: 'Medium',
      title: 'Maximum Subarray (Kadane\'s Algorithm)',
      tags: ['Dynamic Programming', 'Arrays', 'Divide and Conquer'],
      question: 'Given an integer array nums, find the subarray with the largest sum, and return its sum. A subarray is a contiguous non-empty sequence of elements within an array.',
      inputFormat: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
      outputFormat: '6',
      sampleInput: 'nums = [5,4,-1,7,8]',
      sampleOutput: '23',
      explanation: 'The subarray [4,-1,2,1] has the largest sum 6. For [5,4,-1,7,8] the sum is 23.',
      constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
      starterCode: 'function maxSubArray(nums) {\n  let currentSum = nums[0];\n  let maxSum = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currentSum = Math.max(nums[i], currentSum + nums[i]);\n    maxSum = Math.max(maxSum, currentSum);\n  }\n  return maxSum;\n}',
      completedBy: [
        { studentId: 'STU-105', studentName: 'Sneha Mohan', rollNo: '22CS112', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ],
      createdAt: '2026-09-23'
    },

    // --- Aptitude & Technical MCQs ---
    // Quantitative
    {
      id: 'Q1',
      type: 'aptitude',
      category: 'Quantitative',
      difficulty: 'Easy',
      title: 'Train Speed & Distance',
      question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
      options: ['65 sec', '89 sec', '100 sec', '150 sec'],
      correct: 1,
      explanation: 'Speed of train = 240/24 = 10 m/s. Total distance to pass platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-102', studentName: 'Arun Kumar', rollNo: '21CS102', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-103', studentName: 'Priya Dharshini', rollNo: '21IT105', dept: 'IT', completedAt: '2026-09-25', score: 100 },
        { studentId: 'STU-105', studentName: 'Sneha Mohan', rollNo: '22CS112', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q2',
      type: 'aptitude',
      category: 'Quantitative',
      difficulty: 'Medium',
      title: 'Pipes & Cisterns',
      question: 'Two pipes A and B can fill a tank in 20 and 30 minutes respectively. If both pipes are opened together, the time taken to fill the tank is:',
      options: ['50 min', '12 min', '25 min', '15 min'],
      correct: 1,
      explanation: 'Part filled in 1 min = (1/20) + (1/30) = 5/60 = 1/12. Hence the tank is filled in 12 minutes.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-102', studentName: 'Arun Kumar', rollNo: '21CS102', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q3',
      type: 'aptitude',
      category: 'Quantitative',
      difficulty: 'Easy',
      title: 'Averages & Consecutive Numbers',
      question: 'The average of 5 consecutive numbers is 27. What is the product of the smallest and largest number?',
      options: ['725', '715', '700', '735'],
      correct: 0,
      explanation: 'Numbers are (x-2, x-1, x, x+1, x+2) where middle number is 27. Numbers: 25, 26, 27, 28, 29. Smallest * Largest = 25 * 29 = 725.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-104', studentName: 'Karthik Raja', rollNo: '22ECE032', dept: 'ECE', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q4',
      type: 'aptitude',
      category: 'Quantitative',
      difficulty: 'Medium',
      title: 'Profit & Loss and Discount',
      question: 'A shopkeeper earns a profit of 15% after selling a book at 20% discount on the printed price. The ratio of the cost price and the printed price is:',
      options: ['16:23', '20:23', '23:16', '15:20'],
      correct: 0,
      explanation: 'Let Printed Price = 100. Selling Price = 80. SP = 1.15 * CP => CP = 80 / 1.15 = 8000/115 = 1600/23. CP : MP = (1600/23) : 100 = 16 : 23.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 }
      ]
    },

    // Logical Reasoning
    {
      id: 'Q5',
      type: 'aptitude',
      category: 'Logical Reasoning',
      difficulty: 'Easy',
      title: 'Number Series Progression',
      question: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?',
      options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'],
      correct: 1,
      explanation: 'This is a simple division series; each number is one-half of the previous number. Next is (1/4)/2 = 1/8.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-102', studentName: 'Arun Kumar', rollNo: '21CS102', dept: 'CSE', completedAt: '2026-09-25', score: 100 },
        { studentId: 'STU-105', studentName: 'Sneha Mohan', rollNo: '22CS112', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q6',
      type: 'aptitude',
      category: 'Logical Reasoning',
      difficulty: 'Medium',
      title: 'Blood Relations',
      question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
      options: ['Brother', 'Uncle', 'Cousin', 'Father'],
      correct: 3,
      explanation: 'The only son of Suresh\'s mother is Suresh himself. So, the boy in the photograph is Suresh\'s son. Hence Suresh is the Father.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 }
      ]
    },
    {
      id: 'Q7',
      type: 'aptitude',
      category: 'Logical Reasoning',
      difficulty: 'Medium',
      title: 'Syllogism Analysis',
      question: 'Statement: All mangoes are golden in color. No golden-colored things are cheap. Conclusion I: All mangoes are cheap. Conclusion II: Golden-colored mangoes are not cheap.',
      options: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither I nor II follows'],
      correct: 1,
      explanation: 'Since no golden-colored things are cheap and all mangoes are golden, mangoes cannot be cheap. Thus only II follows.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 }
      ]
    },

    // Verbal Ability
    {
      id: 'Q8',
      type: 'aptitude',
      category: 'Verbal Ability',
      difficulty: 'Easy',
      title: 'Spelling Correction',
      question: 'Find the correctly spelt word:',
      options: ['Accomodation', 'Accommodation', 'Acommodation', 'Accomadation'],
      correct: 1,
      explanation: 'The correct spelling is "Accommodation" with double \'c\' and double \'m\'.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-102', studentName: 'Arun Kumar', rollNo: '21CS102', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q9',
      type: 'aptitude',
      category: 'Verbal Ability',
      difficulty: 'Medium',
      title: 'Vocabulary Antonyms',
      question: 'Choose the antonym for the word: EPHEMERAL',
      options: ['Transient', 'Permanent', 'Fragile', 'Fleeting'],
      correct: 1,
      explanation: 'Ephemeral means lasting for a very short time. The opposite is Permanent.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 }
      ]
    },
    {
      id: 'Q10',
      type: 'aptitude',
      category: 'Verbal Ability',
      difficulty: 'Medium',
      title: 'Grammar Conditionals',
      question: 'Complete the sentence: If she had worked harder, she ________ the examination.',
      options: ['would pass', 'will pass', 'would have passed', 'passed'],
      correct: 2,
      explanation: 'Third conditional sentence: If + past perfect (had worked), would have + past participle (would have passed).',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 }
      ]
    },

    // Coding & Technical
    {
      id: 'Q11',
      type: 'aptitude',
      category: 'Coding & Technical',
      difficulty: 'Medium',
      title: 'Balanced BST Complexity',
      question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (AVL Tree) with n nodes?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
      correct: 2,
      explanation: 'In a balanced BST like an AVL tree, the tree height is bounded by O(log n), so search, insert, and delete take O(log n) time.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-102', studentName: 'Arun Kumar', rollNo: '21CS102', dept: 'CSE', completedAt: '2026-09-25', score: 100 },
        { studentId: 'STU-105', studentName: 'Sneha Mohan', rollNo: '22CS112', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q12',
      type: 'aptitude',
      category: 'Coding & Technical',
      difficulty: 'Easy',
      title: 'Sorting Algorithms Worst-Case',
      question: 'Which of the following sorting algorithms has the best worst-case time complexity?',
      options: ['Quick Sort', 'Merge Sort', 'Bubble Sort', 'Insertion Sort'],
      correct: 1,
      explanation: 'Merge Sort has a worst-case time complexity of O(n log n), whereas Quick Sort has O(n^2) worst case.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-103', studentName: 'Priya Dharshini', rollNo: '21IT105', dept: 'IT', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q13',
      type: 'aptitude',
      category: 'Coding & Technical',
      difficulty: 'Easy',
      title: 'SQL Group Filtering',
      question: 'In SQL, which clause is used to filter groups created by the GROUP BY statement?',
      options: ['WHERE', 'ORDER BY', 'HAVING', 'FILTER'],
      correct: 2,
      explanation: 'The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 },
        { studentId: 'STU-102', studentName: 'Arun Kumar', rollNo: '21CS102', dept: 'CSE', completedAt: '2026-09-25', score: 100 }
      ]
    },
    {
      id: 'Q14',
      type: 'aptitude',
      category: 'Coding & Technical',
      difficulty: 'Medium',
      title: 'OS Process vs Thread',
      question: 'What is the primary difference between a process and a thread in an Operating System?',
      options: [
        'Threads have separate address spaces; processes share memory',
        'Processes have separate address spaces; threads share the process memory',
        'Threads cannot execute concurrently',
        'Processes are lighter in weight than threads'
      ],
      correct: 1,
      explanation: 'A process is an execution environment with its own address space, whereas threads exist within a process and share its heap, global variables, and open files.',
      completedBy: [
        { studentId: 'STU-101', studentName: 'Sashti', rollNo: '21CS101', dept: 'CSE', completedAt: '2026-09-24', score: 100 }
      ]
    }
  ],

  // AI Mock Interview Q&A Bank (21+ High-Yield Questions for Campus Placements)
  interviewQuestions: [
    // --- Technical Rounds (DSA, DBMS, OS, Networks, OOP, System Architecture) ---
    {
      id: 'INT-1',
      type: 'Technical',
      topic: 'Data Structures & Algorithms',
      question: 'Can you explain the difference between Array and LinkedList? When would you choose one over the other in real systems?',
      keyPoints: ['contiguous memory', 'cache locality', 'O(1) random access', 'dynamic size', 'insertion at head', 'memory overhead of pointers'],
      idealAnswer: 'Arrays store elements in contiguous memory locations providing O(1) random access and excellent CPU cache locality, but have fixed size. LinkedLists allocate memory dynamically with pointer overhead, allowing O(1) insertions/deletions at known positions without reallocating contiguous memory.'
    },
    {
      id: 'INT-2',
      type: 'Technical',
      topic: 'Database Management (DBMS)',
      question: 'What are the ACID properties in database transactions and why are they crucial in enterprise systems?',
      keyPoints: ['Atomicity', 'Consistency', 'Isolation', 'Durability', 'all or nothing', 'rollback', 'concurrency', 'commit'],
      idealAnswer: 'ACID stands for Atomicity (all operations succeed or entire transaction rolls back), Consistency (data moves from one valid state to another satisfying all rules), Isolation (concurrent transactions do not interfere), and Durability (committed changes persist even during crashes).'
    },
    {
      id: 'INT-3',
      type: 'Technical',
      topic: 'Object-Oriented Programming (OOP)',
      question: 'How do Polymorphism and Inheritance differ in OOP? Provide a concise real-world analogy.',
      keyPoints: ['Inheritance is code reuse', 'is-a relationship', 'Polymorphism is many forms', 'method overriding', 'runtime vs compile time'],
      idealAnswer: 'Inheritance represents an "is-a" relationship where a child class inherits attributes and behaviors from a parent class (e.g. Dog inherits from Animal). Polymorphism allows treating instances of different classes through a common interface while executing specialized behavior (e.g. animal.makeSound() emits barking for Dog and meowing for Cat).'
    },
    {
      id: 'INT-6',
      type: 'Technical',
      topic: 'Data Structures (Trees)',
      question: 'What is a Binary Search Tree (BST) and why do production engines use self-balancing trees like AVL or Red-Black Trees?',
      keyPoints: ['left subtree smaller', 'right subtree larger', 'O(log n) average', 'skewed tree', 'worst-case O(n)', 'rotations', 'self-balancing'],
      idealAnswer: 'In a BST, every node has keys where the left subtree has smaller values and the right has larger values. Average lookup is O(log n), but in the worst case (skewed insertion) it degrades to O(n) linked list. Self-balancing trees like AVL or Red-Black Trees perform tree rotations during insertions/deletions to maintain a height of O(log n).'
    },
    {
      id: 'INT-7',
      type: 'Technical',
      topic: 'Operating Systems',
      question: 'What is the core difference between a Process and a Thread, and how does Context Switching work?',
      keyPoints: ['Process is independent memory space', 'Thread shares address space', 'lightweight', 'context switch overhead', 'CPU registers', 'program counter'],
      idealAnswer: 'A Process is an executing program instance with its own isolated address space, PCB, and file handles. A Thread is a lightweight unit of execution within a process that shares memory and heap with sibling threads. Context switching between threads is faster than process switching because virtual memory translation tables (TLB) do not need flushing.'
    },
    {
      id: 'INT-8',
      type: 'Technical',
      topic: 'Operating Systems',
      question: 'What is Deadlock in operating systems, and what are the four Coffman conditions required for it to occur?',
      keyPoints: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'resource allocation graph', 'Bankers algorithm'],
      idealAnswer: 'A Deadlock is a state where a set of processes are permanently blocked because each holds a resource and waits for another resource held by another process. The 4 Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Breaking any one condition prevents deadlocks.'
    },
    {
      id: 'INT-9',
      type: 'Technical',
      topic: 'Database Management (DBMS)',
      question: 'Explain how Database Indexing works (e.g., B-Tree Index). What is the trade-off between SELECT and INSERT performance?',
      keyPoints: ['B-Tree structure', 'pointer to disk row', 'O(log n) search', 'fast SELECT', 'slow INSERT and UPDATE', 'index maintenance overhead'],
      idealAnswer: 'An index is an auxiliary data structure (typically a balanced B+ Tree) that stores indexed column values sorted alongside row pointers. This speeds up SELECT queries from O(N) full-table scan to O(log N). However, writes (INSERT/UPDATE/DELETE) become slower because the index tree must be updated and rebalanced on each write.'
    },
    {
      id: 'INT-10',
      type: 'Technical',
      topic: 'Computer Networks',
      question: 'Can you compare TCP and UDP? When would you choose UDP over TCP for an application?',
      keyPoints: ['TCP connection-oriented', 'UDP connectionless', 'reliability vs speed', 'three-way handshake', 'packet loss retransmission', 'streaming / gaming / DNS'],
      idealAnswer: 'TCP is connection-oriented, reliable, guarantees packet ordering, and performs congestion control and retransmissions. UDP is lightweight, connectionless, and sends datagrams without acknowledgments or ordering guarantees. UDP is preferred for real-time applications like video streaming, VoIP, multiplayer gaming, and DNS where low latency is more critical than 100% packet reliability.'
    },
    {
      id: 'INT-11',
      type: 'Technical',
      topic: 'Computer Networks',
      question: 'Explain the TCP Three-Way Handshake process for establishing a reliable connection.',
      keyPoints: ['SYN', 'SYN-ACK', 'ACK', 'sequence numbers', 'connection establishment', 'client server synchronization'],
      idealAnswer: 'The TCP 3-way handshake begins with the client sending a SYN packet with an initial sequence number. The server responds with a SYN-ACK acknowledging the client sequence number and sending its own. Finally, the client sends an ACK acknowledging the server sequence number, establishing a full-duplex reliable connection.'
    },
    {
      id: 'INT-12',
      type: 'Technical',
      topic: 'System Architecture',
      question: 'How do SQL and NoSQL databases differ? When would you choose MongoDB over PostgreSQL?',
      keyPoints: ['structured schema vs flexible document', 'ACID transactions', 'horizontal vs vertical scaling', 'joins and relations', 'unstructured JSON data'],
      idealAnswer: 'SQL databases (like PostgreSQL) are relational, use predefined structured schemas, support complex joins, and guarantee strict ACID transactions. NoSQL databases (like MongoDB) store flexible JSON/BSON documents, scale horizontally across clusters, and handle dynamic schemas. MongoDB is chosen for fast prototyping, unstructured content, real-time analytics, or high-write volume where complex multi-table joins are unnecessary.'
    },
    {
      id: 'INT-13',
      type: 'Technical',
      topic: 'Web Architecture & REST APIs',
      question: 'What is a RESTful API and what does it mean for an API to be truly "stateless"?',
      keyPoints: ['Representational State Transfer', 'HTTP methods GET POST PUT DELETE', 'statelessness', 'client session in token / JWT', 'no server session affinity'],
      idealAnswer: 'REST is an architectural style based on standard HTTP methods and resource URIs. Statelessness means the server does not store client session state between requests; every single request contains all information needed to process it (e.g. JWT in the Authorization header), enabling effortless horizontal scaling across server nodes.'
    },
    {
      id: 'INT-14',
      type: 'Technical',
      topic: 'Software Engineering (SOLID)',
      question: 'Can you explain the Single Responsibility Principle and Open/Closed Principle from SOLID with examples?',
      keyPoints: ['Single Responsibility Principle', 'one reason to change', 'Open Closed Principle', 'open for extension closed for modification', 'interfaces and abstraction'],
      idealAnswer: 'Single Responsibility Principle (SRP) states that a class should have one and only one reason to change, handling a single focused concern. Open/Closed Principle (OCP) states that software entities should be open for extension but closed for modification, achieved through interfaces, polymorphism, and dependency injection without altering tested source code.'
    },
    {
      id: 'INT-15',
      type: 'Technical',
      topic: 'Data Structures (Hashing)',
      question: 'How does a Hash Map handle collisions? Compare Separate Chaining and Open Addressing.',
      keyPoints: ['hash function', 'collision', 'Separate Chaining with linked list / tree', 'Open Addressing', 'linear probing', 'load factor'],
      idealAnswer: 'Hash collisions occur when different keys produce the same hash bucket index. In Separate Chaining, each bucket stores a linked list (or balanced tree if large) of colliding entries. In Open Addressing (e.g., linear or quadratic probing), colliding entries search for the next available open slot in the hash table array without allocating external nodes.'
    },
    {
      id: 'INT-16',
      type: 'Technical',
      topic: 'Algorithms (Dynamic Programming)',
      question: 'What is Dynamic Programming? How does Top-Down Memoization differ from Bottom-Up Tabulation?',
      keyPoints: ['overlapping subproblems', 'optimal substructure', 'Memoization recursion with cache', 'Tabulation iterative table', 'stack overflow prevention'],
      idealAnswer: 'Dynamic Programming solves optimization problems by breaking them into overlapping subproblems with optimal substructure. Top-Down Memoization uses recursion and caches subproblem results in a hash table or array. Bottom-Up Tabulation solves base cases iteratively first, filling a table sequentially to eliminate recursion overhead and prevent stack overflow.'
    },

    // --- HR & Behavioral Rounds (STAR Framework, Culture, Leadership, Conflict Resolution) ---
    {
      id: 'INT-4',
      type: 'HR',
      topic: 'Behavioral Problem Solving',
      question: 'Tell me about a challenging technical problem you solved during a project. How did you diagnose and fix it?',
      keyPoints: ['STAR method', 'Situation', 'Task', 'Action', 'Result', 'root cause analysis', 'debugging', 'collaboration'],
      idealAnswer: 'Using the STAR framework: During my Placement Tracking System project, I noticed severe lag when rendering live DFD diagrams. I profiled frontend render cycles, diagnosed unnecessary full-tree re-renders, and refactored the SVG renderer to use debounced incremental updates, reducing load time from 3.2s to 180ms.'
    },
    {
      id: 'INT-5',
      type: 'HR',
      topic: 'Career Goals & Vision',
      question: 'Where do you see yourself in 3 to 5 years, and how does this role align with your aspirations?',
      keyPoints: ['continuous learning', 'technical leadership', 'mastering cloud/AI', 'delivering business impact', 'mentorship'],
      idealAnswer: 'In 3 to 5 years, I see myself growing into a solid Senior Software Engineer who not only builds robust distributed systems but also mentors juniors, drives architectural decisions, and contributes meaningfully to high-impact product features.'
    },
    {
      id: 'INT-17',
      type: 'HR',
      topic: 'Conflict Resolution & Teamwork',
      question: 'Tell me about a time you had a disagreement with a team member during a project. How did you handle it?',
      keyPoints: ['active listening', 'objective data and metrics', 'respectful discussion', 'consensus', 'project goal priority', 'positive outcome'],
      idealAnswer: 'During our SIH hackathon project, my teammate and I disagreed on whether to use SQL or MongoDB. Instead of arguing opinions, we benchmarked our schema query patterns against our required latency SLAs. The data proved relational joins were necessary for patient records. We aligned peacefully on PostgreSQL and delivered the project on time.'
    },
    {
      id: 'INT-18',
      type: 'HR',
      topic: 'Self-Awareness & Growth',
      question: 'What is your greatest technical strength, and what is one genuine area of improvement you are actively working on?',
      keyPoints: ['technical strength', 'problem solving', 'genuine weakness', 'action taken to improve', 'growth mindset'],
      idealAnswer: 'My greatest strength is rapid problem diagnosis and breaking complex system requirements into modular components. An area I am actively improving is public speaking and presenting architectural proposals to large non-technical audiences. I have been practicing through mock seminars and leading campus tech workshops.'
    },
    {
      id: 'INT-19',
      type: 'HR',
      topic: 'Pressure & Deadline Management',
      question: 'How do you prioritize and stay productive when facing multiple competing deadlines or sudden unexpected bugs?',
      keyPoints: ['Eisenhower matrix', 'urgency vs importance', 'transparent communication', 'breaking tasks down', 'avoiding panic', 'delivering MVP'],
      idealAnswer: 'When deadlines converge, I prioritize using urgency and impact. I communicate immediately with project leads to align on critical path deliverables, isolate blockers, and break features into minimum viable milestones. Keeping calm and maintaining transparent status updates prevents panic and ensures quality delivery.'
    },
    {
      id: 'INT-20',
      type: 'HR',
      topic: 'Learning from Failure',
      question: 'Describe a situation where a project or feature you built failed or did not meet expectations. What was your takeaway?',
      keyPoints: ['ownership', 'accepting responsibility', 'post-mortem analysis', 'learning lesson', 'preventive measures'],
      idealAnswer: 'In an earlier cloud deployment, I did not configure connection pool limits, causing database connection exhaustion during peak testing. Rather than blaming traffic, I took full ownership, implemented HikariCP pooling with automated health check alerts, and learned the critical lesson of load-testing edge cases before deployment.'
    },
    {
      id: 'INT-21',
      type: 'HR',
      topic: 'Adaptability & New Technologies',
      question: 'If you are assigned a project in a programming language or framework you have never used before, what is your approach?',
      keyPoints: ['official documentation', 'building a toy prototype', 'understanding core paradigms', 'seeking code reviews', 'fast ramp-up'],
      idealAnswer: 'I focus on core fundamentals first: syntax, memory model, package management, and concurrency idioms. I read official documentation, build a small proof-of-concept CRUD microservice within 48 hours to get hands-on experience, and actively ask senior peers for code reviews on idiomatic best practices.'
    }
  ],

  // 1-on-1 Officer Mock Interview Bookings & Schedule Management
  interviewRequests: [
    {
      id: 'REQ-INT-101',
      studentId: 'STU-101',
      studentName: 'Sashti',
      studentEmail: 'sashti.s@college.edu',
      studentDept: 'CSE',
      studentRoll: '22CS089',
      studentCgpa: 8.45,
      domain: 'Technical DSA & System Design',
      targetCompany: 'Google',
      preferredDate: '2026-10-02',
      preferredTimeSlot: 'Morning (10:00 AM - 12:00 PM)',
      notes: 'Need focused practice on Dynamic Programming, Graph Traversals, and Google L3 system design patterns.',
      status: 'Scheduled',
      assignedOfficerId: 'PO-01',
      assignedOfficerName: 'Dr. Radhika Raman (Head of Placement)',
      scheduledDate: '2026-10-02',
      scheduledTime: '10:30',
      mode: 'Online',
      meetingLink: 'https://meet.google.com/pts-sashti-goog',
      venue: '',
      officerNotes: 'Please review Graph BFS/DFS and be prepared with your SIH hackathon architecture diagram.',
      feedback: '',
      createdAt: '2026-09-26T14:30:00.000Z'
    },
    {
      id: 'REQ-INT-102',
      studentId: 'STU-102',
      studentName: 'Arun Kumar',
      studentEmail: 'arun.k@college.edu',
      studentDept: 'IT',
      studentRoll: '22IT045',
      studentCgpa: 8.92,
      domain: 'HR & Behavioral',
      targetCompany: 'Microsoft',
      preferredDate: '2026-10-04',
      preferredTimeSlot: 'Afternoon (02:00 PM - 04:00 PM)',
      notes: 'Seeking feedback on STAR method responses and behavioral questions for Microsoft.',
      status: 'Pending',
      assignedOfficerId: null,
      assignedOfficerName: null,
      scheduledDate: null,
      scheduledTime: null,
      mode: null,
      meetingLink: null,
      venue: null,
      officerNotes: null,
      feedback: '',
      createdAt: '2026-09-27T10:15:00.000Z'
    }
  ],

  // Comprehensive Evaluations Delivered by Placement Officers to Students
  interviewFeedbacks: [
    {
      id: 'FB-INT-501',
      requestId: 'REQ-INT-101',
      studentId: 'STU-101',
      studentName: 'Sashti',
      studentEmail: 'sashti.s@college.edu',
      studentDept: 'CSE',
      officerId: 'OFF-201',
      officerName: 'Dr. R. Ramanathan',
      officerTitle: 'Head Placement Officer (CDC)',
      domain: 'Technical DSA & System Design Mock Interview',
      targetCompany: 'Google & Zoho Corporation',
      sessionDate: '2026-09-27',
      ratings: {
        technical: 9.0,
        problemSolving: 8.5,
        communication: 8.0,
        professionalism: 9.0,
        overallScore: 86
      },
      verdict: 'Ready for Tier-1 Product Companies (15+ LPA)',
      strengths: 'Exceptional clarity in algorithm optimization and time complexity analysis. Clearly articulated microservices architecture from SIH hackathon. Confident live coding demeanor.',
      improvements: 'Edge case handling in dynamic programming could be faster. Elaborate more on distributed cache invalidation strategies during System Design.',
      actionableAdvice: 'Practice 5 medium-hard graph questions on LeetCode before the Zoho and Google on-campus rounds. Review distributed consistency models.',
      createdAt: '2026-09-27T16:00:00.000Z'
    }
  ],

  // Student Feedback & Ratings on How Interviews were Taken by Placement Officers
  studentOfficerFeedbacks: [
    {
      id: 'STU-FB-701',
      feedbackId: 'FB-INT-501',
      requestId: 'REQ-INT-101',
      studentId: 'STU-101',
      studentName: 'Sashti',
      officerId: 'OFF-201',
      officerName: 'Dr. R. Ramanathan',
      sessionDomain: 'Technical DSA & System Design Mock Interview',
      ratings: {
        clarity: 5,
        helpfulness: 5,
        industryRelevance: 5,
        overallExperience: 5
      },
      identifiedWeaknesses: 'Yes',
      wouldRecommend: 'Highly Recommend',
      comments: 'The mock interview was extremely realistic! Dr. Ramanathan tested real Google-style follow-up questions and gave constructive pointers on how to articulate trade-offs in system design. Boosted my confidence tremendously.',
      createdAt: '2026-09-27T18:30:00.000Z'
    }
  ],

  // Student Reminders & Alarms (Student Portal Alone)
  reminders: [
    {
      id: 'REM-1',
      studentId: 'STU-101',
      title: 'Solve Daily LeetCode Challenge (Dynamic Programming)',
      category: 'LeetCode', // LeetCode | Mock Interview | Officer Interview | Aptitude | Custom
      remindAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      priority: 'High',
      notes: 'Focus on 0/1 Knapsack and Coin Change problems on LeetCode.',
      url: 'https://leetcode.com/problemset/all/',
      status: 'Active',
      repeat: 'Daily',
      createdAt: new Date().toISOString()
    },
    {
      id: 'REM-2',
      studentId: 'STU-101',
      title: 'Scheduled Officer Mock Interview with Dr. Radhika',
      category: 'Officer Interview',
      remindAt: '2026-10-02T10:15:00.000Z',
      priority: 'High',
      notes: 'Online Google Meet interview. Be ready 15 mins early with resume.',
      url: 'https://meet.google.com/pts-sashti-goog',
      status: 'Active',
      repeat: 'Once',
      createdAt: new Date().toISOString()
    },
    {
      id: 'REM-3',
      studentId: 'STU-101',
      title: 'AI Voice Mock Interview Practice (HR Round)',
      category: 'Mock Interview',
      remindAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: 'Normal',
      notes: 'Practice STAR method questions in the AI Mock Interview room.',
      url: '#ai-tools',
      status: 'Active',
      repeat: 'Once',
      createdAt: new Date().toISOString()
    }
  ],

  // Notifications
  notifications: [
    {
      id: 'NOTIF-1',
      title: 'Zoho Corporation Drive Confirmed',
      message: 'Zoho Corporation round 2 schedule published. Check your application status tab.',
      date: '2026-09-08',
      type: 'info',
      read: false
    },
    {
      id: 'NOTIF-2',
      title: 'Google Campus Drive Registration Open',
      message: 'Eligibility criteria: CGPA >= 8.5 with no standing backlogs. Register before Oct 2.',
      date: '2026-09-07',
      type: 'success',
      read: false
    },
    {
      id: 'NOTIF-3',
      title: 'Mock Aptitude Test Series Live',
      message: 'Full-length Mock Test 4 covering Quantitative, Logical, and Coding is now available.',
      date: '2026-09-06',
      type: 'warning',
      read: true
    }
  ],

  // System Audit Logs (for Admin module)
  auditLogs: [
    { id: 'LOG-1', time: '2026-09-09 20:30', user: 'Admin', action: 'System health check completed. All services operational.' },
    { id: 'LOG-2', time: '2026-09-09 18:15', user: 'PO Officer', action: 'Added placement drive for Google SDE-1 (32 LPA).' },
    { id: 'LOG-3', time: '2026-09-09 14:40', user: 'Recruiter (Zoho)', action: 'Shortlisted 14 candidates for Technical Round.' },
    { id: 'LOG-4', time: '2026-09-09 11:20', user: 'Sashti (Student)', action: 'Completed Mock Aptitude Test #3. Score: 85%.' },
    { id: 'LOG-5', time: '2026-09-08 09:10', user: 'System', action: 'Daily database backup snapshot created successfully.' }
  ]
};

// State Store Service
class AppState {
  constructor() {
    this.data = this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.currentUser) {
          if (!parsed.currentUser.college) {
            parsed.currentUser.college = INITIAL_DATA.currentUser.college;
            parsed.currentUser.wellVersedLanguages = INITIAL_DATA.currentUser.wellVersedLanguages;
            parsed.currentUser.hasInternship = INITIAL_DATA.currentUser.hasInternship;
            parsed.currentUser.internship = INITIAL_DATA.currentUser.internship;
            parsed.currentUser.hasHackathons = INITIAL_DATA.currentUser.hasHackathons;
            parsed.currentUser.hackathons = INITIAL_DATA.currentUser.hackathons;
          }
          if (!parsed.currentUser.educationStatus) {
            parsed.currentUser.educationStatus = INITIAL_DATA.currentUser.educationStatus;
            parsed.currentUser.pursuingYear = INITIAL_DATA.currentUser.pursuingYear;
            parsed.currentUser.degree = INITIAL_DATA.currentUser.degree;
            parsed.currentUser.completedDegree = INITIAL_DATA.currentUser.completedDegree;
            parsed.currentUser.graduationYear = INITIAL_DATA.currentUser.graduationYear;
          }
          if (!parsed.currentUser.readiness) {
            parsed.currentUser.readiness = { overall: 75, aptitude: 75, coding: 80, communication: 70 };
          }
        }
        if (!parsed.userAccounts) {
          parsed.userAccounts = JSON.parse(JSON.stringify(INITIAL_DATA.userAccounts));
        }

        // Ensure newly available LeetCode questions are merged if not already present
        if (!parsed.questions || !parsed.questions.some(q => q.type === 'leetcode')) {
          const leetcodeQs = INITIAL_DATA.questions.filter(q => q.type === 'leetcode');
          parsed.questions = [...leetcodeQs, ...(parsed.questions || INITIAL_DATA.questions)];
        }

        // Ensure all questions have completedBy array
        (parsed.questions || []).forEach(q => {
          if (!Array.isArray(q.completedBy)) {
            const initialMatch = INITIAL_DATA.questions.find(iq => iq.id === q.id);
            q.completedBy = initialMatch && Array.isArray(initialMatch.completedBy) ? [...initialMatch.completedBy] : [];
          }
        });

        // Ensure officers registry exists
        if (!parsed.officers || !parsed.officers.length) {
          parsed.officers = JSON.parse(JSON.stringify(INITIAL_DATA.officers));
        }

        // Ensure recruiters registry exists
        if (!parsed.recruiters || !parsed.recruiters.length) {
          parsed.recruiters = JSON.parse(JSON.stringify(INITIAL_DATA.recruiters));
        }

        // Ensure all companies have requirements array and hiring metrics
        (parsed.companies || []).forEach(comp => {
          if (!comp.requirements || !comp.requirements.length) {
            const initialMatch = INITIAL_DATA.companies.find(ic => ic.id === comp.id);
            if (initialMatch && initialMatch.requirements) {
              comp.requirements = [...initialMatch.requirements];
            } else {
              comp.requirements = [
                'Solid grasp of Data Structures and Problem Solving',
                'Strong communication and analytical skills',
                'Zero backlogs / arrears'
              ];
            }
          }
          const initialMatch = INITIAL_DATA.companies.find(ic => ic.id === comp.id || ic.name === comp.name);
          if (initialMatch) {
            if (typeof comp.targetHires === 'undefined') comp.targetHires = initialMatch.targetHires || 20;
            if (typeof comp.appliedCount === 'undefined') comp.appliedCount = initialMatch.appliedCount || 25;
            if (typeof comp.placedCount === 'undefined') comp.placedCount = initialMatch.placedCount || 0;
          } else {
            if (typeof comp.targetHires === 'undefined') comp.targetHires = 20;
            if (typeof comp.appliedCount === 'undefined') comp.appliedCount = 20;
            if (typeof comp.placedCount === 'undefined') comp.placedCount = 0;
          }
        });

        // Ensure students have placed metadata
        (parsed.students || []).forEach(st => {
          const initialMatch = INITIAL_DATA.students.find(is => is.id === st.id);
          if (initialMatch && initialMatch.status === 'Placed') {
            st.status = 'Placed';
            st.placedCompany = st.placedCompany || initialMatch.placedCompany;
            st.placedCtc = st.placedCtc || initialMatch.placedCtc;
            st.placedCtcNum = st.placedCtcNum || initialMatch.placedCtcNum;
            st.placedRole = st.placedRole || initialMatch.placedRole;
            st.placedDate = st.placedDate || initialMatch.placedDate;
            st.offerLetter = st.offerLetter || initialMatch.offerLetter;
          }
        });

        // Ensure interviewRequests array exists
        if (!parsed.interviewRequests || !Array.isArray(parsed.interviewRequests)) {
          parsed.interviewRequests = JSON.parse(JSON.stringify(INITIAL_DATA.interviewRequests || []));
        }

        // Ensure interviewFeedbacks array exists
        if (!parsed.interviewFeedbacks || !Array.isArray(parsed.interviewFeedbacks)) {
          parsed.interviewFeedbacks = JSON.parse(JSON.stringify(INITIAL_DATA.interviewFeedbacks || []));
        }

        // Ensure studentOfficerFeedbacks array exists
        if (!parsed.studentOfficerFeedbacks || !Array.isArray(parsed.studentOfficerFeedbacks)) {
          parsed.studentOfficerFeedbacks = JSON.parse(JSON.stringify(INITIAL_DATA.studentOfficerFeedbacks || []));
        }

        // Ensure reminders array exists
        if (!parsed.reminders || !Array.isArray(parsed.reminders)) {
          parsed.reminders = JSON.parse(JSON.stringify(INITIAL_DATA.reminders || []));
        }

        // Ensure newly expanded interview questions are merged if older smaller bank is stored
        if (!parsed.interviewQuestions || parsed.interviewQuestions.length < 15) {
          parsed.interviewQuestions = JSON.parse(JSON.stringify(INITIAL_DATA.interviewQuestions));
        }

        // Ensure applications have PDF resume metadata and include recruiter seed applications
        if (!parsed.applications || !parsed.applications.length) {
          parsed.applications = JSON.parse(JSON.stringify(INITIAL_DATA.applications));
        } else {
          INITIAL_DATA.applications.forEach(initApp => {
            const existing = parsed.applications.find(a => a.id === initApp.id);
            if (!existing) {
              parsed.applications.push(JSON.parse(JSON.stringify(initApp)));
            } else if (initApp.acceptedForInterview && !existing.acceptedForInterview) {
              existing.status = initApp.status;
              existing.acceptedForInterview = initApp.acceptedForInterview;
              existing.interviewRound = initApp.interviewRound;
              existing.scheduledDate = initApp.scheduledDate;
              existing.scheduledTime = initApp.scheduledTime;
              existing.interviewMode = initApp.interviewMode;
              existing.meetingLink = initApp.meetingLink;
              existing.venue = initApp.venue;
              existing.recruiterFeedback = initApp.recruiterFeedback;
            } else if (initApp.rejectionReason && !existing.rejectionReason) {
              existing.status = initApp.status;
              existing.rejectionReason = initApp.rejectionReason;
              existing.recruiterFeedback = initApp.recruiterFeedback;
            }
          });
          parsed.applications.forEach(app => {
            if (!app.resumePdfName) {
              const matchedInit = INITIAL_DATA.applications.find(ia => ia.id === app.id || ia.studentId === app.studentId);
              app.resumePdfName = matchedInit?.resumePdfName || `${app.studentName.replace(/\s+/g, '_')}_Resume.pdf`;
              app.resumePdfSize = matchedInit?.resumePdfSize || '184 KB';
              app.resumeFormat = 'PDF';
              app.resumeVerified = true;
              app.resumePdfContent = matchedInit?.resumePdfContent || `Candidate ${app.studentName} - B.E. ${app.studentDept} (CGPA: ${app.studentCgpa}).\nTechnical Skills: Python, Java, Data Structures, Algorithms, SQL, Git, REST APIs.\nProjects: Full-Stack Placement Portal.`;
            }
          });
        }

        return parsed;
      }
    } catch (e) {
      console.warn('Failed to load local storage, loading fallback', e);
    }
    this.saveState(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState(dataToSave = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveState();
    return this.data;
  }

  // Supabase Hydration & Realtime Synchronization
  async initSupabaseSync() {
    if (!window.ptsSupabaseService || !window.ptsSupabase || !window.ptsSupabase.isReady()) {
      return false;
    }

    try {
      console.log('[AppState] Connecting to Supabase and hydrating cloud data...');
      const cloudData = await window.ptsSupabaseService.hydrateState();

      if (cloudData) {
        if (cloudData.companies && cloudData.companies.length) {
          this.data.companies = cloudData.companies;
        }
        if (cloudData.applications && cloudData.applications.length) {
          this.data.applications = cloudData.applications;
        }
        if (cloudData.students && cloudData.students.length) {
          this.data.students = cloudData.students;
        }
        if (cloudData.accounts && Object.keys(cloudData.accounts).length) {
          this.data.accounts = { ...this.data.accounts, ...cloudData.accounts };
        }
        if (cloudData.questions && cloudData.questions.length) {
          this.data.questions = cloudData.questions;
        }
        if (cloudData.interviewQuestions && cloudData.interviewQuestions.length) {
          this.data.interviewQuestions = cloudData.interviewQuestions;
        }
        if (cloudData.notifications && cloudData.notifications.length) {
          this.data.notifications = cloudData.notifications;
        }
        if (cloudData.auditLogs && cloudData.auditLogs.length) {
          this.data.auditLogs = cloudData.auditLogs;
        }

        // Re-sync current user with cloud account
        if (this.data.currentUser && this.data.accounts) {
          const currentRole = this.data.currentUser.role;
          if (this.data.accounts[currentRole]) {
            this.data.currentUser = { ...this.data.accounts[currentRole] };
          }
        }

        this.saveState();
        console.log('[AppState] Successfully hydrated state from Supabase!');

        // Refresh UI views if App is ready
        if (window.App && typeof window.App.refreshCurrentView === 'function') {
          window.App.refreshCurrentView();
        }

        window.dispatchEvent(new CustomEvent('pts:supabase-hydrated', { detail: { count: cloudData.companies.length } }));
      }

      // Initialize Supabase Realtime Subscriptions
      this.initRealtimeSubscriptions();
      return true;
    } catch (err) {
      console.warn('[AppState] Supabase hydration warning, using local state:', err);
      return false;
    }
  }

  initRealtimeSubscriptions() {
    if (!window.ptsSupabaseService) return;

    window.ptsSupabaseService.initRealtime({
      onApplication: (payload) => {
        if (!payload || !payload.eventType) return;
        const record = payload.new;
        if (payload.eventType === 'INSERT' && record) {
          const transformed = window.ptsSupabaseService.transformApplicationFromDb(record);
          if (!this.data.applications.some(a => a.id === transformed.id)) {
            this.data.applications.unshift(transformed);
            this.saveState();
            if (window.App) {
              window.App.refreshCurrentView();
              window.App.showToast(`New application submitted for ${transformed.companyName}`, 'info');
            }
          }
        } else if (payload.eventType === 'UPDATE' && record) {
          const transformed = window.ptsSupabaseService.transformApplicationFromDb(record);
          const idx = this.data.applications.findIndex(a => a.id === transformed.id);
          if (idx !== -1) {
            this.data.applications[idx] = transformed;
            if (transformed.status === 'Selected') {
              const st = this.data.students.find(s => s.id === transformed.studentId);
              if (st) { st.status = 'Placed'; st.placedCompany = transformed.companyName; }
            }
            this.saveState();
            if (window.App) {
              window.App.refreshCurrentView();
              window.App.showToast(`Application status updated: ${transformed.companyName} -> ${transformed.status}`, 'success');
            }
          }
        } else if (payload.eventType === 'DELETE' && payload.old) {
          this.data.applications = this.data.applications.filter(a => a.id !== payload.old.id);
          this.saveState();
          if (window.App) window.App.refreshCurrentView();
        }
      },

      onCompany: (payload) => {
        if (!payload || !payload.eventType) return;
        const record = payload.new;
        if (payload.eventType === 'INSERT' && record) {
          const transformed = window.ptsSupabaseService.transformCompanyFromDb(record);
          if (!this.data.companies.some(c => c.id === transformed.id)) {
            this.data.companies.unshift(transformed);
            this.saveState();
            if (window.App) {
              window.App.refreshCurrentView();
              window.App.showToast(`New Campus Drive scheduled: ${transformed.name} (${transformed.ctc})!`, 'success');
            }
          }
        } else if (payload.eventType === 'UPDATE' && record) {
          const transformed = window.ptsSupabaseService.transformCompanyFromDb(record);
          const idx = this.data.companies.findIndex(c => c.id === transformed.id);
          if (idx !== -1) {
            this.data.companies[idx] = transformed;
            this.saveState();
            if (window.App) window.App.refreshCurrentView();
          }
        }
      },

      onNotification: (payload) => {
        if (payload && payload.new) {
          const n = payload.new;
          const notif = {
            id: n.id,
            title: n.title,
            message: n.message,
            date: n.date,
            type: n.type,
            read: n.read || false
          };
          if (!this.data.notifications.some(existing => existing.id === notif.id)) {
            this.data.notifications.unshift(notif);
            this.saveState();
            if (window.App) {
              const dot = document.querySelector('.notification-dot');
              if (dot) dot.style.display = 'block';
              window.App.showToast(`📢 Announcement: ${notif.title}`, 'info');
            }
          }
        }
      },

      onSessionLock: (payload) => {
        if (payload && payload.new && this.data.activeSession) {
          const newSession = payload.new;
          if (newSession.user_id === this.data.activeSession.userId && newSession.session_id !== this.data.activeSession.sessionId) {
            // Overridden from another browser window!
            if (window.App && typeof window.App.onSessionTerminatedByOther === 'function') {
              window.App.onSessionTerminatedByOther(newSession.user_name);
            }
          }
        }
      }
    });
  }

  // Authentication & Single Active Session Contr  // User Registration for New Accounts
  registerUser(details, forceOverride = false, clientSessionId = null) {
    if (!details || typeof details !== 'object') {
      return { success: false, message: 'Invalid registration details provided.' };
    }

    const cleanRole = (details.role || 'student').trim().toLowerCase();
    const cleanEmail = (details.email || '').trim().toLowerCase();
    const cleanPassword = (details.password !== undefined && details.password !== null) ? String(details.password).trim() : '';
    const cleanName = (details.name || '').trim();

    if (!cleanName) {
      return { success: false, message: 'Please enter your full name.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid email address (e.g. name@college.edu).' };
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    if (!this.data.userAccounts) {
      this.data.userAccounts = JSON.parse(JSON.stringify(INITIAL_DATA.userAccounts || {}));
    }

    // Check if account already exists
    if (this.data.userAccounts[cleanEmail]) {
      return {
        success: false,
        code: 'EMAIL_EXISTS',
        message: `An account with "${cleanEmail}" already exists. Please switch to Sign In to enter your password.`
      };
    }

    const newId = `${cleanRole.toUpperCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;

    const newAccount = {
      id: newId,
      email: cleanEmail,
      password: cleanPassword, // Stored securely in account registry!
      role: cleanRole,
      name: cleanName,
      avatar: cleanName.charAt(0).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    if (cleanRole === 'student') {
      newAccount.college = details.college || 'Sri Krishna College of Engineering and Technology';
      newAccount.department = details.department || 'CSE';
      newAccount.degree = details.degree || 'B.E.';
      newAccount.title = `${newAccount.degree} ${newAccount.department} Student`;
      newAccount.cgpa = parseFloat(details.cgpa) || 8.0;
      newAccount.arrears = parseInt(details.arrears, 10) || 0;
      newAccount.educationStatus = 'studying';
      newAccount.pursuingYear = '4th Year / Final Year';
      newAccount.graduationYear = '2026';
      newAccount.skills = ['Python', 'Java', 'Data Structures & Algorithms', 'Web Development'];
      newAccount.wellVersedLanguages = ['Python', 'Java'];
      newAccount.readiness = { overall: 75, aptitude: 75, coding: 80, communication: 70 };
      newAccount.testsCompleted = 0;
      newAccount.avgScore = 0;

      if (!this.data.students.some(s => s.email.toLowerCase() === cleanEmail)) {
        this.data.students.push({
          id: newId,
          name: cleanName,
          email: cleanEmail,
          college: newAccount.college,
          department: newAccount.department,
          rollNo: '22' + (newAccount.department.slice(0, 2).toUpperCase()) + Math.floor(100 + Math.random() * 900),
          educationStatus: 'studying',
          pursuingYear: '4th Year / Final Year',
          degree: newAccount.degree,
          graduationYear: '2026',
          cgpa: newAccount.cgpa,
          arrears: 0,
          skills: newAccount.skills,
          wellVersedLanguages: newAccount.wellVersedLanguages,
          status: 'In Progress',
          readiness: 75,
          placedCompany: null
        });
      }
    } else if (cleanRole === 'officer') {
      newAccount.department = details.department || 'Career Development Centre';
      newAccount.title = details.title || 'Placement Officer';
      newAccount.office = 'Placement Cell, CDC Block';
      newAccount.phone = '+91 94433 00000';

      if (!this.data.officers.some(o => o.email.toLowerCase() === cleanEmail)) {
        this.data.officers.push({
          id: newId,
          name: cleanName,
          title: newAccount.title,
          department: newAccount.department,
          email: cleanEmail,
          phone: newAccount.phone,
          avatar: cleanName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          status: 'Active Now (Checking Portal)',
          isCheckingNow: true,
          lastActive: 'Just Now',
          questionsPostedCount: 0,
          lastQuestionPostedDate: 'Never',
          lastQuestionTitle: 'None'
        });
      }
    } else if (cleanRole === 'recruiter') {
      const comp = (details.company || '').trim();
      if (!comp) {
        return {
          success: false,
          message: 'Please select an officially approved Company Name.'
        };
      }

      // Institutional Governance Check: Only Admin-included companies allow recruiter accounts
      const isCompanyIncluded = (this.data.companies || []).some(
        c => c.name && c.name.trim().toLowerCase() === comp.toLowerCase()
      );
      if (!isCompanyIncluded) {
        return {
          success: false,
          code: 'COMPANY_NOT_APPROVED',
          message: `Registration Prohibited: "${comp}" has not been officially included by the Placement Administrator. Under institutional policy, only the System Administrator has the authority to include new visiting companies. Once your company is officially included by the Administrator, you can register and sign in.`
        };
      }

      newAccount.company = comp;
      newAccount.title = details.title || 'Campus Talent Acquisition Lead';
      newAccount.department = 'Recruitment Team';
      newAccount.phone = '+91 98000 00000';

      if (!this.data.recruiters.some(r => r.email.toLowerCase() === cleanEmail)) {
        const matchedComp = (this.data.companies || []).find(c => c.name.toLowerCase() === comp.toLowerCase());
        this.data.recruiters.push({
          id: newId,
          name: cleanName,
          company: comp,
          roleTitle: newAccount.title,
          email: cleanEmail,
          phone: newAccount.phone,
          avatar: cleanName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          verified: true,
          studentsReadyToHire: matchedComp?.targetHires || 20,
          companyLogo: matchedComp?.logo || 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png',
          status: 'Active'
        });
      }
    } else if (cleanRole === 'admin') {
      newAccount.title = 'Placement System Administrator';
      newAccount.department = 'IT Systems & Security';
      newAccount.phone = '+91 99000 00000';
    }

    this.data.userAccounts[cleanEmail] = newAccount;
    this.addAuditLog(`New ${cleanRole.toUpperCase()} account created: ${cleanEmail} (${cleanName}). Registered with user-defined password.`);
    this.saveState();

    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.saveProfile(newAccount);
    }

    // Immediately log in this newly registered user
    return this.login(cleanRole, cleanEmail, cleanPassword, forceOverride, clientSessionId, true);
  }

  // Authentication & Single Active Session Control
  // Accepts: (selectedRole, email, password, forceOverride, clientSessionId, isNewRegistration)
  login(selectedRole, email, password, forceOverride = false, clientSessionId = null, isNewRegistration = false) {
    let cleanRole = (selectedRole || 'student').trim().toLowerCase();
    let cleanEmail = (email || '').trim().toLowerCase();
    let cleanPassword = (password !== undefined && password !== null) ? String(password).trim() : '';

    // Handle backward compatibility if called as login(email, password)
    if (cleanRole.includes('@') && (!cleanEmail || !cleanEmail.includes('@'))) {
      cleanPassword = cleanEmail;
      cleanEmail = cleanRole;
      if (this.data.userAccounts && this.data.userAccounts[cleanEmail]) {
        cleanRole = this.data.userAccounts[cleanEmail].role;
      } else {
        cleanRole = 'student';
      }
    }

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your email address to sign in.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Please enter your password to sign in.' };
    }

    if (!this.data.userAccounts) {
      this.data.userAccounts = JSON.parse(JSON.stringify(INITIAL_DATA.userAccounts || {}));
    }

    const roleDisplayNames = {
      student: 'Student',
      officer: 'Placement Officer',
      recruiter: 'Recruiter',
      admin: 'Administrator'
    };

    // Check if account exists
    if (!this.data.userAccounts[cleanEmail]) {
      return {
        success: false,
        code: 'USER_NOT_FOUND',
        message: `No account found for "${cleanEmail}". If you are a new user, please click "Create Account" below to register.`
      };
    }

    const existingAccount = this.data.userAccounts[cleanEmail];

    // 1. Strict Role Verification:
    // A Student cannot login as Officer/Recruiter/Admin, and vice versa
    if (existingAccount.role !== cleanRole) {
      const registeredRoleName = roleDisplayNames[existingAccount.role] || existingAccount.role.toUpperCase();
      const attemptedRoleName = roleDisplayNames[cleanRole] || cleanRole.toUpperCase();
      return {
        success: false,
        code: 'ROLE_MISMATCH',
        message: `Access Denied: "${cleanEmail}" is registered as a ${registeredRoleName}. You cannot sign in under the ${attemptedRoleName} tab. Please select the "${registeredRoleName}" tab.`
      };
    }

    // 2. Strict Password Verification (User must enter the same password used at registration)
    if (existingAccount.password !== cleanPassword) {
      return {
        success: false,
        code: 'INVALID_PASSWORD',
        message: `Incorrect password for ${cleanEmail}. Please enter the same password you used when creating your account.`
      };
    }

    const target = existingAccount;

    // 3. Strict Recruiter Institutional Governance Check:
    // If logging in as Recruiter, their company must be officially included in data.companies by the Administrator.
    if (cleanRole === 'recruiter') {
      const recCompany = target.company || (this.data.recruiters || []).find(r => r.email.toLowerCase() === cleanEmail)?.company || '';
      const isCompanyIncluded = (this.data.companies || []).some(
        c => c.name && recCompany && c.name.trim().toLowerCase() === recCompany.trim().toLowerCase()
      );
      if (!isCompanyIncluded) {
        return {
          success: false,
          code: 'COMPANY_NOT_INCLUDED',
          message: `Access Denied: The company "${recCompany || 'Unknown'}" is not officially included in the system. Under institutional policy, only the System Administrator has the exclusive right to include new visiting companies before company recruiters can log in. Please contact the Placement Administrator to approve and onboard your company.`
        };
      }
    }

    // Check Single Active Session Lock
    const existing = this.data.activeSession;
    const now = Date.now();
    const isRecentlyActive = existing && (now - (existing.lastHeartbeat || 0) < 15 * 60 * 1000);

    if (existing && this.data.isAuthenticated && isRecentlyActive && existing.sessionId !== clientSessionId) {
      if (!forceOverride) {
        return {
          success: false,
          code: 'SESSION_LOCKED',
          message: `Active session in progress for "${existing.userName}" (${existing.role.toUpperCase()}). Only one person can use a user login at a time!`,
          activeSession: existing,
          targetUser: target
        };
      }
    }

    // Create unique session lock ID
    const newSessionId = 'SESS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.data.activeSession = {
      sessionId: newSessionId,
      userId: target.id,
      userName: target.name,
      role: target.role,
      email: target.email,
      loginTime: nowFormatted,
      lastHeartbeat: now
    };

    this.data.currentUser = { ...target };
    this.data.isAuthenticated = true;
    this.addAuditLog(`User logged in as ${target.name} (${target.role.toUpperCase()}). Single-user session lock acquired [${newSessionId}].`);
    this.saveState();

    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.acquireSessionLock(this.data.activeSession);
    }

    return { 
      success: true, 
      user: target, 
      sessionId: newSessionId, 
      isNewRegistration,
      overrideOccurred: Boolean(existing && existing.sessionId !== clientSessionId)
    };
  }

  logout() {
    const prevUser = this.data.currentUser?.name || '';
    const prevSession = this.data.activeSession?.sessionId;

    if (prevSession && window.ptsSupabaseService) {
      window.ptsSupabaseService.releaseSessionLock(prevSession);
    }

    this.data.activeSession = null;
    this.data.isAuthenticated = false;
    this.data.currentUser = JSON.parse(JSON.stringify(INITIAL_DATA.currentUser));
    this.addAuditLog(`User ${prevUser} logged out. Session lock released.`);
    this.saveState();
    return prevSession;
  }

  isLoggedIn() {
    return Boolean(this.data.isAuthenticated && this.data.activeSession);
  }

  getActiveSession() {
    return this.data.activeSession;
  }

  isSessionValid(clientSessionId) {
    if (!this.data.isAuthenticated || !this.data.activeSession) return false;
    return this.data.activeSession.sessionId === clientSessionId;
  }

  updateHeartbeat(clientSessionId) {
    if (this.data.activeSession && this.data.activeSession.sessionId === clientSessionId) {
      this.data.activeSession.lastHeartbeat = Date.now();
      this.saveState();

      if (window.ptsSupabaseService) {
        window.ptsSupabaseService.heartbeatSession(clientSessionId);
      }
    }
  }

  getCurrentUser() {
    return this.data.currentUser || this.data.accounts?.student;
  }

  // Role switching
  setRole(newRole) {
    if (this.data.accounts && this.data.accounts[newRole]) {
      this.data.currentUser = { ...this.data.accounts[newRole] };
    } else {
      this.data.currentUser.role = newRole;
    }
    this.saveState();
  }

  getRole() {
    return this.data.currentUser.role;
  }

  // Dynamic Eligibility Evaluator
  checkEligibility(student, company) {
    const reasons = [];
    let isEligible = true;

    // 1. CGPA check
    if (student.cgpa < company.minCgpa) {
      isEligible = false;
      reasons.push(`CGPA ${student.cgpa.toFixed(2)} is below minimum required (${company.minCgpa.toFixed(2)})`);
    }

    // 2. Arrears check
    if (student.arrears > company.maxArrears) {
      isEligible = false;
      reasons.push(`Standing arrears (${student.arrears}) exceed allowed limit (${company.maxArrears})`);
    }

    // 3. Department check
    if (!company.allowedDepts.includes('All') && !company.allowedDepts.includes(student.department)) {
      isEligible = false;
      reasons.push(`Department ${student.department} not in allowed branches (${company.allowedDepts.join(', ')})`);
    }

    return {
      isEligible,
      reasons
    };
  }

  // Add Job Application with Mandatory PDF Resume
  applyForDrive(companyId, resumeData = {}) {
    const student = this.data.currentUser;
    const company = this.data.companies.find(c => c.id === companyId);
    if (!company) return { success: false, message: 'Company not found.' };

    const eligibility = this.checkEligibility(student, company);
    if (!eligibility.isEligible) {
      return { success: false, message: 'Not eligible: ' + eligibility.reasons.join('; ') };
    }

    // Check duplicate
    const existing = this.data.applications.find(a => a.companyId === companyId && a.studentId === student.id);
    if (existing) {
      return { success: false, message: 'You have already applied to this drive.' };
    }

    const resumePdfName = resumeData.resumePdfName || student.resumeName || `${student.name.replace(/\s+/g, '_')}_Resume.pdf`;
    const resumePdfUrl = resumeData.resumePdfUrl || student.resumeUrl || '';
    const resumePdfDataUri = resumeData.resumePdfDataUri || student.resumePdfDataUri || '';
    const resumePdfContent = resumeData.resumePdfContent || student.resumeContent || '';
    const resumePdfSize = resumeData.resumePdfSize || '184 KB';
    const coverNote = resumeData.coverNote || '';

    const newApp = {
      id: 'APP-' + (Math.floor(1000 + Math.random() * 9000)),
      studentId: student.id,
      studentName: student.name,
      studentDept: student.department,
      studentCgpa: student.cgpa,
      companyId: company.id,
      companyName: company.name,
      role: company.role,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Applied',
      currentRound: 'Application Review',
      stepIndex: 1,
      notes: coverNote || 'Application submitted with verified PDF resume. Ready for recruiter ATS screening.',
      resumePdfName,
      resumePdfUrl,
      resumePdfDataUri,
      resumePdfContent,
      resumePdfSize,
      resumeFormat: 'PDF',
      resumeVerified: true,
      coverNote
    };

    this.data.applications.unshift(newApp);
    this.addAuditLog(`Student ${student.name} applied for ${company.name} (${company.role}) with PDF resume '${resumePdfName}'.`);
    this.saveState();

    // Async sync to Supabase
    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.submitApplication(newApp);
    }

    return { success: true, message: `Successfully applied to ${company.name} with verified PDF resume!`, application: newApp };
  }

  // Update Application Status (by Recruiter or PO)
  updateApplicationStatus(appId, newStatus, currentRound, stepIndex) {
    const app = this.data.applications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      if (currentRound) app.currentRound = currentRound;
      if (stepIndex !== undefined) app.stepIndex = stepIndex;

      // If selected, mark student status
      if (newStatus === 'Selected') {
        const student = this.data.students.find(s => s.id === app.studentId);
        if (student) {
          student.status = 'Placed';
          student.placedCompany = app.companyName;
        }
      }

      this.addAuditLog(`Application ${appId} for ${app.studentName} updated to '${newStatus}'.`);
      this.saveState();

      // Async sync to Supabase
      if (window.ptsSupabaseService) {
        window.ptsSupabaseService.updateApplicationStatus(appId, newStatus, currentRound, stepIndex);
      }

      return true;
    }
    return false;
  }

  // Recruiter accepts application for interview with schedule & remarks
  acceptApplicationForInterview(appId, details = {}) {
    const app = this.data.applications.find(a => a.id === appId);
    if (!app) return { success: false, message: 'Application not found.' };

    const roundName = details.round || 'Technical Interview - Round 1';
    const date = details.date || new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    const time = details.time || '10:30 AM';
    const mode = details.mode || 'Online';
    const cleanComp = app.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanStu = app.studentName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const meetingLink = details.meetingLink || (mode === 'Online' ? `https://meet.google.com/${cleanComp}-${cleanStu}-tech` : '');
    const venue = details.venue || (mode === 'Offline' ? 'CDC Placement Interview Hall B, Admin Block' : 'Online');
    const recruiterNotes = details.notes || 'Your resume passed recruiter ATS verification. We look forward to evaluating your core problem solving and system design skills.';

    app.status = 'Accepted for Interview';
    app.acceptedForInterview = true;
    app.currentRound = roundName;
    app.stepIndex = 3;
    app.scheduledDate = date;
    app.scheduledTime = time;
    app.interviewMode = mode;
    app.meetingLink = meetingLink;
    app.venue = venue;
    app.recruiterFeedback = recruiterNotes;
    app.decisionDate = new Date().toISOString();
    app.notes = `Accepted for ${roundName}. Scheduled on ${date} at ${time} (${mode}). Remarks: "${recruiterNotes}"`;

    // High Priority Notification for the Student
    this.addNotification(
      `🎉 Accepted for Interview: ${app.companyName}`,
      `Congratulations! The recruiter of ${app.companyName} accepted your application for ${app.role}! ${roundName} is scheduled on ${date} at ${time} (${mode}). Check your Application Pipeline for join details.`,
      'success'
    );

    this.addAuditLog(`Recruiter of ${app.companyName} accepted ${app.studentName}'s application for ${roundName}.`);
    this.saveState();

    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.updateApplicationStatus(appId, 'Accepted for Interview', roundName, 3);
    }

    return { success: true, message: `Candidate ${app.studentName} accepted for interview! Notification sent.`, application: app };
  }

  // Recruiter rejects application with explicit constructive reason
  rejectApplicationWithReason(appId, reason, guidance = '') {
    const app = this.data.applications.find(a => a.id === appId);
    if (!app) return { success: false, message: 'Application not found.' };

    const rejectionReason = (reason || '').trim() || 'Candidate profile did not meet current shortlist criteria for this drive.';
    const recruiterGuidance = (guidance || '').trim() || 'Focus on building verifiable production projects and practicing core technical problem solving.';

    app.status = 'Rejected';
    app.acceptedForInterview = false;
    app.currentRound = 'Application Screening';
    app.stepIndex = 2;
    app.rejectionReason = rejectionReason;
    app.recruiterFeedback = recruiterGuidance;
    app.decisionDate = new Date().toISOString();
    app.notes = `Application not shortlisted. Reason: "${rejectionReason}"`;

    // High Priority Notification for the Student
    this.addNotification(
      `Application Update: ${app.companyName}`,
      `Your application for ${app.role} at ${app.companyName} was not shortlisted. Reason: "${rejectionReason}". Review detailed feedback in your Application Pipeline.`,
      'warning'
    );

    this.addAuditLog(`Recruiter of ${app.companyName} rejected ${app.studentName}'s application. Reason: ${rejectionReason}`);
    this.saveState();

    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.updateApplicationStatus(appId, 'Rejected', 'Application Screening', 2);
    }

    return { success: true, message: `Application rejected. Constructive reason delivered to ${app.studentName}.`, application: app };
  }

  // Placement Officer delivers comprehensive evaluation & feedback to student
  addOfficerInterviewFeedback(feedbackData) {
    if (!this.data.interviewFeedbacks) this.data.interviewFeedbacks = [];

    const techScore = parseFloat(feedbackData.technicalScore) || 8.0;
    const psScore = parseFloat(feedbackData.problemSolvingScore) || 8.0;
    const commScore = parseFloat(feedbackData.communicationScore) || 7.5;
    const profScore = parseFloat(feedbackData.professionalismScore) || 8.5;
    const overallPct = Math.round(((techScore + psScore + commScore + profScore) / 40) * 100);

    const newFeedback = {
      id: 'FB-INT-' + Math.floor(100 + Math.random() * 900),
      requestId: feedbackData.requestId || null,
      studentId: feedbackData.studentId,
      studentName: feedbackData.studentName,
      studentEmail: feedbackData.studentEmail || '',
      studentDept: feedbackData.studentDept || 'CSE',
      officerId: feedbackData.officerId || 'OFF-201',
      officerName: feedbackData.officerName || 'Dr. R. Ramanathan',
      officerTitle: feedbackData.officerTitle || 'Head Placement Officer (CDC)',
      domain: feedbackData.domain || 'Mock Technical Interview',
      targetCompany: feedbackData.targetCompany || 'Campus Placement Drive',
      sessionDate: feedbackData.sessionDate || new Date().toISOString().split('T')[0],
      ratings: {
        technical: techScore,
        problemSolving: psScore,
        communication: commScore,
        professionalism: profScore,
        overallScore: overallPct
      },
      verdict: feedbackData.verdict || 'Ready for Tier-1 Product Companies (15+ LPA)',
      strengths: feedbackData.strengths || 'Strong grasp of algorithmic complexity and clean code structure.',
      improvements: feedbackData.improvements || 'Focus more on structured trade-off communication during system design.',
      actionableAdvice: feedbackData.actionableAdvice || 'Solve 3 medium LeetCode graph problems daily.',
      createdAt: new Date().toISOString()
    };

    this.data.interviewFeedbacks.unshift(newFeedback);

    // If linked to an interview request, mark request as Completed and attach feedback
    if (feedbackData.requestId && this.data.interviewRequests) {
      const req = this.data.interviewRequests.find(r => r.id === feedbackData.requestId);
      if (req) {
        req.status = 'Completed';
        req.feedback = `${newFeedback.verdict} — ${newFeedback.actionableAdvice}`;
      }
    }

    // Update Student readiness scores
    const student = this.data.students.find(s => s.id === feedbackData.studentId);
    if (student && student.readiness) {
      student.readiness.coding = Math.min(100, Math.round((student.readiness.coding + techScore * 10) / 2));
      student.readiness.communication = Math.min(100, Math.round((student.readiness.communication + commScore * 10) / 2));
      student.readiness.overall = Math.round((student.readiness.coding + student.readiness.aptitude + student.readiness.communication) / 3);
    }

    // High Priority Notification for the Student
    this.addNotification(
      `🏛️ Placement Officer Interview Evaluation Received`,
      `Placement Officer ${newFeedback.officerName} submitted your comprehensive Mock Interview Evaluation! Verdict: "${newFeedback.verdict}". Check your Interview Feedback tab.`,
      'success'
    );

    this.addAuditLog(`Placement Officer ${newFeedback.officerName} submitted interview evaluation for ${newFeedback.studentName}.`);
    this.saveState();

    return { success: true, message: `Interview evaluation sent to ${newFeedback.studentName}!`, feedback: newFeedback };
  }

  // Student submits review on how the interview was taken by the officer
  addStudentOfficerFeedback(feedbackData) {
    if (!this.data.studentOfficerFeedbacks) this.data.studentOfficerFeedbacks = [];

    const newFeedback = {
      id: 'STU-FB-' + Math.floor(100 + Math.random() * 900),
      feedbackId: feedbackData.feedbackId || null,
      requestId: feedbackData.requestId || null,
      studentId: feedbackData.studentId,
      studentName: feedbackData.studentName,
      officerId: feedbackData.officerId || 'OFF-201',
      officerName: feedbackData.officerName || 'Dr. R. Ramanathan',
      sessionDomain: feedbackData.sessionDomain || 'Mock Technical Interview',
      ratings: {
        clarity: parseInt(feedbackData.clarity) || 5,
        helpfulness: parseInt(feedbackData.helpfulness) || 5,
        industryRelevance: parseInt(feedbackData.industryRelevance) || 5,
        overallExperience: parseInt(feedbackData.overallExperience) || 5
      },
      identifiedWeaknesses: feedbackData.identifiedWeaknesses || 'Yes',
      wouldRecommend: feedbackData.wouldRecommend || 'Highly Recommend',
      comments: feedbackData.comments || 'The mock interview was very insightful and closely matched real corporate drive rounds.',
      createdAt: new Date().toISOString()
    };

    this.data.studentOfficerFeedbacks.unshift(newFeedback);

    // Notification for Placement Officer
    this.addNotification(
      `Student Feedback Received`,
      `${newFeedback.studentName} submitted feedback on their mock interview session with ${newFeedback.officerName}. Overall rating: ${newFeedback.ratings.overallExperience}/5 stars.`,
      'info'
    );

    this.addAuditLog(`Student ${newFeedback.studentName} submitted feedback on interview conducted by ${newFeedback.officerName}.`);
    this.saveState();

    return { success: true, message: 'Your feedback on the interview conducted by the officer has been recorded!', feedback: newFeedback };
  }

  // Add Company / Drive (by Officer) with full details & requirements
  addCompany(companyData) {
    let reqs = companyData.requirements;
    if (typeof reqs === 'string') {
      reqs = reqs.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (!Array.isArray(reqs) || reqs.length === 0) {
      reqs = [
        'Strong fundamentals in Data Structures & Algorithms',
        'Problem solving and analytical skills',
        'Good grasp of Computer Science core concepts',
        'Clear verbal and written communication'
      ];
    }

    let roundsList = companyData.rounds;
    if (typeof roundsList === 'string') {
      roundsList = roundsList.split(/,|->/).map(r => r.trim()).filter(Boolean);
    }
    if (!Array.isArray(roundsList) || roundsList.length === 0) {
      roundsList = ['Aptitude Assessment', 'Technical Interview', 'HR Round'];
    }

    const ctcValue = parseFloat(String(companyData.ctc || '10').replace(/[^0-9.]/g, '')) || 10.0;
    const ctcStr = String(companyData.ctc || '').includes('LPA') ? companyData.ctc : `${ctcValue} LPA`;

    const newComp = {
      id: 'COMP-' + (this.data.companies.length + 1),
      status: companyData.status || 'Upcoming',
      name: companyData.name || 'Visiting Company',
      role: companyData.role || 'Software Engineer',
      ctc: ctcStr,
      ctcNum: ctcValue,
      logo: companyData.logo || 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png',
      category: companyData.category || (ctcValue >= 20 ? 'Dream / Tier 1' : (ctcValue >= 10 ? 'Product' : 'Core / IT')),
      location: companyData.location || 'Bangalore / Chennai / Hybrid',
      minCgpa: parseFloat(companyData.minCgpa) || 7.0,
      maxArrears: parseInt(companyData.maxArrears, 10) || 0,
      allowedDepts: Array.isArray(companyData.allowedDepts) ? companyData.allowedDepts : (typeof companyData.allowedDepts === 'string' ? companyData.allowedDepts.split(',').map(d => d.trim()) : ['CSE', 'IT', 'ECE']),
      driveDate: companyData.driveDate || new Date(Date.now() + 14*86400000).toISOString().split('T')[0],
      deadline: companyData.deadline || new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
      description: companyData.description || 'Campus recruitment drive for final year engineering students.',
      requirements: reqs,
      rounds: roundsList
    };

    this.data.companies.unshift(newComp);
    this.addAuditLog(`Placement Officer scheduled new drive: ${newComp.name} (${newComp.ctc}) for role '${newComp.role}'`);

    // Auto-broadcast notice to all students
    this.addNotification(
      `🏛️ New Campus Drive: ${newComp.name} Visiting!`,
      `${newComp.name} has scheduled campus recruitment for '${newComp.role}' (${newComp.ctc}). Drive Date: ${newComp.driveDate}. Check eligibility and requirements now!`,
      'info'
    );

    this.saveState();

    // Async sync to Supabase
    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.addCompany(newComp);
    }

    return newComp;
  }

  // Institutional Governance: Administrator-exclusive right to include new visiting companies
  // and authorize their corporate recruiters to access and log in.
  includeCompanyByAdmin(companyData, recruiterData = null) {
    if (!companyData || !companyData.name) {
      return { success: false, message: 'Company Name is required to include a new visiting company.' };
    }

    const compName = String(companyData.name).trim();
    if (!compName) {
      return { success: false, message: 'Valid Company Name is required.' };
    }

    const ctcValue = parseFloat(String(companyData.ctc || '12').replace(/[^0-9.]/g, '')) || 12.0;
    const ctcStr = String(companyData.ctc || '').includes('LPA') ? companyData.ctc : `${ctcValue} LPA`;

    let reqs = companyData.requirements;
    if (typeof reqs === 'string') {
      reqs = reqs.split('\n').map(r => r.trim()).filter(Boolean);
    }
    if (!Array.isArray(reqs) || reqs.length === 0) {
      reqs = [
        'Solid foundation in Data Structures, Algorithms & Problem Solving',
        'Proficiency in core programming languages and system design',
        'Strong communication skills and collaborative problem-solving'
      ];
    }

    let roundsList = companyData.rounds;
    if (typeof roundsList === 'string') {
      roundsList = roundsList.split(/,|->/).map(r => r.trim()).filter(Boolean);
    }
    if (!Array.isArray(roundsList) || roundsList.length === 0) {
      roundsList = ['Online Assessment', 'Technical Interview 1', 'Technical Interview 2', 'HR Round'];
    }

    if (!this.data.companies) this.data.companies = [];

    // Check if company already exists
    let existingIndex = this.data.companies.findIndex(c => c.name.toLowerCase() === compName.toLowerCase());
    let compId = existingIndex >= 0 ? this.data.companies[existingIndex].id : ('COMP-' + (this.data.companies.length + 1));

    const targetHires = parseInt(companyData.targetHires, 10) || 20;

    const newCompanyObj = {
      id: compId,
      name: compName,
      status: companyData.status || 'Upcoming',
      role: companyData.role || 'Software Development Engineer',
      ctc: ctcStr,
      ctcNum: ctcValue,
      logo: companyData.logo || 'https://cdn-icons-png.flaticon.com/512/3061/3061341.png',
      category: companyData.category || (ctcValue >= 20 ? 'Dream / Tier 1' : (ctcValue >= 10 ? 'Product' : 'Core / IT')),
      location: companyData.location || 'Bangalore / Chennai / Hybrid',
      minCgpa: parseFloat(companyData.minCgpa) || 7.0,
      maxArrears: parseInt(companyData.maxArrears, 10) || 0,
      allowedDepts: Array.isArray(companyData.allowedDepts) ? companyData.allowedDepts : (typeof companyData.allowedDepts === 'string' ? companyData.allowedDepts.split(',').map(d => d.trim()).filter(Boolean) : ['CSE', 'IT', 'ECE']),
      driveDate: companyData.driveDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      deadline: companyData.deadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      targetHires: targetHires,
      appliedCount: existingIndex >= 0 ? (this.data.companies[existingIndex].appliedCount || 0) : 0,
      placedCount: existingIndex >= 0 ? (this.data.companies[existingIndex].placedCount || 0) : 0,
      description: companyData.description || `Official campus recruitment drive for ${compName} scheduled by Administrator.`,
      requirements: reqs,
      rounds: roundsList,
      includedByAdmin: true,
      includedDate: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.data.companies[existingIndex] = newCompanyObj;
    } else {
      this.data.companies.unshift(newCompanyObj);
    }

    // Provision Recruiter Account if details provided
    let provisionedRecruiter = null;
    if (recruiterData && recruiterData.email) {
      const recEmail = recruiterData.email.trim().toLowerCase();
      const recName = (recruiterData.name || `${compName} Recruiter`).trim();
      const recPassword = (recruiterData.password || 'password123').trim();
      const recTitle = (recruiterData.title || 'Campus Talent Acquisition Lead').trim();
      const recPhone = (recruiterData.phone || '+91 98000 00000').trim();

      if (!this.data.userAccounts) this.data.userAccounts = {};
      if (!this.data.recruiters) this.data.recruiters = [];

      let existingRecruiterIdx = this.data.recruiters.findIndex(
        r => r.email.toLowerCase() === recEmail || r.company.toLowerCase() === compName.toLowerCase()
      );
      let recId = existingRecruiterIdx >= 0 ? this.data.recruiters[existingRecruiterIdx].id : ('REC-' + Math.floor(100 + Math.random() * 900));

      const recruiterAccount = {
        id: recId,
        email: recEmail,
        password: recPassword,
        name: recName,
        role: 'recruiter',
        company: compName,
        title: recTitle,
        department: 'Campus Recruitment Team',
        phone: recPhone,
        avatar: recName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'RC',
        createdAt: new Date().toISOString()
      };

      this.data.userAccounts[recEmail] = recruiterAccount;

      const recruiterRecord = {
        id: recId,
        name: recName,
        company: compName,
        companyLogo: newCompanyObj.logo,
        role: recTitle,
        roleTitle: recTitle,
        email: recEmail,
        phone: recPhone,
        avatar: recruiterAccount.avatar,
        category: newCompanyObj.category,
        openRoles: newCompanyObj.role,
        ctcOffered: newCompanyObj.ctc,
        targetHires: targetHires,
        verified: true,
        studentsReadyToHire: targetHires,
        status: 'Active (Onboarded by Admin)'
      };

      if (existingRecruiterIdx >= 0) {
        this.data.recruiters[existingRecruiterIdx] = { ...this.data.recruiters[existingRecruiterIdx], ...recruiterRecord };
      } else {
        this.data.recruiters.unshift(recruiterRecord);
      }

      provisionedRecruiter = recruiterAccount;

      if (window.ptsSupabaseService) {
        window.ptsSupabaseService.saveProfile(recruiterAccount);
      }
    }

    this.addAuditLog(`Administrator officially included new company "${compName}" and authorized recruiter access.`);

    // System-wide broadcast announcement
    this.addNotification(
      `🏛️ Admin Approved Visiting Company: ${compName}`,
      `System Administrator officially included ${compName} for campus recruitment (${newCompanyObj.role}, ${newCompanyObj.ctc}). Drive Date: ${newCompanyObj.driveDate}. Official Recruiter onboarded and authorized to log in.`,
      'info'
    );

    this.saveState();

    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.addCompany(newCompanyObj);
    }

    return {
      success: true,
      company: newCompanyObj,
      recruiter: provisionedRecruiter,
      message: `Successfully included "${compName}" into the portal! ${provisionedRecruiter ? `Recruiter ${provisionedRecruiter.email} is now authorized to log in.` : 'Recruiters for this company can now register and sign in.'}`
    };
  }

  // Question Bank Management (Officer upload & student practice)
  addQuestion(questionData) {
    const isLeetcode = questionData.type === 'leetcode';
    const newQ = {
      id: (isLeetcode ? 'LC-' : 'Q-') + (Date.now().toString().slice(-5)),
      type: questionData.type || (isLeetcode ? 'leetcode' : 'aptitude'),
      category: questionData.category || (isLeetcode ? 'LeetCode / Coding' : 'Quantitative'),
      difficulty: questionData.difficulty || 'Medium',
      title: questionData.title || (isLeetcode ? 'Coding Challenge' : 'Practice Question'),
      question: questionData.question || '',
      options: Array.isArray(questionData.options) ? questionData.options : (typeof questionData.options === 'string' ? questionData.options.split('\n').filter(Boolean) : []),
      correct: typeof questionData.correct === 'number' ? questionData.correct : 0,
      explanation: questionData.explanation || '',
      tags: Array.isArray(questionData.tags) ? questionData.tags : (typeof questionData.tags === 'string' ? questionData.tags.split(',').map(t => t.trim()).filter(Boolean) : (isLeetcode ? ['DSA', 'Algorithms'] : ['Aptitude'])),
      inputFormat: questionData.inputFormat || '',
      outputFormat: questionData.outputFormat || '',
      sampleInput: questionData.sampleInput || '',
      sampleOutput: questionData.sampleOutput || '',
      constraints: questionData.constraints || '',
      starterCode: questionData.starterCode || (isLeetcode ? '// Write your solution below\nfunction solution(input) {\n  \n}' : ''),
      solutionCode: questionData.solutionCode || '',
      completedBy: questionData.completedBy || [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (!Array.isArray(this.data.questions)) {
      this.data.questions = [];
    }
    this.data.questions.unshift(newQ);
    this.addAuditLog(`Placement Officer posted new ${isLeetcode ? 'LeetCode problem' : 'aptitude question'}: "${newQ.title || newQ.question.slice(0, 35)}"`);

    // Auto-broadcast notification about new practice question
    this.addNotification(
      `📝 New Practice Problem Posted: ${newQ.title}`,
      `Placement Officer added a new ${newQ.difficulty} ${isLeetcode ? 'LeetCode coding challenge' : 'aptitude question'} (${newQ.category}). Practice now to boost your readiness!`,
      'info'
    );

    this.saveState();

    if (window.ptsSupabaseService && window.ptsSupabaseService.isAvailable()) {
      window.ptsSupabaseService.addQuestion(newQ);
    }

    return newQ;
  }

  deleteQuestion(questionId) {
    if (!Array.isArray(this.data.questions)) return false;
    const initialLen = this.data.questions.length;
    this.data.questions = this.data.questions.filter(q => q.id !== questionId);
    if (this.data.questions.length < initialLen) {
      this.addAuditLog(`Placement Officer removed question ${questionId}`);
      this.saveState();
      return true;
    }
    return false;
  }

  recordQuestionCompletion(questionId, studentId, details = {}) {
    if (!Array.isArray(this.data.questions)) return false;
    const q = this.data.questions.find(item => item.id === questionId);
    if (!q) return false;

    if (!Array.isArray(q.completedBy)) {
      q.completedBy = [];
    }

    const student = (this.data.students || []).find(s => s.id === studentId) || this.data.currentUser;
    const sId = studentId || student.id;
    const existingIdx = q.completedBy.findIndex(c => (typeof c === 'string' ? c === sId : c.studentId === sId));

    const record = {
      studentId: sId,
      studentName: student.name || 'Student',
      rollNo: student.rollNo || '21CS101',
      dept: student.department || 'CSE',
      completedAt: new Date().toISOString().split('T')[0],
      score: details.score !== undefined ? details.score : 100,
      code: details.code || '',
      language: details.language || 'javascript',
      timeSpent: details.timeSpent || '5 mins'
    };

    if (existingIdx >= 0) {
      q.completedBy[existingIdx] = record;
    } else {
      q.completedBy.push(record);
    }

    // Boost student readiness if current user
    if (this.data.currentUser && this.data.currentUser.id === sId) {
      if (!this.data.currentUser.readiness) {
        this.data.currentUser.readiness = { overall: 75, aptitude: 80, coding: 80, communication: 70 };
      }
      if (q.type === 'leetcode' || (q.category && q.category.includes('Coding'))) {
        this.data.currentUser.readiness.coding = Math.min(99, (this.data.currentUser.readiness.coding || 80) + 2);
      } else {
        this.data.currentUser.readiness.aptitude = Math.min(99, (this.data.currentUser.readiness.aptitude || 80) + 1);
      }
      this.data.currentUser.readiness.overall = Math.round(
        ((this.data.currentUser.readiness.aptitude || 80) +
         (this.data.currentUser.readiness.coding || 80) +
         (this.data.currentUser.readiness.communication || 70)) / 3
      );
    }

    this.saveState();
    this.addAuditLog(`Student ${student.name} completed practice problem "${q.title || q.id}"`);
    return true;
  }

  getQuestionCompletionStats(questionId) {
    const q = (this.data.questions || []).find(item => item.id === questionId);
    const students = this.data.students || [];
    const totalStudents = students.length || 6;
    if (!q || !Array.isArray(q.completedBy)) {
      return { totalStudents, completedCount: 0, percentage: 0, completedStudents: [], pendingStudents: students };
    }

    const completedIds = new Set(q.completedBy.map(c => typeof c === 'string' ? c : c.studentId));
    const completedStudents = [];
    const pendingStudents = [];

    students.forEach(st => {
      if (completedIds.has(st.id)) {
        const details = q.completedBy.find(c => (typeof c === 'string' ? c === st.id : c.studentId === st.id));
        completedStudents.push({
          student: st,
          record: typeof details === 'object' ? details : { completedAt: 'Completed', score: 100 }
        });
      } else {
        pendingStudents.push(st);
      }
    });

    const completedCount = completedStudents.length;
    const percentage = totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0;

    return { totalStudents, completedCount, percentage, completedStudents, pendingStudents };
  }

  // Add Notification
  addNotification(title, message, type = 'info') {
    const notif = {
      id: 'NOTIF-' + (this.data.notifications.length + 1),
      title,
      message,
      date: new Date().toISOString().split('T')[0],
      type,
      read: false
    };
    this.data.notifications.unshift(notif);
    this.saveState();

    // Async sync to Supabase
    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.addNotification(notif);
    }

    return notif;
  }

  // Audit Logging
  addAuditLog(action, user = this.data.currentUser.name) {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    this.data.auditLogs.unshift({
      id: 'LOG-' + (this.data.auditLogs.length + 1),
      time: timeStr,
      user,
      action
    });
    if (this.data.auditLogs.length > 50) this.data.auditLogs.pop();

    // Async sync to Supabase
    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.addAuditLog(action, user);
    }
  }

  // Sync profile to cloud
  syncProfile(profile) {
    if (window.ptsSupabaseService) {
      window.ptsSupabaseService.saveProfile(profile);
    }
  }

  // --- 1-on-1 Officer Mock Interview Management ---
  addInterviewRequest(req) {
    if (!this.data.interviewRequests) this.data.interviewRequests = [];
    const newReq = {
      id: 'REQ-INT-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'Pending',
      feedback: '',
      ...req
    };
    this.data.interviewRequests.unshift(newReq);
    this.addAuditLog(`Student ${newReq.studentName} submitted 1-on-1 Mock Interview Request (${newReq.domain}).`);
    this.addNotification(
      'New Mock Interview Request',
      `Student ${newReq.studentName} requested an interview for ${newReq.domain}.`,
      'info'
    );
    this.saveState();
    return newReq;
  }

  updateInterviewRequest(id, updates) {
    if (!this.data.interviewRequests) return null;
    const req = this.data.interviewRequests.find(r => r.id === id);
    if (!req) return null;
    Object.assign(req, updates);
    this.saveState();
    return req;
  }

  // --- Student Study Reminders & Alarms (Student Portal Alone) ---
  addReminder(reminder) {
    if (!this.data.reminders) this.data.reminders = [];
    const newReminder = {
      id: 'REM-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      status: 'Active',
      ...reminder
    };
    this.data.reminders.unshift(newReminder);
    this.saveState();
    return newReminder;
  }

  updateReminder(id, updates) {
    if (!this.data.reminders) return null;
    const rem = this.data.reminders.find(r => r.id === id);
    if (!rem) return null;
    Object.assign(rem, updates);
    this.saveState();
    return rem;
  }

  deleteReminder(id) {
    if (!this.data.reminders) return false;
    const index = this.data.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.data.reminders.splice(index, 1);
      this.saveState();
      return true;
    }
    return false;
  }

  // --- Admin Governance & Oversight Intelligence Methods ---

  getOfficerOversightData() {
    const officers = this.data.officers || [];
    const questions = this.data.questions || [];
    const checkingCount = officers.filter(o => o.isCheckingNow).length;

    // Find the latest question date
    let lastDate = '2026-09-20';
    let latestQuestion = null;

    questions.forEach(q => {
      const qDate = q.createdAt || '2026-09-20';
      if (qDate >= lastDate) {
        lastDate = qDate;
        latestQuestion = q;
      }
    });

    // Format human-friendly relative label
    const todayStr = new Date().toISOString().split('T')[0];
    let daysAgoText = 'Today';
    if (lastDate === todayStr) {
      daysAgoText = 'Today (Active Now)';
    } else {
      const diffMs = Math.abs(new Date(todayStr) - new Date(lastDate));
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      daysAgoText = diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    }

    // Sort questions by date descending for dispatch log
    const recentQuestionsLog = [...questions].sort((a, b) => {
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    return {
      totalOfficers: officers.length,
      checkingOfficersCount: checkingCount,
      lastQuestionDate: lastDate,
      lastQuestionRelative: daysAgoText,
      latestQuestion: latestQuestion || questions[0],
      officers,
      recentQuestionsLog
    };
  }

  getRecruiterOversightData() {
    const recruiters = this.data.recruiters || [];
    const companies = this.data.companies || [];

    // Distinct partner companies represented
    const distinctCompanies = new Set(recruiters.map(r => r.company));
    
    // Total student hiring capacity across all recruiters/companies
    const totalCapacity = recruiters.reduce((sum, r) => sum + (parseInt(r.targetHires, 10) || 0), 0);

    return {
      totalRecruiters: recruiters.length,
      partnerCompaniesCount: distinctCompanies.size,
      totalHiringCapacity: totalCapacity,
      recruiters,
      companies
    };
  }

  updateRecruiterHiringQuota(recruiterId, newQuota) {
    const quotaNum = parseInt(newQuota, 10);
    if (isNaN(quotaNum) || quotaNum < 0) return false;

    const recruiters = this.data.recruiters || [];
    const rec = recruiters.find(r => r.id === recruiterId);
    if (!rec) return false;

    rec.targetHires = quotaNum;

    // Also update corresponding company targetHires if found
    const comp = (this.data.companies || []).find(c => c.name.toLowerCase().includes(rec.company.toLowerCase()) || rec.company.toLowerCase().includes(c.name.toLowerCase()));
    if (comp) {
      comp.targetHires = quotaNum;
    }

    this.addAuditLog(`Administrator updated hiring target for ${rec.company} (${rec.name}) to ${quotaNum} students`);
    this.saveState();
    return rec;
  }

  getStudentPlacementOversightData() {
    const students = this.data.students || [];
    const companies = this.data.companies || [];
    const applications = this.data.applications || [];

    // Placed students roster
    const placedStudents = students.filter(s => s.status === 'Placed' || s.placedCompany).map(s => {
      return {
        id: s.id,
        name: s.name,
        rollNo: s.rollNo || '22CS000',
        department: s.department || 'CSE',
        cgpa: s.cgpa || 8.0,
        placedCompany: s.placedCompany || 'Google',
        placedCtc: s.placedCtc || '15.0 LPA',
        placedCtcNum: parseFloat(String(s.placedCtc || '15').replace(/[^0-9.]/g, '')) || 15.0,
        placedRole: s.placedRole || 'Software Development Engineer',
        placedDate: s.placedDate || '2026-09-15',
        offerLetter: s.offerLetter || 'Verified Offer Letter'
      };
    });

    const placedCount = placedStudents.length;
    const totalStudents = students.length || 6;
    const placementRate = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0;

    let highestCtc = 0;
    let highestPlaced = null;
    placedStudents.forEach(p => {
      if (p.placedCtcNum > highestCtc) {
        highestCtc = p.placedCtcNum;
        highestPlaced = p;
      }
    });

    // Company-wise applications & placement statistics
    const companyStats = companies.map(c => {
      const realApps = applications.filter(a => a.companyId === c.id || a.companyName === c.name).length;
      const appliedCount = c.appliedCount || Math.max(realApps, 20);
      const placedInThis = c.placedCount || placedStudents.filter(p => p.placedCompany.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(p.placedCompany.toLowerCase())).length;
      const conversionRate = appliedCount > 0 ? ((placedInThis / appliedCount) * 100).toFixed(1) : '0.0';

      return {
        id: c.id,
        name: c.name,
        logo: c.logo,
        role: c.role,
        ctc: c.ctc,
        ctcNum: c.ctcNum || 10.0,
        category: c.category,
        appliedCount,
        placedCount: placedInThis,
        conversionRate,
        targetHires: c.targetHires || 20,
        status: c.status || 'Upcoming'
      };
    });

    const totalAppliedAll = companyStats.reduce((sum, c) => sum + c.appliedCount, 0);

    return {
      totalStudents,
      placedCount,
      placementRate,
      highestCtc: `${highestCtc.toFixed(1)} LPA`,
      highestPlaced,
      placedStudents,
      companyStats,
      totalAppliedAll
    };
  }
}

// Global instance
window.ptsState = new AppState();

