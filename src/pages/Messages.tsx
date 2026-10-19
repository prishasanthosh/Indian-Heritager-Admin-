import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { ContactMessage } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

const statusColor: Record<ContactMessage["status"], string> = {
  new: "bg-amber-100 text-amber-700",
  read: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

export function Messages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"" | ContactMessage["status"]>("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleMessages = useMemo(
    () => statusFilter ? messages.filter((message) => message.status === statusFilter) : messages,
    [messages, statusFilter]
  );
  const selectedMessages = useMemo(
    () => selectedIds.flatMap((id) => {
      const message = messages.find((item) => item._id === id);
      return message ? [message] : [];
    }),
    [messages, selectedIds]
  );
  const allVisibleSelected = visibleMessages.length > 0
    && visibleMessages.every((message) => selectedIds.includes(message._id));

  const load = () => {
    setLoading(true);
    api
      .get("/contact")
      .then(({ data }) => {
        setMessages(data.messages);
        setSelectedIds((current) => current.filter((id) => data.messages.some((message: ContactMessage) => message._id === id)));
      })
      .catch((error) => toast.error(getErrorMessage(error, "Could not load contact messages.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleMessage = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  };

  const toggleAllVisible = () => {
    const visibleIds = visibleMessages.map((message) => message._id);
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : Array.from(new Set([...current, ...visibleIds]))
    );
  };

  const pdfColumns = (records: ContactMessage[]) => [
    { label: "Received", value: records.map((message) => formatDateTime(message.createdAt)) },
    { label: "Name", value: records.map((message) => message.name) },
    { label: "Email", value: records.map((message) => message.email) },
    { label: "Subject", value: records.map((message) => message.subject) },
    { label: "Message", value: records.map((message) => message.message) },
    { label: "Status", value: records.map((message) => message.status) },
  ];

  const setStatus = async (id: string, status: ContactMessage["status"]) => {
    try {
      await api.patch(`/contact/${id}/status`, { status });
      toast.success("Message status updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900">Contact messages</h1>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="message-status-filter">Filter messages by status</label>
          <select
            id="message-status-filter"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as "" | ContactMessage["status"]);
              setSelectedIds([]);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
          </select>
          <GeneratePdfButton
            title="All Contact Messages"
            label="All messages"
            disabled={loading || messages.length === 0}
            columns={pdfColumns(messages)}
          />
          <GeneratePdfButton
            title={statusFilter ? `Contact Messages - ${statusFilter}` : "Contact Messages - All Statuses"}
            label={statusFilter ? `${statusFilter} messages` : "Filtered messages"}
            disabled={loading || visibleMessages.length === 0}
            columns={pdfColumns(visibleMessages)}
          />
          <GeneratePdfButton
            title="Selected Contact Messages"
            label={`Selected (${selectedMessages.length})`}
            disabled={loading || selectedMessages.length === 0}
            columns={pdfColumns(selectedMessages)}
          />
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading && <div className="text-slate-400 text-sm">Loading…</div>}
        {!loading && messages.length === 0 && <div className="text-slate-400 text-sm">No messages yet.</div>}
        {!loading && messages.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <label className="flex w-fit items-center gap-2">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                aria-label="Select all visible messages"
              />
              Select all visible ({visibleMessages.length})
            </label>
            <span aria-live="polite">{selectedMessages.length} message{selectedMessages.length === 1 ? "" : "s"} selected</span>
          </div>
        )}
        {!loading && visibleMessages.length === 0 && messages.length > 0 && (
          <div className="text-slate-400 text-sm">No messages with this status.</div>
        )}
        {visibleMessages.map((m) => (
          <div key={m._id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(m._id)}
                  onChange={() => toggleMessage(m._id)}
                  aria-label={`Select message: ${m.subject}`}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-slate-900">{m.subject}</div>
                <div className="text-sm text-slate-500 mt-0.5">{m.name} · {m.email}</div>
                </div>
              </div>
              <select
                value={m.status}
                onChange={(e) => setStatus(m._id, e.target.value as ContactMessage["status"])}
                className={`rounded-full px-2 py-1 text-xs font-medium border-0 capitalize ${statusColor[m.status]}`}
              >
                <option value="new">new</option>
                <option value="read">read</option>
                <option value="resolved">resolved</option>
              </select>
            </div>
            <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">{m.message}</p>
            <div className="mt-2 text-xs text-slate-400">Received: {formatDateTime(m.createdAt)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
