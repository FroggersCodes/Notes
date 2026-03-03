export function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date(new Date().toDateString());
}

export function isDueToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export function isDueSoon(dateStr: string): boolean {
  const due = new Date(dateStr);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
}

export function priorityColor(priority: 'low' | 'medium' | 'high'): string {
  return priority === 'high'
    ? 'text-red-600 bg-red-50'
    : priority === 'medium'
      ? 'text-yellow-600 bg-yellow-50'
      : 'text-green-600 bg-green-50';
}
