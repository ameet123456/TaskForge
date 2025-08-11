import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import Breadcrumb from "../components/Breadcrumb";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDeactivatedProjects, setShowDeactivatedProjects] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await API.get("/projects");

      if (response.data.success && Array.isArray(response.data.projects)) {
        console.log("🔥 Projects from backend:", response.data.projects);
        setProjects(response.data.projects);
      } else {
        setError("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getDaysLeft = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isProjectOverdue = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return end < now;
  };

  // Filter projects into active and deactivated
  const activeProjects = projects.filter(project => !isProjectOverdue(project.endDate));
  const deactivatedProjects = projects.filter(project => isProjectOverdue(project.endDate));

  const handleAddProject = () => {
    navigate("/project/new");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191818] text-white">
        <p className="text-lg">Loading your projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191818] text-white">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Breadcrumb />
          <button
            onClick={handleAddProject}
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
            Add Project
          </button>
        </div>

        {/* Active Projects */}
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-400">No projects found.</p>
          </div>
        ) : (
          <>
            {activeProjects.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-6">Active Projects</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeProjects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-[#2d2d2d] rounded-xl p-6 text-white min-h-[255px] flex flex-col justify-between hover:bg-[#FF1E00] transition-colors duration-200"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div></div>
                          <span className="text-xs text-white/70 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Active
                          </span>
                        </div>

                        <h2
                          className="text-[32px] font-bold leading-[86%] mb-2"
                          style={{ fontFamily: "Segoe UI, sans-serif" }}
                        >
                          {project.name}
                        </h2>

                        <p className="text-base text-white/80 mb-6 leading-snug">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-base font-medium">
                          <span className="font-semibold">
                            {getDaysLeft(project.endDate)}
                          </span>{" "}
                          Days Left
                        </span>

                        <button
                          onClick={() => navigate(`/projects/${project._id}`)}
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
              </div>
            )}

            {activeProjects.length === 0 && deactivatedProjects.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-gray-400">No projects found.</p>
              </div>
            )}

            {activeProjects.length === 0 && deactivatedProjects.length > 0 && (
              <div className="text-center py-8">
                <p className="text-lg text-gray-400">No active projects found.</p>
              </div>
            )}

            {/* Deactivated Projects Section */}
            {deactivatedProjects.length > 0 && (
              <div className="mt-12">
                <button
                  onClick={() => setShowDeactivatedProjects(!showDeactivatedProjects)}
                  className="flex items-center gap-3 text-xl font-semibold text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <span>Deactivated Projects ({deactivatedProjects.length})</span>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-200 ${
                      showDeactivatedProjects ? "rotate-180" : ""
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

                {showDeactivatedProjects && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {deactivatedProjects.map((project) => (
                      <div
                        key={project._id}
                        className="bg-[#2d2d2d] rounded-xl p-6 text-white min-h-[255px] flex flex-col justify-between opacity-70 border-2 border-red-500/30"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div></div>
                            <span className="text-xs text-red-300 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              Overdue
                            </span>
                          </div>

                          <h2
                            className="text-[32px] font-bold leading-[86%] mb-2"
                            style={{ fontFamily: "Segoe UI, sans-serif" }}
                          >
                            {project.name}
                          </h2>

                          <p className="text-base text-white/60 mb-6 leading-snug">
                            {project.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-base font-medium text-red-400">
                            <span className="font-semibold">
                              {Math.abs(getDaysLeft(project.endDate))}
                            </span>{" "}
                            Days Overdue
                          </span>

                          <button
                            onClick={() => navigate(`/projects/${project._id}`)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectList;