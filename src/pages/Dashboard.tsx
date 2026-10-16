import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Boxes,
  HeartHandshake,
  IndianRupee,
  ListChecks,
  Mail,
  Package,
  RefreshCw,
  Send,
  ShoppingBag,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../lib/api";
import type {
  BookDonation,
  BookRequest,
  ContactMessage,
  Donation,
  NewsletterSubscriber,
  Order,
  VolunteerApplication,
} from "../lib/types";

type DashboardDonation = Pick<Donation, "_id" | "donorName" | "projectName" | "createdAt" | "paymentStatus" | "amount">;
type DashboardOrder = Pick<Order, "_id" | "user" | "createdAt" | "status" | "total">;
type DashboardVolunteer = Pick<VolunteerApplication, "_id" | "name" | "createdAt" | "status">;
type DashboardBookDonation = Pick<BookDonation, "_id" | "createdAt" | "status"> & {
  book: Pick<BookDonation["book"], "title">;
  donor: Pick<BookDonation["donor"], "fullName">;
};
type DashboardBookRequest = Pick<BookRequest, "_id" | "createdAt" | "status"> & {
  book: Pick<BookRequest["book"], "name">;
  student: Pick<BookRequest["student"], "fullName">;
};
type DashboardMessage = Pick<ContactMessage, "_id" | "name" | "subject" | "createdAt" | "status">;
type DashboardSubscriber = Pick<NewsletterSubscriber, "_id" | "email" | "createdAt">;

type DashboardOverview = {
  donations: DashboardDonation[];
  donationsTotal: number;
  donationsRaised: number;
  pendingDonations: number;
  orders: DashboardOrder[];
  ordersTotal: number;
  pendingOrders: number;
  productsTotal: number;
  usersTotal: number;
  volunteers: DashboardVolunteer[];
  volunteersTotal: number;
  newVolunteers: number;
  bookDonations: DashboardBookDonation[];
  bookDonationsTotal: number;
  pendingBookDonations: number;
  bookRequests: DashboardBookRequest[];
  bookRequestsTotal: number;
  pendingBookRequests: number;
  messages: DashboardMessage[];
  messagesTotal: number;
  newMessages: number;
  subscribers: DashboardSubscriber[];
  subscribersTotal: number;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  date: string;
  status: string;
  href: string;
  icon: LucideIcon;
  amount?: number;
};

const currency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const statusStyle = (status: string) => {
  if (["paid", "approved", "onboarded", "resolved", "delivered", "fulfilled"].includes(status)) {
    return "bg-green-50 text-green-700";
  }
  if (["failed", "rejected", "declined", "cancelled"].includes(status)) {
    return "bg-red-50 text-red-700";
  }
  if (["contacted", "read", "processing", "shipped"].includes(status)) {
    return "bg-blue-50 text-blue-700";
  }
  return "bg-amber-50 text-amber-700";
};

