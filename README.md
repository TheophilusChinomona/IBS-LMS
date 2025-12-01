# IBS LMS

Cloud-ready Learning Management System starter built with Next.js (App Router), TypeScript, Tailwind CSS, React Query, and Firebase.

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS for styling
- Firebase (Auth, Firestore, Storage)
- React Query for client-side data fetching
- ESLint + Prettier
- Vitest + Testing Library

## Getting Started
1. Install dependencies (npm is configured):
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and add your Firebase project keys.
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` to view the app.

## Scripts
- `npm run dev` - start Next.js dev server
- `npm run build` - production build
- `npm run start` - run compiled app
- `npm run lint` - ESLint checks
- `npm run test` - Vitest unit tests

## Firebase Setup
- Configure your Firebase project and enable Auth, Firestore, and Storage.
- Security rules are outlined in `config/firestore.rules.md`.
- Client initialization lives in `lib/firebase.ts`.
- Cloud Functions scaffold is in `functions/` (placeholder ready for expansion).

## App Structure
- Public pages: `app/(public)` (landing, courses, login, register)
- Learner area: `app/(learner)` (dashboard, course details)
- Admin area: `app/(admin)` (dashboard, course management)
- Components: `components/` (UI atoms, layout, providers)
- Domain types: `types/models.ts`
- Role config: `config/roles.ts`
- Firestore helpers: `lib/firestore.ts`
- Auth helpers: `components/providers/auth-provider.tsx`, `lib/auth.ts`

## Testing
Run unit tests:
```bash
npm run test
```

## Deployment
- Deploy Next.js to Vercel or Firebase Hosting.
- Firebase services (Auth/Firestore/Storage) use environment variables for configuration.

## Notes
- RBAC: roles include learner (default), admin, instructor, superadmin.
- TODOs are annotated in admin module editing for future enhancements (rich content, drag/drop, corporate features).
