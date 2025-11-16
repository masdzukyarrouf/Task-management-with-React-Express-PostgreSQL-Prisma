import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  type Project = {
    id: number;
    name: string;
    description: string;
  };
  useEffect(() => {
    if (!id) return;
    axios.get(`http://localhost:4000/projects/${id}`).then((res) => {
      setProject(res.data);
    });
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
    </div>
  );
}
