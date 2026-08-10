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

export const getAuctions = async (): Promise<Auction[]> => {
  const res = await axiosInstance.get("/api/auctions");
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
