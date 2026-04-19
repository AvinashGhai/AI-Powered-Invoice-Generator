// InvoiceDetail.jsx
import { useState, useEffect, useRef } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Loader2, Edit, Printer, AlertCircle, Mail } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import ReminderModal from "../../components/invoices/ReminderModal";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const InvoiceDetail = ({ invoiceId, onNavigate }) => {
  const [invoice,              setInvoice]              = useState(null);
  const [loading,              setLoading]              = useState(true);
  const [isReminderModalOpen,  setIsReminderModalOpen]  = useState(false);
  const invoiceRef = useRef();

  useEffect(() => {
    if (!invoiceId) return;
    const fetchInvoice = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.INVOICE.GET_INVOICE_BY_ID(invoiceId));
        setInvoice(response.data);
      } catch (error) {
        toast.error("Failed to fetch invoice.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50 rounded-lg">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Invoice Not Found</h3>
        <p className="text-slate-500 mb-6 max-w-md">
          The invoice you are looking for does not exist or could not be loaded.
        </p>
        <button
          onClick={() => onNavigate("invoices")}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to All Invoices
        </button>
      </div>
    );
  }

  const clientName = invoice.billTo?.clientName || invoice.billTo?.Clientname || "—";
  const STATUS_CONFIG = {
    paid:   { label: "Paid",   bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
    unpaid: { label: "Unpaid", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-400" },
  };
  const statusCfg = STATUS_CONFIG[invoice.status?.toLowerCase()] ?? STATUS_CONFIG.unpaid;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        invoice={invoice}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Created {moment(invoice.invoiceDate).format("MMM D, YYYY")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Send Reminder
          </button>
          <button
            onClick={() => onNavigate("invoices/new", invoice)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-amber-600 hover:bg-amber-50 border border-amber-200 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Card */}
      <div ref={invoiceRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Top strip */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-xs font-medium uppercase tracking-wide mb-1">Invoice</p>
              <p className="text-2xl font-bold">{invoice.invoiceNumber}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/20 text-white`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* Bill From / To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">From</p>
              <p className="font-semibold text-gray-900">{invoice.billFrom?.businessName || "—"}</p>
              <p className="text-sm text-gray-500 mt-1">{invoice.billFrom?.email || ""}</p>
              <p className="text-sm text-gray-500">{invoice.billFrom?.address || ""}</p>
              <p className="text-sm text-gray-500">{invoice.billFrom?.phone || ""}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Bill To</p>
              <p className="font-semibold text-gray-900">{clientName}</p>
              <p className="text-sm text-gray-500 mt-1">{invoice.billTo?.email || ""}</p>
              <p className="text-sm text-gray-500">{invoice.billTo?.address || ""}</p>
              <p className="text-sm text-gray-500">{invoice.billTo?.phone || ""}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Invoice Date", value: moment(invoice.invoiceDate).format("MMM D, YYYY") },
              { label: "Due Date",     value: invoice.dueDate ? moment(invoice.dueDate).format("MMM D, YYYY") : "—" },
              { label: "Payment Terms", value: invoice.paymentTerms || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Line Items */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Line Items</p>
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Description", "Qty", "Unit Price", "Tax %", "Total"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoice.items?.map((item, i) => {
                    const lineTotal =
                      (Number(item.quantity) || 0) *
                      (Number(item.unitPrice) || 0) *
                      (1 + (Number(item.taxPercent) || 0) / 100);
                    return (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3 text-gray-500">{item.quantity}</td>
                        <td className="px-4 py-3 text-gray-500">{fmt(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-gray-500">{item.taxPercent ?? 0}%</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{fmt(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              {[
                { label: "Subtotal", value: fmt(invoice.subtotal) },
                { label: "Tax",      value: fmt(invoice.tax)      },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm text-gray-500">
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">{fmt(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}

        </div>
      </div>

      {/* Back */}
      <div className="pb-6">
        <button
          onClick={() => onNavigate("invoices")}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to All Invoices
        </button>
      </div>

    </div>
  );
};

export default InvoiceDetail;