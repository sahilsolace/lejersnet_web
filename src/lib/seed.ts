import type {
  User,
  Block,
  Subscription,
  Order,
  Address,
  Inspection,
  MediaItem,
  CategoryId,
  MoveType,
} from '@/types';

export const SEED_USER: User = {
  id: 'u_001',
  wix_member_id: 'wix_7c2f91',
  name: 'Sofie Larsen',
  email: 'sofie.larsen@example.com',
  avatar:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&h=240&fit=crop&crop=faces',
  bio: 'Tenant in Copenhagen. Love a tidy home and clear paperwork.',
  plan: 'member',
  privacy: 'public',
  username: 'sofie',
  synced_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
};

export const SEED_BLOCKS: Block[] = [
  {
    id: 'b_001',
    blocked_user_id: 'u_009',
    blocked_name: 'Nikolaj Berg',
    blocked_email: 'nikolaj.berg@example.com',
    blocked_avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

export const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 's_001',
    plan_name: 'LejersNet Membership',
    status: 'active',
    amount_dkk: 49,
    started_at: '2026-08-12T10:00:00.000Z',
    renews_at: '2026-11-12T10:00:00.000Z',
  },
];

export const SEED_ORDERS: Order[] = [
  {
    id: 'o_001',
    number: 'ORD-2026-00184',
    date: '2026-08-12T10:04:00.000Z',
    amount_dkk: 49,
    status: 'paid',
    payment_method: 'Visa •••• 4242',
    items: [
      { description: 'LejersNet Membership – Monthly', amount_dkk: 49 },
    ],
  },
  {
    id: 'o_002',
    number: 'ORD-2026-00211',
    date: '2026-09-12T10:04:00.000Z',
    amount_dkk: 49,
    status: 'paid',
    payment_method: 'Visa •••• 4242',
    items: [
      { description: 'LejersNet Membership – Monthly', amount_dkk: 49 },
    ],
  },
];

export const SEED_ADDRESSES: Address[] = [
  {
    id: 'a_001',
    title: 'City Studio',
    street: 'Vesterbrogade 12, 3. tv',
    city: 'Copenhagen',
    postcode: '1620',
    status: 'active',
  },
  {
    id: 'a_002',
    title: 'Family Flat',
    street: 'Strandvejen 88, 1.',
    city: 'Charlottenlund',
    postcode: '2920',
    status: 'previous',
  },
];

export const SEED_INSPECTIONS: Inspection[] = [
  {
    id: 'i_001',
    address_id: 'a_001',
    type: 'MOVE_IN',
    date: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'i_002',
    address_id: 'a_001',
    type: 'MOVE_OUT',
    date: '2026-09-28T09:00:00.000Z',
  },
  {
    id: 'i_003',
    address_id: 'a_002',
    type: 'MOVE_IN',
    date: '2025-02-01T09:00:00.000Z',
  },
];

export const SEED_MEDIA: MediaItem[] = [
  {
    id: 'm_001',
    inspection_id: 'i_001',
    category_id: 'living_room',
    kind: 'PICTURE',
    name: 'Living room – overview.jpg',
    file_url:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d029?w=1200&h=800&fit=crop',
    thumb_url:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d029?w=400&h=300&fit=crop',
    size_bytes: 820_000,
    taken_at: '2026-08-15T09:05:00.000Z',
  },
  {
    id: 'm_002',
    inspection_id: 'i_001',
    category_id: 'living_room',
    kind: 'PICTURE',
    name: 'Living room – corner.jpg',
    file_url:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    thumb_url:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
    size_bytes: 745_000,
    taken_at: '2026-08-15T09:06:00.000Z',
  },
  {
    id: 'm_003',
    inspection_id: 'i_001',
    category_id: 'kitchen',
    kind: 'PICTURE',
    name: 'Kitchen – counter.jpg',
    file_url:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=800&fit=crop',
    thumb_url:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    size_bytes: 690_000,
    taken_at: '2026-08-15T09:10:00.000Z',
  },
  {
    id: 'm_004',
    inspection_id: 'i_001',
    category_id: 'lease_contract',
    kind: 'DOCUMENT',
    name: 'Lease Agreement 2026.pdf',
    file_url: '#mock-lease-2026.pdf',
    thumb_url: '#mock-lease-2026.pdf',
    size_bytes: 240_000,
    taken_at: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 'm_005',
    inspection_id: 'i_002',
    category_id: 'living_room',
    kind: 'PICTURE',
    name: 'Move-out living room.jpg',
    file_url:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop',
    thumb_url:
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop',
    size_bytes: 760_000,
    taken_at: '2026-09-28T09:04:00.000Z',
  },
  {
    id: 'm_006',
    inspection_id: 'i_003',
    category_id: 'bathroom',
    kind: 'PICTURE',
    name: 'Bathroom – Family Flat.jpg',
    file_url:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&h=800&fit=crop',
    thumb_url:
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop',
    size_bytes: 510_000,
    taken_at: '2025-02-01T09:20:00.000Z',
  },
  {
    id: 'm_007',
    inspection_id: 'i_003',
    category_id: 'lease_contract',
    kind: 'DOCUMENT',
    name: 'Old Lease 2025.pdf',
    file_url: '#mock-old-lease.pdf',
    thumb_url: '#mock-old-lease.pdf',
    size_bytes: 188_000,
    taken_at: '2025-02-01T09:00:00.000Z',
  },
];

// Move-In inspection for City Studio: still missing Bathroom, Bedroom, Balcony, Keys/Meters, Other docs
export const MISSED_FOR_INSPECTION_I001: CategoryId[] = [
  'bathroom',
  'bedroom',
  'balcony',
  'keys_meters',
  'other_documents',
];

export const newId = (prefix = 'id') =>
  `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const moveTypeLabel = (t: MoveType) =>
  t === 'MOVE_IN' ? 'Move-In' : 'Move-Out';
