import { useEffect, useState } from "react";
import { toast } from "sonner";
import { IndianRupee } from "lucide-react";
import { api, getErrorMessage } from "../lib/api";
import type { Donation } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

const statusColor: Record<Donation["paymentStatus"], string> = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function Donations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/donations")
      .then(({ data }) => {
        setDonations(data.donations);
        setTotalRaised(data.totalRaised);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markPaid = async (id: string) => {
    try {
      await api.patch(`/donations/${id}/mark-paid`);
      toast.success("Marked as paid");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Donations</h1>
        <div className="flex items-center gap-3">
          <GeneratePdfButton
            title="Donations"
            disabled={loading}
            columns={[
              { label: "Donor", value: donations.map((donation) => donation.donorName) },
              { label: "Email", value: donations.map((donation) => donation.donorEmail) },
              { label: "Phone", value: donations.map((donation) => donation.donorPhone) },
              { label: "Amount (INR)", value: donations.map((donation) => donation.amount) },
              { label: "Purpose", value: donations.map((donation) => donation.projectName) },
              { label: "Recurring", value: donations.map((donation) => donation.isRecurring ? "Yes" : "No") },
              { label: "Payment status", value: donations.map((donation) => donation.paymentStatus) },
              { label: "Received", value: donations.map((donation) => formatDateTime(donation.createdAt)) },
            ]}
          />
          <div className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-4 py-2 text-accent font-semibold">
            <IndianRupee className="h-4 w-4" /> {totalRaised.toLocaleString("en-IN")} raised
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Donor</th>
              <th className="text-left px-5 py-3 font-medium">Amount</th>
              <th className="text-left px-5 py-3 font-medium">Purpose</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && donations.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No donations yet.</td></tr>
            )}
            {donations.map((d) => (
              <tr key={d._id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-slate-800">{d.donorName}</div>
                  <div className="text-xs text-slate-400">{d.donorEmail} · {d.donorPhone}</div>
                </td>
                <td className="px-5 py-3 font-semibold text-slate-900">
                  ₹{d.amount.toLocaleString("en-IN")}{d.isRecurring && <span className="ml-1 text-xs font-normal text-slate-400">/mo</span>}
                </td>
                <td className="px-5 py-3 text-slate-600">{d.projectName}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[d.paymentStatus]}`}>
                    {d.paymentStatus}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {d.paymentStatus !== "paid" && (
                    <button onClick={() => markPaid(d._id)} className="text-xs font-medium text-accent hover:underline">
                      Mark paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
