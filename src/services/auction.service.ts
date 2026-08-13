import axiosInstance from "./api";
import type { Auction } from "@/types";

export type { Auction } from "@/types";

export interface CreateAuctionInput {
  productTitle: string;
  productDescription: string;
  productImage: string | null;
  category: string;
  startPrice: number;
  endTime: string;
  startTime?: string;
}

export interface UpdateAuctionInput {
  productTitle?: string;
  productDescription?: string;
  productImage?: string | null;
  category?: string;
  startPrice?: number;
  endTime?: string;
  startTime?: string;
}

export interface GetAuctionsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sellerId?: string;
  role?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export const getAuctions = async (
  params: GetAuctionsParams = {}
): Promise<Auction[]> => {
  const qs = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      qs.set(key, String(value));
    }
  }

  const query = qs.toString();

  const res = await axiosInstance.get(
    `/api/auctions${query ? `?${query}` : ""}`
  );

  return res.data.data;
};

export const getAuctionById = async (id: string): Promise<Auction> => {
  const res = await axiosInstance.get(`/api/auctions/${id}`);
  return res.data.data;
};

export const searchAuctions = async (query: string): Promise<Auction[]> => {
  const res = await axiosInstance.get(`/api/auctions/search?q=${query}`);
  return res.data.data;
};

export const createAuction = async (data: CreateAuctionInput): Promise<Auction> => {
  const res = await axiosInstance.post("/api/auctions", data);
  return res.data.data;
};

export const updateAuction = async (id: string, data: UpdateAuctionInput): Promise<Auction> => {
  const res = await axiosInstance.put(`/api/auctions/${id}`, data);
  return res.data.data;
};

export const deleteAuction = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/auctions/${id}`);
};
