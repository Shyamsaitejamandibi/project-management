import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Project, Column, Task } from "./models";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Projects
app.get("/projects", async (req, res) => {
  const all = await Project.find().sort({ created_at: -1 });
  return res.status(200).json(all);
});

app.post("/projects", async (req, res) => {
  const project = await Project.create({
    name: req.body.name,
    description: req.body.description ?? "",
  });
  // create default columns
  const defaultColumns = ["To Do", "In Progress", "Done"];
  await Promise.all(
    defaultColumns.map((name, index) =>
      Column.create({ project_id: project._id, name, position: index })
    )
  );
  return res.status(201).json(project);
});

app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  await Project.findByIdAndDelete(id);
  const projectColumns = await Column.find({ project_id: id });
  const columnIds = projectColumns.map((c) => c._id);
  await Column.deleteMany({ project_id: id });
  await Task.deleteMany({
    $or: [{ project_id: id }, { column_id: { $in: columnIds } }],
  });
  return res.status(200).json({ ok: true });
});

// Columns
app.get("/projects/:projectId/columns", async (req, res) => {
  const { projectId } = req.params;
  const cols = await Column.find({ project_id: projectId }).sort({
    position: 1,
  });
  return res.status(200).json(cols);
});

// Tasks
app.get("/projects/:projectId/tasks", async (req, res) => {
  const { projectId } = req.params;
  const tsks = await Task.find({ project_id: projectId }).sort({ position: 1 });
  return res.status(200).json(tsks);
});

app.post("/tasks", async (req, res) => {
  const { projectId, columnId, title, description } = req.body;
  const columnTasks = await Task.find({ column_id: columnId });
  const maxPosition =
    columnTasks.length > 0
      ? Math.max(...columnTasks.map((t) => t.position))
      : -1;
  const task = await Task.create({
    project_id: projectId,
    column_id: columnId,
    title,
    description: description ?? "",
    position: maxPosition + 1,
  });
  return res.status(201).json(task);
});

app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  await Task.updateOne({ _id: id }, req.body);
  const updated = await Task.findById(id);
  return res.status(200).json(updated);
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  return res.status(200).json({ ok: true });
});

const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://shyamsaitejam_db_user:qUMOLD4tqKrIGvtM@cluster0.xt9uwed.mongodb.net"
    );
    app.listen(3000, () => console.log("Server started on port 3000"));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();

export default app;
