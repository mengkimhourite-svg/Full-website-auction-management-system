import axiosInstance from './api';

export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  category: string;
  endDate: string;
  image?: string | null;
  status: string;
  sellerId: string;
  createdAt: string;
  bids?: any[];
}

export const getAuctions = async (): Promise<Auction[]> => {
  const res = await axiosInstance.get('/api/auctions');
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

export const createAuction = async (data: any): Promise<Auction> => {
  const res = await axiosInstance.post('/api/auctions', data);
  return res.data.data;
};

export const updateAuction = async (id: string, data: any): Promise<Auction> => {
  const res = await axiosInstance.put(`/api/auctions/${id}`, data);
  return res.data.data;
};

export const deleteAuction = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/api/auctions/${id}`);
};
