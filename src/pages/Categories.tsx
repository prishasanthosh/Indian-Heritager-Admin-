import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { Category } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [filter, setFilter] = useState("");
  const [saving, setSaving] = useState(false);
  const filteredCategories = categories.filter((category) =>
    `${category.name} ${category.slug} ${category.description ?? ""}`.toLowerCase().includes(filter.trim().toLowerCase())
  );

  const load = () => api.get("/categories").then(({ data }) => setCategories(data.categories));

  useEffect(() => {
    load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.post("/categories", { name });
      setName("");
      toast.success("Category added");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900">Categories</h1>
        <GeneratePdfButton
          title="Categories"
          columns={[
            { label: "Name", value: filteredCategories.map((category) => category.name) },
            { label: "Slug", value: filteredCategories.map((category) => category.slug) },
            { label: "Description", value: filteredCategories.map((category) => category.description || "—") },
          ]}
        />
      </div>

      <input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter categories by name or slug"
        aria-label="Filter categories by name or slug"
        className="mb-6 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
      />

      <form onSubmit={create} className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
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
        {filteredCategories.length === 0 && (
          <div className="px-5 py-6 text-sm text-slate-400">
            {categories.length === 0 ? "No categories yet." : "No categories match this filter."}
          </div>
        )}
        {filteredCategories.map((c) => (
          <div key={c._id} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-slate-800">{c.name}</span>
            <button onClick={() => remove(c._id, c.name)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
