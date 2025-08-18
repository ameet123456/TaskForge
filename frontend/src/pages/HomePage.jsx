import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const HomePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [role, setRole] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const user = JSON.parse(localStorage.getItem("user"));
  const userNameFromStorage = user?.name || "User";

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

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedTeamName = localStorage.getItem("teamName") ;
    const storedRole = localStorage.getItem("role");
    const storedTeamId = localStorage.getItem("teamId");
    const shouldRedirect = localStorage.getItem("shouldRedirectFromHome");

    setUserName(storedUser?.name || "");
    setTeamName(storedTeamName || "");
    setRole(storedRole || "");

    if (storedTeamId) {
      fetchTeamStats(storedTeamId);
    }

    if (shouldRedirect === "true") {
      const timer = setTimeout(() => {
        if (storedRole === "team_lead") {
          navigate("/projects");
        } else if (storedRole === "team_member") {
          navigate("/tasks");
        } else {
          navigate("/dashboard");
        }
        localStorage.removeItem("shouldRedirectFromHome");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const fetchTeamStats = async (teamId) => {
    try {
      const [projectsRes, tasksRes] = await Promise.all([
        API.get(`/projects?teamId=${teamId}`).catch(() => ({ data: { projects: [] } })),
        API.get(`/tasks?teamId=${teamId}`).catch(() => ({ data: { tasks: [] } })),
      ]);

      const projects = projectsRes.data.projects || projectsRes.data.data || [];
      const tasks = tasksRes.data.tasks || tasksRes.data.data || [];

      const activeProjects = projects.filter(p => new Date(p.endDate) >= new Date()).length;
      const completedTasks = tasks.filter(t => t.state === "completed").length;
      const pendingTasks = tasks.filter(t => t.state !== "completed").length;
      const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.state !== "completed").length;

      setStats({
        activeProjects,
        totalProjects: projects.length,
        completedTasks,
        pendingTasks,
        overdueTasks,
        totalTasks: tasks.length
      });
      setError(null);
          } catch (err) {
        setError("Failed to fetch stats");
      } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (cardType) => {
    switch (cardType) {
      case "projects":
        navigate("/projects");
        break;
      case "completed":
      case "pending":
      case "overdue":
        navigate("/tasks");
        break;
      default:
        break;
    }
  };

  const getRoleBadgeColor = (userRole) => {
    switch (userRole) {
      case "team_lead":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "team_member":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "admin":
        return "bg-[#FF1E00]/20 text-[#FF1E00] border-[#FF1E00]/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatIcon = (type) => {
    switch (type) {
      case "projects":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case "completed":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "pending":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "overdue":
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-8 flex flex-col sm:flex-col sm:items-left sm:justify-left">
          <h1 className="text-[32px] font-bold">
            {getGreeting()},{" "}
            <span className="text-[#FF1E00] font-bold">{userNameFromStorage}</span>
          </h1>
          <p className="text-white/80 text-sm mt-2 sm:mt-0 flex items-center gap-2">
            {formattedDate}
          </p>
          {teamName && (
            <p className="text-gray-400 text-lg mt-2">
              Team: {teamName}
            </p>
          )}
          {role && (
            <div className="mt-3">
              <span className={`px-4 py-2 rounded-full border font-semibold text-sm ${getRoleBadgeColor(role)}`}>
                {role.replace("_", " ").toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-[#FF1E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your workspace...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#FF1E00] hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div 
              className="bg-[#2d2d2d] rounded-xl p-6 hover:bg-[#FF1E00] transition-colors duration-200 group cursor-pointer"
              onClick={() => handleCardClick("projects")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-green-400 group-hover:text-white transition-colors duration-200">
                  {getStatIcon("projects")}
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                  Active
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {stats.activeProjects}/{stats.totalProjects}
              </h3>
              <p className="text-gray-400 group-hover:text-white/80 transition-colors duration-200">
                Active Projects
              </p>
            </div>

            <div 
              className="bg-[#2d2d2d] rounded-xl p-6 hover:bg-[#FF1E00] transition-colors duration-200 group cursor-pointer"
              onClick={() => handleCardClick("completed")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-green-400 group-hover:text-white transition-colors duration-200">
                  {getStatIcon("completed")}
                </div>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                  Done
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {stats.completedTasks}
              </h3>
              <p className="text-gray-400 group-hover:text-white/80 transition-colors duration-200">
                Completed Tasks
              </p>
            </div>

            <div 
              className="bg-[#2d2d2d] rounded-xl p-6 hover:bg-[#FF1E00] transition-colors duration-200 group cursor-pointer"
              onClick={() => handleCardClick("pending")}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-blue-400 group-hover:text-white transition-colors duration-200">
                  {getStatIcon("pending")}
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                  Pending
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {stats.pendingTasks}
              </h3>
              <p className="text-gray-400 group-hover:text-white/80 transition-colors duration-200">
                Pending Tasks
              </p>
            </div>

            {stats.overdueTasks > 0 && (
              <div 
                className="bg-[#2d2d2d] rounded-xl p-6 hover:bg-[#FF1E00] transition-colors duration-200 group cursor-pointer"
                onClick={() => handleCardClick("overdue")}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-red-400 group-hover:text-white transition-colors duration-200">
                    {getStatIcon("overdue")}
                  </div>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30">
                    Overdue
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">
                  {stats.overdueTasks}
                </h3>
                <p className="text-gray-400 group-hover:text-white/80 transition-colors duration-200">
                  Overdue Tasks
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400">No data available</p>
          </div>
        )}

        {localStorage.getItem("shouldRedirectFromHome") === "true" && (
          <div className="text-center">
            <div className="bg-[#2d2d2d] rounded-xl p-8 max-w-md mx-auto">
              <div className="w-12 h-12 border-4 border-[#FF1E00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">Setting up your workspace</h3>
              <p className="text-gray-400 mb-4">
                Taking you to your {role === "team_lead" ? "projects" : "tasks"} dashboard...
              </p>
              <div className="flex items-center justify-center gap-2 text-[#FF1E00]">
                <div className="w-2 h-2 bg-[#FF1E00] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#FF1E00] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-[#FF1E00] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}

        {localStorage.getItem("shouldRedirectFromHome") !== "true" && (
          <div className="space-y-8">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/task/new")}
                className="bg-[#FF1E00] hover:bg-[#FF1E00]/80 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-3 text-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add New Task
              </button>
              
              {(role === "team_lead" || role === "admin") && (
                <button
                  onClick={() => navigate("/projects/new")}
                  className="bg-transparent hover:bg-[#FF1E00] border-2 border-[#FF1E00] text-[#FF1E00] hover:text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-3 text-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Add New Project
                </button>
              )}
            </div>

            {/* Navigation Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate(role === "team_lead" ? "/projects" : "/tasks")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Go to {role === "team_lead" ? "Projects" : "Tasks"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;