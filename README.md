# 🏢 HCMS — Hostel Complaint & Facility Management System

<p align="left">
  <img src="https://img.shields.io/badge/Next.js-16.4_Turbopack-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19.3_Concurrent-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4_Design_System-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Prisma-6.19_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/SLA_Engine-2--Hour_Emergency-10B981?style=for-the-badge" alt="SLA Engine" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />
</p>

> **Enterprise SaaS Maintenance & SLA Dispatch Desk for Modern Residential Campuses**  
> Engineered with Next.js 16 (App Router & Turbopack), React 19, Tailwind CSS v4, Prisma ORM, and PostgreSQL.

---

## 🌟 Executive Summary

**HCMS (Hostel Complaint Management System)** is an end-to-end facilities management platform designed to replace chaotic pen-and-paper registers and unmonitored messaging groups across university hostels and student residences. 

HCMS enforces strict **Service Level Agreements (SLAs)**, automated technician triage, photographic work verification, and transparent warden administration across all residential blocks.

```
       [ Resident Student ]                [ Field Technician ]
          (Lodge Request)                   (Accept & Resolve)
                 │                                   ▲
                 ▼                                   │
      ┌────────────────────────────────────────────────────────┐
      │             HCMS Centralized SLA Dispatch Desk         │
      │   • Auto-categorization   • 2-Hr Emergency Dispatch    │
      │   • Priority Scoring      • Before/After Photo Proof   │
      └────────────────────────────────────────────────────────┘
                 │                                   ▲
                 ▼                                   │
       [ Hostel Warden ]                  [ Coordinator Admin ]
       (Supervise & Audit)                (Campus-wide Analytics)
```

---

## 📑 Table of Contents

