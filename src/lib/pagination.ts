export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100].map((n) => ({
  value: String(n),
  label: `${n}`,
}));

/**
 * Tamaño de página para listados que se necesitan completos (agregados del
 * Dashboard, listas sin UI de paginación).
 *
 * Algunos endpoints (p. ej. `GET /debt/all`) devuelven un array plano sin
 * `totalElements`, así que no se puede paginar de verdad; en su lugar se pide
 * una página grande de forma explícita, en vez de depender del default
 * silencioso del backend (`size = 10`).
 */
export const FETCH_ALL_SIZE = 200;
