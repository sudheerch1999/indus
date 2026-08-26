import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealerPulse — Toyota Network Dashboard",
  description: "Real-time dealership performance dashboard for Toyota network leadership",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">
        <header className="bg-slate-900 sticky top-0 z-50">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            {/* Brand */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/40">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 2L14 13H2L8 2Z" fill="white" fillOpacity="0.9"/>
                  <circle cx="8" cy="10" r="1.5" fill="white"/>
                </svg>
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight">DealerPulse</span>
                <span className="text-slate-400 text-xs ml-2 hidden sm:inline">Toyota Network</span>
              </div>
            </a>

            {/* Status chips */}
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                5 Branches
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                30 Reps
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                Jun – Dec 2025
              </span>
            </div>
          </div>
        </header>
        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
