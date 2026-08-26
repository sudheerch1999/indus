import rawData from "@/data/dealership_data.json";
import type { Branch, SalesRep, Lead, Target, Delivery } from "@/types";

const data = rawData as {
  metadata: Record<string, string>;
  branches: Branch[];
  sales_reps: SalesRep[];
  leads: Lead[];
  targets: Target[];
  deliveries: Delivery[];
};

export const branches: Branch[] = data.branches;
export const salesReps: SalesRep[] = data.sales_reps;
export const leads: Lead[] = data.leads;
export const targets: Target[] = data.targets;
export const deliveries: Delivery[] = data.deliveries;

// Build lookup maps for O(1) access
export const branchById = Object.fromEntries(branches.map((b) => [b.id, b]));
export const repById = Object.fromEntries(salesReps.map((r) => [r.id, r]));
export const deliveryByLeadId = Object.fromEntries(
  deliveries.map((d) => [d.lead_id, d])
);
