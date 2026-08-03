export type Role = "ADMIN" | "SELLER" | "BIDDER";
export type AuctionStatus = "UPCOMING" | "ACTIVE" | "ENDED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar: string | null;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: string;
  sellerId: string;
  seller?: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
}

export interface Auction {
  id: string;
  startPrice: number;
  currentPrice: number;
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
  status: AuctionStatus;
  productId: string;
  title?: string;
  description?: string;
  image?: string | null;
  category?: string;
  sellerId?: string | null;
  seller?: UserSummary | null;
  bidCount?: number;
  product?: Product;
  bids?: Bid[];
  payments?: Payment[];
  watchlist?: Watchlist[];
  _count?: { bids: number };
  endingIn?: string;
  createdAt: string;
  updatedAt: string;
  createdDate?: string;
}

export interface Bid {
  id: string;
  amount: number;
  userId: string;
  user?: UserSummary;
  auctionId: string;
  auction?: Auction;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  userId: string;
  user?: UserSummary;
  auctionId: string;
  auction?: Auction;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  userId?: string;
  createdAt: string;
}

export interface Watchlist {
  id: string;
  userId: string;
  auctionId: string;
  auction?: Auction;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ReportSeriesItem {
  month: string;
  count?: number;
  amount?: number;
  auctions?: number;
  revenue?: number;
  users?: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalUsers: number;
  totalAuctions: number;
  totalRevenue: number;
  usersByRole: { role: Role; count: number }[];
  auctionsByStatus: { status: AuctionStatus; count: number }[];
  monthlyAuctions: ReportSeriesItem[];
  auctionsByMonth: ReportSeriesItem[];
  monthlyRevenue: ReportSeriesItem[];
  revenueByMonth: ReportSeriesItem[];
  totalPayments: number;
  totalBids: number;
}
