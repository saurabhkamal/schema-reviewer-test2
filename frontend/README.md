# Schema Intelligence Frontend

Modern, production-ready Next.js frontend for the Schema Intelligence platform. Built with TypeScript, TailwindCSS, and React Query for optimal performance and developer experience.

## Features

- **Dashboard**: Real-time schema health overview with KPIs and issue summaries
- **Schema Browser**: Interactive tree view of databases, schemas, tables, and columns
- **Issues Management**: View, filter, and manage detected schema issues by severity
- **SQL Generator**: Generate safe SQL recommendations for schema optimization
- **Schema Comparison**: Compare schema versions to track changes over time
- **AI Assistant**: Get contextual help and recommendations about your schema
- **Analytics**: Track schema health trends and history
- **Authentication**: Secure JWT-based authentication with role-based access
- **Responsive Design**: Fully responsive UI that works on all devices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context API + React Query
- **HTTP Client**: Axios
- **Icons**: Font Awesome
- **UI Components**: Custom reusable components

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see `../backend/README.md`)

## Installation

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── schemas/           # Schema browser
│   ├── issues/            # Issues management
│   ├── sql-generator/     # SQL recommendation generator
│   ├── compare/           # Schema comparison
│   ├── ai-assistant/      # AI chat assistant
│   ├── analytics/         # Analytics dashboard
│   ├── databases/         # Database ingestion
│   └── settings/          # User settings
├── components/            # Reusable React components
│   ├── layout/           # Layout components (Sidebar, Header, AppLayout)
│   └── ui/               # UI components (Button, Card)
├── contexts/             # React Context providers
│   ├── AuthContext.tsx   # Authentication state
│   └── AppContext.tsx    # Global app state
├── lib/                  # Utilities and API client
│   └── api.ts           # Axios API client with interceptors
├── types/                # TypeScript type definitions
│   └── index.ts         # Shared types
└── tailwind.config.ts    # TailwindCSS configuration
```

## Key Features

### Authentication
- JWT-based authentication
- Automatic token injection via Axios interceptors
- Auto-redirect to login on 401 errors
- Role-based access control (Admin, Developer, Viewer)

### State Management
- **AuthContext**: Manages user authentication state
- **AppContext**: Manages global app state (databases, selected database)
- **React Query**: Handles server state, caching, and synchronization

### API Integration
All API calls are centralized in `lib/api.ts`:
- `authApi`: Authentication endpoints
- `schemaApi`: Schema management endpoints
- `impactApi`: Impact scoring and issues
- `recommendationApi`: SQL recommendations
- `assistantApi`: AI assistant chat

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Collapsible sidebar on mobile
- Touch-friendly interactions

## Getting Started

1. **Start the backend** (see `../backend/README.md`)

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

4. **Register/Login**:
   - Create an account or login
   - Default role is DEVELOPER

5. **Ingest a schema**:
   - Go to Databases page
   - Upload a schema JSON file (see `HOW_TO_ADD_DATABASE.md`)
   - Or paste JSON directly

6. **Explore**:
   - View your schema in the Schemas page
   - Check detected issues in the Issues page
   - Generate SQL recommendations
   - Compare schema versions

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001/api` |

## Documentation

- `HOW_TO_ADD_DATABASE.md` - Guide to extracting and ingesting schemas
- `HOW_SNAPSHOTS_WORK.md` - Explanation of schema versioning
- `CONNECTION_GUIDE.md` - Database connection guide

## Development

### Adding a New Page

1. Create a new file in `app/[page-name]/page.tsx`
2. Use `AppLayout` component for consistent layout
3. Add navigation item in `components/layout/Sidebar.tsx`
4. Use React Query for data fetching

### Adding a New API Endpoint

1. Add the endpoint function in `lib/api.ts`
2. Use TypeScript types from `types/index.ts`
3. Handle errors appropriately
4. Use React Query hooks in components

### Styling

- Use TailwindCSS utility classes
- Follow the design system in `tailwind.config.ts`
- Use custom components from `components/ui/`
- Maintain consistent spacing and colors

## Production Build

```bash
npm run build
npm run start
```

The production build will be optimized and ready to deploy.

## Troubleshooting

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running
- Verify CORS settings in backend

### Authentication Issues
- Clear localStorage and try again
- Check JWT token expiration
- Verify backend authentication endpoints

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

## License

See root LICENSE file.

