// RecurringPage.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  Plus, Sparkles, Loader2, RefreshCw, Pause, Play,
  X, Trash2, AlertCircle, Calendar, FileText,
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";
import AIScheduleModal from "../../components/invoices/AIScheduleModal";
import { useAuth } from "../../context/authContext";

const EMPTY_ITEM = { name: "", quantity: 1, unitPrice: 0, taxPercent: 0 };

const FREQUENCY_OPTIONS = [
  { value: "monthly",   label: "Monthly"   },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly",    label: "Yearly"    },
  { value: "custom",    label: "Custom"    },
];

const STATUS_CONFIG = {
  active:    { label: "Active",    bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
  paused:    { label: "Paused",    bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
  cancelled: { label: "Cancelled", bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);

const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white";
const labelCls = "block text-xs font-medium text-gray-500 mb-1";

const RecurringPage = () => {
  const { user } = useAuth() || {};

  const [recurringList, setRecurringList] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [showForm,      setShowForm]      = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const defaultForm = {
    billFrom: {
      businessName: user?.businessName ?? "",
      email:        user?.email        ?? "",
      address:      user?.address      ?? "",
      phone:        user?.phone        ?? "",
    },
    billTo:       { clientName: "", email: "", address: "", phone: "" },
    items:        [{ ...EMPTY_ITEM }],
    notes:        "",
    paymentTerms: "Net 15",
    frequency:    "monthly",
    customDays:   30,
    startDate:    new Date().toISOString().split("T")[0],
    description:  "",
  };

  const [formData, setFormData] = useState(defaultForm);

  /* ── Fetch ──────────────────────────────────────────── */
  useEffect(() => {
    fetchRecurring();
  }, []);

  const fetchRecurring = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.RECURRING.GET_ALL);
      setRecurringList(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch recurring invoices.");
    } finally {
      setLoading(false);
    }
  };

  /* ── AI Prefill ─────────────────────────────────────── */
  const handleAIPrefill = (aiData) => {
    setFormData((prev) => ({
      ...prev,
      billTo: {
        clientName: aiData.clientName ?? "",
        email:      aiData.email      ?? "",
        address:    "",
        phone:      "",
      },
      items: aiData.amount
        ? [{ name: aiData.description || "Service", quantity: 1, unitPrice: aiData.amount, taxPercent: 0 }]
        : prev.items,
      frequency:   aiData.frequency   ?? "monthly",
      customDays:  aiData.customDays  ?? 30,
      startDate:   aiData.startDate   ?? new Date().toISOString().split("T")[0],
      description: aiData.description ?? "",
    }));
    setShowForm(true);
  };

  /* ── Form handlers ──────────────────────────────────── */
  const handleInputChange = (e, section, index) => {
    const { name, value } = e.target;
    if (section === "items") {
      const updated = [...formData.items];
      updated[index] = { ...updated[index], [name]: value };
      setFormData({ ...formData, items: updated });
    } else if (section) {
      setFormData({ ...formData, [section]: { ...formData[section], [name]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddItem = () => {
    setFormData({ ...formData, items: [...formData.items, { ...EMPTY_ITEM }] });
  };

  const handleRemoveItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated.length ? updated : [{ ...EMPTY_ITEM }] });
  };

  /* ── Submit ─────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!formData.billTo.clientName)    { toast.error("Please enter a client name.");      return; }
    if (!formData.billFrom.businessName){ toast.error("Please enter your business name."); return; }
    if (!formData.startDate)            { toast.error("Please select a start date.");      return; }
    if (formData.items.some((i) => !i.name)) { toast.error("Please fill in all item names."); return; }

    setSaving(true);
    try {
      const response = await axiosInstance.post(API_PATHS.RECURRING.CREATE, formData);
      setRecurringList((prev) => [response.data, ...prev]);
      setFormData(defaultForm);
      setShowForm(false);
      toast.success("Recurring invoice created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create recurring invoice.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Actions ────────────────────────────────────────── */
  const handlePause = async (id) => {
    setActionLoading(id + "pause");
    try {
      const response = await axiosInstance.put(API_PATHS.RECURRING.PAUSE(id));
      setRecurringList((prev) => prev.map((r) => r._id === id ? response.data : r));
      toast.success("Paused successfully.");
    } catch { toast.error("Failed to pause."); }
    finally { setActionLoading(null); }
  };

  const handleResume = async (id) => {
    setActionLoading(id + "resume");
    try {
      const response = await axiosInstance.put(API_PATHS.RECURRING.RESUME(id));
      setRecurringList((prev) => prev.map((r) => r._id === id ? response.data : r));
      toast.success("Resumed successfully.");
    } catch { toast.error("Failed to resume."); }
    finally { setActionLoading(null); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this recurring invoice?")) return;
    setActionLoading(id + "cancel");
    try {
      const response = await axiosInstance.put(API_PATHS.RECURRING.CANCEL(id));
      setRecurringList((prev) => prev.map((r) => r._id === id ? response.data : r));
      toast.success("Cancelled.");
    } catch { toast.error("Failed to cancel."); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recurring invoice permanently?")) return;
    setActionLoading(id + "delete");
    try {
      await axiosInstance.delete(API_PATHS.RECURRING.DELETE(id));
      setRecurringList((prev) => prev.filter((r) => r._id !== id));
      toast.success("Deleted.");
    } catch { toast.error("Failed to delete."); }
    finally { setActionLoading(null); }
  };

  /* ── Totals ─────────────────────────────────────────── */
  const { subtotal, total } = (() => {
    let subtotal = 0, taxTotal = 0;
    formData.items.forEach((item) => {
      const itemTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      subtotal  += itemTotal;
      taxTotal  += itemTotal * ((Number(item.taxPercent) || 0) / 100);
    });
    return { subtotal, total: subtotal + taxTotal };
  })();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      <AIScheduleModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onPrefill={handleAIPrefill}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Recurring Invoices</h1>
          <p className="text-sm text-slate-600 mt-1">Automate your billing schedules</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-violet-600 hover:bg-violet-50 border border-violet-200 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Schedule
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Recurring
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">New Recurring Invoice</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <input name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g. Monthly hosting fee" className={inputCls} />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Frequency</label>
              <select name="frequency" value={formData.frequency} onChange={handleInputChange} className={inputCls}>
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            {formData.frequency === "custom" && (
              <div>
                <label className={labelCls}>Every X Days</label>
                <input type="number" name="customDays" value={formData.customDays} onChange={handleInputChange} min="1" className={inputCls} />
              </div>
            )}
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Payment Terms</label>
              <select name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} className={inputCls}>
                {["Net 7", "Net 15", "Net 30", "Net 60", "Due on Receipt"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bill From / To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-700">Bill From</h3>
              {[
                { label: "Business Name", name: "businessName", placeholder: "Your Business" },
                { label: "Email",         name: "email",        placeholder: "you@example.com" },
                { label: "Address",       name: "address",      placeholder: "123 Main St" },
                { label: "Phone",         name: "phone",        placeholder: "+1 (555) 000-0000" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className={labelCls}>{label}</label>
                  <input name={name} value={formData.billFrom?.[name] ?? ""} onChange={(e) => handleInputChange(e, "billFrom")} placeholder={placeholder} className={inputCls} />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-700">Bill To</h3>
              {[
                { label: "Client Name", name: "clientName", placeholder: "Client Business" },
                { label: "Email",       name: "email",      placeholder: "client@example.com" },
                { label: "Address",     name: "address",    placeholder: "456 Client Ave" },
                { label: "Phone",       name: "phone",      placeholder: "+1 (555) 000-0000" },
              ].map(({ label, name, placeholder }) => (
                <div key={name}>
                  <label className={labelCls}>{label}</label>
                  <input name={name} value={formData.billTo?.[name] ?? ""} onChange={(e) => handleInputChange(e, "billTo")} placeholder={placeholder} className={inputCls} />
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-700">Line Items</h3>
              <button onClick={handleAddItem} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="col-span-12 sm:col-span-4">
                    <input name="name" value={item.name ?? ""} onChange={(e) => handleInputChange(e, "items", index)} placeholder="Item description" className={inputCls} />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input type="number" name="quantity" value={item.quantity ?? 1} onChange={(e) => handleInputChange(e, "items", index)} min="1" className={inputCls} />
                  </div>
                  <div className="col-span-4 sm:col-span-3">
                    <input type="number" name="unitPrice" value={item.unitPrice ?? 0} onChange={(e) => handleInputChange(e, "items", index)} min="0" step="0.01" placeholder="Unit Price" className={inputCls} />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input type="number" name="taxPercent" value={item.taxPercent ?? 0} onChange={(e) => handleInputChange(e, "items", index)} min="0" max="100" placeholder="Tax %" className={inputCls} />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => handleRemoveItem(index)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end mt-3">
              <div className="text-sm font-bold text-gray-900">
                Total: <span className="text-blue-600">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={2} placeholder="Any additional notes…" className={`${inputCls} resize-none`} />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><FileText className="w-4 h-4" /> Save Recurring</>}
            </button>
          </div>
        </div>
      )}

      {/* Recurring List */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
        </div>
      ) : recurringList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">No recurring invoices yet</p>
          <p className="text-xs text-gray-400 mb-5">Set up automated billing schedules</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Schedule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recurringList.map((rec) => (
            <div key={rec._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">

              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {rec.billTo?.clientName || "—"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {rec.description || "Recurring Invoice"}
                  </p>
                </div>
                <StatusBadge status={rec.status} />
              </div>

              {/* Amount + Frequency */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{fmt(rec.total)}</span>
                <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full capitalize">
                  {rec.frequency === "custom" ? `Every ${rec.customDays} days` : rec.frequency}
                </span>
              </div>

              {/* Dates */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Started: {moment(rec.startDate).format("MMM D, YYYY")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Next: <span className="font-medium text-blue-600">{moment(rec.nextDueDate).format("MMM D, YYYY")}</span></span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                {rec.status === "active" && (
                  <button
                    onClick={() => handlePause(rec._id)}
                    disabled={actionLoading === rec._id + "pause"}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 border border-amber-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === rec._id + "pause"
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Pause className="w-3.5 h-3.5" />
                    }
                    Pause
                  </button>
                )}

                {rec.status === "paused" && (
                  <button
                    onClick={() => handleResume(rec._id)}
                    disabled={actionLoading === rec._id + "resume"}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-green-600 hover:bg-green-50 border border-green-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === rec._id + "resume"
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Play className="w-3.5 h-3.5" />
                    }
                    Resume
                  </button>
                )}

                {rec.status !== "cancelled" && (
                  <button
                    onClick={() => handleCancel(rec._id)}
                    disabled={actionLoading === rec._id + "cancel"}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === rec._id + "cancel"
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <X className="w-3.5 h-3.5" />
                    }
                    Cancel
                  </button>
                )}

                <button
                  onClick={() => handleDelete(rec._id)}
                  disabled={actionLoading === rec._id + "delete"}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                  title="Delete permanently"
                >
                  {actionLoading === rec._id + "delete"
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringPage;