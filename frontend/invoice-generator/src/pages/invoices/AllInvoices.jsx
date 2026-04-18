// AllInvoices.jsx
import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Loader2, Trash2, Edit, Search, FileText, Plus, AlertCircle, Sparkles, Mail } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

/* ── Placeholder modals (build later) ──────────────────────── */
const CreateWithAIModal = ({ isOpen, onClose }) => null;
const ReminderModal     = ({ isOpen, onClose }) => null;

/* ── Helpers ────────────────────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

const getClientName = (billTo) =>
  billTo?.Clientname || billTo?.clientName || "—";

const STATUS_CONFIG = {
  paid:   { label: "Paid",   bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  unpaid: { label: "Unpaid", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? STATUS_CONFIG.unpaid;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/* ── Component ──────────────────────────────────────────────── */
const AllInvoices = () => {
  const navigate = useNavigate();

  const [invoices,            setInvoices]            = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [error,               setError]               = useState(null);
  const [statusChangeLoading, setStatusChangeLoading] = useState(null);
  const [searchTerm,          setSearchTerm]          = useState("");
  const [statusFilter,        setStatusFilter]        = useState("All");
  const [isAiModalOpen,       setIsAiModalOpen]       = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedInvoiceId,   setSelectedInvoiceId]   = useState(null);
  const [deleteLoading,       setDeleteLoading]       = useState(null);

  /* ── Fetch ──────────────────────────────────────────────── */
  useEffect(() => {
    const fetchInvoices = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.INVOICE.GET_ALL_INVOICES);
    console.log("RAW RESPONSE:", response.data);
    setInvoices(
      (Array.isArray(response.data) ? response.data : [])
        .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
    );
  } catch (err) {
    setError("Failed to fetch invoices.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
    fetchInvoices();
  }, []);

  /* ── Delete ─────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    setDeleteLoading(id);
    try {
      await axiosInstance.delete(API_PATHS.INVOICE.DELETE_INVOICE(id));
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      toast.success("Invoice deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete invoice.");
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ── Status Change ──────────────────────────────────────── */
  const handleStatusChange = async (invoice) => {
    const newStatus = invoice.status === "paid" ? "unpaid" : "paid";
    setStatusChangeLoading(invoice._id);
    try {
      await axiosInstance.put(API_PATHS.INVOICE.UPDATE_INVOICE(invoice._id), {
        ...invoice,
        status: newStatus,
      });
      setInvoices((prev) =>
        prev.map((inv) =>
          inv._id === invoice._id ? { ...inv, status: newStatus } : inv
        )
      );
      toast.success(`Marked as ${newStatus}.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    } finally {
      setStatusChangeLoading(null);
    }
  };

  /* ── Reminder Modal ─────────────────────────────────────── */
  const handleOpenReminderModal = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setIsReminderModalOpen(true);
  };

  /* ── Filter ─────────────────────────────────────────────── */
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((invoice) =>
        statusFilter === "All" || invoice.status === statusFilter
      )
      .filter((invoice) => {
        const term   = searchTerm.toLowerCase();
        const num    = invoice.invoiceNumber?.toLowerCase() ?? "";
        const client = getClientName(invoice.billTo).toLowerCase();
        return num.includes(term) || client.includes(term);
      });
  }, [invoices, searchTerm, statusFilter]);

  /* ── Loading ────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Modals */}
      <CreateWithAIModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">All Invoices</h1>
          <p className="text-sm text-slate-600 mt-1">Manage all your invoices in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-50 border border-violet-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Create
          </button>
          <button
            onClick={() => navigate("/invoices/new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client or invoice number…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
        >
          {["All", "paid", "unpaid"].map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No invoices found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Invoice #", "Client", "Amount", "Status", "Due Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.map((inv) => {
                  const clientName = getClientName(inv.billTo);
                  return (
                    <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors group">

                      {/* Invoice # */}
                      <td className="px-5 py-3.5 text-sm font-mono text-gray-500">
                        {inv.invoiceNumber}
                      </td>

                      {/* Client */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {clientName?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[140px]">
                            {clientName}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-gray-900">
                          {fmt(inv.total)}
                        </span>
                      </td>

                      {/* Status — click to toggle */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleStatusChange(inv)}
                          disabled={statusChangeLoading === inv._id}
                          className="hover:opacity-70 transition-opacity disabled:opacity-40"
                          title="Click to toggle status"
                        >
                          {statusChangeLoading === inv._id
                            ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            : <StatusBadge status={inv.status} />
                          }
                        </button>
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-3.5 text-sm text-gray-500">
                        {inv.dueDate ? moment(inv.dueDate).format("MMM D, YYYY") : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenReminderModal(inv._id)}
                            className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
                            title="Send reminder"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              navigate("/invoices/new", { state: { invoiceData: inv } })
                            }
                            className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-gray-400 hover:text-amber-600 transition-colors"
                            title="Edit invoice"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(inv._id)}
                            disabled={deleteLoading === inv._id}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                            title="Delete invoice"
                          >
                            {deleteLoading === inv._id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />
                            }
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer count */}
      {filteredInvoices.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Showing {filteredInvoices.length} of {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </p>
      )}

    </div>
  );
};

export default AllInvoices;