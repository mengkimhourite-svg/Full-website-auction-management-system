import { useState, useEffect } from 'react';

export const useCountdown = (targetDate: string | Date) => {
    const [timeLeft, setTimeLeft] = useState<string>('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();
            if (difference <= 0) return 'Auction Ended';

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
            return `${hours}h ${minutes}m ${seconds}s`;
        };

        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
};