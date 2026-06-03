import { apiFetch, type PaginatedResult, type ListQuery } from "./api";

export interface JobTitle {
  id: string;
  name: string;
  code: string;
  department: string | null;
  grade: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobTitleData {
  name: string;
  code: string;
  department?: string | null;
  grade?: string | null;
  isActive?: boolean;
}

export type UpdateJobTitleData = Partial<CreateJobTitleData>;

function toQs(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const jobTitlesApi = {
  list: (query?: ListQuery) =>
    apiFetch<PaginatedResult<JobTitle>>(`/job-titles${toQs({ ...query })}`),
  get: (id: string) => apiFetch<JobTitle>(`/job-titles/${id}`),
  create: (data: CreateJobTitleData) =>
    apiFetch<JobTitle>("/job-titles", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateJobTitleData) =>
    apiFetch<JobTitle>(`/job-titles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/job-titles/${id}`, { method: "DELETE" }),
};
