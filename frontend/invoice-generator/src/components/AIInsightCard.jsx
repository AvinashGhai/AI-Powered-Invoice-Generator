import { useState, useEffect } from "react";
import { Lightbulb, Sparkles, RefreshCw } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const AIInsightsCard = () => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.AI.GET_DASHBOARD_SUMMARY);
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error("Failed to fetch AI insights", error);
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">AI Insights</h3>
        </div>
        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 border border-gray-100 disabled:opacity-40 transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          // Skeleton
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-3.5 p-4 rounded-xl border border-gray-100 bg-gray-50 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-2.5 bg-gray-200 rounded w-full" />
                <div className="h-2.5 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))
        ) : insights.length > 0 ? (
          insights.map((insight, index) => (
            <div
              key={index}
              className="flex gap-3.5 p-4 rounded-xl border border-violet-100 bg-violet-50 hover:shadow-sm transition-all cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
            </div>
          ))
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No insights available yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50/60 border-t border-gray-50">
        <p className="text-[11px] text-gray-400 text-center">
          Insights generated from your invoice history and payment patterns
        </p>
      </div>
    </div>
  );
};

export default AIInsightsCard;