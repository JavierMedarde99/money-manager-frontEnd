# SDD — Página de Ahorros (integración `GET /savings`)

- **Fecha:** 2026-10-07
- **Estado:** RESUELTA — respuestas incorporadas en §7; **pendiente de aprobación** para pasar a `writing-plans`
- **Issue:** #121
- **Refs:**
  - Swagger UI: https://expense-manager-new.onrender.com/swagger-ui/index.html
  - OpenAPI JSON: https://expense-manager-new.onrender.com/v3/api-docs
  - `DESIGN.md` (design system "Candy 2.0"), `ARCHITECTURE.md`, `AGENTS.md`

---

## 1. Objetivo

Añadir una nueva página protegida para **ver los ahorros** del usuario, alimentada por la nueva integración del backend `GET /savings`, que devuelve el ahorro mensual agregado (ingresos, gastos y ahorro por año/mes).

El backend expone **solo lectura**: no hay endpoints de creación/edición/borrado de ahorros. La primera versión es, por tanto, una página de visualización (Q-08).

## 2. Análisis de la API nueva

### 2.1 Endpoint

| Método | Ruta | Operación | Parámetros | Respuesta |
|---|---|---|---|---|
| `GET` | `/savings` | `getSavings` (controller: `savings-controller`) | ninguno | `200 → SavingsResponseDTO[]` |

Disponible en **desarrollo local y producción** (Q-18). El nuevo `GET /health` **no se usará en el frontend** (Q-21).

### 2.2 Schema `SavingsResponseDTO`

| Campo | Tipo | Notas |
|---|---|---|
| `year` | `integer (int32)` | Año del registro |
| `month` | `integer (int32)` | Mes **1–12** (Enero = 1) — confirmado (Q-01) |
| `totalIncome` | `number (double)` | Ingresos totales del mes |
| `totalExpense` | `number (double)` | Gastos totales del mes |
| `savings` | `number (double)` | Ahorro del mes = `totalIncome − totalExpense` (Q-02); **puede ser negativo** |

### 2.3 Observaciones

- **Solo lectura:** no existe `POST/PUT/DELETE /savings`.
- **Sin paginación, sin filtros, sin query params:** el `200` devuelve un array completo. A diferencia de `/debt/all` y `/transaction/all`, no hay `page`/`size`.
- **Sin `id`:** la identidad natural de un registro es `(year, month)`.
- **Cobertura:** solo devuelve meses con datos registrados (Q-03) y el **histórico completo** desde el inicio (Q-04) — un registro por `(year, month)`, sin duplicados (A5).
- Autenticación Bearer vía interceptor, igual que el resto de la API (Q-19).
- Mensajes de error en español y moneda EUR (€), según peculiaridades conocidas del backend.

## 3. Estado actual del frontend (patrones a seguir)

- **API:** módulos en `src/api/<entidad>.ts` que exportan un objeto `xxxApi` construido sobre `apiClient` (Axios) con `.get(...).then((res) => res.data)` — ver `src/api/category.ts`, `src/api/debt.ts`.
- **Tipos:** interfaces DTO espejo del backend en `src/types/index.ts` (usa `import type`, `verbatimModuleSyntax`).
- **Rutas:** en `App.tsx`, dentro del `Route` protegido (`ProtectedRoute` → `MainLayout`); catch-all `*` redirige a `/`.
- **Navegación:** array `navItems` en `src/components/layout/Sidebar.tsx` (`{ to, label, icon }`, iconos lucide).
- **Página:** componentes de layout Candy 2.0 — `PageHeader` (título/subtítulo/icono/acciones), `EmptyState` (vacíos), `CandyLoader` (carga), tabla con `src/components/ui/table`, tarjetas con `Card`.
- **Estilo:** Tailwind v4 CSS-first (`src/index.css`), radius píldora, animaciones `animate-bounce-in`/`animate-fade-up`, importes con `.toFixed(2)} €`.
- **Sin test runner ni formatter:** verificación con `npm run build` (tsc + vite) y `npm run lint` (oxlint) + prueba manual (Q-23).

## 4. Propuesta de diseño

### 4.1 Archivos

