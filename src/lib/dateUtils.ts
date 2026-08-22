export function toBackendDate(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}

export function fromBackendDate(backendDate: string): string {
  if (!backendDate) return "";
  const [d, m, y] = backendDate.split("-");
  return `${y}-${m}-${d}`;
}
