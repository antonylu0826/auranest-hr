import { apiFetch, type PaginatedResult, type ListQuery } from "./api";

export type OrgUnitLevel = "COMPANY" | "DIVISION" | "DEPARTMENT" | "TEAM";

export interface OrgUnit {
  id: string;
  name: string;
  level: OrgUnitLevel;
  parentId: string | null;
  headId: string | null;
  parent: { id: string; name: string } | null;
  head: { id: string; name: string } | null;
  _count: { children: number; employees: number };
  createdAt: string;
  updatedAt: string;
}

export interface OrgUnitTreeNode {
  id: string;
  name: string;
  level: OrgUnitLevel;
  parentId: string | null;
  headId: string | null;
  head: { id: string; name: string } | null;
  _count: { employees: number };
  children: OrgUnitTreeNode[];
}

export interface CreateOrgUnitData {
  name: string;
  level: OrgUnitLevel;
  parentId?: string | null;
  headId?: string | null;
}

export type UpdateOrgUnitData = Partial<CreateOrgUnitData>;

function toQs(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const orgUnitsApi = {
  list: (query?: ListQuery) =>
    apiFetch<PaginatedResult<OrgUnit>>(`/org-units${toQs({ ...query })}`),
  tree: () => apiFetch<OrgUnitTreeNode[]>("/org-units/tree"),
  get: (id: string) => apiFetch<OrgUnit>(`/org-units/${id}`),
  create: (data: CreateOrgUnitData) =>
    apiFetch<OrgUnit>("/org-units", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateOrgUnitData) =>
    apiFetch<OrgUnit>(`/org-units/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/org-units/${id}`, { method: "DELETE" }),
};
