export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  STORE_OWNER: 'store_owner',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  store?: Store;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating?: number;
  totalRatings?: number;
  userRating?: { id: string; value: number } | null;
  owner?: { id: string; name: string; email: string };
  raters?: Rater[];
}

export interface Rater {
  id: string;
  name: string;
  email: string;
  rating: number;
  ratedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalNormal: number;
  totalStoreOwners: number;
  totalStores: number;
  totalRatings: number;
}
