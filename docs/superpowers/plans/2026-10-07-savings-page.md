# Página de Ahorros Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir la página `/savings` ("Ahorros") que muestra el ahorro mensual del usuario (selector de año, tarjetas resumen y tabla de meses) alimentada por `GET /savings`.

**Architecture:** Cliente API delgada (`savingsApi.getAll()`) + página de solo lectura con estado local (`useState`); toda la derivación (años, filtro, orden, totales) se calcula en cliente. Sin estado global, sin tocar el Dashboard, sin endpoints de escritura (la API solo expone `GET`).

**Tech Stack:** React + TypeScript (Vite), Tailwind CSS v4 (CSS-first), Axios, lucide-react, kit de componentes Candy locales (`PageHeader`, `EmptyState`, `CandyLoader`, `Card`, `Badge`, `Table`, `Button`).

**Spec:** `docs/superpowers/specs/2026-10-07-savings-page-design.md` (leer antes de implementar; §7 contiene las respuestas que fijan estos valores)

## Global Constraints

- Sin test runner ni formatter: cada verificación es `npm run build` (tsc -b && vite build) + `npm run lint` (oxlint) + revisión manual (Q-23).
- `month` es **1–12** (Enero = 1) → al renderizar: `MONTH_NAMES[s.month - 1]` (Q-01, R5).
- `savings = totalIncome − totalExpense` lo calcula el backend; el frontend solo lo lee/formatea (Q-02). Puede ser negativo.
- Importes en euros con `${valor.toFixed(2)} €`; textos de UI en español.
- `import type` obligatorio (`verbatimModuleSyntax`); sin enums (`erasableSyntaxOnly`); alias `@/` → `./src/`.
- Tailwind v4 sin `tailwind.config.js` (tokens en `src/index.css`); seguir `DESIGN.md` (Candy 2.0).
- Errores: 401 lo maneja el interceptor; ante cualquier fallo de carga, mensaje genérico «Error al cargar los ahorros» — **no modificar el interceptor de Axios** (Q-20).
- **No cambiar `src/pages/Dashboard.tsx`** (Q-10). **No usar `GET /health`** (Q-21). Sin exportación, sin gráfico, sin Vitest (Q-11/Q-12/Q-23).
- Workflow `AGENTS.md`: issue nuevo → rama `feat/...` desde `main` → commit(s) → push → PR que referencia el issue; **no hacer merge**.
- Precondición: el PR de la SDD (#122) mergeado para que spec y plan viajen en `main`.

## Review Focus

No hay test runner: cada línea lleva su paso de verificación nominal en la tarea que posee el código.

1. **Off-by-one de `month`** (1–12 vs índice) → mostraría el mes equivocado: paso manual T5 "etiqueta de mes correcta".
2. **Cuadre con el Panel** (Q-05, aceptación 6): totales de un mes iguales en Ambos: paso manual T6 "cuadre".
3. **Selector de años con datos incompletos**: clamping a `[minYear, maxYear]` y «Hoy» solo si el año actual tiene datos: paso manual T4.
4. **Fallo de red/403** → mensaje genérico con «Reintentar», nunca pantalla en blanco: paso manual T3.
5. **Ahorro negativo** → `text-primary` con signo −: paso manual T5.

---

### Task 1: Preparación (issue y rama)

**Files:** ninguno (workflow).

**Interfaces:**
- Consumes: —
- Produces: rama `feat/savings-page` desde `main` actualizado; issue de la feature.

- [ ] **Step 1: Crear el issue de la feature**

```bash
gh issue create --title "Página de Ahorros (integración GET /savings)" --body "Implementa la SDD aprobada (docs/superpowers/specs/2026-10-07-savings-page-design.md): página /savings con selector de año, tarjetas resumen y tabla de meses. Closes este issue al mergear."
```

- [ ] **Step 2: Crear la rama desde `main`**

Run: `git checkout main && git pull --ff-only && git checkout -b feat/savings-page`
Expected: rama creada desde el `main` más reciente (con la SDD mergeada).

- [ ] **Step 3: Verificar**

Run: `git branch --show-current`
Expected: `feat/savings-page`

### Task 2: Modelo y cliente API

**Files:**
- Modify: `src/types/index.ts` (añadir al final)
- Create: `src/api/savings.ts`

**Interfaces:**
- Consumes: `apiClient` de `src/api/client.ts` (Axios con interceptor Bearer).
- Produces: `SavingsResponseDTO { year: number; month: number; totalIncome: number; totalExpense: number; savings: number }` y `savingsApi.getAll(): Promise<SavingsResponseDTO[]>` — los usa la tarea 3.

- [ ] **Step 1: Añadir el tipo**

```ts
export interface SavingsResponseDTO {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  savings: number;
}
```

- [ ] **Step 2: Crear el módulo API** (patrón idéntico a `src/api/category.ts`)

```ts
import apiClient from "./client";
import type { SavingsResponseDTO } from "@/types";

export const savingsApi = {
  getAll(): Promise<SavingsResponseDTO[]> {
    return apiClient.get("/savings").then((res) => res.data);
  },
};
```

- [ ] **Step 3: Verificar build y lint**

Run: `npm run build && npm run lint`
Expected: build OK; lint sin warnings nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/api/savings.ts
git commit -m "feat(savings): añade modelo y cliente API de ahorros"
```

### Task 3: Página base (fetch, estados, ruta y navegación)

**Files:**
- Create: `src/pages/Savings.tsx`
- Modify: `src/App.tsx` (ruta)
- Modify: `src/components/layout/Sidebar.tsx` (nav item)

**Interfaces:**
- Consumes: `savingsApi.getAll()` (T2), `PageHeader`, `EmptyState`, `CandyLoader`.
- Produces: `export function SavingsPage()` montada en `/savings`; estados `savings`/`loading`/`error` que extienden las tareas 4 y 5.

- [ ] **Step 1: Crear `SavingsPage` con fetch y estados**

Estado: `savings: SavingsResponseDTO[]`, `loading: boolean`, `error: boolean`, y `fetchSavings` (con `useCallback`) que llama a `savingsApi.getAll()`; `useEffect([fetchSavings])` al montar. `catch → setError(true)`.

Render:
- `<CandyLoader />` si `loading`.
- Si `error`: `<p>Error al cargar los ahorros</p>` + `<Button onClick={fetchSavings}>Reintentar</Button>`.
- Si no: `<PageHeader title="Ahorros" subtitle="Tus ahorros mes a mes" icon={PiggyBank} />` y, si `savings.length === 0`, `<EmptyState icon={PiggyBank} title="Sin datos de ahorros" hint="Registra ingresos y gastos para ver tu ahorro aquí" />`.
- Contenedor raíz `className="animate-bounce-in space-y-8"` (patrón del Dashboard).

- [ ] **Step 2: Añadir la ruta en `src/App.tsx`** (tras `/debts`)

```tsx
<Route path="/savings" element={<SavingsPage />} />
```

- [ ] **Step 3: Añadir el nav item en `src/components/layout/Sidebar.tsx`** (tras Deudas, importar `PiggyBank` de lucide-react)

```ts
{ to: "/savings", label: "Ahorros", icon: PiggyBank },
```

- [ ] **Step 4: Verificar build y lint**

Run: `npm run build && npm run lint`
Expected: ambos en verde.

- [ ] **Step 5: Verificación manual — navegación y error (Review Focus 4)**

Run: `npm run dev` → login → Sidebar muestra «Ahorros» → `/savings` carga.
Expected: CandyLoader breve; datos o EmptyState. **Luego:** para el backend (o con la red caída) y recarga → mensaje «Error al cargar los ahorros» con «Reintentar», sin pantalla en blanco.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Savings.tsx src/App.tsx src/components/layout/Sidebar.tsx
git commit -m "feat(savings): página base con ruta y navegación"
```

### Task 4: Selector de año y tarjetas resumen

**Files:**
- Modify: `src/pages/Savings.tsx`

**Interfaces:**
- Consumes: `savings` de T3; patrón de selector de `PageHeader actions` del Dashboard (`Button` ghost + `ChevronLeft`/`ChevronRight` + botón «Hoy» `variant="outline"`).
- Produce: `selectedYear: number`, `yearMonths` (filtrado+ordenado), `totalSavings`/`totalIncome`/`totalExpense`/`avgSavings` — los consumen T3 (subtitle) y T5 (tabla).

- [ ] **Step 1: Implementar derivaciones (comportamiento exacto)**

```ts
const now = new Date();
const currentYear = now.getFullYear();
const yearsAsc = [...new Set(savings.map((s) => s.year))].sort((a, b) => a - b);
const [selectedYear, setSelectedYear] = useState<number | null>(null);
const year = selectedYear ?? (yearsAsc.includes(currentYear) ? currentYear : (yearsAsc.at(-1) ?? currentYear));
const yearMonths = savings.filter((s) => s.year === year).sort((a, b) => a.month - b.month);
const totalSavings = yearMonths.reduce((sum, s) => sum + s.savings, 0);
const totalIncome = yearMonths.reduce((sum, s) => sum + s.totalIncome, 0);
const totalExpense = yearMonths.reduce((sum, s) => sum + s.totalExpense, 0);
const avgSavings = yearMonths.length > 0 ? totalSavings / yearMonths.length : 0;
```

Navegación: `goToPrevYear`/`goToNextYear` **sin wrap**; clamping a `[yearsAsc[0], yearsAsc.at(-1)]` con botones `disabled` en los extremos (los años con datos no son circulares, a diferencia de los meses del Dashboard). «Hoy» visible solo si `yearsAsc.includes(currentYear) && year !== currentYear`, ejecuta `setSelectedYear(currentYear)`.

- [ ] **Step 2: Renderizar el selector en `PageHeader actions` y el subtitle dinámico**

`subtitle={`Resumen de ${year}`}`. Selector: botón ‹, `{year}` centrado (`min-w-[150px]`), botón ›, y «Hoy» según la regla del paso 1.

- [ ] **Step 3: Renderizar las 4 tarjetas**

Grid `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`; tarjeta: `<Card className="card-gloss"><CardContent className="p-5">` con etiqueta (`text-sm text-muted-foreground font-medium`) + valor (`font-display text-2xl font-bold`):

| Etiqueta | Valor | Icono | Color icono |
|---|---|---|---|
| Ahorro total | `totalSavings` | `PiggyBank` | `text-secondary` |
| Ingresos | `totalIncome` | `TrendingUp` | `text-tertiary` |
| Gastos | `totalExpense` | `TrendingDown` | `text-primary` |
| Media mensual | `avgSavings` | `Calculator` | `text-secondary` |

Todos como `${valor.toFixed(2)} €`.

- [ ] **Step 4: Verificar build y lint**

Run: `npm run build && npm run lint`
Expected: verde.

- [ ] **Step 5: Verificación manual — selector (Review Focus 3)**

En dev: cambiar de año → totales y tabla cambian; botones desactivados en min/max; «Hoy» solo aparece si el año actual tiene datos y regresa a él; sin datos → EmptyState.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Savings.tsx
git commit -m "feat(savings): selector de año y tarjetas resumen"
```

### Task 5: Tabla de meses (badge «Actual», negativos)

**Files:**
- Modify: `src/pages/Savings.tsx`

**Interfaces:**
- Consumes: `yearMonths`, `year`, `currentYear` y `now` (T4); `Table*` de `@/components/ui/table`, `Badge`, `cn` de `@/lib/utils`, `MONTH_NAMES` (const local, mismo array que el Dashboard).
- Produces: tabla final; `MONTH_NAMES[s.month - 1]` es la única forma de mapear el mes.

- [ ] **Step 1: Definir `MONTH_NAMES` local**

`["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]` (copia del Dashboard; sin extraer a util compartida — YAGNI).

- [ ] **Step 2: Renderizar la tabla**

Columnas: **Mes · Ingresos · Gastos · Ahorro** (sin columna Año: el año lo fija el selector, Q-17). Filas de `yearMonths` (orden: `month` asc, ya garantizado):

- Mes: `MONTH_NAMES[s.month - 1]`; si `s.year === currentYear && s.month === now.getMonth() + 1` → `<Badge variant="secondary" className="text-[10px]">Actual</Badge>` junto al nombre.
- Ingresos/Gastos: `${s.totalIncome.toFixed(2)} €` / `${s.totalExpense.toFixed(2)} €`.
- Ahorro: `${s.savings.toFixed(2)} €` con `className={cn("text-right font-semibold", s.savings < 0 && "text-primary")}` — `toFixed` ya pinta el signo −.
- Si `yearMonths.length === 0`: `<EmptyState icon={PiggyBank} title="Sin datos de ahorros" hint={`No hay registros para ${year}`} />`.

- [ ] **Step 3: Verificar build y lint**

Run: `npm run build && npm run lint`
Expected: verde.

- [ ] **Step 4: Verificación manual — meses y negativos (Review Focus 1 y 5)**

En dev: fila de octubre muestra «Octubre» (no septiembre/setiembre desplazado → off-by-one); el mes en curso lleva badge «Actual»; si hay algún registro con ahorro negativo, aparece en rojo con − (si en los datos de prueba no existe mes negativo, revisar la condición en código y anotarlo en el PR).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Savings.tsx
git commit -m "feat(savings): tabla de meses con badge de mes actual"
```

### Task 6: QA final, cuadre y PR

**Files:** ninguno nuevo (verificación) + PR.

**Interfaces:**
- Consumes: todas las tareas anteriores.
- Produces: PR abierto, sin merge.

- [ ] **Step 1: Verificación completa**

Run: `npm run build && npm run lint`
Expected: verde, sin warnings nuevos.

- [ ] **Step 2: Prueba manual contra producción (Q-24)**

Run: `VITE_API_URL=https://expense-manager-new.onrender.com npm run dev` → login con cuenta real → recorrer `/savings`: carga, selector de años, formatos €, badge «Actual», negativos, EmptyState en años sin datos, estados de error.

- [ ] **Step 3: Cuadre con el Dashboard (Q-05 / Review Focus 2)**

Elegir un mes con datos en ambos. En el Panel, anotar ingresos/gastos del mes (navegando al mes); en Ahorros, comparar las cifras del mismo mes.
Expected: **idénticas**. Si discrepan: no cerrar — investigar (R1/R2: definición de `totalExpense` o rechazo de `EXPENSE`) y documentarlo en el PR.

- [ ] **Step 4: Push y PR**

```bash
git push -u origin feat/savings-page
gh pr create --title "Feat: página de Ahorros (GET /savings)" --body "Closes #<issue de T1>. Implementa la SDD aprobada (spec en #122). Incluye verificación de cuadre con el Panel."
```

Expected: PR abierto; **no mergear** (lo revisa y mergea el usuario).
