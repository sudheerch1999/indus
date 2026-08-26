"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { MONTHS, formatMonth } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function MonthPicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("month");

  function navigate(month: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (month) params.set("month", month);
    else params.delete("month");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 flex-wrap p-1 bg-slate-100 rounded-xl">
      <button
        onClick={() => navigate(null)}
        className={cn(
          "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
          !current
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        All
      </button>
      {MONTHS.map((m) => (
        <button
          key={m}
          onClick={() => navigate(m)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
            current === m
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          {formatMonth(m).split(" ")[0]}
        </button>
      ))}
    </div>
  );
}
