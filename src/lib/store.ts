import { useEffect, useState, useCallback, useSyncExternalStore } from 'react';
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
import {
  SEED_USER,
  SEED_BLOCKS,
  SEED_SUBSCRIPTIONS,
  SEED_ORDERS,
  SEED_ADDRESSES,
  SEED_INSPECTIONS,
  SEED_MEDIA,
  newId,
} from './seed';

interface DB {
  user: User | null;
  isAuthenticated: boolean;
  blocks: Block[];
  subscriptions: Subscription[];
  orders: Order[];
  addresses: Address[];
  inspections: Inspection[];
  media: MediaItem[];
}

const STORAGE_KEY = 'lejersnet_db_v1';

const initialDB: DB = {
  user: null,
  isAuthenticated: false,
  blocks: SEED_BLOCKS,
  subscriptions: SEED_SUBSCRIPTIONS,
  orders: SEED_ORDERS,
  addresses: SEED_ADDRESSES,
  inspections: SEED_INSPECTIONS,
  media: SEED_MEDIA,
};

function load(): DB {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialDB, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return initialDB;
}

let db: DB = load();
const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((l) => l());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

const getSnapshot = () => db;

const update = (mut: (d: DB) => void) => {
  db = { ...db };
  mut(db);
  emit();
};

// ---- Auth (mock Wix Members API adapter) ----
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

export const authApi = {
  async signIn(email: string, _password: string): Promise<User> {
    await delay();
    if (!email || !email.includes('@')) throw new Error('Enter a valid email.');
    update((d) => {
      d.user = { ...SEED_USER, email };
      d.isAuthenticated = true;
    });
    return db.user!;
  },
  async signUp(name: string, email: string, _password: string): Promise<User> {
    await delay();
    if (!name.trim()) throw new Error('Please enter your name.');
    if (!email.includes('@')) throw new Error('Enter a valid email.');
    update((d) => {
      d.user = {
        ...SEED_USER,
        name,
        email,
        username: name.toLowerCase().replace(/\s+/g, ''),
        plan: 'free',
        avatar: undefined,
        bio: '',
      };
      d.isAuthenticated = true;
      d.subscriptions = [];
    });
    return db.user!;
  },
  async social(provider: 'google' | 'facebook'): Promise<User> {
    await delay(600);
    const map = {
      google: { name: 'Sofie Larsen (Google)', email: 'sofie@gmail.com' },
      facebook: { name: 'Sofie Larsen (Facebook)', email: 'sofie@facebook.com' },
    } as const;
    update((d) => {
      d.user = { ...SEED_USER, ...map[provider] };
      d.isAuthenticated = true;
    });
    return db.user!;
  },
  async forgotPassword(_email: string): Promise<void> {
    await delay();
  },
  async resetPassword(_token: string, _password: string): Promise<void> {
    await delay();
  },
  async signOut(): Promise<void> {
    update((d) => {
      d.isAuthenticated = false;
      d.user = null;
    });
  },
  async refreshFromWix(): Promise<User> {
    await delay(700);
    update((d) => {
      if (d.user) d.user.synced_at = new Date().toISOString();
    });
    return db.user!;
  },
};

export const profileApi = {
  updateProfile(patch: Partial<User>) {
    update((d) => {
      if (d.user) d.user = { ...d.user, ...patch };
    });
  },
  changeEmail(email: string) {
    update((d) => {
      if (d.user) d.user.email = email;
    });
  },
  changePassword() {
    /* mock – would call Wix */
  },
  setPrivacy(privacy: 'private' | 'public') {
    update((d) => {
      if (d.user) d.user.privacy = privacy;
    });
  },
};

export const blockApi = {
  unblock(id: string) {
    update((d) => {
      d.blocks = d.blocks.filter((b) => b.id !== id);
    });
  },
  add(block: Omit<Block, 'id' | 'created_at'>) {
    update((d) => {
      d.blocks = [
        ...d.blocks,
        { ...block, id: newId('b'), created_at: new Date().toISOString() },
      ];
    });
  },
};

export const addressApi = {
  add(data: Omit<Address, 'id'>) {
    const id = newId('a');
    update((d) => {
      d.addresses = [...d.addresses, { ...data, id }];
    });
    return id;
  },
  update(id: string, patch: Partial<Address>) {
    update((d) => {
      d.addresses = d.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a));
    });
  },
  remove(id: string) {
    update((d) => {
      const insp = d.inspections.filter((i) => i.address_id === id);
      d.media = d.media.filter((m) => !insp.some((i) => i.id === m.inspection_id));
      d.inspections = d.inspections.filter((i) => i.address_id !== id);
      d.addresses = d.addresses.filter((a) => a.id !== id);
    });
  },
};

export const inspectionApi = {
  ensure(addressId: string, type: MoveType): string {
    const existing = db.inspections.find(
      (i) => i.address_id === addressId && i.type === type
    );
    if (existing) return existing.id;
    const id = newId('i');
    update((d) => {
      d.inspections = [
        ...d.inspections,
        { id, address_id: addressId, type, date: new Date().toISOString() },
      ];
    });
    return id;
  },
};

export const mediaApi = {
  addMany(items: Omit<MediaItem, 'id'>[]): MediaItem[] {
    const created: MediaItem[] = items.map((it) => ({ ...it, id: newId('m') }));
    update((d) => {
      d.media = [...d.media, ...created];
    });
    return created;
  },
  remove(id: string) {
    update((d) => {
      d.media = d.media.filter((m) => m.id !== id);
    });
  },
  byInspection(inspectionId: string) {
    return db.media.filter((m) => m.inspection_id === inspectionId);
  },
  categoriesForInspection(inspectionId: string): CategoryId[] {
    const set = new Set(
      db.media
        .filter((m) => m.inspection_id === inspectionId)
        .map((m) => m.category_id)
    );
    return Array.from(set) as CategoryId[];
  },
};

export const subscriptionApi = {
  create(planName: string, amount: number): Subscription {
    const now = new Date();
    const renew = new Date(now);
    renew.setMonth(renew.getMonth() + 1);
    const sub: Subscription = {
      id: newId('s'),
      plan_name: planName,
      status: 'active',
      amount_dkk: amount,
      started_at: now.toISOString(),
      renews_at: renew.toISOString(),
    };
    update((d) => {
      d.subscriptions = [sub, ...d.subscriptions];
      if (d.user) d.user.plan = 'member';
    });
    return sub;
  },
  cancel(id: string) {
    update((d) => {
      d.subscriptions = d.subscriptions.map((s) =>
        s.id === id
          ? { ...s, status: 'cancelled', ends_at: new Date().toISOString() }
          : s
      );
      if (d.user) d.user.plan = 'free';
    });
  },
};

export const orderApi = {
  create(planName: string, amount: number, method: string): Order {
    const order: Order = {
      id: newId('o'),
      number: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      amount_dkk: amount,
      status: 'paid',
      payment_method: method,
      items: [{ description: `${planName} – Monthly`, amount_dkk: amount }],
    };
    update((d) => {
      d.orders = [order, ...d.orders];
    });
    return order;
  },
};

// ---- Hooks ----
export function useDB() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useAuth() {
  const { user, isAuthenticated } = useDB();
  return { user, isAuthenticated };
}

// forceReset used by auth gate
export function useForceUpdate() {
  const [, setN] = useState(0);
  return useCallback(() => setN((n) => n + 1), []);
}

// Touch on mount to ensure store is loaded
export function useInitStore() {
  useEffect(() => {
    if (!db) db = load();
  }, []);
}
