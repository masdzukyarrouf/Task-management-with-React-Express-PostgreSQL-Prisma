import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get("/projects").then(res => setProjects(res.data));
  }, []);

  return (
    <div>
      <h1>Projects</h1>

      <a href="/projects/new">New Project</a>

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
