# SDD — Página de Ahorros (integración `GET /savings`)

- **Fecha:** 2026-10-07
- **Estado:** BORRADOR — pendiente de respuesta a las preguntas abiertas (§7)
- **Issue:** #121
- **Refs:**
  - Swagger UI: https://expense-manager-new.onrender.com/swagger-ui/index.html
  - OpenAPI JSON: https://expense-manager-new.onrender.com/v3/api-docs
  - `DESIGN.md` (design system "Candy 2.0"), `ARCHITECTURE.md`, `AGENTS.md`

---

## 1. Objetivo

Añadir una nueva página protegida para **ver los ahorros** del usuario, alimentada por la nueva integración del backend `GET /savings`, que devuelve el ahorro mensual agregado (ingresos, gastos y ahorro por año/mes).

El backend expone **solo lectura**: no hay endpoints de creación/edición/borrado de ahorros. La primera versión es, por tanto, una página de visualización.

## 2. Análisis de la API nueva

### 2.1 Endpoint

| Método | Ruta | Operación | Parámetros | Respuesta |
|---|---|---|---|---|
| `GET` | `/savings` | `getSavings` (controller: `savings-controller`) | ninguno | `200 → SavingsResponseDTO[]` |

También aparece un nuevo `GET /health` (`health-controller`) → `Map<string, string>`; fuera del alcance de esta página, ver Q-21.

### 2.2 Schema `SavingsResponseDTO`

| Campo | Tipo | Notas |
|---|---|---|
| `year` | `integer (int32)` | Año del registro |
| `month` | `integer (int32)` | Mes — **convención sin definir** (¿1–12 o 0–11?) → Q-01 |
| `totalIncome` | `number (double)` | Ingresos totales del mes |
| `totalExpense` | `number (double)` | Gastos totales del mes |
| `savings` | `number (double)` | Ahorro del mes — fórmula sin confirmar → Q-02 |

### 2.3 Observaciones

- **Solo lectura:** no existe `POST/PUT/DELETE /savings`.
- **Sin paginación, sin filtros, sin query params:** el `200` devuelve un array completo. A diferencia de `/debt/all` y `/transaction/all`, no hay `page`/`size`.
- **Sin `id`:** la identidad natural de un registro es `(year, month)`.
- No consta información de seguridad/schemes en el OpenAPI descargado; el resto de la API usa Bearer (ver Q-19).
- Mensajes de error en español y moneda EUR (€), según peculiaridades conocidas del backend.

## 3. Estado actual del frontend (patrones a seguir)

- **API:** módulos en `src/api/<entidad>.ts` que exportan un objeto `xxxApi` construido sobre `apiClient` (Axios) con `.get(...).then((res) => res.data)` — ver `src/api/category.ts`, `src/api/debt.ts`.
- **Tipos:** interfaces DTO espejo del backend en `src/types/index.ts` (usa `import type`, `verbatimModuleSyntax`).
- **Rutas:** en `App.tsx`, dentro del `Route` protegido (`ProtectedRoute` → `MainLayout`); catch-all `*` redirige a `/`.
- **Navegación:** array `navItems` en `src/components/layout/Sidebar.tsx` (`{ to, label, icon }`, iconos lucide).
- **Página:** componentes de layout Candy 2.0 — `PageHeader` (título/subtítulo/icono/acciones), `EmptyState` (vacíos), `CandyLoader` (carga), tabla con `src/components/ui/table`, tarjetas con `Card`.
- **Estilo:** Tailwind v4 CSS-first (`src/index.css`), radius píldora, animaciones `animate-bounce-in`/`animate-fade-up`, importes con `.toFixed(2)} €`.
- **Sin test runner ni formatter:** verificación con `npm run build` (tsc + vite) y `npm run lint` (oxlint) → Q-23.

## 4. Propuesta de diseño

> Sujeta a respuestas de §7; las opciones marcadas como «por defecto» son las recomendadas.

### 4.1 Archivos

| Archivo | Acción | Contenido |
|---|---|---|
| `src/types/index.ts` | modificar | `SavingsResponseDTO { year; month; totalIncome; totalExpense; savings }` |
| `src/api/savings.ts` | crear | `savingsApi.getAll(): Promise<SavingsResponseDTO[]>` → `GET /savings` |
| `src/pages/Savings.tsx` | crear | Página `SavingsPage` |
| `src/App.tsx` | modificar | Ruta protegida `/savings` → `SavingsPage` |
| `src/components/layout/Sidebar.tsx` | modificar | Nav item `{ to: "/savings", label: "Ahorros", icon: PiggyBank }` (icono provisional → Q-13) |

### 4.2 Flujo de datos

```
mount ─→ savingsApi.getAll() ─→ setSavings([])
                │
                ├─ loading → <CandyLoader />
                ├─ error   → mensaje de error en español (reintento)
                └─ ok      → derivar en cliente:
                              • filtrar por año seleccionado (si aplica, Q-09)
                              • ordenar por (year, month) (Q-04)
                              • resúmenes: ahorro total, media mensual…
                              • tabla/gráfico de evolución
```

Todo el cálculo derivado se hace en cliente (mismo patrón que el Dashboard); no hay estado global, solo `useState`/`useEffect` local → Q-22.

### 4.3 UI (por defecto, a confirmar con Q-14…Q-17)

1. `PageHeader` — título «Ahorros», subtítulo con año, icono, acciones (selector de año si aplica).
2. Fila de tarjetas `Card` resumen: ahorro total del periodo, ingresos, gastos, media mensual.
3. Tabla de meses (año, mes, ingresos, gastos, ahorro) usando `Table`, orden descendente por año/mes; ahorro negativo en color `text-primary` (rojo del tema) → Q-15.
4. Opcional: gráfico de barras/línea de evolución con `recharts` (ya en dependencias) → Q-12.
5. Estados: `CandyLoader` (carga), `EmptyState` (sin datos), mensaje de error con botón reintentar.

### 4.4 Manejo de errores

- `401` → ya resuelto por el interceptor (auto-logout + redirect a `/login`).
- `403` con body vacío → problema conocido del backend; el interceptor no lo maneja → Q-20.
- Errores de red/500 → mostrar texto de la API (español) o fallback «Error al cargar los ahorros».

### 4.5 Verificación

- `npm run build` y `npm run lint` sin errores/warnings nuevos.
- Prueba manual con backend corriendo (¿local o prod? → Q-24).
- Revisión de cálculos derivados con datos reales (cuadre con Dashboard → Q-05).

## 5. Suposiciones explícitas

- **A1:** El endpoint ya está desplegado y respondiendo tanto en prod como en `localhost:8080` (→ Q-18).
- **A2:** Los datos son **del usuario autenticado** (el token via interceptor), no globales.
- **A3:** `savings` lo calcula el backend; el frontend **no** recalcula (si cuadra con `totalIncome - totalExpense`, se valida en QA, no se reimplementa).
- **A4:** La página es de solo lectura en esta versión (la API no permite escribir).
- **A5:** Un registro por `(year, month)`; no hay duplicados.

## 6. Fuera de alcance (primera versión)

- Crear/editar/borrar ahorros o fijar metas (no hay endpoint).
- Modificar el Dashboard para usar `/savings` (pendiente de Q-10).
- Exportación CSV/PDF (pendiente de Q-11).
- Añadir test runner (Vitest) al proyecto (pendiente de Q-23).
- Consumir `GET /health` (pendiente de Q-21).

## 7. Preguntas abiertas (necesarias para implementar)

> Responder con el identificador (ej. «Q-01: 1–12»). Las secciones están ordenadas por bloqueo: cuanto antes se respondan, menos re-trabajo.

### A. Semántica de datos

- **Q-01 — Convención de `month`:** ¿el backend devuelve `month` en rango **1–12** (mes ES) o **0–11** (índice JS)? Afecta al nombre mostrado y a cualquier orden/filtrado. ¿Y `year` es siempre un año válido?
- **Q-02 — Fórmula de `savings`:** ¿es exactamente `totalIncome - totalExpense`? ¿O el backend descuenta además cuotas/pagos de deudas u otras consideraciones? ¿Puede venir **negativo** (mes con más gasto que ingreso)?
- **Q-03 — Cobertura temporal:** ¿el array incluye **solo meses con movimientos**, o también el mes actual a medio cerrar y **meses futuros** sin datos? ¿Incluye meses con ingresos/gastos a cero?
- **Q-04 — Volumen y orden:** ¿cuántos años de histórico devuelve (¿todo el histórico, limitado)? ¿Viene ordenado? ¿Qué orden devuelve y en qué orden debe mostrarlo la tabla? ¿Hace falta limitar/paginar en frontend?
- **Q-05 — Cuadre con el Dashboard:** ¿`totalIncome`/`totalExpense` de un mes coinciden con los totales que el Dashboard calcula en cliente (`Σ amount × price` de sus transacciones) para ese mismo mes? Hay que saberlo para evitar cifras contradictorias en la app (nota: `AGENTS.md` documenta que el backend ha rechazado `transactionType: EXPENSE` en transacciones — verificar cómo calcula `totalExpense`).
- **Q-06 — Nulos / campos opcionales:** ¿algún campo puede venir `null` o ausente (p. ej. un mes con solo ingresos), o son siempre números?
- **Q-07 — Alcance por usuario:** ¿`GET /savings` devuelve los ahorros **del usuario del token** o datos globales?

### B. Alcance funcional

