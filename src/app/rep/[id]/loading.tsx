export default function RepLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-56 bg-slate-200 rounded" />

      {/* Rep header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-slate-200 flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-6 w-44 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100" />
        ))}
      </div>

      {/* Lead list */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-48 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
