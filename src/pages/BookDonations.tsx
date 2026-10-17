import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CheckCircle2, ImageOff, Mail, MapPin, PackageCheck, Phone, Truck, XCircle } from "lucide-react";
import { api, getErrorMessage } from "../lib/api";
import type { BookDonation, BookDonationStatus } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

const statusColor: Record<BookDonationStatus, string> = {
  pending_review: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabel: Record<BookDonationStatus, string> = {
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

export function BookDonations() {
  const [donations, setDonations] = useState<BookDonation[]>([]);
  const [filter, setFilter] = useState<string>("pending_review");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get("/book-donations", { params: filter ? { status: filter } : {} })
      .then(({ data }) => setDonations(data.donations))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const approve = async (id: string) => {
    if (!confirm("Approve this donation? It will be published to the Shop immediately.")) return;
    setBusyId(id);
    try {
      await api.patch(`/book-donations/${id}/approve`);
      toast.success("Approved — the book is now live in the Shop");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    const adminNote = prompt("Optional note for the rejection reason:") ?? undefined;
    setBusyId(id);
    try {
      await api.patch(`/book-donations/${id}/reject`, { adminNote });
      toast.success("Donation rejected");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Book donations — Project Vidhyadhanam</h1>
        <div className="flex items-center gap-2">
          <GeneratePdfButton
            title="Book Donations"
            disabled={loading}
            columns={[
              { label: "Submitted", value: donations.map((donation) => formatDateTime(donation.createdAt)) },
              { label: "Donor", value: donations.map((donation) => donation.donor.fullName) },
              { label: "Email", value: donations.map((donation) => donation.donor.email) },
              { label: "Phone", value: donations.map((donation) => donation.donor.phone) },
              { label: "Address", value: donations.map((donation) => `${donation.donor.address}, ${donation.donor.city}, ${donation.donor.state} ${donation.donor.pinCode}`) },
              { label: "Book", value: donations.map((donation) => donation.book.title) },
              { label: "Author", value: donations.map((donation) => donation.book.author) },
              { label: "Publisher / edition", value: donations.map((donation) => [donation.book.publisher, donation.book.edition].filter(Boolean).join(" / ") || "—") },
              { label: "ISBN", value: donations.map((donation) => donation.book.isbn || "—") },
              { label: "Subject / category", value: donations.map((donation) => `${donation.book.subject} / ${donation.book.category}`) },
              { label: "Level / condition", value: donations.map((donation) => `${donation.book.academicLevel} / ${donation.book.condition}`) },
              { label: "Quantity / language", value: donations.map((donation) => `${donation.book.quantity} / ${donation.book.language}`) },
              { label: "Delivery", value: donations.map((donation) => donation.deliveryMethod ?? "Not specified") },
              { label: "Notes", value: donations.map((donation) => donation.additionalNotes || "—") },
              { label: "Status", value: donations.map((donation) => donation.status) },
              { label: "Admin note", value: donations.map((donation) => donation.adminNote || "—") },
            ]}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="">All statuses</option>
            <option value="pending_review">Pending review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-slate-400 text-sm">Loading…</div>}
      {!loading && donations.length === 0 && <div className="text-slate-400 text-sm">No donations found.</div>}

      <div className="space-y-4">
        {donations.map((d) => (
          <div key={d._id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900">{d.book.title}</div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {[d.book.author, d.book.subject, d.book.academicLevel, d.book.condition, `Qty ${d.book.quantity}`]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColor[d.status]}`}>{statusLabel[d.status]}</span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="text-sm text-slate-600 space-y-1">
                <div className="text-xs text-slate-400">Submitted: {formatDateTime(d.createdAt)}</div>
                <div className="font-medium text-slate-800">{d.donor.fullName}</div>
                {d.donor.dateOfBirth && (
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Date of birth: {new Date(`${d.donor.dateOfBirth}T00:00:00`).toLocaleDateString("en-IN")}
                  </div>
                )}
                <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> <a href={`mailto:${d.donor.email}`} className="hover:underline">{d.donor.email}</a></div>
                <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> <a href={`tel:${d.donor.phone}`} className="hover:underline">{d.donor.phone}</a></div>
                <div>{d.donor.address}, {d.donor.city}, {d.donor.state} {d.donor.pinCode}</div>
                <div className="flex items-center gap-1.5 pt-2 font-medium text-slate-700">
                  {d.deliveryMethod === "courier" ? <Truck className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  Delivery: {d.deliveryMethod === "courier" ? "Courier to head office" : d.deliveryMethod === "drop_off" ? "Drop off at head office" : "Not specified"}
                </div>
                {d.deliveryMethod !== "not_specified" && d.deliveryMethod && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-500">
                    <PackageCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    250, East Periyar Nagar, Ramanathapuram, Coimbatore, Tamil Nadu - 641045
                  </div>
                )}
                {d.additionalNotes && <div className="italic text-slate-500 mt-1">"{d.additionalNotes}"</div>}
              </div>

              <div className="flex gap-2">
                {d.photos.length === 0 && (
                  <div className="grid h-16 w-16 place-items-center rounded-lg bg-slate-100 text-slate-300">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
                {d.photos.map((p) => (
                  <a key={p.url} href={p.url} target="_blank" rel="noreferrer" className="h-16 w-16 rounded-lg overflow-hidden border border-slate-200">
                    <img src={p.url} alt="" className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>

            {d.status === "pending_review" && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => approve(d._id)}
                  disabled={busyId === d._id}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => reject(d._id)}
                  disabled={busyId === d._id}
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            )}
            {d.adminNote && <div className="mt-3 text-xs text-slate-500">Note: {d.adminNote}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
