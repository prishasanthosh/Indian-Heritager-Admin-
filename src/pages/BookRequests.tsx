import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileText, Mail, Phone } from "lucide-react";
import { api, getErrorMessage } from "../lib/api";
import type { BookRequest, BookRequestStatus } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

const statuses: BookRequestStatus[] = ["pending", "approved", "fulfilled", "rejected"];

const statusColor: Record<BookRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  fulfilled: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function BookRequests() {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/book-requests", { params: filter ? { status: filter } : {} })
      .then(({ data }) => setRequests(data.requests))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const setStatus = async (id: string, status: BookRequestStatus) => {
    try {
      await api.patch(`/book-requests/${id}/status`, { status });
      toast.success("Status updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Book Requests — Project Vidhyadhanam</h1>
        <div className="flex items-center gap-2">
          <GeneratePdfButton
            title="Book Requests"
            disabled={loading}
            columns={[
              { label: "Submitted", value: requests.map((request) => formatDateTime(request.createdAt)) },
              { label: "Student", value: requests.map((request) => request.student.fullName) },
              { label: "Email", value: requests.map((request) => request.student.email) },
              { label: "Phone", value: requests.map((request) => request.student.phone) },
              { label: "Institution", value: requests.map((request) => request.student.institutionName) },
              { label: "Course / class", value: requests.map((request) => request.student.courseClass) },
              { label: "Year / semester", value: requests.map((request) => request.student.yearSemester) },
              { label: "Address", value: requests.map((request) => request.student.address) },
              { label: "Book", value: requests.map((request) => `${request.book.name}${request.book.author ? ` by ${request.book.author}` : ""}`) },
              { label: "Subject", value: requests.map((request) => request.book.subject) },
              { label: "Edition", value: requests.map((request) => request.book.edition || "—") },
              { label: "Quantity", value: requests.map((request) => request.book.quantityRequired) },
              { label: "Reason", value: requests.map((request) => request.reason) },
              { label: "Status", value: requests.map((request) => request.status) },
              { label: "Admin note", value: requests.map((request) => request.adminNote || "—") },
            ]}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="text-slate-400 text-sm">Loading…</div>}
      {!loading && requests.length === 0 && <div className="text-slate-400 text-sm">No requests found.</div>}

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900">{r.book.name} {r.book.author ? `— ${r.book.author}` : ""}</div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {r.book.subject} · Qty {r.book.quantityRequired}{r.book.edition ? ` · Edition ${r.book.edition}` : ""}
                </div>
              </div>
              <select
                value={r.status}
                onChange={(e) => setStatus(r._id, e.target.value as BookRequestStatus)}
                className={`rounded-full px-2 py-1 text-xs font-medium border-0 capitalize ${statusColor[r.status]}`}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-600">
              <div className="space-y-1">
              <div className="text-xs text-slate-400">Submitted: {formatDateTime(r.createdAt)}</div>
              <div className="font-medium text-slate-800">{r.student.fullName}</div>
                <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> <a href={`mailto:${r.student.email}`} className="hover:underline">{r.student.email}</a></div>
                <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> <a href={`tel:${r.student.phone}`} className="hover:underline">{r.student.phone}</a></div>
                <div>{r.student.institutionName} · {r.student.courseClass} · {r.student.yearSemester}</div>
                <div>{r.student.address}</div>
              </div>
              <div>
                <div className="italic text-slate-500">"{r.reason}"</div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a href={r.studentIdDocument.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                    <FileText className="h-3.5 w-3.5" /> Student ID
                  </a>
                  {r.supportingDocument && (
                    <a href={r.supportingDocument.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-accent hover:underline">
                      <FileText className="h-3.5 w-3.5" /> Supporting document
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
