import { useEffect, useState } from "react";
import { useAlert } from "../context/AlertContext";
import api from "../api/axios";
import { Link } from "react-router-dom";

interface Project {
  id: number;
  name: string;
  tasks?: any[];
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addAlert } = useAlert();

  useEffect(() => {
    api.get("/api/projects/").then((res) => setProjects(res.data));
  }, []);

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/projects/${projectToDelete.id}`);
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      setShowConfirm(false);
      setProjectToDelete(null);
      addAlert("Project deleted successfully", "success");
    } catch (error) {
      console.error("Delete error:", error);
      addAlert("Failed to delete project", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setProjectToDelete(null);
  };

  return (
    <div className="min-w-screen min-h-screen p-4 bg-white">
      <h1 className="text-black font-bold mb-4 ">Projects</h1>
      <Link to="/projects/new" className="py-1 px-2 bg-gray-300 rounded-lg">
        New Project
      </Link>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Tasks
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((p: Project) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {p.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created recently
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-700 mr-2">
                        {p.tasks?.length || 0}
                      </span>
                      <Link
                        to="/tasks"
                         state={{ id: [p.id] }} 
                        className="ml-2 text-indigo-500 hover:text-indigo-300 underline transition-colors"
                        title="Go to Projects"
                      >
                        Tasks
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <a
                        href={`/projects/${p.id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        ✏️ Edit
                      </a>
                      <button
                        onClick={() => handleDeleteClick(p)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500">
                Get started by creating your first project
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Project
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <strong>"{projectToDelete?.name}"</strong>? This action cannot be
              undone and all associated tasks will be lost.
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
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
