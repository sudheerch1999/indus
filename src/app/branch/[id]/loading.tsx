export default function BranchLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-48 bg-slate-200 rounded" />

      {/* Title */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-100 rounded" />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100" />
        ))}
      </div>

      {/* Wide chart */}
      <div className="h-52 bg-white rounded-2xl border border-slate-100" />

      {/* Rep leaderboard */}
      <div className="h-72 bg-white rounded-2xl border border-slate-100" />

      {/* 2-col row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-56 bg-white rounded-2xl border border-slate-100" />
        <div className="h-56 bg-white rounded-2xl border border-slate-100" />
      </div>
    </div>
  );
}
