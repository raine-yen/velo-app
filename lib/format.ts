export function formatNumber(value: number | null | undefined, fallback = '-'): string {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  return Math.round(value).toLocaleString();
}

export function formatHours(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${Math.round(value * 10) / 10}h`;
}

export function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '-';
  return `${Math.round(value)}m`;
}
