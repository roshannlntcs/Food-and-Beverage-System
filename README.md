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
User Administration: CSV import with validation/trapping, manual add/edit/delete, role management, reset actions (transactions, voids, products, etc.).
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

Environment Variables
Backend uses .env for DATABASE_URL (defaults to file:./prisma/dev.db).
Frontend reads REACT_APP_API_URL (defaults to http://localhost:4000).
Example .env (backend):

DATABASE_URL="file:./prisma/dev.db"
PORT=4000
SESSION_SECRET=<generate-a-secret>
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
