# Money Manager

Frontend de aplicación de gestión de finanzas personales. React + Vite + TypeScript, conecta con un backend Spring Boot.

## Funcionalidades

- **Dashboard**: Resumen financiero con ingresos/gastos totales, balance neto, deuda restante, transacciones recientes y gráfico mensual de ingresos vs gastos.
- **Transacciones**: CRUD completo con tabla paginada, filtros por tipo/subtipo/fecha, y formulario con validación. Soporta tipos INCOME/EXPENSE y subtipos FIXED/VARIABLE.
- **Categorías**: CRUD completo con selector de color. Validación de nombre y color.
- **Deudas**: CRUD completo con progreso de pago visual (barra + porcentaje), sistema de pagos vinculados, y fechas de inicio/fin.
- **Autenticación**: Login y registro con validación (Zod), JWT Bearer token, persistencia en localStorage, y auto-logout en 401.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 |
| Bundler | Vite 8 |
| Lenguaje | TypeScript 6 (strict) |
| Estilos | Tailwind CSS v4 (CSS-first config) |
| Estado | Zustand 5 |
| HTTP | Axios |
| Validación | Zod |
| Router | React Router DOM 7 |
| Iconos | Lucide React |
| Linting | Oxlint |

## Instalación y ejecución

```bash
npm install
npm run dev      # http://localhost:5173
```

## Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Typecheck + build de producción
npm run lint     # Linting con oxlint
npm run preview  # Preview del build de producción
```

## Arquitectura

```
src/
  api/           # Cliente Axios + servicios por entidad (user, transaction, category, debt, payment)
  store/         # Zustand store (auth)
  components/
    ui/          # Componentes UI reutilizables (button, card, dialog, input, select, table, etc.)
    layout/      # Sidebar, MainLayout, ProtectedRoute
    data-table/  # Componente de tabla de datos genérico
  pages/         # Una página por ruta: Login, Register, Dashboard, Transactions, Categories, Debts
  types/         # Interfaces TypeScript que espejan los DTOs del backend
  lib/           # Utilidades (cn(), dateUtils)
```

## Rutas

| Ruta | Descripción | Protegida |
|---|---|---|
| `/login` | Inicio de sesión | No |
| `/register` | Registro de usuario | No |
| `/` | Dashboard | Sí |
| `/transactions` | Gestión de transacciones | Sí |
| `/categories` | Gestión de categorías | Sí |
| `/debts` | Gestión de deudas y pagos | Sí |

## Backend API

El backend está desplegado en `https://expense-manager-new.onrender.com`. Documentación Swagger disponible en `/swagger-ui/index.html`.

La URL se configura por variables de entorno:
- **Desarrollo** (`.env`): `http://localhost:8080`
- **Producción** (`.env.production`): `https://expense-manager-new.onrender.com`

## Diseño

Sistema "Candy" definido en `DESIGN.md`: colores saturados (rosa `#e040a0`, púrpura `#7c52aa`, azul `#0096cc`), formas pill, animaciones bouncy, fuente DM Sans.

## TypeScript

Configuración estricta: `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`. Alias `@/` → `./src/`.
