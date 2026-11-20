"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCategories, issueToken, ServiceCategoryInfo, TokenResponse } from "@/lib/api";
import { CreditCard, Receipt, LifeBuoy, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

export default function JoinQueuePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategoryInfo[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("BANKING");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<TokenResponse | null>(null);

  useEffect(() => {
    fetchCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0) setSelectedCat(cats[0].code);
      })
      .catch((e) => {
        // Fallback categories if server not yet started
        setCategories([
          { code: "BANKING", prefix: "BNK", displayName: "Banking & Cash Transactions", estimatedMinutesPerPerson: 6 },
          { code: "BILLING", prefix: "BIL", displayName: "Billing & Account Services", estimatedMinutesPerPerson: 4 },
          { code: "SUPPORT", prefix: "SUP", displayName: "Customer Support & Inquiries", estimatedMinutesPerPerson: 8 },
          { code: "DOCUMENT", prefix: "DOC", displayName: "Document & ID Verification", estimatedMinutesPerPerson: 10 },
        ]);
      });
  }, []);

  const getServiceIcon = (code: string) => {
    switch (code) {
      case "BANKING":
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case "BILLING":
        return <Receipt className="w-5 h-5 text-blue-600" />;
      case "SUPPORT":
        return <LifeBuoy className="w-5 h-5 text-amber-600" />;
      case "DOCUMENT":
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await issueToken({
        customerName: name,
        customerPhone: phone,
        serviceCategory: selectedCat,
      });
      setGeneratedToken(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate token. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      {!generatedToken ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Virtual Queue Ticket
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-3">
              Take Your Turn Online
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Select your service to receive a virtual queue token and live wait updates.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Service Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCat === cat.code;
                  return (
                    <button
                      type="button"
                      key={cat.code}
                      onClick={() => setSelectedCat(cat.code)}
                      className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="mt-0.5">{getServiceIcon(cat.code)}</div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {cat.displayName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          ~{cat.estimatedMinutesPerPerson} min / person
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                2. Your Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                3. Phone Number (Optional - for SMS alerts)
              </label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 text-base"
            >
              {loading ? "Generating Ticket..." : "Generate Virtual Token"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        /* Ticket Success Card */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Token Issued Successfully
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              You are in line!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Keep this screen open or save your token number.
            </p>
          </div>

          {/* Ticket Visual */}
          <div className="max-w-xs mx-auto p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-lg border border-slate-700 relative overflow-hidden">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">
              {generatedToken.serviceCategoryName}
            </div>
            <div className="text-5xl font-black font-mono tracking-wider text-emerald-400 my-4">
              {generatedToken.tokenNumber}
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {generatedToken.customerName}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700 grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-slate-400">Position in Line</div>
                <div className="font-bold text-white text-base mt-0.5">
                  #{generatedToken.queuePosition}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Est. Wait Time</div>
                <div className="font-bold text-emerald-400 text-base mt-0.5">
                  ~{generatedToken.estimatedWaitMinutes} min
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => router.push(`/track/${generatedToken.tokenNumber}`)}
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-sm text-sm"
            >
              Open Live Waiting Tracker
            </button>
            <button
              onClick={() => {
                setGeneratedToken(null);
                setName("");
                setPhone("");
              }}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition text-sm"
            >
              Issue Another Token
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
