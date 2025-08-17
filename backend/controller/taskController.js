import Task from "../models/task_model.js";
import Team from "../models/team_model.js";
import TeamMember from '../models/team_member_model.js';
import Project from "../models/project_model.js";

import mongoose from "mongoose";


export const createTask = async (req, res) => {
  try {
    const { title, description, state, assignedTo, projectId, dueDate, priority } = req.body;

    if (!title || !description || !projectId) {
      return res.status(400).json({ message: "Title, description, and projectId are required" });
    }

const project = await Project.findById(projectId);
if (!project) {
  return res.status(404).json({ message: "Project not found" });
}

const teamId = project.team;


    const userTeamRole = await TeamMember.findOne({
      team: teamId,
      user: req.user.id,
    });

    if (!userTeamRole && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not a member of this team" });
    }
    

    if ((!userTeamRole || userTeamRole.role !== "team_lead") && !req.user.isAdmin)      {
      return res.status(403).json({ message: "Only team leads or admins can create tasks" });
    }

    if (assignedTo && !project.team.equals(teamId)) {
      return res.status(400).json({ message: "Assigned user is not a member of this team" });
    }
    

    const task = new Task({
      title,
      description,
      projectId,
      state: state || "todo",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      assignedBy: req.user.id,
      teamId,
      createdById: req.user.id,
      dueDate: dueDate || null,
    });

    await task.save();
    await Project.findByIdAndUpdate(
      projectId,
      { $push: { tasks: task._id } },
      { new: true }
    );
    
    const taskWithDetails = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("teamId", "name");

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: taskWithDetails,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, state, priority, assignedTo, dueDate, comments } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userTeamRole = await TeamMember.findOne({
      team: task.teamId,
      user: req.user.id,
    });

    if (!req.user.isAdmin && (!userTeamRole || userTeamRole.role !== "team_lead")) {
      if (comments) {
        const updatedComments = [
          ...task.comments,
          {
            text: comments,
            author: req.user.id,
            createdAt: new Date(),
          },
        ];

        task.comments = updatedComments;
        const updatedTask = await task.save();

        const populatedTask = await Task.findById(updatedTask._id)
          .populate('assignedTo', 'name email')
          .populate('createdById', 'name email')
          .populate('assignedBy', 'name email')
          .populate('teamId', 'name')
          .populate('comments.author', 'name email');

        return res.status(200).json({
          success: true,
          message: "Comment added successfully",
          data: populatedTask,
        });
      }

      return res.status(403).json({ message: "Only team leads or admins can update tasks" });
    }

    const updatedComments = [...task.comments];
    if (comments) {
      updatedComments.push({
        text: comments,
        author: req.user.id,
        createdAt: new Date(),
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        title: title ?? task.title,
        description: description ?? task.description,
        state: state ?? task.state,
        priority: priority ?? task.priority,
        assignedTo: assignedTo ?? task.assignedTo,
        dueDate: dueDate ?? task.dueDate,
        comments: updatedComments,
      },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdById', 'name email')
      .populate('assignedBy', 'name email')
      .populate('teamId', 'name')
      .populate('comments.author', 'name email');

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    const userTeamRole = await TeamMember.findOne({
      team: task.teamId,
      user: req.user.id,
    });

    if (!req.user.isAdmin && (!userTeamRole || userTeamRole.role !== "team_lead")) {
      return res.status(403).json({ message: "Only team leads or admins can delete tasks" });
    }
    task.isActive = false;
    await task.save();
    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id).populate('assignedTo', 'name email')
  .populate('createdById', 'name role');
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error("Error getting task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email');
    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
