import { useState, useEffect } from 'react';
import { getAuctions, getAuctionById } from '@/services/auction.service';

export const useAuction = (id: string | null = null) => {
    const [auction, setAuction] = useState<any>(null);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (id) {
                    const data = await getAuctionById(id);
                    setAuction(data);
                } else {
                    const data = await getAuctions();
                    setAuctions(data);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to fetch auctions.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    return { auction, auctions, loading, error };
};