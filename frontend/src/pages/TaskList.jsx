import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { Calendar, User, Clock, Edit3, Trash2 } from "lucide-react";
import ClipLoader from "react-spinners/ClipLoader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [showDeactivatedTasks, setShowDeactivatedTasks] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "User";

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = currentTime.toLocaleString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const getStatusColor = (state) => {
    switch (state?.toLowerCase()) {
      case "completed":
        return "text-green-400";
      case "pending":
        return "text-yellow-400";
      case "todo":
        return "text-blue-400";
      case "in-progress":
        return "text-purple-400";
      case "cancelled":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return { text: "No due date", color: "text-gray-400" };
    const due = dayjs(dueDate);
    const today = dayjs();
    const diff = due.diff(today, "day");

    if (diff < 0)
      return { text: `${Math.abs(diff)} days overdue`, color: "text-red-500" };
    if (diff === 0) return { text: "Due today", color: "text-orange-500" };
    if (diff <= 3)
      return { text: `Due in ${diff} days`, color: "text-yellow-500" };
    return { text: due.format("MMM D, YYYY"), color: "text-green-500" };
  };

  const normalizeId = (id) => {
    if (typeof id === "object" && id?.$oid) return id.$oid;
    return id;
  };

  useEffect(() => {
    const fetchTasksAndProjects = async () => {
      try {
        const [taskRes, projectRes] = await Promise.all([
          API.get("/tasks"),
          API.get("/projects"),
        ]);
        
        if (taskRes.data.success && projectRes.data.success) {
          setTasks(taskRes.data.data);
          setProjects(projectRes.data.projects);
        }
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndProjects();
  }, []);

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
    navigate("/task/new");
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/tasks/${id}`);
        setTasks((prev) => prev.filter((t) => t._id !== id));
        alert("Task deleted successfully.");
      } catch {
        alert("Failed to delete task.");
      }
    }
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    navigate(`/task/edit/${id}`);
  };

  const renderTaskCard = (task, isDeactivated = false) => {
    const due = getDueDateStatus(task.dueDate);
    const taskProjectId = normalizeId(task.projectId);
    const project = (projects || []).find(
      (p) => normalizeId(p._id) === taskProjectId
    );
    const projectName = project?.name || "Unknown Project";

    return (
      <div
        key={task._id}
        onClick={() => navigate(`/task/${task._id}`)}
        className={`bg-[#2d2d2d] rounded-xl p-6 flex flex-col justify-between cursor-pointer transition-all min-h-[255px] ${
          isDeactivated
            ? "opacity-70 border-2 border-red-500/30"
            : "hover:bg-[#FF1E00]"
        }`}
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <div></div>
            <span className="text-xs flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isDeactivated ? "bg-red-500" : "bg-green-500"
                }`}
              ></span>
              {isDeactivated ? "Overdue" : "Active"}
            </span>
          </div>
          <div className="mb-4">
            <h2 className="text-[32px] font-bold leading-[86%] mb-2">
              {task.title}
            </h2>
            <p className={`text-sm mt-1 ${isDeactivated ? "text-white/60" : "text-white/80"}`}>
              {task.description}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isDeactivated
                  ? "bg-red-500/20 text-red-300"
                  : "bg-white text-black"
              }`}
            >
              {task.priority?.toUpperCase()}
            </span>
            <div className={isDeactivated ? "text-white/60" : "text-white"}>
              Project:{" "}
              <span className={`font-medium ${isDeactivated ? "text-white/60" : "text-[#11111]"}`}>
                {projectName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto">
          <div className={`flex items-center gap-4 text-sm ${isDeactivated ? "text-white/60" : "text-white"}`}>
            <span className={`font-semibold ${isDeactivated ? "text-red-400" : ""}`}>
              {isDeactivated
                ? `${Math.abs(getDaysLeft(task.dueDate))} Days Overdue`
                : `${getDaysLeft(task.dueDate)} Days Left`}
            </span>
            <span className={isDeactivated ? "text-gray-500" : "text-gray-400"}>
              {task.state}
            </span>
            <span className={`flex items-center gap-1 ${isDeactivated ? "text-gray-400" : "text-gray-300"}`}>
              <svg
                className={`w-4 h-4 ${isDeactivated ? "text-gray-400" : "text-gray-300"}`}
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
            onClick={() => navigate(`/task/${task._id}`)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDeactivated
                ? "bg-white/20 hover:bg-white/30"
                : "bg-white hover:bg-gray-200"
            }`}
          >
            <svg
              className={`w-4 h-4 ${isDeactivated ? "text-white/60" : "text-[#FF1E00]"}`}
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
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191818] text-white">
        <ClipLoader color="#FF1E00" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#191818] text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#191818] text-white px-12 py-4">
      <div className="max-w-[1440px] mx-auto">
        {/* Header with greeting and Add Task button */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-[32px] font-bold">
              {getGreeting()}, <span className="text-[#FF1E00]">{userName}</span>
            </h1>
            <p className="text-white/80 text-sm mt-2">{formattedDate}</p>
          </div>
          
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-400">No tasks found.</p>
            <button
              onClick={() => navigate("/task/new")}
              className="mt-6 bg-[#FF1E00] hover:bg-red-600 text-white px-6 py-3 rounded-xl"
            >
              Create Task
            </button>
          </div>
        ) : (
          <>
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-6">Active Tasks</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeTasks.map((task) => renderTaskCard(task, false))}
                </div>
              </div>
            )}

            {/* No active tasks message */}
            {activeTasks.length === 0 && deactivatedTasks.length > 0 && (
              <div className="text-center py-8">
                <p className="text-lg text-gray-400">No active tasks found.</p>
              </div>
            )}

            {/* Deactivated Tasks Section */}
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
                    {deactivatedTasks.map((task) => renderTaskCard(task, true))}
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

export default TaskList;