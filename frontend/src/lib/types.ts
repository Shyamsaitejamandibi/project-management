export type Project = {
  _id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Column = {
  _id: string;
  project_id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Task = {
  _id: string;
  column_id: string;
  project_id: string;
  title: string;
  description: string;
  position: number;
  created_at: string;
};
