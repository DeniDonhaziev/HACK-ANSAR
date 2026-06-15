import { format, parseISO, isValid } from 'date-fns';

function toDate(date: string | Date): Date | null {
  if (!date) return null;
  if (date instanceof Date) return isValid(date) ? date : null;

  const trimmed = date.trim();
  if (!trimmed) return null;

  const iso = parseISO(trimmed);
  if (isValid(iso)) return iso;

  const loose = new Date(trimmed);
  return isValid(loose) ? loose : null;
}

export function formatDate(date: string | Date): string {
  const d = toDate(date);
  if (!d) return '—';
  return format(d, 'dd.MM.yyyy');
}

export function formatDateTime(date: string | Date): string {
  const d = toDate(date);
  if (!d) return '—';
  return format(d, 'dd.MM.yyyy HH:mm');
}

/** Нормализует ввод пользователя в ISO-строку */
export function normalizeToISO(date: string, fallbackYears = 1): string {
  const parsed = toDate(date);
  if (parsed) return parsed.toISOString();
  const fallback = new Date();
  fallback.setFullYear(fallback.getFullYear() + fallbackYears);
  return fallback.toISOString();
}

export function formatCurrency(amount: number, currency = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
