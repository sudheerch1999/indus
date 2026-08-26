import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden>
          <circle cx="16" cy="16" r="13" stroke="#94A3B8" strokeWidth="2" />
          <path d="M16 10v6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="21.5" r="1.25" fill="#94A3B8" />
        </svg>
      </div>

      {/* Copy */}
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">404</p>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 max-w-xs mb-8">
        This branch, rep, or page doesn&apos;t exist in the network. The URL may be incorrect or the resource was removed.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
        >
          Back to Overview
        </Link>
        <Link
          href="/branch/B1"
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          View Downtown Toyota
        </Link>
      </div>

      {/* Branches quick nav */}
      <div className="mt-10 pt-8 border-t border-slate-100 w-full max-w-sm">
        <p className="text-xs text-slate-400 mb-4 uppercase tracking-widest">All branches</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: "B1", name: "Downtown" },
            { id: "B2", name: "Highway" },
            { id: "B3", name: "Lakeside" },
            { id: "B4", name: "Central" },
            { id: "B5", name: "Eastside" },
          ].map((b) => (
            <Link
              key={b.id}
              href={`/branch/${b.id}`}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
