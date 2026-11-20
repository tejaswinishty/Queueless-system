"use client";

import { useEffect, useState } from "react";
import { fetchCrowdOverview, CrowdOverview } from "@/lib/api";
import { TrendingUp, Clock, Calendar, BarChart3, Info, Sparkles, CheckCircle2 } from "lucide-react";

export default function CrowdPredictionPage() {
  const [crowd, setCrowd] = useState<CrowdOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrowdOverview()
      .then((data) => setCrowd(data))
      .catch((err) => console.error("Error loading crowd forecast", err))
      .finally(() => setLoading(false));
  }, []);

  const getBarColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-emerald-500 hover:bg-emerald-600";
      case "MODERATE":
        return "bg-blue-500 hover:bg-blue-600";
      case "HIGH":
        return "bg-amber-500 hover:bg-amber-600";
      case "PEAK":
        return "bg-rose-500 hover:bg-rose-600";
      default:
        return "bg-slate-400";
    }
  };

  const getBadgeStyle = (level?: string) => {
    switch (level) {
      case "LOW":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "MODERATE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "HIGH":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PEAK":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Highlight Recommendation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AI Crowd Forecast Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Crowd Analytics & Peak Predictions
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Real-time queue velocity combined with 14-day historical time-slot analytics to predict rush hours and minimize customer wait time.
          </p>
        </div>

        {/* Highlighted Recommendation Callout */}
        <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Optimal Visiting Window Today
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {crowd?.recommendedVisitWindow || "1:00 PM - 2:30 PM"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-300">Live Status:</span>
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getBadgeStyle(crowd?.currentCrowdStatus)}`}>
              {crowd?.currentCrowdStatus || "NORMAL"} CROWD
            </span>
          </div>
        </div>
      </div>

      {/* Hourly Crowd & Wait Time Prediction Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Hourly Rush Forecast & Estimated Wait
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Predicted arrival footfall and average queue waiting duration per hour slot
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Low (&le;8m)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> Moderate (9-16m)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> High (17-24m)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500" /> Peak (&ge;25m)
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {crowd?.hourlyForecast?.map((item) => {
            // Footfall max is approx 50, scale height
            const heightPercent = Math.min(100, Math.max(20, (item.predictedFootfall / 50) * 100));

            return (
              <div
                key={item.hour}
                className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition group"
              >
                <div className="text-xs font-bold text-slate-700">
                  {item.timeLabel.replace(":00", "")}
                </div>

                {/* Vertical bar representation */}
                <div className="w-full h-36 bg-slate-200/60 rounded-xl my-3 flex flex-col justify-end p-1.5 relative overflow-hidden">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-lg transition-all duration-500 ${getBarColor(item.crowdLevel)}`}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-slate-900/80 text-white text-[11px] p-1 text-center font-bold rounded-xl">
                    {item.predictedFootfall} arrivals
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs font-black text-slate-900">
                    ~{item.predictedWaitMinutes}m
                  </div>
                  <div className="text-[10px] text-slate-400">
                    est. wait
                  </div>
                  <span className={`inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${getBadgeStyle(item.crowdLevel)}`}>
                    {item.crowdLevel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Benchmarks & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category Processing Benchmarks */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Average Service Duration by Category
          </h3>
          <div className="space-y-4">
            {crowd?.avgWaitByCategory &&
              Object.entries(crowd.avgWaitByCategory).map(([cat, minutes]) => (
                <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-semibold text-slate-800">
                    {cat}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">
                      {minutes} minutes
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Queue Strategy & Smart Optimization Rules */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Crowd Prediction Strategy
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Morning Surge (10:00 AM - 12:00 PM):</strong> High footfall window. Counters allocate overflow tasks to reduce bottlenecks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Midday Dip (1:00 PM - 2:30 PM):</strong> Lowest expected waiting duration. Best recommended arrival time for users.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Dynamic EWT Algorithm:</strong> Evaluates live line position, active operating counters, and historical category velocity.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center gap-3">
            <Info className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>Staff counters dynamically adjust priority routing based on the longest waiting customer in queue.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
