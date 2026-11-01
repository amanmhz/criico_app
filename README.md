# Cricket Player Management System

A robust, enterprise-grade Cricket Player & Match Management System built with Next.js 16 App Router, TypeScript, Tailwind CSS, PostgreSQL, and Prisma ORM.

---

## 1. Project Overview

The **Cricket Player Management System** enables cricket clubs, leagues, and tournament organizers to manage players, teams, squad rosters, matches, and real-time player performances. It computes an algorithmic **Player Impact Score** that powers a dynamic leaderboard, factoring in player roles (Batsman, Bowler, All-Rounder, Wicketkeeper) and career experience.

The system features:
- **Role-Based Access Control (RBAC):** Server-enforced `ADMIN` and `VIEWER` permissions.
- **Transactional Consistency:** Atomic multi-record updates via PostgreSQL & Prisma transactions (performance recording with automatic career stats updates and rollbacks).
- **Interactive UI Feedback:** Responsive UI with custom Toast notifications for all operations (validation errors, successes, and deletions).
- **Statistically Balanced Impact Scoring:** Strictly typed scoring formula with runtime and compile-time constraint validation.

---

## 2. Technology Stack

- **Frontend & Framework:** Next.js 16 (App Router with Server & Client Components, Turbopack)
- **Language:** TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL
- **ORM & Migrations:** Prisma 7 with `@prisma/adapter-pg`
- **Authentication:** JWT via `jose` stored in secure, `httpOnly` cookies with `bcryptjs` password hashing
- **Input Validation:** Zod
- **Testing:** Vitest

---

## 3. Database Selection Justification: PostgreSQL

PostgreSQL was chosen for this system for several core architectural reasons:

1. **ACID Transactions for Complex Match Performances:**
   When a match is recorded, edited, or deleted, multiple player performances must be created/updated while simultaneously adjusting career aggregate stats (matches played, total runs, total wickets) for all participating players. PostgreSQL provides true ACID compliance, ensuring that partial failures roll back completely without data drift.
2. **Relational Integrity & Foreign Keys:**
   The domain involves strict relational contracts (`User`, `Player`, `Team`, `TeamPlayer` junction table, `Match`, and `PlayerPerformance`). PostgreSQL enforces referential integrity through foreign keys and unique composite indices (`[teamId, playerId]`, `[matchId, playerId]`).
3. **Optimized Queries for Leaderboard & Filtering:**
   PostgreSQL provides high-performance indexed queries for multi-table joins (teams with rosters, match summaries, aggregated rankings).
4. **Strong Typing & Enum Support:**
   Native database-level enums (`UserRole`, `PlayerRole`) guarantee schema-level consistency.

---

## 4. User Roles and Permissions

The system implements two distinct roles:

| Operation | ADMIN | VIEWER |
| :--- | :---: | :---: |
| **View Dashboard, Metrics & Stats** | ✅ | ✅ |
| **View Players & Profiles** | ✅ | ✅ |
| **Create / Edit / Delete Players** | ✅ | ❌ (403 Forbidden) |
| **View Teams & Rosters** | ✅ | ✅ |
| **Create / Edit / Delete Teams** | ✅ | ❌ (403 Forbidden) |
| **Assign / Remove Players from Squad** | ✅ | ❌ (403 Forbidden) |
| **View Matches & Scorecards** | ✅ | ✅ |
| **Record / Edit / Delete Matches** | ✅ | ❌ (403 Forbidden) |
| **View Leaderboard & Filter by Role/Team** | ✅ | ✅ |

> **Security Note:** All permission checks are performed on the server side in API route handlers via `requireAuth` and `requireAdmin` helpers. Client-side UI controls are tailored to user permissions as a UX enhancement, not as a security perimeter.

---

## 5. Environment Variables

Create a `.env` file in the `cricket-management` directory based on the following template:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/cricket_db?schema=public"

# JWT Secret for signing authentication tokens (min 32 characters)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"

# Application Environment
NODE_ENV="development"
```

---

## 6. Installation & Setup

### Prerequisites
- Node.js (v20+ recommended)
- PostgreSQL database instance
- npm

### 1. Clone & Install Dependencies
```bash
cd cricket-management
npm install
```

### 2. Database Migrations
Run Prisma migrations to initialize the PostgreSQL schema:
```bash
npx prisma migrate deploy
# Or for local development schema synchronization:
npx prisma migrate dev
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Seed the Database
Seed the database with initial admin/viewer accounts, teams, and sample players:
```bash
npx prisma db seed
```

**Default Credentials Seeded:**
- **Admin Account:** `admin@cricket.com` / `admin123`
- **Viewer Account:** `viewer@cricket.com` / `viewer123`

---

## 7. Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 8. Running Tests

The test suite is powered by Vitest, covering unit, service, repository, validation, and authorization logic:

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test
```

---

## 9. API Endpoint Reference

### Authentication
- `POST /api/auth/login` — Authenticate user, returns session and sets secure `httpOnly` cookie.
- `POST /api/auth/logout` — Invalidate session and clear authentication cookie.
- `GET /api/auth/me` — Retrieve currently authenticated user profile.

### Players
- `GET /api/players` — List players (supports `?name=` and `?role=` filters).
- `POST /api/players` — Create a new player (`ADMIN` only).
- `GET /api/players/[id]` — Retrieve player details and match history.
- `PUT /api/players/[id]` — Update player information (`ADMIN` only).
- `DELETE /api/players/[id]` — Delete a player without match history (`ADMIN` only).

### Teams
- `GET /api/teams` — List all teams with player counts.
- `POST /api/teams` — Create a new team (`ADMIN` only).
- `GET /api/teams/[id]` — Retrieve team details, roster, and match history.
- `PUT /api/teams/[id]` — Update team details (`ADMIN` only).
- `DELETE /api/teams/[id]` — Delete a team without match history (`ADMIN` only).

### Team Players (Squad Management)
- `GET /api/teams/[id]/players` — List players assigned to the team.
- `POST /api/teams/[id]/players` — Assign player to team (`ADMIN` only).
- `DELETE /api/teams/[id]/players/[playerId]` — Remove player from team squad (`ADMIN` only).

### Matches & Performances
- `GET /api/matches` — List all matches with team details and score summaries.
- `POST /api/matches` — Record a new match with player performances (`ADMIN` only).
- `GET /api/matches/[id]` — Get full match scorecard and individual stats.
- `PUT /api/matches/[id]` — Update match details and recalculate stats (`ADMIN` only).
- `DELETE /api/matches/[id]` — Delete match and rollback player stats (`ADMIN` only).

### Leaderboard
- `GET /api/leaderboard` — Get ranked player leaderboard sorted by Impact Score (supports `?role=` and `?teamId=` query params).

---

## 10. Player Impact Score Formula

The Impact Score is computed dynamically from career statistics:

$$\text{Base Score} = (\text{Total Runs} \times 1.2 \times \text{Run Multiplier}) + (\text{Total Wickets} \times 20 \times \text{Wicket Multiplier}) + \text{Flat Bonus}$$

### Role Modifiers:
- **Batsman:** `Run Multiplier = 1.3`, `Wicket Multiplier = 1.0`, `Flat Bonus = 0`
- **Bowler:** `Run Multiplier = 1.0`, `Wicket Multiplier = 1.5`, `Flat Bonus = 0`
- **Wicketkeeper:** `Run Multiplier = 1.0`, `Wicket Multiplier = 1.0`, `Flat Bonus = +30`
- **All-Rounder:** `Run Multiplier = 1.0`, `Wicket Multiplier = 1.0`, `Flat Bonus = 0`

### Experience Adjustments:
- **Rookie Penalty:** $< 5$ matches played: $-50$ points
- **Veteran Bonus:** $> 20$ matches played: $+100$ points
- **Standard (5 to 20 matches):** No adjustment
