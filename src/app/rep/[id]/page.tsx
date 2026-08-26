import { notFound } from "next/navigation";
import { repById, branchById } from "@/lib/data";
import { getLeadsForRep, getKPIs, getAgingLeads } from "@/lib/analytics";
import RepDetailClient from "./RepDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}

export default async function RepPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { month: rawMonth } = await searchParams;
  const month = rawMonth ?? null;

  const rep = repById[id];
  if (!rep) notFound();

  const branch = branchById[rep.branch_id];
  const repLeads = getLeadsForRep(id, month);
  const kpi = getKPIs(repLeads, []);
  const aging = getAgingLeads(repLeads);

  return (
    <RepDetailClient
      repName={rep.name}
      repRole={rep.role}
      branchName={branch?.name ?? ""}
      branchCity={branch?.city ?? ""}
      branchId={rep.branch_id}
      leads={repLeads}
      kpi={kpi}
      agingCount={aging.length}
      month={month}
    />
  );
}