- **Q-08 — ¿Solo lectura?:** confirma que la primera versión es solo visualización. ¿Hay previsión de metas/objetivos de ahorro que exijan diseño extensible (p. ej. clave de identidad `(year, month)` en el modelo)?
- **Q-09 — Selector de año:** ¿la página muestra **todos los años** a la vez, un año seleccionable (como el selector de meses del Dashboard), o solo el año actual?
- **Q-10 — ¿Relación con el Dashboard?:** ¿esta API debe **sustituir** los cálculos de ingresos/gastos/balance que hoy hace el Dashboard en cliente, o el Dashboard sigue como está y `/savings` se usa solo en la página nueva?
- **Q-11 — Exportación:** ¿hace falta exportar datos (CSV/PDF)?
- **Q-12 — Visualización:** ¿además de la tabla se quiere un **gráfico de evolución** (barras/línea, `recharts` ya instalado) y/o comparativa mes a mes? ¿Y KPIs destacados (mejor mes, media, tendencia)?

### C. UX / UI

- **Q-13 — Ruta, nombre e icono:** ¿`/savings` con etiqueta «Ahorros» e icono `PiggyBank` (lucide) en el Sidebar? ¿Otra ubicación o nombre?
- **Q-14 — Layout:** ¿tarjetas resumen + tabla + gráfico es correcto? ¿O se quiere otra composición (p. ej. solo tarjetas, o tarjetas por año)?
- **Q-15 — Ahorro negativo:** ¿cómo se muestra un mes con ahorro negativo («-12,50 €» en rojo/`text-primary`, aviso, icono)?
- **Q-16 — Mes actual:** ¿destacarse de alguna forma (badge «Actual», fila resaltada)?
- **Q-17 — Varios años:** si hay datos de múltiples años, ¿se agrupa por año (apartados/tablas) o se mezcla en una sola tabla con columna de año?

### D. Integración técnica

- **Q-18 — Disponibilidad del endpoint:** ¿`GET /savings` ya responde en **desarrollo local** (`localhost:8080`) y en **prod** (onrender)? Verificar antes de implementar; si solo está en prod, decidir contra qué entorno se desarrolla.
- **Q-19 — Autenticación y roles:** ¿requiere token como el resto? ¿Algún rol o restricción especial que pueda devolver 403?
- **Q-20 — Manejo de errores:** dado que el backend devuelve **403 con body vacío** (problema conocido que ya rompió el interceptor en otros flujos), ¿qué comportamiento esperamos? ¿Arreglar el interceptor en este issue (cambia alcance) o solo mostrar mensaje de error genérico?
- **Q-21 — `/health`:** ¿queremos usar el nuevo `GET /health` (p. ej. aviso de backend caído en la UI) o lo dejamos fuera?
- **Q-22 — Estado:** ¿solo estado local (`useState`) como el resto de páginas, o interesa cachear en Zustand (p. ej. si Dashboard y Ahorros van a compartir datos, según Q-10)?

### E. Verificación y aceptación

- **Q-23 — Tests:** con «no hay test runner» configurado, ¿conformes con verificar vía `npm run build` + `npm run lint` + prueba manual? ¿O quieres aprovechar para introducir Vitest (amplía alcance)?
- **Q-24 — Entorno de prueba:** ¿probamos contra backend local con datos sembrados, contra prod (¡con cuidado con datos reales!), o ambos?
- **Q-25 — Criterios de aceptación:** ¿estos criterios son válidos? (1) la página lista los ahorros sin errores; (2) los importes se muestran en € con formato español; (3) estados de carga/vacío/error cubiertos; (4) build y lint en verde; (5) navegación desde Sidebar. ¿Añades alguno más?

## 8. Riesgos y peculiaridades conocidas

- **R1 — Consistencia de cifras (Q-05):** mientras el Dashboard calcule en cliente y `/savings` en backend, pueden discrepar → decisión explícita requerida.
- **R2 — `EXPENSE` rechazado (AGENTS.md):** si el backend sigue rechazando transacciones de tipo `EXPENSE`, la semántica de `totalExpense` es sospechosa → validar con datos reales.
- **R3 — 403 con body vacío:** provoca errores de parseo en Axios (ya ocurrido); ampliar el interceptor es cambio de alcance (Q-20).
- **R4 — Array sin paginación:** si el histórico crece indefinidamente, la tabla puede crecer mucho → Q-04/Q-17.
- **R5 — Convención de mes (Q-01):** un off-by-one silencioso desplaza todos los nombres de mes → verificar con un dato real antes de maquetar.

## 9. Siguientes pasos

1. Responder las preguntas de §7 (o eliminar las irrelevantes).
2. Ajustar §4 con las respuestas y aprobar la SDD.
3. Invocar `writing-plans` para generar el plan de implementación (issue → rama → PR por change, según `AGENTS.md`).
