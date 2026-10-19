import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tags,
  LogOut,
  Mail,
  HeartHandshake,
  HandHeart,
  Send,
  BookOpen,
  BookMarked,
  ListChecks,
  KeyRound,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../lib/api";
import logo from "../assets/logo.png";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/products", label: "Products", icon: Package },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/orders", label: "Orders", icon: ShoppingBag },
  { to: "/book-donations", label: "Book Donations", icon: BookOpen },
  { to: "/book-requests", label: "Book Requests", icon: BookMarked },
  { to: "/donations", label: "Donations", icon: HeartHandshake },
  { to: "/projects", label: "Donation Purposes", icon: ListChecks },
  { to: "/messages", label: "Messages", icon: Mail },
  { to: "/volunteers", label: "Volunteers", icon: HandHeart },
  { to: "/newsletter", label: "Newsletter", icon: Send },
  { to: "/users", label: "Users", icon: Users },
  { to: "/account", label: "Account settings", icon: KeyRound },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingBookDonations, setPendingBookDonations] = useState(0);
  const notificationErrorShown = useRef(false);
  const lastPendingCount = useRef<number | null>(null);

  const refreshPendingBookDonations = useCallback(async () => {
    try {
      const { data } = await api.get("/book-donations/pending-count");
      setPendingBookDonations(data.count);
      if (lastPendingCount.current !== null && data.count > lastPendingCount.current) {
        toast.info("A new book donation is waiting for review.", {
          action: { label: "Review", onClick: () => navigate("/book-donations") },
        });
      }
      lastPendingCount.current = data.count;
      notificationErrorShown.current = false;
    } catch (error) {
      if (!notificationErrorShown.current) {
        toast.error(getErrorMessage(error, "Could not refresh pending book donations."));
        notificationErrorShown.current = true;
      }
    }
  }, [navigate]);

  useEffect(() => {
    void refreshPendingBookDonations();
    const interval = window.setInterval(() => void refreshPendingBookDonations(), 60_000);
    return () => window.clearInterval(interval);
  }, [refreshPendingBookDonations]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-200 shrink-0">
        <img src={logo} alt="Indian Heritager Foundation" className="h-9 w-9 rounded-full" />
        <span className="font-semibold text-slate-900 text-sm leading-tight">
          Heritager<br /><span className="text-[10px] font-normal text-slate-400 uppercase tracking-wide">Admin</span>
        </span>
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? "bg-brand-50 text-accent" : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {to === "/book-donations" && pendingBookDonations > 0 && (
              <span
                aria-label={`${pendingBookDonations} book donations awaiting review`}
                className="min-w-5 rounded-full bg-amber-100 px-1.5 py-0.5 text-center text-[10px] font-semibold text-amber-800"
              >
                {pendingBookDonations > 99 ? "99+" : pendingBookDonations}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 shrink-0">
        <div className="px-2 mb-2">
          <div className="text-sm font-medium text-slate-800 truncate">{user?.name}</div>
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
        </div>
        <button
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:flex bg-slate-50">
      {/* Mobile top bar */}
      <div className="flex items-center gap-3 h-14 px-4 border-b border-slate-200 bg-white lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <img src={logo} alt="Indian Heritager Foundation" className="h-7 w-7 rounded-full" />
        <span className="font-semibold text-slate-900 text-sm">Heritager Admin</span>
      </div>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar: static on desktop, sliding drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col transition-transform duration-200 ease-out
          lg:static lg:z-auto lg:w-60 lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
