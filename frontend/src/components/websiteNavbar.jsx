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
  CheckSquare,
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
   

      let projectId = null;

      if (
        pathParts[0] === "projects" &&
        pathParts[1] &&
        pathParts[1] !== "new"
      ) {
        projectId = pathParts[1];
      }
      else if (pathParts.length === 2 && pathParts[0] && pathParts[1]) {
        projectId = pathParts[0];
      }

      if (projectId) {
        setLoading(true);

        try {
          const response = await API.get(`/projects/${projectId}`);
     

          if (response.data.success && response.data.project) {
            setProject(response.data.project);
            
          } else {
            
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
  
  // Check if user is ONLY a regular team member (not admin, not team leader)
  const isOnlyTeamMember = !user?.isAdmin && primaryTeam?.role && primaryTeam.role !== 'team_lead';
  
  // Determine what to show in navigation based on user role
  const getProjectsNavigation = () => {
    // Only regular team members see "Tasks", everyone else sees "Projects"
    if (isOnlyTeamMember) {
      return {
        label: "Tasks",
        icon: CheckSquare,
        path: "/tasks"
      };
    } else {
      return {
        label: "Projects", 
        icon: FolderOpen,
        path: "/projects"
      };
    }
  };

  const getTeamsNavigation = () => {
    if (user?.isAdmin) {
      return {
        label: "Teams",
        icon: Users,
        path: "/teams"
      };
    } else if (primaryTeam?.teamId) {
      return {
        label: "Team",
        icon: Users,
        path: `/teams/${primaryTeam.teamId}`
      };
    } else {
      return {
        label: "Team",
        icon: Users,
        path: "/team"
      };
    }
  };

  const projectsNav = getProjectsNavigation();
  const teamsNav = getTeamsNavigation();

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
              onClick={() => navigate(projectsNav.path)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <projectsNav.icon className="w-4 h-4" />
              <span>{projectsNav.label}</span>
            </button>

            <button
              onClick={() => navigate(teamsNav.path)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <teamsNav.icon className="w-4 h-4" />
              <span>{teamsNav.label}</span>
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