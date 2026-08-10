import { useState } from "react";
import { placeBid } from "@/services/bid.service";

export const useBid = (auctionId: string) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const submitBid = async (amount: number) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await placeBid(auctionId, amount);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitBid, loading, error, success };
};
