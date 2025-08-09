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
         console.log("🔥 Task Response:", taskRes.data); 
    console.log("🔥 Project Response:", projectRes.data); 
        if (taskRes.data.success) {
          setTasks(taskRes.data.data);
        }

        if (projectRes.data.success) {
          setProjects(projectRes.data.projects); 
        }
      } catch (err) {
        setError("Error fetching tasks or projects.");
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
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-[32px] font-bold">
            {getGreeting()}, <span className="text-[#FF1E00]">{userName}</span>
          </h1>
          <p className="text-white/80 text-sm mt-2">{formattedDate}</p>
        </div>

        {/* Tasks */}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map((task) => {
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
                  className="bg-[#2d2d2d] rounded-xl p-6 flex flex-col justify-between hover:bg-[#FF1E00] cursor-pointer transition-all"
                >
                  <div>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div></div>
                        <span className="text-xs text-white/70 flex items-center gap-1">
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
                        <div>
                          Project:{" "}
                          <span className="text-[#11111] font-medium">
                            {projectName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-auto">
                    {/* Left Side */}
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
                      onClick={() => navigate(`/task/${task._id}`)}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
