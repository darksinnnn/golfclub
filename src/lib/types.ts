// Database types matching our Supabase schema

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  country: string | null;
  handicap?: number | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionPlan = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'lapsed' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionPlan;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  charity_percentage: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  start_date: string;
  end_date: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  date_played: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  website: string | null;
  featured: boolean;
  total_raised: number;
  created_at: string;
  updated_at: string;
}

export interface UserCharity {
  id: string;
  user_id: string;
  charity_id: string;
  contribution_percentage: number;
  created_at: string;
  updated_at: string;
  charity?: Charity;
}

export type DrawStatus = 'pending' | 'simulated' | 'published';
export type DrawLogicType = 'random' | 'algorithmic';

export interface Draw {
  id: string;
  draw_date: string;
  month: number;
  year: number;
  status: DrawStatus;
  logic_type: DrawLogicType;
  winning_numbers: number[];
  total_entries: number;
  created_at: string;
  updated_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  numbers: number[];
  created_at: string;
}

export interface PrizePool {
  id: string;
  draw_id: string;
  total_pool: number;
  five_match_share: number;
  four_match_share: number;
  three_match_share: number;
  jackpot_rollover: number;
  active_subscribers: number;
  created_at: string;
}

export type MatchType = 3 | 4 | 5;
export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type PaymentStatus = 'pending' | 'paid';

export interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: MatchType;
  matched_numbers: number[];
  prize_amount: number;
  verification_status: VerificationStatus;
  proof_url: string | null;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  draw?: Draw;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'draw' | 'payment';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface Donation {
  id: string;
  user_id: string;
  charity_id: string;
  amount: number;
  stripe_payment_id: string | null;
  created_at: string;
  charity?: Charity;
}

// Pricing constants
export const PRICING = {
  monthly: { amount: 29.99, label: '$29.99/mo' },
  yearly: { amount: 299.99, label: '$299.99/yr', savings: '17%' },
} as const;

export const PRIZE_DISTRIBUTION = {
  5: 0.40, // 40% for 5-number match
  4: 0.35, // 35% for 4-number match
  3: 0.25, // 25% for 3-number match
} as const;
