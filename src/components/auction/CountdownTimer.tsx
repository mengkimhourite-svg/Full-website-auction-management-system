"use client";

import { useCountdown } from "@/hooks/useCountdown";

export default function CountdownTimer({ endTime }: { endTime: string }) {
  const timeLeft = useCountdown(endTime);
  const isEnded = timeLeft === "Auction Ended";

  return (
    <span className={isEnded ? "text-red-500 font-semibold" : "text-gray-700 font-semibold"}>
      {timeLeft}
    </span>
  );
}
