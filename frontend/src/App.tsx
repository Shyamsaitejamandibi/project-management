import { useState } from "react";
import { ProjectList } from "./components/project-list";
import { KanbanBoard } from "./components/kanban-board";
import type { Project } from "./lib/types";

function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      {selectedProject ? (
        <KanbanBoard
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      ) : (
        <ProjectList onSelectProject={setSelectedProject} />
      )}
    </>
  );
}

export default App;
