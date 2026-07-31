import axiosInstance from './api';

export interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  userId: string;
  auctionId: string;
}

export const placeBid = async (auctionId: string, amount: number): Promise<Bid> => {
  const res = await axiosInstance.post(`/api/auctions/${auctionId}/bids`, { amount });
  return res.data.data;
};
