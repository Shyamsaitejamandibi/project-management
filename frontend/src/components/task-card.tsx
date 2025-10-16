import type { Task } from "@/lib/types";
import { GripVertical, Edit2, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({
  task,
  onDragStart,
  onEdit,
  onDelete,
}: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(task)}
      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 cursor-move hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start gap-2">
        <GripVertical
          className="text-slate-400 flex-shrink-0 mt-0.5"
          size={16}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-800 mb-1 break-words">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-600 break-words line-clamp-3">
              {task.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Are you sure you want to delete this task?")) {
              onDelete(task._id);
            }
          }}
          className="text-slate-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
