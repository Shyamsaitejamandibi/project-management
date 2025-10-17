import { useState, useEffect } from "react";
import { Plus, Folder, Trash2, Edit2 } from "lucide-react";
import type { Project } from "@/lib/types";
import { store } from "@/lib/store";

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectList({ onSelectProject }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const list = await store.getProjects();
    setProjects(list);
  }

  async function createProject() {
    if (!newProjectName.trim()) return;
    await store.createProject({
      name: newProjectName,
      description: newProjectDescription,
    });

    setNewProjectName("");
    setNewProjectDescription("");
    setIsCreating(false);
    loadProjects();
  }

  async function updateProject(
    project: Project,
    updates: { name: string; description: string }
  ) {
    await store.updateProject(project._id, updates);
    setEditingProject(null);
    loadProjects();
  }

  async function deleteProject(id: string, e: React.MouseEvent) {
    e.stopPropagation();

    if (
      !confirm(
        "Are you sure you want to delete this project? All tasks will be permanently removed."
      )
    ) {
      return;
    }
    await store.deleteProject(id);
    loadProjects();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Projects</h1>
            <p className="text-slate-600">Select a project to view its board</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {isCreating && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Create New Project
            </h2>
            <input
              type="text"
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <textarea
              placeholder="Project description (optional)"
              value={newProjectDescription}
              onChange={(e) => setNewProjectDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={createProject}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewProjectName("");
                  setNewProjectDescription("");
                }}
                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => onSelectProject(project)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                    }}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={(e) => deleteProject(project._id, e)}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm line-clamp-2">
                {project.description || "No description"}
              </p>
              <p className="text-xs text-slate-400 mt-4">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {projects.length === 0 && !isCreating && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="text-slate-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No projects yet
            </h3>
            <p className="text-slate-500 mb-6">
              Create your first project to get started
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Create Project
            </button>
          </div>
        )}

        {editingProject && (
          <EditProjectModal
            project={editingProject}
            onSave={updateProject}
            onClose={() => setEditingProject(null)}
          />
        )}
      </div>
    </div>
  );
}

interface EditProjectModalProps {
  project: Project;
  onSave: (
    project: Project,
    updates: { name: string; description: string }
  ) => void;
  onClose: () => void;
}

function EditProjectModal({ project, onSave, onClose }: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      onSave(project, { name: name.trim(), description });
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Edit Project
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            placeholder="Project description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
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
