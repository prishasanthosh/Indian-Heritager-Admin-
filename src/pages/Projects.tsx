import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { Project } from "../lib/types";

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/projects/all").then(({ data }) => setProjects(data.projects));

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post("/projects", { name });
      setName("");
      toast.success("Donation purpose added");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Project) => {
    try {
      await api.put(`/projects/${p._id}`, { isActive: !p.isActive });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async (id: string, projectName: string) => {
    if (!confirm(`Delete donation purpose "${projectName}"?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold text-slate-900 mb-2">Donation purposes</h1>
      <p className="text-sm text-slate-500 mb-6">Drives the "Donation purpose" dropdown on the public /give page — only active purposes appear there.</p>

      <form onSubmit={create} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New donation purpose"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-ink hover:bg-brand-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {projects.length === 0 && <div className="px-5 py-6 text-sm text-slate-400">No donation purposes yet.</div>}
        {projects.map((p) => (
          <div key={p._id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-slate-800">{p.name}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleActive(p)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
              >
                {p.isActive ? "Active" : "Hidden"}
              </button>
              <button onClick={() => remove(p._id, p.name)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