| Archivo | Acción | Contenido |
|---|---|---|
| `src/types/index.ts` | modificar | `SavingsResponseDTO { year; month; totalIncome; totalExpense; savings }` |
| `src/api/savings.ts` | crear | `savingsApi.getAll(): Promise<SavingsResponseDTO[]>` → `GET /savings` |
| `src/pages/Savings.tsx` | crear | Página `SavingsPage` |
| `src/App.tsx` | modificar | Ruta protegida `/savings` → `SavingsPage` |
| `src/components/layout/Sidebar.tsx` | modificar | Nav item `{ to: "/savings", label: "Ahorros", icon: PiggyBank }` (Q-13) |

### 4.2 Flujo de datos

```
mount ─→ savingsApi.getAll() ─→ setSavings([])
                │
                ├─ loading → <CandyLoader />
                ├─ error   → «Error al cargar los ahorros» (mensaje genérico, Q-20)
                └─ ok      → derivar en cliente:
                              • años disponibles = años únicos del array
                              • filtrar por año seleccionado (Q-09)
                              • ordenar por month 1–12 (Q-01)
                              • resúmenes: ahorro total, ingresos, gastos, media mensual
                              • tabla de meses del año
```

Todo el cálculo derivado se hace en cliente con `useState` local (Q-22), mismo patrón que el Dashboard; sin estado global.

### 4.3 UI (definitiva según respuestas)

1. `PageHeader` — título «Ahorros», subtítulo con el año seleccionado, icono `PiggyBank`, acciones = **selector de año** «← 2026 →» con botón «Hoy» (Q-09), análogo al selector de meses del Panel.
2. Fila de tarjetas `Card` resumen del año seleccionado: ahorro total, ingresos totales, gastos totales, media mensual del ahorro.
3. **Tabla única** de meses del año (año, mes, ingresos, gastos, ahorro) — nunca secciones por año (Q-17); solo aparecen los meses con datos (Q-03):
   - mes en curso con badge «Actual» (Q-16);
   - ahorro negativo en rojo (`text-primary`) con signo − (Q-15).
4. Estados: `CandyLoader` (carga), `EmptyState` (año sin datos), error con texto genérico + reintento (Q-20).
5. Sin gráfico de evolución (Q-12) ni exportación (Q-11).

### 4.4 Manejo de errores

- `401` → ya resuelto por el interceptor (auto-logout + redirect a `/login`).
- `403` con body vacío (problema conocido del backend) → **mensaje genérico en esta página**; el arreglo del interceptor queda como issue aparte (Q-20).
- Errores de red/500 → «Error al cargar los ahorros» con botón de reintento.

### 4.5 Verificación

- `npm run build` y `npm run lint` sin errores ni warnings nuevos.
- Prueba manual **contra producción** con datos reales (Q-24).
- **Cuadre con el Dashboard (Q-05):** para al menos un mes, comparar los totales de `/savings` con los que calcula el Panel (`Σ cantidad × precio`); si discrepan, es bug → investigar antes de cerrar.

## 5. Suposiciones explícitas

- **A1:** `GET /savings` responde en local y prod (confirmado, Q-18).
- **A2:** Los datos son **del usuario autenticado** (token vía interceptor), no globales (Q-07).
- **A3:** `savings` lo calcula el backend (`income − expense`, Q-02); el frontend solo lo lee y formatea.
- **A4:** La página es de solo lectura (Q-08; la API no permite escribir).
- **A5:** Un registro por `(year, month)`; no hay duplicados.
- **A6:** Campos no nulos — aún así, el acceso usa `??` defensivo (`?? 1`/`?? 0` solo donde aporte, aquí todos los campos son numéricos y se asumen presentes; Q-06).
- **A7:** Auth Bearer estándar sin roles especiales (Q-19).

## 6. Fuera de alcance (primera versión)

- Crear/editar/borrado de ahorros o metas (no hay endpoint; Q-08).
- **Migrar el Dashboard a `/savings`** — el Dashboard sigue calculando en cliente (Q-10); queda para un issue futuro si se decide.
- Exportación CSV/PDF (Q-11).
- Gráfico de evolución (Q-12).
- **`GET /health` no se usará nunca en el frontend** (Q-21).
- Arreglar el manejo de `403` con body vacío en el interceptor (Q-20 → issue aparte).
- Añadir test runner (Vitest) (Q-23).

## 7. Preguntas y respuestas

> Resueltas el 2026-10-07. Las no formuladas se resolvieron como supuestos (§5) o hechos de la API (§2).

### A. Semántica de datos

