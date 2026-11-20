"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchTokenDetails, TokenResponse } from "@/lib/api";
import { Clock, Users, CheckCircle, Bell, ArrowLeft, AlertTriangle } from "lucide-react";

export default function TokenTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const tokenNumber = params.tokenNumber as string;

  const [token, setToken] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wasCalled, setWasCalled] = useState(false);

  // Sound alert when status changes to SERVING
  const playAlert = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2); // A5

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch (e) {
      console.log("Audio notification error", e);
    }
  };

  const loadToken = async () => {
    try {
      const data = await fetchTokenDetails(tokenNumber);
      if (data.status === "SERVING" && !wasCalled) {
        setWasCalled(true);
        playAlert();
      }
      setToken(data);
    } catch (err: any) {
      setError("Unable to find or load token " + tokenNumber);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tokenNumber) return;
    loadToken();
    const interval = setInterval(loadToken, 3000);
    return () => clearInterval(interval);
  }, [tokenNumber, wasCalled]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Fetching your queue status...</p>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="max-w-md mx-auto py-12 text-center bg-white p-8 rounded-3xl border border-slate-200">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Token Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || "The requested token does not exist."}</p>
        <Link
          href="/join"
          className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
        >
          Issue a New Token
        </Link>
      </div>
    );
  }

  const isServing = token.status === "SERVING";
  const isCompleted = token.status === "COMPLETED";

  return (
    <div className="max-w-lg mx-auto py-4 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Live Display
      </Link>

      {/* Main Ticket Card */}
      <div className={`bg-white rounded-3xl border p-6 sm:p-8 shadow-lg transition-all ${
        isServing
          ? "border-emerald-500 ring-4 ring-emerald-500/20"
          : "border-slate-200"
      }`}>
        {/* Status Callout */}
        {isServing ? (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center animate-bounce">
            <div className="flex items-center justify-center gap-2 font-black text-lg">
              <Bell className="w-5 h-5" /> It's Your Turn Now!
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Please proceed immediately to <strong>Counter {token.assignedCounterNumber}</strong>
            </p>
          </div>
        ) : isCompleted ? (
          <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-center">
            <div className="flex items-center justify-center gap-2 font-bold text-sm">
              <CheckCircle className="w-4 h-4" /> Service Finished
            </div>
            <p className="text-xs text-blue-600 mt-0.5">Thank you for using QueueLess!</p>
          </div>
        ) : (
          <div className="mb-6 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Waiting in Queue
            </div>
            <span>Auto-updating live</span>
          </div>
        )}

        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {token.serviceCategoryName}
          </span>
          <div className="text-6xl font-black font-mono tracking-wider text-slate-900 my-2">
            {token.tokenNumber}
          </div>
          <div className="text-sm font-semibold text-slate-600">
            {token.customerName}
          </div>
        </div>

        {/* Live Counters / Stats */}
        {!isCompleted && (
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <Users className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <div className="text-2xl font-black text-slate-900">
                {isServing ? "0" : `#${token.queuePosition}`}
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {isServing ? "Currently at counter" : "Your Line Position"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <Clock className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <div className="text-2xl font-black text-emerald-600">
                {isServing ? "Now" : `~${token.estimatedWaitMinutes}m`}
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                {isServing ? "Service in progress" : "Est. Waiting Time"}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Issued at {new Date(token.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
