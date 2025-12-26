# MASCON - Event Platform

A production-ready, mobile-first event platform webapp (like Whova) built with Next.js, featuring a modular "core + modules" architecture.

## Features

### Core Features
- 🔐 **Authentication**: Email magic link & Google OAuth
- 📅 **Multi-event support**: Host multiple events with unique slugs
- 👥 **Role-based access**: Admin, Organizer, Speaker, Exhibitor, Attendee
- 📱 **PWA-ready**: Install on mobile devices
- 🌙 **Dark mode support**: Automatic theme detection

### Event Modules
- 🏠 **Home**: Event banner, summary, venue map, resource tiles, sponsors
- 📋 **Agenda**: Personal schedule builder with session bookmarks
- 👤 **Attendees**: Attendee directory with networking
- 💬 **Community**: Topic threads, meetups, and discussions
- ✉️ **Messages**: Direct messaging between attendees
- 🏢 **Exhibitors**: Exhibitor directory with booth info
- 🤝 **Sponsors**: Sponsor showcase by tier
- 📄 **Documents**: Downloadable event materials
- 📍 **Logistics**: Venue info, maps, and practical details
- 🚌 **Shuttle**: Shuttle routes and schedules
- 🏆 **Leaderboard**: Gamification and engagement tracking
- 📸 **Photos**: Event photo albums
- 📊 **Polls**: Interactive polls and surveys
- 👶 **Kids Zone**: Children's activities info
- 🕌 **Prayer Rooms**: Prayer room locations and times
- ❓ **Session Q&A**: Live questions for sessions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v4
- **Icons**: Lucide React
- **State**: Zustand (client), React Server Components (server)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local database)
- npm or yarn

### 1. Clone and Install

```bash
cd mascon
npm install
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mascon"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Email (for magic links) - Using Mailhog for development
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@mascon.local"

# Optional: Google OAuth
# GOOGLE_CLIENT_ID=""
# GOOGLE_CLIENT_SECRET=""
```

### 3. Start Database

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **pgAdmin** on port 5050 (admin@mascon.org / admin)
- **Mailhog** on port 8025 (email testing UI)

### 4. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed demo data (MASCON 2025)
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After seeding, you can log in with these accounts:

| Email | Role |
|-------|------|
| admin@mascon.org | Admin |
| demo@example.com | Attendee |

Use the email magic link flow - check Mailhog at [http://localhost:8025](http://localhost:8025) for login emails.

## Project Structure

```
mascon/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeder
├── public/
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   └── auth/      # NextAuth endpoints
│   │   ├── auth/          # Auth pages (signin, error)
│   │   ├── e/[eventSlug]/ # Event pages
│   │   │   ├── agenda/
│   │   │   ├── attendees/
│   │   │   ├── community/
│   │   │   ├── messages/
│   │   │   └── ...
│   │   ├── events/        # Event list
│   │   ├── profile/       # User profile pages
│   │   └── settings/      # User settings
│   ├── components/
│   │   ├── home/          # Home page components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts        # NextAuth config
│   │   ├── db.ts          # Prisma client
│   │   └── utils.ts       # Utility functions
│   ├── services/          # Business logic
│   └── types/             # TypeScript types
├── docker-compose.yml
└── package.json
```

## Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Push schema changes without migration (dev only)
npm run db:push

# Seed the database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (drops all data!)
npm run db:reset
```

## Customization

### Adding New Modules

1. Add module to `enabledModules` in event settings
2. Create route at `src/app/e/[eventSlug]/[module-name]/page.tsx`
3. Add navigation entry to SideDrawer or ResourceGrid
4. Create any needed Prisma models and run migrations

### Theming

Events support custom branding:
- `primaryColor` and `secondaryColor` in event settings
- Custom `bannerUrl` and `logoUrl`
- Override Tailwind colors in `tailwind.config.ts`

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

The build script automatically runs `prisma generate`.

### Docker

```bash
# Build production image
docker build -t mascon .

# Run with external database
docker run -p 3000:3000 \
  -e DATABASE_URL="your-production-db-url" \
  -e NEXTAUTH_URL="your-domain" \
  -e NEXTAUTH_SECRET="your-secret" \
  mascon
```

## API Routes

| Route | Description |
|-------|-------------|
| `/api/auth/*` | NextAuth.js endpoints |
| `/api/events` | Event CRUD (coming soon) |
| `/api/sessions` | Session management (coming soon) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting: `npm run lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for the Muslim community
