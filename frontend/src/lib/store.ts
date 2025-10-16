import type { Project, Column, Task } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export const store = {
  // Projects
  async getProjects(): Promise<Project[]> {
    const projects = await http<Project[]>("/projects");
    return projects.map((p: Project) => ({
      _id: p._id,
      name: p.name,
      description: p.description ?? "",
      created_at: new Date(p.created_at).toISOString(),
    }));
  },
  async createProject(input: {
    name: string;
    description: string;
  }): Promise<Project> {
    const p = await http<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return {
      _id: p._id,
      name: p.name,
      description: p.description ?? "",
      created_at: new Date(p.created_at).toISOString(),
    };
  },
  async deleteProject(projectId: string): Promise<void> {
    await http(`/projects/${projectId}`, { method: "DELETE" });
  },

  // Columns
  async getColumns(projectId: string): Promise<Column[]> {
    const cols = await http<Column[]>(`/projects/${projectId}/columns`);
    return cols.map((c) => ({
      _id: c._id,
      project_id: c.project_id,
      name: c.name,
      position: c.position,
      created_at: new Date(c.created_at).toISOString(),
    }));
  },

  // Tasks
  async getTasks(projectId: string): Promise<Task[]> {
    const tsks = await http<Task[]>(`/projects/${projectId}/tasks`);
    return tsks.map((t) => ({
      _id: t._id,
      column_id: t.column_id,
      project_id: t.project_id,
      title: t.title,
      description: t.description ?? "",
      position: t.position,
      created_at: new Date(t.created_at).toISOString(),
    }));
  },
  async createTask(input: {
    projectId: string;
    columnId: string;
    title: string;
    description: string;
  }): Promise<Task> {
    const t = await http<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify({
        projectId: input.projectId,
        columnId: input.columnId,
        title: input.title,
        description: input.description,
      }),
    });
    return {
      _id: t._id,
      column_id: t.column_id,
      project_id: t.project_id,
      title: t.title,
      description: t.description ?? "",
      position: t.position,
      created_at: new Date(t.created_at).toISOString(),
    };
  },
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const payload: Partial<Task> = { ...updates };
    if (updates.column_id) payload.column_id = updates.column_id;
    const t = await http<Task>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    return {
      _id: t._id,
      column_id: t.column_id,
      project_id: t.project_id,
      title: t.title,
      description: t.description ?? "",
      position: t.position,
      created_at: new Date(t.created_at).toISOString(),
    };
  },
  async deleteTask(taskId: string): Promise<void> {
    await http(`/tasks/${taskId}`, { method: "DELETE" });
  },
};
