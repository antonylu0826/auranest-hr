import { apiFetch, type PaginatedResult, type ListQuery } from "./api";

export const DEPENDENT_RELATIONSHIPS = ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'] as const;
export type DependentRelationship = (typeof DEPENDENT_RELATIONSHIPS)[number];

export interface EmployeeDependent {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  name: string;
  relationship: DependentRelationship;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birthDate: string | null;
  nationalId: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDependentData {
  employeeId: string;
  name: string;
  relationship: DependentRelationship;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  birthDate?: string | null;
  nationalId?: string | null;
  phone?: string | null;
  isActive?: boolean;
}

export type UpdateEmployeeDependentData = Partial<CreateEmployeeDependentData>;

function toQs(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const employeeDependentsApi = {
  list: (query?: ListQuery & { employeeId?: string }) =>
    apiFetch<PaginatedResult<EmployeeDependent>>(`/employee-dependents${toQs({ ...query })}`),
  get: (id: string) => apiFetch<EmployeeDependent>(`/employee-dependents/${id}`),
  create: (data: CreateEmployeeDependentData) =>
    apiFetch<EmployeeDependent>("/employee-dependents", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateEmployeeDependentData) =>
    apiFetch<EmployeeDependent>(`/employee-dependents/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/employee-dependents/${id}`, { method: "DELETE" }),
};
