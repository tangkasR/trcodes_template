// Zona waktu dikunci supaya hasil render server dan browser sama (tanpa hydration mismatch)
export function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}
