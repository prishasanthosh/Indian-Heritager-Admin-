import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ImageOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { Product } from "../lib/types";
import { GeneratePdfButton } from "../components/GeneratePdfButton";
import { formatDateTime } from "../lib/pdf";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/products", { params: { includeInactive: true, limit: 60 } })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Products</h1>
        <div className="flex items-center gap-2">
          <GeneratePdfButton
            title="Products"
            disabled={loading}
            columns={[
              { label: "Product", value: products.map((product) => product.name) },
              { label: "Category", value: products.map((product) => typeof product.category === "string" ? product.category : product.category?.name ?? "—") },
              { label: "Price (INR)", value: products.map((product) => product.price) },
              { label: "Compare at (INR)", value: products.map((product) => product.compareAtPrice ?? "—") },
              { label: "Stock", value: products.map((product) => product.stock) },
              { label: "Featured", value: products.map((product) => product.isFeatured ? "Yes" : "No") },
              { label: "Status", value: products.map((product) => product.isActive ? "Active" : "Hidden") },
              { label: "Tags", value: products.map((product) => product.tags.join(", ")) },
              { label: "Added", value: products.map((product) => formatDateTime(product.createdAt)) },
            ]}
          />
          <Link
            to="/products/new"
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-ink hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Add product
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-5 py-3 font-medium">Price</th>
              <th className="text-left px-5 py-3 font-medium">Stock</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No products yet.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-300">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-slate-800 line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-700">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-slate-700">{p.stock}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/products/${p._id}/edit`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => remove(p._id, p.name)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
