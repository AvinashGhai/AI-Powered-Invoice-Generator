// AIScheduleModal.jsx
import React, { useState } from "react";
import { X, Sparkles, Loader2, ArrowRight } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";

const AIScheduleModal = ({ isOpen, onClose, onPrefill }) => {
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!text.trim()) { toast.error("Please describe your recurring invoice."); return; }
    setLoading(true);
    try {
      const response = await axiosInstance.post(API_PATHS.AI.PARSE_RECURRING, { text });
      toast.success("Schedule extracted!");
      onPrefill(response.data);
      onClose();
      setText("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to parse schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">

        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">AI Schedule Setup</h2>
            <p className="text-xs text-gray-400">Describe your recurring invoice in plain text</p>
          </div>
        </div>

        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder={`Example:\n"Bill John Smith $500 every month for web hosting starting May 1"\n"Charge Acme Corp $2000 quarterly for consulting"`}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all bg-white resize-none"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            AI will extract client, amount, frequency and start date automatically.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-all"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
              : <><ArrowRight className="w-4 h-4" /> Generate Schedule</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIScheduleModal;