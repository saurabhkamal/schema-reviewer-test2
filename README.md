# Schema Intelligence

A production-ready platform for analyzing, monitoring, and optimizing PostgreSQL database schemas. Get intelligent insights, detect issues, and receive SQL recommendations to improve your database performance.

## 🚀 Features

- **Schema Analysis**: Extract and analyze PostgreSQL schema metadata
- **Versioned Snapshots**: Track schema changes over time with automatic versioning
- **Issue Detection**: Automatically detect schema issues using deterministic rules
- **Impact Scoring**: Calculate health scores and rank issues by severity
- **SQL Recommendations**: Generate safe SQL recommendations for optimization
- **Schema Comparison**: Compare different schema versions to track changes
- **AI Assistant**: Get contextual help and recommendations about your schema
- **Analytics Dashboard**: Monitor schema health trends and history
- **Role-Based Access**: Secure authentication with Admin, Developer, and Viewer roles

## 🏗️ Architecture

This is a full-stack application with separate frontend and backend:

```
schema-Intelligence/
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend API
└── README.md          # This file
```

## 📋 Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** 12+
- **npm** or **yarn**

## 🚦 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd schema-Intelligence
```

### 2. Set Up Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL connection details
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The backend will run on `http://localhost:3001`

See [backend/README.md](./backend/README.md) for detailed backend setup.

### 3. Set Up Frontend

```bash
cd frontend
npm install
# Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev
```

The frontend will run on `http://localhost:3000`

See [frontend/README.md](./frontend/README.md) for detailed frontend setup.

### 4. Get Started

1. Open `http://localhost:3000` in your browser
2. Register a new account (default role: DEVELOPER)
3. Extract your PostgreSQL schema (see [frontend/HOW_TO_ADD_DATABASE.md](./frontend/HOW_TO_ADD_DATABASE.md))
4. Upload the schema JSON via the Databases page
5. Explore your schema, view issues, and generate SQL recommendations!

## 📚 Documentation

- **[Backend README](./backend/README.md)** - Backend API documentation and setup
- **[Frontend README](./frontend/README.md)** - Frontend documentation and setup
- **[How to Add Database](./frontend/HOW_TO_ADD_DATABASE.md)** - Guide to extracting and ingesting schemas
- **[How Snapshots Work](./frontend/HOW_SNAPSHOTS_WORK.md)** - Understanding schema versioning

## 🔑 Key Concepts

### Schema Ingestion
- Users extract schema metadata from their PostgreSQL database using a scanner tool
- The extracted JSON is uploaded to the backend
- Backend stores it as a versioned snapshot
- **Important**: The backend never connects directly to user databases

### Issue Detection
- Uses deterministic, rule-based analysis (NO AI/ML)
- Detects common issues like missing indexes, foreign keys without indexes, etc.
- Issues are ranked by severity (CRITICAL, HIGH, MEDIUM, LOW)

### SQL Recommendations
- Generates safe SQL statements to fix detected issues
- Recommendations are rule-based and explainable
- Users can copy and review SQL before executing

### Versioning
- Each schema ingestion creates a new versioned snapshot
- Compare snapshots to see what changed
- Track schema evolution over time

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication
- Zod Validation

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- TailwindCSS
- React Query
- Axios

## 🔒 Security

- JWT-based authentication
- Role-based access control (ADMIN, DEVELOPER, VIEWER)
- Password hashing with bcryptjs
- CORS protection
- Input validation with Zod

