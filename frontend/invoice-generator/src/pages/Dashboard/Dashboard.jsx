// Dashboard.jsx
import { useState, useEffect } from "react";
import {
  TrendingUp, Clock, CheckCircle, AlertCircle,
  FileText, ArrowUpRight, ReceiptText
} from "lucide-react";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import AIInsightCard from "../../components/AIInsightCard";

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)
    : "—";

const STATUS_CONFIG = {
  paid: { label: "Paid", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  overdue: { label: "Overdue", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  unpaid: { label: "Unpaid", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: { ring: "ring-blue-100", bg: "bg-blue-50", icon: "text-blue-600" },
    amber: { ring: "ring-amber-100", bg: "bg-amber-50", icon: "text-amber-500" },
    green: { ring: "ring-green-100", bg: "bg-green-50", icon: "text-green-600" },
    red: { ring: "ring-red-100", bg: "bg-red-50", icon: "text-red-500" },
  };
  const c = colors[color] ?? colors.blue;
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 ring-1 ${c.ring} shadow-sm`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 mb-0.5 truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none tracking-tight">{value}</p>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-gray-50">
    {[40, 28, 20, 16].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3.5 bg-gray-100 rounded animate-pulse" style={{ width: `${w * 4}px` }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ onCreateClick }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
      <ReceiptText className="w-6 h-6 text-gray-300" />
    </div>
    <p className="text-sm font-medium text-gray-700 mb-1">No invoices yet</p>
    <p className="text-xs text-gray-400 mb-5">Create your first invoice to get started</p>
    <button
      onClick={onCreateClick}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      Create Invoice
      <ArrowUpRight className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ✅ helper — handles both Clientname (backend typo) and clientName
const getClientName = (billTo) =>
  billTo?.Clientname || billTo?.clientName || null;

const Dashboard = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ Fix: stats come from invoices list, not AI endpoint
        const invoicesRes = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
        const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : [];

        // ✅ Calculate stats from invoices locally
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
        const paid = invoices.filter((inv) => inv.status === "paid").length;
        const unpaid = invoices.filter((inv) => inv.status === "unpaid").length;
        const overdue = invoices.filter((inv) => {
          return inv.status !== "paid" && inv.dueDate && new Date(inv.dueDate) < new Date();
        }).length;

        setStatsData([
          { label: "Total Revenue", value: fmt(totalRevenue), icon: TrendingUp, color: "blue" },
          { label: "Unpaid", value: unpaid, icon: Clock, color: "amber" },
          { label: "Paid", value: paid, icon: CheckCircle, color: "green" },
          { label: "Overdue", value: overdue, icon: AlertCircle, color: "red" },
        ]);

        // ✅ Show only 5 most recent
        setRecentInvoices(invoices.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Overview</h2>
          <p className="text-sm text-gray-400 mt-0.5">{moment().format("dddd, MMMM D, YYYY")}</p>
        </div>
        <button
          onClick={() => onNavigate?.("invoices/new")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
        >
          <FileText className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {loading
          ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-2.5 bg-gray-100 rounded animate-pulse w-2/3" />
                <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))
          : statsData.map((s, i) => <StatCard key={i} {...s} />)
        }
      </div>

      {/* AI Insights Card */}
      <AIInsightCard invoices={recentInvoices} stats={statsData} />

      {/* Recent invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recent Invoices</h3>
          {!loading && recentInvoices.length > 0 && (
            <button
              onClick={() => onNavigate?.("invoices")}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {loading ? (
          <table className="w-full">
            <tbody>
              {Array(4).fill(0).map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        ) : recentInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Client", "Amount", "Status", "Due Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentInvoices.map((inv) => {
                  // ✅ handles both Clientname (backend typo) and clientName
                  const clientName = getClientName(inv.billTo);
                  return (
                    <tr
                      key={inv._id}
                      onClick={() => onNavigate?.("invoice-detail", inv)}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {clientName?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[160px]">
                            {clientName ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">
                          {fmt(inv.total)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {inv.dueDate ? moment(inv.dueDate).format("MMM D, YYYY") : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState onCreateClick={() => onNavigate?.("invoices/new")} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;