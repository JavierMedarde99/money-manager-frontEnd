# Money Manager FrontEnd — Architecture

## Overview

Single-page application (SPA) for personal finance management built with
**React 19 + TypeScript + Vite**. It connects to a Spring Boot backend that
exposes a REST API. The frontend is purely client-rendered and deployed on
Vercel (the backend runs on Render).

This document describes the structure, the data flow, and the conventions
that keep the codebase consistent. It is a living document — update it when
the architecture changes.

---

## Tech Stack

| Concern            | Choice                                          |
| ------------------ | ----------------------------------------------- |
| UI framework       | React 19 (JSX, `react-jsx`)                      |
| Language           | TypeScript (strict, `verbatimModuleSyntax`)      |
| Build tool         | Vite 8 (`@vitejs/plugin-react`)                  |
| Styling            | Tailwind CSS v4 (CSS-first config via `@theme`)  |
| Routing            | React Router v7 (`react-router-dom`)             |
| State (client)     | Zustand (auth only)                              |
| Server communication | Axios                                          |
| Charts             | Recharts (Pie charts on Dashboard)               |
| Icons              | lucide-react                                     |
| Validation         | Zod (declared dependency; currently minimal use) |
| Utilities          | class-variance-authority, clsx, tailwind-merge   |
| Linting            | oxlint (no ESLint)                               |
| Formatting         | None configured                                  |

### Key decisions

- **Path alias `@/`** maps to `./src/` (configured in both
  `vite.config.ts` and `tsconfig.app.json`).
- **TypeScript strictness**: `verbatimModuleSyntax` (use `import type` for
  type-only imports), `noUnusedLocals`/`noUnusedParameters`, and
  `erasableSyntaxOnly` (no `enum` — use `const` objects + union types).
- **No test runner and no formatter** are configured.

---

## Directory Structure

```
src/
  api/          # Axios client + per-entity service modules
  assets/       # Static assets (icons/images)
  components/
    ui/         # Reusable primitive UI components (shadcn-style)
    layout/     # Sidebar, MainLayout, ProtectedRoute
  lib/          # Shared utilities (cn, dateUtils)
  pages/        # One file per route
  store/        # Zustand stores (auth only)
  types/        # TypeScript interfaces mirroring backend DTOs
  App.tsx       # Route definitions
  main.tsx      # Application entrypoint
```

### Detailed breakdown

| Path                         | Purpose                                              |
| ---------------------------- | ---------------------------------------------------- |
| `src/main.tsx`               | Entrypoint: mounts `<App/>` inside `<ErrorBoundary/>`. |
| `src/App.tsx`                | Route table (`BrowserRouter` + `Routes`).            |
| `src/api/client.ts`          | Shared Axios instance + request/response interceptors. |
| `src/api/*.ts`               | One service per entity (`transaction`, `category`, `debt`, `payment`, `user`). |
| `src/types/index.ts`         | All DTO interfaces mirroring the backend.            |
| `src/store/auth.ts`          | Zustand store for authentication (token + user).    |
| `src/components/layout/*`    | `Sidebar`, `MainLayout`, `ProtectedRoute`.           |
| `src/components/ui/*`        | Reusable primitives (button, card, dialog, table, …). |
| `src/pages/*`                | Route-level components (Login, Register, Dashboard, Transactions, Categories, Debts, Profile). |
| `src/lib/`                   | `cn()` class merger and `dateUtils`.                 |
| `src/index.css`              | Tailwind `@theme` tokens and global styles.          |

---

## Routing

Routes are defined in `src/App.tsx`:

| Path           | Component    | Access     |
| -------------- | ------------ | ---------- |
| `/login`       | `LoginPage`  | Public     |
| `/register`    | `RegisterPage` | Public   |
| `/`            | `DashboardPage` | Protected |
| `/transactions`| `TransactionsPage` | Protected |
| `/categories`  | `CategoriesPage` | Protected |
| `/debts`       | `DebtsPage`  | Protected |
| `/profile`     | `ProfilePage` | Protected |
| `*`            | `Navigate to /` | —       |

Protected routes are wrapped in `ProtectedRoute` which renders `MainLayout`
(with the `Sidebar`). `ProtectedRoute` shows a loading spinner while the auth
store initializes and redirects to `/login` if unauthenticated.

---

## Data Flow

### API client (`src/api/client.ts`)

- Reads the base URL from `import.meta.env.VITE_API_URL`.
  - **Dev**: `.env` → `http://localhost:8080`
  - **Prod**: `.env.production` → `https://expense-manager-new.onrender.com`
- **Request interceptor**: injects `Authorization: Bearer <token>` from
  `localStorage` when a token exists.