- [Key Features by Role](#-key-features-by-role)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Database Schema & Domain Models](#-database-schema--domain-models)
- [Quick Demo Accounts](#-quick-demo-accounts)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Environment Variables](#-environment-variables)
- [Security, Auth & Role Boundaries](#-security-auth--role-boundaries)
- [Workflow Lifecycles](#-workflow-lifecycles)
- [License & Contributions](#-license--contributions)

---

## 🚀 Key Features by Role

### 1. 🎓 Resident Student Dashboard (`/student`)
* **Rapid Complaint Lodging**: Report electrical, plumbing, carpentry, or Wi-Fi issues in under 30 seconds with room number and block auto-tagging.
* **Photo & Media Attachments**: Upload photos of broken fixtures directly through Uploadthing integration.
* **Live Ticket Tracking**: Real-time status badges (`LOGGED` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`).
* **SLA Countdown & Turnaround Indicators**: Clear visual indicators of expected resolution deadlines.
* **Resolution Verification & Feedback**: Student star-rating (1–5 stars), satisfaction feedback, and issue persistence flags.
* **Campus Showcase (`/student/showcase`)**: Interactive before-and-after photo comparison slider showing verified maintenance works completed across blocks.

### 2. 🛡️ Hostel Warden Operations (`/warden`) & Coordinator Desk (`/coordinator`)
* **Executive Triage Queue (`/warden` & `/coordinator`)**: Unified queue with segmented filters: *All Open*, *2-Hour Emergencies*, *In Progress*, and *Resolved*.
* **Smart Technician Dispatch**: 1-click worker assignment filtered by trade expertise (*Electrical, Plumbing, Carpentry, Networking*).
* **Hostel Surveillance / Radar (`/warden/surveillance` & `/coordinator/surveillance`)**: Block-by-block issue monitoring and priority alerts across Block A, Block B, Block C, and Block D.
* **Campus SLA Analytics (`/warden/analytics` & `/coordinator/analytics`)**:
  * Real-time resolution rate percentage.
  * Average resident satisfaction star score.
  * Trade and category load distribution.
  * SLA turnaround health and breach warnings.
* **Audited Ticket Detail View (`/warden/tickets/[id]` & `/coordinator/tickets/[id]`)**: Comprehensive timeline of status changes, technician notes, student contact, and audit logs.

### 3. 🔧 Field Technician / Staff Desk (`/worker`)
* **Mobile-Optimized Task Desk**: Tailored for electricians, plumbers, carpenters, and IT staff on mobile devices.
* **1-Click Work Order Acceptance**: Transition tickets from `ASSIGNED` to `IN_PROGRESS` instantly.
* **Resolution Submission Flow**: Technicians submit resolution notes and upload mandatory photographic proof of completed repairs.
* **Performance Dashboard**: Real-time counters for completed jobs, active jobs, and personal customer satisfaction ratings.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.4 (App Router & Turbopack)** | Full-stack React framework with Server Components & Server Actions |
| **Language** | **TypeScript 5 & React 19** | Strict type safety and latest concurrent React primitives |
| **Styling** | **Tailwind CSS v4 & tw-animate-css** | Modern utility-first CSS design system with custom daylight tokens |
| **UI Components** | **shadcn/ui & Lucide React** | Accessible, responsive component primitives and iconography |
| **Database & ORM**| **PostgreSQL & Prisma ORM 6.19** | Relational schema modeling, type-safe queries, connection pooling |
| **File Storage** | **Uploadthing** | Cloud upload handling for repair evidence and resolution proofs |
| **Data Viz** | **Recharts & TanStack Table** | SLA performance charts and tabulated operational data |
| **Form Handling** | **React Hook Form & Zod** | Client/server validation schemas |

---

## 🗄️ Database Schema & Domain Models

The application is backed by a relational schema defined in [`prisma/schema.prisma`](prisma/schema.prisma):

```mermaid
erDiagram
    User ||--o{ Complaint : "lodges (Student)"
    User ||--o{ Complaint : "assignedTo (Worker)"
    User ||--o{ AuditLog : "records"
    Category ||--|{ SubCategory : "contains"
    SubCategory ||--o{ Complaint : "classifies"
    Complaint ||--o{ Attachment : "includes"
    Complaint ||--o| Feedback : "receives"
    Complaint ||--o{ AuditLog : "tracks"
    Complaint ||--o{ ChatMessage : "has"

    User {
        string id PK
        string name
        string email UK
        enum role "STUDENT | WORKER | WARDEN | COORDINATOR"
        string blockAssigned
        string roomNumber
        string categoryExpertise
        boolean isAvailable
    }

    Complaint {
        string id PK
        string complaintRefId UK
        string location
        string description
        enum priority "LOW | NORMAL | HIGH | EMERGENCY"
        enum status "LOGGED | ASSIGNED | IN_PROGRESS | RESOLVED | REOPENED | ESCALATED | CLOSED"
        boolean emergencyFlag
        datetime tatDeadline
        datetime resolvedAt
        string resolutionNotes
    }

    Feedback {
        string id PK
        int starRating
        string comments
        boolean issuePersists
    }

    Attachment {
        string id PK
        string fileUrl
        boolean isResolutionProof
    }
```

### Core Enumerations
* **`Role`**: `STUDENT`, `WORKER`, `WARDEN`, `COORDINATOR`
* **`Priority`**: `LOW`, `NORMAL`, `HIGH`, `EMERGENCY` (triggers 2-Hour SLA)
* **`ComplaintStatus`**: `LOGGED`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `REOPENED`, `ESCALATED`, `CLOSED`
* **`AttachmentType`**: `IMAGE_JPEG`, `IMAGE_PNG`, `VIDEO_MP4`

---

## 👥 Quick Demo Accounts

HCMS includes a built-in 1-click credential switcher on the login page for instant role testing:

| Role | Name | Email | Default Password | Primary Workspace |
| :--- | :--- | :--- | :--- | :--- |
| **Resident Student** | Aarav Sharma | `aarav.student@hostel.edu` | `admin@hostel2026` | `/student` (Room A-204, Block A) |
| **Resident Student** | Rohan Patel | `rohan.student@hostel.edu` | `admin@hostel2026` | `/student` (Room B-312, Block B) |
| **Hostel Warden** | Dr. Vikram Singh | `warden.singh@hostel.edu` | `admin@hostel2026` | `/warden` (Block A Jurisdiction) |
| **Field Technician** | Ramesh Kumar | `ramesh.electrician@hostel.edu` | `admin@hostel2026` | `/worker` (Electrical Maintenance) |
| **Coordinator Admin**| Pooja Mehta | `admin.hcms@hostel.edu` | `admin@hostel2026` | `/coordinator` (Campus Operations) |

> 💡 **Tip:** You can also click **"Register New Resident"** on `/login` to create custom test students, wardens, or technicians on the fly.

---

## 📂 Project Directory Structure

```
hcms/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx                 # Unified daylight dashboard shell & top navigation
│   │   ├── student/                   # Student Resident Dashboard (/student)
│   │   │   ├── page.tsx               # Student ticket list & metrics
│   │   │   ├── requests/
│   │   │   │   ├── new/               # New complaint submission form
│   │   │   │   └── [id]/              # Complaint detail & timeline view
│   │   │   └── showcase/
│   │   │       ├── page.tsx           # Campus-wide verified repairs wall
│   │   │       └── ComparisonSlider.tsx # Interactive before/after photo slider
│   │   ├── worker/                    # Field Technician Dashboard (/worker)
│   │   │   └── page.tsx               # Mobile-first task portfolio & resolution desk
│   │   ├── warden/                    # Hostel Warden Operations (/warden)
│   │   │   ├── page.tsx               # Warden triage queue with SLA filters
│   │   │   ├── surveillance/          # Block-by-block issue radar
│   │   │   ├── analytics/             # KPI cards, satisfaction scores, & SLA charts
│   │   │   └── tickets/[id]/          # Detailed ticket audit & manual dispatch
│   │   └── coordinator/               # Campus Operations Desk (/coordinator)
│   │       ├── page.tsx               # Campus-wide operations queue
│   │       ├── surveillance/          # Campus radar
│   │       ├── analytics/             # University-wide SLA analytics
│   │       └── tickets/[id]/          # Operations audit & dispatch desk
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts         # Authentication & role cookie stamping
│   │   │   └── logout/route.ts        # Session termination
│   │   ├── complaints/
│   │   │   └── [id]/feedback/route.ts # Student star rating & feedback handler
│   │   ├── worker/tickets/route.ts    # Work order status & resolution submissions
│   │   └── cron/                      # SLA breach checker background job
│   ├── login/
│   │   └── page.tsx                   # Polished daylight login & registration portal
│   ├── layout.tsx                     # Root HTML layout with Inter font
│   ├── globals.css                    # Tailwind CSS v4 design tokens
│   └── page.tsx                       # Root router (redirects to /login or role home)
├── components/
│   ├── ui/                            # Reusable shadcn/ui primitives (cards, buttons, dialogs)
│   ├── role-switcher.tsx              # Quick dev role switcher component
│   ├── sign-out-button.tsx            # Clean sign out button with cookie clearing
│   ├── worker-accept-button.tsx       # 1-click work order acceptance
│   └── worker-resolve-form.tsx        # Technician resolution notes & proof uploader
├── lib/
│   ├── prisma.ts                      # Global Prisma client singleton
│   └── utils.ts                       # Tailwind merge & utility helpers
├── prisma/
│   ├── schema.prisma                  # PostgreSQL schema definitions
│   └── seed.ts                        # Seed data for categories, subcategories, & users
├── middleware.ts                      # Edge route protection & role redirection
└── package.json                       # Dependencies & script definitions
```

---

## ⚡ Getting Started & Local Setup

### 1. Prerequisites
* **Node.js**: `v18.18+` or `v20.x`
* **npm**: `v9+` (or `pnpm` / `bun`)
* **PostgreSQL Database**: Local PostgreSQL or hosted service (e.g., Supabase / Neon)

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/Kratos14-N/hcms.git
cd hcms
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Database Connections
DATABASE_URL="postgresql://user:password@localhost:5432/hcms?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/hcms?schema=public"

# File Uploads (Uploadthing)
UPLOADTHING_TOKEN="your_uploadthing_token_here"

# Application Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Run Database Migrations & Seed Data
```bash
# Push schema to database
npx prisma db push

# Seed initial categories, technicians, and resident accounts
npm run postinstall
# or directly:
npx tsx prisma/seed.ts
```

### 5. Launch the Development Server
```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser. The system will direct you to `/login` where you can immediately sign in with any demo profile.

---

## 🛡️ Security, Auth & Role Boundaries

HCMS enforces strict boundary isolation handled directly at the Next.js Edge Middleware layer ([`middleware.ts`](middleware.ts)):

```
                                [ Incoming Request ]
                                         │
                                         ▼
                                  [ middleware.ts ]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┬────────────────────────────────┐
        ▼                                ▼                                ▼                                ▼
   Path: /student/*                Path: /worker/*                 Path: /warden/*               Path: /coordinator/*
        │                                │                                │                                │
  Is STUDENT?                       Is WORKER?                      Is WARDEN/COORD?                 Is COORDINATOR?
  ├── YES ➔ Allow                  ├── YES ➔ Allow                  ├── YES ➔ Allow                  ├── YES ➔ Allow
  └── NO  ➔ Divert to Home         └── NO  ➔ Divert to Home         └── NO  ➔ Divert to Home         └── NO  ➔ Divert to Home
```

* **Session Persistence**: Stamped with `HttpOnly`/`SameSite=Lax` cookies (`hcms_role`, `hcms_user_id`).
* **Resilient Directory Fallbacks**: If the database is undergoing maintenance or reconnecting, the application gracefully utilizes in-memory fallback directories to ensure 100% operational uptime for facility desks.

---

## 🔄 Workflow Lifecycles

### Complaint Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> LOGGED : Student Lodges Request
    LOGGED --> ASSIGNED : Warden assigns Technician (or Auto-matched)
    ASSIGNED --> IN_PROGRESS : Technician accepts Work Order
    IN_PROGRESS --> RESOLVED : Work completed with Photo Proof
    RESOLVED --> CLOSED : Student gives 5★ / Closes
    RESOLVED --> REOPENED : Student reports "Issue Persists"
    REOPENED --> ASSIGNED : Re-assigned with High Priority
    IN_PROGRESS --> ESCALATED : SLA Deadline Breached
    ESCALATED --> RESOLVED : Handled by Lead Supervisor
    CLOSED --> [*]
```

### SLA Escalation Rules
* **Emergency Issues** (Water burst, electrical hazard): Hard deadline of **2 Hours**. Instant red badge flagging.
* **Standard Issues** (Lighting, carpentry): **24 to 48 Hours**.
* **Breach Action**: Automatic escalation flag `isEscalated = true`, highlighted at the top of the Warden Triage Queue.

---

## 📊 Evaluation & Production Readiness Checklist

- [x] **Next.js 16 Turbopack Compatibility**: High-speed compilation and sub-second Fast Refresh.
- [x] **Humanized Daylight Design**: Clean `#f8fafc` canvas, unified slate typography, and consistent brand headers.
- [x] **Strict Role Guards**: Complete protection on student, warden, and technician routes.
- [x] **Emergency 2-Hour SLA Engine**: Countdown timer and visual priority tagging.
- [x] **Before/After Resolution Proofs**: Dual-image comparison slider for completed jobs.
- [x] **Zero-Config Demo Experience**: 1-click logins for all 5 enterprise roles.
- [x] **Mobile Responsiveness**: Verified across mobile viewports, tablets, and desktop resolutions.

---

## 📄 License & Credits

* **Project**: HCMS (Hostel Complaint Management System)
* **Author / Maintainer**: [Kratos14-N](https://github.com/Kratos14-N)
* **License**: MIT Open Source License — feel free to customize and deploy for your campus or housing society!

---

*For queries or facility emergencies, contact the 24/7 Campus Operations Desk at `admin.hcms@hostel.edu`.*
