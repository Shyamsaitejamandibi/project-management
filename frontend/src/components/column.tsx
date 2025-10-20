import type { Column as ColumnType, Task } from "@/lib/types";
import { TaskCard } from "./task-card";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
}

const statusColors = {
  "To Do": "bg-status-todo",
  "In Progress": "bg-status-progress",
  Done: "bg-status-done",
};

export function Column({ column, tasks, onDeleteTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column._id,
  });

  const colorClass =
    statusColors[column.name as keyof typeof statusColors] || "bg-primary";

  return (
    <div className="flex-shrink-0 w-full max-w-xs sm:w-72 md:w-80">
      <div className="bg-card rounded-lg shadow-soft border h-fit">
        <div className="p-2 sm:p-3 md:p-4 border-b">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full",
                colorClass
              )}
            />
            <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate">
              {column.name}
            </h3>
            <span className="ml-auto text-xs sm:text-sm text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
        <div
          ref={setNodeRef}
          className={cn(
            "p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] transition-colors",
            isOver && "bg-accent/50"
          )}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={() => onDeleteTask(task._id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
