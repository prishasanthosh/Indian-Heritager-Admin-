import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { ContactMessage } from "../lib/types";

const statusColor: Record<ContactMessage["status"], string> = {
  new: "bg-amber-100 text-amber-700",
  read: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

export function Messages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/contact").then(({ data }) => setMessages(data.messages)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id: string, status: ContactMessage["status"]) => {
    try {
      await api.patch(`/contact/${id}/status`, { status });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-slate-900 mb-6">Contact messages</h1>

      <div className="space-y-3">
        {loading && <div className="text-slate-400 text-sm">Loading…</div>}
        {!loading && messages.length === 0 && <div className="text-slate-400 text-sm">No messages yet.</div>}
        {messages.map((m) => (
          <div key={m._id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-slate-900">{m.subject}</div>
                <div className="text-sm text-slate-500 mt-0.5">{m.name} · {m.email}</div>
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
            <div className="mt-2 text-xs text-slate-400">{new Date(m.createdAt).toLocaleString("en-IN")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
