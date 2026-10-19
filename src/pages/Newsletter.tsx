import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { NewsletterSubscriber } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

export function Newsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/newsletter")
      .then(({ data }) => setSubscribers(data.subscribers))
      .catch((error) => toast.error(getErrorMessage(error, "Could not load newsletter subscribers.")))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: NewsletterSubscriber["status"]) => {
    try {
      await api.patch(`/newsletter/${id}/status`, { status });
      setSubscribers((current) => current.map((subscriber) =>
        subscriber._id === id ? { ...subscriber, status } : subscriber
      ));
      toast.success("Subscriber status updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not update subscriber status."));
    }
  };

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
              { label: "Added", value: subscribers.map((subscriber) => formatDateTime(subscriber.createdAt)) },
              { label: "Status", value: subscribers.map((subscriber) => subscriber.status) },
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
            <div>
              <div className="text-sm font-medium text-slate-800">{s.email}</div>
              <div className="mt-1 text-xs text-slate-400">Added {formatDateTime(s.createdAt)}</div>
            </div>
            <select
              value={s.status}
              onChange={(event) => updateStatus(s._id, event.target.value as NewsletterSubscriber["status"])}
              aria-label={`Subscription status for ${s.email}`}
              className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium capitalize ${
                s.status === "subscribed" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
