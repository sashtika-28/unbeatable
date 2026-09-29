/**
 * Placement Preparation and Tracking System
 * SRS & UML Architecture Diagrams Showcase Engine
 */

window.DiagramsModule = {
  currentDiagramIndex: 0,

  diagramsList: [
    {
      id: 'diag-1',
      number: 1,
      title: 'System Architecture Diagram',
      category: 'Architecture',
      type: 'Architecture Block Diagram',
      description: 'High-level multi-tier architecture demonstrating the separation of User Presentation Layer, Application Server, AI Microservices (Resume Analyzer, Interview Bot), and Persistence Layer (MySQL DB & File Store).',
      actors: ['Students', 'Placement Officer', 'Recruiter', 'Administrator'],
      components: ['Web Client (SPA)', 'Flask/Node REST API Gateway', 'AI Evaluation Engines', 'MySQL Relational Database', 'Encrypted Document File Storage'],
      mermaid: `
graph TB
    subgraph Users ["User Presentation Layer"]
        U1["👤 Student"]
        U2["👤 Placement Officer"]
        U3["👤 Recruiter"]
        U4["👤 Administrator"]
    end

    subgraph Frontend ["Frontend Web Layer"]
        SPA["Placement Web Application<br/>(SPA Dashboard & Modals)"]
    end

    subgraph Backend ["Application Server Layer"]
        API["REST API Services<br/>Authentication & Controller"]
    end

    subgraph Services ["AI & Core Microservices"]
        AI1["AI Resume Analyzer (ATS)"]
        AI2["AI Mock Interview Engine"]
        ELIG["Dynamic Eligibility Checker"]
        TEST["Assessment Evaluator"]
    end

    subgraph DataTier ["Persistence & Database Tier"]
        DB[("MySQL Database<br/>Students, Drives, Applications")]
        STORE[("Secure Document Storage<br/>Resumes & Transcripts")]
    end

    U1 --> SPA
    U2 --> SPA
    U3 --> SPA
    U4 --> SPA

    SPA <-->|"HTTPS / JSON REST"| API
    API <--> AI1
    API <--> AI2
    API <--> ELIG
    API <--> TEST

    API <-->|"SQL Queries / Connection Pool"| DB
    API <-->|"Blob Storage"| STORE
      `,
      plantUML: `@startuml
title Placement Preparation and Tracking System - System Architecture
node "Client Tier" {
  [Browser / Student & Officer UI] as UI
}
node "Application Server Tier" {
  [REST API Gateway] as API
  [Eligibility Rule Engine] as ELIG
  [Aptitude Test Engine] as TEST
}
node "AI Services Tier" {
  [AI Resume ATS Parser] as ATS
  [AI Interview Simulator] as BOT
}
database "Data Storage Tier" {
  [MySQL Database] as DB
  [File Storage (Resumes)] as FILES
}
UI --> API : HTTPS / REST
API --> ELIG
API --> TEST
API --> ATS
API --> BOT
API --> DB : JDBC / SQL
API --> FILES
@enduml`
    },

    {
      id: 'diag-2',
      number: 2,
      title: 'Context Diagram (Level 0 DFD)',
      category: 'Data Flow',
      type: 'Level 0 Data Flow Diagram',
      description: 'Shows the entire Placement Preparation and Tracking System as a single central process with all external interacting entities and their primary data flows.',
      actors: ['Student', 'Placement Officer', 'Recruiter', 'Administrator'],
      components: ['Placement Preparation & Tracking System (Central Process 0.0)'],
      mermaid: `
graph LR
    STU["👤 Student"]
    PO["👤 Placement Officer"]
    REC["👤 Recruiter"]
    ADM["👤 Administrator"]
    
    SYS(("(0.0)<br/><b>Placement Preparation<br/>& Tracking System</b>"))

    STU -->|"Academic details, Resume,<br/>Drive applications, Test responses"| SYS
    SYS -->|"Eligibility status, Test scores,<br/>Placement notifications, Interview schedule"| STU

    PO -->|"Drive details, Criteria,<br/>Eligible student queries"| SYS
    SYS -->|"Placement reports, Analytics,<br/>Applicant directories"| PO

    REC -->|"Job requirements, Interview feedback,<br/>Shortlisted candidate status"| SYS
    SYS -->|"Candidate profiles, Resumes,<br/>Aptitude & Readiness scores"| REC

    ADM -->|"User permissions, System configs,<br/>Backup triggers"| SYS
    SYS -->|"Audit logs, System statistics,<br/>Health diagnostics"| ADM
      `,
      plantUML: `@startuml
title Context Diagram (Level 0 DFD)
rectangle "Student" as S
rectangle "Placement Officer" as PO
rectangle "Recruiter" as R
rectangle "Administrator" as A
circle "0.0\\nPlacement Preparation\\n& Tracking System" as SYS

S --> SYS : Academic Details, Applications, Test Answers
SYS --> S : Test Results, Eligibility, Notifications

PO --> SYS : Drive Schedules, Eligibility Criteria
SYS --> PO : Placement Analytics, Reports

R --> SYS : Job Postings, Status Updates
SYS --> R : Filtered Candidate Resumes, Scores

A --> SYS : Configuration, User Management
SYS --> A : Audit Logs, System Health
@enduml`
    },

    {
      id: 'diag-3',
      number: 3,
      title: 'Level 1 Data Flow Diagram (DFD)',
      category: 'Data Flow',
      type: 'Level 1 DFD',
      description: 'Decomposes the system into its 5 primary subprocesses: Authentication, Profile Management, Eligibility & Drive Applications, Aptitude Testing, and AI Readiness & Interview Assessment.',
      actors: ['Student', 'Placement Officer', 'Recruiter'],
      components: ['1.0 Authentication', '2.0 Profile & Eligibility', '3.0 Mock Assessment', '4.0 Drive Coordination', '5.0 AI Interview & ATS'],
      mermaid: `
graph TD
    S["👤 Student"]
    PO["👤 Placement Officer"]
    
    P1["1.0 User Authentication"]
    P2["2.0 Profile & Eligibility Verification"]
    P3["3.0 Aptitude & Mock Test Evaluation"]
    P4["4.0 Drive Scheduling & Application"]
    P5["5.0 AI Resume ATS & Interview"]

    D_USERS[("D1: User Accounts")]
    D_STU[("D2: Student Profiles")]
    D_DRIVES[("D3: Placement Drives")]
    D_APPS[("D4: Applications")]
    D_TESTS[("D5: Tests & Scores")]

    S -->|"Credentials"| P1
    P1 <--> D_USERS
    P1 -->|"Session Token"| S

    S -->|"CGPA, Arrears, Skills"| P2
    P2 <--> D_STU
    P2 <--> D_DRIVES
    P2 -->|"Eligible Companies"| S

    S -->|"Submit Answers"| P3
    P3 <--> D_TESTS
    P3 -->|"Instant Score & Explanations"| S

    PO -->|"Schedule Drive, Cutoffs"| P4
    P4 <--> D_DRIVES
    S -->|"Apply to Drive"| P4
    P4 <--> D_APPS

    S -->|"Resume Text / Answers"| P5
    P5 -->|"ATS Match % & Bot Feedback"| S
      `,
      plantUML: `@startuml
title Level 1 Data Flow Diagram (DFD)
actor Student as S
actor "Placement Officer" as PO

rectangle "1.0 Authentication" as P1
rectangle "2.0 Eligibility Checker" as P2
rectangle "3.0 Mock Test Engine" as P3
rectangle "4.0 Drive Management" as P4
rectangle "5.0 AI Assessment" as P5

database "D1: Students" as D1
database "D2: Companies & Drives" as D2
database "D3: Applications" as D3

S --> P1
P1 --> S
S --> P2
P2 <--> D1
P2 <--> D2
S --> P3
PO --> P4
P4 <--> D2
S --> P4
P4 <--> D3
S --> P5
@enduml`
    },

    {
      id: 'diag-4',
      number: 4,
      title: 'UML Use Case Diagram',
      category: 'UML Behavioral',
      type: 'Use Case Diagram with <<include>>',
      description: 'Formal UML Use Case specification representing the 4 actors with primary functional requirements and <<include>> stereotype dependencies.',
      actors: ['Student', 'Placement Officer', 'Recruiter', 'Administrator'],
      components: ['Register / Login', 'Manage Profile', 'Check Eligibility', 'Practice Mock Tests', 'AI Resume Analysis', 'Schedule Drive', 'Post Job'],
      mermaid: `
graph LR
    subgraph System ["Placement Preparation and Tracking System"]
        UC1["Register / Login"]
        UC2["Manage Academic Profile"]
        UC3["Apply for Placement Drive"]
        UC4["Practice Mock Tests"]
        UC5["Track Application Status"]
        UC6["AI Resume & Interview Prep"]
        
        UC7["Schedule Placement Drive"]
        UC8["Manage Student Records"]
        UC9["Generate Placement Reports"]
        
        UC10["Post Job Openings"]
        UC11["Search & Shortlist Candidates"]
        
        UC12["Manage System Users"]
        UC13["Backup Database State"]

        INC1["<<include>> Verify Credentials"]
        INC2["<<include>> Check Eligibility Criteria"]
        INC3["<<include>> Evaluate Answers & Score"]
    end

    Student["👤 Student"] --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6

    UC1 -.->|"<<include>>"| INC1
    UC3 -.->|"<<include>>"| INC2
    UC4 -.->|"<<include>>"| INC3

    PO["👤 Placement Officer"] --> UC7
    PO --> UC8
    PO --> UC9
    UC7 -.->|"<<include>>"| INC2

    Recruiter["👤 Recruiter"] --> UC10
    Recruiter --> UC11

    Admin["👤 Administrator"] --> UC12
    Admin --> UC13
      `,
      plantUML: `@startuml
left to right direction
skinparam packageStyle rectangle

actor Student
actor "Placement Officer" as PO
actor Recruiter
actor Administrator as Admin

rectangle "Placement Preparation and Tracking System" {
  usecase "Register / Login" as UC1
  usecase "Manage Academic Profile" as UC2
  usecase "Apply for Placement Drive" as UC3
  usecase "Practice Mock Tests" as UC4
  usecase "Track Application Status" as UC5
  usecase "AI Resume & Interview Prep" as UC6
  
  usecase "Verify Credentials" as INC1
  usecase "Check Eligibility" as INC2
  usecase "Evaluate Test Score" as INC3
  
  usecase "Schedule Placement Drive" as UC7
  usecase "Manage Students" as UC8
  usecase "Generate Reports" as UC9
  
  usecase "Post Job Openings" as UC10
  usecase "Shortlist Candidates" as UC11
  
  usecase "Manage Users" as UC12
  usecase "Backup Database" as UC13
}

Student --> UC1
Student --> UC2
Student --> UC3
Student --> UC4
Student --> UC5
Student --> UC6

UC1 ..> INC1 : <<include>>
UC3 ..> INC2 : <<include>>
UC4 ..> INC3 : <<include>>

PO --> UC7
PO --> UC8
PO --> UC9
UC7 ..> INC2 : <<include>>

Recruiter --> UC10
Recruiter --> UC11

Admin --> UC12
Admin --> UC13
@enduml`
    },

    {
      id: 'diag-5',
      number: 5,
      title: 'UML Class Diagram',
      category: 'UML Structural',
      type: 'Class Diagram with Inheritance',
      description: 'Object-oriented structural blueprint showing class hierarchies (Person generalization), attributes, methods, and relationships.',
      actors: ['Person', 'Student', 'PlacementOfficer', 'Recruiter', 'Company', 'Application', 'MockTest', 'ResumeAI'],
      components: ['Object-Oriented Design Models'],
      mermaid: `
classDiagram
    class Person {
        -String id
        -String name
        -String email
        -String phone
        -String department
        +login()
        +logout()
        +updateContact()
    }

    class Student {
        -double cgpa
        -int arrears
        -List~String~ skills
        -int readinessScore
        +checkEligibility(Company)
        +applyDrive(Company)
        +attendMockTest(Test)
        +uploadResume()
    }

    class PlacementOfficer {
        -String employeeId
        -String officeContact
        +scheduleDrive(Company, Date)
        +setEligibilityCriteria(Company)
        +generateReports()
        +broadcastNotice(String)
    }

    class Recruiter {
        -String companyName
        -String designation
        +postJobOpening()
        +searchTalent(skills, cgpa)
        +shortlistCandidate(Application)
        +updateStatus(Application, Status)
    }

    class Company {
        -String companyId
        -String name
        -double minCgpa
        -int maxArrears
        -double ctc
        -Date driveDate
        +isStudentEligible(Student)
    }

    class Application {
        -String applicationId
        -String status
        -String currentRound
        -Date appliedDate
        +advanceRound()
        +markSelected()
    }

    class MockTest {
        -String testId
        -String category
        -int totalMarks
        +startTimer()
        +evaluateSubmission()
    }

    Person <|-- Student
    Person <|-- PlacementOfficer
    Person <|-- Recruiter
    Student "1" --> "*" Application : submits
    Company "1" --> "*" Application : receives
    Student "1" --> "*" MockTest : attempts
      `,
      plantUML: `@startuml
class Person {
  - String name
  - String email
  - String phone
  + login()
  + logout()
}

class Student {
  - double cgpa
  - int arrears
  - List<String> skills
  + checkEligibility(company)
  + applyDrive()
  + takeTest()
}

class PlacementOfficer {
  - String employeeId
  + scheduleDrive()
  + generateReports()
  + broadcastNotice()
}

class Recruiter {
  - String companyName
  + postJob()
  + searchCandidates()
  + updateStatus()
}

class Company {
  - String name
  - double minCgpa
  - double ctc
  - List<String> allowedDepts
}

class Application {
  - String applicationId
  - String status
  - String currentRound
}

Person <|-- Student
Person <|-- PlacementOfficer
Person <|-- Recruiter
Student "1" -- "*" Application
Company "1" -- "*" Application
@enduml`
    },

    {
      id: 'diag-6',
      number: 6,
      title: 'Entity Relationship (ER) Diagram',
      category: 'Data Design',
      type: 'Entity Relationship Diagram',
      description: 'Database schema showing entities, primary keys (PK), foreign keys (FK), and cardinalities (1:M, M:N) for the MySQL relational store.',
      actors: ['Database Entities'],
      components: ['STUDENTS', 'COMPANIES', 'APPLICATIONS', 'MOCK_TESTS', 'INTERVIEWS', 'USERS'],
      mermaid: `
erDiagram
    STUDENTS ||--o{ APPLICATIONS : "submits"
    COMPANIES ||--o{ APPLICATIONS : "receives"
    STUDENTS ||--o{ MOCK_TESTS : "attempts"
    STUDENTS ||--o{ INTERVIEWS : "undergoes"

    STUDENTS {
        string student_id PK
        string roll_no
        string name
        float cgpa
        int arrears
        string department
        string skills
        int readiness_score
    }

    COMPANIES {
        string company_id PK
        string name
        string role
        float ctc
        float min_cgpa
        int max_arrears
        date drive_date
        date deadline
    }

    APPLICATIONS {
        string application_id PK
        string student_id FK
        string company_id FK
        string status
        string current_round
        date applied_date
    }

    MOCK_TESTS {
        string test_id PK
        string student_id FK
        string category
        int score_percentage
        date test_date
    }

    INTERVIEWS {
        string interview_id PK
        string student_id FK
        string interview_type
        int feedback_score
        string remarks
    }
      `,
      plantUML: `@startuml
entity "STUDENTS" as S {
  * student_id : VARCHAR(20) [PK]
  --
  roll_no : VARCHAR(20)
  name : VARCHAR(100)
  cgpa : DECIMAL(3,2)
  arrears : INT
  department : VARCHAR(50)
  readiness : INT
}

entity "COMPANIES" as C {
  * company_id : VARCHAR(20) [PK]
  --
  name : VARCHAR(100)
  role : VARCHAR(100)
  ctc : DECIMAL(4,2)
  min_cgpa : DECIMAL(3,2)
  drive_date : DATE
}

entity "APPLICATIONS" as A {
  * application_id : VARCHAR(20) [PK]
  --
  student_id : VARCHAR(20) [FK]
  company_id : VARCHAR(20) [FK]
  status : VARCHAR(50)
  current_round : VARCHAR(100)
}

S ||--o{ A
C ||--o{ A
@enduml`
    },

    {
      id: 'diag-7',
      number: 7,
      title: 'Sequence Diagram: Student Eligibility & Application',
      category: 'UML Behavioral',
      type: 'Sequence Diagram',
      description: 'Chronological message flow for a student checking drive eligibility and submitting an application with automated server-side verification.',
      actors: ['Student', 'UI (Frontend)', 'Eligibility Engine', 'Database', 'Notification Service'],
      components: ['Asynchronous Event Sequence'],
      mermaid: `
sequenceDiagram
    autonumber
    actor S as Student
    participant UI as Browser UI
    participant EE as Eligibility Engine
    participant DB as MySQL DB
    participant NS as Notification Service

    S->>UI: Select Company Drive (e.g. Google)
    UI->>EE: CheckEligibility(studentId, companyId)
    EE->>DB: Fetch Student Profile (CGPA, Arrears, Dept)
    DB-->>EE: Return Profile Data (CGPA: 8.45, Arrears: 0)
    EE->>DB: Fetch Company Criteria (Min CGPA: 8.5, Arrears: 0)
    DB-->>EE: Return Drive Criteria
    
    alt Criteria Met
        EE-->>UI: Eligibility Confirmed (Status: Eligible)
        UI-->>S: Enable "Apply Now" Button
        S->>UI: Click "Apply Now"
        UI->>DB: Create Application Record (Status: Applied)
        DB-->>UI: Application Stored (APP-ID)
        UI->>NS: Trigger Application Confirmation Alert
        NS-->>S: "Application successfully submitted!"
    else Criteria Not Met
        EE-->>UI: Return Ineligibility Reason ("CGPA 8.45 < 8.50")
        UI-->>S: Display Ineligible Badge & Detailed Reason
    end
      `,
      plantUML: `@startuml
autonumber
actor Student as S
participant "Frontend UI" as UI
participant "Eligibility Engine" as EE
database "MySQL Database" as DB
participant "Notification Service" as NS

S -> UI : Select Company Drive
UI -> EE : CheckEligibility(studentId, companyId)
EE -> DB : Query Student Profile & Company Criteria
DB --> EE : Return Records
alt Eligible
  EE --> UI : Result: Eligible
  UI --> S : Display "Apply Now"
  S -> UI : Click Apply
  UI -> DB : Save Application(Status='Applied')
  DB --> UI : Success
  UI -> NS : Notify Student
  NS --> S : Alert Confirmation
else Not Eligible
  EE --> UI : Result: Ineligible (Reasons)
  UI --> S : Display Reason (CGPA / Arrears)
end
@enduml`
    },

    {
      id: 'diag-8',
      number: 8,
      title: 'Sequence Diagram: Schedule Placement Drive',
      category: 'UML Behavioral',
      type: 'Sequence Diagram',
      description: 'Interaction sequence showing the Placement Officer scheduling a new campus placement drive, persisting rules, and broadcasting notices to students.',
      actors: ['Placement Officer', 'Dashboard UI', 'Placement Controller', 'Database', 'Notification Service'],
      components: ['Drive Scheduling Pipeline'],
      mermaid: `
sequenceDiagram
    autonumber
    actor PO as Placement Officer
    participant UI as Officer Dashboard
    participant PMS as Placement Controller
    participant DB as MySQL DB
    participant NOTIF as Notification Service

    PO->>UI: Open "Schedule New Drive" Modal
    PO->>UI: Enter Company, Role, Package, Min CGPA, Dates
    PO->>UI: Click "Schedule Drive"
    UI->>PMS: POST /api/drives/create(driveData)
    PMS->>PMS: Validate Form & Dates
    PMS->>DB: INSERT INTO Companies & Drives
    DB-->>PMS: Drive Registered (COMP-ID)
    PMS->>NOTIF: BroadcastAnnouncement("New Drive Announced")
    NOTIF->>DB: Store Notification
    NOTIF-->>UI: Push Real-time Alert
    PMS-->>UI: Return Success Response
    UI-->>PO: "Drive scheduled and published successfully!"
      `,
      plantUML: `@startuml
autonumber
actor "Placement Officer" as PO
participant "Officer UI" as UI
participant "Placement System" as PMS
database "Database" as DB
participant "Notification Service" as NS

PO -> UI : Enter Drive Details (Company, CTC, CGPA)
PO -> UI : Submit Schedule Form
UI -> PMS : CreateDrive(driveData)
PMS -> DB : Insert Company & Drive Record
DB --> PMS : Confirm Storage
PMS -> NS : BroadcastNewDriveAlert()
NS -> DB : Save Notification
PMS --> UI : Success Response
UI --> PO : Display Success Toast
@enduml`
    },

    {
      id: 'diag-9',
      number: 9,
      title: 'Activity Diagram: Student Placement Journey',
      category: 'UML Behavioral',
      type: 'Activity Diagram with Decision Nodes',
      description: 'End-to-end activity workflow of a student logging into the portal, assessing mock readiness, evaluating company cutoffs, and proceeding through rounds.',
      actors: ['Student Process Flow'],
      components: ['Start, Actions, Decision Diamonds, Fork/Join, End'],
      mermaid: `
stateDiagram-v2
    [*] --> Login
    Login --> Dashboard : Authentication Successful
    
    state fork_state <<fork>>
    Dashboard --> fork_state
    
    fork_state --> MockTest : Practice Aptitude
    fork_state --> ResumeAI : Analyze ATS Resume
    fork_state --> CheckEligibility : Browse Drives
    
    MockTest --> ReadinessScore : Score Calculated
    ResumeAI --> ReadinessScore : ATS % Updated
    
    state join_state <<join>>
    ReadinessScore --> join_state
    
    CheckEligibility --> IsEligible : Check CGPA & Arrears
    
    state IsEligible <<choice>>
    IsEligible --> ApplyDrive : Eligible [Yes]
    IsEligible --> ViewReason : Not Eligible [No]
    
    ViewReason --> Dashboard : Return to Prep
    ApplyDrive --> TrackStatus : Application Submitted
    
    TrackStatus --> SelectionRound : Review & Shortlist
    
    state SelectionRound <<choice>>
    SelectionRound --> OfferExtended : Selected [Yes]
    SelectionRound --> RetainInPool : Not Selected [No]
    
    OfferExtended --> [*] : Placed!
    RetainInPool --> Dashboard : Try Next Drive
      `,
      plantUML: `@startuml
start
:Student Logs In;
:Access Dashboard;
fork
  :Practice Aptitude & Mock Test;
  :Instant Scoring & Explanations;
fork again
  :Upload & Analyze ATS Resume;
  :Get Keyword Suggestions;
fork again
  :Check Company Eligibility;
end fork
:Calculate Placement Readiness Score;
if (Meets Company Criteria?) then (yes)
  :Submit Job Application;
  :Track Selection Pipeline;
  if (Cleared All Rounds?) then (yes)
    :Receive Placement Offer;
    stop
  else (no)
    :Prepare for Next Drive;
  endif
else (no)
  :Display Cut-off Disqualification Reason;
endif
stop
@enduml`
    },

    {
      id: 'diag-10',
      number: 10,
      title: 'Activity Diagram: Recruiter Hiring Workflow',
      category: 'UML Behavioral',
      type: 'Activity Diagram (Swimlanes)',
      description: 'Three-swimlane activity diagram showing the collaborative actions between the Company Recruiter, Placement Portal, and Candidate.',
      actors: ['Recruiter', 'Placement System', 'Candidate'],
      components: ['Swimlane Activity Model'],
      mermaid: `
sequenceDiagram
    autonumber
    Note over Recruiter,Candidate: Swimlane 1: Recruiter | Swimlane 2: System | Swimlane 3: Candidate
    Recruiter->>Placement System: Post Job Requirements & CTC
    Placement System->>Placement System: Index Job & Compute Eligibility
    Placement System-->>Candidate: Display Job on Campus Feed
    Candidate->>Placement System: Submit Application & Resume
    Placement System->>Placement System: Run Automated ATS & Test Scoring
    Placement System-->>Recruiter: Present Ranked Candidate Pool
    Recruiter->>Placement System: Shortlist Candidate for Tech Round
    Placement System-->>Candidate: Notify Interview Schedule
    Candidate->>Recruiter: Attend Technical & HR Rounds
    Recruiter->>Placement System: Update Final Status: Selected
    Placement System-->>Candidate: Release Offer Letter & Congratulations!
      `,
      plantUML: `@startuml
|Recruiter|
start
:Post Job Role & Criteria;
|Placement System|
:Publish Campus Drive;
:Notify Eligible Students;
|Candidate|
:Review Drive Details;
:Apply for Position;
|Placement System|
:Compute ATS Score & Test Rank;
|Recruiter|
:Review Filtered Talent Pool;
:Shortlist for Interview;
|Placement System|
:Send Interview Call;
|Candidate|
:Attend Technical & HR Round;
|Recruiter|
:Evaluate Interview Performance;
if (Hiring Decision?) then (Selected)
  :Issue Placement Offer;
  |Placement System|
  :Update Student Status to 'Placed';
else (Rejected)
  :Update Application to 'Rejected';
endif
|Candidate|
:View Status on Dashboard;
stop
@enduml`
    },

    {
      id: 'diag-11',
      number: 11,
      title: 'UML State Chart Diagram',
      category: 'UML Behavioral',
      type: 'State Machine Diagram',
      description: 'Models the discrete lifecycle states of an application from submission through screening, assessments, and final placement offer.',
      actors: ['Application Lifecycle'],
      components: ['States, Transitions, Guards, Final States'],
      mermaid: `
stateDiagram-v2
    [*] --> Draft : Student views drive
    Draft --> Applied : Click 'Apply' [Eligible]
    
    Applied --> Screening : Officer review
    Screening --> Aptitude_Pending : Profile verified
    Screening --> Rejected : Ineligible criteria
    
    Aptitude_Pending --> Aptitude_Cleared : Score >= Cutoff
    Aptitude_Pending --> Rejected : Score < Cutoff
    
    Aptitude_Cleared --> Technical_Round : Shortlisted by Recruiter
    Technical_Round --> HR_Round : Tech Interview Passed
    Technical_Round --> Rejected : Tech Interview Failed
    
    HR_Round --> Selected : Offer Extended
    HR_Round --> Rejected : Culture mismatch
    
    Selected --> [*] : Placed
    Rejected --> [*] : Closed
      `,
      plantUML: `@startuml
[*] --> Applied : Submit Application
Applied --> Screening : Verification
Screening --> Aptitude_Pending : Approved
Screening --> Rejected : Rejected

Aptitude_Pending --> Aptitude_Cleared : Passed Test
Aptitude_Pending --> Rejected : Failed

Aptitude_Cleared --> Technical_Round : Shortlisted
Technical_Round --> HR_Round : Cleared
Technical_Round --> Rejected : Failed

HR_Round --> Selected : Offer Letter
HR_Round --> Rejected : Failed

Selected --> [*]
Rejected --> [*]
@enduml`
    },

    {
      id: 'diag-12',
      number: 12,
      title: 'System Deployment Diagram',
      category: 'UML Physical',
      type: 'UML Deployment Diagram',
      description: 'Physical hardware and cloud topology showing client nodes, load balancers, containerized application servers, database instances, and external AI endpoints.',
      actors: ['Hardware / Infrastructure Nodes'],
      components: ['User Devices, CDN, Web Server, App Server, MySQL Database, AI APIs'],
      mermaid: `
graph TB
    subgraph ClientNode ["Client Node (PC / Mobile / Tablet)"]
        Browser["Modern Web Browser<br/>(Chrome, Edge, Safari)<br/>HTML5, CSS3, JS"]
    end

    subgraph CDNNode ["Cloud Edge / Hosting (Vercel / Cloudflare)"]
        StaticAssets["Static Frontend Bundle<br/>SPA Assets, CSS, Mermaid.js"]
    end

    subgraph AppServerNode ["Application Server (Render / AWS EC2)"]
        Server["REST API Server<br/>Node.js / Python Flask<br/>Port 443 (HTTPS)"]
    end

    subgraph DatabaseNode ["Database Server (Managed MySQL / RDS)"]
        DBInstance[("MySQL 8.0 Instance<br/>Port 3306<br/>Encrypted Storage")]
    end

    subgraph ExternalAIServices ["External AI Provider Tier"]
        AI_API["Gemini / OpenAI API<br/>ATS Parser & NLP Scoring"]
    end

    Browser <-->|"HTTPS"| CDNNode
    CDNNode <-->|"REST API Requests"| Server
    Server <-->|"TLS Secured SQL"| DBInstance
    Server <-->|"Secure HTTPS API Calls"| AI_API
      `,
      plantUML: `@startuml
node "Client Workstation" {
  [Web Browser] as BROWSER
}

node "Cloud Edge Hosting" {
  [SPA Static Content] as WEB
}

node "Application Server Container" {
  [REST API Engine] as APP
}

database "Database Server" {
  [MySQL Database] as DB
}

cloud "AI Cloud Services" {
  [Gemini / AI NLP API] as AI
}

BROWSER -- WEB : HTTPS
BROWSER -- APP : REST / JSON
APP -- DB : TCP / SQL
APP -- AI : HTTPS API
@enduml`
    },

    {
      id: 'diag-13',
      number: 13,
      title: 'System End-to-End Flowchart',
      category: 'Logic Flow',
      type: 'Program Flowchart',
      description: 'Algorithmic logic flowchart guiding a student through login authentication, service selection, eligibility verification, test submission, and interview tracking.',
      actors: ['System Logic'],
      components: ['Terminator, Process, Decision, Input/Output'],
      mermaid: `
flowchart TD
    Start([Start]) --> Login[/Input Credentials/]
    Login --> ValidUser{Valid User?}
    
    ValidUser -- No --> Error[Display Error] --> Login
    ValidUser -- Yes --> Dashboard[Load Role Dashboard]
    
    Dashboard --> Choice{Select Service}
    
    Choice -->|Practice| Test[Attempt Mock Assessment]
    Test --> EvalTest[Evaluate Score & Feedback] --> UpdateReadiness[Update Readiness Rating] --> Dashboard
    
    Choice -->|Resume AI| Resume[Paste / Upload Resume]
    Resume --> ATS[Compute ATS Score & Keywords] --> Dashboard
    
    Choice -->|Apply Drive| CheckElig{Eligible Criteria?}
    
    CheckElig -- No --> Reason[Show Ineligibility Reason] --> Dashboard
    CheckElig -- Yes --> Apply[Submit Application]
    
    Apply --> Pipeline[Track Pipeline Rounds]
    Pipeline --> IsPlaced{Offer Extended?}
    
    IsPlaced -- Yes --> Placed[Mark Student as Placed] --> End([End])
    IsPlaced -- No --> Dashboard
      `,
      plantUML: `@startuml
start
:User Enters Credentials;
if (Valid Authentication?) then (no)
  :Show Login Error;
  stop
else (yes)
  :Render Dashboard;
  switch (Choose Action)
  case (Practice Aptitude)
    :Complete Timed Test;
    :Auto-grade & Update Readiness;
  case (ATS Resume Analyzer)
    :Extract Keywords & Compute Match;
  case (Apply to Campus Drive)
    if (Meets CGPA & Arrears?) then (yes)
      :Register Application;
      :Track Pipeline;
    else (no)
      :Show Disqualification Reason;
    endif
  endswitch
endif
stop
@enduml`
    },

    {
      id: 'diag-14',
      number: 14,
      title: 'Level 2 DFD (Student Placement Process)',
      category: 'Data Flow',
      type: 'Detailed Level 2 DFD',
      description: 'Micro-level data flow diagram dissecting Subprocess 4.0 (Application & Drive Coordination) into fine-grained atomic operations.',
      actors: ['Student', 'Placement Officer', 'Recruiter'],
      components: ['4.1 Browse Drives', '4.2 Rule Validation', '4.3 Save Application', '4.4 Pipeline Progress'],
      mermaid: `
graph TD
    S["👤 Student"]
    
    P41["4.1 Fetch Active Drives"]
    P42["4.2 Evaluate CGPA & Arrears"]
    P43["4.3 Register Application"]
    P44["4.4 Advance Selection Round"]

    D_DRIVES[("D3: Drives Database")]
    D_STU[("D2: Student Profile Store")]
    D_APPS[("D4: Applications Store")]

    S -->|"Requests Drive Catalog"| P41
    P41 <--> D_DRIVES
    P41 -->|"Drive List with Cutoffs"| P42

    P42 <--> D_STU
    P42 -->|"Eligible Flag & Explanations"| S

    S -->|"Confirm Application"| P43
    P43 -->|"Create APP Record"| D_APPS
    P43 -->|"Confirmation Alert"| S

    D_APPS <--> P44
    P44 -->|"Round 1 -> Round 2 -> Offer"| S
      `,
      plantUML: `@startuml
title Level 2 DFD: Student Placement Process (Process 4.0)
actor Student as S
actor Recruiter as R

rectangle "4.1 Fetch Drives" as P1
rectangle "4.2 Validate Cutoffs" as P2
rectangle "4.3 Record Application" as P3
rectangle "4.4 Update Stage" as P4

database "Drives" as D1
database "Profiles" as D2
database "Applications" as D3

S --> P1
P1 <--> D1
P1 --> P2
P2 <--> D2
P2 --> S : Eligibility status
S --> P3 : Apply
P3 --> D3
R --> P4 : Progress candidate
P4 <--> D3
P4 --> S : Status update
@enduml`
    },

    {
      id: 'diag-15',
      number: 15,
      title: 'Collaboration / Communication Diagram',
      category: 'UML Behavioral',
      type: 'UML Collaboration Diagram',
      description: 'Numbered interaction diagram emphasizing the structural links and message passing between Student, Web UI, Placement Controller, Database, and Recruiter.',
      actors: ['Student', 'UI', 'Placement Controller', 'Database', 'Recruiter'],
      components: ['Numbered Message Flow (1.0, 2.0, 3.0, 4.0)'],
      mermaid: `
graph LR
    S["1: 👤 Student"]
    UI["2: Web Browser UI"]
    PMS["3: Placement Controller"]
    DB[("4: MySQL Database")]
    REC["5: 👤 Recruiter"]

    S -->|"1.0: Select Drive & Apply"| UI
    UI -->|"2.0: VerifyEligibility()"| PMS
    PMS -->|"3.0: QueryCriteriaAndProfile()"| DB
    DB -->|"3.1: ProfileAndCriteriaData"| PMS
    PMS -->|"4.0: StoreApplicationRecord()"| DB
    PMS -->|"5.0: UpdateCandidateList()"| REC
    PMS -->|"6.0: DisplayApplicationStatus()"| UI
    UI -->|"7.0: ConfirmationMessage"| S
      `,
      plantUML: `@startuml
title Collaboration Diagram - Placement Drive Application
rectangle "1: Student" as S
rectangle "2: Web UI" as UI
rectangle "3: Placement Controller" as PMS
database "4: MySQL Database" as DB
rectangle "5: Recruiter" as R

S -> UI : 1.0: Click Apply
UI -> PMS : 2.0: VerifyEligibility()
PMS -> DB : 3.0: QueryProfileAndCriteria()
DB -> PMS : 3.1: ReturnData
PMS -> DB : 4.0: SaveApplication()
PMS -> R : 5.0: ForwardApplicant()
PMS -> UI : 6.0: ReturnStatus()
UI -> S : 7.0: SuccessNotice()
@enduml`
    }
  ],

  init() {
    this.renderDiagramSidebar();
    this.renderCurrentDiagram();
    this.attachEvents();
  },

  attachEvents() {
    const copyPlantUmlBtn = document.getElementById('copyPlantUmlBtn');
    const copyMermaidBtn = document.getElementById('copyMermaidBtn');
    const toggleBgBtn = document.getElementById('toggleDiagramBgBtn');

    if (copyPlantUmlBtn) {
      copyPlantUmlBtn.addEventListener('click', () => {
        const diag = this.diagramsList[this.currentDiagramIndex];
        navigator.clipboard.writeText(diag.plantUML.trim());
        window.App.showToast('PlantUML code copied to clipboard!', 'success');
      });
    }

    if (copyMermaidBtn) {
      copyMermaidBtn.addEventListener('click', () => {
        const diag = this.diagramsList[this.currentDiagramIndex];
        navigator.clipboard.writeText(diag.mermaid.trim());
        window.App.showToast('Mermaid diagram code copied to clipboard!', 'success');
      });
    }

    if (toggleBgBtn) {
      toggleBgBtn.addEventListener('click', () => {
        const renderArea = document.getElementById('diagramRenderCanvas');
        if (renderArea) {
          renderArea.classList.toggle('light-mode');
          const isLight = renderArea.classList.contains('light-mode');
          toggleBgBtn.innerHTML = isLight 
            ? '<i class="fas fa-moon"></i> Dark Canvas' 
            : '<i class="fas fa-sun"></i> Light Paper Canvas';
          window.App.showToast(`Canvas switched to ${isLight ? 'Academic White Paper' : 'Dark Matrix'} style.`, 'info');
        }
      });
    }
  },

  renderDiagramSidebar() {
    const container = document.getElementById('diagramsSidebarNav');
    if (!container) return;

    container.innerHTML = `
      <div class="diagram-category-heading">Architecture & System DFDs</div>
      ${this.diagramsList.slice(0, 4).map((d, i) => this.renderSidebarItem(d, i)).join('')}

      <div class="diagram-category-heading" style="margin-top:0.6rem;">UML Design Models</div>
      ${this.diagramsList.slice(4, 9).map((d, i) => this.renderSidebarItem(d, i + 4)).join('')}

      <div class="diagram-category-heading" style="margin-top:0.6rem;">Process Workflows & State</div>
      ${this.diagramsList.slice(9).map((d, i) => this.renderSidebarItem(d, i + 9)).join('')}
    `;
  },

  renderSidebarItem(diag, idx) {
    const isActive = idx === this.currentDiagramIndex;
    return `
      <button class="diagram-item-btn ${isActive ? 'active' : ''}" onclick="DiagramsModule.selectDiagram(${idx})">
        <span class="diagram-num-tag">${diag.number}</span>
        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${diag.title}</span>
      </button>
    `;
  },

  selectDiagram(index) {
    this.currentDiagramIndex = index;
    this.renderDiagramSidebar();
    this.renderCurrentDiagram();
  },

  renderCurrentDiagram() {
    const diag = this.diagramsList[this.currentDiagramIndex];
    if (!diag) return;

    // Header info
    document.getElementById('diagramActiveTitle').textContent = `${diag.number}. ${diag.title}`;
    document.getElementById('diagramCategoryBadge').textContent = diag.category;
    document.getElementById('diagramTypeBadge').textContent = diag.type;

    // Academic Spec Details
    document.getElementById('diagramDescriptionText').textContent = diag.description;
    
    const actorsListEl = document.getElementById('diagramActorsList');
    if (actorsListEl) {
      actorsListEl.innerHTML = diag.actors.map(a => `<li>${a}</li>`).join('');
    }

    const compListEl = document.getElementById('diagramComponentsList');
    if (compListEl) {
      compListEl.innerHTML = diag.components.map(c => `<li>${c}</li>`).join('');
    }

    // Code views
    const plantUmlEl = document.getElementById('plantUmlCodeDisplay');
    const mermaidEl = document.getElementById('mermaidCodeDisplay');
    if (plantUmlEl) plantUmlEl.textContent = diag.plantUML.trim();
    if (mermaidEl) mermaidEl.textContent = diag.mermaid.trim();

    // Render Mermaid Graph into canvas
    const canvas = document.getElementById('diagramRenderCanvas');
    if (!canvas) return;

    canvas.innerHTML = `<div class="mermaid" id="activeMermaidContainer" style="width:100%; text-align:center;">${diag.mermaid.trim()}</div>`;

    // Trigger Mermaid Render if mermaid is loaded
    if (window.mermaid) {
      try {
        window.mermaid.run({
          nodes: [document.getElementById('activeMermaidContainer')]
        });
      } catch (err) {
        console.warn('Mermaid render error, falling back to preformatted text', err);
      }
    }
  }
};
