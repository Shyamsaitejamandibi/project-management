import "dotenv/config";
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Project, Column, Task } from "./models";
import { connectToDatabase } from "./db";
import { aiService } from "./ai-service";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello World" });
});

app.get("/test", async (req, res) => {
  const db = await connectToDatabase();
  console.log(db);
  const all = await Project.find().sort({ created_at: -1 });
  return res.status(200).json({ message: "Hello World", all });
});

// Projects
app.get("/projects", async (req, res) => {
  await connectToDatabase();
  const all = await Project.find().sort({ created_at: -1 });
  return res.status(200).json(all);
});

app.post("/projects", async (req, res) => {
  await connectToDatabase();
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

app.patch("/projects/:id", async (req, res) => {
  await connectToDatabase();
  const { id } = req.params;
  const { name, description } = req.body;

  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;

  const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedProject) {
    return res.status(404).json({ error: "Project not found" });
  }
  return res.status(200).json(updatedProject);
});

app.delete("/projects/:id", async (req, res) => {
  await connectToDatabase();
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
  await connectToDatabase();
  const { projectId } = req.params;
  const cols = await Column.find({ project_id: projectId }).sort({
    position: 1,
  });
  return res.status(200).json(cols);
});

// Tasks
app.get("/projects/:projectId/tasks", async (req, res) => {
  await connectToDatabase();
  const { projectId } = req.params;
  const tsks = await Task.find({ project_id: projectId }).sort({ position: 1 });
  return res.status(200).json(tsks);
});

app.post("/tasks", async (req, res) => {
  await connectToDatabase();
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
  await connectToDatabase();
  const { id } = req.params;
  await Task.updateOne({ _id: id }, req.body);
  const updated = await Task.findById(id);
  return res.status(200).json(updated);
});

app.delete("/tasks/:id", async (req, res) => {
  await connectToDatabase();
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  return res.status(200).json({ ok: true });
});

// AI Features
app.post("/projects/:projectId/ai/summarize", async (req, res) => {
  try {
    await connectToDatabase();
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const [columns, tasks] = await Promise.all([
      Column.find({ project_id: projectId }).sort({ position: 1 }),
      Task.find({ project_id: projectId }).sort({ position: 1 }),
    ]);

    const summary = await aiService.summarizeProject(
      project.name,
      columns,
      tasks
    );
    return res.status(200).json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    return res.status(500).json({ error: "Failed to generate summary" });
  }
});

app.post("/projects/:projectId/ai/ask", async (req, res) => {
  try {
    await connectToDatabase();
    const { projectId } = req.params;
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const [columns, tasks] = await Promise.all([
      Column.find({ project_id: projectId }).sort({ position: 1 }),
      Task.find({ project_id: projectId }).sort({ position: 1 }),
    ]);

    const answer = await aiService.answerQuestion(
      project.name,
      columns,
      tasks,
      question
    );
    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Error answering question:", error);
    return res.status(500).json({ error: "Failed to answer question" });
  }
});

if (process.env.NODE_ENV !== "production") {
  (async () => {
    try {
      await connectToDatabase();
      app.listen(3000, () => console.log("Server started on port 3000"));
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}

export default app;
