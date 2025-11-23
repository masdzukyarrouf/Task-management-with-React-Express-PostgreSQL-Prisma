import { useEffect, useState } from "react";
import axios from "axios";

interface Project {
  id: string;
  name: string;
  description: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://${import.meta.env.VITE_API_URL}/projects")
      .then(res => setProjects(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Projects</h1>

        <button className="bg-blue-600 text-white px-3 py-2 rounded-lg">
          + Add Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(project => (
          <a
            key={project.id}
            href={`/projects/${project.id}`}
            className="p-4 border rounded-lg hover:bg-gray-50"
          >
            <h2 className="font-semibold text-lg">{project.name}</h2>
            <p className="text-gray-600 text-sm">{project.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
