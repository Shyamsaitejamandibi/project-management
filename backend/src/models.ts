import mongoose from "mongoose";

// Project
const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false, default: "" },
  created_at: { type: Date, required: true, default: Date.now },
});

// Column (within a project)
const ColumnSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  name: { type: String, required: true },
  position: { type: Number, required: true },
  created_at: { type: Date, required: true, default: Date.now },
});

// Task
const TaskSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  column_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: false, default: "" },
  position: { type: Number, required: true },
  created_at: { type: Date, required: true, default: Date.now },
});

export const Project = mongoose.model("Project", ProjectSchema);
export const Column = mongoose.model("Column", ColumnSchema);
export const Task = mongoose.model("Task", TaskSchema);
