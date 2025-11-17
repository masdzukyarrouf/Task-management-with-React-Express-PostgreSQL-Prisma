import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data));
  }, []);

  return (
    <div className="min-w-screen min-h-screen p-4 bg-white">
      <h1 className="text-black font-bold mb-4 ">Projects</h1>
      <a className="py-1 px-2 bg-gray-300 rounded-lg" href="/projects/new">New Project</a>
      <ul>
        {projects.map((p: any) => (
          <li key={p.id}>
            {p.name}
            <a href={`/projects/${p.id}/edit`}> Edit </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
