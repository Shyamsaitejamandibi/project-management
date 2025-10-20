import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProjectColumns,
  getProjectTasks,
  updateTask,
  deleteTask,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { AIAssistant } from "@/components/ai-assistant";
import type { DragEndEvent } from "@/components/kibo-ui/kanban";
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from "@/components/kibo-ui/kanban";
import type { Task, UpdateTaskInput } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { toast } from "sonner";

interface KanbanTask extends Record<string, unknown> {
  id: string;
  name: string;
  column: string;
  task: Task;
}

const ProjectBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const { data: columns } = useQuery({
    queryKey: ["columns", projectId],
    queryFn: () => getProjectColumns(projectId!),
    enabled: !!projectId,
  });

  const { data: tasks } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getProjectTasks(projectId!),
    enabled: !!projectId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onError: () => {
      toast.error("Failed to update task");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete task");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const task = tasks?.find((t) => t._id === taskId);
    if (!task) return;

    // Check if we're dropping on a column (different column)
    const isColumnDrop = columns?.some((col) => col._id === overId);

    if (isColumnDrop) {
      // Moving to a different column
      if (task.column_id !== overId) {
        updateTaskMutation.mutate({
          taskId,
          data: { column_id: overId },
        });
      }
    } else {
      // Dropping on another task - this is for repositioning within the same column
      const overTask = tasks?.find((t) => t._id === overId);
      if (overTask && task.column_id === overTask.column_id) {
        // Same column - just reposition, no API call needed as the Kanban component handles this
        return;
      } else if (overTask && task.column_id !== overTask.column_id) {
        // Different column - move to the new column
        updateTaskMutation.mutate({
          taskId,
          data: { column_id: overTask.column_id },
        });
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  // Transform data for Kanban system
  const kanbanColumns =
    columns?.map((col) => ({
      id: col._id,
      name: col.name,
    })) || [];

  const kanbanTasks: KanbanTask[] =
    tasks?.map((task) => ({
      id: task._id,
      name: task.title,
      column: task.column_id,
      task: task, // Keep original task data for TaskCard
    })) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">Project Board</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={() => setAiAssistantOpen(true)}
                className="w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Assistant
              </Button>
              <Button
                onClick={() => setCreateTaskDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-8">
        <KanbanProvider
          columns={kanbanColumns}
          data={kanbanTasks}
          onDragEnd={handleDragEnd}
          className="gap-2 sm:gap-4"
        >
          {(column) => (
            <KanbanBoard id={column.id} key={column.id}>
              <KanbanHeader>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary" />
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    {column.name}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    {
                      kanbanTasks.filter((task) => task.column === column.id)
                        .length
                    }
                  </span>
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id}>
                {(kanbanTask: KanbanTask) => (
                  <KanbanCard
                    column={column.name}
                    id={kanbanTask.id}
                    key={kanbanTask.id}
                    name={kanbanTask.name}
                  >
                    <TaskCard
                      task={kanbanTask.task}
                      onDelete={() => handleDeleteTask(kanbanTask.id)}
                    />
                  </KanbanCard>
                )}
              </KanbanCards>
            </KanbanBoard>
          )}
        </KanbanProvider>
      </div>

      <CreateTaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        projectId={projectId!}
        columns={columns || []}
      />

      <AIAssistant
        open={aiAssistantOpen}
        onOpenChange={setAiAssistantOpen}
        projectId={projectId!}
      />
    </div>
  );
};

export default ProjectBoard;
