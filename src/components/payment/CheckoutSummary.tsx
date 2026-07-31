interface CheckoutSummaryProps {
  amount: number;
  auctionTitle: string;
}

export default function CheckoutSummary({ amount, auctionTitle }: CheckoutSummaryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-bold text-gray-900 mb-4">Order Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Item</span>
          <span className="font-medium text-gray-900 truncate ml-4">{auctionTitle}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold text-indigo-600">${amount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
