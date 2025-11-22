import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAlert } from "../context/AlertContext";
import api from "../api/axios";

interface Project {
  id: number;
  name: string;
}

export default function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addAlert } = useAlert();

  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "todo",
    position: 0,
    projectId: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    api.get("/api/projects/").then((res) => setProjects(res.data));

    if (isEditMode) {
      api.get(`/api/tasks/${id}`).then((res) => {
        const task = res.data;
        setFormData({
          title: task.title,
          description: task.description || "",
          status: task.status,
          position: task.position,
          projectId: task.projectId.toString(),
        });
      });
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get("projectId");
      if (projectId) {
        setFormData((prev) => ({ ...prev, projectId }));
      }
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        projectId: Number(formData.projectId),
        position: Number(formData.position),
      };

      if (isEditMode) {
        await api.put(`/api/tasks/${id}`, payload);
        addAlert("Task updated successfully", "success");
      } else {
        await api.post("/api/tasks", payload);
        addAlert("Task created successfully", "success");
      }

      navigate("/tasks", { state: { id: formData.projectId } });
    } catch (error) {
      console.error("Error saving task:", error);
      addAlert(`Failed to ${isEditMode ? "update" : "create"} task`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-w-screen min-h-screen p-4 bg-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? "Edit Task" : "Create New Task"}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="space-y-6">
            {/* Project Selection */}
            <div>
              <label
                htmlFor="projectId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Project *
              </label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                required
                disabled={isEditMode} // Can't change project in edit mode
                className="text-black bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter task description"
              />
            </div>

            {/* Status and Position */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() =>
                navigate("/tasks", { state: { id: formData.projectId } })
              }
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading
                ? "Saving..."
                : isEditMode
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
