// CreateWithAIModal.jsx
import React, { useState } from "react";
import { X, Sparkles, Loader2, ArrowRight } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const CreateWithAIModal = ({ isOpen, onClose, onNavigate }) => {
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("Please describe your invoice.");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.PARSE_INVOICE_TEXT, { text });
      const aiData   = response.data;
      toast.success("Invoice details extracted!");
      onClose();
      // Navigate to create invoice and pre-fill with AI data
      onNavigate("invoices/new", { aiPrefill: aiData });
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse invoice details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Create Invoice with AI</h2>
            <p className="text-xs text-gray-400">Describe your invoice in plain text</p>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={`Example:\n"Invoice for John Smith at Acme Corp for web design services: 10 hours at $150/hour and 5 hours of consulting at $200/hour. Due in 30 days."`}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white resize-none"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            AI will extract client details, line items, and amounts automatically.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-all"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><ArrowRight className="w-4 h-4" /> Generate Invoice</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWithAIModal;