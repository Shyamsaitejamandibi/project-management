import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Column, Task } from "@/lib/types";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  columns: Column[];
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  columns,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createTask,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
      const previousTasks = queryClient.getQueryData<Task[]>([
        "tasks",
        projectId,
      ]);

      const optimisticTask: Task = {
        _id: `temp-${Date.now()}`,
        project_id: variables.projectId,
        column_id: variables.columnId,
        title: variables.title,
        description: variables.description ?? "",
        position: (previousTasks?.length ?? 0) + 1,
        created_at: new Date().toISOString(),
      };

      if (previousTasks) {
        queryClient.setQueryData(
          ["tasks", projectId],
          [optimisticTask, ...previousTasks]
        );
      } else {
        queryClient.setQueryData(["tasks", projectId], [optimisticTask]);
      }

      return { previousTasks } as { previousTasks?: Task[] };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", projectId], context.previousTasks);
      }
      toast.error("Failed to create task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
    onSuccess: () => {
      toast.success("Task created successfully");
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setColumnId("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!columnId) {
      toast.error("Please select a column");
      return;
    }
    createMutation.mutate({
      projectId,
      columnId,
      title,
      description,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Add a new task to your project board
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-base resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="column" className="text-sm font-medium">
              Column
            </Label>
            <Select value={columnId} onValueChange={setColumnId}>
              <SelectTrigger className="text-base">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column._id} value={column._id}>
                    {column.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {createMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
