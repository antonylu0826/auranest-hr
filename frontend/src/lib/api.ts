import { getToken } from "./auth";
import type { RoleRef } from "./roles-api";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
}

export function toQueryString(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  roles: (RoleRef & { permissionPolicy?: string })[];
  isActive: boolean;
  createdAt: string;
}

interface UserApiResponse {
  id: string;
  email: string;
  name: string | null;
  userRoles: { role: RoleRef & { permissionPolicy?: string } }[];
  isActive: boolean;
  createdAt: string;
}

function normalizeUser(user: UserApiResponse): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.userRoles.map((userRole) => userRole.role),
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

async function fetchUser(path: string, init?: RequestInit): Promise<User> {
  const user = await apiFetch<UserApiResponse>(path, init);
  return normalizeUser(user);
}

async function fetchUsers(path: string, init?: RequestInit): Promise<PaginatedResult<User>> {
  const result = await apiFetch<PaginatedResult<UserApiResponse>>(path, init);
  return {
    total: result.total,
    data: result.data.map(normalizeUser),
  };
}

export const usersApi = {
  list: (query?: ListQuery) => fetchUsers(`/users${toQueryString({ ...query })}`),
  get: (id: string) => fetchUser(`/users/${id}`),
  create: (data: { email: string; password: string; name?: string; roleIds?: string[] }) =>
    fetchUser("/users", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; isActive?: boolean }) =>
    fetchUser(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  updateRoles: (id: string, roleIds: string[]) =>
    fetchUser(`/users/${id}/roles`, { method: "PUT", body: JSON.stringify({ roleIds }) }),
  remove: (id: string) => apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
};
