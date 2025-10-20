export interface Project {
  _id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at?: string;
}

export interface Column {
  _id: string;
  project_id: string;
  name: string;
  position: number;
  created_at: string;
}

export interface Task {
  _id: string;
  project_id: string;
  column_id: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface CreateTaskInput {
  projectId: string;
  columnId: string;
  title: string;
  description: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  position?: number;
  column_id?: string;
}

export interface AISummaryResponse {
  summary: string;
}

export interface AIQuestionResponse {
  answer: string;
}