- **Response interceptor**: on `401`, clears `localStorage` and redirects to
  `/login`.

### Service modules (`src/api/*.ts`)

Each module exposes a small object (e.g. `transactionApi`, `debtApi`) with
async methods (`insert`, `getAll`, `getById`, `update`, `delete`) that call
`apiClient` and unwrap the `response.data`. Components call these services
directly (there is no separate "repository/query" abstraction layer).

Typical flow:

```
Page component
  → api/<entity>.ts service
    → api/client.ts (axios, interceptors)
      → Spring Boot backend
```

### Types (`src/types/index.ts`)

TypeScript interfaces mirror the backend DTOs (e.g. `TransactionRequestDTO`,
`TransactionResponseDTO`, `DebtResponseDTO`, `PaymentRequestDTO`). These are
used both as the contract for API calls and as component state types.

---

## State Management

Zustand is used for **auth only** (`src/store/auth.ts`). The store holds:

- `token` and `user` (persisted to `localStorage`)
- `isAuthenticated`, `isLoading`, `initializing`, `error`
- Actions: `login`, `register`, `logout`, `fetchProfile`, `updateProfile`,
  `deleteAccount`, `clearError`

All other page state (form fields, lists, dialogs, filters, pagination) is
local `useState`/`useEffect` within the page components. There is no global
store for domain data.

---

## UI Components

Located in `src/components/ui/`. They follow the shadcn/ui pattern:

- **CVA variants** (class-variance-authority) for `button`, `badge`, etc.
- **`cn()` utility** (`src/lib/utils.ts`) merging `clsx` + `tailwind-merge`.
- `forwardRef` on primitives where appropriate.

Available components: `avatar`, `badge`, `button`, `card`, `dialog`,
`dropdown-menu`, `input`, `label`, `pagination`, `select`, `separator`,
`table`, `textarea`, `toggle`.

These are hand-rolled (not installed via the shadcn CLI) and can be edited
directly.

---

## Styling (Tailwind v4, CSS-first)

- Theme tokens are defined **in CSS** via the `@theme` directive in
  `src/index.css`. There is **no `tailwind.config.js`**.
- Design system **"Candy"** (see `DESIGN.md`):
  - Primary: `#e040a0` (hot pink), Secondary: `#7c52aa` (purple),
    Tertiary: `#0096cc` (sky blue).
  - Pill-shaped radius (`9999px`) on buttons/inputs/badges; `16–20px` on
    cards.
  - Bouncy animations: `.animate-bounce-in`, `.hover-bouncy`, and tinted
    shadows `.shadow-primary/secondary/tertiary`.
- Font: **DM Sans** (loaded from Google Fonts in `index.html`).

---

## Page Details

- **Dashboard**: gathers transactions (with FIXED repeating ones merged by
  month), debts, and categories; renders stat cards, balance, two Pie charts
  (income/expenses per category), recent transactions, and quick actions. The
  "Deuda restante" card cycles through remaining debts on click.
- **Transactions**: paginated + filterable table with create/edit/delete
  dialogs. Guards against creating without any existing category.
- **Categories**: list with create/edit/delete.
- **Debts**: expandable debt cards; each expanded debt shows a **paginated**
  payments table (first page from `GET /debt/{id}`, with a "Página 1 de N"
  indicator). Payments support create/edit/delete and an "automatic payment"
  toggle.
- **Profile**: view/edit profile and delete account.
- **Login / Register**: public auth pages wired to the auth store.

---

## Known Backend Integration Notes

- **Date format**: backend expects `dd-MM-yyyy`; `HTML <input type="date">`
  sends `yyyy-MM-dd`. Use `src/lib/dateUtils.ts` (`toBackendDate` /
  `fromBackendDate`) where conversion is needed.
- **Transaction types**: only `INCOME` is reliably accepted; `EXPENSE` returns
  an error.
- **Transaction subtypes**: only `FIXED` and `VARIABLE` accepted.
- **Debts**: backend fields are paginated; `DebtResponseDTO.payments` is a
  `PagePaymentResponseDTO` (first page only).
- **Auth errors (403)**: can return an empty body, causing JSON parse errors.
  The response interceptor only handles `401`.
- All UI text is Spanish; currency is Euros (`€`).

---

## Build / Lint / Deploy

```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # tsc -b && vite build (typecheck THEN bundle)
npm run lint       # oxlint (NOT eslint)
npm run preview    # Vite preview of production build
```

**Deploy**: the SPA is hosted on Vercel. `vercel.json` contains an SPA rewrite
(`/(.*)` → `/index.html`) so client-side routes work on refresh. The backend
is a separate Spring Boot app on Render.
