import { useState } from "react";
import { toast } from "sonner";
import { api, getErrorMessage } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function Account() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not change your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold text-slate-900">Account settings</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Change the password for {user?.email}. Your current password is required.
      </p>

      <form onSubmit={changePassword} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div>
          <label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">Current password</label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">New password</label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-slate-400">Use at least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-ink hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "Changing password…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
