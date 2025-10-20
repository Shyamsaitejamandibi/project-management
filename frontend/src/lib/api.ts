import type {
  Project,
  Column,
  Task,
  CreateProjectInput,
  UpdateProjectInput,
  CreateTaskInput,
  UpdateTaskInput,
  AISummaryResponse,
  AIQuestionResponse,
} from "@/lib/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `API error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Projects
export const getProjects = () => fetchAPI<Project[]>("/projects");

export const createProject = (data: CreateProjectInput) =>
  fetchAPI<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateProject = (projectId: string, data: UpdateProjectInput) =>
  fetchAPI<Project>(`/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteProject = (projectId: string) =>
  fetchAPI<void>(`/projects/${projectId}`, {
    method: "DELETE",
  });

// Columns
export const getProjectColumns = (projectId: string) =>
  fetchAPI<Column[]>(`/projects/${projectId}/columns`);

// Tasks
export const getProjectTasks = (projectId: string) =>
  fetchAPI<Task[]>(`/projects/${projectId}/tasks`);

export const createTask = (data: CreateTaskInput) =>
  fetchAPI<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTask = (taskId: string, data: UpdateTaskInput) =>
  fetchAPI<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteTask = (taskId: string) =>
  fetchAPI<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });

// AI Features
export const summarizeProject = (projectId: string) =>
  fetchAPI<AISummaryResponse>(`/projects/${projectId}/ai/summarize`, {
    method: "POST",
  });

export const askQuestion = (projectId: string, question: string) =>
  fetchAPI<AIQuestionResponse>(`/projects/${projectId}/ai/ask`, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
