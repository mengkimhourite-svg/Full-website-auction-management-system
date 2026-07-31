import AuctionCard from "@/components/auction/AuctionCard";

interface SearchResultsProps {
  results: any[];
  loading: boolean;
  query: string;
}

export default function SearchResults({ results, loading, query }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-10 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">No results found for &quot;{query}&quot;</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{results.length} result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}
