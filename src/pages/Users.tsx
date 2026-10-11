import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import type { User } from "../lib/types";
import { useAuth } from "../context/AuthContext";

export function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/users", { params: q ? { q } : {} }).then(({ data }) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(load, [q]);

  const setRole = async (id: string, role: "customer" | "admin") => {
    try {
      await api.patch(`/users/${id}/role`, { role });
      toast.success("Role updated");
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">Users</h1>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm w-64"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Role</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>}
            {!loading && users.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No users found.</td></tr>}
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{u.name}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3">
                  <select
                    value={u.role}
                    disabled={u._id === me?._id}
                    onChange={(e) => setRole(u._id, e.target.value as "customer" | "admin")}
                    className={`rounded-full px-2 py-1 text-xs font-medium border-0 capitalize ${
                      u.role === "admin" ? "bg-brand-100 text-accent" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <option value="customer">customer</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
