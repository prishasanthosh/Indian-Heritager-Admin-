import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { NewsletterSubscriber } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

export function Newsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/newsletter").then(({ data }) => setSubscribers(data.subscribers)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Newsletter subscribers</h1>
        <div className="flex items-center gap-3">
          <GeneratePdfButton
            title="Newsletter Subscribers"
            disabled={loading}
            columns={[
              { label: "Email", value: subscribers.map((subscriber) => subscriber.email) },
              { label: "Subscribed", value: subscribers.map((subscriber) => formatDateTime(subscriber.createdAt)) },
            ]}
          />
          <span className="text-sm text-slate-500">{subscribers.length} total</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {loading && <div className="px-5 py-6 text-sm text-slate-400">Loading…</div>}
        {!loading && subscribers.length === 0 && <div className="px-5 py-6 text-sm text-slate-400">No subscribers yet.</div>}
        {subscribers.map((s) => (
          <div key={s._id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-slate-800">{s.email}</span>
            <span className="text-xs text-slate-400">{formatDateTime(s.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
