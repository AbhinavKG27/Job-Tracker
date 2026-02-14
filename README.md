# 🚀 Job Notification Tracker (JNT)

An intelligent Job Notification Tracker web application that helps users discover, track, and manage job opportunities using match scoring, daily digest simulation, status tracking, and a built-in test & proof submission system.

Designed with a premium UI and built using modern React + Vite architecture.

---

## 📌 Project Overview

Job Notification Tracker (JNT) is a smart job discovery platform that:
- Matches jobs based on user preferences
- Tracks application status
- Saves jobs persistently
- Generates a daily job digest
- Enforces a test checklist before shipping
- Provides a final proof & submission system

This project simulates a real-world product workflow with validation, persistence, and UX polish.

---

## 🧠 Core Features

### 1️⃣ Intelligent Match Scoring
- Calculates match % based on:
  - Skills
  - Role keywords
  - Location preference
  - Experience level
- Shows visual score badges for each job

### 2️⃣ Preferences System (Persistent)
- Role Keywords (comma-separated)
- Skills (comma-separated)
- Preferred Locations
- Work Mode (Remote/Hybrid/Onsite)
- Minimum Match Score Slider
- Stored using localStorage

### 3️⃣ Job Dashboard
- Search & filter jobs
- Sort by:
  - Latest
  - Match Score
  - Salary (High → Low)
- "Show Only Matches" toggle

### 4️⃣ Save & Apply System
- Save jobs with heart icon ❤️
- Saved jobs persist after refresh
- Apply opens job link in new tab (secure)

### 5️⃣ Status Tracking Pipeline
Application statuses:
- Not Applied
- Applied
- Interviewing
- Rejected
- Offer

Includes:
- Status history
- Persistent updates
- Recent status log

### 6️⃣ Daily Digest (Top 10 Jobs)
- Personalized digest based on preferences
- Cached per day (localStorage)
- Copy to clipboard feature
- Email draft generator

### 7️⃣ Built-in Test Checklist System (/jt/07-test)
Includes 10 validation checks:
- Preferences persistence
- Match score accuracy
- Save job persistence
- Digest generation
- Status tracking persistence
- Console error checks
- And more...

Ship page remains LOCKED until all tests pass.

### 8️⃣ Proof & Submission System (/jt/proof)
Includes:
- Step Completion Summary (8 steps)
- Artifact Collection Inputs:
  - Lovable Project Link
  - GitHub Repository Link
  - Live Deployment URL
- URL validation
- Final submission export
- Ship status badge:
  - Not Started
  - In Progress
  - Shipped

---

## 🏗️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + ShadCN UI |
| Icons | Lucide React |
| State | React Hooks + localStorage |
| UX Notifications | Sonner Toast |
| Architecture | Component-Based SPA |

---

## 📁 Folder Structure

Job-Tracker/

│

├── public/

│ └── logo.png

│

├── src/

│ ├── components/ # Reusable UI components

│ ├── hooks/ # Custom hooks (test, proof logic)

│ ├── lib/ # Core logic (match score, dataset, status)

│ ├── pages/ # Main pages (Dashboard, Proof, etc.)

│ ├── App.tsx # Root app

│ └── index.tsx # Main entry UI logic

│

├── index.html

├── package.json

└── README.md


## 🌐 Live Deployment

🚀 Live App: https://job-tracker12.vercel.app/ 
📦 GitHub Repository: https://github.com/AbhinavKG27/Job-Tracker


