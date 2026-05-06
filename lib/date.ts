/**
 * Returns YYYY-MM-DD for the local date.
 */
export function isoDate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfWeek(d: Date = new Date()): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-based
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isToday(iso: string): boolean {
  return iso.slice(0, 10) === isoDate();
}

export function isThisWeek(iso: string): boolean {
  const d = new Date(iso);
  return d >= startOfWeek();
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}
