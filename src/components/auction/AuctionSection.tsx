import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AuctionSectionProps {
  title: string;
  link?: string;
  children: React.ReactNode;
}

export default function AuctionSection({ title, link, children }: AuctionSectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {link && (
          <Link
            href={link}
            className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View All <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
