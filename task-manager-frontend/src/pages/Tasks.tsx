import { useEffect, useState } from "react";
import { useAlert } from "../context/AlertContext";
import api from "../api/axios";
import { Link } from "react-router-dom";

interface Project {
  id: number;
  name: string;
  tasks?: Task[];
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  position: number;
  projectId: number;
}

export default function Tasks() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addAlert } = useAlert();

  useEffect(() => {
    api.get("/api/projects/").then((res) => setProjects(res.data));
  }, []);

  useEffect(() => {
    if (selectedProject) {
      setTasks(selectedProject.tasks || []);
    } else {
      setTasks([]);
    }
  }, [selectedProject]);

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/tasks/${taskToDelete.id}`);
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
      setShowConfirm(false);
      setTaskToDelete(null);
      addAlert("Task deleted successfully", "success");
    } catch (error) {
      console.error("Delete error:", error);
      addAlert("Failed to delete task", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setTaskToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      todo: { color: "bg-gray-100 text-gray-800", label: "To Do" },
      "in-progress": {
        color: "bg-blue-100 text-blue-800",
        label: "In Progress",
      },
      done: { color: "bg-green-100 text-green-800", label: "Done" },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.todo;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-w-screen min-h-screen p-4 bg-white">
      <h1 className="text-black font-bold mb-4 text-2xl">Tasks</h1>

      {/* Project Selection */}
      <div className="mb-6">
        <label className="block text-xl font-bold text-gray-700 mb-2">
          Select 
          <Link
            to="/projects"
            className="ml-2 text-indigo-500 hover:text-indigo-300 hover:underline transition-colors"
            title="Go to Projects"
          >
            Project
          </Link>
        </label>
        <select
          value={selectedProject?.id || ""}
          onChange={(e) => {
            const projectId = Number(e.target.value);
            const project = projects.find((p) => p.id === projectId) || null;
            setSelectedProject(project);
          }}
          className="bg-gray-200 text-black block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option disabled value="">
            Choose a project...
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Tasks for: {selectedProject.name}
            </h2>
            <Link
              to={`/tasks/new?projectId=${selectedProject.id}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              + New Task
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {task.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(task.status)}</td>
                    {/* <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{task.position}</div>
                    </td> */}
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/tasks/${task.id}/edit`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(task)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks yet
                </h3>
                <p className="text-gray-500">
                  Get started by creating your first task for this project
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {!selectedProject && projects.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a project to view tasks
          </h3>
          <p className="text-gray-500">
            Choose a project from the dropdown above to see its tasks
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Task
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>"{taskToDelete?.title}"</strong>? This action cannot be
              undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
