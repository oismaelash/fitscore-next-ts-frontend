# FitScore - Intelligent Hiring System

This repository describes the scope of screens, business rules, backend endpoints, and design system necessary to implement the **FitScore** system, an AI-powered hiring co-pilot and People Analytics tool.

---

## 🎯 Objective
Build an end-to-end system that allows:
- Create and publish job postings
- Receive candidates via form
- Calculate FitScore with AI (technical, cultural, behavioral)
- Rank candidates
- Generate reports and send to the manager

---

## 🖥️ Frontend Screens

1. **Login / Registration**
   - Access for managers and recruiters
   - Authentication via Supabase Auth

2. **Main Dashboard**
   - List of published job postings
   - Statistics of candidates and reports sent

3. **Job Creation Screen**
   - Form to register job
      - Performance: experience, deliveries, skills
      - Energy: availability, deadlines, pressure
      - Culture: legal values
   - Generates application link

4. **Candidate Application Screen (Public Form)**
   - Name, contact(email, phone), resume (upload), cultural fit responses (performance, energy, culture)
   - Submission linked to the job posting

5. **Candidate List Screen by Job**
   - Candidate ranking
   - Display of calculated FitScore
   - Filters: classification (high/low score), status (new, reviewed, sent to manager)

6. **Candidate Detail Screen**
   - Resume
   - Cultural/technical responses
   - Interview history
   - Detailed score (AI)

7. **Report and Export Screen**
   - Send report in PDF/Excel via email to the manager
   - History of reports sent

---

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` → Create user
- `POST /auth/login` → Login
- `POST /auth/logout` → Logout

### Job Postings
- `POST /jobs` → Create job posting
- `GET /jobs` → List job postings
- `GET /jobs/{id}` → Detail job posting
- `PUT /jobs/{id}` → Update job posting
- `DELETE /jobs/{id}` → Delete job posting

### Candidates
- `POST /candidates` → Create candidate (application for the job)
- `GET /candidates?jobId={id}` → List candidates by job
- `GET /candidates/{id}` → Detail candidate

### FitScore / AI
- `POST /fitscore/calculate` → Calculate FitScore for candidate
- `GET /fitscore/report?jobId={id}` → Candidate ranking with score

### Reports
- `POST /reports/send` → Send report to manager
- `GET /reports?jobId={id}` → History of reports by job

---

## 🧭 Screen ↔ Endpoint Mapping

| Screen                           | Used Endpoints |
|----------------------------------|----------------|
| Login / Registration              | `/auth/signup`, `/auth/login` |
| Dashboard                         | `/jobs`, `/candidates?jobId={id}`, `/fitscore/report` |
| Job Creation                      | `/jobs` |
| Candidate Application (Form)     | `/candidates` |
| Candidate List                   | `/candidates?jobId={id}`, `/fitscore/report` |
| Candidate Detail                  | `/candidates/{id}`, `/fitscore/calculate` |
| Report and Export                 | `/reports/send`, `/reports?jobId={id}` |

---

## 🎨 Color Palette

Extracted from the provided image:

- Primary Blue: **#0020ff**
- Light Blue: **#4b6fff**
- White: **#ffffff**
- Navy Blue: **#0b007c**
- Light Gray: **#f0f0f0**
- Dark Blue: **#001966**

Suggested usage:
- **Primary (#0020ff)** → main buttons, highlights
- **Secondary (#4b6fff)** → hover, secondary buttons
- **Background (#f0f0f0 or #ffffff)** → backgrounds
- **Text (#001966 / #0b007c)** → titles and subtitles

---

## 🚀 Technologies
- **Frontend**: React (Next.js) + Tailwind, Context API
- **Backend**: Node.js (NestJS)
- **Database**: Supabase (Postgres + Auth + Storage)
- **AI / FitScore**: OpenAI API
- **Automation / Reports**: n8n
- **Infrastructure**: AWS (Amplify [Frontend], AppRunner [Backend]), Docker, N8N Cloud [Automation]
