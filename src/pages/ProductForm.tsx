import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ImageOff, Loader2, X } from "lucide-react";
import { api, getErrorMessage } from "../lib/api";
import type { Category, Product, ProductImage } from "../lib/types";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  category: "",
  stock: "0",
  sku: "",
  isFeatured: false,
  isActive: true,
  tags: "",
};

export function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p: Product = data.product;
      setForm({
        name: p.name,
        description: p.description ?? "",
        price: String(p.price),
        compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
        category: typeof p.category === "object" ? p.category?._id ?? "" : p.category ?? "",
        stock: String(p.stock),
        sku: "",
        isFeatured: p.isFeatured,
        isActive: p.isActive,
        tags: p.tags.join(", "),
      });
      setImages(p.images);
      setLoading(false);
    });
  }, [id]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages((imgs) => [...imgs, { url: data.url, publicId: data.publicId }]);
    } catch (err) {
      toast.error(getErrorMessage(err, "Image upload failed"));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      category: form.category || undefined,
      stock: Number(form.stock),
      sku: form.sku || undefined,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      images,
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      navigate("/products");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save product"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400">Loading…</div>;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-900 mb-6">{isEdit ? "Edit product" : "Add product"}</h1>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-700">Product name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Price (₹)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Compare-at price (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.compareAtPrice}
              onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Stock</label>
            <input
              required
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Images</label>
          <div className="mt-2 flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={img.url} className="relative h-20 w-20 rounded-lg overflow-hidden border border-slate-200">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                  className="absolute top-0.5 right-0.5 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="grid h-20 w-20 place-items-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 hover:border-brand-400 hover:text-brand-500 cursor-pointer">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImageOff className="h-5 w-5" />}
              <input ref={fileInput} type="file" accept="image/*" onChange={onUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
            Active (visible in shop)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
