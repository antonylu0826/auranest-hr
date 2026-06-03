import { apiFetch, type PaginatedResult, type ListQuery } from "./api";

export type ShiftCategory = "FIXED" | "ROTATING";

export interface ShiftType {
  id: string;
  name: string;
  code: string;
  category: ShiftCategory;
  workStart: string | null;
  workEnd: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  observeHolidays: boolean;
  flexEarliestStart: string | null;
  flexLatestStart: string | null;
  workDaysInCycle: number | null;
  restDaysInCycle: number | null;
  cycleAnchorDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShiftTypeData {
  name: string;
  code: string;
  category?: ShiftCategory;
  workStart?: string | null;
  workEnd?: string | null;
  breakStart?: string | null;
  breakEnd?: string | null;
  observeHolidays?: boolean;
  flexEarliestStart?: string | null;
  flexLatestStart?: string | null;
  workDaysInCycle?: number | null;
  restDaysInCycle?: number | null;
  cycleAnchorDate?: string | null;
  isActive?: boolean;
}

export type UpdateShiftTypeData = Partial<CreateShiftTypeData>;

function toQs(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const shiftTypesApi = {
  list: (query?: ListQuery) =>
    apiFetch<PaginatedResult<ShiftType>>(`/shift-types${toQs({ ...query })}`),
  get: (id: string) => apiFetch<ShiftType>(`/shift-types/${id}`),
  create: (data: CreateShiftTypeData) =>
    apiFetch<ShiftType>("/shift-types", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateShiftTypeData) =>
    apiFetch<ShiftType>(`/shift-types/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/shift-types/${id}`, { method: "DELETE" }),
};
