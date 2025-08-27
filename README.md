# FitScore - Intelligent Hiring System

A modern Next.js application for AI-powered hiring and People Analytics, built with TypeScript, Tailwind CSS, and Context API.

## 🚀 Features

- **Authentication System** - User login/registration with role-based access
- **Job Management** - Create, edit, and manage job postings
- **Candidate Management** - Track and manage candidate applications
- **AI FitScore Calculation** - Intelligent candidate scoring system
- **Reporting System** - Generate and export candidate reports
- **Modern UI/UX** - Beautiful, responsive design with FitScore branding

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Supabase Auth (planned)
- **Database**: Supabase PostgreSQL (planned)
- **AI Integration**: OpenAI API (planned)

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#0020ff` - Main buttons, highlights
- **Light Blue**: `#4b6fff` - Hover states, secondary buttons
- **Navy Blue**: `#0b007c` - Accent elements
- **Dark Blue**: `#001966` - Text and titles
- **Light Gray**: `#f0f0f0` - Backgrounds
- **White**: `#ffffff` - Card backgrounds

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Dashboard page
│   ├── globals.css        # Global styles and color variables
│   ├── login/             # Authentication pages
│   │   └── page.tsx       # Login page
│   ├── dashboard/         # Dashboard pages
│   │   └── page.tsx       # Dashboard redirect
│   ├── jobs/              # Job management pages
│   │   ├── page.tsx       # Jobs listing
│   │   └── create/        # Job creation
│   │       └── page.tsx   # Create job form
│   └── candidates/        # Candidate management pages
│       └── page.tsx       # Candidates listing
├── contexts/              # React Context API
│   ├── AuthContext.tsx    # Authentication state management
│   ├── JobsContext.tsx    # Job postings state management
│   ├── CandidatesContext.tsx # Candidates state management
│   └── AppProvider.tsx    # Combined context provider
├── components/            # Reusable components
│   ├── JobCard.tsx        # Job posting card component
│   └── index.ts           # Component exports
├── hooks/                 # Custom React hooks
│   ├── useLocalStorage.ts # Local storage hook
│   └── index.ts           # Hook exports
├── types/                 # TypeScript type definitions
│   └── index.ts           # All application types
└── utils/                 # Utility functions
    └── index.ts           # Helper functions
```

## 🗺️ Screen Routes & Navigation

### Public Routes
- **`/`** - Main Dashboard (requires authentication)
- **`/login`** - User authentication page

### Protected Routes (require authentication)
- **`/dashboard`** - Dashboard redirect (redirects to `/`)
- **`/jobs`** - Job postings listing and management
- **`/jobs/create`** - Create new job posting form
- **`/candidates`** - Candidates listing and management

### Navigation Flow
1. **Login** (`/login`) → **Dashboard** (`/`)
2. **Dashboard** → **Jobs** (`/jobs`) or **Candidates** (`/candidates`)
3. **Jobs** → **Create Job** (`/jobs/create`)
4. **Candidates** → **View Candidate Details** (future implementation)

### Mock Data & Features
- **Authentication**: Mock login with demo credentials
- **Job Management**: Create, view, and manage job postings
- **Candidate Management**: View candidates with FitScore calculation
- **FitScore AI**: Mock AI scoring system for candidates
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitscore-next-ts-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Demo Walkthrough

### 1. Login
- Visit `http://localhost:3000/login`
- Click "Use Demo Credentials" to auto-fill login form
- Click "Sign in" to access the dashboard

### 2. Dashboard (`/`)
- View statistics and recent job postings
- Use "Quick Actions" to navigate to different sections
- See system status and available features

### 3. Job Management (`/jobs`)
- View existing job postings with interactive cards
- Click "Create New Job" to add a new posting
- Use filters and search functionality
- Edit or delete existing jobs

### 4. Create Job (`/jobs/create`)
- Fill out comprehensive job form with:
  - Basic information (title, description)
  - Performance requirements (experience, skills)
  - Energy requirements (availability, deadlines)
  - Cultural values
