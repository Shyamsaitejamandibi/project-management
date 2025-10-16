import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import type { Column, Project, Task } from "@/lib/types";
import { store } from "@/lib/store";

interface KanbanBoardProps {
  project: Project;
  onBack: () => void;
}

export function KanbanBoard({ project, onBack }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(
    null
  );
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState<string | null>(null);

  const loadColumnsAndTasks = useCallback(async () => {
    const [cols, tsks] = await Promise.all([
      store.getColumns(project._id),
      store.getTasks(project._id),
    ]);
    setColumns(cols);
    setTasks(tsks);
  }, [project._id]);

  useEffect(() => {
    loadColumnsAndTasks();
  }, [loadColumnsAndTasks]);

  async function createTask(
    columnId: string,
    title: string,
    description: string
  ) {
    await store.createTask({
      projectId: project._id,
      columnId,
      title,
      description,
    });
    setIsCreatingTask(null);
    loadColumnsAndTasks();
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    await store.updateTask(taskId, updates);
    loadColumnsAndTasks();
  }

  async function deleteTask(taskId: string) {
    await store.deleteTask(taskId);
    loadColumnsAndTasks();
  }

  function handleDragStart(task: Task) {
    setDraggedTask(task);
  }

  function handleDragOver(e: React.DragEvent, columnId: string) {
    e.preventDefault();
    setDraggedOverColumn(columnId);
  }

  function handleDragLeave() {
    setDraggedOverColumn(null);
  }

  function handleDrop(e: React.DragEvent, targetColumnId: string) {
    e.preventDefault();
    setDraggedOverColumn(null);

    if (!draggedTask) return;

    if (draggedTask.column_id === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    const targetColumnTasks = tasks.filter(
      (t) => t.column_id === targetColumnId
    );
    const maxPosition =
      targetColumnTasks.length > 0
        ? Math.max(...targetColumnTasks.map((t) => t.position))
        : -1;

    updateTask(draggedTask._id, {
      column_id: targetColumnId,
      position: maxPosition + 1,
    });

    setDraggedTask(null);
  }

  function getColumnTasks(columnId: string) {
    return tasks
      .filter((task) => task.column_id === columnId)
      .sort((a, b) => a.position - b.position);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="px-6 py-6 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-slate-600 mt-1">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <div
                key={column._id}
                className={`bg-slate-100 rounded-xl p-4 transition-all ${
                  draggedOverColumn === column._id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, column._id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column._id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    {column.name}
                  </h2>
                  <span className="bg-slate-200 text-slate-600 text-sm px-2.5 py-1 rounded-full">
                    {getColumnTasks(column._id).length}
                  </span>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {getColumnTasks(column._id).map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDragStart={handleDragStart}
                      onEdit={setEditingTask}
                      onDelete={deleteTask}
                    />
                  ))}

                  {isCreatingTask === column._id ? (
                    <NewTaskForm
                      onSave={(title, description) =>
                        createTask(column._id, title, description)
                      }
                      onCancel={() => setIsCreatingTask(null)}
                    />
                  ) : (
                    <button
                      onClick={() => setIsCreatingTask(column._id)}
                      className="w-full bg-white border-2 border-dashed border-slate-300 rounded-lg p-3 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Task
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={(updates) => {
            updateTask(editingTask._id, updates);
            setEditingTask(null);
          }}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

interface NewTaskFormProps {
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
}

function NewTaskForm({ onSave, onCancel }: NewTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      onSave(title, description);
      setTitle("");
      setDescription("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg p-3 shadow-sm border border-slate-200"
    >
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={2}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-200 text-slate-700 text-sm px-3 py-2 rounded hover:bg-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface EditTaskModalProps {
  task: Task;
  onSave: (updates: Partial<Task>) => void;
  onClose: () => void;
}

function EditTaskModal({ task, onSave, onClose }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title, description });
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Edit Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
