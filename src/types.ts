export type Tab = 'home' | 'documents' | 'pictures' | 'profile';

export type Plan = 'free' | 'member';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due';
export type OrderStatus = 'paid' | 'refunded' | 'failed';

export type Privacy = 'private' | 'public';

export type MoveType = 'MOVE_IN' | 'MOVE_OUT';

export type MediaKind = 'PICTURE' | 'DOCUMENT';

export type CategoryId =
  | 'living_room'
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'balcony'
  | 'keys_meters'
  | 'lease_contract'
  | 'other_documents';

export interface User {
  id: string;
  wix_member_id: string;
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  plan: Plan;
  privacy: Privacy;
  username: string;
  synced_at: string;
}

export interface Block {
  id: string;
  blocked_user_id: string;
  blocked_name: string;
  blocked_email: string;
  blocked_avatar?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  plan_name: string;
  status: SubscriptionStatus;
  amount_dkk: number;
  started_at: string;
  renews_at: string;
  ends_at?: string;
}

export interface OrderItem {
  description: string;
  amount_dkk: number;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  amount_dkk: number;
  status: OrderStatus;
  payment_method: string;
  items: OrderItem[];
}

export interface Address {
  id: string;
  title: string;
  street: string;
  city: string;
  postcode: string;
  status: 'active' | 'previous';
}

export interface Category {
  id: CategoryId;
  label: string;
  group: 'rooms' | 'documents';
}

export interface MediaItem {
  id: string;
  inspection_id: string;
  category_id: CategoryId;
  kind: MediaKind;
  name: string;
  file_url: string;
  thumb_url: string;
  size_bytes: number;
  taken_at: string;
}

export interface Inspection {
  id: string;
  address_id: string;
  type: MoveType;
  date: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  support_hours: string;
}