const displayStatus = (status: string) =>
  status.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const inFlight = useRef(false);
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (hasLoaded.current) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const { data } = await api.get<DashboardOverview>("/admin/dashboard");
      setOverview(data);
      setLastSynced(new Date());
    } catch (err) {
      setError(getErrorMessage(err, "Could not load the admin overview. Check the API connection and try again."));
    } finally {
      hasLoaded.current = true;
      setLoading(false);
      setRefreshing(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void load();
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    const interval = window.setInterval(refreshWhenVisible, 15_000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [load]);

  const activities = useMemo<ActivityItem[]>(() => {
    if (!overview) return [];

    return [
      ...overview.donations.map((donation) => ({
        id: `donation-${donation._id}`,
        title: donation.donorName,
        detail: `Donation · ${donation.projectName}`,
        date: donation.createdAt,
        status: donation.paymentStatus,
        href: "/donations",
        icon: HeartHandshake,
        amount: donation.amount,
      })),
      ...overview.orders.map((order) => ({
        id: `order-${order._id}`,
        title: `Order #${order._id.slice(-8).toUpperCase()}`,
        detail: `Order · ${typeof order.user === "object" && order.user !== null ? order.user.name : "Customer"}`,
        date: order.createdAt,
        status: order.status,
        href: "/orders",
        icon: ShoppingBag,
        amount: order.total,
      })),
      ...overview.volunteers.map((application) => ({
        id: `volunteer-${application._id}`,
        title: application.name,
        detail: "Volunteer application",
        date: application.createdAt,
        status: application.status,
        href: "/volunteers",
        icon: Users,
      })),
      ...overview.bookDonations.map((donation) => ({
        id: `book-donation-${donation._id}`,
        title: donation.book.title,
        detail: `Book donation · ${donation.donor.fullName}`,
        date: donation.createdAt,
        status: donation.status,
        href: "/book-donations",
        icon: BookOpen,
      })),
      ...overview.bookRequests.map((request) => ({
        id: `book-request-${request._id}`,
        title: request.book.name,
        detail: `Book request · ${request.student.fullName}`,
        date: request.createdAt,
        status: request.status,
        href: "/book-requests",
        icon: BookMarked,
      })),
      ...overview.messages.map((message) => ({
        id: `message-${message._id}`,
        title: message.subject,
        detail: `Message · ${message.name}`,
        date: message.createdAt,
        status: message.status,
        href: "/messages",
        icon: Mail,
      })),
      ...overview.subscribers.map((subscriber) => ({
        id: `subscriber-${subscriber._id}`,
        title: subscriber.email,
        detail: "Newsletter subscription",
        date: subscriber.createdAt,
        status: "new",
        href: "/newsletter",
        icon: Send,
      })),
    ]
      .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
      .slice(0, 8);
  }, [overview]);

  const queues = overview
    ? [
        { label: "Unconfirmed donations", count: overview.pendingDonations, href: "/donations", icon: HeartHandshake },
        {
          label: "New volunteer applications",
          count: overview.newVolunteers,
          href: "/volunteers",
          icon: Users,
        },
        {
          label: "Book donations to review",
          count: overview.pendingBookDonations,
          href: "/book-donations",
          icon: BookOpen,
        },
        {
          label: "Book requests to review",
          count: overview.pendingBookRequests,
          href: "/book-requests",
          icon: BookMarked,
        },
        {
          label: "New contact messages",
          count: overview.newMessages,
          href: "/messages",
          icon: Mail,
        },
        { label: "Orders to process", count: overview.pendingOrders, href: "/orders", icon: ShoppingBag },
      ]
    : [];

  const needsAttention = queues.reduce((total, queue) => total + queue.count, 0);

  const stats = overview
    ? [
        {
          label: "Donations raised",
          value: currency(overview.donationsRaised),
          note: `${overview.donationsTotal} recorded donations`,
          icon: IndianRupee,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Needs attention",
          value: needsAttention.toLocaleString("en-IN"),
          note: "Across all review queues",
          icon: Boxes,
          tone: "bg-amber-50 text-amber-700",
        },
        {
          label: "Shop orders",
          value: overview.ordersTotal.toLocaleString("en-IN"),
          note: `${overview.pendingOrders} awaiting processing`,
          icon: ShoppingBag,
          tone: "bg-blue-50 text-blue-700",
        },
        {
          label: "Volunteers",
          value: overview.volunteersTotal.toLocaleString("en-IN"),
          note: `${overview.newVolunteers} new applications`,
          icon: Users,
          tone: "bg-violet-50 text-violet-700",
        },
        {
          label: "Book donations",
          value: overview.bookDonationsTotal.toLocaleString("en-IN"),
          note: `${overview.pendingBookDonations} awaiting review`,
          icon: BookOpen,
          tone: "bg-emerald-50 text-emerald-700",
        },
        {
          label: "Book requests",
          value: overview.bookRequestsTotal.toLocaleString("en-IN"),
          note: `${overview.pendingBookRequests} awaiting review`,
          icon: BookMarked,
          tone: "bg-orange-50 text-orange-700",
        },
      ]
    : [];

  const shortcuts = [
    { label: "Donations", detail: `${overview?.donationsTotal ?? 0} records`, href: "/donations", icon: HeartHandshake },
    { label: "Volunteers", detail: `${overview?.volunteersTotal ?? 0} applications`, href: "/volunteers", icon: Users },
    { label: "Book donations", detail: `${overview?.bookDonationsTotal ?? 0} submissions`, href: "/book-donations", icon: BookOpen },
    { label: "Book requests", detail: `${overview?.bookRequestsTotal ?? 0} requests`, href: "/book-requests", icon: BookMarked },
    { label: "Messages", detail: `${overview?.messagesTotal ?? 0} received`, href: "/messages", icon: Mail },
    { label: "Orders", detail: `${overview?.ordersTotal ?? 0} orders`, href: "/orders", icon: ShoppingBag },
    { label: "Newsletter", detail: `${overview?.subscribersTotal ?? 0} subscribers`, href: "/newsletter", icon: Send },
    { label: "Products", detail: `${overview?.productsTotal ?? 0} listed`, href: "/products", icon: Package },
    { label: "Categories", detail: "Organize the shop", href: "/categories", icon: Tags },
    { label: "Donation purposes", detail: "Manage giving options", href: "/projects", icon: ListChecks },
    { label: "Users", detail: `${overview?.usersTotal ?? 0} accounts`, href: "/users", icon: Users },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Indian Heritager Foundation</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : " back"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">A single view of incoming requests and day-to-day operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {lastSynced
              ? `Updated ${lastSynced.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })} · auto-refresh 15s`
              : "Connecting to admin data"}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading || refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => void load()} className="shrink-0 font-semibold underline underline-offset-2">
            Try again
          </button>
        </div>
      )}

      {loading && !overview ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading donations, requests, messages, and shop activity…
        </div>
      ) : overview ? (
        <>
          <section aria-label="Organization overview" className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {stats.map(({ label, value, note, icon: Icon, tone }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className={`mb-4 grid h-9 w-9 place-items-center rounded-lg ${tone}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">{value}</div>
                <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
                <div className="mt-1 text-xs text-slate-500">{note}</div>
              </div>
            ))}
          </section>

          <section className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.85fr)]">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">Recent activity</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Latest submissions and transactions from every channel</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">Latest 8</span>
              </div>
              <div className="divide-y divide-slate-100">
                {activities.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-slate-500">No activity has come in yet.</div>
                ) : (
                  activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <Link
                        key={activity.id}
                        to={activity.href}
                        className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-accent">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-800">{activity.title}</div>
                          <div className="truncate text-xs text-slate-500">{activity.detail} · {formatDate(activity.date)}</div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          {activity.amount !== undefined && (
                            <span className="text-sm font-semibold text-slate-800">{currency(activity.amount)}</span>
                          )}
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusStyle(activity.status)}`}>
                            {displayStatus(activity.status)}
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold text-slate-900">Needs attention</h2>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${needsAttention ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                    {needsAttention} open
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">Open a queue to review or update its status.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {queues.map(({ label, count, href, icon: Icon }) => (
                  <Link key={label} to={href} className="flex items-center gap-3 px-5 py-3 transition hover:bg-slate-50">
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1 text-sm text-slate-700">{label}</span>
                    <span className={`min-w-7 rounded-full px-2 py-0.5 text-center text-xs font-semibold ${count ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Manage everything</h2>
                <p className="mt-0.5 text-xs text-slate-500">Jump directly into each part of the admin portal.</p>
              </div>
              <span className="hidden text-xs text-slate-400 sm:inline">All forms feed into these queues</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shortcuts.map(({ label, detail, href, icon: Icon }) => (
                <Link
                  key={label}
                  to={href}
                  className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-accent" />
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-800">{label}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{detail}</div>
                </Link>
              ))}
            </div>
          </section>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <Package className="h-3.5 w-3.5" />
            {overview.productsTotal} products · {overview.usersTotal} registered users · {overview.subscribers.length} newsletter subscribers
          </div>
        </>
      ) : !error ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Connecting to admin data…
        </div>
      ) : null}
    </div>
  );
}
