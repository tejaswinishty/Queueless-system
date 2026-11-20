"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { fetchLiveQueue, fetchCrowdOverview, LiveQueueStatus, CrowdOverview } from "@/lib/api";
import { Users, Clock, CheckCircle2, AlertCircle, Volume2, ArrowRight } from "lucide-react";

export default function LiveDisplayPage() {
  const [queue, setQueue] = useState<LiveQueueStatus | null>(null);
  const [crowd, setCrowd] = useState<CrowdOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastAnnouncedToken, setLastAnnouncedToken] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Audio Chime synthesizer via Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log("Audio alert error", e);
    }
  };

  const loadData = async () => {
    try {
      const [queueData, crowdData] = await Promise.all([
        fetchLiveQueue(),
        fetchCrowdOverview(),
      ]);
      setQueue(queueData);
      setCrowd(crowdData);

      // Check for newly called token
      if (queueData.currentServingTokens && queueData.currentServingTokens.length > 0) {
        const topServing = queueData.currentServingTokens[0].tokenNumber;
        if (lastAnnouncedToken && topServing !== lastAnnouncedToken && soundEnabled) {
          playChime();
        }
        setLastAnnouncedToken(topServing);
      }
    } catch (err) {
      console.error("Failed to load queue data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [soundEnabled, lastAnnouncedToken]);

  const getCrowdBg = (level?: string) => {
    switch (level) {
      case "LOW":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "MODERATE":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "HIGH":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PEAK":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Quick Stats & Crowd Level */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {queue?.totalWaiting ?? "--"}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Waiting in Queue
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              ~{crowd?.currentEstimatedWaitMinutes ?? 5} min
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Avg Dynamic Wait
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {queue?.totalCompletedToday ?? "--"}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Served Today
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${getCrowdBg(crowd?.currentCrowdStatus)}`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">
              Current Crowd Status
            </div>
            <div className="text-2xl font-black mt-0.5">
              {crowd?.currentCrowdStatus ?? "NORMAL"}
            </div>
          </div>
          <Link
            href="/crowd"
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 shadow-sm transition flex items-center gap-1"
          >
            Forecast <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Kiosk Board: Serving Now */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  Now Serving (Live Display)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proceed immediately when your token is called
                </p>
              </div>

              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playChime();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  soundEnabled
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                {soundEnabled ? "Chime On" : "Enable Chime"}
              </button>
            </div>

            {queue?.currentServingTokens && queue.currentServingTokens.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {queue.currentServingTokens.map((token) => (
                  <div
                    key={token.id}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {token.serviceCategoryName}
                      </span>
                      <span className="text-sm font-bold text-emerald-400 bg-black/30 px-3 py-1 rounded-lg">
                        Counter {token.assignedCounterNumber || "-"}
                      </span>
                    </div>

                    <div className="my-4 text-center">
                      <div className="text-4xl sm:text-5xl font-black tracking-wider text-emerald-300 font-mono">
                        {token.tokenNumber}
                      </div>
                      <div className="text-sm text-slate-300 mt-1 font-medium">
                        {token.customerName}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 text-center">
                      Called at {token.calledAt ? new Date(token.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">All active tokens served.</p>
                <p className="text-xs text-slate-500 mt-1">Counters are ready for the next tickets.</p>
              </div>
            )}
          </div>

          {/* Counter Service Status Bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Service Desk Counters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {queue?.counters?.map((counter) => (
                <div
                  key={counter.id}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-slate-800">
                      Counter {counter.counterNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        counter.status === "BUSY"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {counter.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Staff: <span className="font-medium text-slate-700">{counter.operatorName}</span>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Serving:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {counter.currentServingToken || "None"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Upcoming Tokens & Quick Join */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Next in Line
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {queue?.upcomingTokens?.length ?? 0} Next
              </span>
            </div>

            {queue?.upcomingTokens && queue.upcomingTokens.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {queue.upcomingTokens.map((t, idx) => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-mono font-bold text-slate-800">
                          {t.tokenNumber}
                        </div>
                        <div className="text-xs text-slate-500">
                          {t.serviceCategoryName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-emerald-600">
                        ~{t.estimatedWaitMinutes} min
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Est. wait
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No tickets waiting in line.
              </div>
            )}
          </div>

          {/* Take Token CTA Kiosk Widget */}
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                Self-Service Kiosk
              </span>
              <h4 className="text-xl font-black mt-3">
                Joining the queue?
              </h4>
              <p className="text-xs text-emerald-100 mt-1">
                Skip standing in line. Generate your virtual token on your phone and get notified when it is your turn.
              </p>
            </div>
            <Link
              href="/join"
              className="mt-6 w-full py-3 bg-white text-emerald-700 font-bold rounded-xl text-center shadow-md hover:bg-slate-100 transition"
            >
              Get Your Token Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
