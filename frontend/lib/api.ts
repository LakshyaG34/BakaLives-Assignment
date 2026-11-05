import type { Task, TaskPriority, TaskStatus } from "@/types/task";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api/tasks${path}`, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  list: () => request<Task[]>(""),
  create: (title: string, description: string, priority: TaskPriority) => request<Task>("", { method: "POST", body: JSON.stringify({ title, description: description || null, priority }) }),
  updateStatus: (id: number, status: TaskStatus) => request<Task>(`/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updatePriority: (id: number, priority: TaskPriority) => request<Task>(`/${id}`, { method: "PATCH", body: JSON.stringify({ priority }) }),
  remove: (id: number) => request<void>(`/${id}`, { method: "DELETE" }),
};
