import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "User";  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    else if (hour < 17) return "Good afternoon";
    else return "Good evening";
  };

  const formattedDate = currentTime.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

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
    <div className="min-h-screen bg-[#191818] text-white px-12 py-4">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-8 flex flex-col sm:flex-col sm:items-left sm:justify-left">
          <h1 className="text-[32px] font-bold">
            {getGreeting()},{" "}
            <span className="text-[#FF1E00] font-bold">{userName}</span>
          </h1>
          <p className="text-white/80 text-sm mt-2 sm:mt-0 flex items-center gap-2">
            {formattedDate}
          </p>
        </div>
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-400">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-[#2d2d2d] rounded-xl p-6 text-white min-h-[255px] flex flex-col justify-between hover:bg-[#FF1E00]"
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
        )}
      </div>
    </div>
  );
};

export default ProjectList;
