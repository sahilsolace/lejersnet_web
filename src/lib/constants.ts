import type { Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'living_room', label: 'Living Room', group: 'rooms' },
  { id: 'kitchen', label: 'Kitchen', group: 'rooms' },
  { id: 'bathroom', label: 'Bathroom', group: 'rooms' },
  { id: 'bedroom', label: 'Bedroom', group: 'rooms' },
  { id: 'balcony', label: 'Balcony', group: 'rooms' },
  { id: 'keys_meters', label: 'Keys / Meters', group: 'rooms' },
  { id: 'lease_contract', label: 'Lease Contract', group: 'documents' },
  { id: 'other_documents', label: 'Other Documents', group: 'documents' },
];

export const PLAN_PRICE_DKK = 49;

export const CONTACT = {
  email: 'info@lejersnet.com',
  phone: '+45 71 74 17 35',
  support_hours: 'Mon–Fri 10:00–14:00',
};

export const BRAND = {
  name: 'LejersNet',
  tagline: 'Take control of your tenancy – from the day you move in to the day you move out.',
  subtext: 'Store your lease, photos and important documents securely in one place for only 49 DKK per month.',
  website: 'lejersnet.com',
};

export const formatDKK = (n: number) =>
  new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(n);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export const moveTypeLabel = (t: 'MOVE_IN' | 'MOVE_OUT') =>
  t === 'MOVE_IN' ? 'Move-In' : 'Move-Out';

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
