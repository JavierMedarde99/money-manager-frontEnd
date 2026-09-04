# Money Manager FrontEnd

React + Vite + TypeScript frontend for a personal finance manager. Connects to a Spring Boot backend at `http://localhost:8080`.

## Instructions

Always use the correct mvp and clean code.
For every requested change, you must always create a brand new issue, branch, and PR; never reuse any closed ones. Do not apply changes directly. The PR will not be merged until it is approved, and only approved branches may be merged.

When the user asks for a change, the expected workflow is:
1. Create a GitHub issue describing the change.
2. Create a feature branch from `main` (e.g. `fix/login-error-messages`).
3. Make the changes, commit, and push.
4. Open a PR referencing the issue (e.g. `Closes #12`).
5. Do NOT merge the PR — the user will review and merge it.

Exception: the user may explicitly ask for a direct `main` commit (e.g. docs). Honor that override.

## Commands

```bash
npm run dev        # Vite dev server (port 5173)
npm run build      # tsc -b && vite build (typecheck THEN bundle — both must pass)
npm run lint       # oxlint (NOT eslint)
npm run preview    # Vite preview of production build
```

There is **no test runner** and **no formatter** configured.

## Path alias

`@/` maps to `./src/`. Works in both Vite and TypeScript via `vite.config.ts` resolve.alias and `tsconfig.app.json` paths.

## TypeScript strictness

- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `noUnusedLocals` / `noUnusedParameters` — unused code is a build error
- `erasableSyntaxOnly` — no `enum`, use `const` objects + union types instead
- Target: ES2023, JSX: react-jsx

## Dates — backend uses `dd-MM-yyyy`

The backend parses dates as `dd-MM-yyyy` (e.g. `19-08-2026`), but HTML
`<input type="date">` and the dashboard month selector produce `yyyy-MM-dd`.

- Import helpers from `src/lib/dateUtils.ts`: `toBackendDate()` (ISO → backend)
  and `fromBackendDate()` (backend → ISO). **Use `toBackendDate()` for any
  date sent to the API** (request bodies and `from`/`to` query params), or the
  backend rejects/fails to filter.
- Transaction create/update with an unconverted ISO date fails with
  `"invalid date format"`.
- The dashboard must pass `from`/`to` converted to `dd-MM-yyyy` — otherwise the
  month/year filter is ignored and transactions from all months appear together.

## Styling

Tailwind CSS **v4** with CSS-first config in `src/index.css` (`@theme` directive). There is **no `tailwind.config.js`** — all theme tokens are defined in CSS.

Design system "Candy" per `DESIGN.md`:
- Primary: `#e040a0` (hot pink), Secondary: `#7c52aa` (purple), Tertiary: `#0096cc` (sky blue)
- Pill-shaped radius (9999px) on buttons/inputs/badges, 16-20px on cards
- Bouncy animations: `.animate-bounce-in`, `.hover-bouncy`, `.shadow-primary/secondary/tertiary`
- Font: DM Sans (loaded from Google Fonts in `index.html`)

## UI components

Hand-rolled in `src/components/ui/` following shadcn/ui patterns (CVA variants, `cn()` utility, forwardRef). Not installed via shadcn CLI — edit directly.

Components: avatar, badge, button, card, dialog, dropdown-menu, input, label, pagination, select, separator, table, textarea, toggle.

The whole app mounts inside an `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) in `src/main.tsx`.

## Architecture

```
src/
  api/          # Axios client + per-entity service modules
  store/        # Zustand stores (auth only)
  components/   # ui/ (reusable), layout/ (Sidebar, MainLayout, ProtectedRoute), ErrorBoundary.tsx
  pages/        # One file per route: Login, Register, Dashboard, Transactions, Categories, Debts, Profile
  types/        # TypeScript interfaces mirroring backend DTOs
  lib/          # cn() utility + dateUtils (date conversion)
```

Routes (in `App.tsx`): `/login`, `/register` (public); `/`, `/transactions`, `/categories`, `/debts`, `/profile` (protected via `ProtectedRoute` → `MainLayout` with Sidebar).

Auth: Zustand store (`src/store/auth.ts`) persists token + user in `localStorage`. Axios interceptor injects `Authorization: Bearer` header. 401 responses auto-logout and redirect to `/login`.

## Backend API

The backend URL is configured via environment variables:
- **Dev** (`npm run dev`): uses `.env` → `http://localhost:8080`
- **Prod** (`npm run build`): uses `.env.production` → `https://expense-manager-new.onrender.com`

Source: `src/api/client.ts` reads `import.meta.env.VITE_API_URL`. Swagger: `https://expense-manager-new.onrender.com/swagger-ui/index.html`.

The backend has several known issues that affect the frontend:

- **Debts payments are paginated**: `GET /debt/all` and `GET /debt/{id}` accept `page`/`size` and `DebtResponseDTO.payments` is a `PagePaymentResponseDTO` (`{ content, page, size, totalElements, totalPages }`), not an array. However, `/debt/{id}` does **not** expose `page`/`size` for a single debt's payments, so the expanded table shows only the first page with a "Página 1 de N" indicator.
- **Transaction types**: Only `INCOME` is accepted. `EXPENSE` returns `"invalid value for type not found of Type"`. The frontend dropdown includes EXPENSE which will always fail.
- **Transaction subtypes**: Only `FIXED` and `VARIABLE` are accepted. `ONE_TIME` is rejected.
- **Payment fields**: `PaymentRequestDTO` requires `automaticPayment` (boolean). `PaymentResponseDTO` does not return it, so editing a payment resets it to `false`.
- **Auth errors (403)**: Return empty body — causes Axios JSON parse errors in the frontend. The response interceptor only handles 401.
- **Category create**: Returns `id: null` in the response (id only visible via `GET /category/all`).
- **Category delete**: Returns 409 if category has associated transactions.
- **Field name typo**: Backend uses `starDate` (not `startDate`) for debts (debt responses expose `startDate`; beware of mismatch).
- **All API text** in error messages and UI is Spanish. Currency is Euros (€).
