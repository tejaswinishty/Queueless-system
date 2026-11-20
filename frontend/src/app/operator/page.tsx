"use client";

import { useEffect, useState } from "react";
import {
  fetchCounters,
  callNextToken,
  completeCurrentToken,
  skipCurrentToken,
  fetchLiveQueue,
  CounterInfo,
  LiveQueueStatus,
} from "@/lib/api";
import { UserCheck, PhoneCall, CheckCircle2, UserX, Clock, ArrowRight, ShieldCheck } from "lucide-react";

export default function OperatorPage() {
  const [counters, setCounters] = useState<CounterInfo[]>([]);
  const [selectedCounterNum, setSelectedCounterNum] = useState<number>(1);
  const [queue, setQueue] = useState<LiveQueueStatus | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadData = async () => {
    try {
      const [countersData, queueData] = await Promise.all([
        fetchCounters(),
        fetchLiveQueue(),
      ]);
      setCounters(countersData);
      setQueue(queueData);
    } catch (err) {
      console.error("Error loading operator data", err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [selectedCounterNum]);

  const activeCounter = counters.find((c) => c.counterNumber === selectedCounterNum);

  const handleCallNext = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await callNextToken(selectedCounterNum);
      if (updated.currentServingToken) {
        setMessage({ text: `Called token ${updated.currentServingToken} to Counter ${selectedCounterNum}!`, type: "success" });
      } else {
        setMessage({ text: "No more waiting tickets in queue.", type: "error" });
      }
      loadData();
    } catch (e: any) {
      setMessage({ text: e.message || "Failed to call next token", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await completeCurrentToken(selectedCounterNum);
      setMessage({ text: "Ticket marked as completed successfully.", type: "success" });
      loadData();
    } catch (e: any) {
      setMessage({ text: "Failed to complete ticket", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await skipCurrentToken(selectedCounterNum);
      setMessage({ text: "Ticket marked as absent / skipped.", type: "success" });
      loadData();
    } catch (e: any) {
      setMessage({ text: "Failed to skip ticket", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Staff Portal
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">
            Operator Desk Console
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your service counter, call tickets, and log completions.
          </p>
        </div>

        {/* Counter Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
          {counters.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCounterNum(c.counterNumber)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                selectedCounterNum === c.counterNumber
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Counter {c.counterNumber}
              {c.status === "BUSY" && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Serving Token & Action Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <div className="text-xs uppercase font-bold text-slate-400">
                  Currently Managing
                </div>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  Counter {activeCounter?.counterNumber} - {activeCounter?.operatorName}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    activeCounter?.status === "BUSY"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  Status: {activeCounter?.status}
                </span>
                <div className="text-xs text-slate-400 mt-1">
                  Total Served Today: <span className="font-bold text-slate-700">{activeCounter?.totalServedToday ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Serving Ticket Display */}
            {activeCounter?.currentServingToken ? (
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-2xl shadow-md text-center">
                <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                  Customer at Counter
                </span>
                <div className="text-6xl font-black font-mono tracking-wider my-4">
                  {activeCounter.currentServingToken}
                </div>
                <p className="text-xs text-emerald-100">
                  Primary Specialization: {activeCounter.primaryService || "General Services"}
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-700 text-base">Counter is Free</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Click "Call Next Customer" to assign the next waiting ticket to your counter.
                </p>
              </div>
            )}

            {/* Actions Toolbar */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleCallNext}
                disabled={actionLoading}
                className="py-4 px-4 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <PhoneCall className="w-4 h-4" />
                Call Next Customer
              </button>

              <button
                onClick={handleComplete}
                disabled={actionLoading || !activeCounter?.currentServingToken}
                className="py-4 px-4 rounded-xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark Completed
              </button>

              <button
                onClick={handleSkip}
                disabled={actionLoading || !activeCounter?.currentServingToken}
                className="py-4 px-4 rounded-xl bg-slate-100 text-slate-700 font-extrabold hover:bg-slate-200 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <UserX className="w-4 h-4" />
                Mark Absent / Skip
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Waiting Queue List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">
              Waiting Queue ({queue?.upcomingTokens?.length ?? 0})
            </h3>
            <span className="text-xs text-slate-400">Next tickets</span>
          </div>

          {queue?.upcomingTokens && queue.upcomingTokens.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto pr-1">
              {queue.upcomingTokens.map((t, idx) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {t.tokenNumber}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.customerName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ~{t.estimatedWaitMinutes}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No customers waiting in line.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
