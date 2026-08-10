import axiosInstance from "./api";
import type { Bid } from "@/types";

export type { Bid };

export const placeBid = async (auctionId: string, amount: number): Promise<Bid> => {
  const res = await axiosInstance.post(`/api/auctions/${auctionId}/bids`, { amount });
  return res.data.data;
};
