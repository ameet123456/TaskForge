import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FolderOpen,
  Users,
  User,
  ChevronDown,
  Settings,
  LogOut,
} from "lucide-react";
import API from "../api";

const WebsiteNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProject = async () => {
      const pathParts = location.pathname.split("/").filter(Boolean);
      console.log("Navbar - Current path parts:", pathParts);

      let projectId = null;

      if (
        pathParts[0] === "projects" &&
        pathParts[1] &&
        pathParts[1] !== "new"
      ) {
        projectId = pathParts[1];
        console.log("Navbar - Project page detected, projectId:", projectId);
      }
      else if (pathParts.length === 2 && pathParts[0] && pathParts[1]) {
        projectId = pathParts[0];
        console.log("Navbar - Task page detected, projectId:", projectId);
      }

      if (projectId) {
        setLoading(true);
        console.log("Navbar - Fetching project with ID:", projectId);

        try {
          const response = await API.get(`/projects/${projectId}`);
          console.log("Navbar Project API Response:", response.data);
          console.log("Navbar - Success:", response.data.success);
          console.log("Navbar - Project:", response.data.project);

          if (response.data.success && response.data.project) {
            setProject(response.data.project);
            console.log(
              "Navbar - Project set successfully:",
              response.data.project.name
            );
          } else {
            console.log(
              "Navbar - Failed to set project: success or project missing"
            );
            setProject(null);
          }
        } catch (err) {
          console.error("Error fetching project in navbar:", err);
          setProject(null);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("Navbar - No projectId found, clearing project");
        setProject(null);
      }
    };

    fetchProject();
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isProjectPage =
    location.pathname.startsWith("/projects/") &&
    location.pathname.split("/").length === 3;
  const isTaskPage =
    location.pathname.split("/").filter(Boolean).length === 2 &&
    !location.pathname.startsWith("/projects");

  const shouldShowProject = isProjectPage || isTaskPage;

  const primaryTeam = user?.teams?.[0];

  return (
    <nav className="bg-[#191818] border-b border-gray-700 px-6 py-4">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div
            className="text-white font-bold text-xl cursor-pointer hover:text-red-500 transition-colors"
            onClick={() => navigate("/home")}
          >
            TaskFlow
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => navigate("/projects")}
              className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => navigate("/teams")}
              className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Teams</span>
            </button>
          </div>
        </div>

        {shouldShowProject && (
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="bg-[#2d2d2d] px-4 py-2 rounded-lg border border-gray-600">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-red-500" />
                <span className="text-white font-medium">
                  {loading
                    ? "Loading..."
                    : project?.name || "Project not found"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          {primaryTeam && (
            <div className="hidden sm:flex items-center space-x-2 text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">{primaryTeam.teamName}</span>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {user?.name || "User"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {user?.isAdmin
                      ? "Admin"
                      : primaryTeam?.role?.replace("_", " ") || "Member"}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#2d2d2d] border border-gray-600 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p
                        className="text-white font-medium cursor-pointer"
                        onClick={() => navigate("/user/profile")}
                      >
                        {user?.name}
                      </p>
                      <p className="text-gray-400 text-sm">{user?.email}</p>
                      {primaryTeam && (
                        <p className="text-gray-500 text-xs mt-1">
                          {primaryTeam.teamName} •{" "}
                          {primaryTeam.role?.replace("_", " ")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/setting");
                    }}
                    className="w-full flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center space-x-3 text-red-400 hover:text-red-300 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {shouldShowProject && (
        <div className="lg:hidden mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-4 h-4 text-red-500" />
            <span className="text-white font-medium">
              {loading ? "Loading..." : project?.name || "Project not found"}
            </span>
          </div>
        </div>
      )}
    </nav>
  );
};

export default WebsiteNavbar;
