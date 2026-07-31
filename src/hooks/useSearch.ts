import { useState, useEffect } from 'react';
import { searchAuctions } from '@/services/auction.service';

export const useSearch = (initialQuery: string = '') => {
    const [query, setQuery] = useState<string>(initialQuery);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const data = await searchAuctions(query);
                setResults(data);
            } catch (err: any) {
                setError(err.message || 'Search failed.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce: រង់ចាំ ៥០០ms មុននឹងផ្ញើ Request
        const delayDebounceFn = setTimeout(fetchResults, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return { query, setQuery, results, loading, error };
};