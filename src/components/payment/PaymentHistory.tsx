import PaymentStatus from "./PaymentStatus";
import type { Payment } from "@/types";

interface PaymentHistoryProps {
  payments: Payment[];
}

export default function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (!payments.length) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">No payment history.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Auction</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="font-medium text-gray-900">{payment.auction?.product?.title || "—"}</td>
              <td className="font-semibold text-indigo-600">${(payment.amount || 0).toLocaleString()}</td>
              <td className="text-gray-500 capitalize">{payment.method || "card"}</td>
              <td><PaymentStatus status={payment.status} /></td>
              <td className="text-gray-500 text-sm">
                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
