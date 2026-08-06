"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 size={32} className="animate-spin text-indigo-500" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
