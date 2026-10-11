import { Fragment, useEffect, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { Order, OrderStatus } from "../lib/types";

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusColor: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get("/orders", { params: filter ? { status: filter } : {} })
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      toast.success("Order status updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Order</th>
              <th className="text-left px-5 py-3 font-medium">Customer</th>
              <th className="text-left px-5 py-3 font-medium">Total</th>
              <th className="text-left px-5 py-3 font-medium">Payment</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && orders.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No orders found.</td></tr>}
            {orders.map((o) => (
              <Fragment key={o._id}>
                <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                  <td className="px-5 py-3 font-medium text-slate-800">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-5 py-3 text-slate-600">{typeof o.user === "object" ? o.user.name : "—"}</td>
                  <td className="px-5 py-3 text-slate-800 font-medium">₹{o.total.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-slate-600 uppercase text-xs">{o.paymentMethod} · {o.paymentStatus}</td>
                  <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value as OrderStatus)}
                      className={`rounded-full px-2 py-1 text-xs font-medium border-0 capitalize ${statusColor[o.status]}`}
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {expanded === o._id && (
                  <tr>
                    <td colSpan={5} className="bg-slate-50 px-5 py-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-slate-700 mb-1">Items</div>
                          {o.items.map((it) => (
                            <div key={it.product} className="flex justify-between text-slate-600">
                              <span>{it.name} × {it.quantity}</span>
                              <span>₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="font-medium text-slate-700 mb-1">Shipping address</div>
                          <p className="text-slate-600">
                            {o.shippingAddress.fullName}<br />
                            {o.shippingAddress.line1}{o.shippingAddress.line2 ? `, ${o.shippingAddress.line2}` : ""}<br />
                            {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.postalCode}<br />
                            {o.shippingAddress.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
