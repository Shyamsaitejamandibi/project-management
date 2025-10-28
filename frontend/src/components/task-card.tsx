import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onDelete?: () => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onDelete, isDragging }: TaskCardProps) {
  return (
    <div
      className={cn(
        "group transition-all duration-200",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start gap-1.5 sm:gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base leading-tight">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onPointerDown={(e) => {
              // Prevent drag from starting when interacting with the delete button
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 touch-manipulation"
          >
            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}
