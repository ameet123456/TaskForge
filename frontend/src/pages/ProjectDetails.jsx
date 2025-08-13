import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import Breadcrumb from "../components/Breadcrumb";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeactivatedTasks, setShowDeactivatedTasks] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const response = await API.get(`/projects/${id}`);
      console.log("Project Details API Response:", response.data);

      if (response.data.success && response.data.project) {
        setProject(response.data.project);
        setTasks(response.data.project.tasks || []);
      }
    } catch (err) {
      console.error("Error fetching project details:", err);
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isTaskOverdue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    return due < now;
  };

  const activeTasks = tasks.filter(task => !isTaskOverdue(task.dueDate));
  const deactivatedTasks = tasks.filter(task => isTaskOverdue(task.dueDate));

  const handleAddTask = () => {
    navigate("/task/new", { state: { projectId: id } });
  };

  if (loading) return <p className="text-center mt-10">Loading project...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        <Breadcrumb />
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-[40px] font-bold">{project.name}</h2>
              <p className="text-gray-700">{project.description}</p>
              <p className="text-sm text-gray-500">Status: {project.status}</p>
              <p className="text-sm text-gray-500">
                End Date: {new Date(project.endDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleAddTask}
              className="bg-[#FF1E00] hover:bg-[#FF1E00]/80 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Task
            </button>
          </div>
        </div>

        <div className="mt-10 bg-[#191818] text-white rounded-xl">
          <h3 className="text-2xl font-semibold mb-6">Active Tasks</h3>
          {activeTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-[#2d2d2d] rounded-xl p-6 text-white min-h-[255px] flex flex-col justify-between hover:bg-[#FF1E00] transition-colors duration-200"
                >
                  <div>
                    <div className="flex justify-between mb-2">
                      <div></div>
                      <span className="text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Active
                      </span>
                    </div>
                    <div className="mb-4">
                      <h2 className="text-[32px] font-bold leading-[86%] mb-2">
                        {task.title}
                      </h2>
                      <p className="text-sm text-white/80 mt-1">
                        {task.description}
                      </p>
                      <span className="text-xs bg-white text-black px-2 py-0.5 rounded-full font-semibold">
                        {task.priority?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-4 text-sm text-white">
                      <span className="font-semibold">
                        {getDaysLeft(task.dueDate)} Days Left
                      </span>
                      <span className="text-gray-400">{task.state}</span>
                      <span className="flex items-center gap-1 text-gray-300">
                        <svg
                          className="w-4 h-4 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 2a4 4 0 100 8 4 4 0 000-8zm-7 14a7 7 0 0114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {task.assignedTo?.name || "Unassigned"}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(`/${id}/${task._id}`)}
                      className="w-8 h-8 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center transition"
                    >
                      <svg
                        className="w-4 h-4 text-[#FF1E00]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 17L17 7M7 7h10v10"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No active tasks found for this project.</p>
          )}
        </div>

        {deactivatedTasks.length > 0 && (
          <div className="mt-12">
            <button
              onClick={() => setShowDeactivatedTasks(!showDeactivatedTasks)}
              className="flex items-center gap-3 text-xl font-semibold text-gray-400 hover:text-white transition-colors duration-200"
            >
              <span>Deactivated Tasks ({deactivatedTasks.length})</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  showDeactivatedTasks ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDeactivatedTasks && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {deactivatedTasks.map((task) => (
                  <div
                    key={task._id}
                    className="bg-[#2d2d2d] rounded-xl p-6 text-white min-h-[255px] flex flex-col justify-between opacity-70 border-2 border-red-500/30"
                  >
                    <div>
                      <div className="flex justify-between mb-2">
                        <div></div>
                        <span className="text-xs flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Overdue
                        </span>
                      </div>
                      <div className="mb-4">
                        <h2 className="text-[32px] font-bold leading-[86%] mb-2">
                          {task.title}
                        </h2>
                        <p className="text-sm text-white/60 mt-1">
                          {task.description}
                        </p>
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-semibold">
                          {task.priority?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="font-semibold text-red-400">
                          {Math.abs(getDaysLeft(task.dueDate))} Days Overdue
                        </span>
                        <span className="text-gray-500">{task.state}</span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <svg
                            className="w-4 h-4 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 2a4 4 0 100 8 4 4 0 000-8zm-7 14a7 7 0 0114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {task.assignedTo?.name || "Unassigned"}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/${id}/${task._id}`)}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                      >
                        <svg
                          className="w-4 h-4 text-white/60"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M7 17L17 7M7 7h10v10"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;