- **Q-01 — Convención de `month`:** → **1–12** (Enero = 1).
- **Q-02 — Fórmula de `savings`:** → **`totalIncome − totalExpense` exactamente**; puede venir negativo.
- **Q-03 — Cobertura temporal:** → **solo meses con datos** (no devuelve meses vacíos ni futuros).
- **Q-04 — Volumen y orden:** → **histórico completo**; el frontend ordena por `year`/`month` (con el filtro de año solo se pintan ≤ 12 filas).
- **Q-05 — Cuadre con el Dashboard:** → **sí, deben cuadrar** (misma fuente de verdad); discrepancia = bug → verificación explícita en QA (§4.5). Nota: `AGENTS.md` documenta que el backend rechaza `transactionType: EXPENSE` — validar con datos reales.
- **Q-06 — Nulos:** se asumen no nulos; acceso defensivo en código (A6).
- **Q-07 — Alcance por usuario:** → datos del usuario del token (A2).

### B. Alcance funcional

- **Q-08 — ¿Solo lectura?:** → **sí, solo lectura** en esta versión.
- **Q-09 — Selector de año:** → **selector de año** «← 2026 →» con botón «Hoy», análogo al del Panel; años disponibles derivados del array.
- **Q-10 — ¿Relación con el Dashboard?:** → **solo la página nueva**; el Dashboard no cambia.
- **Q-11 — Exportación:** → **no**.
- **Q-12 — Visualización:** → **solo tarjetas + tabla**; sin gráfico.

### C. UX / UI

- **Q-13 — Ruta, nombre e icono:** → **`/savings`**, etiqueta «Ahorros», icono `PiggyBank`, tras Deudas en el Sidebar.
- **Q-14 — Layout:** → tarjetas resumen + tabla (§4.3), según respuestas a Q-12/Q-17.
- **Q-15 — Ahorro negativo:** → **rojo (`text-primary`) con signo −**.
- **Q-16 — Mes actual:** → **destacar con badge «Actual»**.
- **Q-17 — Varios años:** → **tabla única** (nunca secciones por año); el año lo fija el selector.

### D. Integración técnica

- **Q-18 — Disponibilidad del endpoint:** → **ya responde en local y prod**.
- **Q-19 — Autenticación y roles:** → Bearer estándar como el resto (A7).
- **Q-20 — Manejo de errores 403:** → **mensaje genérico en la página**; el arreglo del interceptor es un issue aparte.
- **Q-21 — `/health`:** → **no se usará nunca en el frontend**.
- **Q-22 — Estado:** → **`useState` local**.

### E. Verificación y aceptación

- **Q-23 — Tests:** → **`npm run build` + `npm run lint` + prueba manual**; sin Vitest.
- **Q-24 — Entorno de prueba:** → **producción** con datos reales.
- **Q-25 — Criterios de aceptación:** se mantienen los propuestos: (1) la página lista los ahorros sin errores; (2) importes en € con formato español; (3) estados de carga/vacío/error cubiertos; (4) build y lint en verde; (5) navegación desde Sidebar. **+ (6) cuadre de un mes con el Dashboard** (Q-05).

## 8. Riesgos y peculiaridades conocidas

- **R1 — Consistencia de cifras:** Q-05 exige que cuadren; la verificación de cuadre es parte de la aceptación (§4.5). Riesgo residual si `totalExpense` del backend usa otra definición (p. ej. por el rechazo de `EXPENSE` en transacciones) → validar con datos reales en prod.
- **R2 — `EXPENSE` rechazado (AGENTS.md):** si el backend sigue rechazando transacciones de tipo `EXPENSE`, la semántica de `totalExpense` es sospechosa → comprobar durante el QA (vinculado a Q-05).
- **R3 — 403 con body vacío:** la página mostrará mensaje genérico; el arreglo del interceptor queda fuera (Q-20, issue aparte).
- **R4 — Histórico completo:** el array crece con el tiempo; al filtrar por año la tabla pinta ≤ 12 filas, pero la carga trae todo el histórico → si en el futuro crece mucho, valorar paginación/limit del backend.
- **R5 — Off-by-one de mes:** resuelto con Q-01 (1–12); usar `MONTH_NAMES[month - 1]` al renderizar.

## 9. Siguientes pasos

1. ~~Responder las preguntas de §7~~ ✔ (2026-10-07).
2. **Aprobar esta SDD** (revisión del usuario).
3. Invocar `writing-plans` para generar el plan de implementación (issue → rama → PR por cambio, según `AGENTS.md`).
