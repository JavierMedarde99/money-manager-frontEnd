export const UNAUTHORIZED_EVENT = "auth:unauthorized";

/**
 * Emitted by the axios response interceptor when the backend answers 401
 * (expired/invalid bearer token). Kept dependency-free so `api/client.ts`
 * can import it without creating a module cycle with the auth store.
 */
export function emitUnauthorized() {
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}
