import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { VolunteerApplication } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

const statusColor: Record<VolunteerApplication["status"], string> = {
  new: "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  onboarded: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

export function VolunteerApplications() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/volunteer-applications").then(({ data }) => setApplications(data.applications)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setStatus = async (id: string, status: VolunteerApplication["status"]) => {
    try {
      await api.patch(`/volunteer-applications/${id}/status`, { status });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900">Volunteer applications</h1>
        <GeneratePdfButton
          title="Volunteer Applications"
          disabled={loading}
          columns={[
            { label: "Submitted", value: applications.map((application) => formatDateTime(application.createdAt)) },
            { label: "Name", value: applications.map((application) => application.name) },
            { label: "Email", value: applications.map((application) => application.email) },
            { label: "Phone", value: applications.map((application) => application.phone) },
            { label: "Availability", value: applications.map((application) => application.availability) },
            { label: "Skills", value: applications.map((application) => application.skills || "—") },
            { label: "Message", value: applications.map((application) => application.message || "—") },
            { label: "Status", value: applications.map((application) => application.status) },
          ]}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Contact</th>
              <th className="text-left px-5 py-3 font-medium">Availability</th>
              <th className="text-left px-5 py-3 font-medium">Skills</th>
              <th className="text-left px-5 py-3 font-medium">Submitted</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && applications.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No applications yet.</td></tr>
            )}
            {applications.map((a) => (
              <tr key={a._id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{a.name}</td>
                <td className="px-5 py-3 text-slate-600">{a.email}<br /><span className="text-xs text-slate-400">{a.phone}</span></td>
                <td className="px-5 py-3 text-slate-600">{a.availability}</td>
                <td className="px-5 py-3 text-slate-600 max-w-xs truncate">{a.skills || "—"}</td>
                <td className="px-5 py-3 whitespace-nowrap text-slate-500">{formatDateTime(a.createdAt)}</td>
                <td className="px-5 py-3">
                  <select
                    value={a.status}
                    onChange={(e) => setStatus(a._id, e.target.value as VolunteerApplication["status"])}
                    className={`rounded-full px-2 py-1 text-xs font-medium border-0 capitalize ${statusColor[a.status]}`}
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="onboarded">onboarded</option>
                    <option value="declined">declined</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
