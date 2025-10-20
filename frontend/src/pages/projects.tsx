import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, deleteProject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Calendar } from "lucide-react";
import { useState } from "react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

const Projects = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete project");
    },
  });

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(projectId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">
          Loading projects...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Manage your projects and track progress
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            size="lg"
            className="shadow-medium w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>

        {projects?.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center shadow-soft">
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                No projects yet
              </h3>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                Get started by creating your first project
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects?.map((project) => (
              <Card
                key={project._id}
                className="p-4 sm:p-6 hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold group-hover:text-primary transition-colors leading-tight">
                    {project.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDelete(e, project._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-muted-foreground text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {format(new Date(project.created_at), "MMM d, yyyy")}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Projects;