- Submit to create new job posting

### 5. Candidate Management (`/candidates`)
- View candidate applications in a table format
- Click "Calculate" to generate mock FitScores
- Filter candidates by job and status
- View detailed candidate information

### 6. FitScore AI
- Click "Calculate" on any candidate to generate AI scores
- View technical, cultural, and behavioral scores
- See overall FitScore with color-coded indicators
- Read AI analysis of candidate fit

### Mock Data Features
- **Pre-loaded Jobs**: Sample job postings ready to explore
- **Sample Candidates**: Mock candidates with realistic data
- **Interactive FitScores**: Generate new scores on demand
- **Responsive Design**: Works on desktop, tablet, and mobile

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (for future implementation)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API (for FitScore calculation)
OPENAI_API_KEY=your_openai_api_key

# Email Service (for reports)
EMAIL_SERVICE_API_KEY=your_email_service_key
```

## 🏗️ Architecture

### Context API Structure

The application uses React Context API for state management with three main contexts:

1. **AuthContext** - Handles user authentication and session management
2. **JobsContext** - Manages job postings CRUD operations
3. **CandidatesContext** - Manages candidates and FitScore calculations

### Type Safety

All data structures are fully typed with TypeScript interfaces:

- `User` - User authentication and profile data
- `JobPosting` - Job posting structure with performance, energy, and culture criteria
- `Candidate` - Candidate application data
- `FitScore` - AI-calculated scoring results

## 🎯 Core Features

### 1. Authentication
- User registration and login
- Role-based access (Manager/Recruiter)
- Session management
- Protected routes
- **Mock Implementation**: Demo credentials available

### 2. Job Management
- Create job postings with detailed criteria
- Performance requirements (experience, deliveries, skills)
- Energy requirements (availability, deadlines, pressure)
- Cultural requirements (legal values)
- Job status management (draft, published, closed)
- **Mock Implementation**: Full CRUD operations with mock data

### 3. Candidate Management
- Public application form
- Resume upload and storage
- Cultural fit assessment
- Candidate status tracking
- FitScore calculation
- **Mock Implementation**: Sample candidates with mock FitScores

### 4. AI FitScore System
- Technical score calculation
- Cultural fit assessment
- Behavioral analysis
- Overall score computation
- AI-powered insights
- **Mock Implementation**: Random score generation with realistic ranges

### 5. Reporting
- Candidate ranking reports
- PDF/Excel export functionality
- Email delivery to managers
- Report history tracking
- **Mock Implementation**: Ready for backend integration

## 🎮 Demo Features

### Mock Authentication
- **Demo Credentials**: Use "Use Demo Credentials" button on login
- **Auto-login**: Automatically logs in with mock user data
- **Session Persistence**: Maintains login state across page refreshes

### Mock Job Management
- **Sample Jobs**: Pre-loaded with example job postings
- **Create Jobs**: Full form with validation and mock submission
- **Job Cards**: Interactive cards with view, edit, delete actions
- **Status Management**: Draft, published, closed status tracking

### Mock Candidate Management
- **Sample Candidates**: Pre-loaded with example candidates
- **FitScore Calculation**: Click "Calculate" to generate mock AI scores
- **Candidate Table**: Sortable and filterable candidate listing
- **Score Visualization**: Color-coded FitScores with labels

### Interactive Navigation
- **Breadcrumb Navigation**: Easy navigation between screens
- **Quick Actions**: Dashboard shortcuts to main features
- **Responsive Design**: Works seamlessly on all devices

## 🔮 Future Enhancements

- [ ] Supabase integration for authentication and database
- [ ] OpenAI API integration for FitScore calculation
- [ ] File upload functionality for resumes
- [ ] Email service integration for reports
- [ ] Advanced filtering and search
- [ ] Real-time notifications
- [ ] Mobile-responsive optimizations
- [ ] Unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**FitScore** - Making hiring intelligent and data-driven. 🚀
