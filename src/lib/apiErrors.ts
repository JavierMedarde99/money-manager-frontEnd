interface AxiosLikeError {
  response?: { data?: { message?: string } };
}

/**
 * The backend sometimes answers with technical English messages (e.g. Jackson
 * enum parsing: "invalid value for type not found of Type"). Those look like
 * the user's fault, so we map the ones we know to friendly Spanish and never
 * echo an unknown raw message into the UI.
 */
const KNOWN_BACKEND_MESSAGES: Record<string, string> = {
  "invalid value for type not found of type":
    "Ese tipo de transacción todavía no está disponible.",
  "invalid value for subtype not found of subtype":
    "Ese subtipo de transacción todavía no está disponible.",
  "invalid date format, expected yyyy-mm-dd":
    "La fecha no tiene un formato válido.",
};

/**
 * Returns a friendly, user-facing message for an API failure.
 * `fallback` is used when the backend sent no message or an unknown one.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const raw = (error as AxiosLikeError | null)?.response?.data?.message;
  if (!raw) return fallback;

  const normalized = raw.trim().toLowerCase().replace(/\.$/, "");
  for (const [key, message] of Object.entries(KNOWN_BACKEND_MESSAGES)) {
    if (normalized === key || normalized.includes(key)) return message;
  }
  return fallback;
}
