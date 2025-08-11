import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Calendar, Clock, User, Send } from "lucide-react";
import Breadcrumb from "../components/Breadcrumb";

dayjs.extend(relativeTime);

const TaskCart = () => {
  // Updated to get both projectId and taskId from URL
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  // Inline editing states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempDescription, setTempDescription] = useState("");
  const [tempStatus, setTempStatus] = useState("");

  const statusOptions = ["todo", "in-progress", "completed", "on-hold"];

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        // Use taskId instead of id
        const res = await API.get(`/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(res.data.data);
        setTempTitle(res.data.data.title);
        setTempDescription(res.data.data.description);
        setTempStatus(res.data.data.state);
      } catch (err) {
        setError("Unable to fetch task.");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const updateField = async (field, value) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(
        `/tasks/${taskId}`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(res.data.data);
      return true;
    } catch (err) {
      alert("Failed to update " + field);
      return false;
    }
  };

  const handleTitleEdit = () => {
    setEditingTitle(true);
    setTempTitle(task.title);
  };

  const handleTitleSave = async () => {
    if (tempTitle.trim() && tempTitle !== task.title) {
      const success = await updateField("title", tempTitle.trim());
      if (success) {
        setEditingTitle(false);
      }
    } else {
      setEditingTitle(false);
      setTempTitle(task.title);
    }
  };

  const handleTitleCancel = () => {
    setEditingTitle(false);
    setTempTitle(task.title);
  };

  const handleDescriptionEdit = () => {
    setEditingDescription(true);
    setTempDescription(task.description);
  };

  const handleDescriptionSave = async () => {
    if (tempDescription.trim() !== task.description) {
      const success = await updateField("description", tempDescription.trim());
      if (success) {
        setEditingDescription(false);
      }
    } else {
      setEditingDescription(false);
      setTempDescription(task.description);
    }
  };

  const handleDescriptionCancel = () => {
    setEditingDescription(false);
    setTempDescription(task.description);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus !== task.state) {
      await updateField("state", newStatus);
    }
    setEditingStatus(false);
  };

  const handleKeyPress = (e, saveFunction, cancelFunction) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveFunction();
    } else if (e.key === "Escape") {
      cancelFunction();
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    setAddingComment(true);
    try {
      const response = await API.put(`/tasks/${taskId}`, {
        comments: commentText,
      });
      
      setTask(response.data.data);
      setCommentText("");
      
    } catch (error) {
      alert(`Failed to add comment: ${error.message}`);
    } finally {
      setAddingComment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "text-gray-400";
      case "in-progress":
        return "text-blue-400";
      case "completed":
        return "text-green-400";
      case "on-hold":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBackground = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "bg-gray-500/20 border-gray-500/30";
      case "in-progress":
        return "bg-blue-500/20 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 border-green-500/30";
      case "on-hold":
        return "bg-yellow-500/20 border-yellow-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/30";
    }
  };

  if (loading) return <div className="text-white text-center p-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
  if (!task) return <div className="text-gray-400 text-center p-10">Task not found</div>;

  return (
    <div className="bg-[#191818] min-h-screen text-white px-6 py-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Breadcrumb />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#2d2d2d] p-6 rounded-xl">
              {/* Editable Title */}
              <div className="mb-4">
                {editingTitle ? (
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => handleKeyPress(e, handleTitleSave, handleTitleCancel)}
                    className="text-2xl font-bold bg-[#191818] border border-[#FF1E00] rounded-lg px-3 py-2 w-full text-white focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h1 
                    className="text-2xl font-bold cursor-pointer hover:bg-[#191818]/50 rounded-lg px-3 py-2 transition-colors duration-200"
                    onClick={handleTitleEdit}
                    title="Click to edit title"
                  >
                    {task.title}
                  </h1>
                )}
              </div>

              {/* Editable Description */}
              <div className="mb-4">
                {editingDescription ? (
                  <textarea
                    value={tempDescription}
                    onChange={(e) => setTempDescription(e.target.value)}
                    onBlur={handleDescriptionSave}
                    onKeyDown={(e) => handleKeyPress(e, handleDescriptionSave, handleDescriptionCancel)}
                    className="text-gray-400 bg-[#191818] border border-[#FF1E00] rounded-lg px-3 py-2 w-full resize-none focus:outline-none"
                    rows="3"
                    autoFocus
                  />
                ) : (
                  <p 
                    className="text-gray-400 cursor-pointer hover:bg-[#191818]/50 rounded-lg px-3 py-2 transition-colors duration-200 min-h-[24px]"
                    onClick={handleDescriptionEdit}
                    title="Click to edit description"
                  >
                    {task.description || "Click to add description..."}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-2">
                Last edited by {task.createdById?.name} {dayjs(task.updatedAt).fromNow()}
              </p>

              <div className="mt-10">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                <div className="space-y-3">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment, index) => (
                      <div key={index} className="bg-[#1f1f1f] rounded-lg p-4">
                        <p className="font-semibold text-white">
                          {comment.author?.name || "User"} 
                          <span className="text-gray-500 text-xs"> {dayjs(comment.createdAt).fromNow()}</span>
                        </p>
                        <p className="text-gray-300 mt-1">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No comments yet.</p>
                  )}
                </div>
                <div className="mt-4">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    placeholder="Add a comment..."
                    className="w-full bg-[#1f1f1f] text-white border border-gray-600 p-3 rounded-lg focus:outline-none focus:border-[#FF1E00] transition-colors duration-200"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={addingComment}
                    className="bg-[#FF1E00] hover:bg-[#FF1E00]/80 mt-2 px-4 py-2 rounded text-white transition-colors duration-200 disabled:opacity-50"
                  >
                    {addingComment ? "Adding..." : "Add Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#2d2d2d] p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white">Properties</h2>
            
            {/* Editable Status */}
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Status:</span>
              {editingStatus ? (
                <select
                  value={tempStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-[#191818] border border-[#FF1E00] rounded-lg px-2 py-1 text-white focus:outline-none"
                  autoFocus
                  onBlur={() => setEditingStatus(false)}
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#191818]">
                      {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              ) : (
                <span 
                  className={`${getStatusColor(task.state)} cursor-pointer px-3 py-1 rounded-lg border ${getStatusBackground(task.state)} hover:bg-opacity-30 transition-colors duration-200 capitalize`}
                  onClick={() => {
                    setEditingStatus(true);
                    setTempStatus(task.state);
                  }}
                  title="Click to change status"
                >
                  {task.state?.replace('-', ' ')}
                </span>
              )}
            </div>

            <p><span className="text-gray-400">Priority:</span> <span className="capitalize">{task.priority}</span></p>
            <p><span className="text-gray-400">Created by:</span> {task.createdById?.name || "Unknown"}</p>
            <p><span className="text-gray-400">Assigned to:</span> {task.assignedTo?.name || "Unassigned"}</p>
            <p><span className="text-gray-400">Start date:</span> {dayjs(task.createdAt).format("MMM DD, YYYY")}</p>
            <p><span className="text-gray-400">Due date:</span> {dayjs(task.dueDate).format("MMM DD, YYYY")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCart;