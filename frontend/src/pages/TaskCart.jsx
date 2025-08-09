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

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const token = localStorage.getItem("token");
        // Use taskId instead of id
        const res = await API.get(`/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTask(res.data.data);
      } catch (err) {
        setError("Unable to fetch task.");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]); // Changed dependency from id to taskId

  const updateField = async (field, value) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.put(
        `/tasks/${taskId}`, // Changed from id to taskId
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask(res.data.data);
    } catch (err) {
      alert("Failed to update " + field);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    setAddingComment(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, { // Changed from task._id to taskId
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          comments: commentText,
        }),
      });

      const data = await response.json();
      setTask(data.data);
      setCommentText("");
    } catch (error) {
      alert(`Failed to add comment: ${error.message}`);
    } finally {
      setAddingComment(false);
    }
  };

  if (loading) return <div className="text-white text-center p-10">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
  if (!task) return <div className="text-gray-400 text-center p-10">Task not found</div>;

  return (
    <div className="bg-[#191818] min-h-screen text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <Breadcrumb />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#2d2d2d] p-6 rounded-xl">
              <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
              <p className="text-gray-400 mb-4">{task.description}</p>
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
                    className="w-full bg-[#1f1f1f] text-white border border-gray-600 p-3 rounded-lg focus:outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={addingComment}
                    className="bg-red-500 mt-2 px-4 py-2 rounded text-white hover:bg-red-600"
                  >
                    Add comments
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#2d2d2d] p-6 rounded-xl space-y-4">
            <h2 className="text-lg font-bold text-white">Properties</h2>
            <p><span className="text-gray-400">Status:</span> {task.state}</p>
            <p><span className="text-gray-400">Priority:</span> {task.priority}</p>
            <p><span className="text-gray-400">Created by:</span> {task.createdById?.name || "Unknown"}</p>
            <p><span className="text-gray-400">Assign to:</span> {task.assignedTo?.name || "Unassigned"}</p>
            <p><span className="text-gray-400">Start date:</span> {dayjs(task.createdAt).format("MMM DD, YYYY")}</p>
            <p><span className="text-gray-400">Due date:</span> {dayjs(task.dueDate).format("MMM DD, YYYY")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCart;