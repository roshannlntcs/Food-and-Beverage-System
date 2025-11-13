Food and Beverage System: POS

Members:
Jamil, Bless Mycho
Lanticse, Rose Ann
Milan, Jhapet Dave
Villaverde, John Paul
Montajes, Genesis John

Project Overview

What it is: A full-stack POS and admin suite for a school-based food & beverage operation. Operators can manage inventory, categories, price changes, logs, and transactions; administrators handle user onboarding, CSV imports, system resets, and analytics dashboards.

Key stacks:
Frontend: React + Context API, React Router, Tailwind-esque styling.
Backend: Node.js/Express + Prisma ORM + SQLite (dev) with ready scaffolding for other DBs.
Auth: Session-based flow via backend, with React contexts for client state.

Features
Inventory Management: CRUD for products, stock tracking, edit modals, logs, soft-delete (archive) support, category filters, pagination.
Category Management: “Add Category” and “Manage Category” modals with default & optional icons, rename/archive, and history logging.
User Administration: CSV import with validation/trapping, manual add/edit/delete, role management, reset actions (transactions, voids, products, etc.) with batch scope selection and configurable restock quantities.
Analytics Dashboard: Notifications, recent logins, stock & sales visualizations.
POS Flows: Role-based login, cashier/admin role selection, session-aware navigation.
Backend APIs: Prisma-powered CRUD for users, products, categories, inventory logs, admin resets, etc.

Getting Started
Prerequisites
Node.js LTS (>= 18 recommended)
npm
Git

Clone and Install
git clone <repo-url>
cd Food-and-Beverage-System

Backend Setup
cd backend
npm install
npx prisma migrate deploy   # creates prisma/prisma/dev.db
npm run db:seed             # seeds categories/products/users
npm run dev                 # starts backend on http://localhost:4000
Optional helper: npm run ensure-superadmin if you need to recreate the default admin user.

Frontend Setup
In a new terminal:

cd frontend
npm install
npm start                   # opens http://localhost:3000
Ensure the backend is running first so the React app can authenticate and load data.

### Accounts & provisioning

Self-service registration has been removed from the UI so that only seeded accounts or CSV-imported users can sign in. Create operators via `npm run db:seed`, the Super Admin “Import Users (CSV)” tool, or the manual add-user modal before distributing credentials.

Environment Variables
Backend uses .env for DATABASE_URL (defaults to file:./prisma/dev.db).
Frontend reads REACT_APP_API_URL (defaults to http://localhost:4000).
Example .env (backend):

DATABASE_URL="file:./prisma/dev.db"
PORT=4000
SESSION_SECRET=<generate-a-secret>
JWT_SECRET=<generate-a-secret>
COOKIE_SECURE=true
Scripts Reference

Backend
npm run dev — nodemon + Express.
npm run build — compile Prisma client.
npm run db:seed — populates default users/categories/products.
npm run ensure-superadmin — ensures the super admin exists.

Frontend
npm start — dev server with hot reload.
npm run build — production build (outputs to frontend/build).

Project Structure Highlights
backend/
  src/
    server.js
    routes/
    middleware/
  prisma/
    schema.prisma
    defaultMenu.json
frontend/
  src/
    pages/pos/
    components/modals/
    contexts/
    api/
    
Common Workflows
Adding inventory items: Admin → Inventory → “Add Item”.
Managing categories: “Manage Category” modal (edit icons/names, add optional categories).
Importing users from CSV: Admin → Super Admin → “Import Users (CSV)” (validates duplicates & missing columns).
Resetting data: Admin → Super Admin → “Reset System Data” drop-down with scoped reset options.
Role selection: After login, choose Admin or Cashier; landing pages respect current session.

Known Issues / Caveats
Inventory uses soft deletes (products set active=false); UI hides archived items unless the endpoint is queried with includeInactive.
CSV importer keeps the first occurrence of an ID/username and reports others as “skipped existing”.
Some legacy components still include placeholder assets; adjust icons/images in /frontend/public or /frontend/src/assets.

Contributing
Branch off backend-session-overhaul or main.
Run backend/frontend tests (if added) before pushing.
Open PRs against main documenting UI/DB changes and seed impacts.

## Desktop / Offline Build (Electron)

The `desktop/` workspace wraps the existing backend + React UI in an Electron shell so the POS can be installed on lab machines without any external servers or internet access.

### Prerequisites

1. Install dependencies in every workspace:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../desktop && npm install
   ```
2. Prepare the SQLite snapshot that will ship with the installer:
   ```bash
   cd backend
   npx prisma migrate deploy
   npm run db:seed
   ```
   This refreshes `backend/prisma/dev.db`, which Electron copies into the end-user's profile on first launch.

### Desktop development run

```bash
cd desktop
npm run dev
```

The script runs the CRA dev server on port 3000 and launches Electron pointing at it. By default the desktop shell also boots a local backend on port `4870`. If you prefer to run the API separately (for nodemon, debugging, etc.), start it yourself (`PORT=4870 npm run dev` from `backend/`) and launch Electron with `DESKTOP_EXTERNAL_API=true npm run dev`.

### Packaging an offline installer

```bash
cd desktop
npm run dist
```

What the script does:

- Builds the React app into `desktop/app` with `REACT_APP_API_URL=http://127.0.0.1:4870`.
- Copies the entire backend (code + node_modules + prisma assets) into the Electron bundle.
- Runs `electron-builder` to generate an `.exe` installer under `desktop/dist/`.
- Records a per-install JWT secret and copies/version-tracks the bundled `backend/prisma/dev.db` inside `%AppData%/FoodAndBeveragePOS/storage`, so schema changes shipped in future installers automatically refresh the runtime database.

When students install the app, Electron will:

1. Copy `backend/prisma/dev.db` into `%AppData%/FoodAndBeveragePOS/storage/pos.db` on first launch so every machine starts with the seeded data.
2. Boot the bundled Express API on `http://127.0.0.1:4870`.
3. Serve the built React UI inside a desktop window pointed at that local API.

The renderer automatically prefers `window.desktop.backendOrigin` (exposed by the preload script), so Electron builds—both `npm run dev` and `npm run dist`—always talk to the bundled backend without extra env configuration. When running the React app in a regular browser the usual `REACT_APP_API_URL` / `http://localhost:4000` flow still applies.

No network connection is required once the installer is produced.

### Desktop runtime notes

- The Electron launcher writes a unique `jwt-secret.txt` to `%AppData%/FoodAndBeveragePOS/storage/` (or your OS equivalent) so offline installs do not share the default JWT signing key.
- Cookies are forced to `sameSite=lax`/`secure=false` inside the desktop bundle to keep the http-only session working over `http://127.0.0.1`. For web deployments leave `COOKIE_SECURE=true`.
- If you update the Prisma schema, rebuild the installer and it will automatically drop the refreshed `dev.db` into the runtime folder on first launch.
