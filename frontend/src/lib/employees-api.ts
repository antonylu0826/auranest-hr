import { apiFetch, type PaginatedResult, type ListQuery } from "./api";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type EmploymentStatus = "ACTIVE" | "RESIGNED" | "TERMINATED" | "ON_LEAVE";

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  orgUnitId: string | null;
  nationalId: string | null;
  gender: Gender | null;
  birthDate: string | null;
  nationality: string | null;
  phone: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  hireDate: string | null;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  employeeNumber: string;
  name: string;
  userId?: string | null;
  orgUnitId?: string | null;
  nationalId?: string | null;
  gender?: Gender | null;
  birthDate?: string | null;
  nationality?: string;
  phone?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  hireDate?: string | null;
  employmentType?: EmploymentType;
  employmentStatus?: EmploymentStatus;
}

export type UpdateEmployeeData = Partial<CreateEmployeeData>;

function toQs(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const employeesApi = {
  list: (query?: ListQuery & { status?: string }) =>
    apiFetch<PaginatedResult<Employee>>(`/employees${toQs({ ...query })}`),
  get: (id: string) => apiFetch<Employee>(`/employees/${id}`),
  create: (data: CreateEmployeeData) =>
    apiFetch<Employee>("/employees", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateEmployeeData) =>
    apiFetch<Employee>(`/employees/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/employees/${id}`, { method: "DELETE" }),
};
