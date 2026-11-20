import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "QueueLess - Smart Queue Management & Crowd Prediction",
  description: "Eliminate physical lines with smart virtual queuing and AI-driven crowd predictions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-800 bg-slate-50 flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                Q
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  QueueLess
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Smart Crowd AI
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/"
                className="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition"
              >
                Live Display
              </Link>
              <Link
                href="/join"
                className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition"
              >
                + Take Token
              </Link>
              <Link
                href="/operator"
                className="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition"
              >
                Operator Desk
              </Link>
              <Link
                href="/crowd"
                className="px-3 py-2 text-sm font-medium rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-slate-100 transition"
              >
                Crowd Forecast
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
            <p>QueueLess – Smart Queue Management & Crowd Prediction System</p>
            <p className="mt-1">Powered by Next.js & Spring Boot 3 with H2 Engine</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
