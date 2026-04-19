// ReminderModal.jsx
import React, { useState } from "react";
import { X, Mail, Loader2, CheckCircle, Sparkles } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const ReminderModal = ({ isOpen, onClose, invoice }) => {
  const [generating,     setGenerating]     = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [editedEmail,    setEditedEmail]    = useState("");
  const [sent,           setSent]           = useState(false);

  if (!isOpen || !invoice) return null;

  const clientName  = invoice.billTo?.clientName || invoice.billTo?.Clientname || "Client";
  const clientEmail = invoice.billTo?.email || "";

  /* ── Generate ────────────────────────────────────────── */
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_REMINDER, {
        invoiceId:     invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        clientName,
        clientEmail,
        amount:        invoice.total,
        dueDate:       invoice.dueDate,
      });
      const email = response.data.email;
      setGeneratedEmail(email);
      setEditedEmail(email); // prefill editable textarea
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate reminder email.");
    } finally {
      setGenerating(false);
    }
  };

  /* ── Send (simulated) ────────────────────────────────── */
  const handleSend = () => {
    setSent(true);
    toast.success("Reminder sent successfully!");
    setTimeout(() => {
      setSent(false);
      setGeneratedEmail(null);
      setEditedEmail("");
      onClose();
    }, 1500);
  };

  /* ── Copy ────────────────────────────────────────────── */
  const handleCopy = () => {
    navigator.clipboard.writeText(editedEmail);
    toast.success("Email copied to clipboard!");
  };

  /* ── Close ───────────────────────────────────────────── */
  const handleClose = () => {
    setGeneratedEmail(null);
    setEditedEmail("");
    setSent(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">AI Payment Reminder</h2>
            <p className="text-xs text-gray-400">Invoice {invoice.invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Client</span>
            <span className="font-medium text-gray-800">{clientName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-800">{clientEmail || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount Due</span>
            <span className="font-semibold text-gray-900">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(invoice.total || 0)}
            </span>
          </div>
        </div>

        {/* Email Editor — shown after generation */}
        {generatedEmail ? (
          <div className="space-y-3">

            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Edit Email Before Sending
              </p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {generating
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Sparkles className="w-3 h-3" />
                }
                Regenerate
              </button>
            </div>

            {/* Editable textarea */}
            <textarea
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              rows={10}
              className="w-full px-3 py-2.5 text-xs text-gray-700 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white resize-none leading-relaxed font-sans"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={handleSend}
                disabled={sent || !editedEmail.trim()}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
              >
                {sent
                  ? <><CheckCircle className="w-4 h-4" /> Sent!</>
                  : <><Mail className="w-4 h-4" /> Send Reminder</>
                }
              </button>
            </div>
          </div>

        ) : (
          /* Before generation */
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-all"
            >
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                : <><Sparkles className="w-4 h-4" /> Generate Reminder</>
              }
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReminderModal;